scoreMap[3] = 12;
scoreMap["-4"] = -10;

const categoryDefinitions = [
  {
    id: "appearance",
    label: "Appearance",
    questionIds: ["altezza", "cioccolato", "colore_occhi", "colore_capelli", "segni_particolari"]
  },
  {
    id: "personality",
    label: "Personality",
    questionIds: ["appiccicosa", "gelosia", "red_flags", "assenza", "buonanotte", "litigio"]
  },
  {
    id: "relationship",
    label: "Relationship vibe",
    questionIds: ["origine", "dove_abiti_ora", "abbracci", "foto_insieme", "cosa_cerchi", "serata_ideale"]
  },
  {
    id: "nerd",
    label: "Nerd compatibility",
    questionIds: ["videogiochi", "minecraft", "discord", "anime"]
  },
  {
    id: "lifestyle",
    label: "Lifestyle / Taste",
    questionIds: ["pizza", "drink", "dolce", "film_brutto", "gossip"]
  }
];

function makePizzaPlaceholder(title, emoji, accent = "#39ff14") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      <defs>
        <radialGradient id="glow" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.34"/>
          <stop offset="58%" stop-color="#0f2a1e" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#06100c" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1a3328"/>
          <stop offset="100%" stop-color="#07100d"/>
        </linearGradient>
      </defs>
      <rect width="640" height="640" rx="54" fill="url(#card)"/>
      <rect x="22" y="22" width="596" height="596" rx="42" fill="url(#glow)" stroke="rgba(255,255,255,.22)" stroke-width="3"/>
      <circle cx="320" cy="266" r="158" fill="rgba(255,255,255,.08)"/>
      <text x="320" y="318" text-anchor="middle" font-size="150" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
      <text x="320" y="500" text-anchor="middle" fill="#f7fff9" font-size="38" font-weight="800" font-family="Inter, Arial, sans-serif">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function applyPizzaImageQuestionPatch() {
  const pizza = questions.find((item) => item.id === "pizza");
  if (!pizza) return;

  pizza.type = "imageChoice";
  pizza.question = "Choose a pizza";
  delete pizza.minValue;
  delete pizza.maxValue;
  pizza.answers = [
    {
      label: "Buffalo mozzarella & fries",
      image: makePizzaPlaceholder("Buffalo & fries", "🍕", "#39ff14"),
      value: 3
    },
    {
      label: "Wurstel & fries",
      image: makePizzaPlaceholder("Wurstel & fries", "🍟", "#d7ffbc"),
      value: 2
    },
    {
      label: "Margherita",
      image: makePizzaPlaceholder("Margherita", "🍅", "#ff6b6b"),
      value: 1
    },
    {
      label: "Diavola",
      image: makePizzaPlaceholder("Diavola", "🌶️", "#ff4d4d"),
      value: 0
    },
    {
      label: "Capricciosa",
      image: makePizzaPlaceholder("Capricciosa", "🍄", "#f0d28a"),
      value: 0
    },
    {
      label: "Four cheese",
      image: makePizzaPlaceholder("Four cheese", "🧀", "#ffe066"),
      value: 0
    },
    {
      label: "With arugula",
      image: makePizzaPlaceholder("Arugula", "🥬", "#7CFF9B"),
      value: -1,
      action: "cowSound"
    },
    {
      label: "Pineapple",
      image: makePizzaPlaceholder("Pineapple", "🍍", "#ffd166"),
      value: -3,
      action: "pineappleEvent"
    },
    {
      label: "I don't eat pizza",
      image: makePizzaPlaceholder("No pizza", "🚫", "#9aa4b2"),
      value: -4
    }
  ];
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

  if (percentage <= 90) {
    return {
      route: "Possible Egirl Route",
      title: "Possible match",
      text: "Good compatibility. Proceed with spritz, gossip, and a Minecraft session.",
      image: "img/bemyegirl/routes/possible-egirl-route.png"
    };
  }

  return {
    route: "Legendary Egirl Route",
    title: "Legendary route unlocked",
    text: "The system has detected a final-boss candidate. Immediate human verification required.",
    image: "img/bemyegirl/routes/legendary-egirl-route.png"
  };
}

function getNumericValues(question) {
  if (question.type === "slider") {
    return (question.ranges || [])
      .map((range) => range.value)
      .filter((value) => typeof value === "number");
  }

  return (question.answers || [])
    .map((answer) => answer.value)
    .filter((value) => typeof value === "number");
}

function getQuestionRange(question) {
  if (question.type === "multiChoice") {
    const values = getNumericValues(question);
    const positiveTotal = values.filter((value) => value > 0).reduce((total, value) => total + value, 0);
    const negativeTotal = values.filter((value) => value < 0).reduce((total, value) => total + value, 0);

    return {
      min: question.minValue ?? negativeTotal ?? -2,
      max: question.maxValue ?? positiveTotal ?? 2
    };
  }

  const values = getNumericValues(question);
  if (!values.length) return { min: 0, max: 2 };

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

function normalizeQuestionPercentage(question, value) {
  if (value === null || value === undefined) return null;

  const { min, max } = getQuestionRange(question);
  if (max === min) return 100;

  return clamp(Math.round(((value - min) / (max - min)) * 100), 0, 100);
}

function getQuestionScore(question, value) {
  if (value === null || value === undefined) return null;

  if (Object.prototype.hasOwnProperty.call(scoreMap, value)) {
    return scoreMap[value];
  }

  const normalized = normalizeQuestionPercentage(question, value);
  if (normalized === null) return null;

  return Math.round((normalized / 100) * 10);
}

function getQuestionMaxScore(question) {
  const { max } = getQuestionRange(question);

  if (Object.prototype.hasOwnProperty.call(scoreMap, max)) {
    return scoreMap[max];
  }

  return 10;
}

function calculateCategoryBreakdown() {
  return categoryDefinitions.map((category) => {
    const scores = category.questionIds
      .map((questionId) => {
        const question = questions.find((item) => item.id === questionId);
        if (!question || question.blocking) return null;

        const answer = state.answers[question.id];
        const value = getQuestionValue(question, answer);
        return normalizeQuestionPercentage(question, value);
      })
      .filter((score) => score !== null && score !== undefined);

    const percentage = scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0;

    return {
      ...category,
      percentage,
      answered: scores.length
    };
  });
}

function getCategoryHighlights(categories) {
  const available = categories.filter((category) => category.answered > 0);
  if (!available.length) return { strongest: null, weakest: null };

  const sorted = [...available].sort((a, b) => b.percentage - a.percentage);

  return {
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1]
  };
}

function renderCategoryBreakdown(categories) {
  const { strongest, weakest } = getCategoryHighlights(categories);
  const highlightText = strongest && weakest
    ? `<p class="category-summary"><strong>Strongest:</strong> ${strongest.label} · <strong>Weakest:</strong> ${weakest.label}</p>`
    : "";

  return `
    <section class="category-breakdown" aria-label="Category breakdown">
      <p class="quiz-kicker">Category breakdown</p>
      ${highlightText}
      <div class="category-breakdown-grid">
        ${categories.map((category) => `
          <div class="category-breakdown-item">
            <div class="category-breakdown-head">
              <span>${category.label}</span>
              <strong>${category.percentage}%</strong>
            </div>
            <div class="category-breakdown-bar" aria-hidden="true">
              <span style="width:${category.percentage}%"></span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

calculateResult = function() {
  let total = 0;
  let max = 0;

  questions.forEach((question) => {
    if (question.blocking) return;

    const answer = state.answers[question.id];
    const value = getQuestionValue(question, answer);
    const score = getQuestionScore(question, value);
    if (score === null || score === undefined) return;

    total += score;
    max += getQuestionMaxScore(question);
  });

  const percentage = max > 0
    ? Math.max(0, Math.min(100, Math.round((total / max) * 100)))
    : 0;

  return {
    total,
    max,
    percentage,
    result: getResultMessage(percentage),
    categories: calculateCategoryBreakdown()
  };
};

function ensureFinalResultLayoutPatchStyles() {
  if (document.getElementById("finalResultLayoutPatchStyles")) return;

  const style = document.createElement("style");
  style.id = "finalResultLayoutPatchStyles";
  style.textContent = `
    .result-box.route-result .result-text{
      margin-bottom:22px;
    }

    .result-box.route-result .route-image-wrap{
      margin:0 auto 0;
    }

    .category-breakdown{
      max-width:760px;
      margin:30px auto 0;
      border:1px solid rgba(255,255,255,.14);
      border-radius:24px;
      padding:20px;
      background:rgba(255,255,255,.065);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 42px rgba(0,0,0,.18);
      text-align:left;
    }

    .category-breakdown .quiz-kicker{
      margin-bottom:14px;
    }

    .category-summary{
      margin:0 0 16px;
      color:rgba(245,255,248,.78);
      font-size:.95rem;
      font-weight:800;
      line-height:1.5;
      text-align:left;
    }

    .category-summary strong{
      color:#d7ffbc;
    }

    .category-breakdown-grid{
      display:grid;
      gap:12px;
    }

    .category-breakdown-item{
      display:grid;
      gap:8px;
    }

    .category-breakdown-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      color:rgba(245,255,248,.92);
      font-size:.94rem;
      font-weight:900;
    }

    .category-breakdown-head strong{
      color:#c9ffd4;
    }

    .category-breakdown-bar{
      height:9px;
      border:1px solid rgba(255,255,255,.13);
      border-radius:999px;
      background:rgba(255,255,255,.08);
      overflow:hidden;
    }

    .category-breakdown-bar span{
      display:block;
      height:100%;
      border-radius:inherit;
      background:linear-gradient(90deg,#39ff14,#d7ffbc);
      box-shadow:0 0 18px rgba(57,255,20,.36);
    }

    @media (min-width:1024px){
      .question-area .image-choice-grid{
        grid-template-columns:repeat(3,minmax(0,1fr));
      }

      .category-breakdown-grid{
        grid-template-columns:1fr 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

applyPizzaImageQuestionPatch();
getResultMessage = getRouteResult;

renderResult = function() {
  const { percentage, result, categories } = calculateResult();
  const routeClass = result.specialClass || "";
  const routeImage = result.image
    ? `<div class="route-image-wrap"><img class="route-image" src="${result.image}" alt="${result.route}" loading="lazy"></div>`
    : "";
  const categoryBreakdown = renderCategoryBreakdown(categories);

  ensureFinalRouteStyles();
  ensureFinalResultLayoutPatchStyles();
  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="result-box route-result">
      <p class="quiz-kicker">Final result</p>
      <div class="result-score">${percentage}%</div>
      <h2 class="route-name ${routeClass}">${result.route}</h2>
      <p class="result-text">${result.text}</p>
      ${routeImage}
      ${categoryBreakdown}
    </div>
  `;
};

if (!state.restartMode && typeof renderQuestion === "function") {
  ensureFinalResultLayoutPatchStyles();
  renderQuestion();
}