(function () {
  "use strict";

  var HIT_KEY = "portfolio-hit-counter";
  var QUOTE_KEY = "portfolio-hit-quote-index";
  var THEME_KEY = "portfolio-theme";
  var RATES_API = "https://open.er-api.com/v6/latest/INR";
  var SUPABASE_URL = "https://vzyomxngqesrpyoqmhec.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_XQx0VnzlHUeDZcXMcBjg7w_RXRMCz5V";
  var VISITOR_LOG_KEY = "portfolio-visitor-logged-v1";
  var supabaseClient = null;
  var VISITOR_QUOTES = [
    "Stats department says: 80% of these visits are me pretending to be different people.",
    "Fun fact: most of these visits are me checking if the site still works.",
    "Analytics update: majority of traffic comes from 'localhost guy'.",
    "Some of you visit often... and by 'you' I mostly mean me.",
    "Powered by curiosity... and frequent refreshes by the developer.",
    "Stats say I should probably stop refreshing this page so much.",
  ];

  function initThemeToggle() {
    var savedTheme = "light";
    try {
      savedTheme = localStorage.getItem(THEME_KEY) || "light";
    } catch (e) {}

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark-mode");
    }

    function updateToggleIcon() {
      var toggleBtn = document.querySelector(".theme-toggle-nav");
      if (!toggleBtn) return;
      var isDark = document.documentElement.classList.contains("dark-mode");
      var icon = isDark ? "☀️" : "🌙";
      toggleBtn.innerHTML = '<span class="theme-toggle-icon">' + icon + '</span>';
    }

    updateToggleIcon();

    document.addEventListener("click", function (event) {
      var toggleBtn = event.target.closest ? event.target.closest(".theme-toggle-nav") : null;
      if (!toggleBtn) return;
      var isDark = document.documentElement.classList.toggle("dark-mode");
      var theme = isDark ? "dark" : "light";
      updateToggleIcon();
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
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
          '<h4 class="cert-card__title">' +
          escapeHtml(c.title) +
          "</h4>" +
          '<p class="cert-card__issuer">' +
          escapeHtml(c.issuer) +
          "</p>" +
          (c.date ? '<p class="cert-card__date">Issued: ' + escapeHtml(c.date) + "</p>" : "") +
          (c.id ? '<p class="cert-card__id">ID: ' + escapeHtml(c.id) + "</p>" : "") +
          '<a class="cert-card__cta" href="' +
          escapeHtml(c.link) +
          '" target="_blank" rel="noopener noreferrer">View certificate</a>' +
          "</article>"
        );
      })
      .join("");
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

  function initCertificateCursorTracking() {
    document.querySelectorAll(".cert-card").forEach(function (card) {
      card.style.position = "relative";
      card.style.overflow = "hidden";

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var angleX = ((rect.height / 2 - (e.clientY - rect.top)) / rect.height) * 12;
        var angleY = (((e.clientX - rect.left) - rect.width / 2) / rect.width) * 12;
        
        card.style.transform = "perspective(1000px) rotateX(" + angleX + "deg) rotateY(" + angleY + "deg)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
      });
    });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    var submitBtn = document.getElementById("contact-submit");
    if (!form || !submitBtn) return;

    var sending = false;
    var status = null;

    function ensureStatus() {
      if (status) return status;
      status = document.createElement("div");
      status.id = "contact-status";
      status.className = "contact-status";
      status.setAttribute("aria-live", "polite");
      var actions = form.querySelector(".contact-actions");
      if (actions && actions.parentNode) {
        actions.parentNode.insertBefore(status, actions);
      } else {
        form.appendChild(status);
      }
      return status;
    }

    function setStatus(type, html) {
      var box = ensureStatus();
      box.className = "contact-status " + (type ? "is-" + type : "");
      box.innerHTML = html;
    }

    function setDisabled(disabled) {
      form.querySelectorAll("input, textarea, button").forEach(function (field) {
        field.disabled = disabled;
      });
      submitBtn.disabled = disabled;
      form.classList.toggle("is-sending", disabled);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        setStatus("error", "Please fill out the missing fields first.");
        return;
      }

      var payload = new FormData(form);
      sending = true;
      setDisabled(true);
      setStatus(
        "loading",
        '<span class="dialup-badge"><span class="hourglass-gif" aria-hidden="true">⌛</span><span>Dialing up internet...</span></span>'
      );
      submitBtn.textContent = "Sending...";

      window.setTimeout(function () {
        fetch(form.action, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: payload,
        })
          .then(function (response) {
            if (!response.ok) {
              return response.json().then(function (payload) {
                var message = payload && payload.errors && payload.errors[0] && payload.errors[0].message;
                throw new Error(message || "There was a problem sending your message.");
              });
            }
            setStatus(
              "success",
              '<span class="success-mark" aria-hidden="true">✓</span><span class="success-text">Connection successful. Message sent.</span><span class="success-modem" aria-hidden="true">56K MODEM</span>'
            );
            form.reset();
          })
          .catch(function (error) {
            setStatus("error", error && error.message ? error.message : "There was a problem sending your message.");
          })
          .finally(function () {
            sending = false;
            setDisabled(false);
            submitBtn.textContent = "Send Message";
          });
      }, 1000);
    });
  }

  function setVisitorQuote() {
    var joke = document.getElementById("hit-joke");
    if (!joke || !VISITOR_QUOTES.length) return;

    var index = 0;
    try {
      index = parseInt(localStorage.getItem(QUOTE_KEY) || "-1", 10);
      if (isNaN(index)) index = -1;
      index = (index + 1) % VISITOR_QUOTES.length;
      localStorage.setItem(QUOTE_KEY, String(index));
    } catch (e) {
      index = Math.floor(Math.random() * VISITOR_QUOTES.length);
    }

    joke.textContent = VISITOR_QUOTES[index];
  }

  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (window.BlogCMS && typeof window.BlogCMS.getClient === "function") {
      supabaseClient = window.BlogCMS.getClient();
      if (supabaseClient) return supabaseClient;
    }
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
      return supabaseClient;
    }
    return null;
  }

  function ensureSupabaseScriptLoaded(onReady) {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      onReady();
      return;
    }
    var existing = document.getElementById("supabase-js-cdn");
    if (existing) return;
    var script = document.createElement("script");
    script.id = "supabase-js-cdn";
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = onReady;
    document.head.appendChild(script);
  }

  function getPageSlug() {
    var body = document.body;
    if (body && body.dataset && body.dataset.page) {
      return String(body.dataset.page || "home");
    }
    return "home";
  }

  function parseUserAgent(ua) {
    var result = { device: "Desktop", browser: "Unknown", os: "Unknown" };
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      result.device = /ipad/i.test(ua) ? "Tablet" : "Mobile";
    } else if (/tablet|ipad|playbook|silk|(win.*arm)/i.test(ua)) {
      result.device = "Tablet";
    }

    if (/edg/i.test(ua)) result.browser = "Edge";
    else if (/chrome|chromium|crios/i.test(ua)) result.browser = "Chrome";
    else if (/firefox/i.test(ua)) result.browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) result.browser = "Safari";
    else if (/opera|opr/i.test(ua)) result.browser = "Opera";

    if (/windows|win32/i.test(ua)) result.os = "Windows";
    else if (/android/i.test(ua)) result.os = "Android";
    else if (/iphone|ios|ipad/i.test(ua)) result.os = "iOS";
    else if (/macintosh|mac os x/i.test(ua)) result.os = "macOS";
    else if (/linux/i.test(ua)) result.os = "Linux";

    return result;
  }

  function updateLocalVisitorCounter(counterEl) {
    var count = parseInt(localStorage.getItem(HIT_KEY) || "0", 10) || 0;
    count += 1;
    try {
      localStorage.setItem(HIT_KEY, String(count));
    } catch (err) {}
    counterEl.textContent = String(Math.max(0, count || 0)).padStart(6, "0");
  }

  function updateVisitorCounter() {
    var counterEl = document.getElementById("hit-counter");
    if (!counterEl) return;

    function renderCount(value) {
      var num = Math.max(0, parseInt(value || "0", 10) || 0);
      counterEl.textContent = String(num).padStart(6, "0");
    }

    var client = getSupabaseClient();
    if (!client) {
      ensureSupabaseScriptLoaded(function () {
        updateVisitorCounter();
      });
      updateLocalVisitorCounter(counterEl);
      return;
    }

    var uaMeta = parseUserAgent((navigator && navigator.userAgent) || "");
    var logVisitPromise = client
      .rpc("log_visitor", {
        p_page_slug: getPageSlug(),
        p_device_type: uaMeta.device,
        p_browser_name: uaMeta.browser,
        p_os_name: uaMeta.os,
        p_referrer: document.referrer || "direct",
      })
      .then(function () {
        try {
          sessionStorage.setItem(VISITOR_LOG_KEY, "1");
        } catch (e1) {}
      })
      .catch(function () {});

    logVisitPromise
      .then(function () {
        return client.rpc("get_visitor_stats", { p_days_back: 36500 });
      })
      .then(function (result) {
        var row = result && result.data && result.data[0] ? result.data[0] : null;
        if (!row) throw new Error("missing visitor stats");
        renderCount(row.total_visits != null ? row.total_visits : 0);
      })
      .catch(function () {
        updateLocalVisitorCounter(counterEl);
      });
  }

  function updateWorldClocks() {
    function put(id, zone) {
      var el = document.getElementById(id);
      if (!el) return;
      try {
        var text = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: zone,
        }).format(new Date());
        el.textContent = text;
      } catch (err) {
        el.textContent = "--:--:--";
      }
    }

    put("clock-us", "America/New_York");
    put("clock-fr", "Europe/Paris");
    put("clock-uk", "Europe/London");
    put("clock-ch", "Europe/Zurich");
    put("clock-de", "Europe/Berlin");
    put("clock-jp", "Asia/Tokyo");
    put("clock-ae", "Asia/Dubai");
  }

  function updateCurrencyToINR() {
    var map = [
      { id: "rate-us", code: "USD" },
      { id: "rate-eu", code: "EUR" },
      { id: "rate-gb", code: "GBP" },
      { id: "rate-ca", code: "CAD" },
      { id: "rate-au", code: "AUD" },
      { id: "rate-nz", code: "NZD" },
      { id: "rate-chf", code: "CHF" },
      { id: "rate-jp", code: "JPY" },
      { id: "rate-ae", code: "AED" },
      { id: "rate-sg", code: "SGD" },
      { id: "rate-cn", code: "CNY" },
      { id: "rate-se", code: "SEK" },
      { id: "rate-no", code: "NOK" },
      { id: "rate-za", code: "ZAR" },
      { id: "rate-hk", code: "HKD" },
      { id: "rate-br", code: "BRL" },
      { id: "rate-mx", code: "MXN" },
      { id: "rate-kr", code: "KRW" },
    ];

    function setFallback() {
      map.forEach(function (entry) {
        var el = document.getElementById(entry.id);
        if (!el) return;
        el.textContent = entry.code + "/INR N/A";
      });
    }

    fetch(RATES_API)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("rates api request failed");
        }
        return response.json();
      })
      .then(function (payload) {
        var rates = payload && payload.rates ? payload.rates : null;
        if (!rates) {
          throw new Error("missing rates payload");
        }

        map.forEach(function (entry) {
          var el = document.getElementById(entry.id);
          if (!el) return;

          var perInr = rates[entry.code];
          if (!perInr || perInr <= 0) {
            el.textContent = entry.code + "/INR N/A";
            return;
          }

          var inr = 1 / perInr;
          el.textContent = entry.code + "/INR " + inr.toFixed(2);
        });
      })
      .catch(function () {
        setFallback();
      });
  }

  function initDnaBackground() {
    if (document.getElementById("neural-network-canvas")) return;

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e0) {}
    if (reduceMotion) return;

    var canvas = document.createElement("canvas");
    canvas.id = "neural-network-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = 0;
    var h = 0;
    var rafId = 0;
    var mouse = { x: -9999, y: -9999 };
    var nodes = [];
    var gridSize = 80;
    var connectionDist = 140;
    var mouseInfluence = 200;

    function resize() {
      w = window.innerWidth || document.documentElement.clientWidth || 1200;
      h = window.innerHeight || document.documentElement.clientHeight || 800;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = [];
      for (var y = -gridSize; y <= h + gridSize; y += gridSize) {
        for (var x = -gridSize; x <= w + gridSize; x += gridSize) {
          nodes.push({
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            pulse: Math.random() * Math.PI * 2
          });
        }
      }
    }

    function updateNodePositions(t) {
      nodes.forEach(function (node) {
        var dx = mouse.x - node.baseX;
        var dy = mouse.y - node.baseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var influence = Math.max(0, mouseInfluence - dist) / mouseInfluence;
        
        node.x = node.baseX + dx * influence * 0.2;
        node.y = node.baseY + dy * influence * 0.2;
        node.pulse += 0.025;
      });
    }

    function drawNetwork() {
      var isDark = document.documentElement.classList.contains("dark-mode");
      var nodeColor = isDark ? "rgba(100, 180, 255, 0.7)" : "rgba(0, 102, 255, 0.6)";
      var lineColor = isDark ? "rgba(80, 160, 255, 0.3)" : "rgba(92, 153, 255, 0.25)";

      nodes.forEach(function (node) {
        var pulseAlpha = 0.5 + Math.sin(node.pulse) * 0.3;
        var nodeColorStr = nodeColor.replace(/, 0\.[0-9]+\)/, ", " + pulseAlpha + ")");
        ctx.fillStyle = nodeColorStr;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      nodes.forEach(function (nodeA, idx) {
        for (var i = idx + 1; i < nodes.length; i += 1) {
          var nodeB = nodes[i];
          var dx = nodeB.x - nodeA.x;
          var dy = nodeB.y - nodeA.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            var alpha = (connectionDist - dist) / connectionDist * 0.8;
            var lineColorStr = lineColor.replace(/, 0\.[0-9]+\)/, ", " + alpha + ")");
            ctx.strokeStyle = lineColorStr;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      });


    }

    function frame(ts) {
      ctx.clearRect(0, 0, w, h);
      updateNodePositions(ts);
      drawNetwork();

      rafId = window.requestAnimationFrame(frame);
    }

    window.addEventListener("mousemove", function (ev) {
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
    });

    window.addEventListener("mouseleave", function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener("resize", resize);

    resize();
    rafId = window.requestAnimationFrame(frame);

    window.addEventListener("beforeunload", function () {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  }

  function boot() {
    initDnaBackground();

    if (typeof PortfolioRender !== "undefined") {
      try {
        PortfolioRender.mount();
      } catch (e0) {}
      if (window.PortfolioComments && typeof window.PortfolioComments.init === "function") {
        try {
          window.PortfolioComments.init();
        } catch (e1) {}
      }
    }


    initThemeToggle();
    var P = window.PORTFOLIO;
    if (P && P.certifications && P.certifications.items) {
      var certs = P.certifications.items;
      renderCerts("all", certs);
      bindCertFilters(certs);
      initCertificateCursorTracking();
    }

    initContactForm();

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    var lastUpdated = document.getElementById("last-updated");
    if (lastUpdated) {
      var d = new Date();
      var mm = String(d.getMonth() + 1).padStart(2, "0");
      var dd = String(d.getDate()).padStart(2, "0");
      var yyyy = String(d.getFullYear());
      lastUpdated.textContent = mm + "/" + dd + "/" + yyyy;
    }

    try {
      updateVisitorCounter();
      setVisitorQuote();
      updateWorldClocks();
      updateCurrencyToINR();
      window.setInterval(updateWorldClocks, 1000);
      window.setInterval(updateCurrencyToINR, 60000);
    } catch (e2) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
