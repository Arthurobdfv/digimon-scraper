const fs = require('fs');
const path = require('path');

const movesCsv = path.join(__dirname, 'Database/digimon_moves.csv');
const completeCsv = path.join(__dirname, 'Database/digimon_moves_complete.csv');

// Read Database/digimon_moves.csv and aggregate
const movesRaw = fs.readFileSync(movesCsv, 'utf8');
const movesLines = movesRaw.trim().split(/\r?\n/);
const movesHeader = movesLines[0].split(',');
const movesData = movesLines.slice(1).map(line => {
    const [Move, Digimon, Level] = line.split(',');
    return { Move: Move.trim(), Digimon: Digimon.trim(), Level: parseInt(Level.trim(), 10) };
});

// Aggregate by Move
const moveAgg = {};
movesData.forEach(row => {
    if (!moveAgg[row.Move]) moveAgg[row.Move] = [];
    moveAgg[row.Move].push(row.Level);
});

// Identify non-inheritable moves
const nonInheritable = new Set();
for (const move in moveAgg) {
    const levels = moveAgg[move];
    const allLevelOne = levels.length > 0 && levels.every(lvl => lvl === 1);
    if (allLevelOne && levels.length < 3) {
        nonInheritable.add(move);
    }
}

// Read Database/digimon_moves_complete.csv
const completeRaw = fs.readFileSync(completeCsv, 'utf8');
const completeLines = completeRaw.trim().split(/\r?\n/);
const completeHeader = completeLines[0];
const completeData = completeLines.slice(1).map(line => line.split(','));

// Update Inheritable column

const idxMove = 0;
const idxInheritable = completeHeader.split(',').length - 1;
const updated = [completeHeader];
completeData.forEach(row => {
    const moveName = row[idxMove].trim();
    if (nonInheritable.has(moveName)) {
        row[idxInheritable] = 'No';
    }
    // Otherwise, preserve existing value
    updated.push(row.join(','));
});

fs.writeFileSync(completeCsv, updated.join('\n'), 'utf8');
console.log('Database/digimon_moves_complete.csv updated with correct Inheritable values.');
