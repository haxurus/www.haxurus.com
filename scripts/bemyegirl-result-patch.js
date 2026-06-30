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
  `;
  document.head.appendChild(style);
}

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
