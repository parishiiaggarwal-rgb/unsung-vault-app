// Round 2: Mystery Market question bank.
// type "recall"    -> straight fact from a single dossier
// type "deduction"  -> requires connecting two dossiers (field/era/theme)

const questions = [
  {
    id: "Q01",
    type: "recall",
    personalityCodes: ["P01"],
    prompt: "Who co-led the conversion of ENIAC into a stored-program computer?",
    options: ["Jean Jennings Bartik", "Marlyn Wescoff Meltzer", "Ida Rhodes", "Sister Mary Kenneth Keller"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q02",
    type: "recall",
    personalityCodes: ["P02"],
    prompt: "Who was the first woman in the US to earn a PhD in Computer Science?",
    options: ["Karen Sp\u00e4rck Jones", "Sister Mary Kenneth Keller", "Frances Allen", "Annie Easley"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q03",
    type: "recall",
    personalityCodes: ["P03"],
    prompt: "Who co-designed the C-10 programming language for UNIVAC I?",
    options: ["Ida Rhodes", "Ann Caracristi", "Elizabeth Feinler", "Gladys West"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q04",
    type: "recall",
    personalityCodes: ["P04"],
    prompt: "Who was the first woman to win the Turing Award, in 2006?",
    options: ["Shafi Goldwasser", "Frances Allen", "Radia Perlman", "Fei-Fei Li"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q05",
    type: "recall",
    personalityCodes: ["P05"],
    prompt: "Which ENIAC programmer learned the machine purely from circuit diagrams to calculate ballistics trajectories?",
    options: ["Jean Jennings Bartik", "Marlyn Wescoff Meltzer", "Ida Rhodes", "Annie Easley"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q06",
    type: "recall",
    personalityCodes: ["P06"],
    prompt: "The Spanning Tree Protocol, still used in networking today, was invented by:",
    options: ["Elizabeth Feinler", "Radia Perlman", "Karen Sp\u00e4rck Jones", "Gladys West"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q07",
    type: "recall",
    personalityCodes: ["P07"],
    prompt: "Whose team invented the top-level domain system (.com, .edu, .gov) while running ARPANET's directory?",
    options: ["Elizabeth Feinler", "Ann Caracristi", "Sister Mary Kenneth Keller", "Sarah Flannery"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q08",
    type: "recall",
    personalityCodes: ["P08"],
    prompt: "Who created ImageNet, the dataset that helped launch the deep learning boom?",
    options: ["Fei-Fei Li", "Joy Buolamwini", "Shafi Goldwasser", "Lynn Conway"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q09",
    type: "recall",
    personalityCodes: ["P09"],
    prompt: "Who invented Inverse Document Frequency weighting, foundational to how search engines rank results?",
    options: ["Karen Sp\u00e4rck Jones", "Ida Rhodes", "Frances Allen", "Hedy Lamarr"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q10",
    type: "recall",
    personalityCodes: ["P10"],
    prompt: "Who developed guidance software for the Centaur rocket's upper stage at NASA?",
    options: ["Annie Easley", "Margaret Hamilton", "Gladys West", "Ann Caracristi"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q11",
    type: "recall",
    personalityCodes: ["P11"],
    prompt: "Who rose to Deputy Director of the NSA after a wartime codebreaking career?",
    options: ["Ann Caracristi", "Sarah Flannery", "Joy Buolamwini", "Karen Sp\u00e4rck Jones"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q12",
    type: "recall",
    personalityCodes: ["P12"],
    prompt: "Who developed the Cayley-Purser encryption algorithm as a 16-year-old in Ireland?",
    options: ["Sarah Flannery", "Shafi Goldwasser", "Fei-Fei Li", "Elizabeth Feinler"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q13",
    type: "recall",
    personalityCodes: ["P13"],
    prompt: "Who wrote the first algorithm intended to be run by a machine?",
    options: ["Ada Lovelace", "Grace Hopper", "Hedy Lamarr", "Margaret Hamilton"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q14",
    type: "recall",
    personalityCodes: ["P14"],
    prompt: "Which pioneer popularized the term 'bug' after finding a moth in a relay?",
    options: ["Margaret Hamilton", "Grace Hopper", "Lynn Conway", "Gladys West"],
    answerIndex: 1,
    points: 10
  },
  {
    id: "Q15",
    type: "recall",
    personalityCodes: ["P15"],
    prompt: "Who coined the term 'software engineering' while leading Apollo's flight software team?",
    options: ["Margaret Hamilton", "Annie Easley", "Frances Allen", "Joy Buolamwini"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q16",
    type: "recall",
    personalityCodes: ["P16"],
    prompt: "Which Hollywood actress co-invented frequency-hopping wireless technology?",
    options: ["Hedy Lamarr", "Fei-Fei Li", "Sarah Flannery", "Karen Sp\u00e4rck Jones"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q17",
    type: "recall",
    personalityCodes: ["P17"],
    prompt: "Whose modeling of Earth's shape became foundational to GPS technology?",
    options: ["Gladys West", "Ida Rhodes", "Ann Caracristi", "Sister Mary Kenneth Keller"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q18",
    type: "recall",
    personalityCodes: ["P18"],
    prompt: "Which two-time Turing Award winner co-developed zero-knowledge proofs?",
    options: ["Lynn Conway", "Shafi Goldwasser", "Elizabeth Feinler", "Marlyn Wescoff Meltzer"],
    answerIndex: 1,
    points: 15
  },
  {
    id: "Q19",
    type: "recall",
    personalityCodes: ["P19"],
    prompt: "Who co-created the VLSI chip design methods that reshaped the semiconductor industry?",
    options: ["Lynn Conway", "Gladys West", "Karen Sp\u00e4rck Jones", "Annie Easley"],
    answerIndex: 0,
    points: 15
  },
  {
    id: "Q20",
    type: "recall",
    personalityCodes: ["P20"],
    prompt: "Who founded the Algorithmic Justice League after exposing bias in facial recognition?",
    options: ["Joy Buolamwini", "Fei-Fei Li", "Shafi Goldwasser", "Sarah Flannery"],
    answerIndex: 0,
    points: 10
  },
  {
    id: "Q21",
    type: "deduction",
    personalityCodes: ["P01", "P05"],
    prompt: "Both were among the six original ENIAC programmers during WWII, taught the machine with no manual. One co-led its conversion to a stored-program computer afterward. Who was that?",
    options: ["Jean Jennings Bartik", "Marlyn Wescoff Meltzer", "Ida Rhodes", "Annie Easley"],
    answerIndex: 0,
    points: 20
  },
  {
    id: "Q22",
    type: "deduction",
    personalityCodes: ["P10", "P15"],
    prompt: "Both worked directly on NASA missions. One wrote guidance code for the Centaur rocket; the other led the Apollo flight software team. Who worked on Centaur?",
    options: ["Margaret Hamilton", "Annie Easley", "Gladys West", "Ann Caracristi"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q23",
    type: "deduction",
    personalityCodes: ["P11", "P12"],
    prompt: "Both built careers in cryptography decades apart. One cracked Japanese codes in WWII and became NSA Deputy Director; the other built an encryption algorithm as a teenager in the 1990s. Who is the more recent of the two?",
    options: ["Ann Caracristi", "Sarah Flannery", "Karen Sp\u00e4rck Jones", "Elizabeth Feinler"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q24",
    type: "deduction",
    personalityCodes: ["P06", "P07"],
    prompt: "Both shaped how data travels across networks. One invented a protocol that prevents traffic loops; the other ran the directory for the internet's early precursor. Who built the directory?",
    options: ["Radia Perlman", "Elizabeth Feinler", "Karen Sp\u00e4rck Jones", "Gladys West"],
    answerIndex: 1,
    points: 20
  },
  {
    id: "Q25",
    type: "deduction",
    personalityCodes: ["P18", "P20"],
    prompt: "Both worked on the trustworthiness of computer systems, decades apart. One built the mathematical foundations of modern cryptography; the other exposed bias in facial recognition AI. Who is the more recent of the two?",
    options: ["Shafi Goldwasser", "Joy Buolamwini", "Frances Allen", "Ida Rhodes"],
    answerIndex: 1,
    points: 20
  }
];

module.exports = questions;