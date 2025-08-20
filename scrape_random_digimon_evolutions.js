// scrape_random_digimon_evolutions.js
// Scrapes evolutions for random Digimon from the initial page of grindosaur.com
// Outputs to digimon_evolutions_random.csv

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// List of random Digimon from the initial page (can be expanded)
const digimons = [
  { name: 'Kuramon', url: 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon/kuramon' },
  { name: 'Agumon', url: 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon/agumon' },
  { name: 'Gabumon', url: 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon/gabumon' },
  { name: 'Impmon', url: 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon/impmon' },
  { name: 'Lopmon', url: 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon/lopmon' }
];

const outputFile = path.join(__dirname, 'digimon_evolutions_random.csv');

function sanitize(text) {
  return text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
}

async function scrapeEvolutions(page, digimon) {
  await page.goto(digimon.url, { waitUntil: 'domcontentloaded' });
  // Find the "Digivolutions" section
  const evolutions = await page.evaluate(() => {
    const results = [];
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    let evoHeading = headings.find(h => h.textContent.trim().toLowerCase().includes('digivolutions'));
    if (!evoHeading) return results;
    let sibling = evoHeading.nextElementSibling;
    while (sibling && sibling.tagName !== 'TABLE') sibling = sibling.nextElementSibling;
    if (!sibling) return results;
    // Parse the table
    const rows = Array.from(sibling.querySelectorAll('tbody tr'));
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
      if (cells.length >= 3) {
        results.push({
          from: cells[0],
          to: cells[1],
          condition: cells[2]
        });
      }
    }
    return results;
  });
  return evolutions.map(evo => ({
    digimon: digimon.name,
    from: sanitize(evo.from),
    to: sanitize(evo.to),
    condition: sanitize(evo.condition)
  }));
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let allEvolutions = [];
  for (const digimon of digimons) {
    try {
      const evolutions = await scrapeEvolutions(page, digimon);
      if (evolutions.length === 0) {
        allEvolutions.push({ digimon: digimon.name, from: '', to: '', condition: 'No evolution data found' });
      } else {
        allEvolutions = allEvolutions.concat(evolutions);
      }
    } catch (err) {
      allEvolutions.push({ digimon: digimon.name, from: '', to: '', condition: 'Error scraping page' });
    }
  }
  await browser.close();
  // Write to CSV
  const header = 'Digimon,From,To,Condition\n';
  const rows = allEvolutions.map(e => `${e.digimon},${e.from},${e.to},${e.condition}`).join('\n');
  fs.writeFileSync(outputFile, header + rows, 'utf8');
  console.log('Scraping complete. Output written to digimon_evolutions_random.csv');
})();
