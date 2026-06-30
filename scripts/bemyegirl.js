const scoreMap = {
  2: 10,
  1: 7,
  0: 5,
  "-1": 2,
  "-2": 0,
  "-3": -5
};

const questions = [
  {
    id: "ironia",
    type: "choice",
    question: "Sai cos’è l’ironia e accetti il black humor?",
    blocking: true,
    answers: [
      { label: "Sì", action: "continue" },
      { label: "No", action: "block" },
      { label: "Black humor?", action: "block" }
    ]
  },
  {
    id: "tronchetto",
    type: "choice",
    question: "Sei nato/a con il Tronchetto di Clash Royale o con la passera?",
    answers: [
      { label: "Tronchetto", value: -2 },
      { label: "SAO?", value: -1 },
      { label: "Sono confuso/a", value: 0 },
      { label: "Con la passera", value: 2 }
    ]
  },
  {
    id: "eta",
    type: "choice",
    question: "Quanti anni hai?",
    answers: [
      { label: "Meno di 18", action: "police" },
      { label: "Tra 18 e 22", value: 1 },
      { label: "Tra 23 e 25", value: 2 },
      { label: "Tra 26 e 30", value: -1 },
      { label: "31 o più", value: -2 }
    ]
  },
  {
    id: "cioccolato",
    type: "slider",
    question: "Scegli il tuo livello di cioccolatosità estetica",
    min: 0,
    max: 100,
    defaultValue: 20,
    ranges: [
      { min: 0, max: 20, label: "Cioccolato bianco", value: 2 },
      { min: 21, max: 40, label: "Cioccolato al latte", value: 0 },
      { min: 41, max: 60, label: "Fondente 50%", value: -1 },
      { min: 61, max: 80, label: "Fondente 75%", value: -2 },
      { min: 81, max: 100, label: "Cacao puro boss finale", value: -3 }
    ]
  },
  {
    id: "altezza",
    type: "choice",
    question: "Quanto sei alta?",
    answers: [
      { label: "Meno di 1.55", value: 1 },
      { label: "1.55 - 1.65", value: 2 },
      { label: "1.66 - 1.75", value: 1 },
      { label: "1.76 - 1.85", value: 0 },
      { label: "Più di 1.85", value: -1 }
    ]
  },
  {
    id: "reel",
    type: "choice",
    question: "Se ti mando 12 reel in 5 minuti?",
    answers: [
      { label: "Li guardo tutti e commento", value: 2 },
      { label: "Ne guardo qualcuno e faccio finta di aver capito", value: 1 },
      { label: "Rispondo solo “ahah”", value: 0 },
      { label: "Ti silenzio", value: -1 },
      { label: "Ti blocco e cambio identità", value: -2 }
    ]
  },
  {
    id: "pizza",
    type: "choice",
    question: "Scegli una pizza",
    answers: [
      { label: "Bufala e patatine", value: 2 },
      { label: "Wurstel e patatine", value: 0 },
      { label: "Margherica", value: 1 },
      { label: "Con la rucola", value: -1, action: "cowSound" },
      { label: "Ananas", value: -3, action: "exorcistEvent" }
    ]
  },
  {
    id: "videogiochi",
    type: "slider",
    question: "Quanto sopporti i videogiochi?",
    min: 0,
    max: 100,
    defaultValue: 60,
    ranges: [
      { min: 0, max: 20, label: "Sono una perdita di tempo", value: -2 },
      { min: 21, max: 40, label: "Ti guardo ma non capisco", value: -1 },
      { min: 41, max: 60, label: "Ogni tanto ci sta", value: 0 },
      { min: 61, max: 80, label: "Gaming serale approvato", value: 1 },
      { min: 81, max: 100, label: "Duo queue immediata", value: 2 }
    ]
  },
  {
    id: "minecraft",
    type: "choice",
    question: "Se dico “stasera Minecraft”?",
    answers: [
      { label: "Creo la casa, tu mina", value: 2 },
      { label: "Vengo ma mi perdo dopo 3 minuti", value: 1 },
      { label: "Solo se poi guardiamo un film", value: 1 },
      { label: "Minecraft è per bambini", value: -2 },
      { label: "Faccio esplodere tutto con la TNT", value: 0 }
    ]
  },
  {
    id: "drink",
    type: "choice",
    question: "Scegli un drink",
    answers: [
      { label: "Spritz Aperol", value: 2 },
      { label: "Coca-Cola", value: 1 },
      { label: "Acqua naturale", value: 0 },
      { label: "Monster alle 23:00", value: 1 },
      { label: "Non bevo niente", value: -1 }
    ]
  },
  {
    id: "gossip",
    type: "slider",
    question: "Quanto sei pronta a fare gossip inutile ma fondamentale?",
    min: 0,
    max: 100,
    defaultValue: 80,
    ranges: [
      { min: 0, max: 20, label: "Non mi interessa la vita degli altri", value: -2 },
      { min: 21, max: 40, label: "Ascolto, ma non partecipo", value: -1 },
      { min: 41, max: 60, label: "Ogni tanto ci sta", value: 0 },
      { min: 61, max: 80, label: "Analisi completa di ogni dettaglio", value: 1 },
      { min: 81, max: 100, label: "Creo teorie, timeline e prove fotografiche", value: 2 }
    ]
  },
  {
    id: "anime",
    type: "choice",
    question: "Anime preferito?",
    answers: [
      { label: "Frieren", value: 2 },
      { label: "Sword Art Online", value: 1 },
      { label: "Death Note", value: 1 },
      { label: "Non so decidere", value: 0 },
      { label: "Non guardo anime", value: -3 }
    ]
  },
  {
    id: "nerd",
    type: "slider",
    question: "Quanto sei nerd?",
    min: 0,
    max: 100,
    defaultValue: 60,
    ranges: [
      { min: 0, max: 20, label: "Tocco l’erba ogni giorno", value: -1 },
      { min: 21, max: 40, label: "Nerd occasionale", value: 0 },
      { min: 41, max: 60, label: "So cos’è Discord", value: 1 },
      { min: 61, max: 80, label: "Ho almeno un trauma da gioco online", value: 2 },
      { min: 81, max: 100, label: "Il mio habitat naturale è davanti al PC", value: 2 }
    ]
  },
  {
    id: "assenza",
    type: "choice",
    question: "Se non ti rispondo per qualche ora, tu cosa fai?",
    answers: [
      { label: "Mi cerchi perché vuoi sapere se sono vivo", value: 2 },
      { label: "Ti mando un meme per attirare la tua attenzione", value: 2 },
      { label: "Ti scrivo “tutto ok?”", value: 1 },
      { label: "Aspetto senza dire nulla", value: 0 },
      { label: "Sparisco anche io per principio", value: -2 }
    ]
  }
];

const state = {
  currentIndex: 0,
  answers: {}
};

const questionArea = document.getElementById("questionArea");
const progressBar = document.getElementById("progressBar");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const overlay = document.getElementById("specialOverlay");

const policeAudio = document.getElementById("policeAudio");
const cowAudio = document.getElementById("cowAudio");
const exorcistAudio = document.getElementById("exorcistAudio");

function getRangeAnswer(question, numericValue) {
  return question.ranges.find((range) => numericValue >= range.min && numericValue <= range.max);
}

function getSelectedAnswer(question) {
  const saved = state.answers[question.id];

  if (!saved) return null;

  if (question.type === "slider") {
    return getRangeAnswer(question, saved.rawValue);
  }

  return question.answers[saved.answerIndex] || null;
}

function renderQuestion() {
  const question = questions[state.currentIndex];
  const selected = state.answers[question.id];

  updateProgress();

  backBtn.disabled = state.currentIndex === 0;
  nextBtn.textContent = state.currentIndex === questions.length - 1 ? "Risultato" : "Avanti";
  nextBtn.disabled = !selected && question.type !== "slider";

  const questionNumber = `${state.currentIndex + 1} / ${questions.length}`;

  if (question.type === "choice") {
    questionArea.innerHTML = `
      <p class="question-number">Domanda ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="answers-grid">
        ${question.answers.map((answer, index) => `
          <button class="answer-btn ${selected?.answerIndex === index ? "selected" : ""}" type="button" data-index="${index}">
            ${answer.label}
          </button>
        `).join("")}
      </div>
    `;

    document.querySelectorAll(".answer-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const answerIndex = Number(button.dataset.index);
        const answer = question.answers[answerIndex];

        state.answers[question.id] = {
          answerIndex,
          value: answer.value ?? null,
          action: answer.action ?? null
        };

        if (answer.action === "block") {
          renderBlocked();
          return;
        }

        if (answer.action === "police") {
          runPoliceEvent();
          return;
        }

        if (answer.action === "cowSound") {
          playAudio(cowAudio);
        }

        if (answer.action === "exorcistEvent") {
          runExorcistEvent();
        }

        renderQuestion();
      });
    });
  }

  if (question.type === "slider") {
    const rawValue = selected?.rawValue ?? question.defaultValue ?? 50;
    const activeRange = getRangeAnswer(question, rawValue);

    if (!selected) {
      state.answers[question.id] = {
        rawValue,
        value: activeRange.value
      };
    }

    questionArea.innerHTML = `
      <p class="question-number">Domanda ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="slider-box">
        <input id="sliderInput" type="range" min="${question.min}" max="${question.max}" value="${rawValue}" />
        <div class="slider-value">
          <span>Valore: <strong id="sliderNumber">${rawValue}</strong></span>
          <span class="slider-label" id="sliderLabel">${activeRange.label}</span>
        </div>
      </div>
    `;

    const sliderInput = document.getElementById("sliderInput");
    const sliderNumber = document.getElementById("sliderNumber");
    const sliderLabel = document.getElementById("sliderLabel");

    sliderInput.addEventListener("input", () => {
      const value = Number(sliderInput.value);
      const range = getRangeAnswer(question, value);

      sliderNumber.textContent = value;
      sliderLabel.textContent = range.label;

      state.answers[question.id] = {
        rawValue: value,
        value: range.value
      };

      nextBtn.disabled = false;
    });
  }
}

function updateProgress() {
  const progress = ((state.currentIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function goNext() {
  const question = questions[state.currentIndex];
  const selected = getSelectedAnswer(question);

  if (!selected && question.type !== "slider") return;

  if (state.currentIndex < questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
    return;
  }

  renderResult();
}

function goBack() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
}

function calculateResult() {
  let total = 0;
  let max = 0;

  questions.forEach((question) => {
    if (question.blocking) return;

    const answer = state.answers[question.id];
    if (!answer || answer.value === null || answer.value === undefined) return;

    total += scoreMap[answer.value] ?? 0;
    max += scoreMap[2];
  });

  const percentage = Math.max(0, Math.min(100, Math.round((total / max) * 100)));

  return {
    total,
    max,
    percentage,
    result: getResultMessage(percentage)
  };
}

function getResultMessage(percentage) {
  if (percentage <= 25) {
    return {
      title: "Incompatibilità rilevata",
      text: "Il sistema consiglia amicizia su Discord e distanza di sicurezza emotiva."
    };
  }

  if (percentage <= 50) {
    return {
      title: "Forse come amici su Discord",
      text: "Qualche punto c’è, ma servono almeno tre meme, una pizza e una verifica manuale."
    };
  }

  if (percentage <= 70) {
    return {
      title: "Compatibilità interessante",
      text: "La situazione è promettente. Il sistema approva una conversazione più lunga del previsto."
    };
  }

  if (percentage <= 85) {
    return {
      title: "Possibile match",
      text: "Buona affinità. Procedere con spritz, gossip e sessione Minecraft."
    };
  }

  if (percentage <= 95) {
    return {
      title: "Altissima affinità",
      text: "Livello compatibilità sospetto. Probabile rischio di meme condivisi e serate nerd."
    };
  }

  return {
    title: "Route leggendaria sbloccata",
    text: "Il sistema ha rilevato una candidata da boss finale. Richiesta verifica umana immediata."
  };
}

function renderResult() {
  const { percentage, result } = calculateResult();

  progressBar.style.width = "100%";
  backBtn.disabled = true;
  nextBtn.textContent = "Ricomincia";
  nextBtn.disabled = false;
  nextBtn.onclick = restartQuiz;

  questionArea.innerHTML = `
    <div class="result-box">
      <p class="quiz-kicker">Risultato finale</p>
      <div class="result-score">${percentage}%</div>
      <h2 class="result-title">${result.title}</h2>
      <p class="result-text">${result.text}</p>
    </div>
  `;
}

function renderBlocked() {
  progressBar.style.width = "100%";
  backBtn.disabled = true;
  nextBtn.textContent = "Ricomincia";
  nextBtn.disabled = false;
  nextBtn.onclick = restartQuiz;

  questionArea.innerHTML = `
    <div class="blocked-card">
      <h2>Accesso negato</h2>
      <p>
        Questo quiz contiene ironia discutibile. Per la tua sicurezza emotiva,
        il sistema ti accompagna gentilmente all’uscita.
      </p>
    </div>
  `;
}

function restartQuiz() {
  state.currentIndex = 0;
  state.answers = {};
  nextBtn.onclick = goNext;
  hideOverlay();
  renderQuestion();
}

function playAudio(audioElement) {
  if (!audioElement) return;

  audioElement.currentTime = 0;
  audioElement.play().catch(() => {
    // Alcuni browser bloccano l'audio automatico se non c'è stata interazione.
  });
}

function runPoliceEvent() {
  playAudio(policeAudio);

  overlay.className = "special-overlay";
  overlay.innerHTML = `
    <img class="overlay-photo" src="/images/incarcerato.png" alt="Incarcerato" />
    <div class="bars"></div>
    <div class="overlay-message">
      🚨 ERRORE 113: MINORENNE RILEVATO.<br />
      Il sistema ha avvisato le autorità competenti del meme.
    </div>
  `;

  backBtn.disabled = true;
  nextBtn.disabled = true;
}

function runExorcistEvent() {
  playAudio(exorcistAudio);

  overlay.className = "special-overlay";
  overlay.innerHTML = `
    <img class="exorcist-gif" src="/images/esorcista.gif" alt="Evento esorcista" />
  `;

  window.setTimeout(() => {
    hideOverlay();
  }, 5000);
}

function hideOverlay() {
  overlay.className = "special-overlay hidden";
  overlay.innerHTML = "";
}

backBtn.addEventListener("click", goBack);
nextBtn.addEventListener("click", goNext);

renderQuestion();
