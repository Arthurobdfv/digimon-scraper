
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const BASE_URL = 'https://www.grindosaur.com';
const MOVES_URL = BASE_URL + '/en/games/digimon-story-cyber-sleuth/moves';
const LOG_PATH = path.join(__dirname, 'scrape_log.txt');

function log(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_PATH, `[${timestamp}] ${message}\n`, 'utf8');
}


(async () => {
    try {
        log('Script started. Launching browser...');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        log('Navigating to Digimon moves page...');
        await page.goto(MOVES_URL, { waitUntil: 'networkidle2' });

        // Scrape the moves table
        log('Extracting moves table...');
        const moves = await page.$$eval('table tbody tr', rows => {
            return rows.map(row => {
                const cols = row.querySelectorAll('td');
                return {
                    Icon: cols[0]?.querySelector('img')?.getAttribute('src') || '',
                    Move: cols[1]?.textContent.trim() || '',
                    Attribute: cols[2]?.textContent.trim() || '',
                    Type: cols[3]?.textContent.trim() || '',
                    SP_Cost: cols[4]?.textContent.trim() || '',
                    Power: cols[5]?.textContent.trim() || '',
                    Inheritable: cols[6]?.querySelector('img') ? 'Yes' : 'No'
                };
            });
        });
        log(`Found ${moves.length} moves.`);

        // Write to CSV with all required columns
        const csvPath = path.join(__dirname, 'digimon_moves_complete.csv');
        const csvRows = [['Move', 'Icon', 'Attribute', 'Type', 'SP Cost', 'Power', 'Inheritable']];
        for (const move of moves) {
            csvRows.push([
                move.Move,
                move.Icon,
                move.Attribute,
                move.Type,
                move.SP_Cost,
                move.Power,
                move.Inheritable
            ]);
        }
        fs.writeFileSync(csvPath, csvRows.map(row => row.join(',')).join('\n'), 'utf8');
        log(`CSV saved to ${csvPath}`);
        await browser.close();
        log('Browser closed. Script finished.');
    } catch (err) {
        log(`Fatal error: ${err}`);
    }
})();
