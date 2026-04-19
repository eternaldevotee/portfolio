(function () {
  "use strict";

  var HIT_KEY = "portfolio-hit-counter";
  var QUOTE_KEY = "portfolio-hit-quote-index";
  var COUNT_API = "https://api.countapi.xyz/hit/subham-portfolio/site";
  var RATES_API = "https://open.er-api.com/v6/latest/INR";
  var VISITOR_QUOTES = [
    "Stats department says: 80% of these visits are me pretending to be different people.",
    "Fun fact: most of these visits are me checking if the site still works.",
    "Analytics update: majority of traffic comes from 'localhost guy'.",
    "Some of you visit often... and by 'you' I mostly mean me.",
    "Powered by curiosity... and frequent refreshes by the developer.",
    "Stats say I should probably stop refreshing this page so much.",
  ];

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

  function updateVisitorCounter() {
    var counterEl = document.getElementById("hit-counter");
    if (!counterEl) return;

    function renderCount(value) {
      var num = Math.max(0, parseInt(value || "0", 10) || 0);
      counterEl.textContent = String(num).padStart(6, "0");
    }

    var count = 0;
    try {
      count = parseInt(localStorage.getItem(HIT_KEY) || "0", 10);
    } catch (e) {
      count = 0;
    }
    count += 1;
    try {
      localStorage.setItem(HIT_KEY, String(count));
    } catch (e2) {}
    renderCount(count);
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
      { id: "rate-us", code: "USD", label: "$/₹ USD/INR" },
      { id: "rate-eu", code: "EUR", label: "€/₹ EUR/INR" },
      { id: "rate-gb", code: "GBP", label: "£/₹ GBP/INR" },
      { id: "rate-ca", code: "CAD", label: "C$/₹ CAD/INR" },
      { id: "rate-au", code: "AUD", label: "A$/₹ AUD/INR" },
      { id: "rate-chf", code: "CHF", label: "CHF/₹ CHF/INR" },
      { id: "rate-jp", code: "JPY", label: "¥/₹ JPY/INR" },
      { id: "rate-ae", code: "AED", label: "AED/₹ AED/INR" },
      { id: "rate-sg", code: "SGD", label: "S$/₹ SGD/INR" },
      { id: "rate-cn", code: "CNY", label: "¥/₹ CNY/INR" },
    ];

    function setFallback() {
      map.forEach(function (entry) {
        var el = document.getElementById(entry.id);
        if (!el) return;
        el.textContent = entry.label + ": N/A";
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
            el.textContent = entry.label + ": N/A";
            return;
          }

          var inr = 1 / perInr;
          el.textContent = entry.label + ": " + inr.toFixed(2);
        });
      })
      .catch(function () {
        setFallback();
      });
  }

  function boot() {
    if (typeof PortfolioRender !== "undefined") {
      PortfolioRender.mount();
      if (window.PortfolioComments && typeof window.PortfolioComments.init === "function") {
        window.PortfolioComments.init();
      }
    }

    var P = window.PORTFOLIO;
    if (P && P.certifications && P.certifications.items) {
      var certs = P.certifications.items;
      renderCerts("all", certs);
      bindCertFilters(certs);
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

    updateVisitorCounter();
    setVisitorQuote();
    updateWorldClocks();
    updateCurrencyToINR();
    window.setInterval(updateWorldClocks, 1000);
    window.setInterval(updateCurrencyToINR, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
