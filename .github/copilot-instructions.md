# Copilot Instructions for DigimonScraper

## UI Design System & Styling Guidelines

### Glass Morphism Design Language
- **Background**: Linear gradient (`linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`)
- **Primary Colors**: Orange accents (`#ff6b35`, `#f7931e`) for branding and highlights
- **Text Colors**: Bright text (`#e8f0fe`) for primary content, muted (`#b8c6db`) for secondary
- **Card Design**: Translucent with `backdrop-filter: blur(10px)` and subtle borders

### CSS Architecture
- **Global Styles**: `styles/global.css` - shared components (navbar, cards, tables, forms, buttons)
- **Page-Specific**: `styles/[pagename].css` - page-specific enhancements and layouts
- **Responsive**: Mobile-first Bootstrap grid with fluid containers and collapsible navigation

### Component Styling Standards

#### Cards
```css
.card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: #e8f0fe;
    transition: all 0.3s ease;
}
.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 107, 53, 0.3);
}
```

#### Form Controls
- **Base**: Semi-transparent background with glass effect
- **Focus**: Orange border (`#ff6b35`) with glow effect
- **Disabled**: Reduced opacity (0.6), lighter background, not-allowed cursor
- **Placeholders**: Muted color (`#b8c6db`) for clarity
```css
.form-control:disabled, .form-select:disabled {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
    color: rgba(184, 198, 219, 0.4);
    opacity: 0.6;
    cursor: not-allowed;
}
```

#### Tables
- **Headers**: Orange color (`#ff6b35`) with medium weight
- **Cells**: Bright text (`#e8f0fe`) for readability
- **Hover**: Subtle highlight with orange undertone
- **Responsive**: Always wrap in `.table-responsive` for mobile

#### Buttons
- **Primary**: Orange gradient backgrounds with hover transforms
- **Secondary**: Translucent with glass effect
- **Disabled**: Reduced opacity and interaction feedback
```css
.btn-primary {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border: none;
    transform: translateY(0);
    transition: all 0.3s ease;
}
.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}
```

#### Navigation
- **Navbar**: Glass morphism with brand orange highlighting
- **Links**: Smooth transitions with underline animations
- **Active States**: Orange accents with visual feedback

### Layout Patterns

#### Page Structure
1. **Header Card**: Descriptive title and explanation
2. **Configuration Cards**: User inputs and settings
3. **Results Area**: Dynamic content display
4. **Consistent Spacing**: Bootstrap grid with proper gutters

#### Header Card Template
```html
<div class="card">
    <div class="card-header">
        <h2 class="mb-0">[Page Title]</h2>
    </div>
    <div class="card-body">
        <p class="mb-0">[Brief description of page functionality]</p>
    </div>
</div>
```

#### Responsive Considerations
- Mobile-first design with collapsible navigation
- Flexible card layouts that stack appropriately
- Readable text sizes across all devices
- Touch-friendly interactive elements

### Interactive Elements

#### Tooltips
- Use Bootstrap tooltips with custom orange styling
- Provide context for complex features
- Position thoughtfully to avoid interference
```html
<span class="info-tooltip" data-bs-toggle="tooltip" 
      title="Helpful explanation">i</span>
```

#### Dropdowns
- Glass morphism styling consistent with overall theme
- Orange highlights for active/selected states
- Smooth animations and transitions

#### Form Validation
- Orange border colors for focus states
- Clear error messaging with appropriate contrast
- Disabled states with reduced opacity and visual feedback

### Accessibility & UX
- High contrast text colors for readability
- Clear visual hierarchy with proper heading structure
- Consistent interaction patterns across all components
- Loading states and error handling with appropriate feedback

### Implementation Notes
- Always include `styles/global.css` in all pages
- Use Bootstrap 5.3.2 classes as foundation, override with custom styling
- Test disabled states and hover effects across all form elements
- Ensure SPA navigation works correctly with `data-tab` attributes
- Maintain glass morphism aesthetic throughout all new components

## UI Extension: Adding New Tabs/Screens
- To add a new tab/screen:
	1. Create a new HTML file (e.g., `newtab.html`) and a corresponding JS file (e.g., `newtab.js`) in the appropriate directory (`Pages/NewTab/`).
	2. Add the tab's content and logic, following the modular pattern:
		- Use the standardized card-based layout with header cards for page titles
		- Include global.css for consistent styling across all pages
		- Use container-fluid for responsive layouts
		- Follow the glass morphism design pattern with translucent cards
	3. Update the navbar in `navbar.html` to include the new tab, ensuring consistent order and highlighting.
	4. Add the new tab to the `tabMap` object in `index.html` for SPA routing.
- Example: For a "Team Builder" tab, create `Pages/TeamBuilder/teambuilder.html` and `teambuilder.js`, add the screen code with proper card layout, update navbar and tabMap.
- Best practices: 
	- Use the same navbar structure and card-based layouts for all screens
	- Include descriptive header cards with titles and descriptions
	- Apply consistent spacing with Bootstrap grid system
	- Test navigation and ensure proper SPA routing
	- Keep code modular (one HTML/JS per tab)
- CSS Architecture: All screens share `styles/global.css` for consistent theming. Page-specific styles go in `styles/[pagename].css`.
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
- **Design System**: Modern glass morphism UI with gradient backgrounds, translucent cards, and orange accent colors (#ff6b35, #f7931e).
- **CSS Architecture**: 
	- `styles/global.css`: Base styles, navbar, cards, tables, buttons, forms - shared across all pages
	- `styles/[page].css`: Page-specific styles (e.g., `home.css` for feature cards)
	- All pages use consistent card-based layouts with descriptive headers
- **Responsive Design**: Mobile-first approach with Bootstrap grid, collapsible navbar, and fluid containers.
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
- **Design System Maintenance**: Update `styles/global.css` for cross-page changes, create `styles/[page].css` for page-specific styles.
- **UI Consistency**: All pages follow the same pattern - header card with title/description, content in cards, consistent spacing.
- For Node.js scripts (e.g., scraping, batch fixes), run with `node scriptname.js` from the project root.
- Data scraping scripts output CSVs to `Database/` (local dev) but for deployment, copy to `data/`.
- Debugging: Use browser console for client-side errors; Node scripts log to console or `.txt` files.
- For deployment (GitHub Pages, etc.), ensure all CSVs are in `data/` and paths in JS/HTML reference `data/`.

## Project-Specific Conventions

## SPA Redirection Guidelines

### Reasoning & Architecture
- DigimonScraper is a modular Single Page Application (SPA) managed via `index.html`.
- Navigation between tabs/screens is handled dynamically using hash-based URLs (e.g., `#skillinfo?name=MoveName`).
- SPA routing ensures a seamless user experience, preserves UI state, and supports deep linking/bookmarking.

### Guidelines
1. **Hash-Based Routing**
    - Always redirect to tabs/screens using hash URLs: `/index.html#tabname?param=value`
    - Example: `/index.html#skillinfo?name=MoveName`
    - This triggers the SPA loader to dynamically load the correct tab content.

2. **Tab Registration**
    - All tabs/screens must be registered in the SPA loader (`tabMap` in `index.html`).
    - Update the navbar and `tabMap` when adding new tabs.

3. **Avoid Direct File Links**
    - Do not link directly to HTML files (e.g., `/Pages/SkillInfo/skillinfo.html`).
    - Direct file links bypass SPA logic, cause full reloads, and may result in 404 errors.

4. **Consistent Link Generation**
    - Generate all internal navigation links in JS/HTML using the SPA hash format.
    - Example:
      `<a href="/index.html#skillinfo?name=${encodeURIComponent(skillName)}">Skill Info</a>`

5. **Deep Linking & Bookmarking**
    - Hash-based URLs allow users to bookmark/share direct links to specific tabs/screens with parameters.

6. **Testing**
    - Test navigation from all tabs to ensure links trigger SPA routing and load content as expected.

### Implementation Notes
- SPA navigation uses hash-based URLs for deep linking.
- Skill links in tables use SPA navigation, not direct HTML links.
- To add a new tab/screen, create the HTML/JS in `Pages/`, update the navbar and `tabMap` in `index.html`.
- All screens share `styles/global.css` for consistent theming.
- Maintain glass morphism aesthetic and consistent card-based layouts across all tabs.

---

For all internal navigation, use `/index.html#tabname?params` to leverage SPA routing. Never link directly to HTML files for tab navigation. This ensures smooth, consistent, and maintainable user experience across the DigimonScraper application.

## Integration Points & Dependencies
- External dependencies: PapaParse (browser), Bootstrap (UI), Node.js (for scripts).
- No backend/server required; all data is loaded client-side.
- PowerShell script (`download_digimon_icons.ps1`) for icon downloading (Windows only).
- Node scripts for scraping and batch fixes are in the project root and `TestData/`.

## Key Files & Directories
- `index.html`: SPA loader, tab navigation, entry point. Includes `styles/global.css` for consistent theming.
- `Pages/`: Contains all tab HTML/JS files (e.g., `EvolutionPath/evolution_path.js`).
- `styles/`: CSS architecture with `global.css` (shared) and page-specific CSS files.
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
