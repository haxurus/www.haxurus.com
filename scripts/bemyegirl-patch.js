const bellsAudioPatch = new Audio("audio/campane.mp3");
bellsAudioPatch.preload = "auto";

function setQuestionText(questionId, questionText, answers) {
  const question = questions.find((item) => item.id === questionId);
  if (!question) return;

  question.question = questionText;

  if (answers) {
    answers.forEach((label, index) => {
      if (question.answers[index]) {
        question.answers[index].label = label;
      }
    });
  }
}

function setQuestionAnswers(questionId, questionText, answers) {
  const question = questions.find((item) => item.id === questionId);
  if (!question) return;

  question.question = questionText;
  question.answers = answers;
}

function getEmotionalBugAnswers() {
  return [
    { label: "Attachment speedrun", value: 2 },
    { label: "Reassurance required", value: 2 },
    { label: "Jealousy.exe running in background", value: 2 },
    { label: "Overthinking every tiny detail", value: 2 },
    { label: "Screenshot evidence folder", value: 1 },
    { label: "Fake scenarios generator", value: 1 },
    { label: "Nothing means everything", value: -1 },
    { label: "Attention needed, request denied", value: 0 },
    { label: "Memes instead of communication", value: -1 },
    { label: "Emotional cooldown needed", value: 0 },
    { label: "Slow trust process", value: 0 },
    { label: "Moody but self-aware", value: 0 },
    { label: "Reply.exe sometimes crashes", value: -2 },
    { label: "Mind reading expected", value: -2 },
    { label: "Arguments for attention", value: -2 },
    { label: "Ghost mode without warning", value: -2 },
    { label: "I analyze tone changes like forensic evidence", value: 2 },
    { label: "I reread old messages for emotional damage", value: 1 },
    { label: "I need daily proof that you still like me", value: 2 },
    { label: "I get quiet when I care too much", value: 1 },
    { label: "I say 'it's fine' when it is absolutely not fine", value: 0 },
    { label: "I create entire relationship arcs from one interaction", value: 2 },
    { label: "I pretend not to care and then care aggressively", value: 1 },
    { label: "I test people without telling them there is a test", value: -1 },
    { label: "I want to be chased but act unavailable", value: 1 },
    { label: "I need attention but act independent", value: 1 },
    { label: "I get jealous of people I have never met", value: 2 },
    { label: "I remember tiny details and use them as evidence", value: 1 },
    { label: "I disappear to see if you notice", value: -2 },
    { label: "I communicate better through reposts", value: 1 },
    { label: "I need a loading screen before talking about feelings", value: 0 },
    { label: "I am self-aware but still problematic", value: 0 },
    { label: "I apologize and then overthink the apology", value: 1 },
    { label: "I turn small problems into season finales", value: 1 },
    { label: "I expect princess treatment but deny it", value: 2 },
    { label: "I stalk your playlists for emotional clues", value: 1 },
    { label: "I check your online status like it owes me money", value: 2 },
    { label: "I write the message, delete it, then act normal", value: -2 },
    { label: "I need reassurance after my own overthinking", value: 2 },
    { label: "I forgive fast but remember everything", value: 0 },
    { label: "I go offline instead of explaining what is wrong", value: -1 },
    { label: "I win arguments in my head before they happen", value: 0 },
    { label: "I say I am low maintenance, then require lore updates", value: 1 },
    { label: "I panic when someone is too nice to me", value: 1 },
    { label: "I need affection but get embarrassed receiving it", value: 1 },
    { label: "I can be dramatic, but at least I am funny", value: 1 }
  ];
}

function getShortEmotionalBugAnswers(fullAnswers) {
  const shortLabels = [
    "Attachment speedrun",
    "Reassurance required",
    "Screenshot evidence folder",
    "Emotional cooldown needed",
    "I panic when someone is too nice to me",
    "Reply.exe sometimes crashes",
    "Mind reading expected",
    "Ghost mode without warning"
  ];

  return shortLabels
    .map((label) => fullAnswers.find((answer) => answer.label === label))
    .filter(Boolean);
}

function translateQuizToEnglish() {
  setQuestionText("principessa_disney", "Which Disney princess represents you the most?", [
    "Rapunzel",
    "Belle",
    "Ariel",
    "Mulan",
    "Elsa",
    "Cinderella",
    "Snow White",
    "Merida"
  ]);

  setQuestionText("appiccicosa", "How clingy are you?", [
    "Emotional koala mode",
    "Quite a bit, but with dignity",
    "Normal",
    "Very independent",
    "We talk once a week"
  ]);

  setQuestionText("film_brutto", "If I ask you to watch a bad movie", [
    "I watch it and we roast it together",
    "Only if there is food",
    "Depends on the movie",
    "I fall asleep after 10 minutes",
    "No, serious movies only"
  ]);

  const emotionalBugAnswers = getEmotionalBugAnswers();
  setQuestionAnswers("red_flags", "Choose your emotional bugs", emotionalBugAnswers);

  const redFlags = questions.find((item) => item.id === "red_flags");
  if (redFlags) {
    redFlags.fullAnswers = emotionalBugAnswers;
    redFlags.shortAnswers = getShortEmotionalBugAnswers(emotionalBugAnswers);
    redFlags.answers = redFlags.fullAnswers;
    redFlags.shortMinValue = -2;
    redFlags.shortMaxValue = 4;
    redFlags.fullMinValue = -16;
    redFlags.fullMaxValue = 28;
  }

  setQuestionText("gelosia", "How jealous are you?");
  const jealousy = questions.find((item) => item.id === "gelosia");
  if (jealousy?.ranges) {
    jealousy.ranges[0].label = "Do whatever you want";
    jealousy.ranges[1].label = "Healthy jealousy";
    jealousy.ranges[2].label = "Who is this?";
    jealousy.ranges[3].label = "I analyze Instagram stories";
    jealousy.ranges[4].label = "Give me your phone";
  }

  setQuestionText("buonanotte", "If I texted you 'Goodnight', how would you reply?", [
    "Goodnight ❤️",
    "Nighttt",
    "Disturbing meme before sleeping",
    "Left on read",
    "night"
  ]);

  setQuestionText("litigio", "If we argue over something stupid", [
    "We talk about it and then make peace",
    "First I get offended, then I come back",
    "I send you a meme to break the ice",
    "Radio silence",
    "I pretend nothing happened for 3 days"
  ]);

  setQuestionText("abbracci", "How much do you like hugs?");
  const hugs = questions.find((item) => item.id === "abbracci");
  if (hugs?.ranges) {
    hugs.ranges[0].label = "Do not touch me";
    hugs.ranges[1].label = "Sometimes";
    hugs.ranges[2].label = "I like them";
    hugs.ranges[3].label = "A lot";
    hugs.ranges[4].label = "Permanent koala mode";
  }

  setQuestionText("serata_ideale", "Choose an ideal evening", [
    "Movie, pizza and cuddles",
    "Gaming together",
    "Quiet pub",
    "Chaotic club night",
    "Everyone at their own home"
  ]);

  setQuestionText("discord", "What is your relationship with Discord?", [
    "I live there",
    "I use it sometimes",
    "I know it but do not use it",
    "I do not know what it is",
    "I only associate it with toxic gamers"
  ]);

  setQuestionText("dolce", "Choose a dessert", [
    "Tiramisu",
    "Cheesecake",
    "Ice cream",
    "Fruit",
    "I do not like desserts"
  ]);

  setQuestionText("foto_insieme", "How willing are you to take photos together?");
  const photos = questions.find((item) => item.id === "foto_insieme");
  if (photos?.ranges) {
    photos.ranges[0].label = "No photos";
    photos.ranges[1].label = "Only if I look good";
    photos.ranges[2].label = "Sometimes";
    photos.ranges[3].label = "Cute photos together";
    photos.ranges[4].label = "Couple photoshoot";
  }

  setQuestionText("cosa_cerchi", "What are you actually looking for?", [
    "Someone to laugh and feel good with",
    "A sweet but also stupid relationship",
    "Someone present",
    "I do not know, let us see",
    "Just passing time"
  ]);
}

function addProfileQuestions() {
  if (questions.some((question) => question.id === "origine")) return;

  questions.push(
    {
      id: "origine",
      type: "choice",
      question: "Where were you spawned?",
      answers: [
        { label: "Northern Italy", value: 2 },
        { label: "Central Italy", value: 1 },
        { label: "Southern Italy / Islands", value: 1 },
        { label: "Europe", value: 0 },
        { label: "Outside Europe", value: 0 },
        { label: "I do not know, I was just spawned", value: 2 }
      ]
    },
    {
      id: "dove_abiti_ora",
      type: "choice",
      question: "Where do you live now?",
      answers: [
        { label: "Near Milan", value: 2 },
        { label: "Lombardy", value: 1 },
        { label: "Northern Italy", value: 0 },
        { label: "Italy, but far away", value: -1 },
        { label: "Abroad", value: -2 },
        { label: "In your heart", value: 2 }
      ]
    },
    {
      id: "colore_occhi",
      type: "choice",
      question: "What color are your eyes?",
      answers: [
        { label: "Blue", value: 1 },
        { label: "Green", value: 2 },
        { label: "Brown", value: 0 },
        { label: "Hazel", value: 0 },
        { label: "Gray", value: 1 },
        { label: "Black / very dark", value: 0 },
        { label: "They change color depending on my mood", value: -2 }
      ]
    },
    {
      id: "colore_capelli",
      type: "choice",
      question: "What color is your hair in the current lore?",
      answers: [
        { label: "Blonde", value: 2 },
        { label: "Brown", value: 1 },
        { label: "Black", value: 1 },
        { label: "Red / copper", value: -2 },
        { label: "Colored / dyed", value: 0 },
        { label: "White / silver", value: -1 },
        { label: "Depends on my latest breakdown", value: 0 }
      ]
    },
    {
      id: "segni_particolari",
      type: "multiChoice",
      question: "What are your main-character details?",
      minValue: -2,
      maxValue: 2,
      answers: [
        { label: "Small side nose stud", value: 2 },
        { label: "Septum piercing", value: -2 },
        { label: "Tongue piercing", value: -1 },
        { label: "Belly button piercing", value: 2 },
        { label: "Earrings", value: 2 },
        { label: "Multiple ear piercings", value: 1 },
        { label: "Other piercings", value: 0 },
        { label: "Tattoos", value: -2 },
        { label: "Scars", value: 0 },
        { label: "Braces", value: 2 },
        { label: "Freckles", value: 2 },
        { label: "Distinctive beauty marks", value: 0 },
        { label: "Glasses", value: 2 },
        { label: "Dimples", value: 2 },
        { label: "None", value: 0 },
        { label: "I am the rare detail", value: 2 }
      ]
    }
  );
}

function reorderQuestions() {
  const orderedIds = [
    "ironia",
    "tronchetto",
    "eta",
    "origine",
    "dove_abiti_ora",
    "altezza",
    "cioccolato",
    "colore_occhi",
    "colore_capelli",
    "segni_particolari",
    "principessa_disney",
    "appiccicosa",
    "gelosia",
    "red_flags",
    "assenza",
    "buonanotte",
    "litigio",
    "abbracci",
    "foto_insieme",
    "cosa_cerchi",
    "reel",
    "gossip",
    "nerd",
    "videogiochi",
    "minecraft",
    "discord",
    "anime",
    "pizza",
    "drink",
    "dolce",
    "film_brutto",
    "serata_ideale"
  ];

  const byId = new Map(questions.map((question) => [question.id, question]));
  const orderedQuestions = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean);
  const remainingQuestions = questions.filter((question) => !orderedIds.includes(question.id));

  questions.splice(0, questions.length, ...orderedQuestions, ...remainingQuestions);
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

    .bug-version-grid{
      display:grid;
      grid-template-columns:1fr;
      gap:14px;
      margin-top:22px;
    }

    .bug-version-card{
      border:1px solid rgba(255,255,255,.14);
      border-radius:22px;
      padding:20px;
      color:#f8fff9;
      background:rgba(255,255,255,.08);
      box-shadow:0 18px 46px rgba(0,0,0,.24);
      cursor:pointer;
      text-align:left;
      transition:transform .16s ease,border-color .16s ease,background .16s ease;
    }

    .bug-version-card:hover,
    .bug-version-card:focus-visible{
      transform:translateY(-2px);
      border-color:rgba(57,255,20,.45);
      background:rgba(57,255,20,.10);
      outline:none;
    }

    .bug-version-card strong{
      display:block;
      margin-bottom:6px;
      font-size:1.02rem;
    }

    .bug-version-card span{
      display:block;
      color:rgba(248,255,249,.72);
      font-size:.92rem;
      line-height:1.5;
    }

    .bug-version-change{
      margin:0 0 16px;
      border:1px solid rgba(255,255,255,.14);
      border-radius:999px;
      padding:8px 13px;
      color:#d7ffbc;
      background:rgba(255,255,255,.07);
      cursor:pointer;
      font-size:.76rem;
      font-weight:900;
      letter-spacing:.08em;
      text-transform:uppercase;
    }

    @media (min-width:720px){
      .bug-version-grid{
        grid-template-columns:1fr 1fr;
      }
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
    <div class="overlay-message pineapple-verse" role="dialog" aria-modal="true" aria-label="Judgment on pineapple pizza">
      <p class="verse-ref">Book of Pizza 3:14</p>
      <p>
        O heavens, have mercy on the one who placed pineapple upon pizza,
        for great was the sin and trembling was the mozzarella.
      </p>
      <p>
        Let the bells ring, let the oven forgive,
        and let no arugula testify against her.
      </p>
      <button class="verse-close" type="button" id="closePineappleVerse">
        I ask forgiveness
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

function renderEmotionalBugsVersionSelector(question, questionNumber) {
  ensurePineappleVerseStyles();
  nextBtn.disabled = true;

  questionArea.innerHTML = `
    <p class="question-number">Question ${questionNumber}</p>
    <h2 class="question-title">${question.question}</h2>
    <p class="question-hint">Choose how many options you want to see.</p>
    <div class="bug-version-grid">
      <button class="bug-version-card" type="button" data-mode="short">
        <strong>Short version</strong>
        <span>8 selected options. Faster and cleaner.</span>
      </button>
      <button class="bug-version-card" type="button" data-mode="full">
        <strong>Full version</strong>
        <span>All emotional bugs. Full chaos mode.</span>
      </button>
    </div>
  `;

  document.querySelectorAll(".bug-version-card").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;
      question.answers = mode === "short" ? question.shortAnswers : question.fullAnswers;
      state.answers[question.id] = {
        mode,
        answerIndexes: []
      };
      renderQuestion();
    });
  });
}

renderMultiChoiceQuestion = function(question, selected, questionNumber) {
  if (question.id === "red_flags" && !selected?.mode) {
    renderEmotionalBugsVersionSelector(question, questionNumber);
    return;
  }

  if (question.id === "red_flags" && selected?.mode) {
    question.answers = selected.mode === "short" ? question.shortAnswers : question.fullAnswers;
  }

  const selectedIndexes = selected?.answerIndexes || [];
  nextBtn.disabled = selectedIndexes.length === 0;

  questionArea.innerHTML = `
    <p class="question-number">Question ${questionNumber}</p>
    <h2 class="question-title">${question.question}</h2>
    ${question.id === "red_flags" ? `<button class="bug-version-change" type="button" id="changeBugVersion">Change version</button>` : ""}
    <p class="question-hint">You can select multiple answers.</p>
    <div class="answers-grid multi-choice-grid">
      ${question.answers.map((answer, index) => `
        <button class="answer-btn multi-choice-btn ${selectedIndexes.includes(index) ? "selected" : ""}" type="button" data-index="${index}">
          ${answer.label}
        </button>
      `).join("")}
    </div>
  `;

  document.getElementById("changeBugVersion")?.addEventListener("click", () => {
    delete state.answers[question.id];
    question.answers = question.fullAnswers;
    renderQuestion();
  });

  document.querySelectorAll(".multi-choice-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const answerIndex = Number(button.dataset.index);
      const current = state.answers[question.id]?.answerIndexes || [];
      const next = current.includes(answerIndex)
        ? current.filter((index) => index !== answerIndex)
        : [...current, answerIndex];

      if (next.length === 0) {
        state.answers[question.id] = question.id === "red_flags"
          ? { mode: selected?.mode || "full", answerIndexes: [] }
          : undefined;

        if (question.id !== "red_flags") {
          delete state.answers[question.id];
        }
      } else {
        state.answers[question.id] = {
          mode: selected?.mode,
          answerIndexes: next
        };
      }

      renderQuestion();
    });
  });
};

const baseGetQuestionValuePatch = getQuestionValue;
getQuestionValue = function(question, answer) {
  if (question.id === "red_flags" && answer) {
    const mode = answer.mode === "short" ? "short" : "full";
    const answerPool = mode === "short" ? question.shortAnswers : question.fullAnswers;
    const selectedIndexes = answer.answerIndexes || [];
    const rawValue = selectedIndexes.reduce((total, answerIndex) => {
      return total + (answerPool[answerIndex]?.value ?? 0);
    }, 0);
    const minValue = mode === "short" ? question.shortMinValue : question.fullMinValue;
    const maxValue = mode === "short" ? question.shortMaxValue : question.fullMaxValue;

    return clamp(rawValue, minValue, maxValue);
  }

  return baseGetQuestionValuePatch(question, answer);
};

translateQuizToEnglish();
addProfileQuestions();
reorderQuestions();
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

if (!state.restartMode && typeof renderQuestion === "function") {
  renderQuestion();
}
