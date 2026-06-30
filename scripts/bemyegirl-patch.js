const bellsAudioPatch = new Audio("audio/campane.mp3");
bellsAudioPatch.preload = "auto";

function addProfileQuestions() {
  if (questions.some((question) => question.id === "origine")) return;

  questions.push(
    {
      id: "origine",
      type: "choice",
      question: "Dove sei stata spawnata?",
      answers: [
        { label: "Nord Italia", value: 2 },
        { label: "Centro Italia", value: 1 },
        { label: "Sud Italia / Isole", value: 1 },
        { label: "Europa", value: 0 },
        { label: "Fuori Europa", value: 0 },
        { label: "Non lo so, sono stata spawnata", value: 2 }
      ]
    },
    {
      id: "dove_abiti_ora",
      type: "choice",
      question: "Dove abiti ora?",
      answers: [
        { label: "Vicino a Milano", value: 2 },
        { label: "Lombardia", value: 1 },
        { label: "Nord Italia", value: 0 },
        { label: "Italia, ma lontano", value: -1 },
        { label: "Estero", value: -2 },
        { label: "Nel tuo cuore", value: 2 }
      ]
    },
    {
      id: "colore_occhi",
      type: "choice",
      question: "Che colore hanno i tuoi occhi?",
      answers: [
        { label: "Azzurri", value: 2 },
        { label: "Verdi", value: 2 },
        { label: "Marroni", value: 1 },
        { label: "Nocciola", value: 1 },
        { label: "Grigi", value: 1 },
        { label: "Neri / molto scuri", value: 0 },
        { label: "Cambiano colore in base all'umore", value: 2 }
      ]
    },
    {
      id: "colore_capelli",
      type: "choice",
      question: "Che colore hanno i tuoi capelli nella lore attuale?",
      answers: [
        { label: "Biondi", value: 2 },
        { label: "Castani", value: 1 },
        { label: "Neri", value: 1 },
        { label: "Rossi / ramati", value: 2 },
        { label: "Colorati / tinti", value: 2 },
        { label: "Bianchi / silver", value: 1 },
        { label: "Dipende dal mio ultimo breakdown", value: 2 }
      ]
    },
    {
      id: "segni_particolari",
      type: "multiChoice",
      question: "Quali sono i tuoi dettagli da personaggio principale?",
      minValue: -2,
      maxValue: 2,
      answers: [
        { label: "Piercing", value: 2 },
        { label: "Tatuaggi", value: 1 },
        { label: "Cicatrici", value: 1 },
        { label: "Apparecchio per i denti", value: 2 },
        { label: "Lentiggini", value: 2 },
        { label: "Nei particolari", value: 1 },
        { label: "Capelli colorati", value: 2 },
        { label: "Occhiali", value: 1 },
        { label: "Fossette", value: 2 },
        { label: "Nessuno", value: 0 },
        { label: "Sono io il dettaglio raro", value: 2 }
      ]
    }
  );

  if (!state.restartMode && typeof renderQuestion === "function") {
    renderQuestion();
  }
}

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

    .route-image-wrap{
      margin:0 auto 20px;
    }

    .route-image{
      display:block;
      width:min(100%,420px);
      aspect-ratio:16/10;
      margin:0 auto;
      border:1px solid rgba(255,255,255,.16);
      border-radius:24px;
      object-fit:cover;
      background:rgba(255,255,255,.08);
      box-shadow:0 22px 60px rgba(0,0,0,.36),0 0 36px rgba(57,255,20,.10);
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

    @media (min-width:1024px){
      .route-result .route-image{
        width:min(100%,480px);
      }
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
      specialClass: "wedding-route",
      image: "img/bemyegirl/routes/wedding-route.png"
    };
  }

  if (percentage <= 25) {
    return {
      route: "Emotional Damage Route",
      title: "Incompatibility detected",
      text: "The system recommends Discord friendship and emotional safety distance.",
      image: "img/bemyegirl/routes/emotional-damage-route.png"
    };
  }

  if (percentage <= 50) {
    return {
      route: "Discord Friend Route",
      title: "Maybe Discord friends",
      text: "There is something here, but we need at least three memes, one pizza, and manual verification.",
      image: "img/bemyegirl/routes/discord-friend-route.png"
    };
  }

  if (percentage <= 70) {
    return {
      route: "Soft Match Route",
      title: "Interesting compatibility",
      text: "The situation looks promising. The system approves a conversation longer than expected.",
      image: "img/bemyegirl/routes/soft-match-route.png"
    };
  }

  if (percentage <= 85) {
    return {
      route: "Possible Egirl Route",
      title: "Possible match",
      text: "Good compatibility. Proceed with spritz, gossip, and a Minecraft session.",
      image: "img/bemyegirl/routes/possible-egirl-route.png"
    };
  }

  if (percentage <= 95) {
    return {
      route: "High Compatibility Route",
      title: "Very high compatibility",
      text: "Suspicious compatibility level. High risk of shared memes and nerdy evenings.",
      image: "img/bemyegirl/routes/high-compatibility-route.png"
    };
  }

  return {
    route: "Legendary Egirl Route",
    title: "Legendary route unlocked",
    text: "The system has detected a final-boss candidate. Immediate human verification required.",
    image: "img/bemyegirl/routes/legendary-egirl-route.png"
  };
}

addProfileQuestions();
getResultMessage = getRouteResult;

renderResult = function() {
  const { percentage, result } = calculateResult();
  const routeClass = result.specialClass || "";
  const routeImage = result.image
    ? `<div class="route-image-wrap"><img class="route-image" src="${result.image}" alt="${result.route}" loading="lazy"></div>`
    : "";

  ensureFinalRouteStyles();
  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="result-box route-result">
      ${routeImage}
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
