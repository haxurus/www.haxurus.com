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

  const sounds = {
    bells: new Audio("audio/campane.mp3"),
    sus: new Audio("audio/sus.mp3"),
    kawaii: new Audio("audio/kawaii.mp3")
  };

  Object.values(sounds).forEach((sound) => {
    sound.preload = "auto";
  });

  const state = {
    language: null,
    currentIndex: 0,
    answers: {},
    restartMode: false
  };

  let questions = [];
  let categories = [];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const pizzaImage = (name) => `/img/bemyegirl/pizzas/${name}.png`;

  function playAudio(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function getUi(language) {
    const it = language === "it";
    return it ? {
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
      languageTitle: "Scegli la lingua",
      languageText: "Puoi fare il quiz in italiano o in inglese.",
      accessDenied: "Accesso negato",
      accessDeniedText: "Questo quiz contiene ironia discutibile. Per la tua sicurezza emotiva, il sistema ti accompagna gentilmente all'uscita.",
      routeUnavailable: "Route non disponibile",
      routeUnavailableText: "Questa risposta non corrisponde alla route cercata da questo quiz.",
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
      languageTitle: "Choose your language",
      languageText: "You can take the quiz in English or Italian.",
      accessDenied: "Access denied",
      accessDeniedText: "This quiz contains questionable irony. For your emotional safety, the system is kindly escorting you to the exit.",
      routeUnavailable: "Route not available",
      routeUnavailableText: "This answer does not match the route this quiz is looking for.",
      starterPopup: "Check your starter item!"
    };
  }

  function makePlaceholder(title, emoji) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><rect width="640" height="640" rx="54" fill="#07100d"/><circle cx="320" cy="266" r="158" fill="rgba(255,255,255,.08)"/><text x="320" y="318" text-anchor="middle" font-size="150" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${emoji}</text><text x="320" y="500" text-anchor="middle" fill="#f7fff9" font-size="38" font-weight="800" font-family="Arial, sans-serif">${title}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function getRedFlags(language) {
    const it = language === "it";
    const full = it ? [
      ["Attaccamento speedrun", 2],
      ["Richiesta rassicurazioni", 2],
      ["Gelosia.exe in background", 2],
      ["Overthinking su ogni dettaglio", 2],
      ["Cartella screenshot prove", 1],
      ["Generatore di scenari falsi", 1],
      ["Niente significa tutto", -1],
      ["Attenzioni richieste, domanda respinta", 0],
      ["Meme invece di comunicazione", -1],
      ["Cooldown emotivo necessario", 0],
      ["Fiducia lenta", 0],
      ["Lunatica ma self-aware", 0],
      ["Reply.exe a volte crasha", -2],
      ["Lettura del pensiero richiesta", -2],
      ["Litigi per attenzione", -2],
      ["Modalita ghost senza preavviso", -2],
      ["Analizzo i cambi di tono come prova forense", 2],
      ["Rileggo vecchi messaggi per farmi male", 1],
      ["Ho bisogno di prove quotidiane che ti piaccio ancora", 2],
      ["Divento silenziosa quando ci tengo troppo", 1],
      ["Dico 'va bene' quando non va affatto bene", 0],
      ["Creo archi narrativi relazionali da una singola interazione", 2],
      ["Fingo di non tenerci e poi ci tengo aggressivamente", 1],
      ["Metto alla prova le persone senza dire che e un test", -1],
      ["Voglio essere cercata ma faccio l'indisponibile", 1],
      ["Ho bisogno di attenzioni ma faccio l'indipendente", 1],
      ["Sono gelosa di persone mai viste", 2],
      ["Ricordo dettagli minuscoli e li uso come prove", 1],
      ["Sparisco per vedere se te ne accorgi", -2],
      ["Comunico meglio con i repost", 1],
      ["Ho bisogno di una schermata di caricamento prima di parlare di sentimenti", 0],
      ["Sono self-aware ma comunque problematica", 0],
      ["Chiedo scusa e poi overthinko le scuse", 1],
      ["Trasformo piccoli problemi in finali di stagione", 1],
      ["Mi aspetto il princess treatment ma lo nego", 2],
      ["Stalkero le tue playlist per indizi emotivi", 1],
      ["Controllo il tuo stato online come se mi dovesse dei soldi", 2],
      ["Scrivo il messaggio, lo cancello e poi faccio la normale", -2],
      ["Ho bisogno di rassicurazioni dopo il mio stesso overthinking", 2],
      ["Perdono in fretta ma ricordo tutto", 0],
      ["Vado offline invece di spiegare cosa non va", -1],
      ["Vinco discussioni nella mia testa prima che succedano", 0],
      ["Dico che sono low maintenance, poi richiedo aggiornamenti lore", 1],
      ["Vado in panico quando qualcuno e troppo gentile", 1],
      ["Ho bisogno di affetto ma mi imbarazzo a riceverlo", 1],
      ["Posso essere drammatica, ma almeno sono divertente", 1]
    ] : [
      ["Attachment speedrun", 2],
      ["Reassurance required", 2],
      ["Jealousy.exe running in background", 2],
      ["Overthinking every tiny detail", 2],
      ["Screenshot evidence folder", 1],
      ["Fake scenarios generator", 1],
      ["Nothing means everything", -1],
      ["Attention needed, request denied", 0],
      ["Memes instead of communication", -1],
      ["Emotional cooldown needed", 0],
      ["Slow trust process", 0],
      ["Moody but self-aware", 0],
      ["Reply.exe sometimes crashes", -2],
      ["Mind reading expected", -2],
      ["Arguments for attention", -2],
      ["Ghost mode without warning", -2],
      ["I analyze tone changes like forensic evidence", 2],
      ["I reread old messages for emotional damage", 1],
      ["I need daily proof that you still like me", 2],
      ["I get quiet when I care too much", 1],
      ["I say 'it's fine' when it is absolutely not fine", 0],
      ["I create entire relationship arcs from one interaction", 2],
      ["I pretend not to care and then care aggressively", 1],
      ["I test people without telling them there is a test", -1],
      ["I want to be chased but act unavailable", 1],
      ["I need attention but act independent", 1],
      ["I get jealous of people I have never met", 2],
      ["I remember tiny details and use them as evidence", 1],
      ["I disappear to see if you notice", -2],
      ["I communicate better through reposts", 1],
      ["I need a loading screen before talking about feelings", 0],
      ["I am self-aware but still problematic", 0],
      ["I apologize and then overthink the apology", 1],
      ["I turn small problems into season finales", 1],
      ["I expect princess treatment but deny it", 2],
      ["I stalk your playlists for emotional clues", 1],
      ["I check your online status like it owes me money", 2],
      ["I write the message, delete it, then act normal", -2],
      ["I need reassurance after my own overthinking", 2],
      ["I forgive fast but remember everything", 0],
      ["I go offline instead of explaining what is wrong", -1],
      ["I win arguments in my head before they happen", 0],
      ["I say I am low maintenance, then require lore updates", 1],
      ["I panic when someone is too nice to me", 1],
      ["I need affection but get embarrassed receiving it", 1],
      ["I can be dramatic, but at least I am funny", 1]
    ];

    return full.map(([label, value]) => ({ label, value }));
  }

  function makeQuestionList(language) {
    const it = language === "it";
    const redFull = getRedFlags(language);
    const redShort = [0, 1, 4, 9, 43, 12, 13, 15].map((index) => redFull[index]);

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
      sliderQuestion("cioccolato", it ? "Scegli il tuo livello estetico di cioccolato" : "Choose your aesthetic chocolate level", 20, it ? [
        [0, 20, "Cioccolato bianco", 2],
        [21, 40, "Cioccolato al latte", 0],
        [41, 60, "Fondente 50%", -1],
        [61, 80, "Fondente 75%", -2],
        [81, 100, "Cacao puro final boss", -3]
      ] : [
        [0, 20, "White chocolate", 2],
        [21, 40, "Milk chocolate", 0],
        [41, 60, "50% dark chocolate", -1],
        [61, 80, "75% dark chocolate", -2],
        [81, 100, "Pure cocoa final boss", -3]
      ]),
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
          ["Brillantino laterale al naso", 1], ["Septum", -1], ["Piercing alla lingua", -1], ["Piercing all'ombelico", 1], ["Orecchini", 1], ["Piu piercing alle orecchie", 0], ["Altri piercing", -1], ["Tatuaggi", -1], ["Cicatrici", 0], ["Apparecchio ai denti", 1], ["Lentiggini", 1], ["Nei particolari", 0], ["Occhiali", 1], ["Fossette", 1], ["Nessuno", 0], ["Il dettaglio raro sono io", 1]
        ].map(([label, value]) => ({ label, value })) : [
          ["Small side nose stud", 1], ["Septum piercing", -1], ["Tongue piercing", -1], ["Belly button piercing", 1], ["Earrings", 1], ["Multiple ear piercings", 0], ["Other piercings", -1], ["Tattoos", -1], ["Scars", 0], ["Braces", 1], ["Freckles", 1], ["Distinctive beauty marks", 0], ["Glasses", 1], ["Dimples", 1], ["None", 0], ["I am the rare detail", 1]
        ].map(([label, value]) => ({ label, value }))
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
      choiceQuestion("appiccicosa", it ? "Quanto sei appiccicosa?" : "How clingy are you?", it ? [
        ["Modalita koala emotivo", 2], ["Abbastanza, ma con dignita", 1], ["Normale", 0], ["Molto indipendente", -1], ["Ci sentiamo una volta a settimana", -2]
      ] : [
        ["Emotional koala mode", 2], ["Quite a bit, but with dignity", 1], ["Normal", 0], ["Very independent", -1], ["We talk once a week", -2]
      ]),
      sliderQuestion("gelosia", it ? "Quanto sei gelosa?" : "How jealous are you?", 45, it ? [
        [0, 20, "Fai quello che vuoi", -2], [21, 40, "Gelosia sana", 0], [41, 60, "Chi e questa?", 1], [61, 80, "Analizzo le storie Instagram", 2], [81, 100, "Dammi il telefono", 1]
      ] : [
        [0, 20, "Do whatever you want", -2], [21, 40, "Healthy jealousy", 0], [41, 60, "Who is this?", 1], [61, 80, "I analyze Instagram stories", 2], [81, 100, "Give me your phone", 1]
      ]),
      {
        id: "red_flags",
        type: "multiChoice",
        question: it ? "Scegli i tuoi bug emotivi" : "Choose your emotional bugs",
        answers: redShort,
        shortAnswers: redShort,
        fullAnswers: redFull,
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
      choiceQuestion("assenza", it ? "Se non rispondo per qualche ora, cosa fai?" : "If I do not reply for a few hours, what do you do?", it ? [
        ["Ti cerco per sapere se sei vivo", 2], ["Ti mando un meme per attirare la tua attenzione", 2], ["Ti scrivo 'tutto bene?'", 1], ["Aspetto senza dire nulla", 0], ["Sparisco anche io per principio", -2]
      ] : [
        ["I check on you because I want to know if you are alive", 2], ["I send you a meme to get your attention", 2], ["I text you 'everything okay?'", 1], ["I wait without saying anything", 0], ["I disappear too out of principle", -2]
      ]),
      choiceQuestion("buonanotte", it ? "Se ti scrivo 'Buonanotte', come rispondi?" : "If I texted you 'Goodnight', how would you reply?", it ? [
        ["Buonanotte ❤️", 2], ["Notteee", 1], ["Meme disturbante prima di dormire", 2], ["Visualizzato", -2], ["notte", -1]
      ] : [
        ["Goodnight ❤️", 2], ["Nighttt", 1], ["Disturbing meme before sleeping", 2], ["Left on read", -2], ["night", -1]
      ]),
      choiceQuestion("litigio", it ? "Se litighiamo per una cosa stupida" : "If we argue over something stupid", it ? [
        ["Ne parliamo e poi facciamo pace", 2], ["Prima mi offendo, poi torno", 1], ["Ti mando un meme per rompere il ghiaccio", 2], ["Silenzio radio", -2], ["Fingo che non sia successo nulla per 3 giorni", -1]
      ] : [
        ["We talk about it and then make peace", 2], ["First I get offended, then I come back", 1], ["I send you a meme to break the ice", 2], ["Radio silence", -2], ["I pretend nothing happened for 3 days", -1]
      ]),
      {
        id: "communication_style",
        type: "multiChoice",
        question: it ? "Come comunichi quando qualcosa conta davvero?" : "How do you communicate when something matters?",
        minValue: -6,
        maxValue: 10,
        answers: it ? [
          ["So dire cosa provo senza trasformarlo in un processo", 2],
          ["Ho bisogno di tempo, ma poi mi spiego", 2],
          ["Preferisco scrivere perche mi esprimo meglio cosi", 1],
          ["Preferisco parlare direttamente, anche se e scomodo", 2],
          ["Dico quando qualcosa mi ferisce invece di fingere che vada bene", 2],
          ["So chiedere scusa senza aggiungere un 'pero'", 2],
          ["Chiedo chiarimenti invece di pensare subito al peggio", 2],
          ["Prima mi chiudo, ma poi torno quando sono piu calma", 1],
          ["Scherzo sui problemi prima di parlarne seriamente", 0],
          ["Ho bisogno di rassicurazioni prima di spiegare cosa non va", 0],
          ["Dico 'niente' e mi aspetto che tu capisca tutto", -2],
          ["Evito le conversazioni serie finche non esplodono", -2],
          ["Sparisco quando non so spiegarmi", -2],
          ["Chiedo scusa, ma solo dopo averla resa drammatica", -1],
          ["Preferisco essere arrabbiata piuttosto che vulnerabile", -2]
        ].map(([label, value]) => ({ label, value })) : [
          ["I can say what I feel without turning it into a trial", 2],
          ["I need some time, but then I explain myself", 2],
          ["I prefer writing because I express myself better that way", 1],
          ["I prefer talking directly, even if it is uncomfortable", 2],
          ["I say when something hurts me instead of pretending it is fine", 2],
          ["I can apologize without adding a 'but'", 2],
          ["I ask for clarification instead of assuming the worst", 2],
          ["I get quiet first, but I come back when I am calmer", 1],
          ["I joke about problems before talking seriously", 0],
          ["I need reassurance before I can explain what is wrong", 0],
          ["I say 'nothing' and expect you to understand everything", -2],
          ["I avoid serious conversations until they explode", -2],
          ["I disappear when I do not know how to explain myself", -2],
          ["I apologize, but only after making it dramatic", -1],
          ["I would rather be mad than vulnerable", -2]
        ].map(([label, value]) => ({ label, value }))
      },
      {
        id: "personal_values",
        type: "multiChoice",
        question: it ? "Quali valori contano davvero per te?" : "Which values actually matter to you?",
        minValue: -6,
        maxValue: 10,
        answers: it ? [
          ["La fedelta non e negoziabile", 2],
          ["Se scelgo qualcuno, rispetto quella scelta", 2],
          ["Non do corda a persone che vogliono chiaramente piu di un'amicizia", 2],
          ["La famiglia conta per me, ma ho comunque i miei confini", 2],
          ["Mi interessa costruire qualcosa di stabile, non solo provare qualcosa di intenso", 2],
          ["Preferisco l'onesta anche quando e scomoda", 2],
          ["Riesco a essere vulnerabile con qualcuno di cui mi fido", 2],
          ["La famiglia e importante, ma complicata", 1],
          ["Ho bisogno di tempo prima di fidarmi davvero", 1],
          ["Sono fedele, ma ho bisogno anche della mia indipendenza", 1],
          ["Faccio fatica con la vulnerabilita, ma ci provo", 1],
          ["Evito la vulnerabilita perche mi fa sentire debole", -2],
          ["Tengo opzioni di riserva perche non si sa mai", -3],
          ["Penso che la gelosia sia una prova d'amore", -1],
          ["Nascondo le cose per evitare discussioni", -2],
          ["Voglio fedelta, ma non mi piace essere messa in discussione", -1]
        ].map(([label, value]) => ({ label, value })) : [
          ["Loyalty is non-negotiable", 2],
          ["If I choose someone, I respect that choice", 2],
          ["I do not entertain people who clearly want more than friendship", 2],
          ["Family matters to me, but I still have my own boundaries", 2],
          ["I care about building something stable, not just feeling something intense", 2],
          ["I prefer honesty even when it is uncomfortable", 2],
          ["I can be vulnerable with someone I trust", 2],
          ["Family is important, but complicated", 1],
          ["I need time before I fully trust someone", 1],
          ["I am loyal, but I also need independence", 1],
          ["I struggle with vulnerability, but I try", 1],
          ["I avoid vulnerability because it makes me feel weak", -2],
          ["I keep backup options because you never know", -3],
          ["I think jealousy is proof of love", -1],
          ["I hide things to avoid arguments", -2],
          ["I want loyalty, but I do not like being questioned", -1]
        ].map(([label, value]) => ({ label, value }))
      },
      sliderQuestion("abbracci", it ? "Quanto ti piacciono gli abbracci?" : "How much do you like hugs?", 65, it ? [
        [0, 20, "Non toccarmi", -2], [21, 40, "A volte", 0], [41, 60, "Mi piacciono", 1], [61, 80, "Tanto", 2], [81, 100, "Modalita koala permanente", 2]
      ] : [
        [0, 20, "Do not touch me", -2], [21, 40, "Sometimes", 0], [41, 60, "I like them", 1], [61, 80, "A lot", 2], [81, 100, "Permanent koala mode", 2]
      ]),
      sliderQuestion("foto_insieme", it ? "Quanto sei disposta a fare foto insieme?" : "How willing are you to take photos together?", 55, it ? [
        [0, 20, "Niente foto", -2], [21, 40, "Solo se vengo bene", 0], [41, 60, "A volte", 1], [61, 80, "Foto carine insieme", 2], [81, 100, "Photoshoot di coppia", 1]
      ] : [
        [0, 20, "No photos", -2], [21, 40, "Only if I look good", 0], [41, 60, "Sometimes", 1], [61, 80, "Cute photos together", 2], [81, 100, "Couple photoshoot", 1]
      ]),
      choiceQuestion("cosa_cerchi", it ? "Cosa stai cercando davvero?" : "What are you actually looking for?", it ? [
        ["Qualcuno con cui ridere e stare bene", 2], ["Una relazione dolce ma anche stupida", 2], ["Qualcuno presente", 1], ["Non lo so, vediamo", 0], ["Sto solo passando il tempo", -2]
      ] : [
        ["Someone to laugh and feel good with", 2], ["A sweet but also stupid relationship", 2], ["Someone present", 1], ["I do not know, let us see", 0], ["Just passing time", -2]
      ]),
      choiceQuestion("reel", it ? "Se ti mando 12 reel in 5 minuti?" : "If I send you 12 reels in 5 minutes?", it ? [
        ["Li guardo tutti e commento", 2], ["Ne guardo alcuni e fingo di aver capito", 1], ["Rispondo solo 'haha'", 0], ["Ti silenzio", -1], ["Ti blocco e cambio identita", -2]
      ] : [
        ["I watch them all and comment", 2], ["I watch a few and pretend I understood", 1], ["I only reply 'haha'", 0], ["I mute you", -1], ["I block you and change identity", -2]
      ]),
      sliderQuestion("gossip", it ? "Quanto sei pronta a fare gossip inutile ma essenziale?" : "How ready are you to do useless but essential gossip?", 80, it ? [
        [0, 20, "Non mi interessano le vite degli altri", -2], [21, 40, "Ascolto, ma non partecipo", -1], [41, 60, "Ogni tanto va bene", 0], [61, 80, "Analisi completa di ogni dettaglio", 1], [81, 100, "Creo teorie, timeline e prove fotografiche", 2]
      ] : [
        [0, 20, "I do not care about other people's lives", -2], [21, 40, "I listen, but I do not participate", -1], [41, 60, "Sometimes it is fine", 0], [61, 80, "Full analysis of every detail", 1], [81, 100, "I create theories, timelines and photo evidence", 2]
      ]),
      sliderQuestion("nerd", it ? "Quanto sei nerd?" : "How nerdy are you?", 60, it ? [
        [0, 20, "Tocco l'erba ogni giorno", -1], [21, 40, "Nerd occasionale", 0], [41, 60, "So cos'e Discord", 1], [61, 80, "Ho almeno un trauma da gioco online", 2], [81, 100, "Il mio habitat naturale e davanti al PC", 2]
      ] : [
        [0, 20, "I touch grass every day", -1], [21, 40, "Occasional nerd", 0], [41, 60, "I know what Discord is", 1], [61, 80, "I have at least one online game trauma", 2], [81, 100, "My natural habitat is in front of the PC", 2]
      ]),
      sliderQuestion("videogiochi", it ? "Quanto riesci a tollerare i videogiochi?" : "How much can you tolerate video games?", 60, it ? [
        [0, 20, "Sono una perdita di tempo", -2], [21, 40, "Guardo ma non capisco", -1], [41, 60, "A volte va bene", 0], [61, 80, "Serata gaming approvata", 1], [81, 100, "Duo queue immediata", 2]
      ] : [
        [0, 20, "They are a waste of time", -2], [21, 40, "I watch but I do not understand", -1], [41, 60, "Sometimes it is fine", 0], [61, 80, "Evening gaming approved", 1], [81, 100, "Duo queue immediately", 2]
      ]),
      choiceQuestion("minecraft", it ? "Se dico 'Minecraft stasera'?" : "If I say 'Minecraft tonight'?", it ? [
        ["Io costruisco casa, tu mini", 2], ["Entro ma mi perdo dopo 3 minuti", 1], ["Solo se dopo guardiamo un film", 1], ["Minecraft e da bambini", -2], ["Faccio esplodere tutto con la TNT", 0]
      ] : [
        ["I build the house, you mine", 2], ["I will join but get lost after 3 minutes", 1], ["Only if we watch a movie after", 1], ["Minecraft is for kids", -2], ["I blow everything up with TNT", 0]
      ]),
      choiceQuestion("discord", it ? "Qual e il tuo rapporto con Discord?" : "What is your relationship with Discord?", it ? [
        ["Ci vivo", 2], ["Lo uso ogni tanto", 1], ["Lo conosco ma non lo uso", 0], ["Non so cosa sia", -1], ["Lo associo solo ai gamer tossici", -2]
      ] : [
        ["I live there", 2], ["I use it sometimes", 1], ["I know it but do not use it", 0], ["I do not know what it is", -1], ["I only associate it with toxic gamers", -2]
      ]),
      choiceQuestion("anime", it ? "Anime preferito?" : "Favorite anime?", it ? [
        ["Frieren", 2], ["Sword Art Online", 1], ["Death Note", 1], ["Non so decidere", 0], ["Non guardo anime", -3]
      ] : [
        ["Frieren", 2], ["Sword Art Online", 1], ["Death Note", 1], ["I cannot decide", 0], ["I do not watch anime", -3]
      ]),
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
          { label: "Non mangio pizza", image: makePlaceholder("No pizza", "🚫"), value: -4 }
        ] : [
          { label: "Buffalo mozzarella & fries", image: pizzaImage("buffalo-mozzarella-fries"), value: 3 },
          { label: "Wurstel & fries", image: pizzaImage("wurstel-fries"), value: 2 },
          { label: "Margherita", image: pizzaImage("margherita"), value: 1 },
          { label: "Diavola", image: pizzaImage("diavola"), value: 0 },
          { label: "Capricciosa", image: pizzaImage("capricciosa"), value: 0 },
          { label: "Four cheese", image: pizzaImage("four-cheese"), value: 0 },
          { label: "With arugula", image: pizzaImage("arugula"), value: -1, action: "cowSound" },
          { label: "Pineapple", image: pizzaImage("pineapple"), value: -3, action: "pineappleEvent" },
          { label: "I do not eat pizza", image: makePlaceholder("No pizza", "🚫"), value: -4 }
        ]
      },
      choiceQuestion("drink", it ? "Scegli un drink" : "Choose a drink", it ? [
        ["Aperol Spritz", 2], ["Coca-Cola", 1], ["Acqua naturale", 0], ["Monster alle 23", 1], ["Non bevo nulla", -1]
      ] : [
        ["Aperol Spritz", 2], ["Coca-Cola", 1], ["Still water", 0], ["Monster at 11 PM", 1], ["I do not drink anything", -1]
      ]),
      choiceQuestion("dolce", it ? "Scegli un dolce" : "Choose a dessert", it ? [
        ["Tiramisu", 2], ["Cheesecake", 1], ["Gelato", 1], ["Frutta", -1], ["Non mi piacciono i dolci", -2]
      ] : [
        ["Tiramisu", 2], ["Cheesecake", 1], ["Ice cream", 1], ["Fruit", -1], ["I do not like desserts", -2]
      ]),
      choiceQuestion("film_brutto", it ? "Se ti chiedo di guardare un film brutto" : "If I ask you to watch a bad movie", it ? [
        ["Lo guardo e lo insultiamo insieme", 2], ["Solo se c'e cibo", 1], ["Dipende dal film", 0], ["Mi addormento dopo 10 minuti", -1], ["No, solo film seri", -2]
      ] : [
        ["I watch it and we roast it together", 2], ["Only if there is food", 1], ["Depends on the movie", 0], ["I fall asleep after 10 minutes", -1], ["No, serious movies only", -2]
      ]),
      choiceQuestion("serata_ideale", it ? "Scegli una serata ideale" : "Choose an ideal evening", it ? [
        ["Film, pizza e coccole", 2], ["Gaming insieme", 2], ["Pub tranquillo", 1], ["Serata caotica in discoteca", -1], ["Ognuno a casa sua", -2]
      ] : [
        ["Movie, pizza and cuddles", 2], ["Gaming together", 2], ["Quiet pub", 1], ["Chaotic club night", -1], ["Everyone at their own home", -2]
      ])
    ];
  }

  function choiceQuestion(id, question, answers) {
    return {
      id,
      type: "choice",
      question,
      answers: answers.map(([label, value]) => ({ label, value }))
    };
  }

  function sliderQuestion(id, question, defaultValue, ranges) {
    return {
      id,
      type: "slider",
      question,
      min: 0,
      max: 100,
      defaultValue,
      ranges: ranges.map(([min, max, label, value]) => ({ min, max, label, value }))
    };
  }

  function makeCategories(language) {
    const it = language === "it";
    return [
      { id: "appearance", label: it ? "Aspetto" : "Appearance", questionIds: ["altezza", "cuddle_build", "cioccolato", "colore_occhi", "colore_capelli", "segni_particolari"] },
      { id: "personality", label: it ? "Personalita" : "Personality", questionIds: ["lgbtq_topics", "appiccicosa", "gelosia", "red_flags", "assenza", "buonanotte", "litigio"] },
      { id: "emotional_safety", label: it ? "Comunicazione / Sicurezza emotiva" : "Communication / Emotional safety", questionIds: ["communication_style", "personal_values"] },
      { id: "relationship", label: it ? "Vibe relazione" : "Relationship vibe", questionIds: ["origine", "dove_abiti_ora", "abbracci", "foto_insieme", "cosa_cerchi", "serata_ideale"] },
      { id: "nerd", label: it ? "Compatibilita nerd" : "Nerd compatibility", questionIds: ["videogiochi", "minecraft", "discord", "anime"] },
      { id: "lifestyle", label: it ? "Lifestyle / Gusti" : "Lifestyle / Taste", questionIds: ["pizza", "drink", "dolce", "film_brutto", "gossip"] }
    ];
  }

  function startQuiz(language) {
    state.language = language;
    state.currentIndex = 0;
    state.answers = {};
    state.restartMode = false;
    document.documentElement.lang = language === "it" ? "it" : "en";
    questions = makeQuestionList(language);
    categories = makeCategories(language);
    updateStaticText();
    renderQuestion();
  }

  function updateStaticText() {
    const ui = getUi(state.language || "en");
    const kicker = document.querySelector(".quiz-header .quiz-kicker");
    const subtitle = document.querySelector(".quiz-subtitle");
    if (kicker) kicker.textContent = ui.kicker;
    if (subtitle) subtitle.textContent = ui.subtitle;
    dom.backBtn.textContent = ui.back;
    dom.nextBtn.textContent = ui.next;
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
      const rawValue = selectedIndexes.reduce((sum, index) => sum + (question.answers[index]?.value ?? 0), 0);
      return clamp(rawValue, question.minValue ?? -2, question.maxValue ?? 2);
    }
    return answer.value;
  }

  function getNumericValues(question) {
    if (question.type === "slider") return question.ranges.map((range) => range.value).filter(Number.isFinite);
    return (question.answers || []).map((answer) => answer.value).filter(Number.isFinite);
  }

  function getQuestionRange(question) {
    if (question.type === "multiChoice") {
      const values = getNumericValues(question);
      const min = values.filter((value) => value < 0).reduce((sum, value) => sum + value, 0);
      const max = values.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
      return {
        min: question.minValue ?? min,
        max: question.maxValue ?? max
      };
    }
    const values = getNumericValues(question);
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 2
    };
  }

  function normalizeQuestionPercentage(question, value) {
    if (value === null || value === undefined) return null;
    const { min, max } = getQuestionRange(question);
    if (min === max) return 100;
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
        answered: scores.length,
        percentage: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
      };
    });
  }

  function calculateResult() {
    const scores = questions
      .map((question) => {
        if (question.blocking) return null;
        const answer = state.answers[question.id];
        const value = getQuestionValue(question, answer);
        return normalizeQuestionPercentage(question, value);
      })
      .filter((score) => score !== null && score !== undefined);
    const percentage = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    return {
      percentage,
      result: getRouteResult(percentage),
      categories: calculateCategoryBreakdown()
    };
  }

  function getRouteResult(percentage) {
    const it = state.language === "it";
    if (percentage === 100) return { route: "Wedding Route", text: it ? "Compatibilita 100%. Il sistema sta gia cercando anelli, icone Discord coordinate e una casa sospettosamente cute su Minecraft." : "100% compatibility. The system is already looking for rings, matching Discord icons and a suspiciously cute Minecraft house.", specialClass: "wedding-route" };
    if (percentage <= 25) return { route: "Emotional Damage Route", text: it ? "Il sistema consiglia amicizia su Discord e distanza emotiva di sicurezza." : "The system recommends Discord friendship and emotional safety distance." };
    if (percentage <= 50) return { route: "Discord Friend Route", text: it ? "Qualcosa c'e, ma servono almeno tre meme, una pizza e verifica manuale." : "There is something here, but we need at least three memes, one pizza, and manual verification." };
    if (percentage <= 70) return { route: "Soft Match Route", text: it ? "La situazione sembra promettente. Il sistema approva una conversazione piu lunga del previsto." : "The situation looks promising. The system approves a conversation longer than expected." };
    if (percentage <= 90) return { route: "Possible Egirl Route", text: it ? "Buona compatibilita. Procedere con spritz, gossip e sessione Minecraft." : "Good compatibility. Proceed with spritz, gossip, and a Minecraft session." };
    return { route: "Legendary Egirl Route", text: it ? "Il sistema ha rilevato una candidata final boss. Verifica umana immediata richiesta." : "The system has detected a final-boss candidate. Immediate human verification required." };
  }

  function renderLanguageSelector() {
    const ui = getUi("it");
    dom.progressBar.style.width = "0%";
    dom.backBtn.disabled = true;
    dom.nextBtn.disabled = true;
    dom.backBtn.textContent = "Indietro";
    dom.nextBtn.textContent = "Avanti";
    dom.questionArea.innerHTML = `
      <div class="language-choice-box">
        <p class="quiz-kicker">Language / Lingua</p>
        <h2>${ui.languageTitle}</h2>
        <p>${ui.languageText}</p>
        <div class="language-choice-grid">
          <button type="button" data-language="it">Italiano</button>
          <button type="button" data-language="en">English</button>
        </div>
      </div>
    `;
    dom.questionArea.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => startQuiz(button.dataset.language));
    });
  }

  function updateProgress() {
    const progress = questions.length ? ((state.currentIndex + 1) / questions.length) * 100 : 0;
    dom.progressBar.style.width = `${progress}%`;
  }

  function renderQuestion() {
    const question = questions[state.currentIndex];
    const selected = state.answers[question.id];
    const ui = getUi(state.language);
    state.restartMode = false;
    updateProgress();
    dom.backBtn.disabled = state.currentIndex === 0;
    dom.nextBtn.textContent = state.currentIndex === questions.length - 1 ? ui.result : ui.next;
    dom.nextBtn.disabled = !selected && question.type !== "slider";
    const questionNumber = `${state.currentIndex + 1} / ${questions.length}`;
    if (question.type === "choice") renderChoiceQuestion(question, selected, questionNumber);
    if (question.type === "imageChoice") renderImageChoiceQuestion(question, selected, questionNumber);
    if (question.type === "multiChoice") renderMultiChoiceQuestion(question, selected, questionNumber);
    if (question.type === "slider") renderSliderQuestion(question, selected, questionNumber);
  }

  function renderChoiceQuestion(question, selected, questionNumber) {
    const ui = getUi(state.language);
    dom.questionArea.innerHTML = `
      <p class="question-number">${ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="answers-grid">
        ${question.answers.map((answer, index) => `<button class="answer-btn ${selected?.answerIndex === index ? "selected" : ""}" type="button" data-index="${index}">${answer.label}</button>`).join("")}
      </div>
    `;
    dom.questionArea.querySelectorAll(".answer-btn").forEach((button) => {
      button.addEventListener("click", () => handleSingleAnswer(question, Number(button.dataset.index)));
    });
  }

  function renderImageChoiceQuestion(question, selected, questionNumber) {
    const ui = getUi(state.language);
    dom.questionArea.innerHTML = `
      <p class="question-number">${ui.question} ${questionNumber}</p>
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
    const ui = getUi(state.language);
    const selectedIndexes = selected?.answerIndexes || [];
    if (question.id === "red_flags" && !question.mode) {
      dom.nextBtn.disabled = true;
      dom.questionArea.innerHTML = `
        <p class="question-number">${ui.question} ${questionNumber}</p>
        <h2 class="question-title">${question.question}</h2>
        <div class="bug-version-grid">
          <button class="bug-version-card" type="button" data-bug-mode="short"><strong>${question.shortTitle}</strong><span>${question.shortText}</span></button>
          <button class="bug-version-card" type="button" data-bug-mode="full"><strong>${question.fullTitle}</strong><span>${question.fullText}</span></button>
        </div>
      `;
      dom.questionArea.querySelectorAll("[data-bug-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          question.mode = button.dataset.bugMode;
          question.answers = question.mode === "full" ? question.fullAnswers : question.shortAnswers;
          question.minValue = question.mode === "full" ? question.fullMinValue : question.shortMinValue;
          question.maxValue = question.mode === "full" ? question.fullMaxValue : question.shortMaxValue;
          state.answers[question.id] = { answerIndexes: [] };
          renderQuestion();
        });
      });
      return;
    }
    const fullGrid = question.id === "red_flags" && question.mode === "full" ? " emotional-bugs-full-grid" : "";
    const changeButton = question.id === "red_flags" ? `<button class="bug-version-change" type="button" id="changeBugVersion">${ui.changeVersion}</button>` : "";
    dom.questionArea.innerHTML = `
      <p class="question-number">${ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      ${changeButton}
      <p class="question-hint">${ui.multiple}</p>
      <div class="answers-grid multi-choice-grid${fullGrid}">
        ${question.answers.map((answer, index) => `<button class="answer-btn multi-choice-btn ${selectedIndexes.includes(index) ? "selected" : ""}" type="button" data-index="${index}">${answer.label}</button>`).join("")}
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
    const ui = getUi(state.language);
    const rawValue = selected?.rawValue ?? question.defaultValue ?? 50;
    const activeRange = getRangeAnswer(question, rawValue);
    if (!selected) state.answers[question.id] = { rawValue, value: activeRange.value };
    dom.questionArea.innerHTML = `
      <p class="question-number">${ui.question} ${questionNumber}</p>
      <h2 class="question-title">${question.question}</h2>
      <div class="slider-box">
        <input id="sliderInput" type="range" min="${question.min}" max="${question.max}" value="${rawValue}" />
        <div class="slider-value">
          <span>${ui.value}: <strong id="sliderNumber">${rawValue}</strong></span>
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
    if (answer.action === "starterPopup") window.alert(getUi(state.language).starterPopup);
    if (answer.action === "police") return runPoliceEvent();
    if (answer.action === "cowSound") playAudio(dom.cowAudio);
    if (answer.action === "pineappleEvent") runPineappleEvent();
    if (answer.action === "kawaiiSound") playAudio(sounds.kawaii);
    renderQuestion();
    if (answer.action === "susSound") {
      playAudio(sounds.sus);
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
    const ui = getUi(state.language);
    state.restartMode = true;
    dom.backBtn.disabled = true;
    dom.nextBtn.textContent = ui.restart;
    dom.nextBtn.disabled = false;
  }

  function renderResult() {
    const ui = getUi(state.language);
    const { percentage, result, categories } = calculateResult();
    dom.progressBar.style.width = "100%";
    setRestartScreen();
    dom.questionArea.innerHTML = `
      <div class="result-box route-result">
        <p class="quiz-kicker">${ui.finalResult}</p>
        <div class="result-score">${percentage}%</div>
        <h2 class="route-name ${result.specialClass || ""}">${result.route}</h2>
        <p class="result-text">${result.text}</p>
        ${renderCategoryBreakdown(categories)}
      </div>
    `;
  }

  function renderCategoryBreakdown(categoryResults) {
    const ui = getUi(state.language);
    const available = categoryResults.filter((category) => category.answered > 0);
    const sorted = [...available].sort((a, b) => b.percentage - a.percentage);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const summary = strongest && weakest ? `<p class="category-summary"><strong>${ui.strongest}:</strong> ${strongest.label} · <strong>${ui.weakest}:</strong> ${weakest.label}</p>` : "";
    return `
      <section class="category-breakdown" aria-label="${ui.categoryBreakdown}">
        <p class="quiz-kicker">${ui.categoryBreakdown}</p>
        ${summary}
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
    const ui = getUi(state.language);
    dom.progressBar.style.width = "100%";
    setRestartScreen();
    dom.questionArea.innerHTML = `<div class="blocked-card"><h2>${ui.accessDenied}</h2><p>${ui.accessDeniedText}</p></div>`;
  }

  function renderPreferenceBlocked() {
    const ui = getUi(state.language);
    dom.progressBar.style.width = "100%";
    setRestartScreen();
    dom.questionArea.innerHTML = `<div class="blocked-card"><h2>${ui.routeUnavailable}</h2><p>${ui.routeUnavailableText}</p></div>`;
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
    playAudio(sounds.bells);
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
    updateStaticText();
    renderLanguageSelector();
  }

  function handleNextButton() {
    if (state.restartMode) return restartQuiz();
    goNext();
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
