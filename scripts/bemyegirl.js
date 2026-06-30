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
    { label: "I'm a trans(former)", action: "preferenceBlock" },
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
      { label: "Pineapple", value: -3, action: "exorcistEvent" }
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
  nextBtn.textContent = state.currentIndex === questions.length - 1 ? "Result" : "Next";
  nextBtn.disabled = !selected && question.type !== "slider";

  const questionNumber = `${state.currentIndex + 1} / ${questions.length}`;

  if (question.type === "choice") {
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

function renderResult() {
  const { percentage, result } = calculateResult();

  progressBar.style.width = "100%";
  backBtn.disabled = true;
  nextBtn.textContent = "Restart";
  nextBtn.disabled = false;
  nextBtn.onclick = restartQuiz;

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
  backBtn.disabled = true;
  nextBtn.textContent = "Restart";
  nextBtn.disabled = false;
  nextBtn.onclick = restartQuiz;

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
  backBtn.disabled = true;
  nextBtn.textContent = "Restart";
  nextBtn.disabled = false;
  nextBtn.onclick = restartQuiz;

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
  nextBtn.onclick = null;
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

function runExorcistEvent() {
  playAudio(exorcistAudio);

  overlay.className = "special-overlay";
  overlay.innerHTML = `
    <img class="exorcist-gif" src="/img/esorcista.gif" alt="Exorcist event" />
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
