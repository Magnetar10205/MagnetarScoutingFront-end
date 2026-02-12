(function (global) {
  "use strict";

  const { Utils, Form, I18N } = global.MagnetarScouting;

  const CFG = Object.freeze({
    toastMs: 2400,
    swipeMinDx: 70,
    swipeAxisRatio: 1.6,
    dragSuppressClickMs: 450,
    dragMoveThresholdPx: 2,
  });

  const UI = {
    state: {
      idx: 0,
      toastTimer: null,

      // map states
      autoStart: null,
      autoShots: null,
      teleShots: null,
    },

    els: {},

    init() {
      UI.cacheEls();
      UI.buildSteps();
      UI.bindNav();
      UI.bindGetData();
      UI.bindLiveSummary();
      UI.bindSettings();
      UI.bindSwipe();

      UI.bindAutoStartMap();
      UI.bindMultiShotMaps();

      // initial readouts (language-dependent)
      UI.updateAutoStartReadout();
      UI.updateAutoShotsReadout();
      UI.updateTeleShotsReadout();
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

      // auto start map
      UI.els.autoStartMap = Utils.qs("#autoStartMap");
      UI.els.autoStartImg = Utils.qs("#autoStartImg");
      UI.els.autoStartMarker = Utils.qs("#autoStartMarker");
      UI.els.autoStartReadout = Utils.qs("#autoStartReadout");
      UI.els.autoStartX = Utils.qs("#autoStartX");
      UI.els.autoStartY = Utils.qs("#autoStartY");
      UI.els.btnAutoUndo = Utils.qs("#btnAutoUndo");
      UI.els.btnAutoFlip = Utils.qs("#btnAutoFlip");

      // auto shots map (multi)
      UI.els.autoShotsMap = Utils.qs("#autoShotsMap");
      UI.els.autoShotsImg = Utils.qs("#autoShotsImg");
      UI.els.autoShotsLayer = Utils.qs("#autoShotsLayer");
      UI.els.autoShotsReadout = Utils.qs("#autoShotsReadout");
      UI.els.autoShotsXY = Utils.qs("#autoShotsXY");
      UI.els.btnAutoShotsUndo = Utils.qs("#btnAutoShotsUndo");
      UI.els.btnAutoShotsFlip = Utils.qs("#btnAutoShotsFlip");

      // tele shots map (multi)
      UI.els.teleShotsMap = Utils.qs("#teleShotsMap");
      UI.els.teleShotsImg = Utils.qs("#teleShotsImg");
      UI.els.teleShotsLayer = Utils.qs("#teleShotsLayer");
      UI.els.teleShotsReadout = Utils.qs("#teleShotsReadout");
      UI.els.teleShotsXY = Utils.qs("#teleShotsXY");
      UI.els.btnTeleShotsUndo = Utils.qs("#btnTeleShotsUndo");
      UI.els.btnTeleShotsFlip = Utils.qs("#btnTeleShotsFlip");
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

    _requireMatchInfoOrToast() {
      const v = Form.validateRequired();
      if (v.ok) return true;

      const nameMap = {
        scouterInitials: I18N.t("lblScouterInitials"),
        eventName: I18N.t("lblEventName"),
        matchLevel: I18N.t("lblMatchLevel"),
        matchNumber: I18N.t("lblMatchNumber"),
        robotPosition: I18N.t("lblRobotPosition"),
      };

      const missingText = v.missing.map((k) => nameMap[k] || k).join(", ");
      UI.toast(`${I18N.t("toastCantProceed")} ${missingText}`);
      return false;
    },

    go(i) {
      const pages = UI.els.pages;
      const fromIdx = UI.state.idx;
      let targetIdx = Math.max(0, Math.min(pages.length - 1, i));

      // Gate: Page 1 required before leaving it
      if (fromIdx === 0 && targetIdx > 0) {
        if (!UI._requireMatchInfoOrToast()) {
          targetIdx = 0;
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

      // keep markers positioned when page becomes visible
      if (UI.state.idx === 0) UI.updateAutoStartMarker();
      if (UI.state.idx === 1) UI.updateAutoShotsMarkers();
      if (UI.state.idx === 2) UI.updateTeleShotsMarkers();

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

        // clear auto start selection too
        if (UI.state.autoStart) {
          UI.state.autoStart.selection = null;
          UI.state.autoStart.history = [];
          if (UI.els.autoStartX) UI.els.autoStartX.value = "";
          if (UI.els.autoStartY) UI.els.autoStartY.value = "";
          if (UI.els.autoStartMarker)
            UI.els.autoStartMarker.style.display = "none";
          UI.updateAutoStartReadout();
        }

        // clear multi shot maps
        if (UI.state.autoShots) {
          UI.state.autoShots.points = [];
          UI.state.autoShots.history = [];
          UI.state.autoShots.drag = UI._newShotDragState();
          if (UI.els.autoShotsXY) UI.els.autoShotsXY.value = "";
          if (UI.els.autoShotsLayer) UI.els.autoShotsLayer.innerHTML = "";
          UI.updateAutoShotsReadout();
        }
        if (UI.state.teleShots) {
          UI.state.teleShots.points = [];
          UI.state.teleShots.history = [];
          UI.state.teleShots.drag = UI._newShotDragState();
          if (UI.els.teleShotsXY) UI.els.teleShotsXY.value = "";
          if (UI.els.teleShotsLayer) UI.els.teleShotsLayer.innerHTML = "";
          UI.updateTeleShotsReadout();
        }

        UI.toast(I18N.t("toastCleared"));
      });
    },

    bindLiveSummary() {
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
        teamCode,
        robotPos,

        fillNA(d.autoStartX),
        fillNA(d.autoStartY),

        fillNA(d.autoShotsXY),
        fillNA(d.teleShotsXY),

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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    },

    bindGetData() {
      UI.els.btnGetData.addEventListener("click", () => {
        if (!UI._requireMatchInfoOrToast()) {
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

      const boolToYN = (b) => (b ? I18N.t("yes") : I18N.t("no"));
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

        // keep markers aligned if modal causes layout changes
        UI.updateAutoStartMarker();
        UI.updateAutoShotsMarkers();
        UI.updateTeleShotsMarkers();
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

        // update localized readouts
        UI.updateAutoStartReadout();
        UI.updateAutoShotsReadout();
        UI.updateTeleShotsReadout();

        // keep markers positioned
        UI.updateAutoStartMarker();
        UI.updateAutoShotsMarkers();
        UI.updateTeleShotsMarkers();
      });
    },

    bindSwipe() {
      const card = UI.els.card;
      let startX = null,
        startY = null;

      const shouldIgnoreSwipeStart = (target) => {
        if (!target) return false;
        return !!target.closest(
          "input, textarea, select, button, .btn, label, .mapbox, .map-marker, .map-layer, .shot-marker",
        );
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

    // ---------- AUTO START (single marker) ----------
    bindAutoStartMap() {
      const box = UI.els.autoStartMap;
      const img = UI.els.autoStartImg;
      const marker = UI.els.autoStartMarker;

      if (!box || !img || !marker || !UI.els.autoStartX || !UI.els.autoStartY)
        return;
      if (box.dataset.bound === "1") return;
      box.dataset.bound = "1";

      const ALLOWED = [{ type: "rect", x0: 0.475, y0: 0.0, x1: 0.55, y1: 1.0 }];
      const PREC = 3;

      const st = UI.state.autoStart || {
        flipped: false,
        selection: null,
        history: [],
        allowed: ALLOWED,
        prec: PREC,
      };
      UI.state.autoStart = st;

      const clamp01 = (v) => Math.max(0, Math.min(1, v));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

      const findAllowedIndex = (x, y) => {
        for (let i = 0; i < st.allowed.length; i++) {
          const a = st.allowed[i];
          if (a.type === "rect") {
            if (x >= a.x0 && x <= a.x1 && y >= a.y0 && y <= a.y1) return i;
          }
        }
        return -1;
      };

      const clampToAllowedRect = (x, y, idx) => {
        const a = st.allowed[idx];
        if (!a || a.type !== "rect") return { x, y };
        return { x: clamp(x, a.x0, a.x1), y: clamp(y, a.y0, a.y1) };
      };

      const setFlipClass = () => box.classList.toggle("flipped", !!st.flipped);

      const setSelection = (sel, pushHistory = true) => {
        if (pushHistory && st.selection) st.history.push({ ...st.selection });

        st.selection = sel;

        if (!sel) {
          UI.els.autoStartX.value = "";
          UI.els.autoStartY.value = "";
          marker.style.display = "none";
          UI.updateAutoStartReadout();
          return;
        }

        UI.els.autoStartX.value = Number(sel.x).toFixed(st.prec);
        UI.els.autoStartY.value = Number(sel.y).toFixed(st.prec);

        UI.updateAutoStartMarker();
        UI.updateAutoStartReadout();
      };

      img.addEventListener("click", (e) => {
        const r = img.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;

        const visX = clamp01((e.clientX - r.left) / r.width);
        const visY = clamp01((e.clientY - r.top) / r.height);

        const x = st.flipped ? 1 - visX : visX;
        const y = visY;

        const idx = findAllowedIndex(x, y);
        if (idx < 0) {
          UI.toast(I18N.t("toastStartOutOfBounds"));
          return;
        }

        setSelection({ x, y, zone: idx }, true);
      });

      // drag marker
      let dragging = false;
      let dragPointerId = null;

      const dragStart = (e) => {
        if (!st.selection) return;

        dragging = true;
        dragPointerId = e.pointerId;
        marker.classList.add("dragging");

        // keep old behavior for auto start (history always snapshots on drag start)
        st.history.push({ ...st.selection });

        try {
          box.setPointerCapture(dragPointerId);
        } catch {}

        e.preventDefault();
        e.stopPropagation();
      };

      const dragMove = (e) => {
        if (!dragging || e.pointerId !== dragPointerId || !st.selection) return;

        const r = img.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;

        const visX = clamp01((e.clientX - r.left) / r.width);
        const visY = clamp01((e.clientY - r.top) / r.height);

        let x = st.flipped ? 1 - visX : visX;
        let y = visY;

        const zone =
          st.selection.zone ?? findAllowedIndex(st.selection.x, st.selection.y);
        if (zone >= 0) {
          const c = clampToAllowedRect(x, y, zone);
          x = c.x;
          y = c.y;
          setSelection({ x, y, zone }, false);
        } else {
          setSelection(
            { x: st.selection.x, y: st.selection.y, zone: st.selection.zone },
            false,
          );
        }
      };

      const dragEnd = (e) => {
        if (!dragging || e.pointerId !== dragPointerId) return;

        dragging = false;
        dragPointerId = null;
        marker.classList.remove("dragging");

        try {
          box.releasePointerCapture(e.pointerId);
        } catch {}
      };

      marker.addEventListener("pointerdown", dragStart);
      box.addEventListener("pointermove", dragMove);
      box.addEventListener("pointerup", dragEnd);
      box.addEventListener("pointercancel", dragEnd);

      // undo
      UI.els.btnAutoUndo?.addEventListener("click", () => {
        if (st.history.length) {
          const prev = st.history.pop();
          st.selection = null;
          setSelection(prev, false);
        } else {
          setSelection(null, false);
        }
      });

      // flip
      UI.els.btnAutoFlip?.addEventListener("click", () => {
        st.flipped = !st.flipped;
        setFlipClass();
        UI.updateAutoStartMarker();
      });

      setFlipClass();
      UI.updateAutoStartReadout();
    },

    updateAutoStartMarker() {
      const st = UI.state.autoStart;
      const box = UI.els.autoStartMap;
      const img = UI.els.autoStartImg;
      const marker = UI.els.autoStartMarker;

      if (!st || !box || !img || !marker) return;

      const sel = st.selection;
      if (!sel) {
        marker.style.display = "none";
        return;
      }

      const boxRect = box.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      const visX = st.flipped ? 1 - sel.x : sel.x;
      const visY = sel.y;

      const left = imgRect.left - boxRect.left + visX * imgRect.width;
      const top = imgRect.top - boxRect.top + visY * imgRect.height;

      marker.style.left = `${left}px`;
      marker.style.top = `${top}px`;
      marker.style.display = "block";
    },

    updateAutoStartReadout() {
      const x = UI.els.autoStartX?.value ? UI.els.autoStartX.value : "na";
      const y = UI.els.autoStartY?.value ? UI.els.autoStartY.value : "na";
      if (UI.els.autoStartReadout) {
        UI.els.autoStartReadout.textContent = I18N.format("autoStartReadout", {
          x,
          y,
        });
      }
    },

    // ---------- MULTI SHOT MAPS ----------
    _newShotDragState() {
      return {
        active: false,
        pointerId: null,
        idx: -1,

        // for history pollution fix
        startClientX: 0,
        startClientY: 0,
        moved: false,
        historyPushed: false,
        snapshot: null,

        // ghost-click suppression after drag
        suppressClickUntil: 0,
      };
    },

    bindMultiShotMaps() {
      UI._bindMultiShotMap("autoShots", {
        box: UI.els.autoShotsMap,
        img: UI.els.autoShotsImg,
        layer: UI.els.autoShotsLayer,
        hidden: UI.els.autoShotsXY,
        readout: UI.els.autoShotsReadout,
        btnUndo: UI.els.btnAutoShotsUndo,
        btnFlip: UI.els.btnAutoShotsFlip,
      });

      UI._bindMultiShotMap("teleShots", {
        box: UI.els.teleShotsMap,
        img: UI.els.teleShotsImg,
        layer: UI.els.teleShotsLayer,
        hidden: UI.els.teleShotsXY,
        readout: UI.els.teleShotsReadout,
        btnUndo: UI.els.btnTeleShotsUndo,
        btnFlip: UI.els.btnTeleShotsFlip,
      });
    },

    _bindMultiShotMap(key, cfg) {
      const { box, img, layer, hidden, readout, btnUndo, btnFlip } = cfg;
      if (!box || !img || !layer || !hidden || !readout) return;
      if (box.dataset.bound === "1") return;
      box.dataset.bound = "1";

      // allowed zones placeholder (you said you’ll set later)
      const ALLOWED = [{ type: "rect", x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 }];
      const PREC = 3;

      const st = UI.state[key] || {
        flipped: false,
        points: [],
        history: [],
        allowed: ALLOWED,
        prec: PREC,
        drag: UI._newShotDragState(),
      };
      UI.state[key] = st;

      const clamp01 = (v) => Math.max(0, Math.min(1, v));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

      const deepCopyPoints = (pts) =>
        pts.map((p) => ({ x: p.x, y: p.y, zone: p.zone }));

      const findAllowedIndex = (x, y) => {
        for (let i = 0; i < st.allowed.length; i++) {
          const a = st.allowed[i];
          if (a.type === "rect") {
            if (x >= a.x0 && x <= a.x1 && y >= a.y0 && y <= a.y1) return i;
          }
        }
        return -1;
      };

      const clampToAllowedRect = (x, y, idx) => {
        const a = st.allowed[idx];
        if (!a || a.type !== "rect") return { x, y };
        return { x: clamp(x, a.x0, a.x1), y: clamp(y, a.y0, a.y1) };
      };

      const setFlipClass = () => box.classList.toggle("flipped", !!st.flipped);

      const pointsToString = () => {
        if (!st.points.length) return "";
        return st.points
          .map(
            (p) => `${Number(p.x).toFixed(st.prec)},${Number(p.y).toFixed(st.prec)}`,
          )
          .join("|");
      };

      const syncHidden = () => {
        hidden.value = pointsToString();
      };

      const canonicalFromClient = (clientX, clientY) => {
        const r = img.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return null;

        const visX = clamp01((clientX - r.left) / r.width);
        const visY = clamp01((clientY - r.top) / r.height);

        const x = st.flipped ? 1 - visX : visX;
        const y = visY;

        return { x, y };
      };

      const pixelFromCanonical = (x, y) => {
        const boxRect = box.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        const visX = st.flipped ? 1 - x : x;
        const visY = y;

        const left = imgRect.left - boxRect.left + visX * imgRect.width;
        const top = imgRect.top - boxRect.top + visY * imgRect.height;
        return { left, top };
      };

      const renderMarkers = () => {
        layer.innerHTML = "";
        st.points.forEach((p, idx) => {
          const m = document.createElement("div");
          m.className = "shot-marker";
          m.dataset.idx = String(idx);

          const pos = pixelFromCanonical(p.x, p.y);
          m.style.left = `${pos.left}px`;
          m.style.top = `${pos.top}px`;

          layer.appendChild(m);
        });
      };

      const commitAndRender = () => {
        syncHidden();
        UI._updateShotReadout(key);
        renderMarkers();
      };

      // add points (click)
      layer.addEventListener("click", (e) => {
        // ghost-click suppression after drag end
        if (Date.now() < st.drag.suppressClickUntil) return;

        if (e.target && e.target.closest && e.target.closest(".shot-marker"))
          return;

        const c = canonicalFromClient(e.clientX, e.clientY);
        if (!c) return;

        const idx = findAllowedIndex(c.x, c.y);
        if (idx < 0) {
          UI.toast(I18N.t("toastShotOutOfBounds"));
          return;
        }

        st.history.push(deepCopyPoints(st.points));
        st.points.push({ x: c.x, y: c.y, zone: idx });
        commitAndRender();
      });

      // drag markers (pointer)
      const onPointerDown = (e) => {
        const mk =
          e.target && e.target.closest
            ? e.target.closest(".shot-marker")
            : null;
        if (!mk) return;

        const idx = Number(mk.dataset.idx);
        if (!Number.isFinite(idx) || !st.points[idx]) return;

        st.drag.active = true;
        st.drag.pointerId = e.pointerId;
        st.drag.idx = idx;

        st.drag.startClientX = e.clientX;
        st.drag.startClientY = e.clientY;
        st.drag.moved = false;
        st.drag.historyPushed = false;
        st.drag.snapshot = deepCopyPoints(st.points);

        mk.classList.add("dragging");

        try {
          layer.setPointerCapture(st.drag.pointerId);
        } catch {}

        e.preventDefault();
        e.stopPropagation();
      };

      const onPointerMove = (e) => {
        if (!st.drag.active || e.pointerId !== st.drag.pointerId) return;
        const idx = st.drag.idx;
        if (idx < 0 || !st.points[idx]) return;

        const c = canonicalFromClient(e.clientX, e.clientY);
        if (!c) return;

        // determine whether this is "real movement"
        const dx = e.clientX - st.drag.startClientX;
        const dy = e.clientY - st.drag.startClientY;
        const dist = Math.hypot(dx, dy);

        if (!st.drag.moved && dist >= CFG.dragMoveThresholdPx) {
          st.drag.moved = true;

          // history pollution fix: push snapshot only when movement actually happens
          if (!st.drag.historyPushed && st.drag.snapshot) {
            st.history.push(st.drag.snapshot);
            st.drag.historyPushed = true;
          }
        }

        // even if moved is false, we still update position a bit due to jitter;
        // but we won't have polluted undo history.
        const p = st.points[idx];
        const zone = p.zone ?? findAllowedIndex(p.x, p.y);
        if (zone < 0) return;

        const clamped = clampToAllowedRect(c.x, c.y, zone);
        p.x = clamped.x;
        p.y = clamped.y;

        const mk = layer.querySelector(`.shot-marker[data-idx="${idx}"]`);
        if (mk) {
          const pos = pixelFromCanonical(p.x, p.y);
          mk.style.left = `${pos.left}px`;
          mk.style.top = `${pos.top}px`;
        }

        syncHidden();
        UI._updateShotReadout(key);

        e.preventDefault();
      };

      const onPointerUp = (e) => {
        if (!st.drag.active || e.pointerId !== st.drag.pointerId) return;

        const idx = st.drag.idx;
        const mk = layer.querySelector(`.shot-marker[data-idx="${idx}"]`);
        if (mk) mk.classList.remove("dragging");

        // ghost-click suppression window (fix for post-drag click)
        if (st.drag.moved) {
          st.drag.suppressClickUntil = Date.now() + CFG.dragSuppressClickMs;
        }

        st.drag.active = false;
        st.drag.pointerId = null;
        st.drag.idx = -1;
        st.drag.snapshot = null;

        try {
          layer.releasePointerCapture(e.pointerId);
        } catch {}

        e.preventDefault();
        e.stopPropagation();
      };

      layer.addEventListener("pointerdown", onPointerDown);
      layer.addEventListener("pointermove", onPointerMove);
      layer.addEventListener("pointerup", onPointerUp);
      layer.addEventListener("pointercancel", onPointerUp);

      // undo
      if (btnUndo) {
        btnUndo.addEventListener("click", () => {
          if (st.history.length) {
            st.points = st.history.pop();
          } else {
            st.points = [];
          }
          st.drag = UI._newShotDragState();
          commitAndRender();
        });
      }

      // flip
      if (btnFlip) {
        btnFlip.addEventListener("click", () => {
          st.flipped = !st.flipped;
          setFlipClass();
          renderMarkers();
        });
      }

      setFlipClass();
      commitAndRender();
    },

    _updateShotReadout(key) {
      const st = UI.state[key];
      if (!st) return;

      if (key === "autoShots" && UI.els.autoShotsReadout) {
        UI.els.autoShotsReadout.textContent = I18N.format("shotsReadout", {
          n: st.points.length,
        });
      } else if (key === "teleShots" && UI.els.teleShotsReadout) {
        UI.els.teleShotsReadout.textContent = I18N.format("shotsReadout", {
          n: st.points.length,
        });
      }
    },

    updateAutoShotsReadout() {
      UI._updateShotReadout("autoShots");
    },

    updateTeleShotsReadout() {
      UI._updateShotReadout("teleShots");
    },

    updateAutoShotsMarkers() {
      // re-render markers from canonical points (for resize/page switch)
      const st = UI.state.autoShots;
      if (!st || !UI.els.autoShotsLayer || !UI.els.autoShotsMap || !UI.els.autoShotsImg)
        return;

      // reuse commit render mechanics without touching history
      UI.els.autoShotsLayer.innerHTML = "";
      st.points.forEach((p, idx) => {
        const m = document.createElement("div");
        m.className = "shot-marker";
        m.dataset.idx = String(idx);

        const boxRect = UI.els.autoShotsMap.getBoundingClientRect();
        const imgRect = UI.els.autoShotsImg.getBoundingClientRect();
        const visX = st.flipped ? 1 - p.x : p.x;
        const visY = p.y;

        const left = imgRect.left - boxRect.left + visX * imgRect.width;
        const top = imgRect.top - boxRect.top + visY * imgRect.height;

        m.style.left = `${left}px`;
        m.style.top = `${top}px`;

        UI.els.autoShotsLayer.appendChild(m);
      });
    },

    updateTeleShotsMarkers() {
      const st = UI.state.teleShots;
      if (!st || !UI.els.teleShotsLayer || !UI.els.teleShotsMap || !UI.els.teleShotsImg)
        return;

      UI.els.teleShotsLayer.innerHTML = "";
      st.points.forEach((p, idx) => {
        const m = document.createElement("div");
        m.className = "shot-marker";
        m.dataset.idx = String(idx);

        const boxRect = UI.els.teleShotsMap.getBoundingClientRect();
        const imgRect = UI.els.teleShotsImg.getBoundingClientRect();
        const visX = st.flipped ? 1 - p.x : p.x;
        const visY = p.y;

        const left = imgRect.left - boxRect.left + visX * imgRect.width;
        const top = imgRect.top - boxRect.top + visY * imgRect.height;

        m.style.left = `${left}px`;
        m.style.top = `${top}px`;

        UI.els.teleShotsLayer.appendChild(m);
      });
    },
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.UI = UI;
})(window);
