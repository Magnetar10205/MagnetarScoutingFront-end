// js/ui.js
(function (global) {
  "use strict";

  const { Utils, Form, I18N } = global.MagnetarScouting;

  const UI = {
    state: { idx: 0 },
    els: {},

    init() {
      UI.cacheEls();
      UI.buildSteps();
      UI.bindNav();
      UI.bindGetData();
      UI.bindLiveSummary();
      UI.bindSettings();
      UI.bindSwipe();
    },

    cacheEls() {
      UI.els.pages = Utils.qsa(".page");
      UI.els.steps = Utils.qs("#steps");
      UI.els.card = Utils.qs("#card");

      UI.els.btnPrev = Utils.qs("#btnPrev");
      UI.els.btnNext = Utils.qs("#btnNext");
      UI.els.navCenter = Utils.qs("#navCenter");

      UI.els.btnReset = Utils.qs("#btnReset");
      UI.els.toast = Utils.qs("#toast");

      UI.els.summary = Utils.qs("#summary");
      UI.els.dataOutput = Utils.qs("#dataOutput");
      UI.els.btnGetData = Utils.qs("#btnGetData");
      UI.els.btnCopyData = Utils.qs("#btnCopyData");

      UI.els.btnSettings = Utils.qs("#btnSettings");
      UI.els.settingsModal = Utils.qs("#settingsModal");
      UI.els.btnCloseSettings = Utils.qs("#btnCloseSettings");
      UI.els.langSelect = Utils.qs("#langSelect");
    },

    toast(msg) {
      const t = UI.els.toast;
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(UI.toast._t);
      UI.toast._t = setTimeout(() => t.classList.remove("show"), 2400);
    },

    buildSteps() {
      const steps = UI.els.steps;
      steps.innerHTML = "";
      UI.els.pages.forEach((p, i) => {
        const d = document.createElement("div");
        d.className = "dot" + (i === 0 ? " active" : "");
        d.title = p.dataset.title || `Page ${i + 1}`;
        d.addEventListener("click", () => UI.go(i));
        steps.appendChild(d);
      });
    },

    refreshStepTitles() {
      const dots = Utils.qsa(".dot", UI.els.steps);
      UI.els.pages.forEach((p, i) => {
        if (dots[i]) dots[i].title = p.dataset.title || `Page ${i + 1}`;
      });
    },

    go(i) {
      const pages = UI.els.pages;
      UI.state.idx = Math.max(0, Math.min(pages.length - 1, i));

      pages.forEach((p, k) => p.classList.toggle("active", k === UI.state.idx));
      Utils.qsa(".dot", UI.els.steps).forEach((d, k) => d.classList.toggle("active", k === UI.state.idx));

      UI.els.btnPrev.disabled = UI.state.idx === 0;
      UI.els.btnNext.disabled = UI.state.idx === pages.length - 1;

      UI.els.navCenter.textContent = I18N.format("navPage", { cur: UI.state.idx + 1, total: pages.length });

      if (UI.state.idx === pages.length - 1) UI.renderSummary();
    },

    prev() { UI.go(UI.state.idx - 1); },
    next() { UI.go(UI.state.idx + 1); },

    bindNav() {
      UI.els.btnPrev.addEventListener("click", UI.prev);
      UI.els.btnNext.addEventListener("click", UI.next);

      UI.els.btnReset.addEventListener("click", () => {
        Form.clear();
        UI.go(0);
        UI.els.dataOutput.value = "";
        UI.toast(I18N.t("toastCleared"));
      });
    },

    bindLiveSummary() {
      document.addEventListener("input", () => {
        if (UI.state.idx === UI.els.pages.length - 1) UI.renderSummary();
      });
      document.addEventListener("change", () => {
        if (UI.state.idx === UI.els.pages.length - 1) UI.renderSummary();
      });
    },

    // -------- DATA LOGIC --------
    // - Text / non-boolean radios: empty => "na"
    // - Counters: always numeric (0..)
    // - Checkboxes: checked => "1", unchecked => "0"
    // - Yes/No radios: yes => "1", no => "0", empty => "na"
    serialize() {
      const d = Form.getData();

      const cleanText = (s) =>
        String(s ?? "")
          .replaceAll(";", ",")
          .replaceAll("\n", " ")
          .replaceAll("\r", " ")
          .trim();

      const fillNA = (s) => {
        const t = cleanText(s);
        return t.length ? t : "na";
      };

      // checkbox: true -> 1, false -> 0
      const yes01 = (boolVal) => (boolVal === true ? "1" : "0");

      // yes/no radio: yes -> 1, no -> 0, empty/other -> na
      const yesNoTo = (val) => (val === "yes" ? "1" : (val === "no" ? "0" : "na"));

      const initials = fillNA(cleanText(d.scouterInitials).replace(/\s+/g, "").toUpperCase());
      const eventName = fillNA(d.eventName);
      const matchNumber = fillNA(cleanText(d.matchNumber).replaceAll("#", ""));

      // matchLevel: quals->qm, finals->f
      const matchLevelMap = { quals: "qm", finals: "f" };
      const matchLevel = fillNA(matchLevelMap[d.matchLevel] || d.matchLevel);

      // robotPosition already r1/r2/... -> output same
      const robotPos = fillNA(d.robotPosition);

      // level1Climb: climbed/attempted/failed -> c/t/n
      const level1Map = { climbed: "c", attempted: "t", failed: "n" };
      const level1 = fillNA(level1Map[d.level1Climb] || d.level1Climb);

      // driverSkill -> 0/1/2/x
      const driverMap = { ineffective: "0", average: "1", effective: "2", unobserved: "x" };
      const driver = fillNA(driverMap[d.driverSkill] || d.driverSkill);

      // defenseRating -> 1..4, none->0
      const defenseMap = { none: "0", below: "1", avg: "2", good: "3", great: "4" };
      const defense = fillNA(defenseMap[d.defenseRating] || d.defenseRating);

      // counters: 0, not na
      const num = (v) => String((v ?? 0));

      const fields = [
        initials,
        eventName,
        matchLevel,
        matchNumber,
        robotPos,

        num(d.autoScored),
        num(d.autoNeutralBrought),
        level1,

        yes01(d.autoPickupDepot),
        yes01(d.autoPickupOutpost),
        yes01(d.autoPickupNeutral),

        num(d.teleopScored),
        num(d.teleopNeutralPassed),

        yes01(d.teleopPickupDepot),
        yes01(d.teleopPickupOutpost),
        yes01(d.teleopPickupGround),

        fillNA(d.climbLevel),
        driver,
        defense,
        fillNA(d.robotSpeed),

        yesNoTo(d.crossedBump),
        yesNoTo(d.underTrench),
        yesNoTo(d.proneToTip),
        yesNoTo(d.disabled),
        yesNoTo(d.goodAllianceMember),
        yesNoTo(d.couldBeDefended),
        yesNoTo(d.unnecessaryFoul),

        fillNA(d.autoNotes),
        fillNA(d.teleopNotes),
        fillNA(d.notes)
      ];

      return fields.join(";");
    },

    bindGetData() {
      UI.els.btnGetData.addEventListener("click", () => {
        const v = Form.validateRequired();
        if (!v.ok) {
          const nameMap = {
            scouterInitials: I18N.t("lblScouterInitials"),
            eventName: I18N.t("lblEventName"),
            matchLevel: I18N.t("lblMatchLevel"),
            matchNumber: I18N.t("lblMatchNumber"),
            robotPosition: I18N.t("lblRobotPosition")
          };
          UI.toast(`${I18N.t("toastMissing")}: ${v.missing.map(k => nameMap[k] || k).join(", ")}`);
          UI.go(0);
          return;
        }

        UI.els.dataOutput.value = UI.serialize();
        UI.toast(I18N.t("toastDataReady"));
      });

      UI.els.btnCopyData.addEventListener("click", async () => {
        const text = UI.els.dataOutput.value || "";
        if (!text) {
          UI.toast(I18N.t("toastCopyFirst"));
          return;
        }
        try {
          await navigator.clipboard.writeText(text);
          UI.toast(I18N.t("toastCopied"));
        } catch {
          UI.els.dataOutput.focus();
          UI.els.dataOutput.select();
          UI.toast(I18N.t("toastSelected"));
        }
      });
    },

    renderSummary() {
      const d = Form.getData();

      // checkbox display: always Yes/No (never na)
      const boolToYN = (b) => (b ? I18N.t("yes") : I18N.t("no"));

      // yes/no radio display: selected -> localized Yes/No, empty -> na
      const ynToNA = (v) => (v ? I18N.opt("yesNo", v) : "na");

      const rows = [
        [I18N.t("lblScouterInitials"), d.scouterInitials || "na"],
        [I18N.t("lblEventName"), d.eventName || "na"],
        [I18N.t("lblMatchLevel"), d.matchLevel ? I18N.opt("matchLevel", d.matchLevel) : "na"],
        [I18N.t("lblMatchNumber"), d.matchNumber || "na"],
        [I18N.t("lblRobotPosition"), d.robotPosition ? I18N.opt("robotPos", d.robotPosition) : "na"],

        [I18N.t("lblAutoScored"), String(d.autoScored ?? 0)],
        [I18N.t("lblAutoNeutralBrought"), String(d.autoNeutralBrought ?? 0)],
        [I18N.t("lblLevel1Climb"), d.level1Climb ? I18N.opt("level1Climb", d.level1Climb) : "na"],

        ["Auto: Depot", boolToYN(d.autoPickupDepot)],
        ["Auto: Outpost", boolToYN(d.autoPickupOutpost)],
        ["Auto: Neutral", boolToYN(d.autoPickupNeutral)],
        [I18N.t("lblAutoNotes"), d.autoNotes || "na"],

        [I18N.t("lblTeleScored"), String(d.teleopScored ?? 0)],
        [I18N.t("lblTeleNeutralPassed"), String(d.teleopNeutralPassed ?? 0)],
        ["Teleop: Depot", boolToYN(d.teleopPickupDepot)],
        ["Teleop: Outpost", boolToYN(d.teleopPickupOutpost)],
        ["Teleop: Ground", boolToYN(d.teleopPickupGround)],
        [I18N.t("lblTeleNotes"), d.teleopNotes || "na"],

        [I18N.t("lblClimbLevel"), d.climbLevel || "na"],
        [I18N.t("lblDriverSkill"), d.driverSkill ? I18N.opt("driverSkill", d.driverSkill) : "na"],
        [I18N.t("lblDefenseRating"), d.defenseRating ? I18N.opt("defenseRating", d.defenseRating) : "na"],
        [I18N.t("lblRobotSpeed"), d.robotSpeed || "na"],

        [I18N.t("lblCrossedBump"), ynToNA(d.crossedBump)],
        [I18N.t("lblUnderTrench"), ynToNA(d.underTrench)],
        [I18N.t("lblProneToTip"), ynToNA(d.proneToTip)],
        [I18N.t("lblDisabled"), ynToNA(d.disabled)],
        [I18N.t("lblGoodAllianceMember"), ynToNA(d.goodAllianceMember)],
        [I18N.t("lblCouldBeDefended"), ynToNA(d.couldBeDefended)],
        [I18N.t("lblUnnecessaryFoul"), ynToNA(d.unnecessaryFoul)],

        [I18N.t("lblNotes"), d.notes || "na"]
      ];

      const out = UI.els.summary;
      out.innerHTML = "";
      rows.forEach(([k, v]) => {
        const row = document.createElement("div");
        row.className = "kv";
        row.innerHTML = `<div class="k">${Utils.escapeHtml(String(k))}</div><div class="v">${Utils.escapeHtml(String(v ?? ""))}</div>`;
        out.appendChild(row);
      });
    },

    bindSettings() {
      const open = () => {
        UI.els.settingsModal.classList.add("show");
        UI.els.settingsModal.setAttribute("aria-hidden", "false");
        UI.els.langSelect?.focus();
      };

      const close = () => {
        UI.els.settingsModal.classList.remove("show");
        UI.els.settingsModal.setAttribute("aria-hidden", "true");
      };

      UI.els.btnSettings.addEventListener("click", open);
      UI.els.btnCloseSettings.addEventListener("click", close);

      UI.els.settingsModal.addEventListener("click", (e) => {
        if (e.target === UI.els.settingsModal) close();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });

      UI.els.langSelect.addEventListener("change", () => {
        I18N.apply(UI.els.langSelect.value);
        UI.refreshStepTitles();
        UI.go(UI.state.idx);
        UI.renderSummary();
      });
    },

    bindSwipe() {
      const card = UI.els.card;
      let startX = null, startY = null;

      card.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        startX = t.clientX; startY = t.clientY;
      }, { passive: true });

      card.addEventListener("touchend", (e) => {
        if (startX === null) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        startX = null; startY = null;

        if (Math.abs(dx) < 70) return;
        if (Math.abs(dx) < Math.abs(dy) * 1.6) return;

        if (dx < 0) UI.next();
        else UI.prev();
      }, { passive: true });
    }
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.UI = UI;

})(window);
