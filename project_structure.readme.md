# Digimon Browser Project Structure

## Overview
This project is a modular, single-page Digimon browser and aggregator web app. All features are organized under the `Pages/` directory, with each tab/page in its own subfolder containing both HTML and JS files. The UI uses a Bootstrap navbar loaded dynamically, and all navigation is handled via SPA logic in `index.html`.

## Project Structure

```
DigimonScraper/
├── Pages/
│   ├── Aggregate/
│   │   ├── aggregate.html        # Aggregation feature UI
│   │   └── aggregate.js          # Aggregation logic
│   ├── Browse/
│   │   ├── browse.html           # Digimon browser UI
│   │   └── browse.js             # Digimon browser logic
│   ├── Details/
│   │   ├── details.html          # Digimon details UI
│   │   └── details.js            # Digimon details logic
│   ├── Skills/
│   │   ├── skills.html           # Skills tab UI
│   │   └── skills.js             # Skills tab logic
│   ├── SkillInfo/
│   │   ├── skillinfo.html        # Skill info tab UI
│   │   └── skillinfo.js          # Skill info tab logic
│   └── Pathfinder/
│       ├── pathfinder_tab.html   # Pathfinder tab UI
│       └── digimon_pathfinder_tab.js # Pathfinder tab logic
├── Icons/
│   ├── Digimon/                  # Digimon icon images
│   └── Moves/                    # Move icon images
├── index.html                    # SPA shell and entry point
├── navbar.html                   # Modularized navbar (loaded dynamically)
├── digimon_data.csv              # Main Digimon data
├── digimon_evolutions.csv        # Digimon evolutions data
├── digimon_moves.csv             # Digimon moves data
├── digimon_moves_complete.csv    # Complete moves data
├── digimon_icon_map.csv          # Icon mapping
├── mcp.json                      # Resource registry
├── package.json                  # Project metadata
└── project_structure.readme.md   # This documentation file
```

## SPA Architecture
- All navigation is handled by `index.html` using dynamic content injection.
- The navbar is modularized in `navbar.html` and loaded into the SPA shell.
- Each tab/page is located in its own subfolder under `Pages/`, with separate HTML and JS files.
- Tab JS files export an initialization function (e.g., `window.initBrowseTab`) called by the SPA loader after injection.

## How to Add a New Tab/Page
1. **Create a new subfolder under `Pages/`** (e.g., `Pages/NewTab/`).
2. **Add your HTML file** (e.g., `newtab.html`) containing only the main content inside a `.container` div (no `<html>`, `<body>`, or navbar).
3. **Add your JS file** (e.g., `newtab.js`) and export an initialization function (e.g., `window.initNewtabTab = function() { ... }`).
4. **Update `index.html`**:
   - Add your tab to the `tabMap` object with the correct HTML and JS paths.
5. **Update `navbar.html`**:
   - Add a new `<a>` link with `href="#"` and `data-tab="newtab"`.
6. **Use SPA navigation**:
   - All navigation should use the SPA loader (no direct file links).

## Data Files
- **digimon_data.csv**: Main Digimon dataset.
- **digimon_evolutions.csv**: Evolution relationships.
- **digimon_moves.csv**: Digimon moves.
- **digimon_moves_complete.csv**: Complete moves data.
- **digimon_icon_map.csv**: Icon mapping for Digimon and moves.

## Resource Registry (mcp.json)
All major resources are registered in `mcp.json` with unique IDs for documentation and discoverability.

## Notes
- Legacy files in the root (e.g., `main.html`, `main.js`, `skills.html`, `skills.js`, `skillinfo.html`, `skillinfo.js`) have been removed. Only use the modularized `Pages/` structure for new features.
- For maintainability, always keep HTML and JS for each tab/page in their own subfolder under `Pages/`.
