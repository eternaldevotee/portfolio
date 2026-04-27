(function () {
  "use strict";

  function getPageKey() {
    var body = document.body;
    if (body && body.dataset && body.dataset.page) {
      return body.dataset.page;
    }
    var path = (window.location && window.location.pathname) || "";
    var fileName = path.split("/").pop() || "index.html";
    var base = fileName.toLowerCase().replace(/\.html$/, "");
    return base === "index" ? "home" : base;
  }

  function marqueeText(page) {
    var labels = {
      home: "Welcome :: स्वागत है :: স্বাগতম :: आगमनम्",
      about: "You are viewing the About page.",
      experience: "You are viewing the Experience page.",
      education: "You are viewing the Education page.",
      skills: "You are viewing the Skills page.",
      projects: "You are viewing the Projects page.",
      blogs: "You are viewing the Blogs page.",
      certifications: "You are viewing the Certifications page.",
      languages: "You are viewing the Languages page.",
      contact: "You are viewing the Contact page."
    };
    return labels[page] || labels.home;
  }

  function buildShell(page) {
    var logo = page === "admin" ? "" : '<h1 class="logo">Portfolio</h1>';
    return (
      '<header class="site-header">' +
      '<div class="header-container">' +
      logo +
      '<button type="button" class="theme-toggle-nav" aria-label="Toggle dark/light theme" title="Toggle dark/light theme">' +
      '<span class="theme-toggle-icon">🌙</span>' +
      '</button>' +
      '<nav class="nav" aria-label="Primary">' +
      '<a href="index.html">Home</a>' +
      '<a href="about.html">About</a>' +
      '<a href="experience.html">Experience</a>' +
      '<a href="projects.html">Projects</a>' +
      '<a href="blogs.html">Blogs</a>' +
      '<a href="certifications.html">Certificates</a>' +
      '<a href="languages.html">Languages</a>' +
      '<a href="contact.html" class="nav-cta">Contact</a>' +
      '</nav>' +
      '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">' +
      '<span></span><span></span>' +
      '</button>' +
      '</div>' +
      '</header>' +
      '<div class="marquee-wrap">' +
      '<marquee behavior="scroll" direction="left" scrollamount="10">' + marqueeText(page) + "</marquee>" +
      '</div>' +
      '<div class="nostalgia-bar">' +
      '<span class="blink">NEW!</span>' +
      '<span class="nostalgia-text">Error 404: Expectations not found.</span>' +
      '</div>' +
      '<div class="mobile-nav" id="mobile-nav" hidden></div>' +
      '<main id="top" data-page="' + page + '"></main>' +
      '<footer class="site-footer">' +
      '<div class="footer-clocks">' +
      '<div class="footer-clock-panel">' +
      '<h4>Global Time</h4>' +
      '<div class="clock-grid">' +
      '<div class="clock-pill"><span>USA</span><strong id="clock-us">--:--:--</strong></div>' +
      '<div class="clock-pill"><span>UK</span><strong id="clock-uk">--:--:--</strong></div>' +
      '<div class="clock-pill"><span>Germany</span><strong id="clock-de">--:--:--</strong></div>' +
      '<div class="clock-pill"><span>France</span><strong id="clock-fr">--:--:--</strong></div>' +
      '<div class="clock-pill"><span>Switzerland</span><strong id="clock-ch">--:--:--</strong></div>' +
      '<div class="clock-pill"><span>Japan</span><strong id="clock-jp">--:--:--</strong></div>' +
      '<div class="clock-pill"><span>UAE</span><strong id="clock-ae">--:--:--</strong></div>' +
      '</div>' +
      '</div>' +
      '<div class="footer-currency-panel">' +
      '<h4>Live FX to INR</h4>' +
      '<div class="footer-currency" aria-label="Live currency to INR">' +
      '<span class="currency-pair" id="rate-us">USD/INR loading...</span>' +
      '<span class="currency-pair" id="rate-gb">GBP/INR loading...</span>' +
      '<span class="currency-pair" id="rate-eu">EUR/INR loading...</span>' +
      '<span class="currency-pair" id="rate-ca">CAD/INR loading...</span>' +
      '<span class="currency-pair" id="rate-au">AUD/INR loading...</span>' +
      '<span class="currency-pair" id="rate-nz">NZD/INR loading...</span>' +
      '<span class="currency-pair" id="rate-chf">CHF/INR loading...</span>' +
      '<span class="currency-pair" id="rate-jp">JPY/INR loading...</span>' +
      '<span class="currency-pair" id="rate-ae">AED/INR loading...</span>' +
      '<span class="currency-pair" id="rate-sg">SGD/INR loading...</span>' +
      '<span class="currency-pair" id="rate-cn">CNY/INR loading...</span>' +
      '<span class="currency-pair" id="rate-se">SEK/INR loading...</span>' +
      '<span class="currency-pair" id="rate-no">NOK/INR loading...</span>' +
      '<span class="currency-pair" id="rate-za">ZAR/INR loading...</span>' +
      '<span class="currency-pair" id="rate-hk">HKD/INR loading...</span>' +
      '<span class="currency-pair" id="rate-br">BRL/INR loading...</span>' +
      '<span class="currency-pair" id="rate-mx">MXN/INR loading...</span>' +
      '<span class="currency-pair" id="rate-kr">KRW/INR loading...</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<p>© <span id="year"></span> <span class="footer-sep">|</span> Visitors: <span id="hit-counter">000000</span></p>' +
      '<p id="hit-joke" class="retro-note retro-note--joke">Counting...</p>' +
      '<p class="retro-links"><a href="index.html">Home</a> | <a href="blogs.html">Blogs</a> | <a href="contact.html">Contact</a></p>' +
      '</footer>'
    );
  }

  function mountShell() {
    var host = document.getElementById("site-shell");
    if (!host) return;
    host.innerHTML = buildShell(getPageKey());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountShell);
  } else {
    mountShell();
  }
})();
