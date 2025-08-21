// fix_moves_inheritable_batch.js
// Batch fix for Inheritable field in digimon_moves_complete.csv using digimon_moves.csv

const fs = require('fs');
const path = require('path');

const movesCompletePath = path.join(__dirname, 'digimon_moves_complete.csv');
const movesListPath = path.join(__dirname, 'digimon_moves.csv');

function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const header = lines[0].split(',');
    return lines.slice(1).filter(l => l.trim()).map(line => {
        const cols = line.split(',');
        const obj = {};
        for (let i = 0; i < header.length; i++) {
            obj[header[i].trim()] = cols[i] ? cols[i].trim() : '';
        }
        return obj;
    });
}

function toCSV(rows, header) {
    return [header.join(',')].concat(rows.map(row => header.map(h => row[h] || '').join(','))).join('\n');
}

function fixInheritableMoves(movesComplete, movesList) {
    for (const move of movesComplete) {
        const learners = movesList.filter(row => row.Move && row.Move.trim() === move.Move.trim());
        if (learners.length === 1) {
            const level = parseInt(learners[0].Level, 10);
            if (level === 0 || level === 1) {
                move.Inheritable = 'No';
            }
        }
    }
}

const movesCompleteText = fs.readFileSync(movesCompletePath, 'utf8');
const movesListText = fs.readFileSync(movesListPath, 'utf8');
const movesComplete = parseCSV(movesCompleteText);
const movesList = parseCSV(movesListText);

fixInheritableMoves(movesComplete, movesList);

const header = movesCompleteText.split(/\r?\n/)[0].split(',');
const newCSV = toCSV(movesComplete, header);
fs.writeFileSync(movesCompletePath, newCSV, 'utf8');
console.log('digimon_moves_complete.csv updated with fixed Inheritable fields.');
