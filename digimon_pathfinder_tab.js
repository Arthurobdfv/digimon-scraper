// digimon_pathfinder_tab.js
// Minimal UI logic for Digimon Evolution Path Finder

document.addEventListener('DOMContentLoaded', function() {
	// Load Digimon names from digimon_data.csv
	 fetch('Database/digimon_data.csv').then(r => r.text()).then(function(dataText) {
		const lines = dataText.split('\n');
		const names = [];
		for (const line of lines.slice(1)) {
			if (!line.trim()) continue;
			const [name] = line.split(',');
			if (name && !names.includes(name.trim())) names.push(name.trim());
		}
		setupAutocomplete('startDigimon', names);
		setupAutocomplete('endDigimon', names);
	});

	function setupAutocomplete(inputId, options) {
		const input = document.getElementById(inputId);
		const datalistId = inputId + '-list';
		let datalist = document.getElementById(datalistId);
		if (!datalist) {
			datalist = document.createElement('datalist');
			datalist.id = datalistId;
			if (input.parentNode) {
				input.parentNode.appendChild(datalist);
			} else {
				document.body.appendChild(datalist);
			}
			input.setAttribute('list', datalistId);
		}
		function updateList(value) {
			datalist.innerHTML = '';
			const filtered = options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
			filtered.forEach(opt => {
				const option = document.createElement('option');
				option.value = opt;
				datalist.appendChild(option);
			});
		}
		input.addEventListener('input', function() {
			updateList(input.value);
		});
		updateList('');
	}

	document.getElementById('runPathFinder').addEventListener('click', function() {
		console.log('[Pathfinder] Click handler started');
	const start = document.getElementById('startDigimon').value.trim();
	const end = document.getElementById('endDigimon').value.trim();
	const moveType = document.getElementById('moveType').value.trim();
	const breakdownDiv = document.getElementById('breakdown');
		breakdownDiv.innerHTML = '<progress class="progress is-small is-primary" max="100">Loading...</progress>';

		// Load all required CSVs in parallel
		Promise.all([
			 fetch('Database/digimon_evolutions.csv').then(r => r.text()),
			 fetch('Database/digimon_data.csv').then(r => r.text()),
			 fetch('Database/digimon_moves_complete.csv').then(r => r.text()),
			 fetch('Database/digimon_moves.csv').then(r => r.text())
		]).then(([evoText, dataText, movesText, movesListText]) => {
			console.log('[Pathfinder] CSVs loaded');
			// Parse CSVs
			const graph = window.digimonPathfinder.loadEvolutionGraphFromText(evoText);
			if (!graph || Object.keys(graph).length === 0) console.error('[Pathfinder] Evolution graph failed to parse or is empty');
			const digimonData = window.digimonPathfinder.loadDigimonDataFromText(dataText);
			if (!digimonData || Object.keys(digimonData).length === 0) console.error('[Pathfinder] Digimon data failed to parse or is empty');
			const movesComplete = window.digimonPathfinder.loadMovesCompleteFromText(movesText);
			if (!movesComplete || movesComplete.length === 0) console.error('[Pathfinder] MovesComplete failed to parse or is empty');
			const movesList = window.digimonPathfinder.loadMovesFromText(movesListText);
			if (!movesList || movesList.length === 0) console.error('[Pathfinder] MovesList failed to parse or is empty');

			// Aggregate top 5 threat elements
			const topElements = window.digimonPathfinder.getTopThreatElements(movesList, movesComplete, 5);
			console.log('[Pathfinder] Top 5 Threat Elements:', topElements);

			// Find strongest inheritable moves for each element using selected move type
			const selectedMoves = window.digimonPathfinder.getStrongestInheritableMoves(topElements, movesComplete, moveType);
			console.log('[Pathfinder] Selected Moves to Beat Threats:', selectedMoves);

			// Get move candidates: all Digimon that can learn each move
			const moveCandidates = selectedMoves.map(moveName => {
				return movesList.filter(row => row.Move?.trim() === moveName).map(row => row.Digimon?.trim());
			});

			// Log moveset and candidates for debugging
			console.log('[Pathfinder] Selected Moveset (5 moves to path towards):', selectedMoves);
			selectedMoves.forEach((move, idx) => {
				console.log(`[Pathfinder] Candidates for move '${move}':`, moveCandidates[idx]);
			});

			// Run combinatorial shortest path algorithm
			const result = window.digimonPathfinder.findShortestPathWithMoveCandidates(start, end, moveCandidates, graph);
			if (result) {
				breakdownDiv.innerHTML = `<div class="notification is-success">Shortest Path: ${result.path.join(' → ')}</div><div>Required Digimons: ${result.digimons.join(', ')}</div>`;
			} else {
				breakdownDiv.innerHTML = `<div class="notification is-danger">No valid path found between selected Digimon and required move learners.<br>Required Digimons: ${moveCandidates.map(cands => cands.join(', ')).join(' | ')}</div>`;
			}
		}).catch(err => {
			console.error('[Pathfinder] Error in CSV load or processing:', err);
			breakdownDiv.innerHTML = `<div class="notification is-danger">Error: ${err.message}</div>`;
		});
	});
});
