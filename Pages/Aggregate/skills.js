// Digimon Skills Table Logic
// Loads digimon_moves_complete.csv and renders a filterable table

document.addEventListener('DOMContentLoaded', function () {
  const csvFile = window.DIGIMON_CSV_PATHS.movesComplete;
  const tableContainer = document.getElementById('skillsTableContainer');
  const filtersContainer = document.getElementById('skillFilters');

  // Columns to filter (Icon is not filterable)
  const iconColumn = 'Icon';
  // Define filter types for each column
  const filterConfig = {
    'Move': 'text',
    'Attribute': 'multi',
    'Type': 'multi',
    'SP Cost': null,
    'Power': null,
    'Inheritable': 'multi'
  };

  let allData = [];
  let filters = {};

  // Helper to get unique values for a column
  function getUniqueValues(data, col) {
    return [...new Set(data.map(row => row[col]))].sort();
  }

  // Render dropdown checklist filters (Bootstrap style)
  function renderDropdownChecklist(containerId, values, selected, label, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let dropdownHtml = `<label class="form-label fw-bold">${label}</label>
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">Select</button>
        <ul class="dropdown-menu" style="max-height: 250px; overflow-y: auto;">
          <li><label class="dropdown-item"><input type="checkbox" value="__ALL__" ${selected.length === values.length ? 'checked' : ''}> <strong>All</strong></label></li>
          ${values.map(v => `<li><label class="dropdown-item"><input type="checkbox" value="${v}" ${selected.includes(v) ? 'checked' : ''}> ${v}</label></li>`).join('')}
        </ul>
      </div>`;
    container.innerHTML = dropdownHtml;

    const allCheckbox = container.querySelector('input[value="__ALL__"]');
    const itemCheckboxes = Array.from(container.querySelectorAll('input[type=checkbox]')).filter(cb => cb.value !== '__ALL__');

    // Handle 'All' checkbox
    if (allCheckbox) {
      allCheckbox.addEventListener('change', function() {
        if (allCheckbox.checked) {
          itemCheckboxes.forEach(cb => { cb.checked = true; });
        } else {
          itemCheckboxes.forEach(cb => { cb.checked = false; });
        }
        const checked = allCheckbox.checked ? values.slice() : [];
        onChange(checked);
      });
    }

    // Handle individual checkboxes
    itemCheckboxes.forEach(cb => {
      cb.addEventListener('change', function() {
        const checked = itemCheckboxes.filter(x => x.checked).map(x => x.value);
        // Update 'All' checkbox state
        if (allCheckbox) {
          allCheckbox.checked = checked.length === values.length;
        }
        onChange(checked);
      });
    });
  }

  // Render all filters
  function renderFilters(data) {
    filtersContainer.innerHTML = '';
    // Move text input
    const moveDiv = document.createElement('div');
    moveDiv.className = 'col-auto mb-2';
    moveDiv.innerHTML = `<label class="form-label fw-bold">Move</label>
      <input type="text" class="form-control" id="filter-Move" placeholder="Search move name...">`;
    filtersContainer.appendChild(moveDiv);

    // Multi-select dropdowns
    ['Attribute', 'Type', 'Inheritable'].forEach(col => {
      const values = getUniqueValues(data, col);
      const filterDiv = document.createElement('div');
      filterDiv.className = 'col-auto mb-2';
      filterDiv.id = `filter-${col}-container`;
      filtersContainer.appendChild(filterDiv);
      // Initial selection: all checked
      renderDropdownChecklist(filterDiv.id, values, values, col, function(checked) {
        filters[col] = checked;
        const selections = getFilterSelections();
        const filtered = filterData(allData, selections);
        renderTable(filtered);
      });
    });
  }

  // Get current filter selections
  function getFilterSelections() {
    const selections = {};
    // Move text input
    const moveInput = document.getElementById('filter-Move');
    selections['Move'] = moveInput ? moveInput.value.trim().toLowerCase() : '';
    // Multi-select dropdowns
    ['Attribute', 'Type', 'Inheritable'].forEach(col => {
      selections[col] = filters[col] || getUniqueValues(allData, col);
    });
    return selections;
  }

  // Filter data based on selections
  function filterData(data, selections) {
    return data.filter(row => {
      // Move: text search
      if (filterConfig['Move'] === 'text' && selections['Move']) {
        if (!row['Move'] || !row['Move'].toLowerCase().includes(selections['Move'])) return false;
      }
      // Attribute, Type, Inheritable: multi-select
      for (const col of ['Attribute', 'Type', 'Inheritable']) {
        if (filterConfig[col] === 'multi' && selections[col] && selections[col].length > 0) {
          if (!selections[col].includes(row[col])) return false;
        }
      }
      return true;
    });
  }

  // Render the skills table
  function renderTable(data) {
    const columns = [iconColumn, 'Move', 'Attribute', 'Type', 'SP Cost', 'Power', 'Inheritable'];
    let html = `<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light">
      <tr>
        <th>Icon</th>
        <th>Move</th>
        <th>Attribute</th>
        <th>Type</th>
        <th>SP Cost</th>
        <th>Power</th>
        <th>Inheritable</th>
      </tr>
    </thead><tbody>`;
    if (!data.length) {
      html += `<tr><td colspan="7" class="text-center">No skills match the selected filters.</td></tr>`;
    } else {
      data.forEach(row => {
          html += `<tr>
            <td><img src="${row[iconColumn]}" class="icon-img" alt="icon"></td>
            <td><a href="../Pages/SkillInfo/skillinfo.html?name=${encodeURIComponent(row['Move'])}">${row['Move']}</a></td>
          <td>${row['Attribute']}</td>
          <td>${row['Type']}</td>
          <td>${row['SP Cost']}</td>
          <td>${row['Power']}</td>
          <td>${row['Inheritable']}</td>
        </tr>`;
      });
    }
    html += '</tbody></table></div>';
    tableContainer.innerHTML = html;
  }

  // Attach filter change listeners
  function attachFilterListeners() {
    // Move text input
    const moveInput = document.getElementById('filter-Move');
    if (moveInput) {
      moveInput.addEventListener('input', () => {
        const selections = getFilterSelections();
        const filtered = filterData(allData, selections);
        renderTable(filtered);
      });
    }
    // Multi-select dropdowns are handled in renderDropdownChecklist
  }

  // Load CSV and initialize
  Papa.parse(csvFile, {
    header: true,
    download: true,
    complete: function (results) {
      allData = results.data;
      renderFilters(allData);
      renderTable(allData);
      attachFilterListeners();
    }
  });
});
