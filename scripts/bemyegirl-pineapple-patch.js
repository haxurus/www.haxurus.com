const bellsAudioPatch = new Audio("audio/campane.mp3");
bellsAudioPatch.preload = "auto";

function runPineappleVerseEvent() {
  playAudio(bellsAudioPatch);

  overlay.className = "special-overlay pineapple-overlay";
  overlay.innerHTML = `
    <div class="overlay-message pineapple-verse" role="dialog" aria-modal="true" aria-label="Giudizio sulla pizza all'ananas">
      <p class="verse-ref">Libro della Pizza 3:14</p>
      <p>
        O cieli, abbiate pietà di chi posò l'ananas sulla pizza,
        perché grande fu il peccato e tremante la mozzarella.
      </p>
      <p>
        Che le campane suonino, che il forno perdoni,
        e che nessuna rucola testimoni contro di lei.
      </p>
      <button class="verse-close" type="button" id="closePineappleVerse">
        Chiedo perdono
      </button>
    </div>
  `;

  const closeButton = document.getElementById("closePineappleVerse");
  closeButton?.focus();
  closeButton?.addEventListener("click", hideOverlay);
}

runPineappleEvent = runPineappleVerseEvent;
runExorcistEvent = runPineappleVerseEvent;
