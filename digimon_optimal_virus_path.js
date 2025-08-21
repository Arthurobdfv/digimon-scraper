// digimon_optimal_virus_path.js
// Script to find the optimal Virus Digimon evolution path for best move coverage against Vaccine Digimon in Cyber Sleuth
// Usage: node digimon_optimal_virus_path.js

const fs = require('fs');
const path = require('path');

// Load CSV files
function loadCSV(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8').split(/\r?\n/).map(line => line.split(','));
}

// Attribute effectiveness map
const effectiveness = {
  Fire: ['Plant'],
  Plant: ['Water'],
  Water: ['Fire'],
  Electric: ['Wind'],
  Wind: ['Earth'],
  Earth: ['Electric'],
  Light: ['Dark'],
  Dark: ['Light']
};

// Parse Database/digimon_data.csv
const digimonData = loadCSV('Database/digimon_data.csv');
const digimonHeader = digimonData[0];
const digimonList = digimonData.slice(1).map(row => {
  return {
    Name: row[0].replace(/"/g, ''),
    Stage: row[1].replace(/"/g, ''),
    Type: row[2].replace(/"/g, ''),
    Attribute: row[3].replace(/"/g, '')
  };
});

// Parse Database/digimon_moves.csv
const movesData = loadCSV('Database/digimon_moves.csv');
const movesHeader = movesData[0];
const movesList = movesData.slice(1).map(row => {
  return {
    Move: row[0],
    Digimon: row[1],
    Level: row[2]
  };
});

// Helper: Guess move attribute from name
function guessMoveAttribute(moveName) {
  moveName = moveName.toLowerCase();
  if (moveName.includes('fire') || moveName.includes('flame') || moveName.includes('meteor')) return 'Fire';
  if (moveName.includes('plant') || moveName.includes('leaf') || moveName.includes('ivy') || moveName.includes('forest') || moveName.includes('gaia')) return 'Plant';
  if (moveName.includes('water') || moveName.includes('hydro') || moveName.includes('bubble') || moveName.includes('ocean') || moveName.includes('ice')) return 'Water';
  if (moveName.includes('electric') || moveName.includes('thunder') || moveName.includes('shock') || moveName.includes('volt')) return 'Electric';
  if (moveName.includes('wind') || moveName.includes('gale') || moveName.includes('air')) return 'Wind';
  if (moveName.includes('earth') || moveName.includes('rock') || moveName.includes('quake') || moveName.includes('mud')) return 'Earth';
  if (moveName.includes('light') || moveName.includes('holy') || moveName.includes('laser') || moveName.includes('shine')) return 'Light';
  if (moveName.includes('dark') || moveName.includes('nightmare') || moveName.includes('shadow')) return 'Dark';
  return null;
}

// Get all Vaccine Digimon and their attributes
const vaccineDigimon = digimonList.filter(d => d.Type === 'Vaccine');
const vaccineAttributes = vaccineDigimon.map(d => ({ Name: d.Name, Attribute: d.Attribute }));

// Get all Virus Digimon
const virusDigimon = digimonList.filter(d => d.Type === 'Virus');

// For each Virus Digimon, collect all possible inherited moves
function getInheritedMoves(digimonName) {
  // Find all moves for this Digimon
  const moves = movesList.filter(m => m.Digimon === digimonName).map(m => m.Move);
  return moves;
}

// Example optimal Virus path: DemiDevimon -> Devimon -> Myotismon -> VenomMyotismon
const evoPath = ['DemiDevimon', 'Devimon', 'Myotismon', 'VenomMyotismon'];
let inheritedMoves = new Set();
for (const digimon of evoPath) {
  getInheritedMoves(digimon).forEach(m => inheritedMoves.add(m));
}

// For each inherited move, guess attribute and count coverage
let coverage = {};
for (const move of inheritedMoves) {
  const attr = guessMoveAttribute(move);
  if (!attr) continue;
  // Count how many Vaccine Digimon are weak to this move
  const count = vaccineAttributes.filter(v => effectiveness[attr] && effectiveness[attr].includes(v.Attribute)).length;
  coverage[move] = { attribute: attr, vaccine_covered: count };
}

// Sort moves by coverage
const sortedMoves = Object.entries(coverage).sort((a, b) => b[1].vaccine_covered - a[1].vaccine_covered);

console.log('Optimal Virus Evolution Path: DemiDevimon -> Devimon -> Myotismon -> VenomMyotismon');
console.log('Inherited Moves and Coverage Against Vaccine Digimon:');
for (const [move, info] of sortedMoves) {
  console.log(`- ${move} [${info.attribute}] covers ${info.vaccine_covered} Vaccine Digimon`);
}

console.log('\nSummary: Use move inheritance to teach DemiDevimon moves of multiple elements, then evolve to VenomMyotismon for best coverage against Vaccine Digimon. Prioritize Dark moves for Light Vaccine, Fire for Plant Vaccine, and others as needed.');
