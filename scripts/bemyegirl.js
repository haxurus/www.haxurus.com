(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const dom = {
    q: $("questionArea"),
    bar: $("progressBar"),
    back: $("backBtn"),
    next: $("nextBtn"),
    overlay: $("specialOverlay"),
    police: $("policeAudio"),
    cow: $("cowAudio")
  };

  const audio = {
    bells: new Audio("audio/campane.mp3"),
    sus: new Audio("audio/sus.mp3"),
    kawaii: new Audio("audio/kawaii.mp3")
  };
  Object.values(audio).forEach((a) => { a.preload = "auto"; });

  const state = { lang: null, version: null, index: 0, answers: {}, restart: false };
  let questions = [];
  let categories = [];

  const SHORT_IDS = [
    "ironia",
    "tronchetto",
    "eta",
    "altezza",
    "cuddle_build",
    "segni_particolari",
    "appiccicosa",
    "gelosia",
    "red_flags",
    "assenza",
    "litigio",
    "communication_style",
    "personal_values",
    "cosa_cerchi",
    "nerd",
    "minecraft",
    "anime",
    "pizza"
  ];

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const play = (a) => { if (!a) return; a.currentTime = 0; a.play().catch(() => {}); };
  const pizza = (name) => `/img/bemyegirl/pizzas/${name}.png`;
  const arr = (items) => items.map(([label, value, action]) => ({ label, value, action }));

  function ui() {
    const it = state.lang === "it";
    return it ? {
      kicker: "Sistema di Compatibilità Haxurus",
      subtitle: "Un test scientificamente discutibile per misurare la compatibilità.",
      q: "Domanda",
      multi: "Puoi selezionare più risposte.",
      value: "Valore",
      back: "Indietro",
      next: "Avanti",
      result: "Risultato",
      restart: "Ricomincia",
      final: "Risultato finale",
      breakdown: "Analisi categorie",
      strongest: "Più forte",
      weakest: "Più debole",
      change: "Cambia versione",
      langTitle: "Scegli la lingua",
      langText: "Puoi fare il quiz in italiano o in inglese.",
      versionTitle: "Scegli la versione del quiz",
      versionText: "La versione breve contiene 18 domande principali. La versione lunga contiene tutte le domande.",
      shortTitle: "Versione breve",
      shortText: "18 domande. Più veloce, ma ancora abbastanza completa.",
      fullTitle: "Versione lunga",
      fullText: "Tutte le domande. Full compatibility scan.",
      accessDenied: "Accesso negato",
      accessText: "Questo quiz contiene ironia discutibile. Per la tua sicurezza emotiva, il sistema ti accompagna gentilmente all'uscita.",
      unavailable: "Route non disponibile",
      unavailableText: "Questa risposta non corrisponde alla route cercata da questo quiz.",
      starter: "Controlla il tuo starter item!"
    } : {
      kicker: "Haxurus Compatibility System",
      subtitle: "A scientifically questionable test to measure compatibility.",
      q: "Question",
      multi: "You can select multiple answers.",
      value: "Value",
      back: "Back",
      next: "Next",
      result: "Result",
      restart: "Restart",
      final: "Final result",
      breakdown: "Category breakdown",
      strongest: "Strongest",
      weakest: "Weakest",
      change: "Change version",
      langTitle: "Choose your language",
      langText: "You can take the quiz in English or Italian.",
      versionTitle: "Choose quiz version",
      versionText: "The short version has 18 core questions. The full version includes every question.",
      shortTitle: "Short version",
      shortText: "18 questions. Faster, but still complete enough.",
      fullTitle: "Full version",
      fullText: "All questions. Full compatibility scan.",
      accessDenied: "Access denied",
      accessText: "This quiz contains questionable irony. For your emotional safety, the system is kindly escorting you to the exit.",
      unavailable: "Route not available",
      unavailableText: "This answer does not match the route this quiz is looking for.",
      starter: "Check your starter item!"
    };
  }

  function placeholder(title, emoji) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><rect width="640" height="640" rx="54" fill="#07100d"/><circle cx="320" cy="266" r="158" fill="rgba(255,255,255,.08)"/><text x="320" y="318" text-anchor="middle" font-size="150" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${emoji}</text><text x="320" y="500" text-anchor="middle" fill="#f7fff9" font-size="38" font-weight="800" font-family="Arial,sans-serif">${title}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function redFlags(lang) {
    const it = lang === "it";
    const list = it ? [
      ["Attaccamento speedrun",2],["Richiesta rassicurazioni",2],["Gelosia.exe in background",2],["Overthinking su ogni dettaglio",2],["Cartella screenshot prove",1],["Generatore di scenari falsi",1],["Niente significa tutto",-1],["Attenzioni richieste, domanda respinta",0],["Meme invece di comunicazione",-1],["Cooldown emotivo necessario",0],["Fiducia lenta",0],["Lunatica ma self-aware",0],["Reply.exe a volte crasha",-2],["Lettura del pensiero richiesta",-2],["Litigi per attenzione",-2],["Modalità ghost senza preavviso",-2],["Analizzo i cambi di tono come prova forense",2],["Rileggo vecchi messaggi per farmi male",1],["Ho bisogno di prove quotidiane che ti piaccio ancora",2],["Divento silenziosa quando ci tengo troppo",1],["Dico 'va bene' quando non va affatto bene",0],["Creo archi narrativi relazionali da una singola interazione",2],["Fingo di non tenerci e poi ci tengo aggressivamente",1],["Metto alla prova le persone senza dire che è un test",-1],["Voglio essere cercata ma faccio l'indisponibile",1],["Ho bisogno di attenzioni ma faccio l'indipendente",1],["Sono gelosa di persone mai viste",2],["Ricordo dettagli minuscoli e li uso come prove",1],["Sparisco per vedere se te ne accorgi",-2],["Comunico meglio con i repost",1],["Ho bisogno di una schermata di caricamento prima di parlare di sentimenti",0],["Sono self-aware ma comunque problematica",0],["Chiedo scusa e poi overthinko le scuse",1],["Trasformo piccoli problemi in finali di stagione",1],["Mi aspetto il princess treatment ma lo nego",2],["Stalkero le tue playlist per indizi emotivi",1],["Controllo il tuo stato online come se mi dovesse dei soldi",2],["Scrivo il messaggio, lo cancello e poi faccio la normale",-2],["Ho bisogno di rassicurazioni dopo il mio stesso overthinking",2],["Perdono in fretta ma ricordo tutto",0],["Vado offline invece di spiegare cosa non va",-1],["Vinco discussioni nella mia testa prima che succedano",0],["Dico che sono low maintenance, poi richiedo aggiornamenti lore",1],["Vado in panico quando qualcuno è troppo gentile",1],["Ho bisogno di affetto ma mi imbarazzo a riceverlo",1],["Posso essere drammatica, ma almeno sono divertente",1]
    ] : [
      ["Attachment speedrun",2],["Reassurance required",2],["Jealousy.exe running in background",2],["Overthinking every tiny detail",2],["Screenshot evidence folder",1],["Fake scenarios generator",1],["Nothing means everything",-1],["Attention needed, request denied",0],["Memes instead of communication",-1],["Emotional cooldown needed",0],["Slow trust process",0],["Moody but self-aware",0],["Reply.exe sometimes crashes",-2],["Mind reading expected",-2],["Arguments for attention",-2],["Ghost mode without warning",-2],["I analyze tone changes like forensic evidence",2],["I reread old messages for emotional damage",1],["I need daily proof that you still like me",2],["I get quiet when I care too much",1],["I say 'it's fine' when it is absolutely not fine",0],["I create entire relationship arcs from one interaction",2],["I pretend not to care and then care aggressively",1],["I test people without telling them there is a test",-1],["I want to be chased but act unavailable",1],["I need attention but act independent",1],["I get jealous of people I have never met",2],["I remember tiny details and use them as evidence",1],["I disappear to see if you notice",-2],["I communicate better through reposts",1],["I need a loading screen before talking about feelings",0],["I am self-aware but still problematic",0],["I apologize and then overthink the apology",1],["I turn small problems into season finales",1],["I expect princess treatment but deny it",2],["I stalk your playlists for emotional clues",1],["I check your online status like it owes me money",2],["I write the message, delete it, then act normal",-2],["I need reassurance after my own overthinking",2],["I forgive fast but remember everything",0],["I go offline instead of explaining what is wrong",-1],["I win arguments in my head before they happen",0],["I say I am low maintenance, then require lore updates",1],["I panic when someone is too nice to me",1],["I need affection but get embarrassed receiving it",1],["I can be dramatic, but at least I am funny",1]
    ];
    return arr(list);
  }

  function choice(id, question, answers) { return { id, type: "choice", question, answers: arr(answers) }; }
  function multi(id, question, minValue, maxValue, answers) { return { id, type: "multiChoice", question, minValue, maxValue, answers: arr(answers) }; }
  function slider(id, question, defaultValue, ranges) { return { id, type: "slider", question, min: 0, max: 100, defaultValue, ranges: ranges.map(([min,max,label,value]) => ({ min, max, label, value })) }; }

  function buildAllQuestions(lang) {
    const it = lang === "it";
    const redFull = redFlags(lang);
    const redShort = [0,1,4,9,43,12,13,15].map((i) => redFull[i]);
    return [
      { id:"ironia", type:"choice", blocking:true, question: it ? "Capisci l'ironia e accetti l'umorismo nero?" : "Do you understand irony and accept dark humor?", answers:[{label:it?"Sì":"Yes",action:"continue"},{label:"No",action:"block"},{label:it?"Umorismo nero?":"Dark humor?",action:"block"}]},
      choice("lgbtq_topics", it ? "Come ti approcci ai temi LGBTQ+?" : "How do you approach LGBTQ+ topics?", it ? [["Rispetto tutti, ma so anche stare allo scherzo",2],["Non ne so molto, ma sono tranquilla",1],["Supporto la community in modo molto attivo",-2],["Mi va bene che ognuno faccia ciò che vuole, senza imporre opinioni",0],["Preferisco evitare l'argomento",0],["Mi mettono a disagio le battute spinte su questi temi",-2]] : [["I respect everyone, but I can also take a joke",2],["I do not know much, but I am chill",1],["I support the community very actively",-2],["I am fine with people doing what they want, just do not force opinions on me",0],["I prefer avoiding the topic",0],["I get uncomfortable with edgy jokes about these topics",-2]]),
      { id:"tronchetto", type:"choice", question: it ? "Scegli il tuo starter item:" : "Choose your starter item:", answers:[{label:it?"Il Tronchetto":"The Log",action:"preferenceBlock"},{label:it?"Sono un transformer":"I'm a transformer",action:"preferenceBlock"},{label:it?"Sono confusa":"I'm confused",value:0,action:"starterPopup"},{label:it?"Il Fiore":"The Flower",value:2}]},
      { id:"eta", type:"choice", question: it ? "Quanti anni hai?" : "How old are you?", answers: it ? [{label:"Meno di 18",action:"police"},{label:"Tra 18 e 22",value:1},{label:"Tra 23 e 25",value:2},{label:"Tra 26 e 30",value:-1},{label:"31 o più",value:-2}] : [{label:"Under 18",action:"police"},{label:"Between 18 and 22",value:1},{label:"Between 23 and 25",value:2},{label:"Between 26 and 30",value:-1},{label:"31 or older",value:-2}]},
      choice("origine", it ? "Dove sei spawnata?" : "Where were you spawned?", it ? [["Nord Italia",2],["Centro Italia",1],["Sud Italia / Isole",1],["Europa",0],["Fuori Europa",0],["Non lo so, sono semplicemente spawnata",2]] : [["Northern Italy",2],["Central Italy",1],["Southern Italy / Islands",1],["Europe",0],["Outside Europe",0],["I do not know, I was just spawned",2]]),
      choice("dove_abiti_ora", it ? "Dove vivi ora?" : "Where do you live now?", it ? [["Vicino Milano",2],["Lombardia",1],["Nord Italia",0],["Italia, ma lontano",-1],["Estero",-2],["Nel tuo cuore",2]] : [["Near Milan",2],["Lombardy",1],["Northern Italy",0],["Italy, but far away",-1],["Abroad",-2],["In your heart",2]]),
      choice("altezza", it ? "Quanto sei alta?" : "How tall are you?", it ? [["Meno di 1,55 m",1,"kawaiiSound"],["1,55 - 1,65 m",2,"kawaiiSound"],["1,66 - 1,75 m",1],["1,76 - 1,85 m",0],["Oltre 1,85 m",-1]] : [["Under 1.55 m",1,"kawaiiSound"],["1.55 - 1.65 m",2,"kawaiiSound"],["1.66 - 1.75 m",1],["1.76 - 1.85 m",0],["Over 1.85 m",-1]]),
      choice("cuddle_build", it ? "Qual è la tua cuddle build?" : "What is your cuddle build?", it ? [["Edizione peluche tascabile",2],["Slim / petite",2],["Media e abbastanza cute",1],["Morbida e coccolosa",1],["Curvy",0],["Plus-size cuddle boss",-1],["Final boss morbidissima",-2],["Gym arc sbloccata",0],["Rifiuto di essere percepita",-2]] : [["Small plushie edition",2],["Slim / petite",2],["Average and cute enough",1],["Soft and cuddly",1],["Curvy",0],["Plus-size cuddle boss",-1],["Very soft final boss",-2],["Gym arc unlocked",0],["I refuse to be perceived",-2]]),
      slider("cioccolato", it ? "Scegli il tuo livello estetico di cioccolato" : "Choose your aesthetic chocolate level", 20, it ? [[0,20,"Cioccolato bianco",2],[21,40,"Cioccolato al latte",0],[41,60,"Fondente 50%",-1],[61,80,"Fondente 75%",-2],[81,100,"Cacao puro final boss",-3]] : [[0,20,"White chocolate",2],[21,40,"Milk chocolate",0],[41,60,"50% dark chocolate",-1],[61,80,"75% dark chocolate",-2],[81,100,"Pure cocoa final boss",-3]]),
      choice("colore_occhi", it ? "Di che colore sono i tuoi occhi?" : "What color are your eyes?", it ? [["Azzurri",1],["Verdi",2],["Marroni",0],["Nocciola",0],["Grigi",1],["Neri / molto scuri",0],["Cambiano colore in base al mio mood",-2]] : [["Blue",1],["Green",2],["Brown",0],["Hazel",0],["Gray",1],["Black / very dark",0],["They change color depending on my mood",-2]]),
      choice("colore_capelli", it ? "Di che colore sono i tuoi capelli nella lore attuale?" : "What color is your hair in the current lore?", it ? [["Biondi",2],["Castani",1],["Neri",1],["Bianchi / argento",-1],["Rossi / rame",-2],["Colorati / tinti",0],["Dipende dal mio ultimo breakdown",0]] : [["Blonde",2],["Brown",1],["Black",1],["White / silver",-1],["Red / copper",-2],["Colored / dyed",0],["Depends on my latest breakdown",0]]),
      multi("style_aesthetic", it ? "Qual è il tuo stile di outfit più comune?" : "What is your usual outfit aesthetic?", -6, 10, it ? [["Outfit casual e cute",2],["Stile soft / cozy",2],["Femminile ma semplice",2],["Energia da felpa oversized",1],["Gonne / vestiti quando mi va",2],["Outfit puliti ed eleganti",1],["Dettagli alternative / goth",0],["Streetwear",0],["Outfit anime-coded",1],["Masc / tomboy outfit days",0],["Stile androgino / gender-fluid",0],["Mix femminile e maschile in base al mood",1],["Mi piace giocare con la gender expression",0],["Non mi interessa molto come mi vesto",-1],["Quasi sempre vestiti da palestra",-1],["Outfit molto provocanti come default",-2],["Guardaroba caotico, nessuno stile preciso",-1],["Quello che è pulito",-2]] : [["Cute casual outfits",2],["Soft / cozy style",2],["Feminine but simple",2],["Oversized hoodie energy",1],["Skirts / dresses when I feel like it",2],["Clean and elegant outfits",1],["Alternative / goth details",0],["Streetwear",0],["Anime-coded outfits",1],["Masc / tomboy outfit days",0],["Androgynous / gender-fluid style",0],["Mixing feminine and masculine depending on the mood",1],["I like playing with gender expression",0],["I do not care much about outfits",-1],["Gym clothes most of the time",-1],["Very revealing outfits are my default",-2],["Chaotic wardrobe, no consistent style",-1],["Whatever is clean",-2]]),
      multi("makeup_style", it ? "Qual è il tuo stile di trucco?" : "What is your makeup style?", -4, 8, it ? [["Trucco naturale",2],["Eyeliner leggero",2],["Gloss / tinta labbra",1],["Il blush è essenziale",2],["Trucco cute ma delicato",2],["Mi piace sembrare curata",1],["Full glam ogni tanto",0],["Trucco alternative / dark",0],["Niente trucco, ma comunque cute",1],["Look più masc, poco o niente trucco",0],["Trucco androgino / sperimentale",0],["Trucco pesante ogni giorno",-1],["Non riesco a uscire senza trucco",-1],["Uso il trucco come armatura emotiva",0],["Non mi interessa per niente",-2],["Il mio eyeliner dipende dal danno subito",1]] : [["Natural makeup",2],["Soft eyeliner",2],["Gloss / lip tint",1],["Blush is essential",2],["Cute but subtle makeup",2],["I like looking put together",1],["Occasional full glam",0],["Alternative / dark makeup",0],["No makeup, but still cute",1],["More masc look, little or no makeup",0],["Androgynous / experimental makeup",0],["Heavy makeup every day",-1],["I cannot leave the house without makeup",-1],["I use makeup as emotional armor",0],["I do not care at all",-2],["My eyeliner depends on the damage taken",1]]),
      multi("segni_particolari", it ? "Quali sono i tuoi dettagli da main character?" : "What are your main-character details?", -4, 8, it ? [["Brillantino laterale al naso",1],["Septum",-1],["Piercing alla lingua",-1],["Piercing all'ombelico",1],["Orecchini",1],["Più piercing alle orecchie",0],["Altri piercing",-1],["Tatuaggi",-1],["Cicatrici",0],["Apparecchio ai denti",1],["Lentiggini",1],["Nei particolari",0],["Occhiali",1],["Fossette",1],["Nessuno",0],["Il dettaglio raro sono io",1]] : [["Small side nose stud",1],["Septum piercing",-1],["Tongue piercing",-1],["Belly button piercing",1],["Earrings",1],["Multiple ear piercings",0],["Other piercings",-1],["Tattoos",-1],["Scars",0],["Braces",1],["Freckles",1],["Distinctive beauty marks",0],["Glasses",1],["Dimples",1],["None",0],["I am the rare detail",1]]),
      { id:"principessa_disney", type:"imageChoice", question: it ? "Quale anime girl ti rappresenta di più?" : "Which anime girl represents you the most?", answers:[{label:"Frieren",image:"/img/bemyegirl/frieren.png",value:2},{label:"Asuna Yuuki",image:"/img/bemyegirl/asuna.png",value:1},{label:"Misa Amane",image:"/img/bemyegirl/misaamane.png",value:1},{label:"Mao Mao",image:"/img/bemyegirl/maomao.png",value:2},{label:"Ai Hoshino",image:"/img/bemyegirl/aihoshino.png",value:1},{label:"Nana Osaki",image:"/img/bemyegirl/nanaosaki.png",value:0},{label:"Alya",image:"/img/bemyegirl/alya.png",value:1},{label:"Taiga Aisaka",image:"/img/bemyegirl/taigaaisaka.png",value:0},{label:"Nagisa Shiota",image:"/img/bemyegirl/nagisashiota.png",value:0,action:"susSound"}]},
      choice("appiccicosa", it ? "Quanto sei appiccicosa?" : "How clingy are you?", it ? [["Modalità koala emotivo",2],["Abbastanza, ma con dignità",1],["Normale",0],["Molto indipendente",-1],["Ci sentiamo una volta a settimana",-2]] : [["Emotional koala mode",2],["Quite a bit, but with dignity",1],["Normal",0],["Very independent",-1],["We talk once a week",-2]]),
      slider("gelosia", it ? "Quanto sei gelosa?" : "How jealous are you?", 45, it ? [[0,20,"Fai quello che vuoi",-2],[21,40,"Gelosia sana",0],[41,60,"Chi è questa?",1],[61,80,"Analizzo le storie Instagram",2],[81,100,"Dammi il telefono",1]] : [[0,20,"Do whatever you want",-2],[21,40,"Healthy jealousy",0],[41,60,"Who is this?",1],[61,80,"I analyze Instagram stories",2],[81,100,"Give me your phone",1]]),
      { id:"red_flags", type:"multiChoice", question: it ? "Scegli i tuoi bug emotivi" : "Choose your emotional bugs", answers:redShort, shortAnswers:redShort, fullAnswers:redFull, mode: state.version === "short" ? "short" : null, minValue:-2, maxValue:4, shortMinValue:-2, shortMaxValue:4, fullMinValue:-16, fullMaxValue:28, shortTitle:it?"Versione corta":"Short version", shortText:it?"8 opzioni selezionate. Più veloce e pulita.":"8 selected options. Faster and cleaner.", fullTitle:it?"Versione completa":"Full version", fullText:it?"Tutti i bug emotivi. Modalità caos totale.":"All emotional bugs. Full chaos mode." },
      choice("assenza", it ? "Se non rispondo per qualche ora, cosa fai?" : "If I do not reply for a few hours, what do you do?", it ? [["Ti cerco per sapere se sei vivo",2],["Ti mando un meme per attirare la tua attenzione",2],["Ti scrivo 'tutto bene?'",1],["Aspetto senza dire nulla",0],["Sparisco anche io per principio",-2]] : [["I check on you because I want to know if you are alive",2],["I send you a meme to get your attention",2],["I text you 'everything okay?'",1],["I wait without saying anything",0],["I disappear too out of principle",-2]]),
      choice("buonanotte", it ? "Se ti scrivo 'Buonanotte', come rispondi?" : "If I texted you 'Goodnight', how would you reply?", it ? [["Buonanotte ❤️",2],["Notteee",1],["Meme disturbante prima di dormire",2],["Visualizzato",-2],["notte",-1]] : [["Goodnight ❤️",2],["Nighttt",1],["Disturbing meme before sleeping",2],["Left on read",-2],["night",-1]]),
      choice("litigio", it ? "Se litighiamo per una cosa stupida" : "If we argue over something stupid", it ? [["Ne parliamo e poi facciamo pace",2],["Prima mi offendo, poi torno",1],["Ti mando un meme per rompere il ghiaccio",2],["Silenzio radio",-2],["Fingo che non sia successo nulla per 3 giorni",-1]] : [["We talk about it and then make peace",2],["First I get offended, then I come back",1],["I send you a meme to break the ice",2],["Radio silence",-2],["I pretend nothing happened for 3 days",-1]]),
      multi("communication_style", it ? "Come comunichi quando qualcosa conta davvero?" : "How do you communicate when something matters?", -6, 10, it ? [["So dire cosa provo senza trasformarlo in un processo",2],["Ho bisogno di tempo, ma poi mi spiego",2],["Preferisco scrivere perché mi esprimo meglio così",1],["Preferisco parlare direttamente, anche se è scomodo",2],["Dico quando qualcosa mi ferisce invece di fingere che vada bene",2],["So chiedere scusa senza aggiungere un 'però'",2],["Chiedo chiarimenti invece di pensare subito al peggio",2],["Prima mi chiudo, ma poi torno quando sono più calma",1],["Scherzo sui problemi prima di parlarne seriamente",0],["Ho bisogno di rassicurazioni prima di spiegare cosa non va",0],["Dico 'niente' e mi aspetto che tu capisca tutto",-2],["Evito le conversazioni serie finché non esplodono",-2],["Sparisco quando non so spiegarmi",-2],["Chiedo scusa, ma solo dopo averla resa drammatica",-1],["Preferisco essere arrabbiata piuttosto che vulnerabile",-2]] : [["I can say what I feel without turning it into a trial",2],["I need some time, but then I explain myself",2],["I prefer writing because I express myself better that way",1],["I prefer talking directly, even if it is uncomfortable",2],["I say when something hurts me instead of pretending it is fine",2],["I can apologize without adding a 'but'",2],["I ask for clarification instead of assuming the worst",2],["I get quiet first, but I come back when I am calmer",1],["I joke about problems before talking seriously",0],["I need reassurance before I can explain what is wrong",0],["I say 'nothing' and expect you to understand everything",-2],["I avoid serious conversations until they explode",-2],["I disappear when I do not know how to explain myself",-2],["I apologize, but only after making it dramatic",-1],["I would rather be mad than vulnerable",-2]]),
      multi("personal_values", it ? "Quali valori contano davvero per te?" : "Which values actually matter to you?", -6, 10, it ? [["La fedeltà non è negoziabile",2],["Se scelgo qualcuno, rispetto quella scelta",2],["Non do corda a persone che vogliono chiaramente più di un'amicizia",2],["La famiglia conta per me, ma ho comunque i miei confini",2],["Mi interessa costruire qualcosa di stabile, non solo provare qualcosa di intenso",2],["Preferisco l'onestà anche quando è scomoda",2],["Riesco a essere vulnerabile con qualcuno di cui mi fido",2],["La famiglia è importante, ma complicata",1],["Ho bisogno di tempo prima di fidarmi davvero",1],["Sono fedele, ma ho bisogno anche della mia indipendenza",1],["Faccio fatica con la vulnerabilità, ma ci provo",1],["Evito la vulnerabilità perché mi fa sentire debole",-2],["Tengo opzioni di riserva perché non si sa mai",-3],["Penso che la gelosia sia una prova d'amore",-1],["Nascondo le cose per evitare discussioni",-2],["Voglio fedeltà, ma non mi piace essere messa in discussione",-1]] : [["Loyalty is non-negotiable",2],["If I choose someone, I respect that choice",2],["I do not entertain people who clearly want more than friendship",2],["Family matters to me, but I still have my own boundaries",2],["I care about building something stable, not just feeling something intense",2],["I prefer honesty even when it is uncomfortable",2],["I can be vulnerable with someone I trust",2],["Family is important, but complicated",1],["I need time before I fully trust someone",1],["I am loyal, but I also need independence",1],["I struggle with vulnerability, but I try",1],["I avoid vulnerability because it makes me feel weak",-2],["I keep backup options because you never know",-3],["I think jealousy is proof of love",-1],["I hide things to avoid arguments",-2],["I want loyalty, but I do not like being questioned",-1]]),
      slider("abbracci", it ? "Quanto ti piacciono gli abbracci?" : "How much do you like hugs?", 65, it ? [[0,20,"Non toccarmi",-2],[21,40,"A volte",0],[41,60,"Mi piacciono",1],[61,80,"Tanto",2],[81,100,"Modalità koala permanente",2]] : [[0,20,"Do not touch me",-2],[21,40,"Sometimes",0],[41,60,"I like them",1],[61,80,"A lot",2],[81,100,"Permanent koala mode",2]]),
      slider("foto_insieme", it ? "Quanto sei disposta a fare foto insieme?" : "How willing are you to take photos together?", 55, it ? [[0,20,"Niente foto",-2],[21,40,"Solo se vengo bene",0],[41,60,"A volte",1],[61,80,"Foto carine insieme",2],[81,100,"Photoshoot di coppia",1]] : [[0,20,"No photos",-2],[21,40,"Only if I look good",0],[41,60,"Sometimes",1],[61,80,"Cute photos together",2],[81,100,"Couple photoshoot",1]]),
      choice("cosa_cerchi", it ? "Cosa stai cercando davvero?" : "What are you actually looking for?", it ? [["Qualcuno con cui ridere e stare bene",2],["Una relazione dolce ma anche stupida",2],["Qualcuno presente",1],["Non lo so, vediamo",0],["Sto solo passando il tempo",-2]] : [["Someone to laugh and feel good with",2],["A sweet but also stupid relationship",2],["Someone present",1],["I do not know, let us see",0],["Just passing time",-2]]),
      choice("reel", it ? "Se ti mando 12 reel in 5 minuti?" : "If I send you 12 reels in 5 minutes?", it ? [["Li guardo tutti e commento",2],["Ne guardo alcuni e fingo di aver capito",1],["Rispondo solo 'haha'",0],["Ti silenzio",-1],["Ti blocco e cambio identità",-2]] : [["I watch them all and comment",2],["I watch a few and pretend I understood",1],["I only reply 'haha'",0],["I mute you",-1],["I block you and change identity",-2]]),
      slider("gossip", it ? "Quanto sei pronta a fare gossip inutile ma essenziale?" : "How ready are you to do useless but essential gossip?", 80, it ? [[0,20,"Non mi interessano le vite degli altri",-2],[21,40,"Ascolto, ma non partecipo",-1],[41,60,"Ogni tanto va bene",0],[61,80,"Analisi completa di ogni dettaglio",1],[81,100,"Creo teorie, timeline e prove fotografiche",2]] : [[0,20,"I do not care about other people's lives",-2],[21,40,"I listen, but I do not participate",-1],[41,60,"Sometimes it is fine",0],[61,80,"Full analysis of every detail",1],[81,100,"I create theories, timelines and photo evidence",2]]),
      slider("nerd", it ? "Quanto sei nerd?" : "How nerdy are you?", 60, it ? [[0,20,"Tocco l'erba ogni giorno",-1],[21,40,"Nerd occasionale",0],[41,60,"So cos'è Discord",1],[61,80,"Ho almeno un trauma da gioco online",2],[81,100,"Il mio habitat naturale è davanti al PC",2]] : [[0,20,"I touch grass every day",-1],[21,40,"Occasional nerd",0],[41,60,"I know what Discord is",1],[61,80,"I have at least one online game trauma",2],[81,100,"My natural habitat is in front of the PC",2]]),
      slider("videogiochi", it ? "Quanto riesci a tollerare i videogiochi?" : "How much can you tolerate video games?", 60, it ? [[0,20,"Sono una perdita di tempo",-2],[21,40,"Guardo ma non capisco",-1],[41,60,"A volte va bene",0],[61,80,"Serata gaming approvata",1],[81,100,"Duo queue immediata",2]] : [[0,20,"They are a waste of time",-2],[21,40,"I watch but I do not understand",-1],[41,60,"Sometimes it is fine",0],[61,80,"Evening gaming approved",1],[81,100,"Duo queue immediately",2]]),
      choice("minecraft", it ? "Se dico 'Minecraft stasera'?" : "If I say 'Minecraft tonight'?", it ? [["Io costruisco casa, tu mini",2],["Entro ma mi perdo dopo 3 minuti",1],["Solo se dopo guardiamo un film",1],["Minecraft è da bambini",-2],["Faccio esplodere tutto con la TNT",0]] : [["I build the house, you mine",2],["I will join but get lost after 3 minutes",1],["Only if we watch a movie after",1],["Minecraft is for kids",-2],["I blow everything up with TNT",0]]),
      choice("discord", it ? "Qual è il tuo rapporto con Discord?" : "What is your relationship with Discord?", it ? [["Ci vivo",2],["Lo uso ogni tanto",1],["Lo conosco ma non lo uso",0],["Non so cosa sia",-1],["Lo associo solo ai gamer tossici",-2]] : [["I live there",2],["I use it sometimes",1],["I know it but do not use it",0],["I do not know what it is",-1],["I only associate it with toxic gamers",-2]]),
      choice("anime", it ? "Anime preferito?" : "Favorite anime?", it ? [["Frieren",2],["Sword Art Online",1],["Death Note",1],["Non so decidere",0],["Non guardo anime",-3]] : [["Frieren",2],["Sword Art Online",1],["Death Note",1],["I cannot decide",0],["I do not watch anime",-3]]),
      { id:"pizza", type:"imageChoice", question:it?"Scegli una pizza":"Choose a pizza", answers:(it ? [["Mozzarella di bufala e patatine",pizza("buffalo-mozzarella-fries"),3],["Wurstel e patatine",pizza("wurstel-fries"),2],["Margherita",pizza("margherita"),1],["Diavola",pizza("diavola"),0],["Capricciosa",pizza("capricciosa"),0],["Quattro formaggi",pizza("four-cheese"),0],["Con rucola",pizza("arugula"),-1,"cowSound"],["Ananas",pizza("pineapple"),-3,"pineappleEvent"],["Non mangio pizza",placeholder("No pizza","🚫"),-4]] : [["Buffalo mozzarella & fries",pizza("buffalo-mozzarella-fries"),3],["Wurstel & fries",pizza("wurstel-fries"),2],["Margherita",pizza("margherita"),1],["Diavola",pizza("diavola"),0],["Capricciosa",pizza("capricciosa"),0],["Four cheese",pizza("four-cheese"),0],["With arugula",pizza("arugula"),-1,"cowSound"],["Pineapple",pizza("pineapple"),-3,"pineappleEvent"],["I do not eat pizza",placeholder("No pizza","🚫"),-4]]).map(([label,image,value,action])=>({label,image,value,action})) },
      choice("drink", it ? "Scegli un drink" : "Choose a drink", it ? [["Aperol Spritz",2],["Coca-Cola",1],["Acqua naturale",0],["Monster alle 23",1],["Non bevo nulla",-1]] : [["Aperol Spritz",2],["Coca-Cola",1],["Still water",0],["Monster at 11 PM",1],["I do not drink anything",-1]]),
      choice("dolce", it ? "Scegli un dolce" : "Choose a dessert", it ? [["Tiramisù",2],["Cheesecake",1],["Gelato",1],["Frutta",-1],["Non mi piacciono i dolci",-2]] : [["Tiramisu",2],["Cheesecake",1],["Ice cream",1],["Fruit",-1],["I do not like desserts",-2]]),
      choice("film_brutto", it ? "Se ti chiedo di guardare un film brutto" : "If I ask you to watch a bad movie", it ? [["Lo guardo e lo insultiamo insieme",2],["Solo se c'è cibo",1],["Dipende dal film",0],["Mi addormento dopo 10 minuti",-1],["No, solo film seri",-2]] : [["I watch it and we roast it together",2],["Only if there is food",1],["Depends on the movie",0],["I fall asleep after 10 minutes",-1],["No, serious movies only",-2]]),
      choice("serata_ideale", it ? "Scegli una serata ideale" : "Choose an ideal evening", it ? [["Film, pizza e coccole",2],["Gaming insieme",2],["Pub tranquillo",1],["Serata caotica in discoteca",-1],["Ognuno a casa sua",-2]] : [["Movie, pizza and cuddles",2],["Gaming together",2],["Quiet pub",1],["Chaotic club night",-1],["Everyone at their own home",-2]])
    ];
  }

  function buildQuestions(lang, version) {
    const all = buildAllQuestions(lang);
    if (version !== "short") return all;
    return SHORT_IDS.map((id) => all.find((q) => q.id === id)).filter(Boolean);
  }

  function buildCategories(lang) {
    const it = lang === "it";
    return [
      { id:"appearance", label:it?"Aspetto":"Appearance", questionIds:["altezza","cuddle_build","cioccolato","colore_occhi","colore_capelli","style_aesthetic","makeup_style","segni_particolari"] },
      { id:"personality", label:it?"Personalità":"Personality", questionIds:["lgbtq_topics","appiccicosa","gelosia","red_flags","assenza","buonanotte","litigio"] },
      { id:"emotional_safety", label:it?"Comunicazione / Sicurezza emotiva":"Communication / Emotional safety", questionIds:["communication_style","personal_values"] },
      { id:"relationship", label:it?"Vibe relazione":"Relationship vibe", questionIds:["origine","dove_abiti_ora","abbracci","foto_insieme","cosa_cerchi","serata_ideale"] },
      { id:"nerd", label:it?"Compatibilità nerd":"Nerd compatibility", questionIds:["nerd","videogiochi","minecraft","discord","anime"] },
      { id:"lifestyle", label:it?"Lifestyle / Gusti":"Lifestyle / Taste", questionIds:["pizza","drink","dolce","film_brutto","gossip"] }
    ];
  }

  function chooseVersion(version) {
    state.version = version;
    state.index = 0;
    state.answers = {};
    state.restart = false;
    questions = buildQuestions(state.lang, state.version);
    categories = buildCategories(state.lang);
    updateStatic();
    renderQuestion();
  }

  function start(lang) {
    state.lang = lang;
    state.version = null;
    state.index = 0;
    state.answers = {};
    state.restart = false;
    document.documentElement.lang = lang;
    updateStatic();
    renderVersionChoice();
  }

  function updateStatic() {
    const t = ui();
    const kicker = document.querySelector(".quiz-header .quiz-kicker");
    const subtitle = document.querySelector(".quiz-subtitle");
    if (kicker) kicker.textContent = t.kicker;
    if (subtitle) subtitle.textContent = t.subtitle;
    dom.back.textContent = t.back;
    dom.next.textContent = t.next;
  }

  function rangeAnswer(q, raw) { return q.ranges.find((r) => raw >= r.min && raw <= r.max); }
  function selected(q) { const a = state.answers[q.id]; if (!a) return null; if (q.type === "slider") return rangeAnswer(q, a.rawValue); return a; }
  function qValue(q, a) { if (!a) return null; if (q.type === "multiChoice") return clamp((a.answerIndexes || []).reduce((s,i)=>s+(q.answers[i]?.value ?? 0),0), q.minValue ?? -2, q.maxValue ?? 2); if (q.type === "slider") return rangeAnswer(q, a.rawValue)?.value ?? null; return a.value; }
  function values(q) { return (q.type === "slider" ? q.ranges : q.answers || []).map((x)=>x.value).filter(Number.isFinite); }
  function qRange(q) { if (q.type === "multiChoice") { const v = values(q); return { min:q.minValue ?? v.filter(x=>x<0).reduce((s,x)=>s+x,0), max:q.maxValue ?? v.filter(x=>x>0).reduce((s,x)=>s+x,0) }; } const v = values(q); return { min:v.length?Math.min(...v):0, max:v.length?Math.max(...v):2 }; }
  function normalize(q, value) { if (value === null || value === undefined) return null; const r = qRange(q); return r.min === r.max ? 100 : clamp(Math.round(((value-r.min)/(r.max-r.min))*100),0,100); }
  function categoryBreakdown() { return categories.map(c => { const scores = c.questionIds.map(id => { const q = questions.find(x=>x.id===id); if (!q || q.blocking) return null; return normalize(q, qValue(q, state.answers[q.id])); }).filter(x=>x!==null&&x!==undefined); return { ...c, answered:scores.length, percentage:scores.length ? Math.round(scores.reduce((s,x)=>s+x,0)/scores.length) : null }; }).filter(c=>c.answered>0); }
  function result() { const scores = questions.map(q => q.blocking ? null : normalize(q, qValue(q, state.answers[q.id]))).filter(x=>x!==null&&x!==undefined); const p = scores.length ? Math.round(scores.reduce((s,x)=>s+x,0)/scores.length) : 0; return { percentage:p, route:route(p), categories:categoryBreakdown() }; }
  function route(p) { const it = state.lang === "it"; if (p === 100) return { name:"Wedding Route", text:it?"Compatibilità 100%. Il sistema sta già cercando anelli, icone Discord coordinate e una casa sospettosamente cute su Minecraft.":"100% compatibility. The system is already looking for rings, matching Discord icons and a suspiciously cute Minecraft house.", cls:"wedding-route" }; if (p<=25) return { name:"Emotional Damage Route", text:it?"Il sistema consiglia amicizia su Discord e distanza emotiva di sicurezza.":"The system recommends Discord friendship and emotional safety distance." }; if (p<=50) return { name:"Discord Friend Route", text:it?"Qualcosa c'è, ma servono almeno tre meme, una pizza e verifica manuale.":"There is something here, but we need at least three memes, one pizza, and manual verification." }; if (p<=70) return { name:"Soft Match Route", text:it?"La situazione sembra promettente. Il sistema approva una conversazione più lunga del previsto.":"The situation looks promising. The system approves a conversation longer than expected." }; if (p<=90) return { name:"Possible Egirl Route", text:it?"Buona compatibilità. Procedere con spritz, gossip e sessione Minecraft.":"Good compatibility. Proceed with spritz, gossip, and a Minecraft session." }; return { name:"Legendary Egirl Route", text:it?"Il sistema ha rilevato una candidata final boss. Verifica umana immediata richiesta.":"The system has detected a final-boss candidate. Immediate human verification required." }; }

  function renderLanguage() {
    const old = state.lang;
    state.lang = "it";
    const t = ui();
    state.lang = old;
    dom.bar.style.width="0%";
    dom.back.disabled=true;
    dom.next.disabled=true;
    dom.back.textContent="Indietro";
    dom.next.textContent="Avanti";
    dom.q.innerHTML = `<div class="language-choice-box"><p class="quiz-kicker">Language / Lingua</p><h2>${t.langTitle}</h2><p>${t.langText}</p><div class="language-choice-grid"><button type="button" data-lang="it">Italiano</button><button type="button" data-lang="en">English</button></div></div>`;
    dom.q.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>start(b.dataset.lang)));
  }

  function renderVersionChoice() {
    const t = ui();
    dom.bar.style.width = "0%";
    dom.back.disabled = false;
    dom.next.disabled = true;
    dom.back.textContent = t.back;
    dom.next.textContent = t.next;
    dom.q.innerHTML = `<div class="language-choice-box"><p class="quiz-kicker">Quiz version</p><h2>${t.versionTitle}</h2><p>${t.versionText}</p><div class="language-choice-grid"><button type="button" data-version="short"><strong>${t.shortTitle}</strong><span>${t.shortText}</span></button><button type="button" data-version="full"><strong>${t.fullTitle}</strong><span>${t.fullText}</span></button></div></div>`;
    dom.q.querySelectorAll("[data-version]").forEach(b=>b.addEventListener("click",()=>chooseVersion(b.dataset.version)));
  }

  function progress() { dom.bar.style.width = `${questions.length ? ((state.index+1)/questions.length)*100 : 0}%`; }
  function currentQuestionNumber() { return `${state.index+1} / ${questions.length}${state.version === "short" ? " · Short" : " · Full"}`; }

  function renderQuestion() {
    const q = questions[state.index];
    const a = state.answers[q.id];
    const t = ui();
    state.restart=false;
    progress();
    dom.back.disabled = state.index === 0;
    dom.next.textContent = state.index === questions.length - 1 ? t.result : t.next;
    dom.next.disabled = !a && q.type !== "slider";
    const n = currentQuestionNumber();
    if (q.type === "choice") renderChoice(q,a,n);
    if (q.type === "imageChoice") renderImage(q,a,n);
    if (q.type === "multiChoice") renderMulti(q,a,n);
    if (q.type === "slider") renderSlider(q,a,n);
  }

  function renderChoice(q,a,n) {
    dom.q.innerHTML = `<p class="question-number">${ui().q} ${n}</p><h2 class="question-title">${q.question}</h2><div class="answers-grid"></div>`;
    const grid = dom.q.querySelector(".answers-grid");
    q.answers.forEach((ans,i)=>{ const b=document.createElement("button"); b.type="button"; b.className=`answer-btn${a?.answerIndex===i?" selected":""}`; b.textContent=ans.label; b.onclick=()=>selectAnswer(q,i); grid.appendChild(b); });
  }

  function renderImage(q,a,n) {
    dom.q.innerHTML = `<p class="question-number">${ui().q} ${n}</p><h2 class="question-title">${q.question}</h2><div class="image-choice-grid"></div>`;
    const grid = dom.q.querySelector(".image-choice-grid");
    q.answers.forEach((ans,i)=>{ const b=document.createElement("button"); b.type="button"; b.className=`image-choice-card${a?.answerIndex===i?" selected":""}`; b.innerHTML=`<img src="${ans.image}" alt=""><span>${ans.label}</span>`; b.onclick=()=>selectAnswer(q,i); grid.appendChild(b); });
  }

  function renderMulti(q,a,n) {
    const t = ui();
    if (!q.mode && q.shortAnswers && q.fullAnswers) {
      dom.next.disabled = true;
      dom.q.innerHTML = `<p class="question-number">${t.q} ${n}</p><h2 class="question-title">${q.question}</h2><div class="language-choice-grid"><button type="button" data-mode="short"><strong>${q.shortTitle}</strong><span>${q.shortText}</span></button><button type="button" data-mode="full"><strong>${q.fullTitle}</strong><span>${q.fullText}</span></button></div>`;
      dom.q.querySelectorAll("[data-mode]").forEach((b)=>b.onclick=()=>{ q.mode=b.dataset.mode; q.answers = q.mode === "full" ? q.fullAnswers : q.shortAnswers; q.minValue = q.mode === "full" ? q.fullMinValue : q.shortMinValue; q.maxValue = q.mode === "full" ? q.fullMaxValue : q.shortMaxValue; renderQuestion(); });
      return;
    }
    if (q.mode) {
      q.answers = q.mode === "full" ? q.fullAnswers : q.shortAnswers;
      q.minValue = q.mode === "full" ? q.fullMinValue : q.shortMinValue;
      q.maxValue = q.mode === "full" ? q.fullMaxValue : q.shortMaxValue;
    }
    const selectedIndexes = new Set(a?.answerIndexes || []);
    dom.q.innerHTML = `<p class="question-number">${t.q} ${n}</p><h2 class="question-title">${q.question}</h2><p class="question-hint">${t.multi}</p><div class="answers-grid multi-choice-grid"></div>`;
    const grid = dom.q.querySelector(".answers-grid");
    q.answers.forEach((ans,i)=>{ const b=document.createElement("button"); b.type="button"; b.className=`answer-btn${selectedIndexes.has(i)?" selected":""}`; b.textContent=ans.label; b.onclick=()=>toggleMulti(q,i); grid.appendChild(b); });
    dom.next.disabled = selectedIndexes.size === 0;
  }

  function renderSlider(q,a,n) {
    const t = ui();
    const raw = a?.rawValue ?? q.defaultValue ?? 50;
    const r = rangeAnswer(q, raw);
    state.answers[q.id] = { rawValue: Number(raw), value: r?.value ?? 0 };
    dom.next.disabled = false;
    dom.q.innerHTML = `<p class="question-number">${t.q} ${n}</p><h2 class="question-title">${q.question}</h2><div class="slider-box"><input type="range" min="${q.min}" max="${q.max}" value="${raw}"><div class="slider-value"><span>${t.value}: <strong data-raw>${raw}</strong></span><span class="slider-label">${r?.label ?? ""}</span></div></div>`;
    const input = dom.q.querySelector("input");
    input.oninput = () => { const rawValue = Number(input.value); const rr = rangeAnswer(q, rawValue); state.answers[q.id] = { rawValue, value: rr?.value ?? 0 }; dom.q.querySelector("[data-raw]").textContent = rawValue; dom.q.querySelector(".slider-label").textContent = rr?.label ?? ""; };
  }

  function selectAnswer(q,i) {
    const ans = q.answers[i];
    if (ans.action === "block") return blocked(ui().accessDenied, ui().accessText);
    if (ans.action === "preferenceBlock") return blocked(ui().unavailable, ui().unavailableText);
    if (ans.action === "police") return police();
    if (ans.action === "starterPopup") alert(ui().starter);
    if (ans.action === "kawaiiSound") play(audio.kawaii);
    if (ans.action === "susSound") play(audio.sus);
    if (ans.action === "cowSound") play(dom.cow);
    if (ans.action === "pineappleEvent") pineapple();
    state.answers[q.id] = { answerIndex:i, value:ans.value ?? 0 };
    renderQuestion();
  }

  function toggleMulti(q,i) {
    const current = new Set(state.answers[q.id]?.answerIndexes || []);
    current.has(i) ? current.delete(i) : current.add(i);
    state.answers[q.id] = { answerIndexes:[...current] };
    renderQuestion();
  }

  function blocked(title,text) {
    dom.bar.style.width="100%";
    dom.next.disabled=false;
    dom.back.disabled=false;
    dom.next.textContent=ui().restart;
    state.restart=true;
    dom.q.innerHTML = `<div class="blocked-card"><h2>${title}</h2><p>${text}</p></div>`;
  }

  function police() {
    play(dom.police);
    dom.bar.style.width="100%";
    dom.next.disabled=false;
    dom.back.disabled=false;
    dom.next.textContent=ui().restart;
    state.restart=true;
    dom.q.innerHTML = `<div class="blocked-card police-card"><img src="/img/incarcerato.png" alt="" onerror="this.style.display='none'"><h2>🚨 ERRORE 113</h2><p>MINORENNE RILEVATO. Riprova quando avrai 18 anni ;)</p></div>`;
  }

  function pineapple() {
    play(audio.bells);
    alert(state.lang === "it" ? "Versetto 404: e l'ananas fu giudicato." : "Verse 404: and the pineapple was judged.");
  }

  function showResult() {
    const t = ui();
    const r = result();
    const cats = r.categories.map(c=>`<div class="category-score"><div><strong>${c.label}</strong><span>${c.percentage}%</span></div><div class="progress-wrap"><div class="progress-bar" style="width:${c.percentage}%"></div></div></div>`).join("");
    const sorted = [...r.categories].sort((a,b)=>b.percentage-a.percentage);
    dom.bar.style.width="100%";
    dom.back.disabled=false;
    dom.next.disabled=false;
    dom.next.textContent=t.restart;
    state.restart=true;
    dom.q.innerHTML = `<div class="result-box ${r.route.cls || ""}"><p class="quiz-kicker">${t.final}</p><div class="result-score">${r.percentage}%</div><h2>${r.route.name}</h2><p>${r.route.text}</p><div class="result-breakdown"><h3>${t.breakdown}</h3>${cats}<p class="result-summary"><strong>${t.strongest}:</strong> ${sorted[0]?.label ?? "-"} · <strong>${t.weakest}:</strong> ${sorted[sorted.length-1]?.label ?? "-"}</p></div></div>`;
  }

  function next() {
    if (!state.lang) return;
    if (!state.version) return;
    if (state.restart) return renderLanguage();
    if (state.index >= questions.length - 1) return showResult();
    state.index += 1;
    renderQuestion();
  }

  function back() {
    if (!state.lang) return;
    if (!state.version) return renderLanguage();
    if (state.restart) { state.restart=false; return renderQuestion(); }
    if (state.index > 0) { state.index -= 1; renderQuestion(); }
    else renderVersionChoice();
  }

  dom.next.addEventListener("click", next);
  dom.back.addEventListener("click", back);
  renderLanguage();
})();
