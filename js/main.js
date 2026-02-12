(function (global) {
  "use strict";

  const { Form, UI, I18N } = global.MagnetarScouting;

  function bootstrap() {
    // enhanced controls
    Form.initEnhancedInputs(document);

    // match number rules
    Form.initPrefixedNumberInputs();

    // default language
    I18N.apply("tr");
    const sel = document.getElementById("langSelect");
    if (sel) sel.value = "tr";

    // UI init
    UI.init();
    UI.go(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

})(window);
