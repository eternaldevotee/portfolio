(function () {
  "use strict";

  var editorMode = "visual";
  var DRAFT_KEY = "portfolio-admin-blog-draft";
  var screenState = "";
  var draftListenersBound = false;

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function readDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {}
  }

  function persistDraft() {
    var form = getForm();
    if (!form) return;
    if (editorMode === "visual") {
      syncVisualToHtml();
    }
    var payload = {
      id: String(form.elements.id.value || "").trim(),
      title: String(form.elements.title.value || "").trim(),
      date: String(form.elements.date.value || "").trim(),
      excerpt: String(form.elements.excerpt.value || "").trim(),
      tags: String(form.elements.tags.value || "").trim(),
      content: String(form.elements.content.value || ""),
      image: String(form.elements.image_url.value || "").trim(),
      editorMode: editorMode,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (err) {}
  }

  function setStatus(text, type) {
    var box = $("admin-status");
    if (!box) return;
    box.className = "admin-status" + (type ? " is-" + type : "");
    box.textContent = text || "";
  }

  function parseTags(text) {
    return String(text || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function formatTags(tags) {
    return Array.isArray(tags) ? tags.join(", ") : "";
  }

  function getForm() {
    return $("admin-blog-form");
  }

  function getVisualEditor() {
    return $("admin-visual-editor");
  }

  function getHtmlEditor() {
    var form = getForm();
    return form ? form.elements.content : null;
  }

  function syncVisualToHtml() {
    var visual = getVisualEditor();
    var html = getHtmlEditor();
    if (!visual || !html) return;
    html.value = visual.innerHTML;
  }

  function syncHtmlToVisual() {
    var visual = getVisualEditor();
    var html = getHtmlEditor();
    if (!visual || !html) return;
    visual.innerHTML = html.value || "<p><br /></p>";
    normalizeVisualImages();
  }

  function normalizeVisualImages() {
    var visual = getVisualEditor();
    if (!visual) return;
    Array.prototype.slice.call(visual.querySelectorAll("img")).forEach(function (img) {
      if (img.closest(".image-resize-box")) return;
      var holder = document.createElement("span");
      holder.className = "image-resize-box";
      holder.setAttribute("contenteditable", "false");
      holder.style.width = "420px";
      img.parentNode.insertBefore(holder, img);
      holder.appendChild(img);
    });
  }

  function setEditorMode(mode) {
    editorMode = mode === "html" ? "html" : "visual";
    var visualWrap = $("admin-visual-wrap");
    var htmlWrap = $("admin-html-wrap");
    var visualBtn = $("editor-mode-visual");
    var htmlBtn = $("editor-mode-html");

    if (editorMode === "visual") {
      syncHtmlToVisual();
      if (visualWrap) visualWrap.style.display = "";
      if (htmlWrap) htmlWrap.style.display = "none";
      if (visualBtn) visualBtn.classList.add("active");
      if (htmlBtn) htmlBtn.classList.remove("active");
    } else {
      syncVisualToHtml();
      if (visualWrap) visualWrap.style.display = "none";
      if (htmlWrap) htmlWrap.style.display = "";
      if (visualBtn) visualBtn.classList.remove("active");
      if (htmlBtn) htmlBtn.classList.add("active");
    }
  }

  function currentFormData() {
    var form = getForm();
    if (!form) return null;
    if (editorMode === "visual") {
      syncVisualToHtml();
    }
    return {
      id: String(form.elements.id.value || "").trim(),
      title: String(form.elements.title.value || "").trim(),
      date: String(form.elements.date.value || "").trim(),
      excerpt: String(form.elements.excerpt.value || "").trim(),
      tags: parseTags(form.elements.tags.value),
      content: String(form.elements.content.value || ""),
      imageUrl: String(form.elements.image_url.value || "").trim(),
      imageFile: form.elements.image_file && form.elements.image_file.files ? form.elements.image_file.files[0] : null
    };
  }

  function setFormData(blog) {
    var form = getForm();
    if (!form) return;
    form.elements.id.value = blog && blog.id ? blog.id : "";
    form.elements.title.value = blog && blog.title ? blog.title : "";
    form.elements.date.value = blog && blog.date ? blog.date : BlogCMS.todayIso();
    form.elements.excerpt.value = blog && blog.excerpt ? blog.excerpt : "";
    form.elements.tags.value = blog && blog.tags ? formatTags(blog.tags) : "";
    form.elements.content.value = blog && blog.content ? blog.content : "";
    form.elements.image_url.value = blog && blog.image ? blog.image : "";
    if (form.elements.image_file) form.elements.image_file.value = "";
    syncHtmlToVisual();
    updatePreview();
  }

  function runVisualCommand(cmd, value) {
    if (editorMode !== "visual") {
      setStatus("Switch to Visual mode to use formatting tools.", "error");
      return;
    }
    var visual = getVisualEditor();
    if (!visual) return;
    visual.focus();
    document.execCommand(cmd, false, value || null);
    syncVisualToHtml();
    updatePreview();
    persistDraft();
  }

  function makeResizableImageHtml(url, altText) {
    return (
      '<figure class="blog-image">' +
      '<span class="image-resize-box" contenteditable="false" style="width: 420px;">' +
      '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(altText || "Blog image") + '" />' +
      '</span>' +
      '</figure>'
    );
  }

  function renderLogin() {
    var top = $("top");
    if (!top) return;
    top.innerHTML =
      '<section class="admin-page">' +
      '<div class="table-wrap"><table class="old-table"><tr><td>' +
      '<div class="card tile-card reveal" data-reveal>' +
      '<div class="tile-card__inner admin-login-card">' +
      '<h1 class="section-title">Secret Blog Console</h1>' +
      '<p><span class="admin-owner-badge" title="Owner-only admin area">Owner Zone</span></p>' +
      '<p class="subtle">Login with your Supabase Auth email and password to create and edit blogs.</p>' +
      '<form id="admin-login-form" class="admin-login-form">' +
      '<label class="contact-field"><span>Email</span><input type="email" name="email" autocomplete="username" required /></label>' +
      '<label class="contact-field"><span>Password</span><input type="password" name="password" autocomplete="current-password" required /></label>' +
      '<div class="comments-row"><button type="submit" class="btn">Login</button></div>' +
      '<div id="admin-login-status" class="admin-status" aria-live="polite"></div>' +
      '</form>' +
      '<p class="comments-note">Use owner account: <strong>' + escapeHtml(BlogCMS.getOwnerEmail()) + '</strong></p>' +
      '<p class="comments-note">Current session email: <strong>' + escapeHtml(BlogCMS.getSessionUserEmail() || "not signed in") + '</strong></p>' +
      '<p class="comments-note">After successful owner login, admin confirmation is stored in local storage + cookie for this browser.</p>' +
      '</div></div></td></tr></table></div>' +
      '</section>';

    var form = $("admin-login-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var status = $("admin-login-status");
        if (status) {
          status.className = "admin-status";
          status.textContent = "Logging in...";
        }
        BlogCMS.login(form.email.value, form.password.value)
          .then(function () {
            renderDashboard();
          })
          .catch(function (error) {
            if (status) {
              status.className = "admin-status is-error";
              status.textContent = error && error.message ? error.message : "Login failed.";
            }
          });
      });
    }
  }

  function blogRow(blog, kind) {
    return (
      '<tr>' +
      '<td><strong>' + escapeHtml(blog.title) + '</strong><br /><span class="subtle">' + escapeHtml(blog.id) + '</span></td>' +
      '<td>' + escapeHtml(blog.date || "") + '</td>' +
      '<td>' + escapeHtml(kind) + '</td>' +
      '<td>' + escapeHtml((blog.tags || []).join(", ")) + '</td>' +
      '<td class="admin-actions-cell">' +
      '<button type="button" class="btn btn-ghost admin-edit" data-id="' + escapeHtml(blog.id) + '">Edit</button>' +
      '<button type="button" class="btn btn-ghost admin-clone" data-id="' + escapeHtml(blog.id) + '">Clone</button>' +
      '<button type="button" class="btn btn-ghost admin-delete" data-id="' + escapeHtml(blog.id) + '">Delete</button>' +
      '</td>' +
      '</tr>'
    );
  }

  function renderDashboard() {
    var top = $("top");
    if (!top) return;
    var blogs = BlogCMS.getBlogs();
    var seedIds = (window.BLOGS || []).map(function (item) {
      return item.id;
    });

    top.innerHTML =
      '<section class="admin-page">' +
      '<div class="table-wrap"><table class="old-table"><tr><td>' +
      '<div class="card tile-card reveal" data-reveal>' +
      '<div class="tile-card__inner admin-layout">' +
      '<div class="admin-topbar">' +
      '<div>' +
      '<h1 class="section-title">Secret Blog Console</h1>' +
      '<p class="subtle">Create, edit, delete, and publish blog posts with inline image support.</p>' +
      '</div>' +
      '<div class="comments-row admin-header-actions">' +
      '<span class="admin-owner-badge" title="Owner session active">Owner Verified: BUILDER</span>' +
      '<button type="button" class="btn btn-ghost" id="admin-new-post">New Post</button>' +
      '<button type="button" class="btn btn-ghost" id="admin-logout">Logout</button>' +
      '</div>' +
      '</div>' +
      '<div class="admin-grid">' +
      '<div class="admin-editor card tile-card">' +
      '<div class="tile-card__inner">' +
      '<h2 class="section-title">Editor</h2>' +
      '<form id="admin-blog-form" class="admin-blog-form">' +
      '<input type="hidden" name="id" />' +
      '<label class="contact-field"><span>Title</span><input type="text" name="title" required /></label>' +
      '<label class="contact-field"><span>Date</span><input type="date" name="date" required /></label>' +
      '<label class="contact-field"><span>Excerpt</span><textarea name="excerpt" rows="3" placeholder="Short summary..."></textarea></label>' +
      '<label class="contact-field"><span>Tags (comma separated)</span><input type="text" name="tags" placeholder="dev, life, tutorials" /></label>' +
      '<div class="admin-editor-tools comments-row">' +
      '<button type="button" class="btn btn-ghost active" id="editor-mode-visual">Visual</button>' +
      '<button type="button" class="btn btn-ghost" id="editor-mode-html">HTML</button>' +
      '<span class="comments-note">Visual lets you type directly; HTML preserves exact markup.</span>' +
      '</div>' +
      '<div class="admin-format-toolbar comments-row">' +
      '<span class="toolbar-label">Office Tools:</span>' +
      '<button type="button" class="btn btn-ghost admin-cmd" data-cmd="bold" title="Bold"><strong>B</strong></button>' +
      '<button type="button" class="btn btn-ghost admin-cmd" data-cmd="italic" title="Italic"><em>I</em></button>' +
      '<button type="button" class="btn btn-ghost admin-cmd" data-cmd="underline" title="Underline"><u>U</u></button>' +
      '<select id="admin-font-name" class="admin-mini-select" title="Font">' +
      '<option value="">Font</option>' +
      '<option value="Times New Roman">Times New Roman</option>' +
      '<option value="Georgia">Georgia</option>' +
      '<option value="Verdana">Verdana</option>' +
      '<option value="Courier New">Courier New</option>' +
      '<option value="Tahoma">Tahoma</option>' +
      '</select>' +
      '<select id="admin-font-size" class="admin-mini-select" title="Size">' +
      '<option value="">Size</option>' +
      '<option value="1">10</option>' +
      '<option value="2">13</option>' +
      '<option value="3">16</option>' +
      '<option value="4">18</option>' +
      '<option value="5">24</option>' +
      '<option value="6">32</option>' +
      '</select>' +
      '<label class="comments-note">Color <input type="color" id="admin-font-color" value="#000000" /></label>' +
      '</div>' +
      '<div class="admin-image-tools">' +
      '<label class="contact-field"><span>Image URL</span><input type="url" name="image_url" placeholder="https://..." /></label>' +
      '<label class="contact-field"><span>Upload Image</span><input type="file" name="image_file" accept="image/*" /></label>' +
      '<div class="comments-row">' +
      '<button type="button" class="btn btn-ghost" id="admin-insert-image">Insert Image</button>' +
      '<span class="comments-note">You can also paste images directly in Visual mode.</span>' +
      '</div>' +
      '</div>' +
      '<div id="admin-visual-wrap" class="contact-field"><span>Content (Visual)</span><div id="admin-visual-editor" class="admin-visual-editor" contenteditable="true"></div></div>' +
      '<label class="contact-field" id="admin-html-wrap" style="display:none;"><span>Content (HTML)</span><textarea name="content" rows="24" class="admin-html-editor" placeholder="Write blog HTML here..."></textarea></label>' +
      '<div class="comments-row">' +
      '<button type="submit" class="btn" id="admin-save">Save Post</button>' +
      '<button type="button" class="btn btn-ghost" id="admin-reset">Reset</button>' +
      '</div>' +
      '<div id="admin-status" class="admin-status" aria-live="polite"></div>' +
      '</form>' +
      '</div></div>' +
      '<div class="admin-preview card tile-card">' +
      '<div class="tile-card__inner">' +
      '<h2 class="section-title">Preview</h2>' +
      '<div id="admin-preview" class="admin-preview-box"></div>' +
      '</div></div>' +
      '</div>' +
      '<div class="admin-list card tile-card">' +
      '<div class="tile-card__inner">' +
      '<h2 class="section-title">Published Blogs</h2>' +
      '<p class="subtle">These include the original seeded posts and anything saved through this console.</p>' +
      '<div class="admin-list-wrap"><table class="old-table admin-table admin-table--retro"><thead><tr><th>Title</th><th>Date</th><th>Type</th><th>Tags</th><th>Actions</th></tr></thead><tbody>' +
      blogs
        .map(function (blog) {
          var kind = seedIds.indexOf(blog.id) === -1 ? "Custom" : "Seed/Override";
          return blogRow(blog, kind);
        })
        .join("") +
      '</tbody></table></div>' +
      '</div></div>' +
      '</div></div></td></tr></table></div>' +
      '</section>';

    wireDashboard();

    var draft = readDraft();
    if (draft && (draft.title || draft.content || draft.excerpt || draft.tags || draft.image)) {
      setFormData({
        id: draft.id,
        title: draft.title,
        date: draft.date || BlogCMS.todayIso(),
        excerpt: draft.excerpt,
        tags: parseTags(draft.tags),
        content: draft.content,
        image: draft.image
      });
      setEditorMode(draft.editorMode || "visual");
      setStatus("Draft restored.", "ok");
    } else {
      setFormData({ date: BlogCMS.todayIso() });
      setEditorMode("visual");
      setStatus("Logged in. You can publish now.", "ok");
    }

    updatePreview();
  }

  function updatePreview() {
    var preview = $("admin-preview");
    var form = getForm();
    if (!preview || !form) return;
    if (editorMode === "visual") {
      syncVisualToHtml();
    }
    var title = String(form.elements.title.value || "").trim() || "Untitled Post";
    var excerpt = String(form.elements.excerpt.value || "").trim() || "Excerpt preview appears here.";
    var date = form.elements.date.value || BlogCMS.todayIso();
    var tags = parseTags(form.elements.tags.value);
    var content = String(form.elements.content.value || "") || "<p>Start writing here.</p>";
    var tagHtml = tags.length
      ? '<div class="chips subtle">' + tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>'
      : "";
    preview.innerHTML =
      '<article class="card tile-card">' +
      '<div class="tile-card__inner blog-detail-card">' +
      '<div class="blog-meta"><span class="blog-date">' + escapeHtml(date) + '</span>' + tagHtml + '</div>' +
      '<h3 class="blog-detail__title">' + escapeHtml(title) + '</h3>' +
      '<p class="subtle">' + escapeHtml(excerpt) + '</p>' +
      '<div class="blog-detail__content">' + content + '</div>' +
      '</div></article>';
  }

  function insertHtmlAtCursor(textarea, html) {
    var start = textarea.selectionStart || 0;
    var end = textarea.selectionEnd || 0;
    var before = textarea.value.slice(0, start);
    var after = textarea.value.slice(end);
    textarea.value = before + html + after;
    textarea.focus();
    var caret = before.length + html.length;
    textarea.selectionStart = caret;
    textarea.selectionEnd = caret;
    updatePreview();
  }

  function insertHtmlInVisual(html) {
    var visual = getVisualEditor();
    if (!visual) return;
    visual.focus();
    if (document.queryCommandSupported && document.queryCommandSupported("insertHTML")) {
      document.execCommand("insertHTML", false, html);
    } else {
      visual.innerHTML += html;
    }
    normalizeVisualImages();
    syncVisualToHtml();
    updatePreview();
    persistDraft();
  }

  function insertImageHtml(html) {
    var textarea = getHtmlEditor();
    if (editorMode === "visual") {
      insertHtmlInVisual("\n" + html + "\n");
      persistDraft();
      return;
    }
    if (!textarea) return;
    insertHtmlAtCursor(textarea, "\n" + html + "\n");
    persistDraft();
  }

  function uploadAndInsertImage(file, titleText, form) {
    setStatus("Uploading image...", "ok");
    BlogCMS.uploadImage(file, titleText || "blog-images")
      .then(function (result) {
        var html = makeResizableImageHtml(result.url, titleText || "Blog image");
        insertImageHtml(html);
        if (form && form.elements.image_file) form.elements.image_file.value = "";
        if (form && form.elements.image_url) form.elements.image_url.value = result.url;
        setStatus("Image uploaded and inserted into the post.", "ok");
        persistDraft();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Image upload failed.", "error");
      });
  }

  function wireDashboard() {
    var logoutBtn = $("admin-logout");
    var newBtn = $("admin-new-post");
    var resetBtn = $("admin-reset");
    var insertImageBtn = $("admin-insert-image");
    var modeVisualBtn = $("editor-mode-visual");
    var modeHtmlBtn = $("editor-mode-html");
    var fontName = $("admin-font-name");
    var fontSize = $("admin-font-size");
    var fontColor = $("admin-font-color");
    var form = getForm();

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        BlogCMS.logout().then(function () {
          renderLogin();
        });
      });
    }

    if (newBtn) {
      newBtn.addEventListener("click", function () {
        setFormData({ date: BlogCMS.todayIso() });
        clearDraft();
        setStatus("Ready for a new post.", "ok");
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        setFormData({ date: BlogCMS.todayIso() });
        clearDraft();
        setStatus("Editor reset.", "ok");
      });
    }

    if (insertImageBtn && form) {
      insertImageBtn.addEventListener("click", function () {
        var url = String(form.elements.image_url.value || "").trim();
        var file = form.elements.image_file && form.elements.image_file.files ? form.elements.image_file.files[0] : null;

        if (file) {
          uploadAndInsertImage(file, form.elements.title.value.trim() || "Blog image", form);
          return;
        }

        if (!url) {
          setStatus("Enter an image URL or choose a file.", "error");
          return;
        }

        var html = makeResizableImageHtml(url, form.elements.title.value.trim() || "Blog image");
        insertImageHtml(html);
        setStatus("Image inserted.", "ok");
      });
    }

    if (modeVisualBtn) {
      modeVisualBtn.addEventListener("click", function () {
        setEditorMode("visual");
        persistDraft();
      });
    }

    if (modeHtmlBtn) {
      modeHtmlBtn.addEventListener("click", function () {
        setEditorMode("html");
        persistDraft();
      });
    }

    Array.prototype.slice.call(document.querySelectorAll(".admin-cmd")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        runVisualCommand(btn.getAttribute("data-cmd"));
      });
    });

    if (fontName) {
      fontName.addEventListener("change", function () {
        if (!fontName.value) return;
        runVisualCommand("fontName", fontName.value);
      });
    }

    if (fontSize) {
      fontSize.addEventListener("change", function () {
        if (!fontSize.value) return;
        runVisualCommand("fontSize", fontSize.value);
      });
    }

    if (fontColor) {
      fontColor.addEventListener("input", function () {
        runVisualCommand("foreColor", fontColor.value);
      });
    }

    if (form) {
      var visual = getVisualEditor();
      var htmlEditor = getHtmlEditor();

      if (visual) {
        visual.addEventListener("input", function () {
          syncVisualToHtml();
          updatePreview();
          persistDraft();
        });

        visual.addEventListener("paste", function (event) {
          var clipboard = event.clipboardData;
          if (!clipboard || !clipboard.items) return;
          var imageFile = null;
          for (var i = 0; i < clipboard.items.length; i += 1) {
            var item = clipboard.items[i];
            if (item && item.type && item.type.indexOf("image/") === 0) {
              imageFile = item.getAsFile();
              break;
            }
          }
          if (!imageFile) return;
          event.preventDefault();
          uploadAndInsertImage(imageFile, form.elements.title.value.trim() || "Pasted image", form);
        });
      }

      if (htmlEditor) {
        htmlEditor.addEventListener("input", function () {
          if (editorMode === "html") {
            syncHtmlToVisual();
          }
          persistDraft();
        });
      }

      Array.prototype.slice.call(form.querySelectorAll("input, textarea")).forEach(function (field) {
        field.addEventListener("input", updatePreview);
        field.addEventListener("change", updatePreview);
        field.addEventListener("input", persistDraft);
        field.addEventListener("change", persistDraft);
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = currentFormData();
        if (!data) return;
        if (!data.title) {
          setStatus("Title is required.", "error");
          return;
        }
        if (!data.content.trim()) {
          setStatus("Content is required.", "error");
          return;
        }

        setStatus("Saving to Supabase...", "ok");
        BlogCMS.saveBlog({
          id: data.id,
          title: data.title,
          date: data.date,
          excerpt: data.excerpt,
          tags: data.tags,
          content: data.content,
          image: data.imageUrl
        })
          .then(function (saved) {
            clearDraft();
            setStatus('Saved "' + saved.title + '" successfully.', "ok");
            return BlogCMS.loadBlogs();
          })
          .then(function () {
            renderDashboard();
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Could not save blog.", "error");
          });
      });
    }

    var list = document.querySelector(".admin-list-wrap");
    if (list) {
      list.addEventListener("click", function (event) {
        var target = event.target;
        if (!target || !target.classList) return;
        var id = target.getAttribute("data-id");
        if (!id) return;

        if (target.classList.contains("admin-edit")) {
          var blog = BlogCMS.getBlog(id);
          if (!blog) {
            setStatus("Blog not found.", "error");
            return;
          }
          setFormData(blog);
          persistDraft();
          window.scrollTo({ top: 0, behavior: "smooth" });
          setStatus('Editing "' + blog.title + '".', "ok");
          return;
        }

        if (target.classList.contains("admin-clone")) {
          var source = BlogCMS.getBlog(id);
          if (!source) return;
          source.id = "";
          source.title = source.title + " Copy";
          setFormData(source);
          persistDraft();
          setStatus('Cloning "' + source.title + '".', "ok");
          return;
        }

        if (target.classList.contains("admin-delete")) {
          if (!window.confirm("Delete this blog?")) return;
          BlogCMS.deleteBlog(id)
            .then(function () {
              setStatus("Blog deleted.", "ok");
              return BlogCMS.loadBlogs();
            })
            .then(function () {
              renderDashboard();
            })
            .catch(function (error) {
              setStatus(error && error.message ? error.message : "Could not delete blog.", "error");
            });
        }
      });
    }

    if (!draftListenersBound) {
      draftListenersBound = true;
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          persistDraft();
        }
      });
      window.addEventListener("beforeunload", persistDraft);
    }
  }

  function renderByState(force) {
    var next = BlogCMS.isAuthed() && BlogCMS.isOwnerConfirmed() ? "dashboard" : "login";
    if (!force && next === screenState) {
      return;
    }
    screenState = next;
    if (next === "dashboard") {
      renderDashboard();
    } else {
      renderLogin();
    }
  }

  function boot() {
    BlogCMS.ready().then(function () {
      renderByState(true);
    });

    BlogCMS.onAuthChange(function () {
      renderByState(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
