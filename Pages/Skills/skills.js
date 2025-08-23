// Moved from root: skills.js
// Digimon Skills Table Logic
// Loads digimon_moves_complete.csv and renders a filterable table

window.initSkillsTab = function () {
  const csvFile = 'Database/digimon_moves_complete.csv';
  const tableContainer = document.getElementById('skillsTableContainer');
  const filtersContainer = document.getElementById('skillFilters');

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

  function getUniqueValues(data, col) {
    return [...new Set(data.map(row => row[col]))].sort();
  }

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

    itemCheckboxes.forEach(cb => {
      cb.addEventListener('change', function() {
        const checked = itemCheckboxes.filter(x => x.checked).map(x => x.value);
        if (allCheckbox) {
          allCheckbox.checked = checked.length === values.length;
        }
        onChange(checked);
      });
    });
  }

  function renderFilters(data) {
    filtersContainer.innerHTML = '';
    const moveDiv = document.createElement('div');
    moveDiv.className = 'col-auto mb-2';
    moveDiv.innerHTML = `<label class="form-label fw-bold">Move</label>
      <input type="text" class="form-control" id="filter-Move" placeholder="Search move name...">`;
    filtersContainer.appendChild(moveDiv);

    ['Attribute', 'Type', 'Inheritable'].forEach(col => {
      const values = getUniqueValues(data, col);
      const filterDiv = document.createElement('div');
      filterDiv.className = 'col-auto mb-2';
      filterDiv.id = `filter-${col}-container`;
      filtersContainer.appendChild(filterDiv);
      renderDropdownChecklist(filterDiv.id, values, values, col, function(checked) {
        filters[col] = checked;
        const selections = getFilterSelections();
        const filtered = filterData(allData, selections);
        renderTable(filtered);
      });
    });
  }

  function getFilterSelections() {
    const selections = {};
    selections['Move'] = document.getElementById('filter-Move')?.value?.toLowerCase() || '';
    ['Attribute', 'Type', 'Inheritable'].forEach(col => {
      selections[col] = filters[col] || [];
    });
    return selections;
  }

  function filterData(data, selections) {
    return data.filter(row => {
      if (selections['Move'] && !row['Move'].toLowerCase().includes(selections['Move'])) return false;
      for (let col of ['Attribute', 'Type', 'Inheritable']) {
        if (selections[col].length && !selections[col].includes(row[col])) return false;
      }
      return true;
    });
  }

  function renderTable(data) {
    let html = `<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light">
      <tr><th>Icon</th><th>Move</th><th>Attribute</th><th>Type</th><th>SP Cost</th><th>Power</th><th>Inheritable</th></tr>
    </thead><tbody>`;
    data.forEach(row => {
      html += `<tr>
  <td>${row['Icon'] ? `<img src="${encodeURIComponent(row['Icon'])}" class="icon-img" alt="icon">` : ''}</td>
        <td><a href="#" class="skill-details-link" data-skill="${row['Move']}">${row['Move']}</a></td>
        <td>${row['Attribute']}</td>
        <td>${row['Type']}</td>
        <td>${row['SP Cost']}</td>
        <td>${row['Power']}</td>
        <td>${row['Inheritable']}</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
    tableContainer.innerHTML = html;

    setTimeout(() => {
      Array.from(document.getElementsByClassName('skill-details-link')).forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          if (window.loadTab) {
            window.selectedSkillName = this.getAttribute('data-skill');
            window.loadTab('skillinfo');
          }
        });
      });
    }, 0);
  }

  Papa.parse(csvFile, {
    header: true,
    download: true,
    complete: function (results) {
      allData = results.data;
      filters['Attribute'] = getUniqueValues(allData, 'Attribute');
      filters['Type'] = getUniqueValues(allData, 'Type');
      filters['Inheritable'] = getUniqueValues(allData, 'Inheritable');
      renderFilters(allData);
      renderTable(allData);
      document.getElementById('filter-Move').addEventListener('input', function() {
        const selections = getFilterSelections();
        const filtered = filterData(allData, selections);
        renderTable(filtered);
      });
    }
  });
};
