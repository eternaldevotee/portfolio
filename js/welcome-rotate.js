(function () {
  "use strict";

  var texts = [
    { text: "my space", lang: "English" },
    { text: "मेरा स्थान", lang: "Sanskrit" },
    { text: "আমার স্থান", lang: "Bengali" },
    { text: "मेरी जगह", lang: "Hindi" }
  ];

  var currentIndex = 0;

  function rotateWelcomeText() {
    var bannerEl = document.querySelector(".welcome-text");
    if (!bannerEl) return;

    var current = texts[currentIndex];
    
    bannerEl.classList.add("fade-out");
    
    setTimeout(function () {
      bannerEl.textContent = current.text;
      bannerEl.classList.remove("fade-out");
      bannerEl.classList.add("fade-in");
      
      setTimeout(function () {
        bannerEl.classList.remove("fade-in");
      }, 500);
      
      currentIndex = (currentIndex + 1) % texts.length;
    }, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      rotateWelcomeText();
      setInterval(rotateWelcomeText, 2500);
    });
  } else {
    rotateWelcomeText();
    setInterval(rotateWelcomeText, 2500);
  }
})();
