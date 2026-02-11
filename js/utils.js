// js/utils.js
(function (global) {
  "use strict";

  const Utils = {
    qs(sel, root = document) { return root.querySelector(sel); },
    qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },

    escapeHtml(s) {
      return String(s ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    },

    clampInt(n, min = 0, max = Number.MAX_SAFE_INTEGER) {
      const v = Number(n);
      if (!Number.isFinite(v)) return min;
      return Math.max(min, Math.min(max, Math.trunc(v)));
    }
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.Utils = Utils;

})(window);
