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

function addLgbtqTopicQuestionPatch() {
  if (!questions.some((item) => item.id === "lgbtq_topics")) {
    const insertIndex = questions.findIndex((item) => item.id === "ironia");

    const question = {
      id: "lgbtq_topics",
      type: "choice",
      question: "How do you approach LGBTQ+ topics?",
      answers: [
        {
          label: "I respect everyone, but I can also take a joke",
          value: 2
        },
        {
          label: "I do not know much, but I am chill",
          value: 1
        },
        {
          label: "I support the community very actively",
          value: -2
        },
        {
          label: "I am fine with people doing what they want, just do not force opinions on me",
          value: 0
        },
        {
          label: "I prefer avoiding the topic",
          value: 0
        },
        {
          label: "I get uncomfortable with edgy jokes about these topics",
          value: -2
        }
      ]
    };

    if (insertIndex >= 0) {
      questions.splice(insertIndex + 1, 0, question);
    } else {
      questions.push(question);
    }
  }

  const personality = categoryDefinitions?.find((category) => category.id === "personality");

  if (personality && !personality.questionIds.includes("lgbtq_topics")) {
    personality.questionIds.push("lgbtq_topics");
  }
}

addLgbtqTopicQuestionPatch();
addNagisaChoicePatch();
addHeightKawaiiPatch();

if (!state.restartMode && typeof renderQuestion === "function") {
  renderQuestion();
}
