/**
 * Finds all valid paths up to a max queue size, then returns the shortest one.
 * @param {Object} graph - Digimon evolution graph
 * @param {string} initialNode - Starting Digimon name
 * @param {string} finalNode - Ending Digimon name
 * @param {Array<Array<string>>} digimonNameLists - Array of arrays, each with Digimon names
 * @param {function} debugLogFn - Logging function
 * @param {number} maxQueueSize - Maximum queue size to search before stopping
 * @returns {Array<string>} - Shortest valid path found
 */
function findShortestPathWithDebugAndMaxQueue(graph, initialNode, finalNode, digimonNameLists, debugLogFn, maxQueueSize) {
    const moveGroups = digimonNameLists;
    const movesToLearn = moveGroups.map((_, i) => i);
    function getMovesLearned(path) {
        const learned = new Set();
        path.forEach(node => {
            moveGroups.forEach((group, idx) => {
                if (group.includes(node)) learned.add(idx);
            });
        });
        return learned;
    }
    let queue = [{ path: [initialNode], movesLearned: getMovesLearned([initialNode]) }];
    let steps = 0;
    let maxQueue = 1;
    let potentialPathsFound = 0;
    let visited = new Set();
    let validPaths = [];
    while (queue.length > 0 && queue.length <= maxQueueSize) {
        steps++;
        if (steps % 1000 === 0) {
            debugLogFn(`Step ${steps}: queue size=${queue.length}, maxQueue=${maxQueue}, potentialPathsFound=${potentialPathsFound}`);
        }
        if (queue.length > maxQueue) maxQueue = queue.length;
        const { path, movesLearned } = queue.shift();
        const last = path[path.length - 1];
        const visitKey = `${last}|${[...movesLearned].sort().join(',')}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);
        if (last === finalNode && movesLearned.size === moveGroups.length) {
            potentialPathsFound++;
            debugLogFn(`Found path at step ${steps}, path length=${path.length}, movesLearned=[${[...movesLearned].join(',')}], potentialPathsFound=${potentialPathsFound}`);
            validPaths.push([...path]);
            continue;
        }
        const missingMoves = movesToLearn.filter(idx => !movesLearned.has(idx));
        const neighbors = [...(graph[last]?.evolvesTo || []), ...(graph[last]?.devolvesTo || [])];
        let canLearnMissing = false;
        for (const idx of missingMoves) {
            if (moveGroups[idx].some(digimon => !path.includes(digimon))) {
                canLearnMissing = true;
                break;
            }
        }
        if (missingMoves.length > 0 && !canLearnMissing) {
            debugLogFn(`Pruned path at step ${steps}, path length=${path.length}, movesLearned=[${[...movesLearned].join(',')}], missingMoves=[${missingMoves.join(',')}], reason=no possible future node can learn missing moves`);
            continue;
        }
        neighbors.forEach(neighbor => {
            if (!path.includes(neighbor)) {
                const newMovesLearned = new Set(movesLearned);
                moveGroups.forEach((group, idx) => {
                    if (group.includes(neighbor)) newMovesLearned.add(idx);
                });
                queue.push({ path: [...path, neighbor], movesLearned: newMovesLearned });
            }
        });
    }
    debugLogFn(`Search ended after ${steps} steps. Found ${validPaths.length} valid paths. Returning shortest.`);
    if (validPaths.length === 0) return [];
    return validPaths.reduce((a, b) => a.length <= b.length ? a : b);
}
// getDigimonsForMove.js
// Returns a list of moves and Digimons that can learn each move
// Usage: getDigimonsForMove(["Move1", "Move2", ...], movesCsv)

/**
 * Accepts a list of move names and returns a list of objects:
 * { move: string, digimons: string[] }
 * @param {string[]} moveList - List of move names
 * @param {Array} movesCsv - Array of move objects (from digimon_moves.csv or digimon_moves_complete.csv)
 * @returns {Array<{move: string, digimons: string[]}>}
 */
function getDigimonsForMove(moveList, movesCsv) {
    return moveList.map(moveName => {
        // Find all Digimons that can learn this move
        const digimons = movesCsv
            .filter(row => row.Move === moveName && row.Digimon)
            .map(row => row.Digimon);
        return { move: moveName, digimons };
    });
}

/**
 * Finds the optimal Digimon evolution path for a set of moves, starting and ending at user-selected Digimon.
 * Ties together getDigimonsForMove and findShortestPathWithStartEndAndGroups.
 * @param {string[]} movesList - List of move names
 * @param {Array} movesCsv - Array of move objects (from digimon_moves.csv)
 * @param {Array} evolutionsCsv - Array of evolution objects (from digimon_evolutions.csv)
 * @param {string} initialDigimon - Starting Digimon name (from UI)
 * @param {string} finalDigimon - Ending Digimon name (from UI)
 * @returns {Array<string>} - Shortest path of Digimon names
 */

function findOptimalMovePath(movesList, movesCsv, evolutionsCsv, initialDigimon, finalDigimon, options = {}) {
    const moveDigimonGroups = getDigimonsForMove(movesList, movesCsv).map(obj => obj.digimons);
    const graph = buildDigimonEvolutionGraph(evolutionsCsv);
    if (options.debugLogFn) {
        return findShortestPathWithDebug(graph, initialDigimon, finalDigimon, moveDigimonGroups, options.debugLogFn);
    }
    return findShortestPathWithStartEndAndGroups(graph, initialDigimon, finalDigimon, moveDigimonGroups);
}

function findShortestPathWithDebug(graph, initialNode, finalNode, digimonNameLists, debugLogFn) {
    // Each move group is a set of Digimon that can learn that move
    const moveGroups = digimonNameLists;
    // Moves to learn (index matches moveGroups)
    const movesToLearn = moveGroups.map((_, i) => i);
    // Helper: for a path, return set of move indices learned so far
    function getMovesLearned(path) {
        const learned = new Set();
        path.forEach(node => {
            moveGroups.forEach((group, idx) => {
                if (group.includes(node)) learned.add(idx);
            });
        });
        return learned;
    }
    let queue = [{ path: [initialNode], movesLearned: getMovesLearned([initialNode]) }];
    let steps = 0;
    let maxQueue = 1;
    let potentialPathsFound = 0;
    let visited = new Set();
    while (queue.length > 0) {
        steps++;
        if (steps % 1000 === 0) {
            debugLogFn(`Step ${steps}: queue size=${queue.length}, maxQueue=${maxQueue}, potentialPathsFound=${potentialPathsFound}`);
        }
        if (queue.length > maxQueue) maxQueue = queue.length;
        const { path, movesLearned } = queue.shift();
        const last = path[path.length - 1];
        // Key for visited: last node + moves learned
        const visitKey = `${last}|${[...movesLearned].sort().join(',')}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);
        // Check if all moves are learned and at final node
        if (last === finalNode && movesLearned.size === moveGroups.length) {
            potentialPathsFound++;
            debugLogFn(`Found path at step ${steps}, path length=${path.length}, movesLearned=[${[...movesLearned].join(',')}], potentialPathsFound=${potentialPathsFound}`);
            return path;
        }
        // Prune: if path cannot possibly learn all moves (e.g., no more new nodes in the entire graph can learn missing moves)
        const missingMoves = movesToLearn.filter(idx => !movesLearned.has(idx));
        const neighbors = [...(graph[last]?.evolvesTo || []), ...(graph[last]?.devolvesTo || [])];
        let canLearnMissing = false;
        for (const idx of missingMoves) {
            // If any Digimon in moveGroups[idx] is not already in the path, we can still learn this move in the future
            if (moveGroups[idx].some(digimon => !path.includes(digimon))) {
                canLearnMissing = true;
                break;
            }
        }
        if (missingMoves.length > 0 && !canLearnMissing) {
            debugLogFn(`Pruned path at step ${steps}, path length=${path.length}, movesLearned=[${[...movesLearned].join(',')}], missingMoves=[${missingMoves.join(',')}], reason=no possible future node can learn missing moves`);
            continue;
        }
        neighbors.forEach(neighbor => {
            if (!path.includes(neighbor)) {
                // Update moves learned for new path
                const newMovesLearned = new Set(movesLearned);
                moveGroups.forEach((group, idx) => {
                    if (group.includes(neighbor)) newMovesLearned.add(idx);
                });
                queue.push({ path: [...path, neighbor], movesLearned: newMovesLearned });
            }
        });
    }
    debugLogFn(`No path found after ${steps} steps. potentialPathsFound=${potentialPathsFound}`);
    return [];
}

// Export for Node and browser
if (typeof module !== 'undefined') {
    module.exports = { getDigimonsForMove, findOptimalMovePath, findShortestPathWithDebugAndMaxQueue };
}
if (typeof window !== 'undefined') {
    window.getDigimonsForMove = getDigimonsForMove;
    window.findOptimalMovePath = findOptimalMovePath;
}
