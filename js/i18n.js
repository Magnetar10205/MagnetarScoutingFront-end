// js/i18n.js
(function (global) {
  "use strict";

  const { Utils } = global.MagnetarScouting;

  const STR = {
    tr: {
      // buttons / header
      btnSettings: "Ayarlar",
      btnReset: "Temizle",
      btnGetData: "Verileri topla",
      btnCopy: "Kopyala",
      btnPrev: "Geri",
      btnNext: "İleri",

      // modal
      settingsTitle: "Ayarlar",
      settingsClose: "Kapat",
      settingsLang: "Dil",
      langTR: "Türkçe",
      langEN: "English",

      // pages
      page1Title: "Maç Bilgisi",
      page1Sub: "Temel bilgiler",
      page2Title: "Otonom",
      page2Sub: "Sadece robotlar",
      page3Title: "Tele-op",
      page3Sub: "İnsan kontrolü",
      page4Title: "Endgame & Sürücü",
      page4Sub: "",
      page5Title: "Özellikler",
      page5Sub: "Evet/Hayır",
      page6Title: "Özet & Data",
      page6Sub: "Tek satır, `;` ile ayrılmış",

      navPage: "Sayfa {cur} / {total}",

      // toast popup
      toastCleared: "Temizlendi.",
      toastDataReady: "Data hazır.",
      toastCopyFirst: "Önce verileri topla.",
      toastCopied: "Kopyalandı.",
      toastSelected: "Seçildi. Ctrl+C ile kopyala.",
      toastCantProceed: "Burayı doldurmadan ilerleyemezsin:",
      toastStartOutOfBounds:
        "Sadece izin verilen başlangıç alanına tıklayabilirsin.",
      toastShotOutOfBounds:
        "Sadece izin verilen atış alanına tıklayabilirsin.",

      // data section
      dataOutputLabel: "Data output",
      dataOutputPlaceholder: "Verileri topla'ya basınca burada oluşur",
      dataHint: "Notlar içinde “;” varsa otomatik virgüle çevrilir.",
      summaryLabel: "Özet",
      speedHint: "1 = yavaş, 5 = hızlı",

      // field labels
      lblScouterInitials: "Gözlemci isminin baş harfleri",
      lblEventName: "Etkinlik adı",
      lblMatchLevel: "Maç seviyesi",
      lblMatchNumber: "Maç numarası",
      lblTeamCode: "Takım kodu",
      lblRobotPosition: "Robot yeri",
      lblAutoStartLocation: "Otonom başlangıç konumu",
      btnAutoUndo: "Geri al",
      btnAutoFlip: "Görseli çevir",
      autoStartReadout: "x: {x} • y: {y}",

      lblAutoScored: "Otonomda atılan yük sayısı",
      lblAutoNeutralBrought: "Nötr bölgeden getirilen yük sayısı",
      lblLevel1Climb: "Seviye 1'e tırmandı mı?",
      lblAutoPickup: "Yük alma (Otonom)",
      lblAutoNotes: "Otonom notları",
      lblAutoShotsLocation: "Otonom şut konumları",
      lblTeleShotsLocation: "Tele-op şut konumları",
      shotsReadout: "Atış: {n}",

      lblTeleScored: "Tele-op ta atılan yük sayısı",
      lblTeleNeutralPassed: "Nötr alandan pas verilen yük sayısı",
      lblTelePickup: "Yük alma (Tele-op)",
      lblTeleNotes: "Tele-op notları",

      lblClimbLevel: "Tırmanış seviyesi",
      lblDriverSkill: "Sürücü yeteneği",
      lblDefenseRating: "Defans puanlaması",
      lblRobotSpeed: "Robotun hızı",

      lblCrossedBump: "Bump'ın üzerinden geçti mi?",
      lblUnderTrench: "Trench'in altından geçti mi?",
      lblProneToTip: "Devrilmeye meyilli mi?",
      lblDisabled: "Devre dışı bırakıldı mı?",
      lblGoodAllianceMember: "Güzel ittifak üyesi olur mu?",
      lblCouldBeDefended: "Defans edilebildi mi?",
      lblUnnecessaryFoul: "Gereksiz faul yaptı mı?",
      lblNotes: "Genel not",

      yes: "Evet",
      no: "Hayır",
      yesNo: "Evet/Hayır",
      notAnswered: "Belirtilmemiş",

      sumAutoDepot: "Otonom: Depo",
      sumAutoOutpost: "Otonom: Outpost",
      sumAutoNeutral: "Otonom: Nötr",
      sumTeleDepot: "Tele-op: Depo",
      sumTeleOutpost: "Tele-op: Outpost",
      sumTeleGround: "Tele-op: Yer",

      // options (codes to labels)
      opt: {
        matchLevel: { practice: "Practice", quals: "Quals", finals: "Finals" },
        robotPos: {
          r1: "Kırmızı 1",
          r2: "Kırmızı 2",
          r3: "Kırmızı 3",
          b1: "Mavi 1",
          b2: "Mavi 2",
          b3: "Mavi 3",
        },
        level1Climb: {
          climbed: "Tırmandı",
          attempted: "Denedi",
          failed: "Denemedi",
        },
        driverSkill: {
          ineffective: "Etkisiz",
          average: "Ortalama",
          effective: "Etkili",
          unobserved: "Gözlemlenmedi",
        },
        defenseRating: {
          below: "Ortalamanın altında",
          avg: "Ortalama",
          good: "İyi",
          great: "Çok iyi",
          none: "Defans oynamadı",
        },
        yesNo: { yes: "Evet", no: "Hayır" },
      },

      // toggle texts
      depot: "Depodan yük alındı",
      outpost: "Outposttan yük alındı",
      neutral: "Nötr bölgeden yük alındı",
      ground: "Yerden yük alındı",
    },

    en: {
      btnSettings: "Settings",
      btnReset: "Clear",
      btnGetData: "Get data",
      btnCopy: "Copy",
      btnPrev: "Back",
      btnNext: "Next",

      settingsTitle: "Settings",
      settingsClose: "Close",
      settingsLang: "Language",
      langTR: "Turkish",
      langEN: "English",

      page1Title: "Match Details",
      page1Sub: "Basics",
      page2Title: "Autonomous",
      page2Sub: "Robots only",
      page3Title: "Teleop",
      page3Sub: "Human control",
      page4Title: "Endgame & Driver",
      page4Sub: "",
      page5Title: "Traits",
      page5Sub: "Yes/No",
      page6Title: "Summary & Data",
      page6Sub: "Single line, separated by `;`",

      navPage: "Page {cur} / {total}",

      toastCleared: "Cleared.",
      toastDataReady: "Data ready.",
      toastCopyFirst: "Run Get data first.",
      toastCopied: "Copied.",
      toastSelected: "Selected. Press Ctrl+C to copy.",
      toastCantProceed: "You can’t proceed without filling:",
      toastStartOutOfBounds: "Click inside the allowed start area only.",
      toastShotOutOfBounds: "Click inside the allowed shooting area only.",

      dataOutputLabel: "Data output",
      dataOutputPlaceholder: "Press Get data to generate here",
      dataHint:
        "If notes contain ';' it will be replaced with ',' automatically.",
      summaryLabel: "Summary",
      speedHint: "1 = slow, 5 = fast",

      lblScouterInitials: "Scouter initials",
      lblEventName: "Event name",
      lblMatchLevel: "Match level",
      lblMatchNumber: "Match number",
      lblTeamCode: "Team code",
      lblRobotPosition: "Robot position",
      lblAutoStartLocation: "Auto start location",
      btnAutoUndo: "Undo",
      btnAutoFlip: "Flip image",
      autoStartReadout: "x: {x} • y: {y}",

      lblAutoScored: "Auto: cargo scored",
      lblAutoNeutralBrought: "Auto: cargo brought from neutral",
      lblLevel1Climb: "Climbed to level 1?",
      lblAutoPickup: "Pickup (Auto)",
      lblAutoNotes: "Auto notes",
      lblAutoShotsLocation: "Auto shot locations",
      lblTeleShotsLocation: "Teleop shot locations",
      shotsReadout: "Shots: {n}",

      lblTeleScored: "Teleop: cargo scored",
      lblTeleNeutralPassed: "Teleop: cargo passed from neutral",
      lblTelePickup: "Pickup (Teleop)",
      lblTeleNotes: "Teleop notes",

      lblClimbLevel: "Climb level",
      lblDriverSkill: "Driver skill",
      lblDefenseRating: "Defense rating",
      lblRobotSpeed: "Robot speed",

      lblCrossedBump: "Crossed the bump?",
      lblUnderTrench: "Went under the trench?",
      lblProneToTip: "Prone to tipping?",
      lblDisabled: "Disabled?",
      lblGoodAllianceMember: "Good alliance partner?",
      lblCouldBeDefended: "Could be defended?",
      lblUnnecessaryFoul: "Unnecessary fouls?",
      lblNotes: "General notes",

      yes: "Yes",
      no: "No",
      yesNo: "Yes/No",
      notAnswered: "Not Answered",

      sumAutoDepot: "Auto: Depot",
      sumAutoOutpost: "Auto: Outpost",
      sumAutoNeutral: "Auto: Neutral",
      sumTeleDepot: "Teleop: Depot",
      sumTeleOutpost: "Teleop: Outpost",
      sumTeleGround: "Teleop: Ground",

      opt: {
        matchLevel: { practice: "Practice", quals: "Quals", finals: "Finals" },
        robotPos: {
          r1: "Red 1",
          r2: "Red 2",
          r3: "Red 3",
          b1: "Blue 1",
          b2: "Blue 2",
          b3: "Blue 3",
        },
        level1Climb: {
          climbed: "Climbed",
          attempted: "Attempted",
          failed: "Did not attempt",
        },
        driverSkill: {
          ineffective: "Ineffective",
          average: "Average",
          effective: "Effective",
          unobserved: "Not observed",
        },
        defenseRating: {
          below: "Below average",
          avg: "Average",
          good: "Good",
          great: "Great",
          none: "Did not play defense",
        },
        yesNo: { yes: "Yes", no: "No" },
      },

      depot: "Picked up from depot",
      outpost: "Picked up from outpost",
      neutral: "Picked up from neutral",
      ground: "Picked up from floor",
    },
  };

  function fmt(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, (_, k) =>
      String(vars?.[k] ?? ""),
    );
  }

  function setText(sel, text) {
    const el = Utils.qs(sel);
    if (el) el.textContent = text;
  }

  function setAttr(sel, attr, val) {
    const el = Utils.qs(sel);
    if (el) el.setAttribute(attr, val);
  }

  function setFieldLabelByName(name, text) {
    const el = Utils.qs(`[name="${name}"]`);
    const field = el?.closest(".field");
    const label = field?.querySelector(":scope > label");
    if (label) label.textContent = text;
  }

  function setToggleMainByCheckboxName(name, text) {
    const cb = Utils.qs(`input[type="checkbox"][name="${name}"]`);
    const toggle = cb?.closest(".toggle");
    const main = toggle?.querySelector(".tlabel .main");
    if (main) main.textContent = text;
  }

  function setRadioLabelById(inputId, text) {
    const lab = Utils.qs(`label[for="${inputId}"]`);
    if (lab) lab.textContent = text;
  }

  function setPage(i, title, sub) {
    const pages = Utils.qsa(".page");
    const page = pages[i];
    if (!page) return;

    page.dataset.title = title;

    const h2 = page.querySelector("h2");
    if (!h2) return;

    const small = h2.querySelector("small");
    if (small) {
      h2.innerHTML = `${Utils.escapeHtml(title)} <small>${Utils.escapeHtml(sub ?? "")}</small>`;
    } else {
      h2.textContent = title;
    }
  }

  const I18N = {
    current: "tr",
    t(key) {
      return STR[this.current]?.[key] ?? key;
    },
    format(key, vars) {
      return fmt(this.t(key), vars);
    },

    // option lookup  with group, code for localized label
    opt(group, code) {
      const g = STR[this.current]?.opt?.[group];
      if (!g) return code || "na";
      return g[code] ?? (code || "na");
    },

    apply(lang) {
      if (!STR[lang]) lang = "tr";
      this.current = lang;
      document.documentElement.lang = lang === "tr" ? "tr" : "en";
      const t = STR[lang];

      // buttons
      setText("#btnSettings", t.btnSettings);
      setText("#btnReset", t.btnReset);
      setText("#btnGetData", t.btnGetData);
      setText("#btnCopyData", t.btnCopy);
      setText("#btnPrev", t.btnPrev);
      setText("#btnNext", t.btnNext);

      // settings
      setText("#settingsTitle", t.settingsTitle);
      setText("#btnCloseSettings", t.settingsClose);
      setText("#langLabel", t.settingsLang);
      setText('#langSelect option[value="tr"]', t.langTR);
      setText('#langSelect option[value="en"]', t.langEN);

      // pages + tooltips & titles
      setPage(0, t.page1Title, t.page1Sub);
      setPage(1, t.page2Title, t.page2Sub);
      setPage(2, t.page3Title, t.page3Sub);
      setPage(3, t.page4Title, t.page4Sub);
      setPage(4, t.page5Title, t.page5Sub);
      setPage(5, t.page6Title, t.page6Sub);

      // data section
      setText("#dataOutputLabel", t.dataOutputLabel);
      setAttr("#dataOutput", "placeholder", t.dataOutputPlaceholder);
      setText("#dataHint", t.dataHint);
      setText("#summaryLabel", t.summaryLabel);
      setText("#speedHint", t.speedHint);

      // field labels
      setFieldLabelByName("scouterInitials", t.lblScouterInitials);
      setFieldLabelByName("eventName", t.lblEventName);
      setFieldLabelByName("matchLevel", t.lblMatchLevel);
      setFieldLabelByName("matchNumber", t.lblMatchNumber);
      setFieldLabelByName("teamCode", t.lblTeamCode);
      setFieldLabelByName("robotPosition", t.lblRobotPosition);

      setFieldLabelByName("autoScored", t.lblAutoScored);
      setFieldLabelByName("autoNeutralBrought", t.lblAutoNeutralBrought);
      setFieldLabelByName("level1Climb", t.lblLevel1Climb);
      setFieldLabelByName("autoPickupDepot", t.lblAutoPickup);
      setFieldLabelByName("autoNotes", t.lblAutoNotes);

      setFieldLabelByName("teleopScored", t.lblTeleScored);
      setFieldLabelByName("teleopNeutralPassed", t.lblTeleNeutralPassed);
      setFieldLabelByName("teleopPickupDepot", t.lblTelePickup);
      setFieldLabelByName("teleopNotes", t.lblTeleNotes);

      setFieldLabelByName("climbLevel", t.lblClimbLevel);
      setFieldLabelByName("driverSkill", t.lblDriverSkill);
      setFieldLabelByName("defenseRating", t.lblDefenseRating);
      setFieldLabelByName("robotSpeed", t.lblRobotSpeed);

      setFieldLabelByName("crossedBump", t.lblCrossedBump);
      setFieldLabelByName("underTrench", t.lblUnderTrench);
      setFieldLabelByName("proneToTip", t.lblProneToTip);
      setFieldLabelByName("disabled", t.lblDisabled);
      setFieldLabelByName("goodAllianceMember", t.lblGoodAllianceMember);
      setFieldLabelByName("couldBeDefended", t.lblCouldBeDefended);
      setFieldLabelByName("unnecessaryFoul", t.lblUnnecessaryFoul);
      setFieldLabelByName("notes", t.lblNotes);

      // ---- map labels/buttons (i18n owns all text updates) ----
      setText("#autoStartLabel", t.lblAutoStartLocation);
      setText("#btnAutoUndo", t.btnAutoUndo);
      setText("#btnAutoFlip", t.btnAutoFlip);

      setFieldLabelByName("autoShotsXY", t.lblAutoShotsLocation);
      setText("#btnAutoShotsUndo", t.btnAutoUndo);
      setText("#btnAutoShotsFlip", t.btnAutoFlip);

      setFieldLabelByName("teleShotsXY", t.lblTeleShotsLocation);
      setText("#btnTeleShotsUndo", t.btnAutoUndo);
      setText("#btnTeleShotsFlip", t.btnAutoFlip);

      // toggle hint texts
      Utils.qsa(".toggle .tlabel .hint").forEach(
        (h) => (h.textContent = t.yesNo),
      );

      // toggle main texts
      setToggleMainByCheckboxName("autoPickupDepot", t.depot);
      setToggleMainByCheckboxName("autoPickupOutpost", t.outpost);
      setToggleMainByCheckboxName("autoPickupNeutral", t.neutral);

      setToggleMainByCheckboxName("teleopPickupDepot", t.depot);
      setToggleMainByCheckboxName("teleopPickupOutpost", t.outpost);
      setToggleMainByCheckboxName("teleopPickupGround", t.ground);

      // options labels by ID
      setRadioLabelById("matchLevelQuals", t.opt.matchLevel.quals);
      setRadioLabelById("matchLevelFinals", t.opt.matchLevel.finals);

      setRadioLabelById("posR1", t.opt.robotPos.r1);
      setRadioLabelById("posR2", t.opt.robotPos.r2);
      setRadioLabelById("posR3", t.opt.robotPos.r3);
      setRadioLabelById("posB1", t.opt.robotPos.b1);
      setRadioLabelById("posB2", t.opt.robotPos.b2);
      setRadioLabelById("posB3", t.opt.robotPos.b3);

      setRadioLabelById("l1_yes", t.opt.level1Climb.climbed);
      setRadioLabelById("l1_try", t.opt.level1Climb.attempted);
      setRadioLabelById("l1_no", t.opt.level1Climb.failed);

      setRadioLabelById("d1", t.opt.driverSkill.ineffective);
      setRadioLabelById("d2", t.opt.driverSkill.average);
      setRadioLabelById("d3", t.opt.driverSkill.effective);
      setRadioLabelById("d4", t.opt.driverSkill.unobserved);

      setRadioLabelById("def1", t.opt.defenseRating.below);
      setRadioLabelById("def2", t.opt.defenseRating.avg);
      setRadioLabelById("def3", t.opt.defenseRating.good);
      setRadioLabelById("def4", t.opt.defenseRating.great);
      setRadioLabelById("def5", t.opt.defenseRating.none);

      // yes/no radio labels
      const yesNoIds = [
        ["bumpY", "bumpN"],
        ["trenchY", "trenchN"],
        ["tipY", "tipN"],
        ["disY", "disN"],
        ["allyY", "allyN"],
        ["defdY", "defdN"],
        ["foulY", "foulN"],
      ];
      yesNoIds.forEach(([y, n]) => {
        setRadioLabelById(y, t.yes);
        setRadioLabelById(n, t.no);
      });
    },
  };

  global.MagnetarScouting = global.MagnetarScouting || {};
  global.MagnetarScouting.I18N = I18N;
})(window);
