## UI Extension: Adding New Tabs/Screens
- To add a new tab/screen:
	1. Create a new HTML file (e.g., `newtab.html`) and a corresponding JS file (e.g., `newtab.js`) in the appropriate directory.
	2. Add the tab's content and logic, following the modular pattern (Bootstrap navbar, content containers, JS logic at the bottom).
	3. Update the navbar in every existing HTML file to include the new tab, ensuring consistent order and highlighting with the `active` class.
- Example: For a "Skill Info" tab, create `skillinfo.html` and `skillinfo.js`, add the screen code, and update all navbars.
- Best practices: Use the same navbar structure for all screens, place the new tab logically, test navigation, and keep code modular (one HTML/JS per tab).
- Refer to `Documentation/add_new_tab_guide.md` for step-by-step instructions and examples.
# Copilot Instructions for DigimonScraper
## Commit Message Guidelines for Copilot

When Copilot generates commits, follow these rules:

- Always include a summary of the change in the first line (max 72 characters).
- List all affected files or modules in the commit body.
- Briefly describe the reason for the change and its impact.
- Use imperative mood (e.g., "Fix bug" not "Fixed bug").
- If the commit is related to a user request, reference the request or issue number if available.

Example:

	Update browse.js to fix Digimon icon loading

	- Modified browse.js to remove parentheses from icon lookup
	- Resolves 404 errors for icons with parentheses
	- Affected: Pages/Browse/browse.js

Document any additional commit message requirements here as the project evolves.

## Big Picture Architecture & Strategic Insights
- The project is a modular web application for browsing, searching, and analyzing Digimon data, evolutions, and moves.
- Core gameplay logic is based on Digimon Story: Cyber Sleuth mechanics, including:
	- Type effectiveness (Vaccine/Data/Virus triangle, Free type)
	- Attribute effectiveness (Fire, Plant, Water, Electric, Wind, Earth, Light, Dark, Neutral)
	- Damage multipliers: x2 (advantage), x0.5 (disadvantage), x3 (double), x0.25 (double disadvantage)
- Strategic evolution planning uses branching, backtracking, and move inheritance to maximize elemental coverage.
- Example optimal paths (Patamon→Seraphimon, DemiDevimon→VenomMyotismon) are used for coverage against opposing types.
- CSV data and scripts automate analysis of optimal paths and movesets, based on effectiveness rules.
## Gameplay & Evolution Planning Patterns
- Digimon can evolve and de-digivolve freely, with branching evolutionary trees and requirements (level, stats, CAM, ABI, items).
- Move inheritance and branching are key for building Digimon with optimal movesets.
- Use branching/backtracking, shortcuts, and move inheritance to efficiently build Digimon with coverage for all elements.
- Always seek shortest paths and leverage shared ancestors for efficient team building.
- Example step-by-step guides for building Seraphimon and VenomMyotismon with optimal moves are in Documentation/.
- Data is stored in CSV files in the `data/` directory (for deployment) and parsed client-side using PapaParse.
- The UI is a Single Page Application (SPA) managed via `index.html`, with tabs/pages loaded dynamically from the `Pages/` directory.
- Major UI tabs: Browse, Details, Evolution Path, Skill Info, Skills, Aggregate. Each tab has its own HTML/JS in `Pages/`.
- Navigation and tab loading are handled by the SPA loader in `index.html`.
- All Digimon icons are stored in `Icons/Digimon/`, and move icons in `Icons/Moves/`.

## Developer Workflows
- No build step required for browser code; just open `index.html` in a browser or deploy to a static host.
- For Node.js scripts (e.g., scraping, batch fixes), run with `node scriptname.js` from the project root.
- Data scraping scripts output CSVs to `Database/` (local dev) but for deployment, copy to `data/`.
- Debugging: Use browser console for client-side errors; Node scripts log to console or `.txt` files.
- For deployment (GitHub Pages, etc.), ensure all CSVs are in `data/` and paths in JS/HTML reference `data/`.

## Project-Specific Conventions
- Any data-fixing or one-off scripts (not part of the main application) should be placed in the `Temp/` folder. This includes scripts for migration, validation, or batch fixes that are only run occasionally.
- All data fetches in browser code use relative paths to `Database/` (not `data/`).
- SPA navigation uses hash-based URLs (e.g., `#skillinfo?name=MoveName`) for deep linking.
- Skill links in tables use SPA navigation, not direct HTML links.
- Move learning and pathfinding logic is modularized for both UI and Node use (see `getDigimonsForMove.js`, `evolution_path.js`).
- Debug/progress logs are written to `.txt` files for long-running Node scripts.
- All CSV parsing uses PapaParse for consistency.

## Integration Points & Dependencies
- External dependencies: PapaParse (browser), Bootstrap (UI), Node.js (for scripts).
- No backend/server required; all data is loaded client-side.
- PowerShell script (`download_digimon_icons.ps1`) for icon downloading (Windows only).
- Node scripts for scraping and batch fixes are in the project root and `TestData/`.

## Key Files & Directories
- `index.html`: SPA loader, tab navigation, entry point.
- `Pages/`: Contains all tab HTML/JS files (e.g., `EvolutionPath/evolution_path.js`).
- `data/`: CSV data files for deployment.
- `Icons/`: Digimon and move icons.
- `getDigimonsForMove.js`, `evolution_path.js`, `threatAnalysis.js`: Core logic modules for pathfinding and analysis.
- `scrape_digimon_evolutions.js`, `scrape_digimon_moves.js`: Data scraping scripts.
- `README.md`: Project overview and feature summary.

## Example Patterns
- To add a new tab: create HTML/JS in `Pages/`, update `index.html` tabMap, and ensure SPA loader can load it.
- To add new data: update CSVs in `data/`, ensure fetch paths in JS reference `data/`.
- To extend pathfinding: update logic in `getDigimonsForMove.js` and `evolution_path.js`, keep UI and Node code modular.

---

For questions or unclear conventions, review `README.md`, the relevant tab JS files in `Pages/`, and the strategic/gameplay documentation in `Documentation/`. Iterate and document new patterns as the codebase evolves.
