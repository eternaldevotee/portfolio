(function () {
  "use strict";

  var REINIT_DELAY_MS = 250;
  var MAX_INIT_RETRIES = 20;

  var SUPABASE_URL = "https://vzyomxngqesrpyoqmhec.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_XQx0VnzlHUeDZcXMcBjg7w_RXRMCz5V";
  var TABLE = "blog_comments";
  var OWNER_NAME = "shubham";
  var OWNER_DISPLAY_NAME = "SHUBHAM";
  var OWNER_EMAIL = "shubhamofficial0910@gmail.com";
  var MAX_REPLY_DEPTH = 8;
  var PROFILE_KEY = "portfolio-comments-profile";
  var PROFILE_SESSION_KEY = "portfolio-comments-profile-session";
  var PROFILE_COOKIE_KEY = "portfolio_comments_profile";

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isOwnerIdentity(profile) {
    if (!profile) return false;
    return normalize(profile.name) === OWNER_NAME || normalize(profile.email) === normalize(OWNER_EMAIL);
  }

  function isOwnerSessionActive() {
    return !!(
      window.BlogCMS &&
      typeof window.BlogCMS.isOwnerConfirmed === "function" &&
      window.BlogCMS.isOwnerConfirmed()
    );
  }

  function isOwnerComment(comment) {
    if (!comment) return false;
    var n = normalize(comment.name);
    var e = normalize(comment.email);
    return n === OWNER_NAME || n === "builder" || n === normalize(OWNER_DISPLAY_NAME) || e === normalize(OWNER_EMAIL);
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

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  }

  function parseError(response, fallback) {
    return response
      .json()
      .then(function (payload) {
        if (payload && payload.message) return payload.message;
        if (payload && payload.error_description) return payload.error_description;
        if (payload && payload.error) return payload.error;
        return fallback;
      })
      .catch(function () {
        return fallback;
      });
  }

  function apiFetch(path, options) {
    var request = options || {};
    var headers = request.headers || {};
    var authToken = "";
    if (window.BlogCMS && typeof window.BlogCMS.getAccessToken === "function") {
      authToken = window.BlogCMS.getAccessToken() || "";
    }
    headers.apikey = SUPABASE_ANON_KEY;
    headers.Authorization = "Bearer " + (authToken || SUPABASE_ANON_KEY);
    request.headers = headers;
    return fetch(SUPABASE_URL + "/rest/v1/" + path, request);
  }

  function readProfile() {
    try {
      var sessionRaw = sessionStorage.getItem(PROFILE_SESSION_KEY);
      if (sessionRaw) return JSON.parse(sessionRaw);
    } catch (err) {}
    try {
      var cookieRaw = getCookie(PROFILE_COOKIE_KEY);
      if (cookieRaw) return JSON.parse(cookieRaw);
    } catch (err2) {}
    try {
      var localRaw = localStorage.getItem(PROFILE_KEY);
      if (!localRaw) return null;
      return JSON.parse(localRaw);
    } catch (err3) {
      return null;
    }
  }

  function saveProfile(name, email) {
    var value = {
      name: String(name || "").trim(),
      email: String(email || "").trim()
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(value));
    } catch (err) {}
    try {
      sessionStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(value));
    } catch (err2) {}
    try {
      setCookie(PROFILE_COOKIE_KEY, JSON.stringify(value), 180);
    } catch (err3) {}
  }

  function clearProfile() {
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch (err) {}
    try {
      sessionStorage.removeItem(PROFILE_SESSION_KEY);
    } catch (err2) {}
    try {
      setCookie(PROFILE_COOKIE_KEY, "", 0);
    } catch (err3) {}
  }

  function groupThreads(items) {
    var byId = {};
    var roots = [];

    items.forEach(function (item) {
      byId[item.id] = {
        data: item,
        replies: []
      };
    });

    items.forEach(function (item) {
      var node = byId[item.id];
      if (item.parent_id && byId[item.parent_id]) {
        byId[item.parent_id].replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  function displayName(comment) {
    if (comment.is_anonymous) return "Anonymous";
    if (isOwnerComment(comment)) return OWNER_DISPLAY_NAME;
    return comment.name || "Guest";
  }

  function ownerDisplayName() {
    return OWNER_DISPLAY_NAME;
  }

  function renderCommentNode(node, depth) {
    var comment = node.data;
    var name = displayName(comment);
    var ownerBadge = isOwnerComment(comment) && !comment.is_anonymous ? '<span class="comment-owner">*BUILDER*</span>' : "";
    var deleteBtn = isOwnerSessionActive()
      ? '<button type="button" class="btn btn-ghost comment-delete" data-id="' + comment.id + '" title="Hide this comment">🗑</button>'
      : "";
    var replyBtn = depth < MAX_REPLY_DEPTH
      ? '<button type="button" class="btn btn-ghost comment-reply" data-id="' + comment.id + '" title="Reply to this comment">💬</button>'
      : "";

    var replies = node.replies
      .map(function (child) {
        return renderCommentNode(child, depth + 1);
      })
      .join("");

    var replyClass = depth > 0 ? ' reply level-' + depth : '';

    return (
      '<li class="comment-item' + replyClass + '" data-comment-id="' + comment.id + '">' +
      '<div class="comment-head">' +
      '<span class="comment-author">' + escapeHtml(name) + '</span>' +
      ownerBadge +
      '<span class="comment-date">' + escapeHtml(formatDate(comment.created_at)) + '</span>' +
      '</div>' +
      '<p class="comment-body">' + escapeHtml(comment.message || "") + '</p>' +
      '<div class="comment-actions">' +
      deleteBtn +
      replyBtn +
      '</div>' +
      (replies ? '<ul class="comments-list comment-replies">' + replies + '</ul>' : "") +
      '<div class="reply-form-slot"></div>' +
      '</li>'
    );
  }

  function renderReplyForm(parentId, profile) {
    var name = profile && profile.name ? profile.name : "";
    var email = profile && profile.email ? profile.email : "";
    var ownerMode = isOwnerIdentity(profile) || isOwnerSessionActive();
    var hasProfile = !!(name && email) || ownerMode;
    var effectiveName = ownerMode ? ownerDisplayName() : name;
    var effectiveEmail = ownerMode ? OWNER_EMAIL : email;

    return (
      '<form class="comments-form reply-form" data-parent-id="' + parentId + '">' +
      (hasProfile
        ? '<p class="comments-note">' +
          (ownerMode
            ? 'Replying as <strong>' + escapeHtml(effectiveName) + '</strong> <span class="comment-owner">*BUILDER*</span>.'
            : 'Replying as <strong>' + escapeHtml(name) + '</strong> | ' + escapeHtml(email)) +
          '</p>' +
          '<input type="hidden" name="name" value="' + escapeHtml(effectiveName) + '" />' +
          '<input type="hidden" name="email" value="' + escapeHtml(effectiveEmail) + '" />'
        : '<div class="comments-grid two">' +
          '<div><label>Name</label><input type="text" name="name" required value="' + escapeHtml(name) + '" /></div>' +
          '<div><label>Email</label><input type="email" name="email" required value="' + escapeHtml(email) + '" /></div>' +
          '</div>') +
      '<div style="margin-top:8px;"><label>Reply</label><textarea name="message" required maxlength="1000"></textarea></div>' +
      '<div class="comments-row" style="margin-top:8px;">' +
      '<label><input type="checkbox" name="anonymous" /> Show as Anonymous</label>' +
      '<button type="submit" class="btn btn-post-reply">Post Reply 💬</button>' +
      '<button type="button" class="btn btn-ghost reply-cancel">Cancel</button>' +
      '</div>' +
      '<div class="comments-status" aria-live="polite"></div>' +
      '</form>'
    );
  }

  function renderMainForm(profile) {
    var name = profile && profile.name ? profile.name : "";
    var email = profile && profile.email ? profile.email : "";
    var ownerMode = isOwnerIdentity(profile) || isOwnerSessionActive();
    var hasSavedIdentity = !!(name && email);
    var effectiveOwnerName = ownerDisplayName();
    var showIdentityInputs = !ownerMode && !hasSavedIdentity;

    return (
      '<form id="comment-form" class="comments-form">' +
      (showIdentityInputs
        ? '<div class="comments-grid two">' +
          '<div><label for="comment-name">Name</label><input id="comment-name" type="text" name="name" required value="' + escapeHtml(name) + '" /></div>' +
          '<div><label for="comment-email">Email</label><input id="comment-email" type="email" name="email" required value="' + escapeHtml(email) + '" /></div>' +
          '</div>'
        : (ownerMode
            ? '<p class="comments-note">Posting as <strong>' + escapeHtml(effectiveOwnerName) + '</strong> <span class="comment-owner">*BUILDER*</span>.</p>' +
              '<input type="hidden" name="name" value="' + escapeHtml(effectiveOwnerName) + '" />' +
              '<input type="hidden" name="email" value="' + escapeHtml(OWNER_EMAIL) + '" />'
            : '<p class="comments-note">Posting as <strong>' + escapeHtml(name) + '</strong> | ' + escapeHtml(email) + '.</p>' +
              '<input type="hidden" name="name" value="' + escapeHtml(name) + '" />' +
              '<input type="hidden" name="email" value="' + escapeHtml(email) + '" />' +
              '<button type="button" class="btn btn-ghost comments-identity-reset">Use different identity</button>')) +
      '<div style="margin-top:8px;">' +
      '<label for="comment-message">Comment</label>' +
      '<textarea id="comment-message" name="message" required maxlength="1000"></textarea>' +
      '</div>' +
      '<div class="comments-row" style="margin-top:8px;">' +
      '<label><input type="checkbox" name="anonymous" /> Show as Anonymous</label>' +
      '<button type="submit" class="btn btn-post-comment">Post Comment 📨</button>' +
      '</div>' +
      '<div class="comments-note">Name and Email are required once. You can still display as Anonymous.</div>' +
      '<div id="comments-status" class="comments-status" aria-live="polite"></div>' +
      '</form>'
    );
  }

  function initComments() {
    var root = document.getElementById("blog-comments-root");
    if (!root) return;

    var slug = root.getAttribute("data-post-slug") || "";
    if (!slug) {
      root.innerHTML = '<p class="comments-status error">Missing blog id for comments.</p>';
      return;
    }

    var profile = readProfile();
    if (isOwnerSessionActive()) {
      profile = { name: OWNER_DISPLAY_NAME, email: OWNER_EMAIL };
      saveProfile(profile.name, profile.email);
    }

    var state = {
      items: [],
      profile: profile,
      isReplying: false,
      reactions: {}
    };

    function getReaction(commentId) {
      var key = String(commentId || "");
      return state.reactions[key] || { likes: 0, dislikes: 0, myVote: 0 };
    }

    function setMainFormVisible(visible) {
      var form = document.getElementById("comment-form");
      if (!form) return;
      form.style.display = visible ? "" : "none";
    }

    function closeAllReplyForms() {
      root.querySelectorAll(".reply-form-slot").forEach(function (slot) {
        slot.innerHTML = "";
      });
      state.isReplying = false;
      setMainFormVisible(true);
    }

    function setGlobalStatus(type, message) {
      var box = document.getElementById("comments-status");
      if (!box) return;
      box.className = "comments-status" + (type ? " " + type : "");
      box.textContent = message || "";
    }

    function setFormBusy(form, busy) {
      form.classList.toggle("is-busy", !!busy);
      form.querySelectorAll("input, textarea, button").forEach(function (el) {
        el.disabled = busy;
      });
    }

    function bindProfileAutosave(form) {
      if (!form || !form.name || !form.email) return;
      function sync() {
        var name = String(form.name.value || "").trim();
        var email = String(form.email.value || "").trim();
        if (!name && !email) return;
        saveProfile(name, email);
        state.profile = { name: name, email: email };
      }
      form.name.addEventListener("input", sync);
      form.email.addEventListener("input", sync);
      form.name.addEventListener("blur", sync);
      form.email.addEventListener("blur", sync);
    }

    function reactionControls(commentId) {
      var reaction = getReaction(commentId);
      var dislikeDisplay = reaction.dislikes > 0 ? -reaction.dislikes : 0;
      return (
        '<button type="button" class="btn btn-ghost comment-vote comment-vote-like' + (reaction.myVote === 1 ? ' voted' : '') + '" data-id="' + commentId + '" data-vote="1" title="Like this comment">👍 <span class="vote-count like-count">' + reaction.likes + '</span></button>' +
        '<button type="button" class="btn btn-ghost comment-vote comment-vote-dislike' + (reaction.myVote === -1 ? ' voted' : '') + '" data-id="' + commentId + '" data-vote="-1" title="Dislike this comment">👎 <span class="vote-count dislike-count">' + dislikeDisplay + '</span></button>'
      );
    }

    function draw() {
      var threads = groupThreads(state.items);
      var html =
        '<div class="table-wrap"><table class="old-table"><tr><td>' +
        '<div class="card tile-card reveal" data-reveal>' +
        '<div class="tile-card__inner">' +
        '<h2 class="section-title">Guestbook Comments</h2>' +
        (threads.length
          ? '<ul class="comments-list">' +
            threads
              .map(function (node) {
                return renderCommentNode(node, 0);
              })
              .join("") +
            '</ul>'
          : '<p class="subtle">No comments yet. Be the first one to sign the guestbook.</p>') +
        renderMainForm(state.profile) +
        '</div></div></td></tr></table></div>';

      root.innerHTML = html;
      bindEvents();
      if (state.isReplying) {
        setMainFormVisible(false);
      }
    }

    function loadComments() {
      return apiFetch(
        TABLE +
          "?select=id,post_slug,parent_id,name,email,message,is_anonymous,created_at,is_hidden" +
          "&post_slug=eq." + encodeURIComponent(slug) +
          "&is_hidden=eq.false" +
          "&order=created_at.asc",
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        }
      )
        .then(function (response) {
          if (!response.ok) {
            return parseError(response, "Could not load comments.").then(function (msg) {
              throw new Error(msg);
            });
          }
          return response.json();
        })
        .then(function (rows) {
          state.items = Array.isArray(rows) ? rows : [];
          state.isReplying = false;
          return loadReactionStats().then(function () {
            draw();
          });
        })
        .catch(function (error) {
          root.innerHTML = '<p class="comments-status error">' + escapeHtml(error.message || "Could not load comments.") + '</p>';
        });
    }

    function loadReactionStats() {
      return apiFetch("rpc/get_comment_reaction_stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ p_post_slug: slug })
      })
        .then(function (response) {
          if (!response.ok) {
            return parseError(response, "Could not load reactions.").then(function (msg) {
              throw new Error(msg);
            });
          }
          return response.json();
        })
        .then(function (rows) {
          var map = {};
          (Array.isArray(rows) ? rows : []).forEach(function (row) {
            map[String(row.comment_id)] = {
              likes: parseInt(row.likes || 0, 10) || 0,
              dislikes: parseInt(row.dislikes || 0, 10) || 0,
              myVote: parseInt(row.my_vote || 0, 10) || 0
            };
          });
          state.reactions = map;
        })
        .catch(function () {
          state.reactions = {};
        });
    }

    function voteOnComment(commentId, vote) {
      return apiFetch("rpc/vote_comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          p_comment_id: parseInt(commentId, 10),
          p_vote: vote
        })
      }).then(function (response) {
        if (!response.ok) {
          return parseError(response, "Could not submit vote.").then(function (msg) {
            throw new Error(msg);
          });
        }
        return response.json();
      });
    }

    function insertComment(payload) {
      return apiFetch(TABLE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify([payload])
      }).then(function (response) {
        if (!response.ok) {
          return parseError(response, "Could not post comment.").then(function (msg) {
            throw new Error(msg);
          });
        }
        return response.json();
      });
    }

    function hideComment(commentId) {
      return apiFetch(TABLE + "?id=eq." + encodeURIComponent(commentId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          is_hidden: true,
          hidden_at: new Date().toISOString()
        })
      }).then(function (response) {
        if (!response.ok) {
          return parseError(response, "Could not hide comment.").then(function (msg) {
            throw new Error(msg);
          });
        }
      });
    }

    function bindReplySubmit(form) {
      bindProfileAutosave(form);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var name = String(form.name.value || "").trim() || (state.profile && state.profile.name ? state.profile.name : "");
        var email = String(form.email.value || "").trim() || (state.profile && state.profile.email ? state.profile.email : "");
        var message = String(form.message.value || "").trim();
        var anonymous = !!form.anonymous.checked;
        var parentId = parseInt(form.getAttribute("data-parent-id") || "0", 10);
        var status = form.querySelector(".comments-status");

        if (!name || !email || !message || !parentId) {
          if (status) {
            status.className = "comments-status error";
            status.textContent = "Please fill all reply fields.";
          }
          return;
        }

        setFormBusy(form, true);
        if (status) {
          status.className = "comments-status";
          status.textContent = "Posting reply... ⏳";
        }

        saveProfile(name, email);
        state.profile = { name: name, email: email };

        insertComment({
          post_slug: slug,
          parent_id: parentId,
          name: name,
          email: email,
          message: message,
          is_anonymous: anonymous
        })
          .then(function () {
            if (status) {
              status.className = "comments-status ok";
              status.textContent = "Reply posted ✅";
            }
            return loadComments();
          })
          .catch(function (error) {
            if (status) {
              status.className = "comments-status error";
              status.textContent = error.message || "Could not post reply.";
            }
          })
          .finally(function () {
            setFormBusy(form, false);
          });
      });
    }

    function bindEvents() {
      var form = document.getElementById("comment-form");
      if (form) {
        bindProfileAutosave(form);

        var resetIdentityBtn = form.querySelector(".comments-identity-reset");
        if (resetIdentityBtn) {
          resetIdentityBtn.addEventListener("click", function () {
            state.profile = null;
            clearProfile();
            draw();
          });
        }

        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var name = String(form.name.value || "").trim() || (state.profile && state.profile.name ? state.profile.name : "");
          var email = String(form.email.value || "").trim() || (state.profile && state.profile.email ? state.profile.email : "");
          var message = String(form.message.value || "").trim();
          var anonymous = !!form.anonymous.checked;

          if (!name || !email || !message) {
            setGlobalStatus("error", "Please fill all required fields.");
            return;
          }

          setFormBusy(form, true);
          setGlobalStatus("", "Posting comment... ⏳");

          saveProfile(name, email);
          state.profile = { name: name, email: email };

          insertComment({
            post_slug: slug,
            parent_id: null,
            name: name,
            email: email,
            message: message,
            is_anonymous: anonymous
          })
            .then(function () {
              setGlobalStatus("ok", "Comment posted ✅");
              return loadComments();
            })
            .catch(function (error) {
              setGlobalStatus("error", error.message || "Could not post comment.");
            })
            .finally(function () {
              form.reset();
              if (state.profile && form.name && form.email) {
                form.name.value = state.profile.name || "";
                form.email.value = state.profile.email || "";
              }
              setFormBusy(form, false);
            });
        });
      }

      root.querySelectorAll(".comment-reply").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-id");
          var host = btn.closest(".comment-item");
          if (!id || !host) return;
          var slot = host.querySelector(".reply-form-slot");
          if (!slot) return;

          if (slot.innerHTML) {
            closeAllReplyForms();
            return;
          }

          closeAllReplyForms();
          state.isReplying = true;
          setMainFormVisible(false);

          slot.innerHTML = renderReplyForm(id, state.profile);
          var replyForm = slot.querySelector("form");
          if (!replyForm) return;

          bindReplySubmit(replyForm);

          var cancel = slot.querySelector(".reply-cancel");
          if (cancel) {
            cancel.addEventListener("click", function () {
              closeAllReplyForms();
            });
          }
        });
      });

      root.querySelectorAll(".comment-delete").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-id");
          if (!id) return;
          if (!window.confirm("Hide this comment from public view?")) return;
          hideComment(id)
            .then(function () {
              return loadComments();
            })
            .catch(function (error) {
              setGlobalStatus("error", error.message || "Could not hide comment.");
            });
        });
      });

      root.querySelectorAll(".comment-actions").forEach(function (actionsHost) {
        var commentItem = actionsHost.closest(".comment-item");
        if (!commentItem) return;
        var commentId = commentItem.getAttribute("data-comment-id");
        if (!commentId) return;

        var voteUi = document.createElement("div");
        voteUi.className = "comment-vote-wrap";
        voteUi.innerHTML = reactionControls(commentId);
        actionsHost.appendChild(voteUi);
      });

      root.querySelectorAll(".comment-vote").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var commentId = btn.getAttribute("data-id");
          var vote = parseInt(btn.getAttribute("data-vote") || "0", 10);
          if (!commentId || (vote !== 1 && vote !== -1)) return;

          btn.disabled = true;
          voteOnComment(commentId, vote)
            .then(function () {
              return loadReactionStats();
            })
            .then(function () {
              draw();
            })
            .catch(function (error) {
              setGlobalStatus("error", error.message || "Could not submit vote.");
            })
            .finally(function () {
              btn.disabled = false;
            });
        });
      });
    }

    loadComments();
  }

  function scheduleInit(triesLeft) {
    if (typeof triesLeft !== "number") triesLeft = MAX_INIT_RETRIES;

    var root = document.getElementById("blog-comments-root");
    if (root) {
      initComments();
      return;
    }

    if (triesLeft <= 0) return;
    window.setTimeout(function () {
      scheduleInit(triesLeft - 1);
    }, REINIT_DELAY_MS);
  }

  window.PortfolioComments = {
    init: scheduleInit
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      scheduleInit();
    });
  } else {
    scheduleInit();
  }

  window.addEventListener("blogcms:updated", function () {
    scheduleInit();
  });

  window.addEventListener("blogcms:auth-changed", function () {
    scheduleInit();
  });
})();
