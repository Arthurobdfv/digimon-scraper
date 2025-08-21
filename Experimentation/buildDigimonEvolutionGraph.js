// buildDigimonEvolutionGraph.js
// Reads digimon evolution data and builds a graph:
// {
//   DigimonName: {
//     evolvesTo: [DigimonName, ...],
//     devolvesTo: [DigimonName, ...]
//   },
//   ...
// }
// Usage: buildDigimonEvolutionGraph(evolutionsCsv)

/**
 * @param {Array} evolutionsCsv - Array of objects from digimon_evolutions.csv
 * @returns {Object}
 */
function buildDigimonEvolutionGraph(evolutionsCsv) {
    const graph = {};
    // First pass: initialize all Digimon nodes
    evolutionsCsv.forEach(row => {
        const name = row.Digimon;
        if (!graph[name]) {
            graph[name] = { evolvesTo: [], devolvesTo: [] };
        }
    });
    // Second pass: fill evolvesTo and devolvesTo
    evolutionsCsv.forEach(row => {
        const name = row.Digimon;
        // Evolves To: split by ';', trim, filter empty
        if (row["Evolves To"]) {
            const evolvesToList = row["Evolves To"].split(';')
                .map(x => x.trim())
                .filter(x => x && x.toLowerCase() !== 'none');
            graph[name].evolvesTo.push(...evolvesToList);
            // For each child, add this as a devolvesTo
            evolvesToList.forEach(child => {
                if (!graph[child]) {
                    graph[child] = { evolvesTo: [], devolvesTo: [] };
                }
                graph[child].devolvesTo.push(name);
            });
        }
    });
    return graph;
}

/**
 * Finds the shortest path that links at least one node from each provided list of Digimon names.
 * Uses BFS and multi-goal pathfinding.
 * @param {Object} graph - Digimon evolution graph from buildDigimonEvolutionGraph
 * @param {Array<Array<string>>} digimonNameLists - Array of arrays, each with Digimon names
 * @returns {Array<string>} - Shortest path of Digimon names
 */
function findShortestPathLinkingLists(graph, digimonNameLists) {
    // Flatten all possible start nodes (first list)
    const startNodes = digimonNameLists[0];
    // Set of goal sets (one node from each list)
    const goalSets = digimonNameLists.map(list => new Set(list));
    // Helper: check if path covers at least one from each set
    function coversAllSets(path) {
        return goalSets.every(set => path.some(node => set.has(node)));
    }
    // BFS from all start nodes
    let queue = [];
    startNodes.forEach(start => {
        queue.push({ path: [start] });
    });
    while (queue.length > 0) {
        const { path } = queue.shift();
        if (coversAllSets(path)) {
            return path;
        }
        const last = path[path.length - 1];
        const neighbors = [...(graph[last]?.evolvesTo || []), ...(graph[last]?.devolvesTo || [])];
        neighbors.forEach(neighbor => {
            if (!path.includes(neighbor)) {
                queue.push({ path: [...path, neighbor] });
            }
        });
    }
    return [];
}

/**
 * Finds the shortest path from initialNode to finalNode, passing through at least one node from each group in digimonNameLists.
 * @param {Object} graph - Digimon evolution graph
 * @param {string} initialNode - Starting Digimon name
 * @param {string} finalNode - Ending Digimon name
 * @param {Array<Array<string>>} digimonNameLists - Array of arrays, each with Digimon names
 * @returns {Array<string>} - Shortest path
 */
function findShortestPathWithStartEndAndGroups(graph, initialNode, finalNode, digimonNameLists) {
    // Set of goal sets (one node from each list)
    const goalSets = digimonNameLists.map(list => new Set(list));
    function coversAllSets(path) {
        return goalSets.every(set => path.some(node => set.has(node)));
    }
    let queue = [{ path: [initialNode] }];
    let visited = new Set([initialNode]);
    while (queue.length > 0) {
        const { path } = queue.shift();
        const last = path[path.length - 1];
        if (last === finalNode && coversAllSets(path)) {
            return path;
        }
        const neighbors = [...(graph[last]?.evolvesTo || []), ...(graph[last]?.devolvesTo || [])];
        neighbors.forEach(neighbor => {
            if (!path.includes(neighbor)) {
                queue.push({ path: [...path, neighbor] });
            }
        });
    }
    return [];
}

// Helper to get all permutations of an array
function permute(arr) {
    if (arr.length <= 1) return [arr];
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = arr.slice(0, i).concat(arr.slice(i + 1));
        for (const perm of permute(rest)) {
            result.push([arr[i]].concat(perm));
        }
    }
    return result;
}

// Export for Node and browser
if (typeof module !== 'undefined') {
    module.exports = { buildDigimonEvolutionGraph, findShortestPathLinkingLists, findShortestPathWithStartEndAndGroups };
}
if (typeof window !== 'undefined') {
    window.buildDigimonEvolutionGraph = buildDigimonEvolutionGraph;
    window.findShortestPathLinkingLists = findShortestPathLinkingLists;
    window.findShortestPathWithStartEndAndGroups = findShortestPathWithStartEndAndGroups;
}

