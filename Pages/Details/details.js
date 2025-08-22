// details.js
// Digimon details, evolutions, and navigation

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

function renderDigimonDetails(digimonName, digimonData, evolutionsData) {
	const container = document.getElementById('digimonDetailsContainer');
	if (!container) return;
	const digimon = digimonData.find(d => d.Name === digimonName);
	if (!digimon) {
		container.innerHTML = `<div class="alert alert-warning mt-4">Digimon not found: ${digimonName}</div>`;
		return;
	}
	// Load icon map from CSV
	fetch('data/digimon_icon_map.csv').then(r => r.text()).then(csvText => {
		const lines = csvText.split(/\r?\n/).slice(1);
		const iconMap = {};
		lines.forEach(line => {
			const match = line.match(/^"?(.*?)"?,(.*)$/);
			if (match) {
				const name = match[1];
				 iconMap[name] = `../../Icons/Digimon/${name.replace(/[^a-zA-Z0-9\-_. ]/g, '')}-icon.png`;
			}
		});
		const iconPath = iconMap[digimon.Name] || '';
		let html = `<h2>${iconPath ? `<img src="${iconPath}" class="icon-img me-2" alt="icon">` : ''}${digimon.Name}</h2>`;
		html += `<ul class="list-group mb-3">
			<li class="list-group-item"><strong>Stage:</strong> ${digimon.Stage}</li>
			<li class="list-group-item"><strong>Attribute:</strong> ${digimon.Attribute}</li>
			<li class="list-group-item"><strong>Type:</strong> ${digimon.Type}</li>
		</ul>`;

	// Evolutions (forward)
	let evolvesTo = [];
	evolutionsData.forEach(row => {
		if (row.Digimon === digimon.Name && row["Evolves To"] && row["Evolves To"].trim() !== "None") {
			evolvesTo = evolvesTo.concat(row["Evolves To"].split(';').map(s => s.trim()).filter(Boolean));
		}
	});
	if (evolvesTo.length) {
		html += `<h4>Evolves Into:</h4><ul class="list-group mb-3">`;
		evolvesTo.forEach(name => {
			const evoIcon = iconMap[name] || '';
			html += `<li class="list-group-item">${evoIcon ? `<img src="${evoIcon}" class="icon-img me-2" alt="icon">` : ''}<a href="#" class="digimon-link" data-name="${name}">${name}</a></li>`;
		});
		html += '</ul>';
	}

	// Previous forms (backward)
	let previousForms = [];
	evolutionsData.forEach(row => {
		if (row["Evolves To"] && row["Evolves To"].includes(digimon.Name)) {
			previousForms.push(row.Digimon);
		}
	});
	if (previousForms.length) {
		html += `<h4>Previous Forms:</h4><ul class="list-group mb-3">`;
		previousForms.forEach(name => {
			const prevIcon = iconMap[name] || '';
			html += `<li class="list-group-item">${prevIcon ? `<img src="${prevIcon}" class="icon-img me-2" alt="icon">` : ''}<a href="#" class="digimon-link" data-name="${name}">${name}</a></li>`;
		});
		html += '</ul>';
	}

				// Fetch moves and join for this Digimon
				Promise.all([
					fetchAndParseCSV('data/digimon_moves_complete.csv'),
					fetchAndParseCSV('data/digimon_moves.csv')
				]).then(([movesComplete, movesCsv]) => {
					// Get all moves for this Digimon from both sources
					const moves1 = movesComplete.filter(row => row.Digimon === digimon.Name && row.Move);
					const moves2 = movesCsv.filter(row => row.Digimon === digimon.Name && row.Move);
					// Merge and deduplicate by Move+Level
					const key = row => `${row.Move}|${row.Level}`;
					const allMovesMap = {};
					[...moves1, ...moves2].forEach(row => {
						allMovesMap[key(row)] = row;
					});
					const allMoves = Object.values(allMovesMap);
					let movesHtml = '';
					if (allMoves.length) {
						movesHtml += `<h4>Moves Learned</h4><div class=\"table-responsive\"><table class=\"table table-bordered table-hover align-middle\"><thead class=\"table-light\">
							<tr><th>Element</th><th>Move</th><th>Type</th><th>Power</th><th>Level</th></tr>
						</thead><tbody>`;
						allMoves.forEach(row => {
							// Find move details from movesComplete for icon/type/power
							const moveDetails = movesComplete.find(m => m.Move === row.Move) || {};
							let elementIcon = '';
							if (moveDetails.Attribute) {
								const attr = moveDetails.Attribute.trim().toLowerCase();
								elementIcon = `<img src='../../Icons/Moves/${attr}-icon.png' alt='${attr}' style='width:18px;height:18px;vertical-align:middle;margin-right:2px;'>`;
							}
							movesHtml += `<tr>
								<td>${elementIcon}</td>
								<td><a href=\"../SkillInfo/skillinfo.html?name=${encodeURIComponent(row.Move)}\" target=\"_blank\">${row.Move}</a></td>
								<td>${moveDetails.Type || ''}</td>
								<td>${moveDetails.Power || ''}</td>
								<td>${row.Level || ''}</td>
							</tr>`;
						});
						movesHtml += '</tbody></table></div>';
					}
					// Insert movesHtml before evolutions display
					let finalHtml = html + movesHtml;

					// Evolutions (forward)
					let evolvesTo = [];
					evolutionsData.forEach(row => {
						if (row.Digimon === digimon.Name && row["Evolves To"] && row["Evolves To"].trim() !== "None") {
							evolvesTo = evolvesTo.concat(row["Evolves To"].split(';').map(s => s.trim()).filter(Boolean));
						}
					});
					if (evolvesTo.length) {
						finalHtml += `<h4>Evolves Into:</h4><ul class="list-group mb-3">`;
						evolvesTo.forEach(name => {
							const evoIcon = iconMap[name] || '';
							finalHtml += `<li class="list-group-item">${evoIcon ? `<img src="${evoIcon}" class="icon-img me-2" alt="icon">` : ''}<a href="#" class="digimon-link" data-name="${name}">${name}</a></li>`;
						});
						finalHtml += '</ul>';
					}

					// Previous forms (backward)
					let previousForms = [];
					evolutionsData.forEach(row => {
						if (row["Evolves To"] && row["Evolves To"].includes(digimon.Name)) {
							previousForms.push(row.Digimon);
						}
					});
					if (previousForms.length) {
						finalHtml += `<h4>Previous Forms:</h4><ul class="list-group mb-3">`;
						previousForms.forEach(name => {
							const prevIcon = iconMap[name] || '';
							finalHtml += `<li class="list-group-item">${prevIcon ? `<img src="${prevIcon}" class="icon-img me-2" alt="icon">` : ''}<a href="#" class="digimon-link" data-name="${name}">${name}</a></li>`;
						});
						finalHtml += '</ul>';
					}

					container.innerHTML = finalHtml;

					// Navigation: clicking a Digimon name loads its details
					Array.from(document.getElementsByClassName('digimon-link')).forEach(link => {
						link.addEventListener('click', function(e) {
							e.preventDefault();
							const name = this.getAttribute('data-name');
							renderDigimonDetails(name, digimonData, evolutionsData);
						});
					});
				});
			});
}

window.initDetailsTab = function() {
    Promise.all([
		fetchAndParseCSV(window.DIGIMON_CSV_PATHS?.data ? window.DIGIMON_CSV_PATHS.data.replace('Database/', 'data/') : 'data/digimon_data.csv'),
		fetchAndParseCSV('data/digimon_evolutions.csv')
    ]).then(([digimonData, evolutionsData]) => {
        // Get Digimon name from SPA global variable or query parameter
        let digimonName = window.selectedDigimonName;
        if (!digimonName) {
            const params = new URLSearchParams(window.location.search);
            digimonName = params.get('name') || digimonData[0].Name;
        }
        renderDigimonDetails(digimonName, digimonData, evolutionsData);
    });
};