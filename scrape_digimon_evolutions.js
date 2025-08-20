const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const MAIN_LIST_URL = 'https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/digimon';
const logPath = path.join(__dirname, 'scrape_log.txt');
function log(msg) { fs.appendFileSync(logPath, msg + '\n'); }

// Main async IIFE
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(MAIN_LIST_URL, { waitUntil: 'domcontentloaded' });
    const digimonList = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        const digimons = [];
        for (const row of rows) {
            const link = row.querySelector('a[href*="/digimon/"]');
            if (link) {
                digimons.push({
                    name: link.textContent.trim(),
                    url: link.href
                });
            }
        }
        return digimons;
    });
    log(`Found ${digimonList.length} Digimon to process.`);
    let results = [];
    // Limit to first 20 Digimon for testing
    const testLimit = 20;
    for (let i = 0; i < Math.min(testLimit, digimonList.length); i++) {
        const digimon = digimonList[i];
                    log(`[${i+1}/${digimonList.length}] Processing: ${digimon.name} (${digimon.url})`);
                    try {
                        await page.goto(digimon.url, { waitUntil: 'networkidle2' });
                        let evolvesFrom = 'None';
                        let evolvesTo = 'None';
                        let digivolutionCondition = 'None';
                        const sections = await page.$$eval('h2, h3', hs => hs.map(h => h.textContent.trim().toLowerCase()));
                        const fromIdx = sections.findIndex(s => s.includes('evolves from'));
                        if (fromIdx !== -1) {
                            const fromTable = await page.$$eval('h2, h3', (hs, idx) => {
                                let heading = hs[idx];
                                let sibling = heading.nextElementSibling;
                                while (sibling && sibling.tagName !== 'DIV') sibling = sibling.nextElementSibling;
                                if (sibling && sibling.tagName === 'DIV') {
                                    const table = sibling.querySelector('table');
                                    if (table) {
                                        return Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
                                            const cols = row.querySelectorAll('td');
                                            return cols[1]?.textContent.trim();
                                        }).filter(Boolean).join('; ');
                                    }
                                }
                                return 'None';
                            }, fromIdx);
                            if (fromTable) evolvesFrom = fromTable;
                        }
                        const toIdx = sections.findIndex(s => s.includes('evolves to'));
                        if (toIdx !== -1) {
                            const toTable = await page.$$eval('h2, h3', (hs, idx) => {
                                let heading = hs[idx];
                                let sibling = heading.nextElementSibling;
                                while (sibling && sibling.tagName !== 'DIV') sibling = sibling.nextElementSibling;
                                if (sibling && sibling.tagName === 'DIV') {
                                    const table = sibling.querySelector('table');
                                    if (table) {
                                        return Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
                                            const cols = row.querySelectorAll('td');
                                            return cols[1]?.textContent.trim();
                                        }).filter(Boolean).join('; ');
                                    }
                                }
                                return 'None';
                            }, toIdx);
                            if (toTable) evolvesTo = toTable;
                        }
                        const condIdx = sections.findIndex(s => s.includes('digivolution condition'));
                        if (condIdx !== -1) {
                            const condTable = await page.$$eval('h2, h3', (hs, idx) => {
                                let heading = hs[idx];
                                let sibling = heading.nextElementSibling;
                                while (sibling && sibling.tagName !== 'DIV') sibling = sibling.nextElementSibling;
                                if (sibling && sibling.tagName === 'DIV') {
                                    const table = sibling.querySelector('table');
                                    if (table) {
                                        return Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
                                            return Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim()).join(' | ');
                                        }).join('; ');
                                    }
                                }
                                return 'None';
                            }, condIdx);
                            if (condTable) digivolutionCondition = condTable;
                        }
                        results.push({
                            Digimon: digimon.name,
                            EvolvesFrom: evolvesFrom,
                            DigivolutionCondition: digivolutionCondition,
                            EvolvesTo: evolvesTo
                        });
                        log(`[${i+1}/${digimonList.length}] Done: ${digimon.name}`);
                    } catch (err) {
                        log(`[${i+1}/${digimonList.length}] Error: ${digimon.name} - ${err.message}`);
                    }
                }
                // Write to CSV
                const csvPath = path.join(__dirname, 'digimon_evolutions.csv');
                const csvRows = [['Digimon', 'Evolves From', 'Digivolution Condition', 'Evolves To']];
                for (const row of results) {
                    csvRows.push([row.Digimon, row.EvolvesFrom, row.DigivolutionCondition, row.EvolvesTo]);
                }
                fs.writeFileSync(csvPath, csvRows.map(r => r.join(',')).join('\n'), 'utf8');
    await browser.close();
    console.log('CSV saved to', csvPath);
})();
