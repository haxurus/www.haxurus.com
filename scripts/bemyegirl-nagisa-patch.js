const susAudioPatch = new Audio("audio/sus.mp3");
susAudioPatch.preload = "auto";

const kawaiiAudioPatch = new Audio("audio/kawaii.mp3");
kawaiiAudioPatch.preload = "auto";

function addNagisaChoicePatch() {
  const question = questions.find((item) => item.id === "principessa_disney");
  if (!question) return;
  if (question.answers.some((answer) => answer.label === "Nagisa Shiota")) return;

  question.answers.push({
    label: "Nagisa Shiota",
    image: "/img/bemyegirl/nagisashiota.png",
    value: 0,
    action: "susSound"
  });
}

function addHeightKawaiiPatch() {
  const question = questions.find((item) => item.id === "altezza");
  if (!question) return;

  question.answers.forEach((answer, index) => {
    if (index === 0 || index === 1) {
      answer.action = "kawaiiSound";
    }
  });
}

const nagisaBaseHandleSingleAnswer = handleSingleAnswer;
handleSingleAnswer = function(question, answerIndex) {
  const answer = question.answers[answerIndex];

  if (answer?.action === "kawaiiSound") {
    state.answers[question.id] = {
      answerIndex,
      value: answer.value ?? null,
      action: answer.action ?? null
    };

    playAudio(kawaiiAudioPatch);
    renderQuestion();
    return;
  }

  if (answer?.action !== "susSound") {
    nagisaBaseHandleSingleAnswer(question, answerIndex);
    return;
  }

  state.answers[question.id] = {
    answerIndex,
    value: answer.value ?? null,
    action: answer.action ?? null
  };

  playAudio(susAudioPatch);
  renderQuestion();

  window.setTimeout(() => {
    if (state.currentIndex < questions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
      return;
    }

    renderResult();
  }, 1000);
};

addNagisaChoicePatch();
addHeightKawaiiPatch();

if (!state.restartMode && typeof renderQuestion === "function") {
  renderQuestion();
}
