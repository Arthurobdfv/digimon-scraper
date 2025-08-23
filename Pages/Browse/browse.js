// browse.js
// Digimon browser table implementation

function fetchAndParseCSV(path) {
	return fetch(path)
		.then(response => {
			if (!response.ok) throw new Error('Failed to fetch ' + path);
			return response.text();
		})
		.then(csvText => {
			const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
			// Remove duplicate header rows
			const headerKeys = Object.keys(parsed.data[0] || {});
			return parsed.data.filter(row => !headerKeys.every(key => row[key] === key || row[key] === `"${key}"`));
		});
}

function getDistinctValues(data, col) {
	return [...new Set(data.map(row => row[col]).filter(v => v !== undefined && v !== null && v !== ''))].sort();
}

window.initBrowseTab = function() {
    const container = document.getElementById('digimonTableContainer');
    if (container) {
        container.innerHTML = `<div class="alert alert-info mt-4">Loading Digimon data...</div>`;
    }
    Promise.all([
		fetchAndParseCSV(window.DIGIMON_CSV_PATHS.data),
		fetch(window.DIGIMON_CSV_PATHS?.iconMap).then(r => r.text())
    ]).then(([digimonData, iconCsv]) => {
        // Parse icon map
        const iconMap = {};
        iconCsv.split(/\r?\n/).slice(1).forEach(line => {
			const match = line.match(/^"?(.*?)"?,(.*)$/);
			if (match) {
				let name = match[1].replace(/"/g, '').trim().replace(/[()]/g, '');
				const iconDir = window.DIGIMON_CSV_PATHS.iconDir || '../../Icons/Digimon/';
				iconMap[name] = `${iconDir}${name}-icon.png`;
			}
        });
        setupTable(digimonData, iconMap);
    }).catch(err => {
        if (container) {
            container.innerHTML = `<div class="alert alert-danger mt-4">Error loading Digimon data: ${err}</div>`;
        }
    });
};

function setupTable(data, iconMap) {

		const container = document.getElementById('digimonTableContainer');
		let nameFilter = '';
		let stageFilter = [];
		let attributeFilter = [];
		let typeFilter = [];

		function getUniqueValues(data, col) {
			return [...new Set(data.map(row => row[col]).filter(v => v !== undefined && v !== null && v !== ''))].sort();
		}

		// Render filter UI ONCE
		container.innerHTML = `
			<div class="row mb-3">
				<div class="col-md-3">
					<label class="form-label fw-bold">Name</label>
					<input type="text" id="filterNameInput" class="form-control" placeholder="Search name">
				</div>
				<div class="col-md-3">
					<div id="filterAttributeDropdown"></div>
				</div>
				<div class="col-md-3">
					<div id="filterTypeDropdown"></div>
				</div>
				<div class="col-md-3">
					<div id="filterStageDropdown"></div>
				</div>
			</div>
			<div id="digimonTableWrapper"></div>
		`;

		// Render dropdowns
		function renderDropdownChecklist(containerId, values, selected, label, onChange) {
			const container = document.getElementById(containerId);
			if (!container) return;
			let dropdownHtml = `<label class="form-label fw-bold">${label}</label>
				<div class="dropdown">
					<button class="btn btn-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">Select ${label}</button>
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
						itemCheckboxes.forEach(cb => cb.dispatchEvent(new Event('change')));
					} else {
						itemCheckboxes.forEach(cb => { cb.checked = false; });
						itemCheckboxes.forEach(cb => cb.dispatchEvent(new Event('change')));
					}
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

		// Only update table body
		function renderTableBody() {
			let filtered = data.filter(row => {
				let rowName = (row.Name || '').replace(/"/g, '').trim();
				if (nameFilter && !rowName.toLowerCase().includes(nameFilter)) return false;
				if (stageFilter.length && !stageFilter.includes(row.Stage)) return false;
				if (attributeFilter.length && !attributeFilter.includes(row.Attribute)) return false;
				if (typeFilter.length && !typeFilter.includes(row.Type)) return false;
				return true;
			});
			let html = '<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light">';
			html += '<tr>';
			html += '<th>Icon</th>';
			html += '<th>Name</th>';
			html += '<th>Attribute</th>';
			html += '<th>Type</th>';
			html += '<th>Stage</th>';
			html += '</tr></thead><tbody>';
			filtered.forEach((row, idx) => {
				if (idx === 0 && Object.values(row).some(v => v === 'Name' || v === 'Stage' || v === 'Attribute' || v === 'Type')) return;
				let rowName = (row.Name || '').replace(/"/g, '').trim().replace(/[()]/g, '');
				const iconPath = iconMap[rowName] || '';
				html += '<tr>';
				html += (iconPath ? `<td><img src="${iconPath}" class="icon-img" alt="icon"></td>` : '<td></td>');
				html += `<td><a href="#" class="digimon-details-link" data-name="${rowName}">${rowName}</a></td>`;
				html += `<td>${row.Attribute}</td>`;
				html += `<td>${row.Type}</td>`;
				html += `<td>${row.Stage}</td>`;
				html += '</tr>';
			});
			html += '</tbody></table></div>';
			document.getElementById('digimonTableWrapper').innerHTML = html;

			// Add SPA navigation for details links
			setTimeout(() => {
				Array.from(document.getElementsByClassName('digimon-details-link')).forEach(link => {
					link.addEventListener('click', function(e) {
						e.preventDefault();
						if (window.loadTab) {
							window.selectedDigimonName = this.getAttribute('data-name');
							window.loadTab('details');
						}
					});
				});
			}, 0);
		}

		// Initial dropdowns
		renderDropdownChecklist('filterAttributeDropdown', getUniqueValues(data, 'Attribute'), getUniqueValues(data, 'Attribute'), 'Attribute', function(checked) {
			attributeFilter = checked;
			renderTableBody();
		});
		renderDropdownChecklist('filterTypeDropdown', getUniqueValues(data, 'Type'), getUniqueValues(data, 'Type'), 'Type', function(checked) {
			typeFilter = checked;
			renderTableBody();
		});
		renderDropdownChecklist('filterStageDropdown', getUniqueValues(data, 'Stage'), getUniqueValues(data, 'Stage'), 'Stage', function(checked) {
			stageFilter = checked;
			renderTableBody();
		});

		// Name filter
		document.getElementById('filterNameInput').addEventListener('input', function(e) {
			nameFilter = e.target.value.trim().toLowerCase();
			renderTableBody();
		});

		// Initial table render
		renderTableBody();
	}



