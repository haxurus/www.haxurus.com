function applyPizzaRealImagePatch() {
  const pizza = questions.find((item) => item.id === "pizza");
  if (!pizza) return;

  const pizzaImages = {
    "Buffalo mozzarella & fries": "img/bemyegirl/pizzas/buffalo-mozzarella-fries.jpg",
    "Wurstel & fries": "img/bemyegirl/pizzas/wurstel-fries.jpg",
    "Margherita": "img/bemyegirl/pizzas/margherita.jpg",
    "Diavola": "img/bemyegirl/pizzas/diavola.jpg",
    "Capricciosa": "img/bemyegirl/pizzas/capricciosa.jpg",
    "Four cheese": "img/bemyegirl/pizzas/four-cheese.jpg",
    "With arugula": "img/bemyegirl/pizzas/arugula.jpg",
    "Pineapple": "img/bemyegirl/pizzas/pineapple.jpg"
  };

  pizza.answers.forEach((answer) => {
    if (pizzaImages[answer.label]) {
      answer.image = pizzaImages[answer.label];
      return;
    }

    if (answer.label === "I don't eat pizza") {
      answer.image = makePizzaPlaceholder("No pizza", "🚫", "#9aa4b2");
    }
  });
}

function ensurePizzaImagePatchStyles() {
  if (document.getElementById("pizzaRealImagePatchStyles")) return;

  const style = document.createElement("style");
  style.id = "pizzaRealImagePatchStyles";
  style.textContent = `
    .question-area .image-choice-card img{
      object-fit:cover;
    }

    .question-area .image-choice-card img[src*="pizza-no-pizza"],
    .question-area .image-choice-card img[src^="data:image/svg+xml"]{
      object-fit:contain;
    }

    .question-area .multi-choice-grid.emotional-bugs-full-grid{
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
    }

    .question-area .multi-choice-grid.emotional-bugs-full-grid .answer-btn{
      min-height:54px;
      padding:12px 14px;
      font-size:.86rem;
      line-height:1.22;
    }

    @media (min-width:1180px){
      .question-area .multi-choice-grid.emotional-bugs-full-grid{
        grid-template-columns:repeat(3,minmax(0,1fr));
      }
    }

    @media (min-width:1480px){
      .question-area .multi-choice-grid.emotional-bugs-full-grid{
        grid-template-columns:repeat(4,minmax(0,1fr));
      }
    }
  `;
  document.head.appendChild(style);
}

const cleanupRenderMultiChoiceQuestion = renderMultiChoiceQuestion;
renderMultiChoiceQuestion = function(question, selected, questionNumber) {
  cleanupRenderMultiChoiceQuestion(question, selected, questionNumber);

  if (question.id !== "red_flags" || selected?.mode !== "full") return;

  const grid = questionArea.querySelector(".multi-choice-grid");
  grid?.classList.add("emotional-bugs-full-grid");
};

applyPizzaRealImagePatch();

renderResult = function() {
  const { percentage, result, categories } = calculateResult();
  const routeClass = result.specialClass || "";
  const categoryBreakdown = renderCategoryBreakdown(categories);

  ensureFinalRouteStyles();
  ensureFinalResultLayoutPatchStyles();
  ensurePizzaImagePatchStyles();
  progressBar.style.width = "100%";
  setRestartScreen();

  questionArea.innerHTML = `
    <div class="result-box route-result">
      <p class="quiz-kicker">Final result</p>
      <div class="result-score">${percentage}%</div>
      <h2 class="route-name ${routeClass}">${result.route}</h2>
      <p class="result-text">${result.text}</p>
      ${categoryBreakdown}
    </div>
  `;
};

if (!state.restartMode && typeof renderQuestion === "function") {
  ensurePizzaImagePatchStyles();
  renderQuestion();
}
