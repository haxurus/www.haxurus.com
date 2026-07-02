(() => {
  "use strict";

  const dom = {
    questionArea: document.getElementById("questionArea"),
    progressBar: document.getElementById("progressBar"),
    backBtn: document.getElementById("backBtn"),
    nextBtn: document.getElementById("nextBtn"),
    overlay: document.getElementById("specialOverlay"),
    policeAudio: document.getElementById("policeAudio"),
    cowAudio: document.getElementById("cowAudio")
  };

  const audio = {
    bells: new Audio("audio/campane.mp3"),
    sus: new Audio("audio/sus.mp3"),
    kawaii: new Audio("audio/kawaii.mp3")
  };

  Object.values(audio).forEach((item) => {
    item.preload = "auto";
  });

  const state = {
    language: null,
    currentIndex: 0,
    answers: {},
    restartMode: false
  };

  let questions = [];
  let categories = [];

  function clamp(number, min, max) {
    return Math.max(min, Math.min(max, number));
  }

  function playAudio(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
  }

  function pizzaImage(file) {
    return `/img/bemyegirl/pizzas/${file}.png`;
  }

  function makePlaceholder(title, emoji, accent = "#39ff14") {
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

  function getText(language) {
    const it = language === "it";

    return {
      ui: it ? {
        kicker: "Sistema di Compatibilita Haxurus",
        subtitle: "Un test scientificamente discutibile per misurare la compatibilita.",
        question: "Domanda",
        multiple: "Puoi selezionare piu risposte.",
        value: "Valore",
        back: "Indietro",
        next: "Avanti",
        result: "Risultato",
        restart: "Ricomincia",
        finalResult: "Risultato finale",
        categoryBreakdown: "Analisi categorie",
        strongest: "Piu forte",
        weakest: "Piu debole",
        changeVersion: "Cambia versione",
        selectLanguage: "Scegli la lingua",
        languageSubtitle: "Puoi fare il quiz in italiano o in inglese.",
        accessDenied: "Accesso negato",
        accessDeniedText: "Questo quiz contiene ironia discutibile. Per la tua sicurezza emotiva, il sistema ti accompagna gentilmente all'uscita.",
        unavailable: "Route non disponibile",
        unavailableText: "Questa risposta non corrisponde alla route cercata da questo quiz.",
        starterPopup: "Controlla il tuo starter item!"
      } : {
        kicker: "Haxurus Compatibility System",
        subtitle: "A scientifically questionable test to measure compatibility.",
        question: "Question",
        multiple: "You can select multiple answers.",
        value: "Value",
        back: "Back",
        next: "Next",
        result: "Result",
        restart: "Restart",
        finalResult: "Final result",
        categoryBreakdown: "Category breakdown",
        strongest: "Strongest",
        weakest: "Weakest",
        changeVersion: "Change version",
        selectLanguage: "Choose your language",
        languageSubtitle: "You can take the quiz in English or Italian.",
        accessDenied: "Access denied",
        accessDeniedText: "This quiz contains questionable irony. For your emotional safety, the system is kindly escorting you to the exit.",
        unavailable: "Route not available",
        unavailableText: "This answer does not match the route this quiz is looking for.",
        starterPopup: "Check your starter item!"
      },
      categories: it ? {
        appearance: "Aspetto",
        personality: "Personalita",
        relationship: "Vibe relazione",
        nerd: "Compatibilita nerd",
        lifestyle: "Lifestyle / Gusti"
      } : {
        appearance: "Appearance",
        personality: "Personality",
        relationship: "Relationship vibe",
        nerd: "Nerd compatibility",
        lifestyle: "Lifestyle / Taste"
      }
    };
  }

  function getQuestions(language) {
    const it = language === "it";

    const redFlagFull = it ? [
      { label: "Attaccamento speedrun", value: 2 },
      { label: "Richiesta rassicurazioni", value: 2 },
      { label: "Gelosia.exe in background", value: 2 },
      { label: "Overthinking su ogni dettaglio", value: 2 },
      { label: "Cartella screenshot prove", value: 1 },
      { label: "Generatore di scenari falsi", value: 1 },
      { label: "Niente significa tutto", value: -1 },
      { label: "Attenzioni richieste, domanda respinta", value: 0 },
      { label: "Meme invece di comunicazione", value: -1 },
      { label: "Cooldown emotivo necessario", value: 0 },
      { label: "Fiducia lenta", value: 0 },
      { label: "Lunatica ma self-aware", value: 0 },
      { label: "Reply.exe a volte crasha", value: -2 },
      { label: "Lettura del pensiero richiesta", value: -2 },
      { label: "Litigi per attenzione", value: -2 },
      { label: "Modalita ghost senza preavviso", value: -2 },
      { label: "Analizzo i cambi di tono come prova forense", value: 2 },
      { label: "Rileggo vecchi messaggi per farmi male", value: 1 },
      { label: "Ho bisogno di prove quotidiane che ti piaccio ancora", value: 2 },
      { label: "Divento silenziosa quando ci tengo troppo", value: 1 },
      { label: "Dico 'va bene' quando non va affatto bene", value: 0 },
      { label: "Creo archi narrativi relazionali da una singola interazione", value: 2 },
      { label: "Fingo di non tenerci e poi ci tengo aggressivamente", value: 1 },
      { label: "Metto alla prova le persone senza dire che e un test", value: -1 },
      { label: "Voglio essere cercata ma faccio l'indisponibile", value: 1 },
      { label: "Ho bisogno di attenzioni ma faccio l'indipendente", value: 1 },
      { label: "Sono gelosa di persone mai viste", value: 2 },
      { label: "Ricordo dettagli minuscoli e li uso come prove", value: 1 },
      { label: "Sparisco per vedere se te ne accorgi", value: -2 },
      { label: "Comunico meglio con i repost", value: 1 },
      { label: "Ho bisogno di una schermata di caricamento prima di parlare di sentimenti", value: 0 },
      { label: "Sono self-aware ma comunque problematica", value: 0 },
      { label: "Chiedo scusa e poi overthinko le scuse", value: 1 },
      { label: "Trasformo piccoli problemi in finali di stagione", value: 1 },
      { label: "Mi aspetto il princess treatment ma lo nego", value: 2 },
      { label: "Stalkero le tue playlist per indizi emotivi", value: 1 },
      { label: "Controllo il tuo stato online come se mi dovesse dei soldi", value: 2 },
      { label: "Scrivo il messaggio, lo cancello e poi faccio la normale", value: -2 },
      { label: "Ho bisogno di rassicurazioni dopo il mio stesso overthinking", value: 2 },
      { label: "Perdono in fretta ma ricordo tutto", value: 0 },
      { label: "Vado offline invece di spiegare cosa non va", value: -1 },
      { label: "Vinco discussioni nella mia testa prima che succedano", value: 0 },
      { label: "Dico che sono low maintenance, poi richiedo aggiornamenti lore", value: 1 },
      { label: "Vado in panico quando qualcuno e troppo gentile", value: 1 },
      { label: "Ho bisogno di affetto ma mi imbarazzo a riceverlo", value: 1 },
      { label: "Posso essere drammatica, ma almeno sono divertente", value: 1 }
    ] : [
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

    const shortRedFlags = [0, 1, 4, 9, 43, 12, 13, 15].map((index) => redFlagFull[index]);

    return [
      {
        id: "ironia",
        type: "choice",
        blocking: true,
        question: it ? "Capisci l'ironia e accetti l'umorismo nero?" : "Do you understand irony and accept dark humor?",
        answers: [
          { label: it ? "Si" : "Yes", action: "continue" },
          { label: "No", action: "block" },
          { label: it ? "Umorismo nero?" : "Dark humor?", action: "block" }
        ]
      },
      {
        id: "lgbtq_topics",
        type: "choice",
        question: it ? "Come ti approcci ai temi LGBTQ+?" : "How do you approach LGBTQ+ topics?",
        answers: it ? [
          { label: "Rispetto tutti, ma so anche stare allo scherzo", value: 2 },
          { label: "Non ne so molto, ma sono tranquilla", value: 1 },
          { label: "Supporto la community in modo molto attivo", value: -2 },
          { label: "Mi va bene che ognuno faccia cio che vuole, senza imporre opinioni", value: 0 },
          { label: "Preferisco evitare l'argomento", value: 0 },
          { label: "Mi mettono a disagio le battute spinte su questi temi", value: -2 }
        ] : [
          { label: "I respect everyone, but I can also take a joke", value: 2 },
          { label: "I do not know much, but I am chill", value: 1 },
          { label: "I support the community very actively", value: -2 },
          { label: "I am fine with people doing what they want, just do not force opinions on me", value: 0 },
          { label: "I prefer avoiding the topic", value: 0 },
          { label: "I get uncomfortable with edgy jokes about these topics", value: -2 }
        ]
      },
      {
        id: "tronchetto",
        type: "choice",
        question: it ? "Scegli il tuo starter item:" : "Choose your starter item:",
        answers: [
          { label: it ? "Il Tronchetto" : "The Log", action: "preferenceBlock" },
          { label: it ? "Sono un transformer" : "I'm a transformer", action: "preferenceBlock" },
          { label: it ? "Sono confusa" : "I'm confused", value: 0, action: "starterPopup" },
          { label: it ? "Il Fiore" : "The Flower", value: 2 }
        ]
      },
      {
        id: "eta",
        type: "choice",
        question: it ? "Quanti anni hai?" : "How old are you?",
        answers: it ? [
          { label: "Meno di 18", action: "police" },
          { label: "Tra 18 e 22", value: 1 },
          { label: "Tra 23 e 25", value: 2 },
          { label: "Tra 26 e 30", value: -1 },
          { label: "31 o piu", value: -2 }
        ] : [
          { label: "Under 18", action: "police" },
          { label: "Between 18 and 22", value: 1 },
          { label: "Between 23 and 25", value: 2 },
          { label: "Between 26 and 30", value: -1 },
          { label: "31 or older", value: -2 }
        ]
      },
      {
        id: "origine",
        type: "choice",
        question: it ? "Dove sei spawnata?" : "Where were you spawned?",
        answers: it ? [
          { label: "Nord Italia", value: 2 },
          { label: "Centro Italia", value: 1 },
          { label: "Sud Italia / Isole", value: 1 },
          { label: "Europa", value: 0 },
          { label: "Fuori Europa", value: 0 },
          { label: "Non lo so, sono semplicemente spawnata", value: 2 }
        ] : [
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
        question: it ? "Dove vivi ora?" : "Where do you live now?",
        answers: it ? [
          { label: "Vicino Milano", value: 2 },
          { label: "Lombardia", value: 1 },
          { label: "Nord Italia", value: 0 },
          { label: "Italia, ma lontano", value: -1 },
          { label: "Estero", value: -2 },
          { label: "Nel tuo cuore", value: 2 }
        ] : [
          { label: "Near Milan", value: 2 },
          { label: "Lombardy", value: 1 },
          { label: "Northern Italy", value: 0 },
          { label: "Italy, but far away", value: -1 },
          { label: "Abroad", value: -2 },
          { label: "In your heart", value: 2 }
        ]
      },
      {
        id: "altezza",
        type: "choice",
        question: it ? "Quanto sei alta?" : "How tall are you?",
        answers: it ? [
          { label: "Meno di 1,55 m", value: 1, action: "kawaiiSound" },
          { label: "1,55 - 1,65 m", value: 2, action: "kawaiiSound" },
          { label: "1,66 - 1,75 m", value: 1 },
          { label: "1,76 - 1,85 m", value: 0 },
          { label: "Oltre 1,85 m", value: -1 }
        ] : [
          { label: "Under 1.55 m", value: 1, action: "kawaiiSound" },
          { label: "1.55 - 1.65 m", value: 2, action: "kawaiiSound" },
          { label: "1.66 - 1.75 m", value: 1 },
          { label: "1.76 - 1.85 m", value: 0 },
          { label: "Over 1.85 m", value: -1 }
        ]
      },
      {
        id: "cuddle_build",
        type: "choice",
        question: it ? "Qual e la tua cuddle build?" : "What is your cuddle build?",
        answers: it ? [
          { label: "Edizione peluche tascabile", value: 2 },
          { label: "Slim / petite", value: 2 },
          { label: "Media e abbastanza cute", value: 1 },
          { label: "Morbida e coccolosa", value: 1 },
          { label: "Curvy", value: 0 },
          { label: "Plus-size cuddle boss", value: -1 },
          { label: "Final boss morbidissima", value: -2 },
          { label: "Gym arc sbloccata", value: 0 },
          { label: "Rifiuto di essere percepita", value: -2 }
        ] : [
          { label: "Small plushie edition", value: 2 },
          { label: "Slim / petite", value: 2 },
          { label: "Average and cute enough", value: 1 },
          { label: "Soft and cuddly", value: 1 },
          { label: "Curvy", value: 0 },
          { label: "Plus-size cuddle boss", value: -1 },
          { label: "Very soft final boss", value: -2 },
          { label: "Gym arc unlocked", value: 0 },
          { label: "I refuse to be perceived", value: -2 }
        ]
      },
      {
        id: "cioccolato",
        type: "slider",
        question: it ? "Scegli il tuo livello estetico di cioccolato" : "Choose your aesthetic chocolate level",
        min: 0,
        max: 100,
        defaultValue: 20,
        ranges: it ? [
          { min: 0, max: 20, label: "Cioccolato bianco", value: 2 },
          { min: 21, max: 40, label: "Cioccolato al latte", value: 0 },
          { min: 41, max: 60, label: "Fondente 50%", value: -1 },
          { min: 61, max: 80, label: "Fondente 75%", value: -2 },
          { min: 81, max: 100, label: "Cacao puro final boss", value: -3 }
        ] : [
          { min: 0, max: 20, label: "White chocolate", value: 2 },
          { min: 21, max: 40, label: "Milk chocolate", value: 0 },
          { min: 41, max: 60, label: "50% dark chocolate", value: -1 },
          { min: 61, max: 80, label: "75% dark chocolate", value: -2 },
          { min: 81, max: 100, label: "Pure cocoa final boss", value: -3 }
        ]
      },
      {
        id: "colore_occhi",
        type: "choice",
        question: it ? "Di che colore sono i tuoi occhi?" : "What color are your eyes?",
        answers: it ? [
          { label: "Azzurri", value: 1 },
          { label: "Verdi", value: 2 },
          { label: "Marroni", value: 0 },
          { label: "Nocciola", value: 0 },
          { label: "Grigi", value: 1 },
          { label: "Neri / molto scuri", value: 0 },
          { label: "Cambiano colore in base al mio mood", value: -2 }
        ] : [
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
        question: it ? "Di che colore sono i tuoi capelli nella lore attuale?" : "What color is your hair in the current lore?",
        answers: it ? [
          { label: "Biondi", value: 2 },
          { label: "Castani", value: 1 },
          { label: "Neri", value: 1 },
          { label: "Rossi / rame", value: -2 },
          { label: "Colorati / tinti", value: 0 },
          { label: "Bianchi / argentati", value: -1 },
          { label: "Dipende dal mio ultimo breakdown", value: 0 }
        ] : [
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
        question: it ? "Quali sono i tuoi dettagli da main character?" : "What are your main-character details?",
        minValue: -4,
        maxValue: 8,
        answers: it ? [
          { label: "Brillantino laterale al naso", value: 1 },
          { label: "Septum", value: -1 },
          { label: "Piercing alla lingua", value: -1 },
          { label: "Piercing all'ombelico", value: 1 },
          { label: "Orecchini", value: 1 },
          { label: "Piu piercing alle orecchie", value: 0 },
          { label: "Altri piercing", value: -1 },
          { label: "Tatuaggi", value: -1 },
          { label: "Cicatrici", value: 0 },
          { label: "Apparecchio ai denti", value: 1 },
          { label: "Lentiggini", value: 1 },
          { label: "Nei particolari", value: 0 },
          { label: "Occhiali", value: 1 },
          { label: "Fossette", value: 1 },
          { label: "Nessuno", value: 0 },
          { label: "Il dettaglio raro sono io", value: 1 }
        ] : [
          { label: "Small side nose stud", value: 1 },
          { label: "Septum piercing", value: -1 },
          { label: "Tongue piercing", value: -1 },
          { label: "Belly button piercing", value: 1 },
          { label: "Earrings", value: 1 },
          { label: "Multiple ear piercings", value: 0 },
          { label: "Other piercings", value: -1 },
          { label: "Tattoos", value: -1 },
          { label: "Scars", value: 0 },
          { label: "Braces", value: 1 },
          { label: "Freckles", value: 1 },
          { label: "Distinctive beauty marks", value: 0 },
          { label: "Glasses", value: 1 },
          { label: "Dimples", value: 1 },
          { label: "None", value: 0 },
          { label: "I am the rare detail", value: 1 }
        ]
      },
      {
        id: "principessa_disney",
        type: "imageChoice",
        question: it ? "Quale anime girl ti rappresenta di piu?" : "Which anime girl represents you the most?",
        answers: [
          { label: "Frieren", image: "/img/bemyegirl/frieren.png", value: 2 },
          { label: "Asuna Yuuki", image: "/img/bemyegirl/asuna.png", value: 1 },
          { label: "Misa Amane", image: "/img/bemyegirl/misaamane.png", value: 1 },
          { label: "Mao Mao", image: "/img/bemyegirl/maomao.png", value: 2 },
          { label: "Ai Hoshino", image: "/img/bemyegirl/aihoshino.png", value: 1 },
          { label: "Nana Osaki", image: "/img/bemyegirl/nanaosaki.png", value: 0 },
          { label: "Alya", image: "/img/bemyegirl/alya.png", value: 1 },
          { label: "Taiga Aisaka", image: "/img/bemyegirl/taigaaisaka.png", value: 0 },
          { label: "Nagisa Shiota", image: "/img/bemyegirl/nagisashiota.png", value: 0, action: "susSound" }
        ]
      },
      {
        id: "appiccicosa",
        type: "choice",
        question: it ? "Quanto sei appiccicosa?" : "How clingy are you?",
        answers: it ? [
          { label: "Modalita koala emotivo", value: 2 },
          { label: "Abbastanza, ma con dignita", value: 1 },
          { label: "Normale", value: 0 },
          { label: "Molto indipendente", value: -1 },
          { label: "Ci sentiamo una volta a settimana", value: -2 }
        ] : [
          { label: "Emotional koala mode", value: 2 },
          { label: "Quite a bit, but with dignity", value: 1 },
          { label: "Normal", value: 0 },
          { label: "Very independent", value: -1 },
          { label: "We talk once a week", value: -2 }
        ]
      },
      {
        id: "gelosia",
        type: "slider",
        question: it ? "Quanto sei gelosa?" : "How jealous are you?",
        min: 0,
        max: 100,
        defaultValue: 45,
        ranges: it ? [
          { min: 0, max: 20, label: "Fai quello che vuoi", value: -2 },
          { min: 21, max: 40, label: "Gelosia sana", value: 0 },
          { min: 41, max: 60, label: "Chi e questa?", value: 1 },
          { min: 61, max: 80, label: "Analizzo le storie Instagram", value: 2 },
          { min: 81, max: 100, label: "Dammi il telefono", value: 1 }
        ] : [
          { min: 0, max: 20, label: "Do whatever you want", value: -2 },
          { min: 21, max: 40, label: "Healthy jealousy", value: 0 },
          { min: 41, max: 60, label: "Who is this?", value: 1 },
          { min: 61, max: 80, label: "I analyze Instagram stories", value: 2 },
          { min: 81, max: 100, label: "Give me your phone", value: 1 }
        ]
      },
      {
        id: "red_flags",
        type: "multiChoice",
        question: it ? "Scegli i tuoi bug emotivi" : "Choose your emotional bugs",
        answers: shortRedFlags,
        shortAnswers: shortRedFlags,
        fullAnswers: redFlagFull,
        mode: null,
        shortMinValue: -2,
        shortMaxValue: 4,
        fullMinValue: -16,
        fullMaxValue: 28,
        shortTitle: it ? "Versione corta" : "Short version",
        shortText: it ? "8 opzioni selezionate. Piu veloce e pulita." : "8 selected options. Faster and cleaner.",
        fullTitle: it ? "Versione completa" : "Full version",
        fullText: it ? "Tutti i bug emotivi. Modalita caos totale." : "All emotional bugs. Full chaos mode."
      },
      {
        id: "assenza",
        type: "choice",
        question: it ? "Se non rispondo per qualche ora, cosa fai?" : "If I do not reply for a few hours, what do you do?",
        answers: it ? [
          { label: "Ti cerco per sapere se sei vivo", value: 2 },
          { label: "Ti mando un meme per attirare la tua attenzione", value: 2 },
          { label: "Ti scrivo 'tutto bene?'", value: 1 },
          { label: "Aspetto senza dire nulla", value: 0 },
          { label: "Sparisco anche io per principio", value: -2 }
        ] : [
          { label: "I check on you because I want to know if you are alive", value: 2 },
          { label: "I send you a meme to get your attention", value: 2 },
          { label: "I text you 'everything okay?'", value: 1 },
          { label: "I wait without saying anything", value: 0 },
          { label: "I disappear too out of principle", value: -2 }
        ]
      },
      {
        id: "buonanotte",
        type: "choice",
        question: it ? "Se ti scrivo 'Buonanotte', come rispondi?" : "If I texted you 'Goodnight', how would you reply?",
        answers: it ? [
          { label: "Buonanotte ❤️", value: 2 },
          { label: "Notteee", value: 1 },
          { label: "Meme disturbante prima di dormire", value: 2 },
          { label: "Visualizzato", value: -2 },
          { label: "notte", value: -1 }
        ] : [
          { label: "Goodnight ❤️", value: 2 },
          { label: "Nighttt", value: 1 },
          { label: "Disturbing meme before sleeping", value: 2 },
          { label: "Left on read", value: -2 },
          { label: "night", value: -1 }
        ]
      },
      {
        id: "litigio",
        type: "choice",
        question: it ? "Se litighiamo per una cosa stupida" : "If we argue over something stupid",
        answers: it ? [
          { label: "Ne parliamo e poi facciamo pace", value: 2 },
          { label: "Prima mi offendo, poi torno", value: 1 },
          { label: "Ti mando un meme per rompere il ghiaccio", value: 2 },
          { label: "Silenzio radio", value: -2 },
          { label: "Fingo che non sia successo nulla per 3 giorni", value: -1 }
        ] : [
          { label: "We talk about it and then make peace", value: 2 },
          { label: "First I get offended, then I come back", value: 1 },
          { label: "I send you a meme to break the ice", value: 2 },
          { label: "Radio silence", value: -2 },
          { label: "I pretend nothing happened for 3 days", value: -1 }
        ]
      },
      {
        id: "abbracci",
        type: "slider",
        question: it ? "Quanto ti piacciono gli abbracci?" : "How much do you like hugs?",
        min: 0,
        max: 100,
        defaultValue: 65,
        ranges: it ? [
          { min: 0, max: 20, label: "Non toccarmi", value: -2 },
          { min: 21, max: 40, label: "A volte", value: 0 },
          { min: 41, max: 60, label: "Mi piacciono", value: 1 },
          { min: 61, max: 80, label: "Tanto", value: 2 },
          { min: 81, max: 100, label: "Modalita koala permanente", value: 2 }
        ] : [
          { min: 0, max: 20, label: "Do not touch me", value: -2 },
          { min: 21, max: 40, label: "Sometimes", value: 0 },
          { min: 41, max: 60, label: "I like them", value: 1 },
          { min: 61, max: 80, label: "A lot", value: 2 },
          { min: 81, max: 100, label: "Permanent koala mode", value: 2 }
        ]
      },
      {
        id: "foto_insieme",
        type: "slider",
        question: it ? "Quanto sei disposta a fare foto insieme?" : "How willing are you to take photos together?",
        min: 0,
        max: 100,
        defaultValue: 55,
        ranges: it ? [
          { min: 0, max: 20, label: "Niente foto", value: -2 },
          { min: 21, max: 40, label: "Solo se vengo bene", value: 0 },
          { min: 41, max: 60, label: "A volte", value: 1 },
          { min: 61, max: 80, label: "Foto carine insieme", value: 2 },
          { min: 81, max: 100, label: "Photoshoot di coppia", value: 1 }
        ] : [
          { min: 0, max: 20, label: "No photos", value: -2 },
          { min: 21, max: 40, label: "Only if I look good", value: 0 },
          { min: 41, max: 60, label: "Sometimes", value: 1 },
          { min: 61, max: 80, label: "Cute photos together", value: 2 },
          { min: 81, max: 100, label: "Couple photoshoot", value: 1 }
        ]
      },
      {
        id: "cosa_cerchi",
        type: "choice",
        question: it ? "Cosa stai cercando davvero?" : "What are you actually looking for?",
        answers: it ? [
          { label: "Qualcuno con cui ridere e stare bene", value: 2 },
          { label: "Una relazione dolce ma anche stupida", value: 2 },
          { label: "Qualcuno presente", value: 1 },
          { label: "Non lo so, vediamo", value: 0 },
          { label: "Sto solo passando il tempo", value: -2 }
        ] : [
          { label: "Someone to laugh and feel good with", value: 2 },
          { label: "A sweet but also stupid relationship", value: 2 },
          { label: "Someone present", value: 1 },
          { label: "I do not know, let us see", value: 0 },
          { label: "Just passing time", value: -2 }
        ]
      },
      {
        id: "reel",
        type: "choice",
        question: it ? "Se ti mando 12 reel in 5 minuti?" : "If I send you 12 reels in 5 minutes?",
        answers: it ? [
          { label: "Li guardo tutti e commento", value: 2 },
          { label: "Ne guardo alcuni e fingo di aver capito", value: 1 },
          { label: "Rispondo solo 'haha'", value: 0 },
          { label: "Ti silenzio", value: -1 },
          { label: "Ti blocco e cambio identita", value: -2 }
        ] : [
          { label: "I watch them all and comment", value: 2 },
          { label: "I watch a few and pretend I understood", value: 1 },
          { label: "I only reply 'haha'", value: 0 },
          { label: "I mute you", value: -1 },
          { label: "I block you and change identity", value: -2 }
        ]
      },
      {
        id: "gossip",
        type: "slider",
        question: it ? "Quanto sei pronta a fare gossip inutile ma essenziale?" : "How ready are you to do useless but essential gossip?",
        min: 0,
        max: 100,
        defaultValue: 80,
        ranges: it ? [
          { min: 0, max: 20, label: "Non mi interessano le vite degli altri", value: -2 },
          { min: 21, max: 40, label: "Ascolto, ma non partecipo", value: -1 },
          { min: 41, max: 60, label: "Ogni tanto va bene", value: 0 },
          { min: 61, max: 80, label: "Analisi completa di ogni dettaglio", value: 1 },
          { min: 81, max: 100, label: "Creo teorie, timeline e prove fotografiche", value: 2 }
        ] : [
          { min: 0, max: 20, label: "I do not care about other people's lives", value: -2 },
          { min: 21, max: 40, label: "I listen, but I do not participate", value: -1 },
          { min: 41, max: 60, label: "Sometimes it is fine", value: 0 },
          { min: 61, max: 80, label: "Full analysis of every detail", value: 1 },
          { min: 81, max: 100, label: "I create theories, timelines and photo evidence", value: 2 }
        ]
      },
      {
        id: "nerd",
        type: "slider",
        question: it ? "Quanto sei nerd?" : "How nerdy are you?",
        min: 0,
        max: 100,
        defaultValue: 60,
        ranges: it ? [
          { min: 0, max: 20, label: "Tocco l'erba ogni giorno", value: -1 },
          { min: 21, max: 40, label: "Nerd occasionale", value: 0 },
          { min: 41, max: 60, label: "So cos'e Discord", value: 1 },
          { min: 61, max: 80, label: "Ho almeno un trauma da gioco online", value: 2 },
          { min: 81, max: 100, label: "Il mio habitat naturale e davanti al PC", value: 2 }
        ] : [
          { min: 0, max: 20, label: "I touch grass every day", value: -1 },
          { min: 21, max: 40, label: "Occasional nerd", value: 0 },
          { min: 41, max: 60, label: "I know what Discord is", value: 1 },
          { min: 61, max: 80, label: "I have at least one online game trauma", value: 2 },
          { min: 81, max: 100, label: "My natural habitat is in front of the PC", value: 2 }
        ]
      },
      {
        id: "videogiochi",
        type: "slider",
        question: it ? "Quanto riesci a tollerare i videogiochi?" : "How much can you tolerate video games?",
        min: 0,
        max: 100,
        defaultValue: 60,
        ranges: it ? [
          { min: 0, max: 20, label: "Sono una perdita di tempo", value: -2 },
          { min: 21, max: 40, label: "Guardo ma non capisco", value: -1 },
          { min: 41, max: 60, label: "A volte va bene", value: 0 },
          { min: 61, max: 80, label: "Serata gaming approvata", value: 1 },
          { min: 81, max: 100, label: "Duo queue immediata", value: 2 }
        ] : [
          { min: 0, max: 20, label: "They are a waste of time", value: -2 },
          { min: 21, max: 40, label: "I watch but I do not understand", value: -1 },
          { min: 41, max: 60, label: "Sometimes it is fine", value: 0 },
          { min: 61, max: 80, label: "Evening gaming approved", value: 1 },
          { min: 81, max: 100, label: "Duo queue immediately", value: 2 }
        ]
      },
      {
        id: "minecraft",
        type: "choice",
        question: it ? "Se dico 'Minecraft stasera'?" : "If I say 'Minecraft tonight'?",
        answers: it ? [
          { label: "Io costruisco casa, tu mini", value: 2 },
          { label: "Entro ma mi perdo dopo 3 minuti", value: 1 },
          { label: "Solo se dopo guardiamo un film", value: 1 },
          { label: "Minecraft e da bambini", value: -2 },
          { label: "Faccio esplodere tutto con la TNT", value: 0 }
        ] : [
          { label: "I build the house, you mine", value: 2 },
          { label: "I will join but get lost after 3 minutes", value: 1 },
          { label: "Only if we watch a movie after", value: 1 },
          { label: "Minecraft is for kids", value: -2 },
          { label: "I blow everything up with TNT", value: 0 }
        ]
      },
      {
        id: "discord",
        type: "choice",
        question: it ? "Qual e il tuo rapporto con Discord?" : "What is your relationship with Discord?",
        answers: it ? [
          { label: "Ci vivo", value: 2 },
          { label: "Lo uso ogni tanto", value: 1 },
          { label: "Lo conosco ma non lo uso", value: 0 },
          { label: "Non so cosa sia", value: -1 },
          { label: "Lo associo solo ai gamer tossici", value: -2 }
        ] : [
          { label: "I live there", value: 2 },
          { label: "I use it sometimes", value: 1 },
          { label: "I know it but do not use it", value: 0 },
          { label: "I do not know what it is", value: -1 },
          { label: "I only associate it with toxic gamers", value: -2 }
        ]
      },
      {
        id: "anime",
        type: "choice",
        question: it ? "Anime preferito?" : "Favorite anime?",
        answers: it ? [
          { label: "Frieren", value: 2 },
          { label: "Sword Art Online", value: 1 },
          { label: "Death Note", value: 1 },
          { label: "Non so decidere", value: 0 },
          { label: "Non guardo anime", value: -3 }
        ] : [
          { label: "Frieren", value: 2 },
          { label: "Sword Art Online", value: 1 },
          { label: "Death Note", value: 1 },
          { label: "I cannot decide", value: 0 },
          { label: "I do not watch anime", value: -3 }
        ]
      },
      {
        id: "pizza",
        type: "imageChoice",
        question: it ? "Scegli una pizza" : "Choose a pizza",
        answers: it ? [
          { label: "Mozzarella di bufala e patatine", image: pizzaImage("buffalo-mozzarella-fries"), value: 3 },
          { label: "Wurstel e patatine", image: pizzaImage("wurstel-fries"), value: 2 },
          { label: "Margherita", image: pizzaImage("margherita"), value: 1 },
          { label: "Diavola", image: pizzaImage("diavola"), value: 0 },
          { label: "Capricciosa", image: pizzaImage("capricciosa"), value: 0 },
          { label: "Quattro formaggi", image: pizzaImage("four-cheese"), value: 0 },
          { label: "Con rucola", image: pizzaImage("arugula"), value: -1, action: "cowSound" },
          { label: "Ananas", image: pizzaImage("pineapple"), value: -3, action: "pineappleEvent" },
          { label: "Non mangio pizza", image: makePlaceholder("No pizza", "🚫", "#9aa4b2"), value: -4 }
        ] : [
          { label: "Buffalo mozzarella & fries", image: pizzaImage("buffalo-mozzarella-fries"), value: 3 },
          { label: "Wurstel & fries", image: pizzaImage("wurstel-fries"), value: 2 },
          { label: "Margherita", image: pizzaImage("margherita"), value: 1 },
          { label: "Diavola", image: pizzaImage("diavola"), value: 0 },
          { label: "Capricciosa", image: pizzaImage("capricciosa"), value: 0 },
          { label: "Four cheese", image: pizzaImage("four-cheese"), value: 0 },
          { label: "With arugula", image: pizzaImage("arugula"), value: -1, action: "cowSound" },
          { label: "Pineapple", image: pizzaImage("pineapple"), value: -3, action: "pineappleEvent" },
          { label: "I do not eat pizza", image: makePlaceholder("No pizza", "🚫", "#9aa4b2"), value: -4 }
        ]
      },
      {
        id: "drink",
        type: "choice",
        question: it ? "Scegli un drink" : "Choose a drink",
        answers: it ? [
          { label: "Aperol Spritz", value: 2 },
          { label: "Coca-Cola", value: 1 },
          { label: "Acqua naturale", value: 0 },
          { label: "Monster alle 23", value: 1 },
          { label: "Non bevo nulla", value: -1 }
        ] : [
          { label: "Aperol Spritz", value: 2 },
          { label: "Coca-Cola", value: 1 },
          { label: "Still water", value: 0 },
          { label: "Monster at 11 PM", value: 1 },
          { label: "I do not drink anything", value: -1 }
        ]
      },
      {
        id: "dolce",
        type: "choice",
        question: it ? "Scegli un dolce" : "Choose a dessert",
        answers: it ? [
          { label: "Tiramisu", value: 2 },
          { label: "Cheesecake", value: 1 },
          { label: "Gelato", value: 1 },
          { label: "Frutta", value: -1 },
          { label: "Non mi piacciono i dolci", value: -2 }
        ] : [
          { label: "Tiramisu", value: 2 },
          { label: "Cheesecake", value: 1 },
          { label: "Ice cream", value: 1 },
          { label: "Fruit", value: -1 },
          { label: "I do not like desserts", value: -2 }
        ]
      },
      {
        id: "film_brutto",
        type: "choice",
        question: it ? "Se ti chiedo di guardare un film brutto" : "If I ask you to watch a bad movie",
        answers: it ? [
          { label: "Lo guardo e lo insultiamo insieme", value: 2 },
          { label: "Solo se c'e cibo", value: 1 },
          { label: "Dipende dal film", value: 0 },
          { label: "Mi addormento dopo 10 minuti", value: -1 },
          { label: "No, solo film seri", value: -2 }
        ] : [
          { label: "I watch it and we roast it together", value: 2 },
          { label: "Only if there is food", value: 1 },
          { label: "Depends on the movie", value: 0 },
          { label: "I fall asleep after 10 minutes", value: -1 },
          { label: "No, serious movies only", value: -2 }
        ]
      },
      {
        id: "serata_ideale",
        type: "choice",
        question: it ? "Scegli una serata ideale" : "Choose an ideal evening",
        answers: it ? [
          { label: "Film, pizza e coccole", value: 2 },
          { label: "Gaming insieme", value: 2 },
          { label: "Pub tranquillo", value: 1 },
          { label: "Serata caotica in discoteca", value: -1 },
          { label: "Ognuno a casa sua", value: -2 }
        ] : [
          { label: "Movie, pizza and cuddles", value: 2 },
          { label: "Gaming together", value: 2 },
          { label: "Quiet pub", value: 1 },
          { label: "Chaotic club night", value: -1 },
          { label: "Everyone at their own home", value: -2 }
        ]
      }
    ];
  }

  function getCategories(language) {
    const text = getText(language);
    return [
      { id: "appearance", label: text.categories.appearance, questionIds: ["altezza", "cuddle_build", "cioccolato", "colore_occhi", "colore_capelli", "segni_particolari"] },
      { id: "personality", label: text.categories.personality, questionIds: ["lgbtq_topics", "appiccicosa", "gelosia", "red_flags", "assenza", "buonanotte", "litigio"] },
      { id: "relationship", label: text.categories.relationship, questionIds: ["origine", "dove_abiti_ora", "abbracci", "foto_insieme", "cosa_cerchi", "serata_ideale"] },
      { id: "nerd", label: text.categories.nerd, questionIds: ["videogiochi", "minecraft", "discord", "anime"] },
      { id: "lifestyle", label: text.categories.lifestyle, questionIds: ["pizza", "drink", "dolce", "film_brutto", "gossip"] }
    ];
  }

  function bootQuiz(language) {
    state.language = language;
    state.currentIndex = 0;
    state.answers = {};
    state.restartMode = false;
    document.documentElement.lang = language === "it" ? "it" : "en";
    questions = getQuestions(language);
    categories = getCategories(language);
    updateStaticTexts();
    renderQuestion();
  }

  function updateStaticTexts() {
    const text = getText(state.language || "en");
    const kicker = document.querySelector(".quiz-header .quiz-kicker");
    const subtitle = document.querySelector(".quiz-subtitle");
    if (kicker) kicker.textContent = text.ui.kicker;
    if (subtitle) subtitle.textContent = text.ui.subtitle;
    if (dom.backBtn) dom.backBtn.textContent = text.ui.back;
    if (dom.nextBtn) dom.nextBtn.textContent = text.ui.next;
  }

  function getRangeAnswer(question, numericValue) {
    return question.ranges.find((range) => numericValue >= range.min && numericValue <= range.max);
  }

  function getSelectedAnswer(question) {
    const saved = state.answers[question.id];
    if (!saved) return null;
    if (question.type === "slider") return getRangeAnswer(question, saved.rawValue);
    if (question.type === "multiChoice") return saved;
    return question.answers[saved.answerIndex] || null;
  }

  function getQuestionValue(question, answer) {
    if (!answer) return null;

    if (question.type === "multiChoice") {
      const selectedIndexes = answer.answerIndexes || [];
      const rawValue = selectedIndexes.reduce((total, answerIndex) => total + (question.answers[answerIndex]?.value ?? 0), 0);
      return clamp(rawValue, question.minValue ?? -2, question.maxValue ?? 2);
    }

    return answer.value;
  }

  function getNumericValues(question) {
    if (question.type === "slider") {
      return (question.ranges || []).map((range) => range.value).filter((value) => typeof value === "number");
    }

    return (question.answers || []).map((answer) => answer.value).filter((value) => typeof value === "number");
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
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  function normalizeQuestionPercentage(question, value) {
    if (value === null || value === undefined) return null;
    const { min, max } = getQuestionRange(question);
    if (max === min) return 100;
    return clamp(Math.round(((value - min) / (max - min)) * 100), 0, 100);
  }

  function calculateCategoryBreakdown() {
    return categories.map((category) => {
      const scores = category.questionIds
        .map((questionId) => {
          const question = questions.find((item) => item.id === questionId);
          if (!question || question.blocking) return null;
          const answer = state.answers[question.id];
          const value = getQuestionValue(question, answer);
          return normalizeQuestionPercentage(question, value);
        })
        .filter((score) => score !== null && score !== undefined);

      return {
        ...category,
        percentage: scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0,
        answered: scores.length
      };
    });
  }

  function calculateResult() {
    const questionPercentages = questions
      .map((question) => {
        if (question.blocking) return null;
        const answer = state.answers[question.id];
        const value = getQuestionValue(question, answer);
        return normalizeQuestionPercentage(question, value);
      })
      .filter((percentage) => percentage !== null && percentage !== undefined);

    const total = questionPercentages.reduce((sum, percentage) => sum + percentage, 0);
    const max = questionPercentages.length * 100;
    const percentage = questionPercentages.length ? Math.round(total / questionPercentages.length) : 0;

    return { total, max, percentage, result: getRouteResult(percentage), categories: calculateCategoryBreakdown() };
  }

  function getRouteResult(percentage) {
    const it = state.language === "it";

    if (percentage === 100) {
      return {
        route: "Wedding Route",
        text: it ? "Compatibilita 100%. Il sistema sta gia cercando anelli, icone Discord coordinate e una casa sospettosamente cute su Minecraft." : "100% compatibility. The system is already looking for rings, matching Discord icons and a suspiciously cute Minecraft house.",
        specialClass: "wedding-route"
      };
    }

    if (percentage <= 25) return { route: "Emotional Damage Route", text: it ? "Il sistema consiglia amicizia su Discord e distanza emotiva di sicurezza." : "The system recommends Discord friendship and emotional safety distance." };
    if (percentage <= 50) return { route: "Discord Friend Route", text: it ? "Qualcosa c'e, ma servono almeno tre meme, una pizza e verifica manuale." : "There is something here, but we need at least three memes, one pizza, and manual verification." };
    if (percentage <= 70) return { route: "Soft Match Route", text: it ? "La situazione sembra promettente. Il sistema approva una conversazione piu lunga del previsto." : "The situation looks promising. The system approves a conversation longer than expected." };
    if (percentage <= 90) return { route: "Possible Egirl Route", text: it ? "Buona compatibilita. Procedere con spritz, gossip e sessione Minecraft." : "Good compatibility. Proceed with spritz, gossip, and a Minecraft session." };
    return { route: "Legendary Egirl Route", text: it ? "Il sistema ha rilevato una candidata final boss. Verifica umana immediata richiesta." : "The system has detected a final-boss candidate. Immediate human verification required." };
  }

  function updateProgress() {
    const progress = questions.length ? ((state.currentIndex + 1) / questions.length) * 100 : 0;
    dom.progressBar.style.width = `${progress}%`;
  }

  function renderLanguageSelector() {
    const text = getText("it");
    dom.progressBar.style.width = "0%";
    dom.backBtn.disabled = true;
    dom.nextBtn.disabled = true;
    dom.backBtn.textContent = "Indietro";
    dom.nextBtn.textContent = "Avanti";

    dom.questionArea.innerHTML = `
      <div class="language-choice-box">
        <p class="quiz-kicker">Language / Lingua</p>
        <h2>${text.ui.selectLanguage}</h2>
        <p>${text.ui.languageSubtitle}</p>
        <div class="language-choice-grid">
          <button type="button" data-language="it">Italiano</button>
          <button type="button" data-language="en">English</button>
        </div>
      </div>
    `;

    dom.questionArea.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => bootQuiz(button.dataset.language));
    });
  }

  function renderQuestion() {
    const question = questions[state.currentIndex];
    const selected = state.answers[question.id];
    const text = getText(state.language);

    state.restartMode = false;
    updateProgress();

    dom.backBtn.disabled = state.currentIndex === 0;
    dom.nextBtn.textContent = state.currentIndex === questions.length - 1 ? text.ui.result : text.ui.next;
    dom.nextBtn.disabled = !selected && question.type !== "slider";

    const questionNumber = `${state.currentIndex + 1} / ${questions.length}`;

    if (question.type === "choice") renderChoiceQuestion(question, selected, questionNumber);
    if (question.type === "imageChoice") renderImageChoiceQuestion(question, selected, questionNumber);
    if (question.type === "multiChoice") renderMultiChoiceQuestion(question, selected, questionNumber);
    if (question.type === "slider") renderSliderQuestion(question, selected, questionNumber);
  }

  function renderChoiceQuestion(question, selected, questionNumber) {
    const text = getText(state.language);
    dom.questionArea.innerHTML = `
      <p class="question-number">${text.ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="answers-grid">
        ${question.answers.map((answer, index) => `
          <button class="answer-btn ${selected?.answerIndex === index ? "selected" : ""}" type="button" data-index="${index}">${answer.label}</button>
        `).join("")}
      </div>
    `;

    dom.questionArea.querySelectorAll(".answer-btn").forEach((button) => {
      button.addEventListener("click", () => handleSingleAnswer(question, Number(button.dataset.index)));
    });
  }

  function renderImageChoiceQuestion(question, selected, questionNumber) {
    const text = getText(state.language);
    dom.questionArea.innerHTML = `
      <p class="question-number">${text.ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="image-choice-grid">
        ${question.answers.map((answer, index) => `
          <button class="image-choice-card ${selected?.answerIndex === index ? "selected" : ""}" type="button" data-index="${index}">
            <img src="${answer.image}" alt="${answer.label}" loading="lazy" />
            <span>${answer.label}</span>
          </button>
        `).join("")}
      </div>
    `;

    dom.questionArea.querySelectorAll(".image-choice-card").forEach((button) => {
      button.addEventListener("click", () => handleSingleAnswer(question, Number(button.dataset.index)));
    });
  }

  function renderMultiChoiceQuestion(question, selected, questionNumber) {
    const text = getText(state.language);
    const selectedIndexes = selected?.answerIndexes || [];

    if (question.id === "red_flags" && !question.mode) {
      dom.nextBtn.disabled = true;
      dom.questionArea.innerHTML = `
        <p class="question-number">${text.ui.question} ${questionNumber}</p>
        <h2 class="question-title">${question.question}</h2>
        <div class="bug-version-grid">
          <button class="bug-version-card" type="button" data-bug-mode="short"><strong>${question.shortTitle}</strong><span>${question.shortText}</span></button>
          <button class="bug-version-card" type="button" data-bug-mode="full"><strong>${question.fullTitle}</strong><span>${question.fullText}</span></button>
        </div>
      `;

      dom.questionArea.querySelectorAll("[data-bug-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          const mode = button.dataset.bugMode;
          question.mode = mode;
          question.answers = mode === "full" ? question.fullAnswers : question.shortAnswers;
          question.minValue = mode === "full" ? question.fullMinValue : question.shortMinValue;
          question.maxValue = mode === "full" ? question.fullMaxValue : question.shortMaxValue;
          state.answers[question.id] = { answerIndexes: [] };
          renderQuestion();
        });
      });
      return;
    }

    const fullGridClass = question.id === "red_flags" && question.mode === "full" ? " emotional-bugs-full-grid" : "";
    const changeButton = question.id === "red_flags" ? `<button class="bug-version-change" type="button" id="changeBugVersion">${text.ui.changeVersion}</button>` : "";

    dom.questionArea.innerHTML = `
      <p class="question-number">${text.ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      ${changeButton}
      <p class="question-hint">${text.ui.multiple}</p>
      <div class="answers-grid multi-choice-grid${fullGridClass}">
        ${question.answers.map((answer, index) => `
          <button class="answer-btn multi-choice-btn ${selectedIndexes.includes(index) ? "selected" : ""}" type="button" data-index="${index}">${answer.label}</button>
        `).join("")}
      </div>
    `;

    document.getElementById("changeBugVersion")?.addEventListener("click", () => {
      question.mode = null;
      delete state.answers[question.id];
      renderQuestion();
    });

    dom.questionArea.querySelectorAll(".multi-choice-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const answerIndex = Number(button.dataset.index);
        const current = state.answers[question.id]?.answerIndexes || [];
        const next = current.includes(answerIndex) ? current.filter((index) => index !== answerIndex) : [...current, answerIndex];

        if (next.length === 0) delete state.answers[question.id];
        else state.answers[question.id] = { answerIndexes: next };

        renderQuestion();
      });
    });
  }

  function renderSliderQuestion(question, selected, questionNumber) {
    const text = getText(state.language);
    const rawValue = selected?.rawValue ?? question.defaultValue ?? 50;
    const activeRange = getRangeAnswer(question, rawValue);

    if (!selected) {
      state.answers[question.id] = { rawValue, value: activeRange.value };
    }

    dom.questionArea.innerHTML = `
      <p class="question-number">${text.ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="slider-box">
        <input id="sliderInput" type="range" min="${question.min}" max="${question.max}" value="${rawValue}" />
        <div class="slider-value">
          <span>${text.ui.value}: <strong id="sliderNumber">${rawValue}</strong></span>
          <span class="slider-label" id="sliderLabel">${activeRange.label}</span>
        </div>
      </div>
    `;

    const sliderInput = document.getElementById("sliderInput");
    const sliderNumber = document.getElementById("sliderNumber");
    const sliderLabel = document.getElementById("sliderLabel");

    sliderInput.addEventListener("input", () => {
      const value = Number(sliderInput.value);
      const range = getRangeAnswer(question, value);
      sliderNumber.textContent = value;
      sliderLabel.textContent = range.label;
      state.answers[question.id] = { rawValue: value, value: range.value };
      dom.nextBtn.disabled = false;
    });
  }

  function handleSingleAnswer(question, answerIndex) {
    const answer = question.answers[answerIndex];
    state.answers[question.id] = { answerIndex, value: answer.value ?? null, action: answer.action ?? null };

    if (answer.action === "block") return renderBlocked();
    if (answer.action === "preferenceBlock") return renderPreferenceBlocked();
    if (answer.action === "starterPopup") window.alert(getText(state.language).ui.starterPopup);
    if (answer.action === "police") return runPoliceEvent();
    if (answer.action === "cowSound") playAudio(dom.cowAudio);
    if (answer.action === "pineappleEvent") runPineappleEvent();
    if (answer.action === "kawaiiSound") playAudio(audio.kawaii);

    renderQuestion();

    if (answer.action === "susSound") {
      playAudio(audio.sus);
      window.setTimeout(() => {
        if (state.currentIndex < questions.length - 1) {
          state.currentIndex += 1;
          renderQuestion();
        } else {
          renderResult();
        }
      }, 1000);
    }
  }

  function handleNextButton() {
    if (state.restartMode) return restartQuiz();
    goNext();
  }

  function goNext() {
    const question = questions[state.currentIndex];
    const selected = getSelectedAnswer(question);
    if (!selected && question.type !== "slider") return;

    if (state.currentIndex < questions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
      return;
    }

    renderResult();
  }

  function goBack() {
    if (state.restartMode) return;
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderQuestion();
      return;
    }

    state.language = null;
    renderLanguageSelector();
  }

  function setRestartScreen() {
    const text = getText(state.language);
    state.restartMode = true;
    dom.backBtn.disabled = true;
    dom.nextBtn.textContent = text.ui.restart;
    dom.nextBtn.disabled = false;
  }

  function renderResult() {
    const text = getText(state.language);
    const { percentage, result, categories } = calculateResult();
    const routeClass = result.specialClass || "";

    dom.progressBar.style.width = "100%";
    setRestartScreen();

    dom.questionArea.innerHTML = `
      <div class="result-box route-result">
        <p class="quiz-kicker">${text.ui.finalResult}</p>
        <div class="result-score">${percentage}%</div>
        <h2 class="route-name ${routeClass}">${result.route}</h2>
        <p class="result-text">${result.text}</p>
        ${renderCategoryBreakdown(categories)}
      </div>
    `;
  }

  function renderCategoryBreakdown(categoryResults) {
    const text = getText(state.language);
    const available = categoryResults.filter((category) => category.answered > 0);
    const sorted = [...available].sort((a, b) => b.percentage - a.percentage);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const highlightText = strongest && weakest
      ? `<p class="category-summary"><strong>${text.ui.strongest}:</strong> ${strongest.label} · <strong>${text.ui.weakest}:</strong> ${weakest.label}</p>`
      : "";

    return `
      <section class="category-breakdown" aria-label="${text.ui.categoryBreakdown}">
        <p class="quiz-kicker">${text.ui.categoryBreakdown}</p>
        ${highlightText}
        <div class="category-breakdown-grid">
          ${categoryResults.map((category) => `
            <div class="category-breakdown-item">
              <div class="category-breakdown-head"><span>${category.label}</span><strong>${category.percentage}%</strong></div>
              <div class="category-breakdown-bar" aria-hidden="true"><span style="width:${category.percentage}%"></span></div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderBlocked() {
    const text = getText(state.language);
    dom.progressBar.style.width = "100%";
    setRestartScreen();
    dom.questionArea.innerHTML = `<div class="blocked-card"><h2>${text.ui.accessDenied}</h2><p>${text.ui.accessDeniedText}</p></div>`;
  }

  function renderPreferenceBlocked() {
    const text = getText(state.language);
    dom.progressBar.style.width = "100%";
    setRestartScreen();
    dom.questionArea.innerHTML = `<div class="blocked-card"><h2>${text.ui.unavailable}</h2><p>${text.ui.unavailableText}</p></div>`;
  }

  function runPoliceEvent() {
    playAudio(dom.policeAudio);
    const it = state.language === "it";
    dom.overlay.className = "special-overlay";
    dom.overlay.innerHTML = `
      <img class="overlay-photo" src="/img/incarcerato.png" alt="Jailed" />
      <div class="bars"></div>
      <div class="overlay-message">${it ? "🚨 ERRORE 113: MINORENNE RILEVATO. Riprova quando avrai 18 anni ;)" : "🚨 ERROR 113: MINOR DETECTED. Try again when you are 18 ;)"}</div>
    `;
    dom.backBtn.disabled = true;
    dom.nextBtn.disabled = true;
  }

  function runPineappleEvent() {
    playAudio(audio.bells);
    const it = state.language === "it";
    dom.overlay.className = "special-overlay pineapple-overlay";
    dom.overlay.innerHTML = `
      <div class="overlay-message pineapple-verse" role="dialog" aria-modal="true">
        <p class="verse-ref">${it ? "Libro della Pizza 3:14" : "Book of Pizza 3:14"}</p>
        <p>${it ? "O cieli, abbiate pieta di chi poso l'ananas sulla pizza, perche grande fu il peccato e tremante la mozzarella." : "O heavens, have mercy on the one who placed pineapple upon pizza, for great was the sin and trembling was the mozzarella."}</p>
        <p>${it ? "Che le campane suonino, che il forno perdoni, e che nessuna rucola testimoni contro di lei." : "Let the bells ring, let the oven forgive, and let no arugula testify against her."}</p>
        <button class="verse-close" type="button" id="closePineappleVerse">${it ? "Chiedo perdono" : "I ask forgiveness"}</button>
      </div>
    `;
    document.getElementById("closePineappleVerse")?.addEventListener("click", hideOverlay);
  }

  function hideOverlay() {
    dom.overlay.className = "special-overlay hidden";
    dom.overlay.innerHTML = "";
  }

  function restartQuiz() {
    state.language = null;
    state.currentIndex = 0;
    state.answers = {};
    state.restartMode = false;
    hideOverlay();
    renderLanguageSelector();
  }

  function ensureStyles() {
    if (document.getElementById("bemyegirlUnifiedStyles")) return;
    const style = document.createElement("style");
    style.id = "bemyegirlUnifiedStyles";
    style.textContent = `
      .language-choice-box{text-align:center;display:grid;gap:18px;justify-items:center;padding:18px 0 6px}.language-choice-box h2{margin:0;color:#f7fff9;font-size:clamp(2rem,6vw,4rem);line-height:.95;letter-spacing:-.055em}.language-choice-box p{max-width:520px;margin:0;color:rgba(245,255,248,.76);font-size:1rem;font-weight:700;line-height:1.55}.language-choice-grid{display:grid;grid-template-columns:1fr;gap:14px;width:min(100%,520px);margin-top:8px}.language-choice-grid button{border:1px solid rgba(255,255,255,.16);border-radius:24px;padding:20px;color:#f8fff9;background:rgba(255,255,255,.08);box-shadow:0 18px 46px rgba(0,0,0,.22);cursor:pointer;font-size:1.05rem;font-weight:950;transition:transform .16s ease,border-color .16s ease,background .16s ease}.language-choice-grid button:hover,.language-choice-grid button:focus-visible{transform:translateY(-2px);border-color:rgba(57,255,20,.45);background:rgba(57,255,20,.10);outline:none}@media (min-width:640px){.language-choice-grid{grid-template-columns:1fr 1fr}}
      .image-choice-card img{object-fit:cover}.image-choice-card img[src^="data:image/svg+xml"]{object-fit:contain;padding:14px;background:rgba(255,255,255,.04)}
      .bug-version-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:22px}.bug-version-card{border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:20px;color:#f8fff9;background:rgba(255,255,255,.08);box-shadow:0 18px 46px rgba(0,0,0,.24);cursor:pointer;text-align:left;transition:transform .16s ease,border-color .16s ease,background .16s ease}.bug-version-card:hover,.bug-version-card:focus-visible{transform:translateY(-2px);border-color:rgba(57,255,20,.45);background:rgba(57,255,20,.10);outline:none}.bug-version-card strong{display:block;margin-bottom:6px;font-size:1.02rem}.bug-version-card span{display:block;color:rgba(248,255,249,.72);font-size:.92rem;line-height:1.5}.bug-version-change{margin:0 0 16px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:8px 13px;color:#d7ffbc;background:rgba(255,255,255,.07);cursor:pointer;font-size:.76rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}@media (min-width:720px){.bug-version-grid{grid-template-columns:1fr 1fr}}
      @media (min-width:1180px){.multi-choice-grid.emotional-bugs-full-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.multi-choice-grid.emotional-bugs-full-grid .answer-btn{min-height:54px;padding:12px 14px;font-size:.86rem;line-height:1.22}}@media (min-width:1480px){.multi-choice-grid.emotional-bugs-full-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
      .category-breakdown{max-width:760px;margin:30px auto 0;border:1px solid rgba(255,255,255,.14);border-radius:24px;padding:20px;background:rgba(255,255,255,.065);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 42px rgba(0,0,0,.18);text-align:left}.category-breakdown .quiz-kicker{margin-bottom:14px}.category-summary{margin:0 0 16px;color:rgba(245,255,248,.78);font-size:.95rem;font-weight:800;line-height:1.5;text-align:left}.category-summary strong{color:#d7ffbc}.category-breakdown-grid{display:grid;gap:12px}.category-breakdown-item{display:grid;gap:8px}.category-breakdown-head{display:flex;align-items:center;justify-content:space-between;gap:12px;color:rgba(245,255,248,.92);font-size:.94rem;font-weight:900}.category-breakdown-head strong{color:#c9ffd4}.category-breakdown-bar{height:9px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}.category-breakdown-bar span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#39ff14,#d7ffbc);box-shadow:0 0 18px rgba(57,255,20,.36)}@media (min-width:1024px){.question-area .image-choice-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.category-breakdown-grid{grid-template-columns:1fr 1fr}}
      .route-name{margin:0 0 14px;color:#f7fff9;font-size:clamp(1.75rem,5vw,3.6rem);line-height:.98;letter-spacing:-.055em;text-shadow:0 0 18px rgba(57,255,20,.26),0 14px 34px rgba(0,0,0,.38)}.route-name.wedding-route{color:#fff2c8;text-shadow:0 0 12px rgba(255,242,200,.46),0 0 34px rgba(57,255,20,.28),0 14px 34px rgba(0,0,0,.40)}.result-box.route-result .result-text{margin-bottom:22px}
      .pineapple-overlay{background:radial-gradient(circle at 50% 16%,rgba(255,244,194,.20),transparent 28%),radial-gradient(circle,rgba(57,255,20,.10),transparent 52%),linear-gradient(180deg,#050505 0%,#0b0a05 100%)}.pineapple-verse{align-self:center!important;max-width:min(780px,calc(100% - 32px));margin:0!important;padding:clamp(26px,5vw,48px)!important;border:1px solid rgba(255,236,174,.30)!important;background:linear-gradient(180deg,rgba(42,31,13,.90),rgba(14,10,5,.92)),radial-gradient(circle at 50% 0%,rgba(255,236,174,.16),transparent 45%)!important;color:#fff2c8;font-family:Cambria,Georgia,'Times New Roman',serif!important;font-size:clamp(1.12rem,2.6vw,1.55rem)!important;font-weight:600!important;line-height:1.72!important;letter-spacing:.01em;text-shadow:0 2px 16px rgba(0,0,0,.55);box-shadow:0 28px 90px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.18)!important}.pineapple-verse .verse-ref{margin:0 0 18px!important;color:#d7ffbc!important;font-family:Cambria,Georgia,'Times New Roman',serif!important;font-size:.92rem!important;font-weight:900!important;letter-spacing:.14em!important;text-transform:uppercase!important}.verse-close{display:inline-flex;justify-content:center;align-items:center;margin-top:24px;border:1px solid rgba(255,236,174,.48);border-radius:999px;padding:12px 22px;color:#1a1204;background:linear-gradient(180deg,#fff2c8,#d7ffbc);box-shadow:0 0 26px rgba(255,236,174,.18),0 14px 30px rgba(0,0,0,.28);cursor:pointer;font-family:Cambria,Georgia,'Times New Roman',serif;font-size:1rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase;transition:transform .16s ease,filter .16s ease}.verse-close:hover,.verse-close:focus-visible{transform:translateY(-2px);filter:brightness(1.06);outline:none}
    `;
    document.head.appendChild(style);
  }

  function init() {
    if (!dom.questionArea || !dom.progressBar || !dom.backBtn || !dom.nextBtn || !dom.overlay) return;
    ensureStyles();
    dom.backBtn.addEventListener("click", goBack);
    dom.nextBtn.addEventListener("click", handleNextButton);
    renderLanguageSelector();
  }

  init();
})();
