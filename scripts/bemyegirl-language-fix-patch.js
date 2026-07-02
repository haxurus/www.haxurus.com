const baseApplyQuizLanguage = applyQuizLanguage;
const baseRenderLanguageSelector = renderLanguageSelector;
const baseRenderQuestionAfterLanguage = renderQuestion;

applyQuizLanguage = function(language) {
  baseApplyQuizLanguage(language);

  if (language === "it") {
    getResultMessage = getRouteResult;
  }

  const actions = document.querySelector(".quiz-actions");
  if (actions) actions.style.display = "";
};

renderQuestion = function() {
  if (!selectedQuizLanguage) {
    baseRenderLanguageSelector();
    return;
  }

  baseRenderQuestionAfterLanguage();
};

function forceLanguageSelectorOnOpen() {
  selectedQuizLanguage = null;
  localStorage.removeItem("bemyegirl-language");
  baseRenderLanguageSelector();
}

window.addEventListener("load", () => {
  window.setTimeout(forceLanguageSelectorOnOpen, 80);
});

forceLanguageSelectorOnOpen();
