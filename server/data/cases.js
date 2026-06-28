// Round 3: Case File Challenge.
// Each case presents a set of clues (quotes, dates, inventions, events) that
// the participant drags onto the correct personality. Some clues are
// red herrings — they sound plausible but belong to nobody on the board,
// or belong to a personality not in this particular case set.

const cases = [
  {
    id: "C01",
    title: "The Apollo Files",
    personalityCodes: ["P03", "P04"],
    clues: [
      { id: "c01-1", text: "Hand-verified the trajectory for John Glenn's orbital flight, 1962", correctCode: "P03" },
      { id: "c01-2", text: "Coined the term 'software engineering' to describe her own work", correctCode: "P04" },
      { id: "c01-3", text: "Led the priority-display fix that saved Apollo 11's landing", correctCode: "P04" },
      { id: "c01-4", text: "Performed trajectory analysis using a desktop mechanical calculator", correctCode: "P03" },
      { id: "c01-5", text: "Invented the Spanning Tree Protocol", correctCode: null, isRedHerring: true },
      { id: "c01-6", text: "Modeled Earth's shape for GPS positioning", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C02",
    title: "The Codebreakers' Ledger",
    personalityCodes: ["P16", "P17"],
    clues: [
      { id: "c02-1", text: "Broke the Japanese 'Red Book' naval code for the US Navy", correctCode: "P16" },
      { id: "c02-2", text: "Introduced her future husband to the field of cryptology", correctCode: "P17" },
      { id: "c02-3", text: "Described by a Navy admiral as without peer among cryptologists", correctCode: "P16" },
      { id: "c02-4", text: "Cracked smuggling codes during Prohibition before wartime intelligence work", correctCode: "P17" },
      { id: "c02-5", text: "Co-invented zero-knowledge proofs for modern cryptography", correctCode: null, isRedHerring: true },
      { id: "c02-6", text: "Wrote the first assembly language", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C03",
    title: "Before the Personal Computer",
    personalityCodes: ["P09", "P13"],
    clues: [
      { id: "c03-1", text: "Wrote the operating system for the LINC, used at home", correctCode: "P13" },
      { id: "c03-2", text: "Helped arrange a visit to Xerox PARC that shaped the Macintosh interface", correctCode: "P09" },
      { id: "c03-3", text: "Trained originally as a lawyer before moving into computing", correctCode: "P13" },
      { id: "c03-4", text: "Co-developed the Smalltalk-80 programming environment", correctCode: "P09" },
      { id: "c03-5", text: "Built a directory naming system for ARPANET", correctCode: null, isRedHerring: true },
      { id: "c03-6", text: "Pioneered VLSI chip design methods", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C04",
    title: "Guardians of Trust",
    personalityCodes: ["P10", "P19"],
    clues: [
      { id: "c04-1", text: "Co-developed probabilistic encryption, a gold standard for data security", correctCode: "P10" },
      { id: "c04-2", text: "Founded an organization pushing for algorithmic accountability", correctCode: "P19" },
      { id: "c04-3", text: "Won the Turing Award twice for cryptography research", correctCode: "P10" },
      { id: "c04-4", text: "Published a study exposing accuracy gaps in facial recognition by race and gender", correctCode: "P19" },
      { id: "c04-5", text: "Created the ImageNet dataset", correctCode: null, isRedHerring: true },
      { id: "c04-6", text: "Built statistical ranking methods used in search engines", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C05",
    title: "The Network Builders",
    personalityCodes: ["P06", "P11"],
    clues: [
      { id: "c05-1", text: "Invented the protocol that stops network traffic loops", correctCode: "P06" },
      { id: "c05-2", text: "Ran the naming registry for the internet's earliest precursor network", correctCode: "P11" },
      { id: "c05-3", text: "Holds more than 100 patents in networking technology", correctCode: "P06" },
      { id: "c05-4", text: "Is credited with coining the phrase 'dot com'", correctCode: "P11" },
      { id: "c05-5", text: "Modeled satellite geodesy data used in GPS", correctCode: null, isRedHerring: true },
      { id: "c05-6", text: "Wrote the first compiler for a programming language", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C06",
    title: "Outside the Institution",
    personalityCodes: ["P01", "P05"],
    clues: [
      { id: "c06-1", text: "Wrote the first algorithm intended for a mechanical computing engine", correctCode: "P01" },
      { id: "c06-2", text: "Filed a wartime patent for frequency-hopping signal technology", correctCode: "P05" },
      { id: "c06-3", text: "Predicted machines could one day compose music", correctCode: "P01" },
      { id: "c06-4", text: "Was a working Hollywood film actress at the time of her invention", correctCode: "P05" },
      { id: "c06-5", text: "Built a company staffed almost entirely by women working from home", correctCode: null, isRedHerring: true },
      { id: "c06-6", text: "Helped break the Enigma-era ciphers", correctCode: null, isRedHerring: true }
    ]
  }
];

module.exports = cases;
