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
    question: "Do you understand irony and accept dark humor?",
    blocking: true,
    answers: [
      { label: "Yes", action: "continue" },
      { label: "No", action: "block" },
      { label: "Dark humor?", action: "block" }
    ]
  },
  {
    id: "tronchetto",
    type: "choice",
    question: "Were you born with Clash Royale's Log or with the cave?",
    answers: [
      { label: "The Log", action: "preferenceBlock" },
      { label: "I'm a transformer", action: "preferenceBlock" },
      { label: "I'm confused", value: 0, action: "starterPopup" },
      { label: "The cave", value: 2 }
    ]
  },
  {
    id: "eta",
    type: "choice",
    question: "How old are you?",
    answers: [
      { label: "Under 18", action: "police" },
      { label: "Between 18 and 22", value: 1 },
      { label: "Between 23 and 25", value: 2 },
      { label: "Between 26 and 30", value: -1 },
      { label: "31 or older", value: -2 }
    ]
  },
  {
    id: "cioccolato",
    type: "slider",
    question: "Choose your aesthetic chocolate level",
    min: 0,
    max: 100,
    defaultValue: 20,
    ranges: [
      { min: 0, max: 20, label: "White chocolate", value: 2 },
      { min: 21, max: 40, label: "Milk chocolate", value: 0 },
      { min: 41, max: 60, label: "50% dark chocolate", value: -1 },
      { min: 61, max: 80, label: "75% dark chocolate", value: -2 },
      { min: 81, max: 100, label: "Pure cocoa final boss", value: -3 }
    ]
  },
  {
    id: "altezza",
    type: "choice",
    question: "How tall are you?",
    answers: [
      { label: "Under 1.55 m", value: 1 },
      { label: "1.55 - 1.65 m", value: 2 },
      { label: "1.66 - 1.75 m", value: 1 },
      { label: "1.76 - 1.85 m", value: 0 },
      { label: "Over 1.85 m", value: -1 }
    ]
  },
  {
    id: "reel",
    type: "choice",
    question: "If I send you 12 reels in 5 minutes?",
    answers: [
      { label: "I watch them all and comment", value: 2 },
      { label: "I watch a few and pretend I understood", value: 1 },
      { label: "I only reply “haha”", value: 0 },
      { label: "I mute you", value: -1 },
      { label: "I block you and change identity", value: -2 }
    ]
  },
  {
    id: "pizza",
    type: "choice",
    question: "Choose a pizza",
    answers: [
      { label: "Buffalo mozzarella and fries", value: 2 },
      { label: "Wurstel and fries", value: 0 },
      { label: "Margherica", value: 1 },
      { label: "With arugula", value: -1, action: "cowSound" },
      { label: "Pineapple", value: -3, action: "pineappleEvent" }
    ]
  },
  {
    id: "videogiochi",
    type: "slider",
    question: "How much can you tolerate video games?",
    min: 0,
    max: 100,
    defaultValue: 60,
    ranges: [
      { min: 0, max: 20, label: "They’re a waste of time", value: -2 },
      { min: 21, max: 40, label: "I watch but I don’t understand", value: -1 },
      { min: 41, max: 60, label: "Sometimes it’s fine", value: 0 },
      { min: 61, max: 80, label: "Evening gaming approved", value: 1 },
      { min: 81, max: 100, label: "Duo queue immediately", value: 2 }
    ]
  },
  {
    id: "minecraft",
    type: "choice",
    question: "If I say “Minecraft tonight”?",
    answers: [
      { label: "I build the house, you mine", value: 2 },
      { label: "I’ll join but get lost after 3 minutes", value: 1 },
      { label: "Only if we watch a movie after", value: 1 },
      { label: "Minecraft is for kids", value: -2 },
      { label: "I blow everything up with TNT", value: 0 }
    ]
  },
  {
    id: "drink",
    type: "choice",
    question: "Choose a drink",
    answers: [
      { label: "Aperol Spritz", value: 2 },
      { label: "Coca-Cola", value: 1 },
      { label: "Still water", value: 0 },
      { label: "Monster at 11 PM", value: 1 },
      { label: "I don’t drink anything", value: -1 }
    ]
  },
  {
    id: "gossip",
    type: "slider",
    question: "How ready are you to do useless but essential gossip?",
    min: 0,
    max: 100,
    defaultValue: 80,
    ranges: [
      { min: 0, max: 20, label: "I don’t care about other people’s lives", value: -2 },
      { min: 21, max: 40, label: "I listen, but I don’t participate", value: -1 },
      { min: 41, max: 60, label: "Sometimes it’s fine", value: 0 },
      { min: 61, max: 80, label: "Full analysis of every detail", value: 1 },
      { min: 81, max: 100, label: "I create theories, timelines and photo evidence", value: 2 }
    ]
  },
  {
    id: "anime",
    type: "choice",
    question: "Favorite anime?",
    answers: [
      { label: "Frieren", value: 2 },
      { label: "Sword Art Online", value: 1 },
      { label: "Death Note", value: 1 },
      { label: "I can’t decide", value: 0 },
      { label: "I don’t watch anime", value: -3 }
    ]
  },
  {
    id: "nerd",
    type: "slider",
    question: "How nerdy are you?",
    min: 0,
    max: 100,
    defaultValue: 60,
    ranges: [
      { min: 0, max: 20, label: "I touch grass every day", value: -1 },
      { min: 21, max: 40, label: "Occasional nerd", value: 0 },
      { min: 41, max: 60, label: "I know what Discord is", value: 1 },
      { min: 61, max: 80, label: "I have at least one online game trauma", value: 2 },
      { min: 81, max: 100, label: "My natural habitat is in front of the PC", value: 2 }
    ]
  },
  {
    id: "assenza",
    type: "choice",
    question: "If I don’t reply for a few hours, what do you do?",
    answers: [
      { label: "I check on you because I want to know if you’re alive", value: 2 },
      { label: "I send you a meme to get your attention", value: 2 },
      { label: "I text you “everything okay?”", value: 1 },
      { label: "I wait without saying anything", value: 0 },
      { label: "I disappear too out of principle", value: -2 }
    ]
  },
  {
    id: "principessa_disney",
    type: "imageChoice",
    question: "Quale principessa Disney ti rappresenta di più?",
    answers: [
      { label: "Rapunzel", image: "/img/bemyegirl/rapunzel.png", value: 2 },
      { label: "Belle", image: "/img/bemyegirl/belle.png", value: 1 },
      { label: "Ariel", image: "/img/bemyegirl/ariel.png", value: 1 },
      { label: "Mulan", image: "/img/bemyegirl/mulan.png", value: 2 },
      { label: "Elsa", image: "/img/bemyegirl/elsa.png", value: 0 },
      { label: "Cenerentola", image: "/img/bemyegirl/cenerentola.png", value: -1 },
      { label: "Biancaneve", image: "/img/bemyegirl/biancaneve.png", value: -2 },
      { label: "Merida", image: "/img/bemyegirl/merida.png", value: 1 }
    ]
  },
  {
    id: "appiccicosa",
    type: "choice",
    question: "Quanto sei appiccicosa?",
    answers: [
      { label: "Tipo koala emotivo", value: 2 },
      { label: "Abbastanza, ma con dignità", value: 1 },
      { label: "Normale", value: 0 },
      { label: "Molto indipendente", value: -1 },
      { label: "Ci sentiamo una volta a settimana", value: -2 }
    ]
  },
  {
    id: "film_brutto",
    type: "choice",
    question: "Se ti chiedo di guardare un film brutto",
    answers: [
      { label: "Lo guardo e lo insultiamo insieme", value: 2 },
      { label: "Solo se c’è cibo", value: 1 },
      { label: "Dipende dal film", value: 0 },
      { label: "Mi addormento dopo 10 minuti", value: -1 },
      { label: "No, solo film seri", value: -2 }
    ]
  },
  {
    id: "red_flags",
    type: "multiChoice",
    question: "Scegli le tue red flag personali",
    minValue: -2,
    maxValue: 2,
    answers: [
      { label: "Mi affeziono troppo velocemente", value: 1 },
      { label: "Ho bisogno di conferme", value: 2 },
      { label: "Sono gelosa ma faccio finta di no", value: 2 },
      { label: "Mi offendo e poi mi passa", value: 1 },
      { label: "Voglio attenzioni ma non le chiedo", value: 2 },
      { label: "Faccio screenshot per analizzare tutto", value: 2 },
      { label: "Creo film mentali con pochi indizi", value: 1 },
      { label: "Dico “niente” quando non è niente", value: 1 },
      { label: "Mando meme invece di parlare seriamente", value: 1 },
      { label: "Mi piace essere cercata", value: 2 },
      { label: "Sono lunatica ma simpatica", value: 0 },
      { label: "Piango per i personaggi fictional", value: 1 },
      { label: "Ho bisogno di rassicurazioni", value: 2 },
      { label: "Se mi piace qualcuno divento investigatrice", value: 2 },
      { label: "Visualizzo e poi mi dimentico", value: -1 },
      { label: "Sparisco senza spiegare", value: -2 }
    ]
  },
  {
    id: "gelosia",
    type: "slider",
    question: "Quanto sei gelosa?",
    min: 0,
    max: 100,
    defaultValue: 45,
    ranges: [
      { min: 0, max: 20, label: "Fai quello che vuoi", value: -2 },
      { min: 21, max: 40, label: "Sana gelosia", value: 0 },
      { min: 41, max: 60, label: "Chi è questa?", value: 1 },
      { min: 61, max: 80, label: "Analizzo le storie Instagram", value: 2 },
      { min: 81, max: 100, label: "Dammi il telefono", value: 1 }
    ]
  },
  {
    id: "buonanotte",
    type: "choice",
    question: "Se ti scrivessi “Buonanotte”, come risponderesti?",
    answers: [
      { label: "Buonanotte ❤️", value: 2 },
      { label: "Notteee", value: 1 },
      { label: "Meme disturbante prima di dormire", value: 2 },
      { label: "Visualizzato", value: -2 },
      { label: "notte", value: -1 }
    ]
  },
  {
    id: "litigio",
    type: "choice",
    question: "Se litighiamo per una stupidata",
    answers: [
      { label: "Ne parliamo e poi pace", value: 2 },
      { label: "Prima mi offendo, poi torno", value: 1 },
      { label: "Ti mando un meme per rompere il ghiaccio", value: 2 },
      { label: "Silenzio radio", value: -2 },
      { label: "Faccio finta di niente per 3 giorni", value: -1 }
    ]
  },
  {
    id: "abbracci",
    type: "slider",
    question: "Quanto ti piacciono gli abbracci?",
    min: 0,
    max: 100,
    defaultValue: 65,
    ranges: [
      { min: 0, max: 20, label: "Non mi toccare", value: -2 },
      { min: 21, max: 40, label: "Ogni tanto", value: 0 },
      { min: 41, max: 60, label: "Mi piacciono", value: 1 },
      { min: 61, max: 80, label: "Molto", value: 2 },
      { min: 81, max: 100, label: "Modalità koala permanente", value: 2 }
    ]
  },
  {
    id: "serata_ideale",
    type: "choice",
    question: "Scegli una serata ideale",
    answers: [
      { label: "Film, pizza e coccole", value: 2 },
      { label: "Gaming insieme", value: 2 },
      { label: "Pub tranquillo", value: 1 },
      { label: "Discoteca devastante", value: -1 },
      { label: "Ognuno a casa sua", value: -2 }
    ]
  },
  {
    id: "discord",
    type: "choice",
    question: "Che rapporto hai con Discord?",
    answers: [
      { label: "Ci vivo dentro", value: 2 },
      { label: "Lo uso ogni tanto", value: 1 },
      { label: "Lo conosco ma non lo uso", value: 0 },
      { label: "Non so cos’è", value: -1 },
      { label: "Lo associo solo ai gamer tossici", value: -2 }
    ]
  },
  {
    id: "dolce",
    type: "choice",
    question: "Scegli un dolce",
    answers: [
      { label: "Tiramisù", value: 2 },
      { label: "Cheesecake", value: 1 },
      { label: "Gelato", value: 1 },
      { label: "Frutta", value: -1 },
      { label: "Non mi piacciono i dolci", value: -2 }
    ]
  },
  {
    id: "foto_insieme",
    type: "slider",
    question: "Quanto sei disposta a fare foto insieme?",
    min: 0,
    max: 100,
    defaultValue: 55,
    ranges: [
      { min: 0, max: 20, label: "Zero foto", value: -2 },
      { min: 21, max: 40, label: "Solo se vengo bene", value: 0 },
      { min: 41, max: 60, label: "Ogni tanto", value: 1 },
      { min: 61, max: 80, label: "Foto carine insieme", value: 2 },
      { min: 81, max: 100, label: "Book fotografico di coppia", value: 1 }
    ]
  },
  {
    id: "cosa_cerchi",
    type: "choice",
    question: "Cosa cerchi davvero?",
    answers: [
      { label: "Qualcuno con cui ridere e stare bene", value: 2 },
      { label: "Una relazione dolce ma anche stupida", value: 2 },
      { label: "Una persona presente", value: 1 },
      { label: "Non lo so, vediamo", value: 0 },
      { label: "Far passare il tempo", value: -2 }
    ]
  }
];

const state = {
  currentIndex: 0,
  answers: {},
  restartMode: false
};

const questionArea = document.getElementById("questionArea");
const progressBar = document.getElementById("progressBar");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const overlay = document.getElementById("specialOverlay");

const policeAudio = document.getElementById("policeAudio");
const cowAudio = document.getElementById("cowAudio");
const bellsAudio = new Audio("audio/campane.mp3");
bellsAudio.preload = "auto";

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function getRangeAnswer(question, numericValue) {
  return question.ranges.find((range) => numericValue >= range.min && numericValue <= range.max);
}

function getSelectedAnswer(question) {
  const saved = state.answers[question.id];

  if (!saved) return null;

  if (question.type === "slider") {
    return getRangeAnswer(question, saved.rawValue);
  }

  if (question.type === "multiChoice") {
    return saved;
  }

  return question.answers[saved.answerIndex] || null;
}

function getQuestionValue(question, answer) {
  if (!answer) return null;

  if (question.type === "multiChoice") {
    const selectedIndexes = answer.answerIndexes || [];
    const rawValue = selectedIndexes.reduce((total, answerIndex) => {
      return total + (question.answers[answerIndex]?.value ?? 0);
    }, 0);

    return clamp(rawValue, question.minValue ?? -2, question.maxValue ?? 2);
  }

  return answer.value;
}

function renderQuestion() {
  const question = questions[state.currentIndex];
  const selected = state.answers[question.id];

  state.restartMode = false;
  updateProgress();

  backBtn.disabled = state.currentIndex === 0;
  nextBtn.textContent = state.currentIndex === questions.length - 1 ? "Result" : "Next";
  nextBtn.disabled = !selected && question.type !== "slider";

  const questionNumber = `${state.currentIndex + 1} / ${questions.length}`;

  if (question.type === "choice") {
    renderChoiceQuestion(question, selected, questionNumber);
  }

  if (question.type === "imageChoice") {
    renderImageChoiceQuestion(question, selected, questionNumber);
  }

  if (question.type === "multiChoice") {
    renderMultiChoiceQuestion(question, selected, questionNumber);
  }

  if (question.type === "slider") {
    renderSliderQuestion(question, selected, questionNumber);
  }
}

function renderChoiceQuestion(question, selected, questionNumber) {
  questionArea.innerHTML = `
    <p class="question-number">Question ${questionNumber}</p>
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
    button.addEventListener("click", () => handleSingleAnswer(question, Number(button.dataset.index)));
  });
}

function renderImageChoiceQuestion(question, selected, questionNumber) {
  questionArea.innerHTML = `
    <p class="question-number">Question ${questionNumber}</p>
    <h2 class="question-title">${question.question}</h2>
    <div class="image-choice-grid">
      ${question.answers.map((answer, index) => `
        <button class="image-choice-card ${selected?.answerIndex === index ? "selected" : ""}" type="button" data-index="${index}">
          <img src="${answer.image}" alt="${answer.label}" loading="lazy" />
          <span>${answer.label}</span>
        </button>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".image-choice-card").forEach((button) => {
    button.addEventListener("click", () => handleSingleAnswer(question, Number(button.dataset.index)));
  });
}

function renderMultiChoiceQuestion(question, selected, questionNumber) {
  const selectedIndexes = selected?.answerIndexes || [];

  questionArea.innerHTML = `
    <p class="question-number">Question ${questionNumber}</p>
    <h2 class="question-title">${question.question}</h2>
    <p class="question-hint">Puoi selezionare più risposte.</p>
    <div class="answers-grid multi-choice-grid">
      ${question.answers.map((answer, index) => `
        <button class="answer-btn multi-choice-btn ${selectedIndexes.includes(index) ? "selected" : ""}" type="button" data-index="${index}">
          ${answer.label}
        </button>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".multi-choice-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const answerIndex = Number(button.dataset.index);
      const current = state.answers[question.id]?.answerIndexes || [];
      const next = current.includes(answerIndex)
        ? current.filter((index) => index !== answerIndex)
        : [...current, answerIndex];

      if (next.length === 0) {
        delete state.answers[question.id];
      } else {
        state.answers[question.id] = { answerIndexes: next };
      }

      renderQuestion();
    });
  });
}

function renderSliderQuestion(question, selected, questionNumber) {
  const rawValue = selected?.rawValue ?? question.defaultValue ?? 50;
  const activeRange = getRangeAnswer(question, rawValue);

  if (!selected) {
    state.answers[question.id] = {
      rawValue,
      value: activeRange.value
    };
  }

  questionArea.innerHTML = `
    <p class="question-number">Question ${questionNumber}</p>
    <h2 class="question-title">${question.question}</h2>
    <div class="slider-box">
      <input id="sliderInput" type="range" min="${question.min}" max="${question.max}" value="${rawValue}" />
      <div class="slider-value">
        <span>Value: <strong id="sliderNumber">${rawValue}</strong></span>
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

function handleSingleAnswer(question, answerIndex) {
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

  if (answer.action === "preferenceBlock") {
    renderPreferenceBlocked();
    return;
  }

  if (answer.action === "starterPopup") {
    showStarterPopup();
  }

  if (answer.action === "police") {
    runPoliceEvent();
    return;
  }

  if (answer.action === "cowSound") {
    playAudio(cowAudio);
  }

  if (answer.action === "pineappleEvent") {
    runPineappleEvent();
  }

  renderQuestion();
}

function updateProgress() {
  const progress = ((state.currentIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function handleNextButton() {
  if (state.restartMode) {
    restartQuiz();
    return;
  }

  goNext();
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
  if (state.restartMode) return;

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
    const value = getQuestionValue(question, answer);
    if (value === null || value === undefined) return;

    total += scoreMap[value] ?? 0;
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
      title: "Incompatibility detected",
      text: "The system recommends Discord friendship and emotional safety distance."
    };
  }

  if (percentage <= 50) {
    return {
      title: "Maybe Discord friends",
      text: "There is something here, but we need at least three memes, one pizza, and manual verification."
    };
  }

  if (percentage <= 70) {
    return {
      title: "Interesting compatibility",
      text: "The situation looks promising. The system approves a conversation longer than expected."
    };
  }

  if (percentage <= 85) {
    return {
      title: "Possible match",
      text: "Good compatibility. Proceed with spritz, gossip, and a Minecraft session."
    };
  }

  if (percentage <= 95) {
    return {
      title: "Very high compatibility",
      text: "Suspicious compatibility level. High risk of shared memes and nerdy evenings."
    };
  }

  return {
    title: "Legendary route unlocked",
    text: "The system has detected a final-boss candidate. Immediate human verification required."
  };
}

function setRestartScreen() {
  state.restartMode = true;
  backBtn.disabled = true;
  nextBtn.textContent = "Restart";
  nextBtn.disabled = false;
}

function renderResult() {
  const { percentage, result } = calculateResult();

  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="result-box">
      <p class="quiz-kicker">Final result</p>
      <div class="result-score">${percentage}%</div>
      <h2 class="result-title">${result.title}</h2>
      <p class="result-text">${result.text}</p>
    </div>
  `;
}

function renderBlocked() {
  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="blocked-card">
      <h2>Access denied</h2>
      <p>
        This quiz contains questionable irony. For your emotional safety,
        the system is kindly escorting you to the exit.
      </p>
    </div>
  `;
}

function renderPreferenceBlocked() {
  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="blocked-card">
      <h2>Route not available</h2>
      <p>
        This answer does not match the route this quiz is looking for.
      </p>
    </div>
  `;
}

function showStarterPopup() {
  window.alert("Check in your pants!");
}

function restartQuiz() {
  state.currentIndex = 0;
  state.answers = {};
  state.restartMode = false;
  hideOverlay();
  renderQuestion();
}

function playAudio(audioElement) {
  if (!audioElement) return;

  audioElement.currentTime = 0;
  audioElement.play().catch(() => {
    // Some browsers block automatic audio if there was no interaction.
  });
}

function runPoliceEvent() {
  playAudio(policeAudio);

  overlay.className = "special-overlay";
  overlay.innerHTML = `
    <img class="overlay-photo" src="/img/incarcerato.png" alt="Jailed" />
    <div class="bars"></div>
    <div class="overlay-message">
      🚨 ERROR 113: MINOR DETECTED. Try again when you’re 18 ;)
    </div>
  `;

  backBtn.disabled = true;
  nextBtn.disabled = true;
}

function runPineappleEvent() {
  playAudio(bellsAudio);

  overlay.className = "special-overlay pineapple-overlay";
  overlay.innerHTML = `
    <div class="overlay-message pineapple-verse">
      <p class="verse-ref">Libro della Pizza 3:14</p>
      <p>
        O cieli, abbiate pietà di chi posò l'ananas sulla pizza,
        perché grande fu il peccato e tremante la mozzarella.
      </p>
      <p>
        Che le campane suonino, che il forno perdoni,
        e che nessuna rucola testimoni contro di lei.
      </p>
    </div>
  `;

  window.setTimeout(() => {
    hideOverlay();
  }, 6000);
}

function hideOverlay() {
  overlay.className = "special-overlay hidden";
  overlay.innerHTML = "";
}

backBtn.addEventListener("click", goBack);
nextBtn.addEventListener("click", handleNextButton);

renderQuestion();
