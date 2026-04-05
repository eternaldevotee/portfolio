(function () {
  "use strict";

  var THEME_KEY = "portfolio-theme";

  function applyTheme(theme) {
    var isLight = theme === "light";
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    try {
      localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    } catch (e) {}
    var meta = document.getElementById("meta-theme");
    if (meta) meta.setAttribute("content", isLight ? "#f0f4f8" : "#05060a");
    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
      btn.setAttribute("title", isLight ? "Use night theme" : "Use daylight theme");
    }
  }

  function initThemeToggle() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var t = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(t);
    btn.addEventListener("click", function () {
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      applyTheme(isLight ? "dark" : "light");
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function renderCerts(filter, certifications) {
    var grid = document.getElementById("cert-grid");
    if (!grid) return;
    var show = filter === "all" ? certifications : certifications.filter(function (c) {
      return c.cats.indexOf(filter) !== -1;
    });
    grid.innerHTML = show
      .map(function (c) {
        return (
          '<article class="card tile-card cert-card" data-cats="' +
          c.cats.join(" ") +
          '">' +
          '<div class="tile-card__glow" aria-hidden="true"></div>' +
          '<div class="tile-card__shine" aria-hidden="true"></div>' +
          '<header class="cert-card__head">' +
          '<span class="cert-card__badge" aria-hidden="true">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 2L4 6v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V6l-8-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
          '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          "</svg></span></header>" +
          '<h4 class="cert-card__title">' +
          escapeHtml(c.title) +
          "</h4>" +
          '<p class="cert-card__issuer">' +
          escapeHtml(c.issuer) +
          "</p>" +
          (c.date
            ? '<p class="cert-card__date"><span class="cert-card__date-label">Issued</span> ' +
              escapeHtml(c.date) +
              "</p>"
            : "") +
          (c.id
            ? '<p class="cert-card__id"><span class="cert-card__id-label">ID</span> ' +
              escapeHtml(c.id) +
              "</p>"
            : "") +
          '<a class="cert-card__cta" href="' +
          escapeHtml(c.link) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<span class="cert-card__cta-text">Verify credential</span>' +
          '<span class="cert-card__cta-arrow" aria-hidden="true">↗</span></a></article>'
        );
      })
      .join("");
    grid.querySelectorAll(".cert-card").forEach(function (el, i) {
      el.style.animationDelay = Math.min(i * 0.04, 0.6) + "s";
    });
  }

  function bindCertFilters(certifications) {
    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        renderCerts(btn.getAttribute("data-filter") || "all", certifications);
      });
    });
  }

  function initTilt() {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var tiltEls = document.querySelectorAll("[data-tilt]");
    var enableTilt = !prefersReduced && window.matchMedia("(min-width: 900px)").matches;
    tiltEls.forEach(function (el) {
      if (!enableTilt) return;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var px = (x / r.width - 0.5) * 2;
        var py = (y / r.height - 0.5) * 2;
        el.style.transform =
          "perspective(1000px) rotateY(" + px * 4 + "deg) rotateX(" + -py * 4 + "deg) translateZ(0)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.getElementById("mobile-nav");
    if (!toggle || !mobileNav) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      if (open) mobileNav.setAttribute("hidden", "");
      else mobileNav.removeAttribute("hidden");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("hidden", "");
      });
    });
  }

  function initStatCounter() {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var stat = document.querySelector("[data-count]");
    if (!stat || prefersReduced) return;
    var target = parseFloat(stat.getAttribute("data-count") || "0");
    var start = 0;
    var dur = 1200;
    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = start + (target - start) * eased;
      stat.textContent = val.toFixed(2);
      if (p < 1) requestAnimationFrame(frame);
    }
    var ioStat = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            requestAnimationFrame(frame);
            ioStat.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    ioStat.observe(stat);
  }

  function boot() {
    if (typeof PortfolioRender !== "undefined") {
      PortfolioRender.mount();
    }

    var P = window.PORTFOLIO;
    if (!P || !P.certifications || !P.certifications.items) {
      console.warn("PORTFOLIO.certifications.items missing.");
    } else {
      var certs = P.certifications.items;
      renderCerts("all", certs);
      bindCertFilters(certs);
    }

    initThemeToggle();
    initTilt();
    initMobileNav();

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    initStatCounter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
