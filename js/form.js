(function (global) {
  "use strict";

  const { Utils } = global.MagnetarScouting;

  const PREF_NUM_FIELDS = new Set(["matchNumber", "teamCode"]);

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

    // Match number + Team code: numeric-only, positive integer, allow empty
    initPrefixedNumberInputs() {
      const bind = (sel) => {
        const inp = Utils.qs(sel);
        if (!inp || inp.dataset.bound === "1") return;
        inp.dataset.bound = "1";

        const sanitize = () => {
          const raw = String(inp.value ?? "").trim();
          if (!raw.length) return; // allow empty

          // strip anything non-digit (some browsers allow e/E/+/- even in type=number)
          const digits = raw.replace(/[^\d]/g, "");
          if (!digits.length) {
            inp.value = "";
            return;
          }

          // positive int
          const n = Utils.clampInt(digits, 1);
          inp.value = String(n);
        };

        inp.addEventListener("input", sanitize);
        inp.addEventListener("change", sanitize);

        // prevent wheel changing it while scrolling
        inp.addEventListener("wheel", (e) => {
          if (document.activeElement === inp) e.preventDefault();
        }, { passive: false });
      };

      bind("#matchNumber");
      bind("#teamCode");
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
          // special: matchNumber/teamCode should be "" when empty, otherwise positive int string
          if (PREF_NUM_FIELDS.has(el.name)) {
            const raw = String(el.value ?? "").trim();
            if (!raw.length) {
              data[el.name] = "";
            } else {
              const digits = raw.replace(/[^\d]/g, "");
              data[el.name] = digits.length ? String(Utils.clampInt(digits, 1)) : "";
            }
            continue;
          }

          // counters
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

        if (el.type === "radio" || el.type === "checkbox") {
          el.checked = false;
          continue;
        }

        if (el.type === "number") {
          // counters reset to 0, match/team code reset to empty
          el.value = PREF_NUM_FIELDS.has(el.name) ? "" : "0";
          continue;
        }

        el.value = "";
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

    // required fields check (teamCode is NOT required)
    validateRequired() {
      const d = Form.getData();
      const missing = [];

      if (!d.scouterInitials) missing.push("scouterInitials");
      if (!d.eventName) missing.push("eventName");
      if (!d.matchLevel) missing.push("matchLevel");

      const mn = String(d.matchNumber ?? "").trim();
      if (!mn || Utils.clampInt(mn, 1) < 1) missing.push("matchNumber");

      if (!d.robotPosition) missing.push("robotPosition");

      return { ok: missing.length === 0, missing };
    }
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.Form = Form;

})(window);
