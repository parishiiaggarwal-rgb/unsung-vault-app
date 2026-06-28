// 20 case files — researched, real women in technology.
// Each entry includes everything needed across all 4 rounds:
// - core identity (name, field, era, achievement, fact) for Round 1
// - mcq bank for Round 2
// - clue artifacts (quote/date/invention) for Round 3 evidence board matching
// - difficulty tier, used to balance auction round point values

const personalities = [
  {
    code: "P01",
    name: "Ada Lovelace",
    era: "1815 – 1852",
    field: "Mathematics & computing",
    achievement: "Wrote the first algorithm intended to be carried out by a machine, for Charles Babbage's Analytical Engine.",
    fact: "She predicted computers could one day compose music, decades before anyone built one that worked.",
    quote: "That brain of mine is something more than merely mortal, as time will show.",
    clueArtifact: { type: "invention", text: "The Analytical Engine program, 1843" },
    redactedInFile1: true,
    difficulty: "easy"
  },
  {
    code: "P02",
    name: "Grace Hopper",
    era: "1906 – 1992",
    field: "Compilers & programming languages",
    achievement: "Built one of the first compilers, which translated English-like instructions into machine code, paving the way for COBOL.",
    fact: "She popularized the term 'bug' after a moth was found stuck inside a relay of the Harvard Mark II.",
    quote: "It's easier to ask forgiveness than it is to get permission.",
    clueArtifact: { type: "invention", text: "The A-0 compiler, 1952" },
    redactedInFile1: false,
    difficulty: "easy"
  },
  {
    code: "P03",
    name: "Katherine Johnson",
    era: "1918 – 2020",
    field: "Orbital mechanics",
    achievement: "Hand-calculated the trajectory for America's first crewed orbital spaceflight, verifying the results of early electronic computers.",
    fact: "John Glenn personally asked that Johnson re-check the computer's math before he would fly.",
    quote: "Girls are capable of doing everything men are capable of doing.",
    clueArtifact: { type: "event", text: "Friendship 7 orbital flight, 1962" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P04",
    name: "Margaret Hamilton",
    era: "b. 1936",
    field: "Flight software",
    achievement: "Led the team that wrote the onboard flight software for the Apollo program, including the error-priority system that saved Apollo 11's landing.",
    fact: "She coined the term 'software engineering' to argue her work deserved the same respect as other engineering disciplines.",
    quote: "There was no second chance. We knew that.",
    clueArtifact: { type: "event", text: "Apollo 11 lunar landing computer alarm, 1969" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P05",
    name: "Hedy Lamarr",
    era: "1914 – 2000",
    field: "Wireless communication",
    achievement: "Co-invented a frequency-hopping signal system intended to guide torpedoes without being jammed, which became foundational to spread-spectrum wireless tech.",
    fact: "She was a working Hollywood film actress at the same time she filed the patent.",
    quote: "Films have a certain place in a certain time period. Technology is forever.",
    clueArtifact: { type: "invention", text: "Secret Communication System patent, 1942" },
    redactedInFile1: true,
    difficulty: "easy"
  },
  {
    code: "P06",
    name: "Radia Perlman",
    era: "b. 1951",
    field: "Network protocols",
    achievement: "Invented the Spanning Tree Protocol, which lets modern networks avoid traffic loops and is still part of how the internet routes data.",
    fact: "She holds more than 100 patents and is sometimes called 'the mother of the internet,' a title she actively dislikes.",
    quote: "Programming is a small part of computer science.",
    clueArtifact: { type: "invention", text: "Spanning Tree Protocol (STP), 1985" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P07",
    name: "Gladys West",
    era: "b. 1930",
    field: "Satellite geodesy",
    achievement: "Her modeling of Earth's precise shape became part of the mathematical foundation for GPS technology.",
    fact: "Her contribution to GPS was barely known publicly until decades after the work was done.",
    quote: "I was always trying to be the best that I could be.",
    clueArtifact: { type: "invention", text: "Geodetic Earth model used in GPS calculations" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P08",
    name: "Kathleen Booth",
    era: "1922 – 2022",
    field: "Programming languages",
    achievement: "Designed the first assembly language and wrote one of the earliest textbooks on programming.",
    fact: "She also helped build some of the first machines used for automated language translation research.",
    quote: "Contributed designs for some of the earliest stored-program computers in Britain.",
    clueArtifact: { type: "invention", text: "First assembly language, early 1950s" },
    redactedInFile1: false,
    difficulty: "hard"
  },
  {
    code: "P09",
    name: "Adele Goldberg",
    era: "b. 1945",
    field: "Programming languages & GUI",
    achievement: "Helped develop Smalltalk-80 and the overlapping-window graphical interface concepts that later influenced the Apple Macintosh desktop.",
    fact: "A visit she helped arrange at Xerox PARC directly shaped what became the modern desktop computer interface.",
    quote: "The best way to predict the future is to invent it.",
    clueArtifact: { type: "invention", text: "Smalltalk-80 programming environment" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P10",
    name: "Shafi Goldwasser",
    era: "b. 1958",
    field: "Cryptography",
    achievement: "Co-developed probabilistic encryption and zero-knowledge proofs, foundational concepts behind modern secure communication.",
    fact: "She is a two-time Turing Award winner, a prize often described as computing's Nobel.",
    quote: "Co-invented probabilistic encryption, the gold standard for data security.",
    clueArtifact: { type: "invention", text: "Probabilistic encryption, early 1980s" },
    redactedInFile1: false,
    difficulty: "hard"
  },
  {
    code: "P11",
    name: "Elizabeth 'Jake' Feinler",
    era: "b. 1931",
    field: "Internet infrastructure",
    achievement: "Built and ran the directory services for ARPANET, the precursor to the internet, including its naming registry.",
    fact: "She is credited with coining the now-universal phrase 'dot com.'",
    quote: "Ran ARPANET's resource directory through the network's earliest, most fragile years.",
    clueArtifact: { type: "invention", text: "ARPANET domain naming registry" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P12",
    name: "Karen Spärck Jones",
    era: "1935 – 2007",
    field: "Information retrieval",
    achievement: "Developed statistical methods for ranking documents by relevance, ideas that underpin how modern search engines decide what to show first.",
    fact: "An award honoring her name is now given annually for contributions to information retrieval and natural language processing.",
    quote: "Computing is too important to be left to men alone.",
    clueArtifact: { type: "invention", text: "Term-weighting methods for document retrieval" },
    redactedInFile1: false,
    difficulty: "hard"
  },
  {
    code: "P13",
    name: "Mary Allen Wilkes",
    era: "b. 1937",
    field: "Personal computing",
    achievement: "Wrote the operating system for the LINC computer and is recognized as the first person to use a computer in her own home.",
    fact: "She originally trained as a lawyer before being pulled into early computing work at MIT.",
    quote: "We had the quaint notion at the time that software should be completely, absolutely free of bugs.",
    clueArtifact: { type: "invention", text: "LAP6 operating system for the LINC, 1965" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P14",
    name: "Frances Allen",
    era: "1932 – 2020",
    field: "Compiler optimization",
    achievement: "Pioneered techniques for compiler optimization that made programs run dramatically faster on early supercomputers.",
    fact: "She became the first woman to be named an IBM Fellow and later the first woman to win the Turing Award.",
    quote: "Renowned for her work in compiler organization and optimization algorithms.",
    clueArtifact: { type: "invention", text: "Control flow analysis techniques for compilers" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P15",
    name: "Stephanie 'Steve' Shirley",
    era: "b. 1933",
    field: "Software industry & ethics",
    achievement: "Built a software company staffed almost entirely by women working from home, eventually valued in the billions.",
    fact: "Her company also wrote programming for the black box flight recorder used on the supersonic Concorde aircraft.",
    quote: "Celebrated for building a multi-billion-dollar tech company with an all-female, work-from-home staff.",
    clueArtifact: { type: "invention", text: "Concorde black-box flight recorder software" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P16",
    name: "Agnes Meyer Driscoll",
    era: "1889 – 1971",
    field: "Naval cryptology",
    achievement: "Broke multiple Japanese naval codes as a US Navy cryptologist, work that shaped American codebreaking for decades.",
    fact: "A Navy admiral once described her as without equal among American cryptologists of her time.",
    quote: "Held degrees in mathematics and physics, fluent in four foreign languages.",
    clueArtifact: { type: "event", text: "Breaking of the Japanese 'Red Book' naval code" },
    redactedInFile1: false,
    difficulty: "hard"
  },
  {
    code: "P17",
    name: "Elizebeth Smith Friedman",
    era: "1892 – 1980",
    field: "Cryptanalysis",
    achievement: "Pioneered modern cryptanalysis methods, breaking codes used by smugglers and later wartime intelligence operations.",
    fact: "She is the one who introduced her own future husband, also a famous cryptologist, to the field.",
    quote: "Introduced her husband to the field of cryptology, not the other way around.",
    clueArtifact: { type: "event", text: "Prohibition-era smuggling code decryptions, 1920s" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P18",
    name: "Lynn Conway",
    era: "1938 – 2024",
    field: "Microchip design",
    achievement: "Co-created methods for VLSI chip design that simplified how complex microchips are laid out, reshaping the semiconductor industry.",
    fact: "She was fired from an early employer after coming out as transgender, and had to fight for years to have her contributions recognized.",
    quote: "Helped revolutionize microchip design in the 1970s after years working at Xerox PARC.",
    clueArtifact: { type: "invention", text: "VLSI chip design methodology, 1970s" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P19",
    name: "Joy Buolamwini",
    era: "b. 1989",
    field: "AI ethics",
    achievement: "Exposed major accuracy gaps in facial recognition systems across race and gender, and founded an organization pushing for algorithmic accountability.",
    fact: "Her research directly influenced several large tech companies to pause or change their facial recognition products.",
    quote: "Founded the Algorithmic Justice League to make technology more equitable and accountable.",
    clueArtifact: { type: "event", text: "Gender Shades facial recognition bias study" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P20",
    name: "Fei-Fei Li",
    era: "b. 1976",
    field: "Computer vision & AI",
    achievement: "Created ImageNet, a massive labeled image dataset that became the launching point for the modern deep learning boom in computer vision.",
    fact: "Before ImageNet existed, most computer vision researchers thought a dataset of that scale wasn't even worth building.",
    quote: "Helped computers learn to 'see' and recognize objects at a scale no one had attempted before.",
    clueArtifact: { type: "invention", text: "ImageNet visual dataset, 2009" },
    redactedInFile1: false,
    difficulty: "easy"
  }
];

module.exports = personalities;
