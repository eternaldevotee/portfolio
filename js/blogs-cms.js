(function (global) {
  "use strict";

  var SUPABASE_URL = "https://vzyomxngqesrpyoqmhec.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_XQx0VnzlHUeDZcXMcBjg7w_RXRMCz5V";
  var POSTS_TABLE = "blog_posts";
  var BUCKET = "blog-images";
  var OWNER_EMAIL = "shubhamofficial0910@gmail.com";
  var OWNER_KEY = "portfolio-owner-confirmed";
  var OWNER_COOKIE = "portfolio_owner_confirmed";
  var UPDATE_EVENT = "blogcms:updated";
  var AUTH_EVENT = "blogcms:auth-changed";

  var client = null;
  var authSession = null;
  var serverBlogs = [];
  var ready = false;
  var readyPromise = null;

  function hasClient() {
    return !!global.supabase && typeof global.supabase.createClient === "function";
  }

  function ensureClient() {
    if (client) return client;
    if (!hasClient()) return null;
    client = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    return client;
  }

  function emit(name, detail) {
    if (typeof global.dispatchEvent !== "function") return;
    global.dispatchEvent(new CustomEvent(name, { detail: detail || null }));
  }

  function getCookie(name) {
    if (typeof document === "undefined" || !document.cookie) return "";
    var parts = document.cookie.split("; ");
    for (var i = 0; i < parts.length; i += 1) {
      var pair = parts[i].split("=");
      if (pair[0] === name) return decodeURIComponent(pair.slice(1).join("="));
    }
    return "";
  }

  function setCookie(name, value, days) {
    if (typeof document === "undefined") return;
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=" + maxAge + "; samesite=lax";
  }

  function clearCookie(name) {
    if (typeof document === "undefined") return;
    document.cookie = name + "=; path=/; max-age=0; samesite=lax";
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function sessionUserEmail(session) {
    return normalizeEmail(session && session.user ? session.user.email : "");
  }

  function isSessionOwner(session) {
    return sessionUserEmail(session) === normalizeEmail(OWNER_EMAIL);
  }

  function hasOwnerMarker() {
    var local = "";
    var cookie = "";
    try {
      local = localStorage.getItem(OWNER_KEY) || "";
    } catch (err) {
      local = "";
    }
    try {
      cookie = getCookie(OWNER_COOKIE);
    } catch (err2) {
      cookie = "";
    }
    return local === "1" || cookie === "1";
  }

  function setOwnerMarker() {
    try {
      localStorage.setItem(OWNER_KEY, "1");
    } catch (err) {}
    setCookie(OWNER_COOKIE, "1", 30);
  }

  function clearOwnerMarker() {
    try {
      localStorage.removeItem(OWNER_KEY);
    } catch (err) {}
    clearCookie(OWNER_COOKIE);
  }

  function syncOwnerMarker() {
    if (isSessionOwner(authSession)) {
      setOwnerMarker();
    } else {
      clearOwnerMarker();
    }
  }

  function parseTags(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(function (item) { return String(item).trim(); });
    if (!value) return [];
    return String(value)
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  function safeJson(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (err) {
      return fallback;
    }
  }

  function stripHtml(html) {
    return String(html || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function makeExcerpt(content) {
    var text = stripHtml(content);
    if (!text) return "";
    return text.length > 160 ? text.slice(0, 157) + "..." : text;
  }

  function todayIso() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function generateId(title) {
    var base = slugify(title || "blog-post");
    var stamp = Date.now().toString(36);
    return base ? base + "-" + stamp : "blog-post-" + stamp;
  }

  function cloneSeed(blog) {
    return {
      id: String(blog.id || "").trim(),
      title: String(blog.title || "").trim(),
      date: String(blog.date || "").trim(),
      excerpt: String(blog.excerpt || "").trim(),
      content: String(blog.content || ""),
      tags: parseTags(blog.tags),
      image: String(blog.image || blog.cover_image_url || "").trim(),
      deleted: false
    };
  }

  function cloneRemote(row) {
    return {
      id: String(row.id || "").trim(),
      title: String(row.title || "").trim(),
      date: String(row.date || "").trim(),
      excerpt: String(row.excerpt || "").trim(),
      content: String(row.content_html || ""),
      tags: parseTags(row.tags),
      image: String(row.cover_image_url || "").trim(),
      deleted: !!row.is_deleted
    };
  }

  function seedBlogs() {
    return Array.isArray(global.BLOGS) ? global.BLOGS.map(cloneSeed) : [];
  }

  function normalizeBlog(blog) {
    var item = {
      id: String(blog && blog.id ? blog.id : "").trim(),
      title: String(blog && blog.title ? blog.title : "").trim(),
      date: String(blog && blog.date ? blog.date : "").trim(),
      excerpt: String(blog && blog.excerpt ? blog.excerpt : "").trim(),
      content: String(blog && blog.content ? blog.content : ""),
      tags: parseTags(blog && blog.tags ? blog.tags : []),
      image: String(blog && (blog.image || blog.cover_image_url) ? (blog.image || blog.cover_image_url) : "").trim()
    };

    if (!item.title) throw new Error("Title is required.");
    if (!item.id) item.id = generateId(item.title);
    if (!item.date) item.date = todayIso();
    if (!item.excerpt) item.excerpt = makeExcerpt(item.content);
    return item;
  }

  function mergeBlogs() {
    var blogs = {};
    var deletedIds = {};

    seedBlogs().forEach(function (item) {
      blogs[item.id] = item;
    });

    serverBlogs.forEach(function (row) {
      if (!row.id) return;
      if (row.deleted) {
        deletedIds[row.id] = true;
        delete blogs[row.id];
        return;
      }
      blogs[row.id] = row;
      delete deletedIds[row.id];
    });

    return Object.keys(blogs)
      .filter(function (id) {
        return !deletedIds[id];
      })
      .map(function (id) {
        return blogs[id];
      })
      .sort(function (a, b) {
        var dateDiff = new Date(b.date || 0) - new Date(a.date || 0);
        if (dateDiff !== 0) return dateDiff;
        return String(a.title || "").localeCompare(String(b.title || ""));
      });
  }

  function getBlogs() {
    return mergeBlogs().map(function (item) {
      return {
        id: item.id,
        title: item.title,
        date: item.date,
        excerpt: item.excerpt,
        content: item.content,
        tags: Array.isArray(item.tags) ? item.tags.slice() : [],
        image: item.image || ""
      };
    });
  }

  function getBlog(id) {
    var blogId = String(id || "").trim();
    var blogs = getBlogs();
    for (var i = 0; i < blogs.length; i += 1) {
      if (blogs[i].id === blogId) return blogs[i];
    }
    return null;
  }

  async function loadBlogs() {
    var c = ensureClient();
    if (!c) return getBlogs();
    var response = await c
      .from(POSTS_TABLE)
      .select("id,title,date,excerpt,tags,content_html,cover_image_url,is_deleted,created_at,updated_at")
      .order("date", { ascending: false });
    if (response.error) throw response.error;
    serverBlogs = Array.isArray(response.data) ? response.data.map(cloneRemote) : [];
    ready = true;
    emit(UPDATE_EVENT, { blogs: getBlogs() });
    return getBlogs();
  }

  async function refresh() {
    await loadBlogs();
    return getBlogs();
  }

  async function saveBlog(blog) {
    var c = ensureClient();
    if (!c) throw new Error("Supabase client is not available.");
    var item = normalizeBlog(blog);
    var payload = {
      id: item.id,
      title: item.title,
      date: item.date,
      excerpt: item.excerpt,
      tags: item.tags,
      content_html: item.content,
      cover_image_url: item.image || null,
      is_deleted: false,
      updated_at: new Date().toISOString()
    };
    var response = await c.from(POSTS_TABLE).upsert(payload, { onConflict: "id" }).select().single();
    if (response.error) throw response.error;
    await refresh();
    return getBlog(item.id) || normalizeBlog(item);
  }

  async function deleteBlog(id) {
    var c = ensureClient();
    if (!c) throw new Error("Supabase client is not available.");
    var blogId = String(id || "").trim();
    if (!blogId) return;
    var response = await c.from(POSTS_TABLE).upsert({
      id: blogId,
      title: blogId,
      date: todayIso(),
      excerpt: "",
      tags: [],
      content_html: "",
      cover_image_url: null,
      is_deleted: true,
      updated_at: new Date().toISOString()
    }, { onConflict: "id" }).select().single();
    if (response.error) throw response.error;
    await refresh();
  }

  async function uploadImage(file, folder) {
    var c = ensureClient();
    if (!c) throw new Error("Supabase client is not available.");
    if (!file) throw new Error("Choose an image first.");
    var folderName = slugify(folder || "blog-images") || "blog-images";
    var baseName = slugify(file.name || "image") || "image";
    var ext = file.name && file.name.indexOf(".") !== -1 ? file.name.split(".").pop() : "png";
    var filePath = folderName + "/" + Date.now().toString(36) + "-" + baseName + "." + ext;
    var upload = await c.storage.from(BUCKET).upload(filePath, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream"
    });
    if (upload.error) throw upload.error;
    var publicUrl = c.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
    return {
      path: filePath,
      url: publicUrl
    };
  }

  function isAuthed() {
    return !!authSession;
  }

  function isOwnerConfirmed() {
    return isSessionOwner(authSession) && hasOwnerMarker();
  }

  async function login(email, password) {
    var c = ensureClient();
    if (!c) throw new Error("Supabase client is not available.");
    var response = await c.auth.signInWithPassword({
      email: String(email || "").trim(),
      password: String(password || "")
    });
    if (response.error) throw response.error;
    authSession = response.data && response.data.session ? response.data.session : authSession;
    syncOwnerMarker();
    if (!isOwnerConfirmed()) {
      await c.auth.signOut();
      authSession = null;
      clearOwnerMarker();
      emit(AUTH_EVENT, { session: null, isOwner: false });
      throw new Error("This account is not configured as the site owner.");
    }
    emit(AUTH_EVENT, { session: authSession, isOwner: true });
    return response.data;
  }

  async function logout() {
    var c = ensureClient();
    if (!c) return;
    await c.auth.signOut();
    authSession = null;
    clearOwnerMarker();
    emit(AUTH_EVENT, { session: null, isOwner: false });
  }

  async function loadAuth() {
    var c = ensureClient();
    if (!c) return null;
    var response = await c.auth.getSession();
    authSession = response.data ? response.data.session : null;
    syncOwnerMarker();
    emit(AUTH_EVENT, { session: authSession, isOwner: isOwnerConfirmed() });
    c.auth.onAuthStateChange(function (_event, session) {
      authSession = session || null;
      syncOwnerMarker();
      emit(AUTH_EVENT, { session: authSession, isOwner: isOwnerConfirmed() });
    });
    return authSession;
  }

  function readyState() {
    return ready;
  }

  function readyFn() {
    return readyPromise || Promise.resolve(getBlogs());
  }

  function onChange(handler) {
    global.addEventListener(UPDATE_EVENT, handler);
    return function () {
      global.removeEventListener(UPDATE_EVENT, handler);
    };
  }

  function onAuthChange(handler) {
    global.addEventListener(AUTH_EVENT, handler);
    return function () {
      global.removeEventListener(AUTH_EVENT, handler);
    };
  }

  function initialize() {
    readyPromise = Promise.all([loadAuth(), loadBlogs()])
      .catch(function (error) {
        console.error("Blog CMS failed to initialize.", error);
        ready = true;
        emit(UPDATE_EVENT, { blogs: getBlogs() });
        return getBlogs();
      })
      .then(function () {
        ready = true;
        return getBlogs();
      });
    return readyPromise;
  }

  global.BlogCMS = {
    getBlogs: getBlogs,
    getBlog: getBlog,
    saveBlog: saveBlog,
    deleteBlog: deleteBlog,
    uploadImage: uploadImage,
    login: login,
    logout: logout,
    isAuthed: isAuthed,
    isOwnerConfirmed: isOwnerConfirmed,
    getClient: ensureClient,
    getAccessToken: function () { return authSession && authSession.access_token ? authSession.access_token : ""; },
    getOwnerEmail: function () { return OWNER_EMAIL; },
    getSessionUserEmail: function () { return sessionUserEmail(authSession); },
    isReady: readyState,
    ready: readyFn,
    loadBlogs: refresh,
    onChange: onChange,
    onAuthChange: onAuthChange,
    todayIso: todayIso,
    generateId: generateId,
    makeExcerpt: makeExcerpt,
    parseTags: parseTags,
    slugify: slugify
  };

  initialize();
})(typeof window !== "undefined" ? window : this);
