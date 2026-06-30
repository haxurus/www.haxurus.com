const bellsAudio = new Audio("audio/campane.mp3");
bellsAudio.preload = "auto";

function runPineappleVerseEvent() {
  playAudio(bellsAudio);

  overlay.className = "special-overlay";
  overlay.innerHTML = `
    <div class="overlay-message pineapple-verse">
      <p class="verse-ref">Libro della Pizza 3:14</p>
      <p>
        O cieli, abbiate pietà di chi posò l'ananas sulla pizza,
        perché grande fu il peccato e tremante la mozzarella.
      </p>
      <p>
        Che le campane suonino, che il forno perdoni,
        e che nessuna rucola testimoni contro di lei.
      </p>
    </div>
  `;

  window.setTimeout(() => {
    hideOverlay();
  }, 6000);
}

runExorcistEvent = runPineappleVerseEvent;
