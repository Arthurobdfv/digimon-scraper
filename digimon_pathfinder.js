/**
 * Finds the shortest path from start to end Digimon, testing all combinations of Digimon candidates for each required move.
 * @param {string} start Starting Digimon
 * @param {string} end Final Digimon
 * @param {Array<Array<string>>} moveCandidates Array of arrays, each containing Digimon candidates for a required move
 * @param {Object} graph Evolution graph
 * @returns {Object} { path: string[], digimons: string[] } or null if no path found
 */
function findShortestPathWithMoveCandidates(start, end, moveCandidates, graph) {
    // Helper: cartesian product
    function cartesian(arr) {
        return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
    }
    const allCombos = cartesian(moveCandidates);
    let bestPath = null;
    let bestCombo = null;
    let bestLength = Infinity;
    for (const combo of allCombos) {
        // Deduplicate Digimon in combo
        const required = Array.from(new Set(combo));
        const path = findEvolutionPath(start, end, required, graph);
        if (path && path.length < bestLength) {
            bestLength = path.length;
            bestPath = path;
            bestCombo = required;
        }
    }
    if (bestPath) {
        return { path: bestPath, digimons: bestCombo };
    }
    return null;
}

// Export for SPA usage (browser only)
if (typeof window !== 'undefined') {
    window.digimonPathfinder = window.digimonPathfinder || {};
    window.digimonPathfinder.findShortestPathWithMoveCandidates = findShortestPathWithMoveCandidates;
}
// digimon_pathfinder.js
// Pathfinding logic for Digimon evolution chains
// Usage: findEvolutionPath(startDigimon, endDigimon, requiredDigimons, evolutionData)



/**
 * Loads evolution data from CSV and builds a graph.
 * @param {string} csvPath Path to digimon_evolutions.csv
 * @returns {Object} Graph: { digimon: [evolutions...] }
 */
// Loads evolution data from CSV text and builds a graph.
function loadEvolutionGraphFromText(csvText) {
    const lines = csvText.split('\n');
    const graph = {};
    for (const line of lines.slice(1)) { // skip header
        if (!line.trim()) continue;
        const [digimon, evolutions] = line.split(',');
        if (!graph[digimon]) graph[digimon] = [];
        if (evolutions) {
            for (const evo of evolutions.split(';')) {
                if (evo.trim()) graph[digimon].push(evo.trim());
            }
        }
    }
    return graph;
}

/**
 * BFS to find shortest path from start to end, passing through requiredDigimons.
 * @param {string} start Starting Digimon
 * @param {string} end Final Digimon
 * @param {string[]} requiredDigimons Digimons to include in path
 * @param {Object} graph Evolution graph
 * @returns {string[]|null} Path or null if not found
 */
function findEvolutionPath(start, end, requiredDigimons, graph) {
    const queue = [[start, [start], new Set(requiredDigimons.filter(d => d !== start))]];
    const visited = new Set();
    while (queue.length) {
        const [current, path, requiredLeft] = queue.shift();
        if (current === end && requiredLeft.size === 0) {
            return path;
        }
        visited.add(current + '|' + Array.from(requiredLeft).join(','));
        for (const neighbor of graph[current] || []) {
            const newRequired = new Set(requiredLeft);
            if (newRequired.has(neighbor)) newRequired.delete(neighbor);
            const stateKey = neighbor + '|' + Array.from(newRequired).join(',');
            if (!visited.has(stateKey)) {
                queue.push([neighbor, [...path, neighbor], newRequired]);
            }
        }
    }
    return null;
}

// Example usage:
// const graph = loadEvolutionGraph(path.join(__dirname, 'digimon_evolutions.csv'));
// const pathResult = findEvolutionPath('SaberLeomon', 'MirageGaogamon BM', ['Panjiyamon', 'MetalGreymon', 'MirageGaogamon'], graph);
// console.log(pathResult);


/**
 * Loads Digimon data from CSV.
 * @param {string} csvPath Path to digimon_data.csv
 * @returns {Object} { digimon: { attribute, type, ... } }
 */
// Loads Digimon data from CSV text.
function loadDigimonDataFromText(csvText) {
    const lines = csvText.split('\n');
    const result = {};
    for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const [name, attribute, type, ...rest] = line.split(',');
        // Remove leading/trailing quotes from name
        const cleanName = name.trim().replace(/^"|"$/g, '');
        result[cleanName] = { attribute: attribute?.trim(), type: type?.trim() };
    }
    return result;
}

/**
 * Loads moves from CSV.
 * @param {string} csvPath Path to digimon_moves.csv or digimon_moves_complete.csv
 * @returns {Array} [{ move, element, type, digimons: [...] }]
 */
// Loads moves from CSV text.
function loadMovesFromText(csvText) {
    const lines = csvText.split('\n');
    const moves = [];
    for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const [move, element, type, digimons] = line.split(',');
        moves.push({
            move: move?.trim(),
            element: element?.trim(),
            type: type?.trim(),
            digimons: digimons ? digimons.split(';').map(d => d.trim()) : []
        });
    }
    return moves;
}

/**
 * Loads moves from digimon_moves_complete.csv text.
 * @param {string} csvText CSV text
 * @returns {Array} [{ Move, Icon, Attribute, Type, SP_Cost, Power, Inheritable }]
 */
function loadMovesCompleteFromText(csvText) {
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

/**
 * Fixes Inheritable field in movesComplete: if a move is only learned by one Digimon at level 1 or 0, mark as not inheritable.
 * @param {Array} movesComplete Array of move objects from digimon_moves_complete.csv
 * @param {Array} movesList Array of move objects from digimon_moves.csv
 */
function fixInheritableMoves(movesComplete, movesList) {
    for (const move of movesComplete) {
        // Find all entries for this move
        const learners = movesList.filter(row => row.Move.trim() === move.Move.trim());
        // Aggregate by Move column
        const moveCount = learners.length;
        // Check if all entries are level 1
        const allLevelOne = learners.length > 0 && learners.every(row => parseInt(row.Level, 10) === 1);
        // Mark as NON-INHERITABLE if all are level 1 and less than 3 occurrences
        if (allLevelOne && moveCount < 3) {
            move.Inheritable = 'No';
        }
        // Otherwise, do not change the field (preserve existing value)
    }
}

// Ensure all exports are attached to window immediately for SPA tabs
// For browser usage, export all functions to window.digimonPathfinder
if (typeof window !== 'undefined') {
    window.digimonPathfinder = window.digimonPathfinder || {};
    window.digimonPathfinder.loadEvolutionGraphFromText = loadEvolutionGraphFromText;
    window.digimonPathfinder.findEvolutionPath = findEvolutionPath;
    window.digimonPathfinder.loadDigimonDataFromText = loadDigimonDataFromText;
    window.digimonPathfinder.loadMovesFromText = loadMovesFromText;
    window.digimonPathfinder.loadMovesCompleteFromText = loadMovesCompleteFromText;
    window.digimonPathfinder.getRequiredMoveLearners = getRequiredMoveLearners;
    window.digimonPathfinder.fixInheritableMoves = fixInheritableMoves;
    window.digimonPathfinder.findShortestPathWithMoveCandidates = findShortestPathWithMoveCandidates;
}

// For Node.js usage, export functions via module.exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadEvolutionGraphFromText,
        findEvolutionPath,
        loadDigimonDataFromText,
        loadMovesFromText,
        loadMovesCompleteFromText,
        getRequiredMoveLearners,
        fixInheritableMoves,
        findShortestPathWithMoveCandidates
    };
}

/**
 * Determines required Digimon for optimal move coverage.
 * @param {string} finalDigimon Final Digimon name
 * @param {Object} digimonData Digimon data
 * @param {Array} movesComplete Moves data from digimon_moves_complete.csv
 * @param {Array} movesList Moves data from digimon_moves.csv
 * @returns {Array} Digimon names to target for move inheritance
 */

/**
 * Aggregates move element frequencies from movesList and returns top N elements.
 * @param {Array} movesList Array of move objects from digimon_moves.csv
 * @param {Array} movesComplete Array of move objects from digimon_moves_complete.csv
 * @param {number} topN Number of top elements to return
 * @returns {Array} Array of top N element names
 */
function getTopThreatElements(movesList, movesComplete, topN = 5) {
    const elementCounts = {};
    // Build a map from move name to element
    const moveToElement = {};
    for (const m of movesComplete) {
        if (m.Move && m.Attribute) moveToElement[m.Move.trim()] = m.Attribute.trim();
    }
    for (const row of movesList) {
        const moveName = row.Move?.trim();
        const element = moveToElement[moveName];
        if (element) {
            elementCounts[element] = (elementCounts[element] || 0) + 1;
        }
    }
    // Sort elements by count
    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, topN).map(([element]) => element);
}

/**
 * Finds the strongest inheritable move for each element, optionally filtered by type.
 * @param {Array} elements Array of element names
 * @param {Array} movesComplete Array of move objects from digimon_moves_complete.csv
 * @param {string} typeFilter 'physical', 'magic', or null for any
 * @returns {Array} Array of move names
 */
function getStrongestInheritableMoves(elements, movesComplete, typeFilter = null) {
    const selectedMoves = [];
    for (const elem of elements) {
        let bestMove = null;
        let bestPower = -Infinity;
        for (const m of movesComplete) {
            const attrNorm = m.Attribute ? m.Attribute.trim().toLowerCase() : '';
            const elemNorm = elem.trim().toLowerCase();
            const typeNorm = m.Type ? m.Type.trim().toLowerCase() : '';
            const inheritableNorm = m.Inheritable ? m.Inheritable.trim().toLowerCase() : '';
            if (attrNorm === elemNorm && inheritableNorm === 'yes' && (!typeFilter || typeNorm === typeFilter)) {
                const power = parseInt(m.Power, 10) || 0;
                if (power > bestPower) {
                    bestPower = power;
                    bestMove = m.Move.trim();
                }
            }
        }
        if (bestMove) selectedMoves.push(bestMove);
    }
    return selectedMoves;
}

/**
 * Determines required Digimon for optimal move coverage using top threats and strongest inheritable moves.
 * @param {string} finalDigimon Final Digimon name
 * @param {Object} digimonData Digimon data
 * @param {Array} movesComplete Moves data from digimon_moves_complete.csv
 * @param {Array} movesList Moves data from digimon_moves.csv
 * @param {string} typeFilter 'physical', 'magic', or null for any
 * @returns {Array} Digimon names to target for move inheritance
 */
function getRequiredMoveLearners(finalDigimon, digimonData, movesComplete, movesList, typeFilter = null) {
    // Aggregate top 5 threat elements
    const topElements = getTopThreatElements(movesList, movesComplete, 5);
    // Find strongest inheritable moves for each element
    const selectedMoves = getStrongestInheritableMoves(topElements, movesComplete, typeFilter);
    // Collect all Digimons for each move, then deduplicate
    let requiredDigimons = [];
    for (const moveName of selectedMoves) {
        const digimons = movesList.filter(row => row.Move.trim() === moveName).map(row => row.Digimon.trim());
        if (digimons.length === 0) continue;
        // Pick the first Digimon for simplicity (could optimize for shortest path)
        requiredDigimons.push(digimons[0]);
    }
    // Deduplicate
    requiredDigimons = Array.from(new Set(requiredDigimons));
    return requiredDigimons;
}

// Export new functions for SPA usage
if (typeof window !== 'undefined') {
    window.digimonPathfinder.getTopThreatElements = getTopThreatElements;
    window.digimonPathfinder.getStrongestInheritableMoves = getStrongestInheritableMoves;
}
