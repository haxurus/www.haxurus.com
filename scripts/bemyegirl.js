(() => {
  "use strict";

  const sourceUrl = "https://raw.githubusercontent.com/haxurus/www.haxurus.com/7e510793bce233ddfa2d05504339f5723d878d73/scripts/bemyegirl.js";

  fetch(sourceUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load quiz source: ${response.status}`);
      return response.text();
    })
    .then((source) => {
      const patched = source.replace(
        `{label:it?"Il Tronchetto":"The Log",action:"preferenceBlock"},{label:it?"Sono un transformer":"I'm a transformer",action:"preferenceBlock"}`,
        `{label:it?"Il Tronchetto":"The Log",value:-15},{label:it?"Sono un transformer":"I'm a transformer",value:-10}`
      );

      if (patched === source) {
        throw new Error("Starter item patch was not applied.");
      }

      Function(patched)();
    })
    .catch((error) => {
      console.error(error);
      const questionArea = document.getElementById("questionArea");
      const backBtn = document.getElementById("backBtn");
      const nextBtn = document.getElementById("nextBtn");

      if (backBtn) backBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      if (questionArea) {
        questionArea.innerHTML = `
          <div class="blocked-card">
            <h2>Quiz loading error</h2>
            <p>The quiz could not be loaded. Please refresh the page.</p>
          </div>
        `;
      }
    });
})();
