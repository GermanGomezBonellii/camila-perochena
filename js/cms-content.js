/* Public CMS client. It deliberately knows only the stable read-only API. */
(function () {
  "use strict";
  var cached;
  function getContent() {
    if (cached) return cached;
    cached = fetch("/api/public/content", {
      headers: { "Accept": "application/json" },
      credentials: "same-origin"
    }).then(function (response) {
      if (!response.ok) throw new Error("CMS content is temporarily unavailable");
      return response.json();
    }).then(function (content) {
      if (!content || content.version !== 1) throw new Error("Unsupported CMS content version");
      return content;
    }).catch(function (error) {
      cached = null;
      throw error;
    });
    return cached;
  }
  window.CamilaCms = { getContent: getContent };
})();
