const baseApplyQuizLanguage = applyQuizLanguage;
const baseRenderQuestionAfterLanguage = renderQuestion;
const baseGoNextAfterLanguage = goNext;
const baseGoBackAfterLanguage = goBack;

function showQuizControls() {
  const actions = document.querySelector(".quiz-actions");
  if (actions) {
    actions.style.display = "";
    actions.hidden = false;
  }
}

function insertLanguageStep() {
  if (questions.some((question) => question.id === "language_select")) return;

  questions.unshift({
    id: "language_select",
    type: "languageChoice",
    blocking: true,
    question: "Scegli la lingua",
    answers: [
      { label: "Italiano", value: 0, language: "it" },
      { label: "English", value: 0, language: "en" }
    ]
  });
}

function renderLanguageStep() {
  state.restartMode = false;
  progressBar.style.width = "0%";
  backBtn.disabled = true;
  nextBtn.disabled = true;
  nextBtn.textContent = "Next";

  questionArea.innerHTML = `
    <div class="language-choice-box">
      <p class="quiz-kicker">Language / Lingua</p>
      <h2>Scegli la lingua</h2>
      <p>Puoi fare il quiz in italiano o in inglese.</p>
      <div class="language-choice-grid">
        <button type="button" data-language-choice="it">Italiano</button>
        <button type="button" data-language-choice="en">English</button>
      </div>
    </div>
  `;

  questionArea.querySelectorAll("[data-language-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.getAttribute("data-language-choice");
      selectedQuizLanguage = language;
      baseApplyQuizLanguage(language);
      if (language === "it") getResultMessage = getRouteResult;
      showQuizControls();
      state.answers.language_select = { answerIndex: language === "it" ? 0 : 1, value: 0, language };
      state.currentIndex = 1;
      baseRenderQuestionAfterLanguage();
    });
  });
}

applyQuizLanguage = function(language) {
  selectedQuizLanguage = language;
  baseApplyQuizLanguage(language);
  if (language === "it") getResultMessage = getRouteResult;
  showQuizControls();
};

renderQuestion = function() {
  const question = questions[state.currentIndex];
  if (question?.id === "language_select") {
    ensureLanguageSelectorStyles();
    renderLanguageStep();
    return;
  }

  showQuizControls();
  baseRenderQuestionAfterLanguage();
};

goNext = function() {
  if (questions[state.currentIndex]?.id === "language_select") return;
  baseGoNextAfterLanguage();
};

goBack = function() {
  if (state.currentIndex <= 1) {
    state.currentIndex = 0;
    renderQuestion();
    return;
  }

  baseGoBackAfterLanguage();
};

restartQuiz = function() {
  state.currentIndex = 0;
  state.answers = {};
  state.restartMode = false;
  selectedQuizLanguage = null;
  hideOverlay();
  renderQuestion();
};

insertLanguageStep();
state.currentIndex = 0;
selectedQuizLanguage = null;
localStorage.removeItem("bemyegirl-language");
renderQuestion();
