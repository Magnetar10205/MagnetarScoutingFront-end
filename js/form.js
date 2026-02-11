// js/form.js
(function (global) {
  "use strict";

  const { Utils } = global.MagnetarScouting;

  const Form = {
    initEnhancedInputs(root = document) {
      // counters
      Utils.qsa("[data-counter]", root).forEach(wrap => {
        if (wrap.dataset.bound === "1") return;
        wrap.dataset.bound = "1";

        const dec = Utils.qs(".dec", wrap);
        const inc = Utils.qs(".inc", wrap);
        const input = Utils.qs("input[type='number']", wrap);

        const clamp = () => { input.value = String(Utils.clampInt(input.value, 0)); };

        dec.addEventListener("click", () => { input.value = String(Utils.clampInt(input.value, 0) - 1); clamp(); });
        inc.addEventListener("click", () => { input.value = String(Utils.clampInt(input.value, 0) + 1); clamp(); });
        input.addEventListener("input", clamp);
        clamp();
      });

      // switches
      Utils.qsa("[data-switch]", root).forEach(sw => {
        if (sw.dataset.bound === "1") return;
        sw.dataset.bound = "1";

        const input = Utils.qs("input[type='checkbox']", sw);
        const sync = () => sw.classList.toggle("on", !!input.checked);

        sw.addEventListener("click", (e) => {
          if (e.target?.tagName?.toLowerCase() === "input") return;
          input.checked = !input.checked;
          sync();
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });

        input.addEventListener("change", sync);
        sync();
      });
    },

    getData() {
      const data = {};
      const els = Utils.qsa("input, textarea, select");

      for (const el of els) {
        if (!el.name) continue;

        if (el.type === "radio") {
          if (el.checked) data[el.name] = el.value;
          else if (!(el.name in data)) data[el.name] = "";
          continue;
        }

        if (el.type === "checkbox") {
          data[el.name] = !!el.checked;
          continue;
        }

        if (el.type === "number") {
          data[el.name] = Utils.clampInt(el.value, 0);
          continue;
        }

        data[el.name] = (el.value || "").trim();
      }

      return data;
    },

    clear() {
      const els = Utils.qsa("input, textarea, select");
      for (const el of els) {
        if (!el.name) continue;
        if (el.type === "radio" || el.type === "checkbox") el.checked = false;
        else if (el.type === "number") el.value = "0";
        else el.value = "";
      }
      Form.syncSwitchVisuals();
      Form.clampAllCounters();
    },

    clampAllCounters() {
      Utils.qsa("[data-counter] input[type='number']").forEach(inp => {
        inp.value = String(Utils.clampInt(inp.value, 0));
      });
    },

    syncSwitchVisuals() {
      Utils.qsa("[data-switch]").forEach(sw => {
        const input = Utils.qs("input[type='checkbox']", sw);
        sw.classList.toggle("on", !!input.checked);
      });
    },

    // for i18n
    validateRequired() {
      const d = Form.getData();
      const missing = [];
      if (!d.scouterInitials) missing.push("scouterInitials");
      if (!d.eventName) missing.push("eventName");
      if (!d.matchLevel) missing.push("matchLevel");
      if (!d.matchNumber) missing.push("matchNumber");
      if (!d.robotPosition) missing.push("robotPosition");
      return { ok: missing.length === 0, missing };
    },

    sanitizeMatchNumber() {
      const inp = Utils.qs("#matchNumber");
      if (!inp) return;
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/[^\d#]/g, "");
      });
    }
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.Form = Form;

})(window);
