// main.js
// Minimal Digimon browser logic

// Utility to fetch and parse a CSV file
function fetchAndParseCSV(path) {
  return fetch(path)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch ' + path);
      return response.text();
    })
    .then(csvText => {
      // PapaParse must be loaded via CDN in main.html
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      // Remove any rows that are duplicate headers
      const headerKeys = Object.keys(parsed.data[0] || {});
      const filteredData = parsed.data.filter(row => {
        // If every value in the row matches a header key, it's a duplicate header
        return !headerKeys.every(key => row[key] === key || row[key] === `"${key}"`);
      });
      return filteredData;
    });
}

window.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('digimonTableContainer');
  if (container) {
    container.innerHTML = `<div class="alert alert-info mt-4">Loading Digimon data...</div>`;
  }
  Promise.all([
  fetchAndParseCSV('Database/digimon_data.csv'),
  fetchAndParseCSV('Database/digimon_evolutions.csv'),
  fetchAndParseCSV('Database/digimon_moves.csv')
  ]).then(([digimonData, digimonEvolutions, digimonMoves]) => {
    renderMainTable(digimonData);
  }).catch(err => {
    if (container) {
      container.innerHTML = `<div class="alert alert-danger mt-4">Error loading CSV files: ${err}</div>`;
    }
  });
});
// Helper to get distinct values for a column
function getDistinctValues(data, col) {
  return [...new Set(data.map(row => row[col]).filter(v => v !== undefined && v !== null && v !== ''))].sort();
}

// Render main table with filter controls in header
function renderMainTable(data) {
  const container = document.getElementById('digimonTableContainer');
  if (!container) return;

  // Initial filter state
  let nameFilter = '';
  let stageFilter = [];
  let attributeFilter = [];
  let typeFilter = [];

  // Create filter controls
  function renderTable() {
    let filtered = data.filter(row => {
      if (nameFilter && !row.Name.toLowerCase().includes(nameFilter)) return false;
      if (stageFilter.length && !stageFilter.includes(row.Stage)) return false;
      if (attributeFilter.length && !attributeFilter.includes(row.Attribute)) return false;
      if (typeFilter.length && !typeFilter.includes(row.Type)) return false;
      return true;
    });

    let html = `<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light">
      <tr>
        <th>Name<br><input type="text" id="filterNameInput" class="form-control" placeholder="Search name"></th>
        <th>Attribute<br><div id="filterAttributeDropdown"></div></th>
        <th>Type<br><div id="filterTypeDropdown"></div></th>
        <th>Stage<br><div id="filterStageDropdown"></div></th>
      </tr>
    </thead><tbody>`;
    filtered.forEach(row => {
      html += `<tr>
        <td>${row.Name}</td>
        <td>${row.Attribute}</td>
        <td>${row.Type}</td>
        <td>${row.Stage}</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Attach filter event listeners
    document.getElementById('filterNameInput').addEventListener('input', function(e) {
      nameFilter = e.target.value.trim().toLowerCase();
      renderTable();
    });

    // Helper to render dropdown checklist
    function renderDropdownChecklist(containerId, values, selected, onChange) {
      const container = document.getElementById(containerId);
      if (!container) return;
      let dropdownHtml = `<div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">Select</button>
        <ul class="dropdown-menu" style="max-height: 250px; overflow-y: auto;">
          ${values.map(v => `<li><label class="dropdown-item"><input type="checkbox" value="${v}" ${selected.includes(v) ? 'checked' : ''}> ${v}</label></li>`).join('')}
        </ul>
      </div>`;
      container.innerHTML = dropdownHtml;
      // Add event listeners for checkboxes
      Array.from(container.querySelectorAll('input[type=checkbox]')).forEach(cb => {
        cb.addEventListener('change', function() {
          const checked = Array.from(container.querySelectorAll('input[type=checkbox]:checked')).map(x => x.value);
          onChange(checked);
        });
      });
    }

    renderDropdownChecklist('filterAttributeDropdown', getDistinctValues(data, 'Attribute'), attributeFilter, function(checked) {
      attributeFilter = checked;
      renderTable();
    });
    renderDropdownChecklist('filterTypeDropdown', getDistinctValues(data, 'Type'), typeFilter, function(checked) {
      typeFilter = checked;
      renderTable();
    });
    renderDropdownChecklist('filterStageDropdown', getDistinctValues(data, 'Stage'), stageFilter, function(checked) {
      stageFilter = checked;
      renderTable();
    });
  }

  renderTable();
}