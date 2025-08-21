// SkillInfo tab SPA logic
// Displays details for a skill and lists Digimons that learn it

window.initSkillinfoTab = function () {
  // Get skill name from SPA global variable or query string
  let skillName = window.selectedSkillName;
  if (!skillName) {
    // Try hash navigation for SPA
    if (window.location.hash && window.location.hash.startsWith('#skillinfo')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      skillName = hashParams.get('name');
    }
    if (!skillName) {
      const params = new URLSearchParams(window.location.search);
      skillName = params.get('name');
    }
  }
  if (!skillName) {
    document.getElementById('skillNameHeader').textContent = 'Skill not found';
    document.getElementById('skillInfoContainer').innerHTML = '<div class="alert alert-danger">No skill specified.</div>';
    return;
  }
  document.getElementById('skillNameHeader').textContent = skillName;

  Papa.parse('data/digimon_moves_complete.csv', {
    header: true,
    download: true,
    complete: function (results) {
      const skills = results.data.filter(row => row['Move'] === skillName);
      if (!skills.length) {
        document.getElementById('skillInfoContainer').innerHTML = '<div class="alert alert-warning">Skill not found in database.</div>';
        return;
      }
      renderSkillInfo(skills);
      loadDigimonsForSkill(skillName);
    }
  });

  function renderSkillInfo(skill) {
    let html = '';
    skills.forEach(skill => {
      html += `<div class="row align-items-center mb-3">
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
    });
    document.getElementById('skillInfoContainer').innerHTML = html;
  }

  function loadDigimonsForSkill(skillName) {
  // Join digimon_moves_complete and digimon_moves for all learners
  Promise.all([
    new Promise(resolve => {
  Papa.parse('data/digimon_moves_complete.csv', {
        header: true,
        download: true,
        complete: results => resolve(results.data)
      });
    }),
    new Promise(resolve => {
  Papa.parse('data/digimon_moves.csv', {
        header: true,
        download: true,
        complete: results => resolve(results.data)
      });
    })
  ]).then(([completeData, movesData]) => {
    // Get all digimon rows for this skill from both sources
    const learners1 = completeData.filter(row => row['Move'] === skillName && row['Digimon']);
    const learners2 = movesData.filter(row => row['Move'] === skillName && row['Digimon']);
    // Merge and deduplicate by Digimon name and Level
    const key = row => `${row['Digimon']}|${row['Level']}`;
    const allLearnersMap = {};
    [...learners1, ...learners2].forEach(row => {
      allLearnersMap[key(row)] = row;
    });
    const allLearners = Object.values(allLearnersMap);
    renderDigimonList(allLearners);
  });
  }

  function renderDigimonList(digimons) {
    if (!digimons.length) {
      document.getElementById('digimonListContainer').innerHTML = '<div class="alert alert-info">No Digimon learns this skill.</div>';
      return;
    }
  fetch('data/digimon_icon_map.csv').then(r => r.text()).then(csvText => {
      const lines = csvText.split(/\r?\n/).slice(1);
      const iconMap = {};
      lines.forEach(line => {
        const match = line.match(/^"?(.*?)"?,(.*)$/);
        if (match) {
          const name = match[1];
          iconMap[name] = `Icons/Digimon/${name.replace(/[^a-zA-Z0-9\-_. ]/g, '')}-icon.png`;
        }
      });
      digimons.sort((a, b) => Number(a['Level']) - Number(b['Level']));
      let html = `<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-light">
        <tr><th>Icon</th><th>Digimon</th><th>Level</th></tr>
      </thead><tbody>`;
      digimons.forEach(row => {
        const name = row['Digimon'];
        const iconPath = iconMap[name] || '';
        html += `<tr>
          <td>${iconPath ? `<img src=\"${iconPath}\" class=\"icon-img\" alt=\"icon\">` : ''}</td>
          <td><a href="#" class="digimon-details-link" data-name="${name}">${name}</a></td>
          <td>${row['Level']}</td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      document.getElementById('digimonListContainer').innerHTML = html;

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
    });
  }
};
