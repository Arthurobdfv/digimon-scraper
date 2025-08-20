# Digimon Browser Project Structure

## Overview
This project is a modular Digimon browser and aggregator web app. It allows users to browse Digimon data, filter by various attributes, and aggregate data by any column. The UI is organized with a Bootstrap navbar for easy navigation between features.

## Project Structure

```
DigimonScraper/
├── aggregate.html        # Aggregation feature UI
├── aggregate.js          # Aggregation logic
├── browse.html           # Digimon browser UI
├── browse.js             # Digimon browser logic
├── digimon_data.csv      # Main Digimon data
├── digimon_evolutions.csv# Digimon evolutions data
├── digimon_moves.csv     # Digimon moves data
├── main.html             # (Legacy) Entry point, now only for navigation
├── main.js               # (Legacy) Old browser logic
├── package.json          # Project metadata
├── project_structure.readme.md # This documentation file
└── mcp.json              # Resource registry
```

## Separation of HTML and JS Files
- **browse.html** and **browse.js**: Digimon table browser and filtering UI/logic.
- **aggregate.html** and **aggregate.js**: Aggregation feature UI/logic.
- Each feature is kept in its own HTML and JS file for maintainability and clarity.

## Navbar Features
The Bootstrap navbar is present in both `browse.html` and `aggregate.html`, providing links to:
- **Browse**: Opens the Digimon browser table and filters (`browse.html`).
- **Aggregate**: Opens the aggregation feature for grouping and counting Digimon data (`aggregate.html`).

### Navbar Components
- **Browse**: Displays a searchable/filterable table of Digimon, with dropdown checklist filters for Attribute, Type, and Stage.
- **Aggregate**: Allows users to select one or two columns to group by, displaying a table of counts for each group.

## Data Files
- **digimon_data.csv**: Main Digimon dataset.
- **digimon_evolutions.csv**: Evolution relationships.
- **digimon_moves.csv**: Digimon moves.

## Legacy Files
- **main.html** and **main.js**: Previous entry point and logic, now superseded by modularized files.

## Resource Registry (mcp.json)
All major resources are registered in `mcp.json` with unique IDs for documentation and discoverability.
