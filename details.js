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
  fetch('digimon_icon_map.csv').then(r => r.text()).then(csvText => {
    const lines = csvText.split(/\r?\n/).slice(1);
    const iconMap = {};
    lines.forEach(line => {
      const match = line.match(/^"?(.*?)"?,(.*)$/);
      if (match) {
        const name = match[1];
        iconMap[name] = `Icons/Digimon/${name.replace(/[^a-zA-Z0-9\-_. ]/g, '')}-icon.png`;
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

    container.innerHTML = html;

    // Navigation: clicking a Digimon name loads its details
    Array.from(document.getElementsByClassName('digimon-link')).forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const name = this.getAttribute('data-name');
        renderDigimonDetails(name, digimonData, evolutionsData);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetchAndParseCSV('digimon_data.csv'),
    fetchAndParseCSV('digimon_evolutions.csv')
  ]).then(([digimonData, evolutionsData]) => {
    // Get Digimon name from query parameter
    const params = new URLSearchParams(window.location.search);
    const digimonName = params.get('name') || digimonData[0].Name;
    renderDigimonDetails(digimonName, digimonData, evolutionsData);
  }).catch(err => {
    document.getElementById('digimonDetailsContainer').innerHTML = `<div class="alert alert-danger mt-4">Error loading CSV files: ${err}</div>`;
  });
});
