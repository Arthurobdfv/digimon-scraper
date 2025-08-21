// Batch fix script for digimon_moves_complete.csv using digimon_moves.csv
// Run in Node.js or browser console with both CSVs loaded as text

function parseMovesComplete(csvText) {
    const lines = csvText.split('\n');
    const moves = [];
    for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const [Move, Icon, Attribute, Type, SP_Cost, Power, Inheritable] = line.split(',');
        moves.push({
            Move: Move?.trim(),
            Icon: Icon?.trim(),
            Attribute: Attribute?.trim(),
            Type: Type?.trim(),
            SP_Cost: SP_Cost?.trim(),
            Power: Power?.trim(),
            Inheritable: Inheritable?.trim()
        });
    }
    return moves;
}

function parseMovesList(csvText) {
    const lines = csvText.split('\n');
    const moves = [];
    for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const [Move, Digimon, Level] = line.split(',');
        moves.push({ Move: Move?.trim(), Digimon: Digimon?.trim(), Level: Level?.trim() });
    }
    return moves;
}

function fixInheritableMoves(movesComplete, movesList) {
    for (const move of movesComplete) {
        const learners = movesList.filter(row => row.Move.trim() === move.Move.trim());
        if (learners.length === 1) {
            const level = parseInt(learners[0].Level, 10);
            if (level === 0 || level === 1) {
                move.Inheritable = 'No';
            }
        }
    }
}

function movesCompleteToCSV(movesComplete) {
    const header = 'Move,Icon,Attribute,Type,SP Cost,Power,Inheritable';
    const lines = movesComplete.map(m => [m.Move, m.Icon, m.Attribute, m.Type, m.SP_Cost, m.Power, m.Inheritable].join(','));
    return [header, ...lines].join('\n');
}

// Usage example:
// const movesComplete = parseMovesComplete(movesCompleteText);
// const movesList = parseMovesList(movesListText);
// fixInheritableMoves(movesComplete, movesList);
// const fixedCSV = movesCompleteToCSV(movesComplete);
// Save fixedCSV to file or use as needed.
