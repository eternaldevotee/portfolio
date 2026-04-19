(function () {
  "use strict";

  var MAX_RETRIES = 5;
  var RETRY_DELAY_MS = 400;

  function parseUserAgent(ua) {
    var result = {
      device: "Desktop",
      browser: "Unknown",
      os: "Unknown"
    };

    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      result.device = /ipad/i.test(ua) ? "Tablet" : "Mobile";
    } else if (/tablet|ipad|playbook|silk|(win.*arm)/i.test(ua)) {
      result.device = "Tablet";
    }

    if (/edg/i.test(ua)) {
      result.browser = "Edge";
    } else if (/chrome|chromium|crios/i.test(ua)) {
      result.browser = "Chrome";
    } else if (/firefox/i.test(ua)) {
      result.browser = "Firefox";
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
      result.browser = "Safari";
    } else if (/opera|opr/i.test(ua)) {
      result.browser = "Opera";
    } else if (/trident/i.test(ua)) {
      result.browser = "IE";
    }

    if (/windows|win32/i.test(ua)) {
      result.os = "Windows";
    } else if (/android/i.test(ua)) {
      result.os = "Android";
    } else if (/iphone|ios|ipad/i.test(ua)) {
      result.os = "iOS";
    } else if (/macintosh|mac os x/i.test(ua)) {
      result.os = "macOS";
    } else if (/linux/i.test(ua)) {
      result.os = "Linux";
    }

    return result;
  }

  function getSupabaseClient() {
    if (!window.BlogCMS || typeof window.BlogCMS.getClient !== "function") {
      return null;
    }
    return window.BlogCMS.getClient();
  }

  function logVisitor(attempt) {
    var tries = typeof attempt === "number" ? attempt : 0;
    try {
      var client = getSupabaseClient();

      if (!client) {
        if (tries < MAX_RETRIES) {
          setTimeout(function () {
            logVisitor(tries + 1);
          }, RETRY_DELAY_MS);
        }
        return;
      }

      if (typeof client.rpc !== "function") {
        console.debug("Analytics: client exists but rpc is unavailable");
        return;
      }

      var ua = navigator.userAgent || "Unknown";
      var parsed = parseUserAgent(ua);
      var pageSlug = (document.body && document.body.dataset && document.body.dataset.page) || 
                     window.location.pathname.split("/").pop().replace(/\.html$/, "") || "home";
      var referrer = document.referrer || "direct";

      client
        .rpc("log_visitor", {
          p_page_slug: pageSlug,
          p_device_type: parsed.device,
          p_browser_name: parsed.browser,
          p_os_name: parsed.os,
          p_referrer: referrer
        })
        .then(function () {})
        .catch(function (error) {
          console.debug("Analytics RPC error:", error && error.message ? error.message : "unknown error");
        });
    } catch (err) {
      console.debug("Analytics error:", err && err.message ? err.message : "unknown error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () {
        logVisitor(0);
      }, 250);
    });
  } else {
    setTimeout(function () {
      logVisitor(0);
    }, 250);
  }
})();
