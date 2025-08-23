// Script to check for mismatches between digimon_icon_map.csv and Icons/Digimon/ directory
// Usage: node Temp/check_icon_map_mismatches.js

const fs = require('fs');
const path = require('path');
const csvPath = path.join(__dirname, '../Database/digimon_icon_map.csv');
const iconsDir = path.join(__dirname, '../Icons/Digimon');

// Read all icon filenames in Icons/Digimon/
const iconFiles = new Set(fs.readdirSync(iconsDir));

// Read CSV and parse Icon column
const csvText = fs.readFileSync(csvPath, 'utf8');
const lines = csvText.split(/\r?\n/).filter(Boolean);
const header = lines[0].split(',');
const iconIdx = header.findIndex(h => h.trim().toLowerCase() === 'icon');
if (iconIdx === -1) throw new Error('No Icon column found in CSV');

const missingIcons = [];
for (let i = 1; i < lines.length; i++) {
  const row = lines[i].split(',');
  // Handle quoted fields
  const icon = row[iconIdx].replace(/^"|"$/g, '').trim();
  if (!iconFiles.has(icon)) {
    missingIcons.push({ line: i + 1, icon });
  }
}

if (missingIcons.length === 0) {
  console.log('All icon files referenced in digimon_icon_map.csv exist in Icons/Digimon/.');
} else {
  console.log('Missing or mismatched icon files:');
  missingIcons.forEach(({ line, icon }) => {
    console.log(`Line ${line}: ${icon}`);
  });
}
