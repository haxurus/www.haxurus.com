const baseApplyQuizLanguage = applyQuizLanguage;

applyQuizLanguage = function(language) {
  baseApplyQuizLanguage(language);

  if (language === "it") {
    getResultMessage = getRouteResult;
  }
};

localStorage.removeItem("bemyegirl-language");
renderLanguageSelector();
