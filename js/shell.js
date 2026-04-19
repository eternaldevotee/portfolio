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

  function asciiMarkup() {
      return '<p class="construction-inline" aria-label="Under construction" aria-live="polite">under construction</p>';
  }

  function buildShell(page) {
    var showAscii = page === "home";
    return (
      '<header class="site-header">' +
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
      '</header>' +
      '<div class="marquee-wrap">' +
      '<marquee behavior="scroll" direction="left" scrollamount="10">' + marqueeText(page) + "</marquee>" +
      '</div>' +
      '<div class="nostalgia-bar">' +
      '<span class="blink">NEW!</span>' +
      '<span class="nostalgia-text">Error 404: Expectations not found.</span>' +
      '</div>' +
      (showAscii ? asciiMarkup() : "") +
      '<div class="mobile-nav" id="mobile-nav" hidden></div>' +
      '<main id="top" data-page="' + page + '"></main>' +
      '<footer class="site-footer">' +
      '<div class="footer-clocks">' +
      '<div class="footer-clock-column left">' +
      '<div class="footer-clock-group">' +
      'USA: <span id="clock-us">--:--:--</span> | UK: <span id="clock-uk">--:--:--</span> | Germany: <span id="clock-de">--:--:--</span>' +
      '</div>' +
      '<div class="footer-currency" aria-label="Live currency to INR left">' +
      '<span class="currency-pair" id="rate-us">$/₹ USD/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-gb">£/₹ GBP/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-eu">€/₹ EUR/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-ca">C$/₹ CAD/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-au">A$/₹ AUD/INR: loading...</span>' +
      '</div>' +
      '</div>' +
      '<div class="footer-clock-column right">' +
      '<div class="footer-clock-group">' +
      'France: <span id="clock-fr">--:--:--</span> | Switzerland: <span id="clock-ch">--:--:--</span> | Japan: <span id="clock-jp">--:--:--</span> | UAE: <span id="clock-ae">--:--:--</span>' +
      '</div>' +
      '<div class="footer-currency" aria-label="Live currency to INR right">' +
      '<span class="currency-pair" id="rate-chf">CHF/₹ CHF/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-jp">¥/₹ JPY/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-ae">AED/₹ AED/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-sg">S$/₹ SGD/INR: loading...</span> ' +
      '<span class="currency-pair" id="rate-cn">¥/₹ CNY/INR: loading...</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<p>© <span id="year"></span> <span class="footer-sep">|</span> Visitors: <span id="hit-counter">000000</span></p>' +
      '<p id="hit-joke" class="retro-note retro-note--joke">Counting...</p>' +
      '<p class="retro-links"><a href="index.html">Home</a> | <a href="blogs.html">Blogs</a> | <a href="contact.html">Contact</a></p>' +
      '<p class="retro-note">This page is under construction. Last updated: <span id="last-updated"></span></p>' +
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
