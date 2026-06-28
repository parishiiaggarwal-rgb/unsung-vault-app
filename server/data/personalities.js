// 20 case files for Round 1 — merged from two research passes:
// 12 from the curated WIE Day "Unsung" profile sheet, plus 8 carrying
// forward from the original research pass (no overlap in subject matter).
//
// Each entry includes everything needed across all 4 rounds:
// - core identity (name, field, era, achievement, fact) for Round 1
// - mcq bank for Round 2 (built separately in questions.js)
// - clue artifacts (quote/date/invention) for Round 3 evidence board matching
// - difficulty tier, used to balance auction round point values

const personalities = [
  {
    code: "P01",
    name: "Jean Jennings Bartik",
    era: "1924 – 2011",
    field: "Computer programming",
    achievement: "One of the six original programmers of ENIAC, the world's first general-purpose electronic computer. She co-led the conversion of ENIAC into a stored-program computer and wrote the first sort/merge program for UNIVAC I.",
    fact: "Rejected by IBM at age 20, she was hired by the US Army instead. Her contribution was forgotten for 40 years until a Harvard student found her name in old Army records in 1986.",
    quote: "Co-led the conversion of ENIAC into a stored-program computer.",
    clueArtifact: { type: "invention", text: "ENIAC stored-program conversion, late 1940s" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P02",
    name: "Sister Mary Kenneth Keller",
    era: "1913 – 1985",
    field: "Computer science & education",
    achievement: "First woman in the US to earn a PhD in Computer Science, from the University of Wisconsin in 1965. Helped develop the BASIC programming language and founded the computer science department at Clarke College.",
    fact: "A Catholic nun who broke the 'men only' rule at Dartmouth's computing center to access their mainframe, and no one could say no to a Sister on a mission.",
    quote: "Helped develop BASIC and founded a computer science department.",
    clueArtifact: { type: "event", text: "First US PhD in Computer Science, 1965" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P03",
    name: "Ida Rhodes",
    era: "1900 – 1986",
    field: "Mathematical computing",
    achievement: "Pioneered the design of programming languages in the 1950s, co-designed the C-10 language for UNIVAC I, and was a key figure at the National Bureau of Standards in establishing early computing practices.",
    fact: "She was one of the first people to propose using computers to assist people with disabilities, decades before assistive technology became a recognized field.",
    quote: "Co-designed the C-10 programming language for UNIVAC I.",
    clueArtifact: { type: "invention", text: "C-10 programming language, 1950s" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P04",
    name: "Frances Allen",
    era: "1932 – 2020",
    field: "Compiler optimization",
    achievement: "First woman to win the Turing Award, in 2006, for pioneering compiler optimization theory that transformed how software runs on hardware. Also IBM's first female Fellow.",
    fact: "She joined IBM in 1957 planning to stay just two years to pay off student loans. She stayed 45 years and changed the face of computing.",
    quote: "Became the first woman to win the Turing Award, in 2006.",
    clueArtifact: { type: "invention", text: "Control flow analysis techniques for compilers" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P05",
    name: "Marlyn Wescoff Meltzer",
    era: "1922 – 2008",
    field: "Computer programming",
    achievement: "One of the original six ENIAC programmers during World War II. Her team taught themselves to program the machine purely from circuit diagrams, with no manual or prior training, to calculate military ballistics trajectories.",
    fact: "Her contribution was erased from history for over 40 years. In early press photos, the ENIAC women were labeled 'operators,' as if they only flipped switches.",
    quote: "Learned to program ENIAC directly from circuit diagrams.",
    clueArtifact: { type: "event", text: "ENIAC ballistics trajectory calculations, WWII" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P06",
    name: "Radia Perlman",
    era: "b. 1951",
    field: "Network engineering",
    achievement: "Invented the Spanning Tree Protocol in 1985, which makes Ethernet networks self-healing and loop-free. Often called the 'Mother of the Internet,' her invention is the invisible backbone of virtually every network on Earth.",
    fact: "She wrote a children's poem to explain her Spanning Tree algorithm, and later included it in her PhD thesis.",
    quote: "Invented the Spanning Tree Protocol, the backbone of modern networking.",
    clueArtifact: { type: "invention", text: "Spanning Tree Protocol (STP), 1985" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P07",
    name: "Elizabeth Feinler",
    era: "b. 1931",
    field: "Internet infrastructure",
    achievement: "Ran ARPANET's Network Information Center from the 1970s to 1989, managing the first internet directory. Her team invented the concept of top-level domains: .com, .edu, .gov, .mil, and .org.",
    fact: "Before DNS existed, if you needed to find any computer on the internet, you literally called her office in California during business hours.",
    quote: "Her team invented the top-level domain system still used today.",
    clueArtifact: { type: "invention", text: "ARPANET top-level domain system" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P08",
    name: "Fei-Fei Li",
    era: "b. 1976",
    field: "Artificial intelligence",
    achievement: "Created ImageNet in 2009, a dataset of 14 million labeled images that directly sparked the deep learning revolution in computer vision.",
    fact: "Colleagues called ImageNet 'crazy.' She spent three years and $50,000 crowdsourced via Amazon Mechanical Turk labeling millions of images.",
    quote: "Helped computers learn to 'see' at a scale no one had attempted before.",
    clueArtifact: { type: "invention", text: "ImageNet visual dataset, 2009" },
    redactedInFile1: false,
    difficulty: "easy"
  },
  {
    code: "P09",
    name: "Karen Spärck Jones",
    era: "1935 – 2007",
    field: "Information retrieval & NLP",
    achievement: "Invented Inverse Document Frequency weighting in 1972, the mathematical formula that underpins how Google and modern search engines rank results.",
    fact: "She had no formal computer science training, yet her 1972 paper remains one of the most cited in the field over 50 years later.",
    quote: "Computing is too important to be left to men.",
    clueArtifact: { type: "invention", text: "Inverse Document Frequency weighting, 1972" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P10",
    name: "Annie Easley",
    era: "1933 – 2011",
    field: "Aerospace computing",
    achievement: "NASA computer scientist who developed code for the Centaur rocket's upper stage, technology still used in space launches today. Also contributed to early electric vehicle battery research.",
    fact: "When she joined NASA in 1955, she was one of only four Black employees at the facility, and earned her math degree while working full-time.",
    quote: "Developed guidance code still in use for modern space launches.",
    clueArtifact: { type: "invention", text: "Centaur rocket upper-stage software" },
    redactedInFile1: false,
    difficulty: "medium"
  },
  {
    code: "P11",
    name: "Ann Caracristi",
    era: "1921 – 2016",
    field: "Cryptanalysis & intelligence",
    achievement: "Cracked Japanese military codes in World War II and rose to become Deputy Director of the NSA, the highest position ever held by a woman at the agency at that time.",
    fact: "She had an English literature degree, not mathematics, yet within months of joining the Army codebreaking unit she was outperforming trained mathematicians at decryption.",
    quote: "Rose to Deputy Director of the NSA after a wartime codebreaking career.",
    clueArtifact: { type: "event", text: "Japanese military code-breaking, WWII" },
    redactedInFile1: true,
    difficulty: "hard"
  },
  {
    code: "P12",
    name: "Sarah Flannery",
    era: "b. 1982",
    field: "Cryptography",
    achievement: "As a 16-year-old in Ireland, developed the Cayley-Purser public-key encryption algorithm, winning Ireland's Young Scientist of the Year and the EU Young Scientist of the Year in 1999.",
    fact: "She built and tested her encryption system as a school project with no formal cryptography training, attracting attention from professional security researchers worldwide.",
    quote: "Developed the Cayley-Purser algorithm as a teenager in County Cork.",
    clueArtifact: { type: "invention", text: "Cayley-Purser encryption algorithm, 1999" },
    redactedInFile1: false,
    difficulty: "easy"
  },
  {
    code: "P13",
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
    code: "P14",
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
    code: "P15",
    name: "Margaret Hamilton",
    era: "b. 1936",
    field: "Flight software",
    achievement: "Led the team that wrote the onboard flight software for the Apollo program, including the error-priority system that saved Apollo 11's landing.",
    fact: "She coined the term 'software engineering' to argue her work deserved the same respect as other engineering disciplines.",
    quote: "There was no second chance. We knew that.",
    clueArtifact: { type: "event", text: "Apollo 11 lunar landing computer alarm, 1969" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P16",
    name: "Hedy Lamarr",
    era: "1914 – 2000",
    field: "Wireless communication",
    achievement: "Co-invented a frequency-hopping signal system intended to guide torpedoes without being jammed, which became foundational to spread-spectrum wireless tech.",
    fact: "She was a working Hollywood film actress at the same time she filed the patent.",
    quote: "Films have a certain place in a certain time period. Technology is forever.",
    clueArtifact: { type: "invention", text: "Secret Communication System patent, 1942" },
    redactedInFile1: false,
    difficulty: "easy"
  },
  {
    code: "P17",
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
    code: "P18",
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
    code: "P19",
    name: "Lynn Conway",
    era: "1938 – 2024",
    field: "Microchip design",
    achievement: "Co-created methods for VLSI chip design that simplified how complex microchips are laid out, reshaping the semiconductor industry.",
    fact: "She was fired from an early employer after coming out as transgender, and had to fight for years to have her contributions recognized.",
    quote: "Helped revolutionize microchip design in the 1970s after years working at Xerox PARC.",
    clueArtifact: { type: "invention", text: "VLSI chip design methodology, 1970s" },
    redactedInFile1: true,
    difficulty: "medium"
  },
  {
    code: "P20",
    name: "Joy Buolamwini",
    era: "b. 1989",
    field: "AI ethics",
    achievement: "Exposed major accuracy gaps in facial recognition systems across race and gender, and founded an organization pushing for algorithmic accountability.",
    fact: "Her research directly influenced several large tech companies to pause or change their facial recognition products.",
    quote: "Founded the Algorithmic Justice League to make technology more equitable and accountable.",
    clueArtifact: { type: "event", text: "Gender Shades facial recognition bias study" },
    redactedInFile1: false,
    difficulty: "medium"
  }
];

module.exports = personalities;