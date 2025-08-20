// skillinfo.js
// Displays details for a skill and lists Digimons that learn it

document.addEventListener('DOMContentLoaded', function () {
  // Get skill name from query string
  const params = new URLSearchParams(window.location.search);
  const skillName = params.get('name');
  if (!skillName) {
    document.getElementById('skillNameHeader').textContent = 'Skill not found';
    document.getElementById('skillInfoContainer').innerHTML = '<div class="alert alert-danger">No skill specified.</div>';
    return;
  }
  document.getElementById('skillNameHeader').textContent = skillName;

  // Load skill info from digimon_moves_complete.csv
  Papa.parse('digimon_moves_complete.csv', {
    header: true,
    download: true,
    complete: function (results) {
      const skill = results.data.find(row => row['Move'] === skillName);
      if (!skill) {
        document.getElementById('skillInfoContainer').innerHTML = '<div class="alert alert-warning">Skill not found in database.</div>';
        return;
      }
      renderSkillInfo(skill);
      loadDigimonsForSkill(skillName);
    }
  });

  function renderSkillInfo(skill) {
    let html = `<div class="row align-items-center mb-3">
      <div class="col-auto">
        <img src="${skill['Icon']}" class="icon-img" alt="icon">
      </div>
      <div class="col">
        <table class="table table-sm mb-0">
          <tbody>
            <tr><th>Move</th><td>${skill['Move']}</td></tr>
            <tr><th>Attribute</th><td>${skill['Attribute']}</td></tr>
            <tr><th>Type</th><td>${skill['Type']}</td></tr>
            <tr><th>SP Cost</th><td>${skill['SP Cost']}</td></tr>
            <tr><th>Power</th><td>${skill['Power']}</td></tr>
            <tr><th>Inheritable</th><td>${skill['Inheritable']}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
    document.getElementById('skillInfoContainer').innerHTML = html;
  }

  function loadDigimonsForSkill(skillName) {
    Papa.parse('digimon_moves.csv', {
      header: true,
      download: true,
      complete: function (results) {
        // Find digimons that learn this skill
        const digimons = results.data.filter(row => row['Move'] === skillName);
        renderDigimonList(digimons);
      }
    });
  }

  function renderDigimonList(digimons) {
    if (!digimons.length) {
      document.getElementById('digimonListContainer').innerHTML = '<div class="alert alert-info">No Digimon learns this skill.</div>';
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
      // Sort digimons by Level ascending (numeric)
      digimons.sort((a, b) => Number(a['Level']) - Number(b['Level']));
      let html = `<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light">
        <tr><th>Icon</th><th>Digimon</th><th>Level</th></tr>
      </thead><tbody>`;
      digimons.forEach(row => {
        const name = row['Digimon'];
        const iconPath = iconMap[name] || '';
        html += `<tr>
          <td>${iconPath ? `<img src=\"${iconPath}\" class=\"icon-img\" alt=\"icon\">` : ''}</td>
          <td><a href=\"details.html?name=${encodeURIComponent(name)}\">${name}</a></td>
          <td>${row['Level']}</td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      document.getElementById('digimonListContainer').innerHTML = html;
    });
  }
});
