(function (global) {
  "use strict";

  var P = null;

  function escapeHtml(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function getReadingTimeText(html) {
    var text = String(html || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    var words = text ? text.split(" ").length : 0;
    var minutes = Math.max(1, Math.ceil(words / 180));
    return minutes + " min read";
  }

  function tileDecor() {
    return (
      '<div class="tile-card__glow" aria-hidden="true"></div>' +
      '<div class="tile-card__shine" aria-hidden="true"></div>'
    );
  }

  function tableBlock(inner) {
    return (
      '<table class="section-table" cellpadding="4" cellspacing="0" border="1"><tr><td>' +
      inner +
      "</td></tr></table>"
    );
  }

  function sectionHead(tag, title, desc) {
    var d =
      desc != null && desc !== ""
        ? '<p class="section-desc tile-section-desc">' + escapeHtml(desc) + "</p>"
        : "";
    var titleText = [title && title.line1 ? title.line1 : "", title && title.line2 ? title.line2 : ""]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return (
      '<div class="section-head tile-section-head reveal" data-reveal>' +
      '<h2 class="section-title tile-title">' +
      escapeHtml(titleText) +
      "</h2>" +
      d +
      "</div>"
    );
  }

  function renderHero(h) {
    var lines = h.titleLines
      .map(function (ln) {
        var cls = ln.accent ? "line accent" : "line";
        return '<span class="' + cls + '">' + escapeHtml(ln.text) + "</span>";
      })
      .join("");
    var meta = h.card.meta
      .map(function (m) {
        return (
          "<li><span class=\"label\">" +
          escapeHtml(m.label) +
          "</span> " +
          escapeHtml(m.value) +
          "</li>"
        );
      })
      .join("");
    var links = h.card.links
      .map(function (l) {
        return (
          '<a href="' +
          escapeHtml(l.href) +
          '" target="_blank" rel="noopener noreferrer" class="link-pill">' +
          escapeHtml(l.label) +
          "</a>"
        );
      })
      .join("");
    return (
      '<section class="hero">' +
      tableBlock(
      '<div class="hero-grid">' +
      '<div class="hero-copy reveal" data-reveal>' +
      '<p class="eyebrow">' +
      escapeHtml(h.eyebrow) +
      "</p>" +
      '<h1 class="hero-title">' +
      lines +
      "</h1>" +
      '<p class="hero-lead">' +
      escapeHtml(h.lead) +
      "</p>" +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="' +
      escapeHtml(h.primaryCta.href) +
      '">' +
      escapeHtml(h.primaryCta.label) +
      "</a>" +
      '<a class="btn btn-ghost" href="' +
      escapeHtml(h.secondaryCta.href) +
      '">' +
      escapeHtml(h.secondaryCta.label) +
      "</a>" +
      "</div>" +
      "</div>" +
      '<div class="hero-card-wrap reveal" data-reveal>' +
      '<article class="card hero-card tilt" data-tilt>' +
      '<div class="hero-card-inner">' +
      "<div>" +
      '<h2 class="hero-name">' +
      escapeHtml(h.card.name) +
      "</h2>" +
      '<p class="hero-role">' +
      escapeHtml(h.card.role) +
      "</p>" +
      "</div>" +
      '<ul class="hero-meta">' +
      meta +
      "</ul>" +
      '<div class="hero-links">' +
      links +
      "</div>" +
      "</div>" +
      "</article>" +
      "</div>" +
      "</div>") +
      "</section>"
    );
  }

  function renderAbout(sec) {
    var tiles = sec.tiles
      .map(function (t) {
        var inner = "";
        if (t.kind === "rich") {
          inner =
            '<h3>' +
            escapeHtml(t.heading) +
            "</h3><p>" +
            escapeHtml(t.body) +
            "</p>";
        } else if (t.kind === "stat" && t.count != null) {
          inner =
            '<span class="stat-value" data-count="' +
            escapeHtml(String(t.count)) +
            '">0</span><span class="stat-label">' +
            escapeHtml(t.label) +
            "</span>";
        } else if (t.kind === "stat") {
          inner =
            '<span class="stat-value">' +
            escapeHtml(t.value) +
            '</span><span class="stat-label">' +
            escapeHtml(t.label) +
            "</span>";
        }
        return (
          '<article class="card tile-card ' +
          escapeHtml(t.cardClass) +
          ' reveal" data-reveal">' +
          tileDecor() +
          '<div class="tile-card__inner">' +
          inner +
          "</div></article>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.gridClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function renderExperience(sec) {
    var tiles = sec.tiles
      .map(function (j) {
        var tiltCls = j.tilt ? " tilt" : "";
        var tiltAttr = j.tilt ? " data-tilt" : "";
        var badge = j.badge
          ? '<span class="badge">' + escapeHtml(j.badge) + "</span>"
          : "";
        var bullets = j.bullets
          .map(function (b) {
            var isTimeline = b.indexOf("[timeline] ") === 0;
            var text = isTimeline ? b.replace("[timeline] ", "") : b;
            return "<li" + (isTimeline ? ' class=\"timeline-item\"' : "") + ">" + escapeHtml(text) + "</li>";
          })
          .join("");
        return (
          '<article class="card tile-card exp-card' +
          tiltCls +
          ' reveal" data-reveal' +
          tiltAttr +
          ">" +
          tileDecor() +
          '<div class="tile-card__inner">' +
          '<header class="exp-head"><div><h3>' +
          escapeHtml(j.company) +
          '</h3><p class="exp-role">' +
          escapeHtml(j.role) +
          "</p></div>" +
          badge +
          "</header>" +
          '<p class="exp-meta">' +
          escapeHtml(j.meta) +
          "</p>" +
          '<ul class="exp-list">' +
          bullets +
          "</ul></div></article>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.stackClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function renderEducation(sec) {
    var tiles = sec.tiles
      .map(function (e, i) {
        var inner = "";
        if (e.kind === "edu-featured") {
          inner =
            '<span class="edu-icon" aria-hidden="true">' +
            escapeHtml(e.icon) +
            "</span><div><h3>" +
            escapeHtml(e.school) +
            '</h3><p class="edu-degree">' +
            escapeHtml(e.degree) +
            '</p><p class="edu-meta">' +
            escapeHtml(e.meta) +
            '</p><p class="edu-coursework">' +
            escapeHtml(e.coursework) +
            "</p></div>";
        } else {
          inner =
            "<h3>" +
            escapeHtml(e.school) +
            '</h3><p class="edu-degree">' +
            escapeHtml(e.degree) +
            '</p><p class="edu-meta">' +
            escapeHtml(e.meta) +
            "</p>";
        }
        return (
          '<article class="card tile-card edu-card reveal" data-reveal>' +
          tileDecor() +
          '<div class="tile-card__inner">' +
          inner +
          "</div></article>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.gridClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function renderSkills(sec) {
    var tiles = sec.tiles
      .map(function (sk) {
        var wide = sk.wide ? " wide" : "";
        var chips = sk.chips
          .map(function (c) {
            return "<span>" + escapeHtml(c) + "</span>";
          })
          .join("");
        return (
          '<div class="card tile-card skill-block' +
          wide +
          ' reveal" data-reveal>' +
          tileDecor() +
          '<div class="tile-card__inner"><h3>' +
          escapeHtml(sk.title) +
          '</h3><div class="chips">' +
          chips +
          "</div></div></div>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.gridClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function renderProjects(sec) {
    var tiles = sec.tiles
      .map(function (p) {
        var tiltCls = p.tilt ? " tilt" : "";
        var tiltAttr = p.tilt ? " data-tilt" : "";
        var chips = p.chips
          .map(function (c) {
            return "<span>" + escapeHtml(c) + "</span>";
          })
          .join("");
        return (
          '<article class="card tile-card project-card' +
          tiltCls +
          ' reveal" data-reveal' +
          tiltAttr +
          ">" +
          tileDecor() +
          '<div class="tile-card__inner tile-card__inner--flush-top">' +
          '<div class="project-top"><span class="project-num">' +
          escapeHtml(p.num) +
          '</span><a class="project-link" href="' +
          escapeHtml(p.linkHref) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(p.linkLabel) +
          "</a></div>" +
          "<h3>" +
          escapeHtml(p.title) +
          "</h3><p>" +
          escapeHtml(p.body) +
          '</p><div class="chips subtle">' +
          chips +
          "</div></div></article>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.gridClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function renderBlogs(sec) {
    var tiles = sec.tiles
      .map(function (b) {
        var tiltCls = " tilt";
        var readTime = getReadingTimeText(b.content);
        var tags = b.tags
          ? b.tags
              .map(function (t) {
                return "<span>" + escapeHtml(t) + "</span>";
              })
              .join("")
          : "";
        return (
          '<article class="card tile-card blog-card' +
          tiltCls +
          ' reveal" data-reveal>' +
          tileDecor() +
          '<div class="tile-card__inner">' +
          '<div class="blog-meta">' +
          '<span class="blog-date">' +
          escapeHtml(b.date) +
          '</span><span class="blog-readtime">' +
          escapeHtml(readTime) +
          "</span>" +
          (tags ? '<div class="chips subtle">' + tags + "</div>" : "") +
          "</div>" +
          "<h3>" +
          escapeHtml(b.title) +
          "</h3><p>" +
          escapeHtml(b.excerpt) +
          "</p>" +
          '<div class="blog-content" style="display: none;">' +
          b.content +
          "</div>" +
          '<a class="btn btn-ghost read-more" href="blog-detail.html?slug=' +
          encodeURIComponent(b.id) +
          '">Read more</a>' +
          "</div></article>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.gridClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function getBlogCollection() {
    if (global.BlogCMS && typeof global.BlogCMS.getBlogs === "function") {
      return global.BlogCMS.getBlogs();
    }
    return global.BLOGS || [];
  }

  function getBlogSlug() {
    var params = new URLSearchParams(global.location ? global.location.search : "");
    return params.get("slug") || "";
  }

  function renderBlogDetail() {
    var slug = getBlogSlug();
    var blog = null;
    var blogs = getBlogCollection();
    if (blogs && blogs.length) {
      blog = blogs.find(function (item) {
        return item.id === slug;
      }) || blogs[0];
    }

    if (!blog) {
      if (global.BlogCMS && typeof global.BlogCMS.isReady === "function" && !global.BlogCMS.isReady()) {
        return '<section class="blog-detail"><p>Loading blog post...</p></section>';
      }
      return '<section class="blog-detail"><p>Blog not found.</p></section>';
    }

    document.title = blog.title + " · Blogs · Subham Ghosh";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", blog.excerpt || blog.title);

    var readTime = getReadingTimeText(blog.content);
    var tagList = blog.tags
      ? blog.tags
          .map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
          })
          .join("")
      : "";

    return (
      '<section class="blog-detail">' +
      tableBlock(
        '<article class="card tile-card blog-detail-card reveal" data-reveal>' +
          tileDecor() +
          '<div class="tile-card__inner">' +
          '<p class="blog-detail__back"><a class="btn btn-ghost" href="blogs.html">&larr; Back to Blogs</a></p>' +
          '<div class="blog-meta">' +
          '<span class="blog-date">' +
          escapeHtml(blog.date) +
          '</span><span class="blog-readtime">' +
          escapeHtml(readTime) +
          "</span>" +
          (tagList ? '<div class="chips subtle">' + tagList + "</div>" : "") +
          '</div>' +
          '<h1 class="blog-detail__title">' +
          escapeHtml(blog.title) +
          '</h1>' +
          '<div class="blog-detail__content">' +
          blog.content +
          '</div>' +
          '<section id="blog-comments-root" class="blog-comments" data-post-slug="' +
          escapeHtml(blog.id) +
          '">' +
          '<div class="table-wrap"><table class="old-table"><tr><td>' +
          '<div class="card tile-card reveal" data-reveal>' +
          tileDecor() +
          '<div class="tile-card__inner">' +
          '<h2 class="section-title">Guestbook Comments</h2>' +
          '<p class="subtle">Loading comments...</p>' +
          '</div></div></td></tr></table></div>' +
          '</section>' +
          '</div>' +
          '</div></article>'
      ) +
      '</section>'
    );
  }

  function renderCertSection(sec) {
    var filters = sec.filters
      .map(function (f, i) {
        var active = i === 0 ? " active" : "";
        return (
          '<button type="button" class="filter-btn' +
          active +
          '" data-filter="' +
          escapeHtml(f.id) +
          '">' +
          escapeHtml(f.label) +
          "</button>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="cert-toolbar reveal" data-reveal>' +
          filters +
          '</div><div class="cert-grid" id="cert-grid"></div>'
      ) +
      "</section>"
    );
  }

  function renderLanguages(sec) {
    var tiles = sec.tiles
      .map(function (l) {
        return (
          '<article class="card tile-card lang-card reveal" data-reveal>' +
          tileDecor() +
          '<div class="tile-card__inner"><span>' +
          escapeHtml(l.name) +
          "</span><em>" +
          escapeHtml(l.level) +
          "</em></div></article>"
        );
      })
      .join("");
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="' +
          escapeHtml(sec.gridClass) +
          '">' +
          tiles +
          "</div>"
      ) +
      "</section>"
    );
  }

  function renderContact(sec) {
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      tableBlock(
        sectionHead(sec.tag, sec.title, sec.desc) +
          '<div class="contact-panel reveal" data-reveal>' +
          '<div class="contact-panel__info">' +
          '<h3 class="cta-card__heading">' +
          escapeHtml(sec.cardHeading) +
          '</h3><p>' +
          escapeHtml(sec.body) +
          '</p><div class="contact-meta">' +
          '<p><strong>Email:</strong> ' + escapeHtml(sec.email.label) + '</p>' +
          '</div></div>' +
          '<div class="contact-panel__form-wrap">' +
          '<form id="contact-form" class="contact-form" action="https://formspree.io/f/xlganyea" method="POST">' +
          '<label class="contact-field"><span>Name</span><input type="text" name="name" required /></label>' +
          '<label class="contact-field"><span>Email</span><input type="email" name="email" required /></label>' +
          '<label class="contact-field"><span>Title</span><input type="text" name="title" required /></label>' +
          '<label class="contact-field"><span>Message</span><textarea name="message" rows="6" required></textarea></label>' +
          '<input type="hidden" name="_subject" value="New message from portfolio site" />' +
          '<input type="hidden" name="_captcha" value="false" />' +
          '<div class="contact-actions">' +
          '<button class="contact-submit" type="submit" id="contact-submit">Send Message</button>' +
          '</div>' +
          '</form></div>' +
          '</div>'
      ) +
      "</section>"
    );
  }

  function renderHeader(nav, logo) {
    var links = nav
      .map(function (item) {
        var cls = item.cta ? ' class="nav-cta"' : "";
        return (
          '<a href="' + escapeHtml(item.href) + '"' + cls + ">" + escapeHtml(item.label) + "</a>"
        );
      })
      .join("");
    return (
      '<nav class="nav" aria-label="Primary">' +
      links +
      "</nav>"
    );
  }

  function renderMobileNav(items) {
    return items
      .map(function (item) {
        return (
          '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.label) + "</a>"
        );
      })
      .join("");
  }

  function applyMeta(meta) {
    document.title = meta.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", meta.description);
    var mt = document.getElementById("meta-theme");
    if (mt && meta.themeColor) mt.setAttribute("content", meta.themeColor);
  }

  function getPageKey(main) {
    if (main && main.dataset && main.dataset.page) {
      return main.dataset.page;
    }
    var path = (global.location && global.location.pathname) || "";
    var fileName = path.split("/").pop() || "index.html";
    var base = fileName.toLowerCase().replace(/\.html$/, "");
    if (!base || base === "index") return "home";
    return base;
  }

  function renderPage(pageKey) {
    var pages = {
      home: function () { return renderHero(P.hero); },
      about: function () { return renderAbout(P.about); },
      experience: function () { return renderExperience(P.experience); },
      education: function () { return renderEducation(P.education); },
      skills: function () { return renderSkills(P.skills); },
      projects: function () { return renderProjects(P.projects); },
      blogs: function () { return renderBlogs(P.blogs); },
      "blog-detail": function () { return renderBlogDetail(); },
      certifications: function () { return renderCertSection(P.certifications); },
      languages: function () { return renderLanguages(P.languages); },
      contact: function () { return renderContact(P.contact); }
    };

    if (pages[pageKey]) return pages[pageKey]();
    return renderHero(P.hero);
  }

  function mount() {
    P = global.PORTFOLIO;
    if (!P) {
      console.error("PORTFOLIO data missing. Load portfolio-data.js first.");
      return;
    }
    if (global.BLOGS) {
      var blogSource = getBlogCollection();
      P.blogs.tiles = blogSource.map(function(b) {
        return {
          kind: "blog",
          id: b.id,
          title: b.title,
          date: b.date,
          excerpt: b.excerpt,
          content: b.content,
          tags: b.tags
        };
      });
    }
    applyMeta(P.meta);

    var header = document.querySelector(".site-header");
    if (header) {
      var menuBtn = header.querySelector(".menu-toggle");
      var menuHtml = menuBtn ? menuBtn.outerHTML : "";
      header.innerHTML = renderHeader(P.nav, P.branding.logo) + menuHtml;
    }

    var mnav = document.getElementById("mobile-nav");
    if (mnav) mnav.innerHTML = renderMobileNav(P.mobileNav);

    var main = document.getElementById("top");
    if (!main) return;

    main.innerHTML = renderPage(getPageKey(main));
  }

  global.PortfolioRender = { mount: mount, escapeHtml: escapeHtml };

  global.toggleBlog = function(btn) {
    var content = btn.previousElementSibling;
    if (content.style.display === "none") {
      content.style.display = "block";
      btn.textContent = "Read less";
    } else {
      content.style.display = "none";
      btn.textContent = "Read more";
    }
  };

  if (!global.__blogCmsRenderBound) {
    global.__blogCmsRenderBound = true;
    global.addEventListener("blogcms:updated", function () {
      if (global.PortfolioRender && typeof global.PortfolioRender.mount === "function") {
        global.PortfolioRender.mount();
      }
    });
  }
})(typeof window !== "undefined" ? window : this);
