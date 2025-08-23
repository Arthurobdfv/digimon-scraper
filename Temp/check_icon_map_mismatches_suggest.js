// Enhanced script to check for mismatches and suggest correct filenames
// Usage: node Temp/check_icon_map_mismatches_suggest.js

const fs = require('fs');
const path = require('path');
const csvPath = path.join(__dirname, '../Database/digimon_icon_map.csv');
const iconsDir = path.join(__dirname, '../Icons/Digimon');

const iconFiles = new Set(fs.readdirSync(iconsDir));
const csvText = fs.readFileSync(csvPath, 'utf8');
const lines = csvText.split(/\r?\n/).filter(Boolean);
const header = lines[0].split(',');
const iconIdx = header.findIndex(h => h.trim().toLowerCase() === 'icon');
if (iconIdx === -1) throw new Error('No Icon column found in CSV');

const mismatches = [];
for (let i = 1; i < lines.length; i++) {
  const row = lines[i].split(',');
  let icon = row[iconIdx].replace(/^"|"$/g, '').trim();
  if (!iconFiles.has(icon)) {
    // Try to suggest a filename by replacing parentheses with spaces
    let suggested = icon.replace(/\(([^)]+)\)/g, ' $1').replace(/  +/g, ' ');
    // Remove periods and extra spaces
    suggested = suggested.replace(/\.|\s+/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, ' ') + '-icon.png';
    // Try to find a close match
    let closeMatch = Array.from(iconFiles).find(f => f.toLowerCase() === suggested.toLowerCase());
    mismatches.push({ line: i + 1, icon, suggested: closeMatch || suggested });
  }
}

if (mismatches.length === 0) {
  console.log('All icon files referenced in digimon_icon_map.csv exist in Icons/Digimon/.');
} else {
  console.log('Missing or mismatched icon files with suggestions:');
  mismatches.forEach(({ line, icon, suggested }) => {
    console.log(`Line ${line}: ${icon} -> Suggested: ${suggested}`);
  });
}
