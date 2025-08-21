// Modular Threat Analysis for Digimon moves (browser compatible)
// Exports: getTopThreatElements, getStrongestInheritableMoves

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
        if (m.Move && m.Attribute) moveToElement[m.Move.trim().toLowerCase()] = m.Attribute.trim().toLowerCase();
    }
    for (const row of movesList) {
        const moveName = row.Move?.trim().toLowerCase();
        const element = moveToElement[moveName];
        if (element) {
            elementCounts[element] = (elementCounts[element] || 0) + 1;
        }
    }
    // Sort elements by count
    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
    const topElements = sorted.slice(0, topN).map(([element]) => element);
    console.log('[ThreatAnalysis] Top elements:', topElements, 'Element counts:', elementCounts);
    return topElements;
}

/**
 * Finds the strongest inheritable move for each element, optionally filtered by type.
 * @param {Array} elements Array of element names
 * @param {Array} movesComplete Array of move objects from digimon_moves_complete.csv
 * @param {string} typeFilter 'Physical', 'Magical', or null for any
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
            if (attrNorm === elemNorm && inheritableNorm === 'yes' && (!typeFilter || typeNorm === typeFilter.toLowerCase())) {
                const power = parseInt(m.Power, 10) || 0;
                if (power > bestPower) {
                    bestPower = power;
                    bestMove = m.Move.trim();
                }
            }
        }
        if (bestMove) selectedMoves.push(bestMove);
        console.log(`[ThreatAnalysis] For element '${elem}', bestMove:`, bestMove, 'typeFilter:', typeFilter);
    }
    console.log('[ThreatAnalysis] Strongest inheritable moves:', selectedMoves, 'Type filter:', typeFilter);
    return selectedMoves;
}

// Export for browser and test usage
if (typeof window !== 'undefined') {
    window.getTopThreatElements = getTopThreatElements;
    window.getStrongestInheritableMoves = getStrongestInheritableMoves;
}

// For Node.js tests, export as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getTopThreatElements,
        getStrongestInheritableMoves
    };
}
