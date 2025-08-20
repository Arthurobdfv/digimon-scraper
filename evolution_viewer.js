// evolution_viewer.js
// Handles rendering of the Digimon Evolution Viewer tab in test copy.html

let evoDigimonSelect, evoChainContainer;

function setupEvolutionViewer(digimonData, digimonEvolutions) {
  evoDigimonSelect = document.getElementById('evoDigimonSelect');
  evoChainContainer = document.getElementById('evoChainContainer');
  if (!evoDigimonSelect || !evoChainContainer) return;
  evoDigimonSelect.innerHTML = digimonData.map(d => `<option value="${d.Name}">${d.Name}</option>`).join('');
  evoDigimonSelect.onchange = function() {
    renderEvolutionChain(evoDigimonSelect.value, digimonEvolutions);
  };
  if (digimonData.length) renderEvolutionChain(digimonData[0].Name, digimonEvolutions);
}

function renderEvolutionChain(name, digimonEvolutions) {
  let chain = [];
  // Traverse previous forms
  let current = name;
  while (true) {
    const evo = digimonEvolutions.find(e => e.Digimon === current);
    if (evo && evo.PreviousForm) {
      chain.unshift(evo.PreviousForm);
      current = evo.PreviousForm;
    } else break;
  }
  // Add selected Digimon
  chain.push(name);
  // Traverse evolutions
  current = name;
  while (true) {
    const evo = digimonEvolutions.find(e => e.Digimon === current);
    if (evo && evo.EvolvesTo) {
      chain.push(evo.EvolvesTo);
      current = evo.EvolvesTo;
    } else break;
  }
  // Render chain
  let html = '<div class="evo-chain">';
  chain.forEach((dig, idx) => {
    html += `<div class="evo-digimon">${dig}</div>`;
    if (idx < chain.length - 1) html += '<span class="arrow">→</span>';
  });
  html += '</div>';
  evoChainContainer.innerHTML = html;
}
