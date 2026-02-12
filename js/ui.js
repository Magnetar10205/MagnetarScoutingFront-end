(function (global) {
  "use strict";

  const { Utils, Form, I18N } = global.MagnetarScouting;

  const CFG = Object.freeze({
    toastMs: 2400,
    swipeMinDx: 70,
    swipeAxisRatio: 1.6,
  });

  const UI = {
    state: { idx: 0, toastTimer: null },
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

      if (UI.state.toastTimer) clearTimeout(UI.state.toastTimer);
      UI.state.toastTimer = setTimeout(
        () => t.classList.remove("show"),
        CFG.toastMs,
      );
    },

    buildSteps() {
      const steps = UI.els.steps;
      steps.innerHTML = "";

      UI.els.pages.forEach((p, i) => {
        const d = document.createElement("div");
        d.className = "dot" + (i === 0 ? " active" : "");
        d.title = p.dataset.title || `Page ${i + 1}`;

        // keyboard-friendly without changing markup/CSS elsewhere
        d.setAttribute("role", "button");
        d.setAttribute("tabindex", "0");
        d.setAttribute("aria-label", p.dataset.title || `Page ${i + 1}`);

        d.addEventListener("click", () => UI.go(i));
        d.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            UI.go(i);
          }
        });

        steps.appendChild(d);
      });
    },

    refreshStepTitles() {
      const dots = Utils.qsa(".dot", UI.els.steps);
      UI.els.pages.forEach((p, i) => {
        if (dots[i]) {
          dots[i].title = p.dataset.title || `Page ${i + 1}`;
          dots[i].setAttribute(
            "aria-label",
            p.dataset.title || `Page ${i + 1}`,
          );
        }
      });
    },

    go(i) {
      const pages = UI.els.pages;
      const fromIdx = UI.state.idx;
      let targetIdx = Math.max(0, Math.min(pages.length - 1, i));

      // --- Gate: Page 1 (match info) is required before leaving it ---
      if (fromIdx === 0 && targetIdx > 0) {
        const v = Form.validateRequired();
        if (!v.ok) {
          const nameMap = {
            scouterInitials: I18N.t("lblScouterInitials"),
            eventName: I18N.t("lblEventName"),
            matchLevel: I18N.t("lblMatchLevel"),
            matchNumber: I18N.t("lblMatchNumber"),
            robotPosition: I18N.t("lblRobotPosition"),
          };

          const missingText = v.missing.map((k) => nameMap[k] || k).join(", ");
          UI.toast(`${I18N.t("toastCantProceed")} ${missingText}`);

          // stay on page 1
          targetIdx = 0; // (we'll just force it)
        }
      }

      UI.state.idx = targetIdx;

      pages.forEach((p, k) => p.classList.toggle("active", k === UI.state.idx));
      Utils.qsa(".dot", UI.els.steps).forEach((d, k) =>
        d.classList.toggle("active", k === UI.state.idx),
      );

      UI.els.btnPrev.disabled = UI.state.idx === 0;
      UI.els.btnNext.disabled = UI.state.idx === pages.length - 1;

      UI.els.navCenter.textContent = I18N.format("navPage", {
        cur: UI.state.idx + 1,
        total: pages.length,
      });

      if (UI.state.idx === pages.length - 1) UI.renderSummary();
    },

    prev() {
      UI.go(UI.state.idx - 1);
    },
    next() {
      UI.go(UI.state.idx + 1);
    },

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
      // Stop listening to the whole planet; only listen inside the app card.
      const root = UI.els.card;

      root.addEventListener("input", () => {
        if (UI.state.idx === UI.els.pages.length - 1) UI.renderSummary();
      });

      root.addEventListener("change", () => {
        if (UI.state.idx === UI.els.pages.length - 1) UI.renderSummary();
      });
    },

    // -------- DATA LOGIC --------
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

      const yes01 = (boolVal) => (boolVal === true ? "1" : "0");
      const yesNoTo = (val) =>
        val === "yes" ? "1" : val === "no" ? "0" : "na";

      const initials = fillNA(
        cleanText(d.scouterInitials).replace(/\s+/g, "").toUpperCase(),
      );
      const eventName = fillNA(d.eventName);
      const matchNumber = fillNA(cleanText(d.matchNumber).replaceAll("#", ""));
      const teamCode = fillNA(cleanText(d.teamCode).replaceAll("#", ""));

      const matchLevelMap = { quals: "qm", finals: "f" };
      const matchLevel = fillNA(matchLevelMap[d.matchLevel] || d.matchLevel);

      const robotPos = fillNA(d.robotPosition);

      const level1Map = { climbed: "c", attempted: "t", failed: "n" };
      const level1 = fillNA(level1Map[d.level1Climb] || d.level1Climb);

      const driverMap = {
        ineffective: "0",
        average: "1",
        effective: "2",
        unobserved: "x",
      };
      const driver = fillNA(driverMap[d.driverSkill] || d.driverSkill);

      const defenseMap = {
        none: "0",
        below: "1",
        avg: "2",
        good: "3",
        great: "4",
      };
      const defense = fillNA(defenseMap[d.defenseRating] || d.defenseRating);

      const num = (v) => String(v ?? 0);

      const fields = [
        initials,
        eventName,
        matchLevel,
        matchNumber,
        teamCode, // <-- NEW FIELD
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
        fillNA(d.notes),
      ];

      return fields.join(";");
    },

    async copyToClipboard(text) {
      // secure + supported path
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
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
            robotPosition: I18N.t("lblRobotPosition"),
          };

          const missingText = v.missing.map((k) => nameMap[k] || k).join(", ");
          UI.toast(`${I18N.t("toastCantProceed")} ${missingText}`);
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
          const ok = await UI.copyToClipboard(text);
          if (ok) {
            UI.toast(I18N.t("toastCopied"));
            return;
          }
          throw new Error("clipboard-fallback");
        } catch {
          const ta = UI.els.dataOutput;
          const wasReadOnly = ta.hasAttribute("readonly");

          if (wasReadOnly) ta.removeAttribute("readonly");
          ta.focus({ preventScroll: true });
          ta.select();
          ta.setSelectionRange(0, ta.value.length);
          if (wasReadOnly) ta.setAttribute("readonly", "");

          UI.toast(I18N.t("toastSelected"));
        }
      });
    },

    renderSummary() {
      const d = Form.getData();
      const NA = I18N.t("notAnswered");

      // checkbox display: always Yes/No (never NA)
      const boolToYN = (b) => (b ? I18N.t("yes") : I18N.t("no"));

      // yes/no radio display: selected -> localized Yes/No, empty -> Not Answered
      const ynToDisplay = (v) => (v ? I18N.opt("yesNo", v) : NA);

      const teamCodeDisplay = d.teamCode ? `#${d.teamCode}` : NA;

      const matchNoDisplay = d.matchNumber ? `#${d.matchNumber}` : NA;

      const rows = [
        [I18N.t("lblScouterInitials"), d.scouterInitials || NA],
        [I18N.t("lblEventName"), d.eventName || NA],
        [
          I18N.t("lblMatchLevel"),
          d.matchLevel ? I18N.opt("matchLevel", d.matchLevel) : NA,
        ],
        [I18N.t("lblMatchNumber"), matchNoDisplay],
        [I18N.t("lblTeamCode"), teamCodeDisplay],
        
        [
          I18N.t("lblRobotPosition"),
          d.robotPosition ? I18N.opt("robotPos", d.robotPosition) : NA,
        ],

        [I18N.t("lblAutoScored"), String(d.autoScored ?? 0)],
        [I18N.t("lblAutoNeutralBrought"), String(d.autoNeutralBrought ?? 0)],
        [
          I18N.t("lblLevel1Climb"),
          d.level1Climb ? I18N.opt("level1Climb", d.level1Climb) : NA,
        ],

        [I18N.t("sumAutoDepot"), boolToYN(d.autoPickupDepot)],
        [I18N.t("sumAutoOutpost"), boolToYN(d.autoPickupOutpost)],
        [I18N.t("sumAutoNeutral"), boolToYN(d.autoPickupNeutral)],
        [I18N.t("lblAutoNotes"), d.autoNotes || NA],

        [I18N.t("lblTeleScored"), String(d.teleopScored ?? 0)],
        [I18N.t("lblTeleNeutralPassed"), String(d.teleopNeutralPassed ?? 0)],

        [I18N.t("sumTeleDepot"), boolToYN(d.teleopPickupDepot)],
        [I18N.t("sumTeleOutpost"), boolToYN(d.teleopPickupOutpost)],
        [I18N.t("sumTeleGround"), boolToYN(d.teleopPickupGround)],
        [I18N.t("lblTeleNotes"), d.teleopNotes || NA],

        [I18N.t("lblClimbLevel"), d.climbLevel || NA],
        [
          I18N.t("lblDriverSkill"),
          d.driverSkill ? I18N.opt("driverSkill", d.driverSkill) : NA,
        ],
        [
          I18N.t("lblDefenseRating"),
          d.defenseRating ? I18N.opt("defenseRating", d.defenseRating) : NA,
        ],
        [I18N.t("lblRobotSpeed"), d.robotSpeed || NA],

        [I18N.t("lblCrossedBump"), ynToDisplay(d.crossedBump)],
        [I18N.t("lblUnderTrench"), ynToDisplay(d.underTrench)],
        [I18N.t("lblProneToTip"), ynToDisplay(d.proneToTip)],
        [I18N.t("lblDisabled"), ynToDisplay(d.disabled)],
        [I18N.t("lblGoodAllianceMember"), ynToDisplay(d.goodAllianceMember)],
        [I18N.t("lblCouldBeDefended"), ynToDisplay(d.couldBeDefended)],
        [I18N.t("lblUnnecessaryFoul"), ynToDisplay(d.unnecessaryFoul)],

        [I18N.t("lblNotes"), d.notes || NA],
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
      let startX = null,
        startY = null;

      const shouldIgnoreSwipeStart = (target) => {
        if (!target) return false;
        return !!target.closest("input, textarea, select, button, .btn, label");
      };

      card.addEventListener(
        "touchstart",
        (e) => {
          if (shouldIgnoreSwipeStart(e.target)) {
            startX = null;
            startY = null;
            return;
          }
          const t = e.touches[0];
          startX = t.clientX;
          startY = t.clientY;
        },
        { passive: true },
      );

      card.addEventListener(
        "touchend",
        (e) => {
          if (startX === null) return;

          const t = e.changedTouches[0];
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          startX = null;
          startY = null;

          if (Math.abs(dx) < CFG.swipeMinDx) return;
          if (Math.abs(dx) < Math.abs(dy) * CFG.swipeAxisRatio) return;

          if (dx < 0) UI.next();
          else UI.prev();
        },
        { passive: true },
      );
    },
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.UI = UI;
})(window);
