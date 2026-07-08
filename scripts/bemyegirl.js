(() => {
  "use strict";

  const sourceUrl = "https://raw.githubusercontent.com/haxurus/www.haxurus.com/7e510793bce233ddfa2d05504339f5723d878d73/scripts/bemyegirl.js";

  fetch(sourceUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load quiz source: ${response.status}`);
      return response.text();
    })
    .then((source) => {
      const patched = source
        .replace(
          `{label:it?"Il Tronchetto":"The Log",action:"preferenceBlock"},{label:it?"Sono un transformer":"I'm a transformer",action:"preferenceBlock"}`,
          `{label:it?"Il Tronchetto":"The Log",value:-15},{label:it?"Sono un transformer":"I'm a transformer",value:-10}`
        )
        .replace(
          `versionTitle: "Scegli la versione del quiz",`,
          `versionTitle: "Scegli la versione del quiz:",`
        )
        .replace(
          `versionText: "La versione breve contiene 18 domande principali. La versione lunga contiene tutte le domande.",`,
          `versionText: "Scegli una modalità: breve per fare prima, lunga per il risultato più preciso.",`
        )
        .replace(
          `shortText: "18 domande. Più veloce, ma ancora abbastanza completa.",`,
          `shortText: "18 domande. Più veloce, ma meno affidabile.",`
        )
        .replace(
          `fullText: "Tutte le domande. Full compatibility scan.",`,
          `fullText: "Quiz completo. Più lungo, ma preciso.",`
        )
        .replace(
          `Capisci l'ironia e accetti l'umorismo nero?`,
          `Capisci l'ironia e accetti il black humor?`
        )
        .replace(
          `Il Fiore":"The Flower",value:2`,
          `La Fessa":"The Flower",value:2`
        );

      if (patched === source) {
        throw new Error("Quiz patch was not applied.");
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