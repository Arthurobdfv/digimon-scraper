// scrape_digimon_icons.js
// Scrapes Digimon Name and Icon URL from grindosaur and saves to digimon_icon_map.csv

const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for the table to load
  await page.waitForSelector('table');

  // Scrape Name and Icon src from each row
  const digimons = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      // Icon is usually the second cell, Name is third
      const iconImg = cells[1]?.querySelector('img');
      const name = cells[2]?.textContent.trim();
      const iconUrl = iconImg ? iconImg.src : '';
      return { name, iconUrl };
    }).filter(d => d.name && d.iconUrl);
  });

  // Write to CSV
  const csv = 'Name,Icon\n' + digimons.map(d => `${JSON.stringify(d.name)},${d.iconUrl}`).join('\n');
  fs.writeFileSync('Database/digimon_icon_map.csv', csv);

  await browser.close();
  console.log(`Scraped ${digimons.length} Digimon icons.`);
})();
