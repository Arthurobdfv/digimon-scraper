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
		// Helper to render a Digimon list as a table
		function renderDigimonListTable(title, digimonNames, iconMap) {
			if (!digimonNames.length) return '';
			let html = `<h4>${title}</h4><ul class="list-group mb-3" style="padding:0;">`;
			digimonNames.forEach(name => {
				const icon = iconMap[name.replace(/[()]/g, '').trim()] || '';
				html += `<li class="list-group-item" style="display:flex;align-items:center;padding:4px 8px;">
					${icon ? `<img src="${icon}" class="icon-img me-2" alt="icon" style="width:32px;height:32px;">` : ''} 
					<a href="#" class="digimon-link" data-name="${name}" style="margin-left:8px;">${name}</a>
				</li>`;
			});
			html += '</ul>';
			return html;
		}
	const container = document.getElementById('digimonDetailsContainer');
	if (!container) return;
	// Normalize name for lookup: remove parentheses and trim
	const normalizedName = digimonName.replace(/[()]/g, '').trim();
	const digimon = digimonData.find(d => d.Name.replace(/[()]/g, '').trim() === normalizedName);
	if (!digimon) {
		container.innerHTML = `<div class="alert alert-warning mt-4">Digimon not found: ${digimonName}</div>`;
		return;
	}
	// Load icon map from CSV
	fetch(window.DIGIMON_CSV_PATHS.iconMap).then(r => r.text()).then(csvText => {
		const lines = csvText.split(/\r?\n/).slice(1);
		const iconMap = {};
		lines.forEach(line => {
			const match = line.match(/^"?(.*?)"?,(.*)$/);
			if (match) {
				const name = match[1].replace(/[()]/g, '').trim();
				iconMap[name] = `../../Icons/Digimon/${encodeURIComponent(name.replace(/[^a-zA-Z0-9\-_. ]/g, '') + '-icon.png')}`;
			}
		});
		const iconPath = iconMap[digimon.Name.replace(/[()]/g, '').trim()] || '';
		let html = `<h2>${iconPath ? `<img src="${iconPath}" class="icon-img me-2" alt="icon">` : ''}${digimon.Name}</h2>`;
		html += `<ul class="list-group mb-3">
			<li class="list-group-item"><strong>Stage:</strong> ${digimon.Stage}</li>
			<li class="list-group-item"><strong>Attribute:</strong> ${digimon.Attribute}</li>
			<li class="list-group-item"><strong>Type:</strong> ${digimon.Type}</li>
		</ul>`;
		// Fetch moves and join for this Digimon
		Promise.all([
			fetchAndParseCSV(window.DIGIMON_CSV_PATHS.movesComplete),
			fetchAndParseCSV(window.DIGIMON_CSV_PATHS.moves)
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
				// Sort moves by Level ascending (numeric)
				allMoves.sort((a, b) => {
					const levelA = parseInt(a.Level, 10);
					const levelB = parseInt(b.Level, 10);
					if (isNaN(levelA) && isNaN(levelB)) return 0;
					if (isNaN(levelA)) return 1;
					if (isNaN(levelB)) return -1;
					return levelA - levelB;
				});
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
			// Now render Moves first, then Evolves Into, then Previous Forms
			let evolvesTo = [];
			evolutionsData.forEach(row => {
				if (row.Digimon === digimon.Name && row["Evolves To"] && row["Evolves To"].trim() !== "None") {
					evolvesTo = evolvesTo.concat(row["Evolves To"].split(';').map(s => s.trim()).filter(Boolean));
				}
			});
			let evolvesHtml = renderDigimonListTable('Evolves Into:', evolvesTo, iconMap);
			let previousForms = [];
			evolutionsData.forEach(row => {
				if (row["Evolves To"] && row["Evolves To"].includes(digimon.Name)) {
					previousForms.push(row.Digimon);
				}
			});
			let previousHtml = renderDigimonListTable('Previous Forms:', previousForms, iconMap);
			// Side-by-side layout for Previous Forms and Evolves Into
			let evoPrevHtml = '';
			if (previousForms.length && evolvesTo.length) {
				evoPrevHtml = `<div style="display:flex;gap:32px;justify-content:center;align-items:flex-start;">
					<div style="flex:1;min-width:200px;">${previousHtml}</div>
					<div style="flex:1;min-width:200px;">${evolvesHtml}</div>
				</div>`;
			} else if (previousForms.length) {
				evoPrevHtml = `<div style="display:block;text-align:center;">${previousHtml}</div>`;
			} else if (evolvesTo.length) {
				evoPrevHtml = `<div style="display:block;text-align:center;">${evolvesHtml}</div>`;
			}
			container.innerHTML = html + movesHtml + evoPrevHtml;
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
		fetchAndParseCSV(window.DIGIMON_CSV_PATHS?.data),
		fetchAndParseCSV(window.DIGIMON_CSV_PATHS?.evolutions)
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
