# DigimonScraper Application

## Overview
DigimonScraper is a modular web application for browsing, searching, and exploring Digimon data, evolutions, and moves. It provides a rich, interactive experience for Digimon fans and researchers, combining robust data scraping, parsing, and visualization features.

---

## Key Features

### 1. Digimon Browser (`browse.html`)
- **Responsive Table:** View all Digimon with sortable columns for Name, Attribute, Type, and Stage.
- **Live Filtering:** Search by name, filter by attribute, type, and stage using dropdowns and text input.
- **Icon Display:** Each Digimon is shown with its local icon, mapped via `digimon_icon_map.csv` and loaded from `Icons/Digimon/`.
- **Error Handling:** Displays loading and error states for missing or broken data.
- **Navigation:** Click a Digimon name to view detailed information on the details page.

### 2. Digimon Details (`details.html`)
- **Profile View:** Shows full details for a selected Digimon, including icon, stats, evolutions, and moves.
- **Icon Handling:** Loads icons directly from local files, supporting Digimons with special characters in their names.
- **Data Integration:** Pulls data from all relevant CSVs for a comprehensive profile.

### 3. Data Scraping & Parsing
- **Automated Scraping:** Scripts (`scrape_digimon_evolutions.js`, `scrape_digimon_moves.js`, etc.) fetch and parse data from external sources.
- **CSV Output:** Data is saved in modular CSV files (`digimon_data.csv`, `digimon_evolutions.csv`, `digimon_moves.csv`, `digimon_icon_map.csv`).
- **Icon Downloading:** PowerShell script (`download_digimon_icons.ps1`) automates downloading Digimon icons to the local folder.
- **Robust Parsing:** Uses PapaParse for client-side CSV parsing, handling headers, duplicate rows, and malformed data.

### 4. Modularization
- **Separation of Concerns:** Scraping, parsing, UI rendering, and data mapping are handled in separate scripts and files.
- **Extensible:** Easily add new Digimon, icons, or data sources by updating CSVs and icon folders.
- **Maintainable:** Clear code structure and modular files make updates and debugging straightforward.

---

## How It Works

1. **Data Preparation:**
   - Scraping scripts collect Digimon data, evolutions, moves, and icon mappings.
   - Data is saved in CSV format for easy parsing and updating.
   - Icons are downloaded and stored locally in `Icons/Digimon/`.

2. **Application Startup:**
   - On loading `browse.html`, the app parses CSVs using PapaParse and builds the Digimon table.
   - Icon mapping is performed using `digimon_icon_map.csv`, matching Digimon names to local icon files.
   - Filtering and searching are enabled for a dynamic browsing experience.

3. **Navigation & Details:**
   - Clicking a Digimon name navigates to the details page, which loads all relevant data for that Digimon.
   - Icons and data are loaded directly from local files, ensuring fast and reliable display.

4. **Error Handling:**
   - The app gracefully handles missing icons, malformed CSVs, and network errors, displaying user-friendly messages.

---

## Data Files
- **digimon_data.csv:** Main Digimon dataset (name, stage, attribute, type).
- **digimon_evolutions.csv:** Evolution relationships between Digimons.
- **digimon_moves.csv:** List of moves for each Digimon.
- **digimon_icon_map.csv:** Maps Digimon names to local icon filenames.

## Scripts
- **scrape_digimon_evolutions.js:** Scrapes Digimon evolution data.
- **scrape_digimon_moves.js:** Scrapes Digimon moves data.
- **scrape_random_digimon_evolutions.js:** Scrapes random evolutions for variety.
- **download_digimon_icons.ps1:** Downloads all Digimon icons to local storage.

## Technologies Used
- **Bootstrap:** Responsive UI and styling.
- **PapaParse:** Robust CSV parsing in the browser.
- **JavaScript:** Application logic and event handling.
- **PowerShell:** Automated icon downloading.

---

## Extending & Customizing
- Add new Digimon or update data by editing CSV files.
- Add new icons to `Icons/Digimon/` and update `digimon_icon_map.csv`.
- Modify scraping scripts to fetch new data sources.
- UI and features can be extended by editing `browse.js` and related scripts.

---

## Troubleshooting
- If icons do not display, check for filename mismatches or encoding issues.
- Ensure all CSVs are properly formatted and up to date.
- Use browser console for error messages and debugging.

---

## Credits
- Digimon data and icons sourced from public databases and fan resources.
- Application built and maintained by the project owner.

---

Enjoy exploring the world of Digimon with DigimonScraper!