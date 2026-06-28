// Round 3: Case File Challenge.
// Each case presents clues the participant drags onto the correct
// personality. Red herrings sound plausible but belong to someone not
// in this particular case set, or to nobody.

const cases = [
  {
    id: "C01",
    title: "The ENIAC Six",
    personalityCodes: ["P01", "P05"],
    clues: [
      { id: "c01-1", text: "Co-led the conversion of ENIAC into a stored-program computer", correctCode: "P01" },
      { id: "c01-2", text: "Learned to program ENIAC purely from circuit diagrams, no manual", correctCode: "P05" },
      { id: "c01-3", text: "Rejected by IBM at 20, hired by the US Army instead", correctCode: "P01" },
      { id: "c01-4", text: "Calculated military ballistics trajectories during WWII", correctCode: "P05" },
      { id: "c01-5", text: "Co-designed the C-10 language for UNIVAC I", correctCode: null, isRedHerring: true },
      { id: "c01-6", text: "Cracked Japanese military codes in WWII", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C02",
    title: "Before the Internet Had a Name",
    personalityCodes: ["P06", "P07"],
    clues: [
      { id: "c02-1", text: "Invented the Spanning Tree Protocol, still used in networking today", correctCode: "P06" },
      { id: "c02-2", text: "Ran ARPANET's Network Information Center from the 1970s", correctCode: "P07" },
      { id: "c02-3", text: "Wrote a children's poem to explain a network algorithm", correctCode: "P06" },
      { id: "c02-4", text: "Her team invented top-level domains like .com and .edu", correctCode: "P07" },
      { id: "c02-5", text: "Invented Inverse Document Frequency weighting for search", correctCode: null, isRedHerring: true },
      { id: "c02-6", text: "Created the ImageNet visual dataset", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C03",
    title: "Codebreakers, Two Generations Apart",
    personalityCodes: ["P11", "P12"],
    clues: [
      { id: "c03-1", text: "Cracked Japanese military codes as an Army codebreaker in WWII", correctCode: "P11" },
      { id: "c03-2", text: "Developed the Cayley-Purser encryption algorithm at age 16", correctCode: "P12" },
      { id: "c03-3", text: "Rose to Deputy Director of the NSA", correctCode: "P11" },
      { id: "c03-4", text: "Won Ireland's Young Scientist of the Year in 1999", correctCode: "P12" },
      { id: "c03-5", text: "Co-developed zero-knowledge proofs for modern cryptography", correctCode: null, isRedHerring: true },
      { id: "c03-6", text: "Built a directory naming system for ARPANET", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C04",
    title: "Reaching for Space",
    personalityCodes: ["P10", "P15"],
    clues: [
      { id: "c04-1", text: "Wrote guidance code for the Centaur rocket's upper stage", correctCode: "P10" },
      { id: "c04-2", text: "Led the team that wrote Apollo's onboard flight software", correctCode: "P15" },
      { id: "c04-3", text: "One of only four Black employees at NASA when she joined in 1955", correctCode: "P10" },
      { id: "c04-4", text: "Coined the term 'software engineering'", correctCode: "P15" },
      { id: "c04-5", text: "Modeled satellite geodesy data used in GPS", correctCode: null, isRedHerring: true },
      { id: "c04-6", text: "Wrote the first compiler for a programming language", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C05",
    title: "Guardians of Trust",
    personalityCodes: ["P18", "P20"],
    clues: [
      { id: "c05-1", text: "Co-developed probabilistic encryption, a gold standard for data security", correctCode: "P18" },
      { id: "c05-2", text: "Founded an organization pushing for algorithmic accountability", correctCode: "P20" },
      { id: "c05-3", text: "Won the Turing Award twice for cryptography research", correctCode: "P18" },
      { id: "c05-4", text: "Published a study exposing bias in facial recognition by race and gender", correctCode: "P20" },
      { id: "c05-5", text: "Created the ImageNet dataset", correctCode: null, isRedHerring: true },
      { id: "c05-6", text: "First woman to win the Turing Award, in 2006", correctCode: null, isRedHerring: true }
    ]
  },
  {
    id: "C06",
    title: "Outside the Institution",
    personalityCodes: ["P13", "P16"],
    clues: [
      { id: "c06-1", text: "Wrote the first algorithm intended for a mechanical computing engine", correctCode: "P13" },
      { id: "c06-2", text: "Filed a wartime patent for frequency-hopping signal technology", correctCode: "P16" },
      { id: "c06-3", text: "Predicted machines could one day compose music", correctCode: "P13" },
      { id: "c06-4", text: "Was a working Hollywood film actress at the time of her invention", correctCode: "P16" },
      { id: "c06-5", text: "First woman in the US to earn a PhD in Computer Science", correctCode: null, isRedHerring: true },
      { id: "c06-6", text: "Helped revolutionize microchip design in the 1970s", correctCode: null, isRedHerring: true }
    ]
  }
];

module.exports = cases;