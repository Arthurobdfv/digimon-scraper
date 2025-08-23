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
                let name = match[1].replace(/"/g, '').trim();
                // Use the name as-is for the local icon filename, just add -icon.png
                 iconMap[name] = `../../Icons/Digimon/${name}-icon.png`;
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

	function renderTable() {
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
		html += '<th>Name<br><input type="text" id="filterNameInput" class="form-control" placeholder="Search name"></th>';
		html += '<th>Attribute<br><div id="filterAttributeDropdown"></div></th>';
		html += '<th>Type<br><div id="filterTypeDropdown"></div></th>';
		html += '<th>Stage<br><div id="filterStageDropdown"></div></th>';
		html += '</tr></thead><tbody>';
		filtered.forEach((row, idx) => {
			// Skip the first row if it looks like a header
			if (idx === 0 && Object.values(row).some(v => v === 'Name' || v === 'Stage' || v === 'Attribute' || v === 'Type')) return;
			let rowName = (row.Name || '').replace(/"/g, '').trim();
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
		container.innerHTML = html;
	}

	renderTable();

    // After rendering table, add SPA navigation for details links
    setTimeout(() => {
        Array.from(document.getElementsByClassName('digimon-details-link')).forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (window.loadTab) {
                    // Set digimon name in a global variable for SPA details
                    window.selectedDigimonName = this.getAttribute('data-name');
                    window.loadTab('details');
                }
            });
        });
    }, 0);
}



