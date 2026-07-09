/* Blueprint prototype — content loader.
 * Source of truth is /content.json (edited via the CMS at /admin, versioned in git).
 * The JSON is grouped by screen ({ global: {...}, today: {...}, ... }); we flatten
 * it into one key -> text map and inject into [data-content] / [data-content-placeholder]
 * slots. Newlines become <br>; values may contain intentional inline HTML. */
(function () {
  fetch('/content.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var d = {};
      Object.keys(data).forEach(function (group) {
        var obj = data[group];
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(function (k) { d[k] = obj[k]; });
        }
      });
      window._content = d;
      document.querySelectorAll('[data-content]').forEach(function (el) {
        var key = el.getAttribute('data-content');
        if (d[key] != null) el.innerHTML = String(d[key]).replace(/\n/g, '<br>');
      });
      document.querySelectorAll('[data-content-placeholder]').forEach(function (el) {
        var key = el.getAttribute('data-content-placeholder');
        if (d[key] != null) el.placeholder = String(d[key]);
      });
    })
    .catch(function () { /* offline / missing json: keep hardcoded HTML defaults */ });
})();
