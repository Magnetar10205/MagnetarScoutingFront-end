(function (global) {
  "use strict";
  const APP = "MagnetarScouting";
  const DRAFT_KEY = "magnetar_scouting_draft_v1";
  const REFRESH_WARN_KEY = "magnetar_refresh_warn_enabled";
  const AutoSave = {
    state: { saveTimer: null, suppressUntil: 0, initialized: false },
    get Form() {
      return global[APP] && global[APP].Form ? global[APP].Form : null;
    },
    get UI() {
      return global[APP] && global[APP].UI ? global[APP].UI : null;
    },
    get I18N() {
      return global[APP] && global[APP].I18N ? global[APP].I18N : null;
    },
    init() {
      if (AutoSave.state.initialized) return true;
      const Form = AutoSave.Form;
      const UI = AutoSave.UI;
      if (!Form || !UI || !UI.els || !UI.els.card) {
        return false;
      }
      AutoSave.state.initialized = true;
      AutoSave.restoreDraft();
      AutoSave.bindEvents();
      AutoSave.initRefreshWarnSetting();
      return true;
    },
    waitForApp(tries) {
      tries = tries || 0;
      if (AutoSave.init()) return;
      if (tries > 120) return;
      setTimeout(function () {
        AutoSave.waitForApp(tries + 1);
      }, 50);
    },
    bindEvents() {
      const UI = AutoSave.UI;
      const card = UI && UI.els ? UI.els.card : null;
      if (!card) return;
      const schedule = function () {
        AutoSave.scheduleSave();
      };
      card.addEventListener("input", schedule, true);
      card.addEventListener("change", schedule, true);
      document.addEventListener("click", schedule, true);
      document.addEventListener("pointerup", schedule, true);
      document.addEventListener("touchend", schedule, true);
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
          AutoSave.saveNow();
        }
      });
      window.addEventListener("beforeunload", function (e) {
        if (!AutoSave.isRefreshWarnEnabled()) return;
        if (!AutoSave.hasMeaningfulData()) return;

        AutoSave.saveNow();
        e.preventDefault();
        e.returnValue = "";
      });
      const btnReset = document.getElementById("btnReset");
      if (btnReset) {
        btnReset.addEventListener(
          "click",
          function () {
            AutoSave.state.suppressUntil = Date.now() + 500;
            setTimeout(function () {
              AutoSave.clearDraft();
            }, 0);
          },
          true,
        );
      }
    },
    scheduleSave() {
      if (Date.now() < AutoSave.state.suppressUntil) return;
      if (AutoSave.state.saveTimer) {
        clearTimeout(AutoSave.state.saveTimer);
      }
      AutoSave.state.saveTimer = setTimeout(function () {
        AutoSave.saveNow();
      }, 180);
    },
    buildDraft() {
      const Form = AutoSave.Form;
      const UI = AutoSave.UI;
      if (!Form || !UI) return null;
      const langSelect = document.getElementById("langSelect");
      const dataOutput = document.getElementById("dataOutput");
      const autoStart =
        UI.state && UI.state.autoStart
          ? {
              flipped: !!UI.state.autoStart.flipped,
              selection: UI.state.autoStart.selection
                ? {
                    x: UI.state.autoStart.selection.x,
                    y: UI.state.autoStart.selection.y,
                    zone: UI.state.autoStart.selection.zone,
                  }
                : null,
            }
          : null;
      const autoShots =
        UI.state && UI.state.autoShots
          ? {
              flipped: !!UI.state.autoShots.flipped,
              points: Array.isArray(UI.state.autoShots.points)
                ? UI.state.autoShots.points.map(function (p) {
                    return { x: p.x, y: p.y, zone: p.zone };
                  })
                : [],
            }
          : null;
      const teleShots =
        UI.state && UI.state.teleShots
          ? {
              flipped: !!UI.state.teleShots.flipped,
              points: Array.isArray(UI.state.teleShots.points)
                ? UI.state.teleShots.points.map(function (p) {
                    return { x: p.x, y: p.y, zone: p.zone };
                  })
                : [],
            }
          : null;
      return {
        version: 1,
        savedAt: new Date().toISOString(),
        lang: langSelect ? langSelect.value : "tr",
        pageIndex:
          UI.state && typeof UI.state.idx === "number" ? UI.state.idx : 0,
        formData: Form.getData(),
        autoStart: autoStart,
        autoShots: autoShots,
        teleShots: teleShots,
        dataOutput: dataOutput ? dataOutput.value : "",
      };
    },
    saveNow() {
      if (Date.now() < AutoSave.state.suppressUntil) return;
      const draft = AutoSave.buildDraft();
      if (!draft) return;
      if (!AutoSave.hasMeaningfulData(draft)) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (err) {
        console.warn("AutoSave: could not save draft", err);
      }
    },
    loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (err) {
        console.warn("AutoSave: could not load draft", err);
        return null;
      }
    },
    clearDraft() {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {
        console.warn("AutoSave: could not clear draft", err);
      }
    },
    loadRefreshWarnPreference() {
      const raw = localStorage.getItem(REFRESH_WARN_KEY);
      return raw === null ? true : raw === "1";
    },

    setRefreshWarnEnabled(enabled) {
      localStorage.setItem(REFRESH_WARN_KEY, enabled ? "1" : "0");
    },

    isRefreshWarnEnabled() {
      return AutoSave.loadRefreshWarnPreference();
    },

    initRefreshWarnSetting() {
      const toggle = document.getElementById("refreshWarnToggle");
      if (!toggle) return;

      toggle.checked = AutoSave.loadRefreshWarnPreference();

      const Form = AutoSave.Form;
      if (Form && typeof Form.syncSwitchVisuals === "function") {
        Form.syncSwitchVisuals();
      }

      toggle.addEventListener("change", function () {
        AutoSave.setRefreshWarnEnabled(!!toggle.checked);

        const FormNow = AutoSave.Form;
        if (FormNow && typeof FormNow.syncSwitchVisuals === "function") {
          FormNow.syncSwitchVisuals();
        }
      });
    },
    restoreDraft() {
      const draft = AutoSave.loadDraft();
      if (!draft) return;
      const Form = AutoSave.Form;
      const UI = AutoSave.UI;
      const I18N = AutoSave.I18N;
      if (!Form || !UI) return;
      if (draft.lang && I18N && typeof I18N.apply === "function") {
        const langSelect = document.getElementById("langSelect");
        if (langSelect) langSelect.value = draft.lang;
        I18N.apply(draft.lang);
        if (typeof UI.refreshStepTitles === "function") {
          UI.refreshStepTitles();
        }
      }
      AutoSave.restoreFormData(draft.formData || {});
      if (typeof Form.syncSwitchVisuals === "function") {
        Form.syncSwitchVisuals();
      }
      if (typeof Form.clampAllCounters === "function") {
        Form.clampAllCounters();
      }
      AutoSave.restoreAutoStart(draft.autoStart);
      AutoSave.restoreShotMap("autoShots", draft.autoShots);
      AutoSave.restoreShotMap("teleShots", draft.teleShots);
      const dataOutput = document.getElementById("dataOutput");
      if (dataOutput && typeof draft.dataOutput === "string") {
        dataOutput.value = draft.dataOutput;
      }
      if (typeof UI.updateAutoStartMarker === "function") {
        UI.updateAutoStartMarker();
      }
      if (typeof UI.updateAutoStartReadout === "function") {
        UI.updateAutoStartReadout();
      }
      if (typeof UI.updateAutoShotsMarkers === "function") {
        UI.updateAutoShotsMarkers();
      }
      if (typeof UI.updateAutoShotsReadout === "function") {
        UI.updateAutoShotsReadout();
      }
      if (typeof UI.updateTeleShotsMarkers === "function") {
        UI.updateTeleShotsMarkers();
      }
      if (typeof UI.updateTeleShotsReadout === "function") {
        UI.updateTeleShotsReadout();
      }
      const pageIndex =
        typeof draft.pageIndex === "number" && draft.pageIndex >= 0
          ? draft.pageIndex
          : 0;
      if (typeof UI.go === "function") {
        UI.go(pageIndex);
      }
      if (typeof UI.renderSummary === "function") {
        UI.renderSummary();
      }
      if (typeof UI.toast === "function") {
        UI.toast("Taslak geri yüklendi.");
      }
    },
    restoreFormData(formData) {
      if (!formData || typeof formData !== "object") return;
      Object.keys(formData).forEach(function (name) {
        const value = formData[name];
        const els = Array.prototype.slice.call(
          document.querySelectorAll('[name="' + name + '"]'),
        );
        if (!els.length) return;
        const first = els[0];
        if (first.type === "radio") {
          els.forEach(function (el) {
            el.checked = el.value === value;
          });
          return;
        }
        if (first.type === "checkbox") {
          first.checked = !!value;
          return;
        }
        first.value = value == null ? "" : value;
      });
    },
    restoreAutoStart(saved) {
      const UI = AutoSave.UI;
      if (!UI || !UI.state || !UI.state.autoStart) return;
      const current = UI.state.autoStart;
      current.flipped = !!(saved && saved.flipped);
      current.selection =
        saved && saved.selection
          ? {
              x: saved.selection.x,
              y: saved.selection.y,
              zone: saved.selection.zone,
            }
          : null;
      current.history = [];
      const xEl = document.getElementById("autoStartX");
      const yEl = document.getElementById("autoStartY");
      if (current.selection) {
        if (xEl)
          xEl.value = Number(current.selection.x).toFixed(current.prec || 3);
        if (yEl)
          yEl.value = Number(current.selection.y).toFixed(current.prec || 3);
      } else {
        if (xEl) xEl.value = "";
        if (yEl) yEl.value = "";
      }
      const box = UI.els && UI.els.autoStartMap ? UI.els.autoStartMap : null;
      if (box) {
        box.classList.toggle("flipped", !!current.flipped);
      }
    },
    restoreShotMap(key, saved) {
      const UI = AutoSave.UI;
      if (!UI || !UI.state || !UI.state[key]) return;
      const current = UI.state[key];
      current.flipped = !!(saved && saved.flipped);
      current.points =
        saved && Array.isArray(saved.points)
          ? saved.points.map(function (p) {
              return { x: p.x, y: p.y, zone: p.zone };
            })
          : [];
      current.history = [];
      current.drag =
        typeof UI._newShotDragState === "function"
          ? UI._newShotDragState()
          : {
              active: false,
              pointerId: null,
              idx: -1,
              startClientX: 0,
              startClientY: 0,
              moved: false,
              historyPushed: false,
              snapshot: null,
              suppressClickUntil: 0,
            };
      const hidden =
        key === "autoShots"
          ? document.getElementById("autoShotsXY")
          : document.getElementById("teleShotsXY");
      if (hidden) {
        hidden.value = current.points.length
          ? current.points
              .map(function (p) {
                return (
                  Number(p.x).toFixed(current.prec || 3) +
                  "," +
                  Number(p.y).toFixed(current.prec || 3)
                );
              })
              .join("|")
          : "";
      }
      const box =
        key === "autoShots"
          ? UI.els && UI.els.autoShotsMap
            ? UI.els.autoShotsMap
            : null
          : UI.els && UI.els.teleShotsMap
            ? UI.els.teleShotsMap
            : null;
      if (box) {
        box.classList.toggle("flipped", !!current.flipped);
      }
    },
    hasMeaningfulData(draft) {
      const d = draft || AutoSave.buildDraft();
      if (!d) return false;
      const fd = d.formData || {};
      for (const key in fd) {
        if (!Object.prototype.hasOwnProperty.call(fd, key)) continue;
        const value = fd[key];
        if (typeof value === "boolean") {
          if (value) return true;
          continue;
        }
        const s = String(value == null ? "" : value).trim();
        if (!s) continue;
        const isZeroLike =
          s === "0" &&
          [
            "matchNumber",
            "teamCode",
            "autoStartX",
            "autoStartY",
            "autoShotsXY",
            "teleShotsXY",
          ].indexOf(key) === -1;
        if (!isZeroLike) return true;
      }
      if (d.autoStart && d.autoStart.selection) return true;
      if (
        d.autoShots &&
        Array.isArray(d.autoShots.points) &&
        d.autoShots.points.length
      )
        return true;
      if (
        d.teleShots &&
        Array.isArray(d.teleShots.points) &&
        d.teleShots.points.length
      )
        return true;
      if (String(d.dataOutput || "").trim()) return true;
      return false;
    },
  };
  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.AutoSave = AutoSave;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      AutoSave.waitForApp();
    });
  } else {
    AutoSave.waitForApp();
  }
})(window);
