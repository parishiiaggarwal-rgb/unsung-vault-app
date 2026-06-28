// Round 2: Mystery Market question bank.
// type "recall"    -> straight fact from a single dossier
// type "deduction"  -> requires connecting two dossiers (field/era/theme)
// Each question references personalityCode(s) so the engine can validate
// answers and so the admin panel can show which dossier(s) a question covers.

const questions = [
  {
    id: "Q01",
    type: "recall",
    personalityCodes: ["P01"],
    prompt: "Who wrote the first algorithm intended to be run by a machine?",
    options: ["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Hedy Lamarr"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q02",
    type: "recall",
    personalityCodes: ["P02"],
    prompt: "Which pioneer popularized the term 'bug' after finding a moth in a relay?",
    options: ["Margaret Hamilton", "Grace Hopper", "Radia Perlman", "Adele Goldberg"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q03",
    type: "recall",
    personalityCodes: ["P04"],
    prompt: "Who coined the term 'software engineering' while leading Apollo's flight software team?",
    options: ["Katherine Johnson", "Margaret Hamilton", "Frances Allen", "Lynn Conway"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q04",
    type: "recall",
    personalityCodes: ["P05"],
    prompt: "Which Hollywood actress co-invented frequency-hopping wireless technology?",
    options: ["Hedy Lamarr", "Fei-Fei Li", "Stephanie Shirley", "Karen Sp\u00e4rck Jones"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q05",
    type: "recall",
    personalityCodes: ["P06"],
    prompt: "The Spanning Tree Protocol, still used in networking today, was invented by:",
    options: ["Shafi Goldwasser", "Elizabeth Feinler", "Radia Perlman", "Gladys West"],
    answerIndex: 2,
    points: 10
  },
  {
    id: "Q06",
    type: "recall",
    personalityCodes: ["P07"],
    prompt: "Whose modeling of Earth's shape became foundational to GPS technology?",
    options: ["Gladys West", "Kathleen Booth", "Agnes Meyer Driscoll", "Mary Allen Wilkes"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q07",
    type: "recall",
    personalityCodes: ["P09"],
    prompt: "Who helped develop Smalltalk-80, later influencing the Macintosh desktop interface?",
    options: ["Adele Goldberg", "Frances Allen", "Joy Buolamwini", "Karen Sp\u00e4rck Jones"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q08",
    type: "recall",
    personalityCodes: ["P10"],
    prompt: "Which two-time Turing Award winner co-developed zero-knowledge proofs?",
    options: ["Lynn Conway", "Shafi Goldwasser", "Elizebeth Smith Friedman", "Mary Allen Wilkes"],
    answerIndex: 1,
    points: 15
  },
  {
    id: "Q09",
    type: "recall",
    personalityCodes: ["P11"],
    prompt: "Who is credited with coining the phrase 'dot com' while running ARPANET's directory?",
    options: ["Karen Sp\u00e4rck Jones", "Elizabeth 'Jake' Feinler", "Stephanie Shirley", "Fei-Fei Li"],
    answerIndex: 1,
    points: 15
  },
  {
    id: "Q10",
    type: "recall",
    personalityCodes: ["P14"],
    prompt: "Who became the first woman named an IBM Fellow, for her work in compiler optimization?",
    options: ["Frances Allen", "Adele Goldberg", "Kathleen Booth", "Agnes Meyer Driscoll"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q11",
    type: "recall",
    personalityCodes: ["P15"],
    prompt: "Whose software company, staffed almost entirely by women, wrote code for the Concorde's flight recorder?",
    options: ["Stephanie Shirley", "Elizebeth Smith Friedman", "Lynn Conway", "Joy Buolamwini"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q12",
    type: "recall",
    personalityCodes: ["P18"],
    prompt: "Who co-created the VLSI chip design methods that reshaped the semiconductor industry?",
    options: ["Lynn Conway", "Gladys West", "Mary Allen Wilkes", "Karen Sp\u00e4rck Jones"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q13",
    type: "recall",
    personalityCodes: ["P19"],
    prompt: "Who founded the Algorithmic Justice League after exposing bias in facial recognition?",
    options: ["Fei-Fei Li", "Joy Buolamwini", "Shafi Goldwasser", "Adele Goldberg"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q14",
    type: "recall",
    personalityCodes: ["P20"],
    prompt: "Who created ImageNet, the dataset that helped launch the deep learning boom?",
    options: ["Fei-Fei Li", "Frances Allen", "Katherine Johnson", "Elizabeth Feinler"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q15",
    type: "deduction",
    personalityCodes: ["P03", "P04"],
    prompt: "Both of these figures worked directly on NASA's crewed space programs in the 1960s. One verified launch trajectories by hand, the other led the team writing the lunar landing software. Who verified the trajectories?",
    options: ["Margaret Hamilton", "Katherine Johnson", "Gladys West", "Mary Allen Wilkes"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q16",
    type: "deduction",
    personalityCodes: ["P16", "P17"],
    prompt: "Two cryptologists on this board worked in the early-to-mid 20th century. One introduced her future husband to the field; the other broke a Japanese naval code as a US Navy cryptologist. Who broke the naval code?",
    options: ["Elizebeth Smith Friedman", "Agnes Meyer Driscoll", "Shafi Goldwasser", "Karen Sp\u00e4rck Jones"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q17",
    type: "deduction",
    personalityCodes: ["P09", "P13"],
    prompt: "One of these figures wrote an operating system for one of the earliest personal computers; the other's environment work later shaped the Macintosh interface. Who wrote the operating system for a personal computer?",
    options: ["Mary Allen Wilkes", "Adele Goldberg", "Frances Allen", "Lynn Conway"],
    answerIndex: 0,
    points: 20
  },
  {
    id: "Q18",
    type: "deduction",
    personalityCodes: ["P10", "P19"],
    prompt: "Both figures worked on the trustworthiness of computer systems, decades apart. One built the mathematical foundations of modern cryptography; the other exposed bias in facial recognition AI. Who is the more recent of the two?",
    options: ["Shafi Goldwasser", "Joy Buolamwini", "Frances Allen", "Adele Goldberg"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q19",
    type: "deduction",
    personalityCodes: ["P06", "P11"],
    prompt: "Both shaped how data travels across networks. One invented a protocol that prevents traffic loops; the other ran the naming directory for the early internet's precursor. Who built the naming directory?",
    options: ["Radia Perlman", "Elizabeth 'Jake' Feinler", "Karen Sp\u00e4rck Jones", "Gladys West"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q20",
    type: "deduction",
    personalityCodes: ["P01", "P05"],
    prompt: "Both were active outside traditional science institutions of their time, one a mathematician working from letters and salons, the other a film actress filing a wartime patent. Who is the actress?",
    options: ["Ada Lovelace", "Hedy Lamarr", "Stephanie Shirley", "Mary Allen Wilkes"],
    answerIndex: 1,
    points: 15
  }
];

module.exports = questions;
