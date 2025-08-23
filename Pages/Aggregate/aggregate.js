// aggregate.js
// Digimon data aggregation logic

function fetchAndParseCSV(path) {
	return fetch(path)
		.then(response => {
			if (!response.ok) throw new Error('Failed to fetch ' + path);
			return response.text();
		})
		.then(csvText => {
			const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
			// Remove any rows that are duplicate headers
			const headerKeys = Object.keys(parsed.data[0] || {});
			const filteredData = parsed.data.filter(row => {
				return !headerKeys.every(key => row[key] === key || row[key] === `"${key}"`);
			});
			return filteredData;
		});
}

window.initAggregateTab = function() {
    fetchAndParseCSV(window.DIGIMON_CSV_PATHS?.data ? '../../' + window.DIGIMON_CSV_PATHS.data : '../../Database/digimon_data.csv').then(digimonData => {
        const columns = Object.keys(digimonData[0] || {});
        const primarySelect = document.getElementById('primaryColumn');
        const secondarySelect = document.getElementById('secondaryColumn');
        // Populate dropdowns
        primarySelect.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
        secondarySelect.innerHTML = '<option value="">None</option>' + columns.map(col => `<option value="${col}">${col}</option>`).join('');

        function renderAggregateTable() {
            const primary = primarySelect.value;
            const secondary = secondarySelect.value;
            let grouped = {};
            digimonData.forEach(row => {
                const key1 = row[primary] || '';
                const key2 = secondary ? row[secondary] || '' : null;
                if (!grouped[key1]) grouped[key1] = {};
                if (secondary) {
                    if (!grouped[key1][key2]) grouped[key1][key2] = 0;
                    grouped[key1][key2]++;
                } else {
                    if (!grouped[key1]['count']) grouped[key1]['count'] = 0;
                    grouped[key1]['count']++;
                }
            });
            let html = '<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light"><tr>';
            html += `<th>${primary}</th>`;
            if (secondary) html += `<th>${secondary}</th>`;
            html += '<th>Count</th></tr></thead><tbody>';
            Object.entries(grouped).forEach(([key1, sub]) => {
                if (secondary) {
                    Object.entries(sub).forEach(([key2, count]) => {
                        html += `<tr><td>${key1}</td><td>${key2}</td><td>${count}</td></tr>`;
                    });
                } else {
                    html += `<tr><td>${key1}</td><td>${sub['count']}</td></tr>`;
                }
            });
            html += '</tbody></table></div>';
            document.getElementById('aggregateTableContainer').innerHTML = html;
        }

        primarySelect.addEventListener('change', renderAggregateTable);
        secondarySelect.addEventListener('change', renderAggregateTable);
        renderAggregateTable();
    }).catch(err => {
        document.getElementById('aggregateTableContainer').innerHTML = `<div class="alert alert-danger mt-4">Error loading CSV file: ${err}</div>`;
    });
};
