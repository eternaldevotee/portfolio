/**
 * Builds the portfolio DOM from PORTFOLIO (portfolio-data.js). Do not edit HTML in index.html for content.
 */
(function (global) {
  "use strict";

  var P = null;

  function escapeHtml(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function tileDecor() {
    return (
      '<div class="tile-card__glow" aria-hidden="true"></div>' +
      '<div class="tile-card__shine" aria-hidden="true"></div>'
    );
  }

  function sectionHead(tag, title, desc) {
    var d =
      desc != null && desc !== ""
        ? '<p class="section-desc tile-section-desc">' + escapeHtml(desc) + "</p>"
        : "";
    return (
      '<div class="section-head tile-section-head reveal" data-reveal>' +
      '<span class="section-tag">' +
      escapeHtml(tag) +
      "</span>" +
      '<h2 class="section-title tile-title">' +
      '<span class="tile-title-glare" aria-hidden="true"></span>' +
      '<span class="tile-title-inner">' +
      '<span class="tile-title-line1">' +
      escapeHtml(title.line1) +
      "</span>" +
      '<span class="tile-title-amp">&amp;</span>' +
      '<span class="tile-title-line2">' +
      escapeHtml(title.line2) +
      "</span>" +
      "</span>" +
      '<span class="tile-title-track" aria-hidden="true"><span class="tile-title-progress"></span></span>' +
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
      '<div class="hero-avatar" aria-hidden="true">' +
      escapeHtml(h.card.initials) +
      "</div>" +
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
      "</div>" +
      '<div class="scroll-hint" aria-hidden="true"><span>Scroll</span><span class="scroll-line"></span></div>' +
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="' +
      escapeHtml(sec.gridClass) +
      '">' +
      tiles +
      "</div></section>"
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
            return "<li>" + escapeHtml(b) + "</li>";
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="' +
      escapeHtml(sec.stackClass) +
      '">' +
      tiles +
      "</div></section>"
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="' +
      escapeHtml(sec.gridClass) +
      '">' +
      tiles +
      "</div></section>"
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="' +
      escapeHtml(sec.gridClass) +
      '">' +
      tiles +
      "</div></section>"
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="' +
      escapeHtml(sec.gridClass) +
      '">' +
      tiles +
      "</div></section>"
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="cert-toolbar reveal" data-reveal">' +
      filters +
      '</div><div class="cert-grid" id="cert-grid"></div></section>'
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
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="' +
      escapeHtml(sec.gridClass) +
      '">' +
      tiles +
      "</div></section>"
    );
  }

  function renderContact(sec) {
    return (
      '<section id="' +
      escapeHtml(sec.id) +
      '" class="' +
      escapeHtml(sec.sectionClass) +
      '">' +
      sectionHead(sec.tag, sec.title, sec.desc) +
      '<div class="card tile-card cta-card reveal" data-reveal>' +
      tileDecor() +
      '<div class="tile-card__inner">' +
      '<h3 class="cta-card__heading">' +
      escapeHtml(sec.cardHeading) +
      "</h3><p>" +
      escapeHtml(sec.body) +
      '</p><div class="cta-actions">' +
      '<a class="btn btn-primary" href="' +
      escapeHtml(sec.email.href) +
      '">' +
      escapeHtml(sec.email.label) +
      '</a><a class="btn btn-ghost" href="' +
      escapeHtml(sec.phone.href) +
      '">' +
      escapeHtml(sec.phone.label) +
      "</a></div></div></div></section>"
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
      '<a class="logo" href="#top">' +
      escapeHtml(logo) +
      '</a><nav class="nav" aria-label="Primary">' +
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

  function mount() {
    P = global.PORTFOLIO;
    if (!P) {
      console.error("PORTFOLIO data missing. Load portfolio-data.js first.");
      return;
    }
    applyMeta(P.meta);

    var header = document.querySelector(".site-header");
    if (header) {
      var themeBtn = header.querySelector(".theme-toggle");
      var menuBtn = header.querySelector(".menu-toggle");
      var themeHtml = themeBtn ? themeBtn.outerHTML : "";
      var menuHtml = menuBtn ? menuBtn.outerHTML : "";
      header.innerHTML = renderHeader(P.nav, P.branding.logo) + themeHtml + menuHtml;
    }

    var mnav = document.getElementById("mobile-nav");
    if (mnav) mnav.innerHTML = renderMobileNav(P.mobileNav);

    var main = document.getElementById("top");
    if (!main) return;

    main.innerHTML =
      renderHero(P.hero) +
      renderAbout(P.about) +
      renderExperience(P.experience) +
      renderEducation(P.education) +
      renderSkills(P.skills) +
      renderProjects(P.projects) +
      renderCertSection(P.certifications) +
      renderLanguages(P.languages) +
      renderContact(P.contact);

    var foot = document.querySelector(".site-footer p");
    if (foot) {
      foot.innerHTML =
        '© <span id="year"></span> ' +
        escapeHtml(P.footer.name) +
        " · " +
        escapeHtml(P.footer.suffix);
    }
  }

  global.PortfolioRender = { mount: mount, escapeHtml: escapeHtml };
})(typeof window !== "undefined" ? window : this);
