// Node script to run Digimon pathfinding from JSON selection
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { getDigimonsForMove, findOptimalMovePath, findShortestPathWithDebugAndMaxQueue } = require('../../Experimentation/getDigimonsForMove');

// Debug log file
const LOG_PATH = path.join(__dirname, 'pathfinding_debug_log.txt');
function logDebug(msg) {
  fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${msg}\n`);
}
fs.writeFileSync(LOG_PATH, '--- Pathfinding Debug Log ---\n'); // Clear log at start

// Load JSON selection
const selection = require('./digimon_path_selection (1).json');

// Load CSVs
function loadCsvSync(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8');
  return Papa.parse(text, { header: true }).data;
}
const evolutionsCsv = loadCsvSync('../../Database/digimon_evolutions.csv');
const movesCsv = loadCsvSync('../../Database/digimon_moves.csv');
const movesCompleteCsv = loadCsvSync('../../Database/digimon_moves_complete.csv');


// Find shortest path using new method with maxQueueSize
let movesToUse = selection.moves || [];
if (selection.optimizeMoves) {
  let topN = selection.topThreads || 5;
  topN = Math.max(1, Math.min(8, topN));
  // Use modular threatAnalysis.js for Threat Analysis
  const { getTopThreatElements, getStrongestInheritableMoves } = require('../../Experimentation/threatAnalysis');
  const moveType = selection.type || null;
  const topElements = getTopThreatElements(movesCsv, movesCompleteCsv, topN);
  movesToUse = getStrongestInheritableMoves(topElements, movesCompleteCsv, moveType);
  logDebug('Threat Analysis moves: ' + JSON.stringify(movesToUse));
}
const moveDigimonGroups = getDigimonsForMove(movesToUse, movesCsv).map(obj => obj.digimons);
const graph = require('../../Experimentation/buildDigimonEvolutionGraph').buildDigimonEvolutionGraph(evolutionsCsv);
const pathResult = findShortestPathWithDebugAndMaxQueue(
  graph,
  selection.initialDigimon,
  selection.finalDigimon,
  moveDigimonGroups,
  logDebug,
  200000
);

console.log('Pathfinding result:');
console.log({
  initialDigimon: selection.initialDigimon,
  finalDigimon: selection.finalDigimon,
  moves: movesToUse,
  path: pathResult
});
logDebug(`Final result: path length=${pathResult.length}`);
