const bellsAudioPatch = new Audio("audio/campane.mp3");
bellsAudioPatch.preload = "auto";

function ensurePineappleVerseStyles() {
  if (document.getElementById("pineappleVerseStyles")) return;

  const style = document.createElement("style");
  style.id = "pineappleVerseStyles";
  style.textContent = `
    .pineapple-overlay{
      background:
        radial-gradient(circle at 50% 16%,rgba(255,244,194,.20),transparent 28%),
        radial-gradient(circle,rgba(57,255,20,.10),transparent 52%),
        linear-gradient(180deg,#050505 0%,#0b0a05 100%);
    }

    .pineapple-verse{
      align-self:center!important;
      max-width:min(780px,calc(100% - 32px));
      margin:0!important;
      padding:clamp(26px,5vw,48px)!important;
      border:1px solid rgba(255,236,174,.30)!important;
      background:
        linear-gradient(180deg,rgba(42,31,13,.90),rgba(14,10,5,.92)),
        radial-gradient(circle at 50% 0%,rgba(255,236,174,.16),transparent 45%)!important;
      color:#fff2c8;
      font-family:Cambria,Georgia,'Times New Roman',serif!important;
      font-size:clamp(1.12rem,2.6vw,1.55rem)!important;
      font-weight:600!important;
      line-height:1.72!important;
      letter-spacing:.01em;
      text-shadow:0 2px 16px rgba(0,0,0,.55);
      box-shadow:0 28px 90px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.18)!important;
    }

    .pineapple-verse .verse-ref{
      margin:0 0 18px!important;
      color:#d7ffbc!important;
      font-family:Cambria,Georgia,'Times New Roman',serif!important;
      font-size:.92rem!important;
      font-weight:900!important;
      letter-spacing:.14em!important;
      text-transform:uppercase!important;
    }

    .verse-close{
      display:inline-flex;
      justify-content:center;
      align-items:center;
      margin-top:24px;
      border:1px solid rgba(255,236,174,.48);
      border-radius:999px;
      padding:12px 22px;
      color:#1a1204;
      background:linear-gradient(180deg,#fff2c8,#d7ffbc);
      box-shadow:0 0 26px rgba(255,236,174,.18),0 14px 30px rgba(0,0,0,.28);
      cursor:pointer;
      font-family:Cambria,Georgia,'Times New Roman',serif;
      font-size:1rem;
      font-weight:900;
      letter-spacing:.04em;
      text-transform:uppercase;
      transition:transform .16s ease,filter .16s ease;
    }

    .verse-close:hover,
    .verse-close:focus-visible{
      transform:translateY(-2px);
      filter:brightness(1.06);
      outline:none;
    }
  `;
  document.head.appendChild(style);
}

function ensureFinalRouteStyles() {
  if (document.getElementById("finalRouteStyles")) return;

  const style = document.createElement("style");
  style.id = "finalRouteStyles";
  style.textContent = `
    .result-box.route-result{
      text-align:center;
    }

    .route-label{
      display:inline-flex;
      margin:8px 0 12px;
      border:1px solid rgba(57,255,20,.40);
      border-radius:999px;
      padding:8px 13px;
      color:#c9ffd4;
      background:rgba(57,255,20,.10);
      font-size:.74rem;
      font-weight:950;
      letter-spacing:.12em;
      text-transform:uppercase;
    }

    .route-name{
      margin:0 0 14px;
      color:#f7fff9;
      font-size:clamp(1.75rem,5vw,3.6rem);
      line-height:.98;
      letter-spacing:-.055em;
      text-shadow:0 0 18px rgba(57,255,20,.26),0 14px 34px rgba(0,0,0,.38);
    }

    .route-name.wedding-route{
      color:#fff2c8;
      text-shadow:0 0 12px rgba(255,242,200,.46),0 0 34px rgba(57,255,20,.28),0 14px 34px rgba(0,0,0,.40);
    }
  `;
  document.head.appendChild(style);
}

function runPineappleVerseEvent() {
  ensurePineappleVerseStyles();
  playAudio(bellsAudioPatch);

  overlay.className = "special-overlay pineapple-overlay";
  overlay.innerHTML = `
    <div class="overlay-message pineapple-verse" role="dialog" aria-modal="true" aria-label="Giudizio sulla pizza all'ananas">
      <p class="verse-ref">Libro della Pizza 3:14</p>
      <p>
        O cieli, abbiate pietà di chi posò l'ananas sulla pizza,
        perché grande fu il peccato e tremante la mozzarella.
      </p>
      <p>
        Che le campane suonino, che il forno perdoni,
        e che nessuna rucola testimoni contro di lei.
      </p>
      <button class="verse-close" type="button" id="closePineappleVerse">
        Chiedo perdono
      </button>
    </div>
  `;

  const closeButton = document.getElementById("closePineappleVerse");
  closeButton?.focus();
  closeButton?.addEventListener("click", hideOverlay);
}

function getRouteResult(percentage) {
  if (percentage === 100) {
    return {
      route: "Wedding Route",
      title: "Perfect ending unlocked",
      text: "100% compatibility. The system is already looking for rings, matching Discord icons and a suspiciously cute Minecraft house.",
      specialClass: "wedding-route"
    };
  }

  if (percentage <= 25) {
    return {
      route: "Emotional Damage Route",
      title: "Incompatibility detected",
      text: "The system recommends Discord friendship and emotional safety distance."
    };
  }

  if (percentage <= 50) {
    return {
      route: "Discord Friend Route",
      title: "Maybe Discord friends",
      text: "There is something here, but we need at least three memes, one pizza, and manual verification."
    };
  }

  if (percentage <= 70) {
    return {
      route: "Soft Match Route",
      title: "Interesting compatibility",
      text: "The situation looks promising. The system approves a conversation longer than expected."
    };
  }

  if (percentage <= 85) {
    return {
      route: "Possible Egirl Route",
      title: "Possible match",
      text: "Good compatibility. Proceed with spritz, gossip, and a Minecraft session."
    };
  }

  if (percentage <= 95) {
    return {
      route: "High Compatibility Route",
      title: "Very high compatibility",
      text: "Suspicious compatibility level. High risk of shared memes and nerdy evenings."
    };
  }

  return {
    route: "Legendary Egirl Route",
    title: "Legendary route unlocked",
    text: "The system has detected a final-boss candidate. Immediate human verification required."
  };
}

getResultMessage = getRouteResult;

renderResult = function() {
  const { percentage, result } = calculateResult();
  const routeClass = result.specialClass || "";

  ensureFinalRouteStyles();
  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="result-box route-result">
      <p class="quiz-kicker">Final result</p>
      <div class="result-score">${percentage}%</div>
      <p class="route-label">Route unlocked</p>
      <h2 class="route-name ${routeClass}">${result.route}</h2>
      <h3 class="result-title">${result.title}</h3>
      <p class="result-text">${result.text}</p>
    </div>
  `;
};

runPineappleEvent = runPineappleVerseEvent;
runExorcistEvent = runPineappleVerseEvent;
