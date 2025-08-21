// Evolution Path tab SPA logic
// Requires PapaParse and findOptimalMovePath (from getDigimonsForMove.js)
window.initEvolutionpathTab = function () {
  // ...existing code...
  console.log('[EvolutionPath] initEvolutionpathTab called');
  const digimonInput1 = document.getElementById('startDigimon');
  const digimonInput2 = document.getElementById('finalDigimon');
  const dropdown1 = document.getElementById('startDigimonDropdown');
  const dropdown2 = document.getElementById('finalDigimonDropdown');
  const calcBtn = document.getElementById('calcPathBtn');
  const resultContainer = document.getElementById('pathfinder-results');
  const moveInput = document.getElementById('moveSelectInput');
  const moveDropdown = document.getElementById('moveSelectDropdown');
  const selectedMovesDiv = document.getElementById('selectedMoves');
  let allMoves = [];
  let selectedMoves = [];

  if (!resultContainer) {
    console.error('[EvolutionPath] ERROR: #pathfinder-results not found in DOM when initializing tab.');
    if (calcBtn) {
      calcBtn.disabled = true;
      calcBtn.title = 'Error: #pathfinder-results not found.';
    }
    return;
  }

  Promise.all([
    fetch('data/digimon_data.csv').then(r => {
      if (!r.ok) throw new Error('Failed to fetch digimon_data.csv');
      return r.text();
    }),
    fetch('data/digimon_icon_map.csv').then(r => {
      if (!r.ok) throw new Error('Failed to fetch digimon_icon_map.csv');
      return r.text();
    }),
    fetch('data/digimon_moves_complete.csv').then(r => {
      if (!r.ok) throw new Error('Failed to fetch digimon_moves_complete.csv');
      return r.text();
    })
  ]).then(([dataCsv, iconCsv, movesCsvText]) => {
    console.log('[EvolutionPath] digimon_data.csv loaded:', dataCsv.length);
    console.log('[EvolutionPath] digimon_icon_map.csv loaded:', iconCsv.length);
    console.log('[EvolutionPath] digimon_moves_complete.csv loaded:', movesCsvText.length);
    // Digimon dropdowns
    const dataResults = Papa.parse(dataCsv, { header: true }).data;
    const iconResults = Papa.parse(iconCsv, { header: true }).data;
    console.log('[EvolutionPath] Parsed digimon_data.csv:', dataResults);
    console.log('[EvolutionPath] Parsed digimon_icon_map.csv:', iconResults);
    const iconMap = {};
    iconResults.forEach(row => {
      if (row.Name && row.Icon) {
        iconMap[row.Name.replace(/^"|"$/g, '')] = `Icons/Digimon/${row.Icon.replace(/^"|"$/g, '')}`;
      }
    });
    const names = dataResults
      .map(row => row['Name'])
      .filter(name => name && name !== 'Name' && name !== '"Name"')
      .map(name => name.replace(/^"|"$/g, ''))
      .sort();
    console.log('[EvolutionPath] Digimon names for dropdown:', names);
    if (names.length === 0) {
      // ...existing code...
    }

    // Move Optimize Moves logic here, after moveInput etc. are initialized
    const optimizeMovesCheckbox = document.getElementById('optimizeMovesCheckbox');
    const topThreadsInput = document.getElementById('topThreadsInput');
    function updateFieldStates() {
      if (optimizeMovesCheckbox && optimizeMovesCheckbox.checked) {
        moveInput.disabled = true;
        moveDropdown.classList.add('disabled');
        selectedMovesDiv.classList.add('disabled');
        topThreadsInput.disabled = false;
      } else {
        moveInput.disabled = false;
        moveDropdown.classList.remove('disabled');
        selectedMovesDiv.classList.remove('disabled');
        topThreadsInput.disabled = true;
      }
    }
    if (optimizeMovesCheckbox) {
      optimizeMovesCheckbox.addEventListener('change', updateFieldStates);
      updateFieldStates();
    }
    if (names.length === 0) {
      resultContainer.innerHTML = '<div class="alert alert-danger">No Digimon found. Check digimon_data.csv.</div>';
      return;
    }
    function renderDropdown(input, dropdown, names) {
      dropdown.innerHTML = names.map(name => {
        const icon = iconMap[name] ? `<img src="${iconMap[name]}" alt="icon" style="width:24px;height:24px;margin-right:8px;vertical-align:middle;">` : '';
        return `<li><a href="#" class="dropdown-item digimon-option" data-value="${name}">${icon}${name}</a></li>`;
      }).join('');
    }
    function setupFilter(input, dropdown, names) {
      input.addEventListener('input', function() {
        const val = input.value.toLowerCase();
        const filtered = names.filter(name => name.toLowerCase().includes(val));
        renderDropdown(input, dropdown, filtered);
        dropdown.classList.add('show');
      });
      input.addEventListener('focus', function() {
        renderDropdown(input, dropdown, names);
        dropdown.classList.add('show');
      });
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && e.target !== input) {
          dropdown.classList.remove('show');
        }
      });
      dropdown.addEventListener('click', function(e) {
        if (e.target.classList.contains('digimon-option')) {
          input.value = e.target.getAttribute('data-value');
          dropdown.classList.remove('show');
        }
      });
    }
    setupFilter(digimonInput1, dropdown1, names);
    setupFilter(digimonInput2, dropdown2, names);
    // Moves dropdown
    const movesData = Papa.parse(movesCsvText, { header: true }).data;
    allMoves = movesData.map(row => row.Move).filter(m => m && m !== 'Move');
    console.log('[EvolutionPath] Moves for dropdown:', allMoves);
    function renderMoveDropdown(moves) {
      moveDropdown.innerHTML = moves.map(move => `<li><a href="#" class="dropdown-item move-option" data-value="${move}">${move}</a></li>`).join('');
    }
    function updateSelectedMoves() {
      selectedMovesDiv.innerHTML = selectedMoves.length
        ? `<span class="badge bg-primary">${selectedMoves.join('</span> <span class="badge bg-primary">')}</span>`
        : '<span class="text-muted">No moves selected.</span>';
    }
    moveInput.addEventListener('input', function() {
      const val = moveInput.value.toLowerCase();
      const filtered = allMoves.filter(move => move.toLowerCase().includes(val));
      renderMoveDropdown(filtered);
      moveDropdown.classList.add('show');
    });
    moveInput.addEventListener('focus', function() {
      renderMoveDropdown(allMoves);
      moveDropdown.classList.add('show');
    });
    document.addEventListener('click', function(e) {
      if (!moveDropdown.contains(e.target) && e.target !== moveInput) {
        moveDropdown.classList.remove('show');
      }
    });
    moveDropdown.addEventListener('click', function(e) {
      if (e.target.classList.contains('move-option')) {
        const move = e.target.getAttribute('data-value');
        if (!selectedMoves.includes(move)) {
          selectedMoves.push(move);
          updateSelectedMoves();
        }
        moveInput.value = '';
        moveDropdown.classList.remove('show');
      }
    });
    selectedMovesDiv.addEventListener('click', function(e) {
      if (e.target.classList.contains('badge')) {
        const move = e.target.textContent;
        selectedMoves = selectedMoves.filter(m => m !== move);
        updateSelectedMoves();
      }
    });
    updateSelectedMoves();
    // Calculate button
    calcBtn.onclick = function () {
      const start = digimonInput1.value;
      const end = digimonInput2.value;
      let movesToUse = selectedMoves.slice();
      if (!start || !end) {
        resultContainer.innerHTML = '<div class="alert alert-warning">Please select two Digimon.';
        return;
      }
      function runPathfindingWithMoves(movesToUse) {
          if (!movesToUse || movesToUse.length === 0) {
            resultContainer.innerHTML = optimizeMovesCheckbox && optimizeMovesCheckbox.checked
              ? '<div class="alert alert-warning">Threat analysis did not return any moves.'
              : '<div class="alert alert-warning">Please select at least one move.';
            return;
          }
          // Always wrap each move in its own array for pathfinding compatibility
          const moveGroups = movesToUse.map(m => Array.isArray(m) ? m : [m]);
          resultContainer.innerHTML = '<div class="alert alert-info">Calculating path and movesets...';
          Promise.all([
            fetch('data/digimon_evolutions.csv').then(r => r.text()),
            fetch('data/digimon_moves.csv').then(r => r.text())
          ]).then(([evoText, movesCsvText]) => {
            const evolutionsCsv = Papa.parse(evoText, { header: true }).data;
            const movesCsv = Papa.parse(movesCsvText, { header: true }).data;
            // Build the evolution graph and digimon groups for each move
            const digimonEvolutionGraph = window.buildDigimonEvolutionGraph(evolutionsCsv);
            const moveDigimonGroups = window.getDigimonsForMove(movesToUse, movesCsv).map(obj => obj.digimons);
            // Use new multi-path search with Node.js parameter order
            const path = window.findShortestPathWithDebugAndMaxQueue(
              digimonEvolutionGraph,
              start,
              end,
              moveDigimonGroups,
              window.pathfinderDebugLog || (() => {}),
              200000 // maxQueueSize
            );
            let html = '';
            if (path && path.length) {
              // Build a map: Digimon -> [{move, level, description}]
              const moveLearnerMap = {};
              movesToUse.forEach(moveName => {
                // Find all rows in movesCsv for this move
                movesCsv.filter(row => row.Move === moveName && row.Digimon && row.Level)
                  .forEach(row => {
                    if (!moveLearnerMap[row.Digimon]) moveLearnerMap[row.Digimon] = [];
                    // Get move description from movesComplete
                    const moveInfo = movesData.find(m => m.Move === moveName) || {};
                    moveLearnerMap[row.Digimon].push({
                      move: moveName,
                      level: row.Level,
                      description: moveInfo.Type ? `${moveInfo.Type}, ${moveInfo.Attribute}, Power: ${moveInfo.Power}, SP: ${moveInfo['SP Cost']}` : ''
                    });
                  });
              });
              html += `<h4>Shortest Evolution Path</h4><ol>`;
              path.forEach(d => {
                let extra = '';
                if (moveLearnerMap[d]) {
                  extra = moveLearnerMap[d].map(info => {
                    // Find move details from movesData (movesComplete)
                    const moveDetails = movesData.find(m => m.Move === info.move) || {};
                    // Get element icon
                    let elementIcon = '';
                    if (moveDetails.Attribute) {
                      const attr = moveDetails.Attribute.trim().toLowerCase();
                      // Map attribute to icon filename (assume lowercase, e.g. 'fire' => 'fire-icon.png')
                      elementIcon = `<img src='Icons/Moves/${attr}-icon.png' alt='${attr}' style='width:18px;height:18px;vertical-align:middle;margin-right:2px;'>`;
                    }
                    // Format: link, level, element icon, type, power
                    return `<a href="#" class="skill-details-link" data-skill="${encodeURIComponent(info.move)}">${info.move}</a> - Level ${info.level}, ${elementIcon}${moveDetails.Type || ''}, Power ${moveDetails.Power || ''}`;
                  }).join('<br>');
                }
                html += `<li>${d}${extra ? `<br><span class='move-learner'>${extra}</span>` : ''}</li>`;
              });
              html += '</ol>';
              html += `<h4>Moves Required</h4><ul>`;
              movesToUse.forEach(moveName => {
                // Find move details from movesData (movesComplete)
                const moveDetails = movesData.find(m => m.Move === (Array.isArray(moveName) ? moveName[0] : moveName)) || {};
                let elementIcon = '';
                if (moveDetails.Attribute) {
                  const attr = moveDetails.Attribute.trim().toLowerCase();
                  elementIcon = `<img src='Icons/Moves/${attr}-icon.png' alt='${attr}' style='width:18px;height:18px;vertical-align:middle;margin-right:2px;'>`;
                }
                const moveDisplayName = Array.isArray(moveName) ? moveName.join(', ') : moveName;
                html += `<li>${elementIcon}<a href="#" class="skill-details-link" data-skill="${encodeURIComponent(moveDisplayName)}">${moveDisplayName}</a> - ${moveDetails.Type || ''}, Power ${moveDetails.Power || ''}</li>`;
              });
              html += '</ul>';
            } else {
              html += '<div class="alert alert-danger">No valid path found for selected Digimon and moves.';
            }
            resultContainer.innerHTML = html;
            // Add event listeners for skill-details-link to switch tab and load skill
            setTimeout(() => {
              Array.from(document.getElementsByClassName('skill-details-link')).forEach(link => {
                link.addEventListener('click', function(e) {
                  e.preventDefault();
                  const skillName = decodeURIComponent(this.getAttribute('data-skill'));
                  window.location.hash = `#skillinfo?name=${encodeURIComponent(skillName)}`;
                  if (window.loadTab) {
                    window.loadTab('skillinfo', { skillName });
                  }
                });
              });
            }, 0);
          }).catch(err => {
            resultContainer.innerHTML = `<div class="alert alert-danger">Error: ${err.message}`;
            console.error('[Pathfinder] Error:', err);
          });
        }
      if (optimizeMovesCheckbox && optimizeMovesCheckbox.checked) {
        let topN = 5;
        if (topThreadsInput && !isNaN(topThreadsInput.value)) {
          topN = Math.max(1, Math.min(8, parseInt(topThreadsInput.value)));
        }
        // Gather all relevant user inputs into selection object
        const optimizeMovesCheckbox = document.getElementById('optimizeMovesCheckbox');
        const useThreatAnalysis = !!optimizeMovesCheckbox?.checked;
        const selection = {
          initialDigimon: digimonInput1.value,
          finalDigimon: digimonInput2.value,
          moves: selectedMoves.slice(),
          type: document.getElementById('moveType')?.value || '',
          optimizeMoves: useThreatAnalysis,
          topThreads: parseInt(document.getElementById('topThreadsInput')?.value) || 5,
          useThreatAnalysis
        };
        // Use modular threatAnalysis.js for Threat Analysis
        console.log('[EvolutionPath] UI input:', {
          initialDigimon: selection.initialDigimon,
          finalDigimon: selection.finalDigimon,
          movesToUse,
          useThreatAnalysis,
          topN,
          moveType: selection.type
        });
        if (useThreatAnalysis) {
          window.getMovesFromThreatAnalysis(selection.initialDigimon, selection.finalDigimon, topN).then(moves => {
            console.log('[EvolutionPath] Threat Analysis moves:', moves);
            runPathfindingWithMoves(moves);
          });
        } else {
          runPathfindingWithMoves(movesToUse);
        }
      } else {
        runPathfindingWithMoves(movesToUse);
      }
    };
      // Download JSON button
      const downloadBtn = document.getElementById('downloadJsonBtn');
      if (downloadBtn) {
        downloadBtn.onclick = function () {
          const optimizeMovesCheckbox = document.getElementById('optimizeMovesCheckbox');
          const topThreadsInput = document.getElementById('topThreadsInput');
          const selection = {
            initialDigimon: digimonInput1.value,
            finalDigimon: digimonInput2.value,
            moves: selectedMoves.slice(),
            type: document.getElementById('moveType')?.value || '',
            optimizeMoves: optimizeMovesCheckbox ? !!optimizeMovesCheckbox.checked : false,
            topThreads: topThreadsInput ? parseInt(topThreadsInput.value) || 5 : 5
          };
          const jsonStr = JSON.stringify(selection, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'digimon_path_selection.json';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        };
      }
  }).catch(err => {
    console.error('[EvolutionPath] ERROR loading CSVs:', err);
    resultContainer.innerHTML = `<div class="alert alert-danger">Error loading Digimon data: ${err.message}</div>`;
  });
};

// Global method: Accepts a JSON file and runs pathfinding for validation
window.runPathfindingFromJsonFile = function (file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const selection = JSON.parse(e.target.result);
      // Fetch required CSVs
      Promise.all([
  fetch('data/digimon_evolutions.csv').then(r => r.text()),
  fetch('data/digimon_moves.csv').then(r => r.text())
      ]).then(([evoText, movesCsvText]) => {
        const evolutionsCsv = Papa.parse(evoText, { header: true }).data;
        const movesCsv = Papa.parse(movesCsvText, { header: true }).data;
        let movesToUse = selection.moves || [];
        console.log('[EvolutionPath] JSON input:', {
          initialDigimon: selection.initialDigimon,
          finalDigimon: selection.finalDigimon,
          movesToUse,
          optimizeMoves: selection.optimizeMoves,
          topN: selection.topThreads || 5,
          moveType: selection.type || null
        });
        if (selection.optimizeMoves) {
          let topN = selection.topThreads || 5;
          topN = Math.max(1, Math.min(8, topN));
          if (typeof window.getMovesFromThreatAnalysis === 'function') {
            window.getMovesFromThreatAnalysis(selection.initialDigimon, selection.finalDigimon, topN).then(moves => {
              console.log('[EvolutionPath] Threat Analysis moves (JSON):', moves);
                // Always wrap each move in its own array for pathfinding compatibility
                const moveGroups = moves.map(m => Array.isArray(m) ? m : [m]);
                // Build the evolution graph and digimon groups for each move
                const digimonEvolutionGraph = window.buildDigimonEvolutionGraph(evolutionsCsv);
                const moveDigimonGroups = window.getDigimonsForMove(movesToUse, movesCsv).map(obj => obj.digimons);
                // Use new multi-path search with Node.js parameter order
                const path = window.findShortestPathWithDebugAndMaxQueue(
                  digimonEvolutionGraph,
                  selection.initialDigimon,
                  selection.finalDigimon,
                  moveDigimonGroups,
                  window.pathfinderDebugLog || (() => {}),
                  200000 // maxQueueSize
                );
                callback(path);
            });
            return; // Prevent running pathfinding before moves are ready
          } else {
            movesToUse = [];
          }
        }
          // Always wrap each move in its own array for pathfinding compatibility
          const moveGroups = movesToUse.map(m => Array.isArray(m) ? m : [m]);
          // Build the evolution graph and digimon groups for each move
          const digimonEvolutionGraph = window.buildDigimonEvolutionGraph(evolutionsCsv);
          const moveDigimonGroups = window.getDigimonsForMove(movesToUse, movesCsv).map(obj => obj.digimons);
          // Use new multi-path search with Node.js parameter order
          const path = window.findShortestPathWithDebugAndMaxQueue(
            digimonEvolutionGraph,
            selection.initialDigimon,
            selection.finalDigimon,
            moveDigimonGroups,
            window.pathfinderDebugLog || (() => {}),
            200000 // maxQueueSize
          );
          callback(path);
      }).catch(err => {
        if (callback) callback(null, selection, err);
      });
    } catch (err) {
      if (callback) callback(null, null, err);
    }
  };
  reader.readAsText(file);
};

// Global method: Returns moves for Threat Analysis using top elements and strongest inheritable moves
window.getMovesFromThreatAnalysis = function(initialDigimon, finalDigimon, topN = 5) {
  // Load moves CSVs synchronously (must be async in UI, so return Promise)
  return Promise.all([
  fetch('data/digimon_moves.csv').then(r => r.text()),
  fetch('data/digimon_moves_complete.csv').then(r => r.text())
  ]).then(([movesCsvText, movesCompleteCsvText]) => {
    const movesList = Papa.parse(movesCsvText, { header: true }).data;
    const movesComplete = Papa.parse(movesCompleteCsvText, { header: true }).data;
    console.log('[ThreatAnalysis] Raw movesList:', movesList);
    console.log('[ThreatAnalysis] Raw movesComplete:', movesComplete);
    if (window.getTopThreatElements && window.getStrongestInheritableMoves) {
      const topElements = window.getTopThreatElements(movesList, movesComplete, topN);
      console.log('[ThreatAnalysis] Top elements (from getMovesFromThreatAnalysis):', topElements);
      // Use moveType from UI if available, trimmed and lowercased
      let moveType = document.getElementById('moveType')?.value || null;
      if (moveType) moveType = moveType.trim().toLowerCase();
      return window.getStrongestInheritableMoves(topElements, movesComplete, moveType);
    }
    return [];
  });
};
