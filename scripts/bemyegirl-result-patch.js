scoreMap[3] = 12;
scoreMap["-4"] = -10;

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

    @media (min-width:1024px){
      .question-area .image-choice-grid{
        grid-template-columns:repeat(3,minmax(0,1fr));
      }
    }
  `;
  document.head.appendChild(style);
}

applyPizzaImageQuestionPatch();

renderResult = function() {
  const { percentage, result } = calculateResult();
  const routeClass = result.specialClass || "";
  const routeImage = result.image
    ? `<div class="route-image-wrap"><img class="route-image" src="${result.image}" alt="${result.route}" loading="lazy"></div>`
    : "";

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
    </div>
  `;
};

if (!state.restartMode && typeof renderQuestion === "function") {
  ensureFinalResultLayoutPatchStyles();
  renderQuestion();
}