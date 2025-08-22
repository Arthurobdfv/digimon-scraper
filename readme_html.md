# test copy.html Documentation

## Overview
`test copy.html` is the main user interface for the DigimonScraper application. It allows users to browse, filter, and aggregate Digimon data using static datasets loaded from CSV resources in the Database directory (`Database/digimon_data.csv`, `Database/digimon_evolutions.csv`, `Database/digimon_moves.csv`).

## Components

### 1. Navigation Bar
- Uses Bootstrap for styling.
- Displays the application title: "Digimon CSV Multi-Select Explorer".

### 2. Tabbed Interface
- Two main tabs: **Explore** and **Aggregate**.
  - **Explore Tab**: Displays a searchable and filterable table of Digimon data.
  - **Aggregate Tab**: Allows users to group and count Digimon data by selected columns.

### 3. Data Loading
- Data is loaded from static JavaScript arrays (`digimonData`, `digimonEvolutions`, `digimonMoves`).
- No file upload is required; the data is sourced from the CSV files included in the project.

### 4. Table Rendering
- The Explore tab renders a responsive table of Digimon data.
- Columns are dynamically generated based on the data structure.
- Each column header is clickable for sorting.
- Filter dropdowns are available for each column, allowing multi-select filtering.

### 5. Aggregation
- The Aggregate tab provides dropdowns to select columns for grouping.
- Supports single-level and two-level aggregation (group by one or two columns).
- Displays counts for each group in a table format.

### 6. JavaScript Logic
- Uses Bootstrap for UI components and styling.
- Handles table rendering, sorting, filtering, and aggregation in pure JavaScript.
- Dropdowns are managed for accessibility and usability.

## Technical Details
- Responsive design using Bootstrap 5.
- No external dependencies except Bootstrap and (previously) PapaParse (now unused).
- All data manipulation is done client-side in JavaScript.
- Easily extensible to include more Digimon data or features.

## How to Use
1. Ensure the static data arrays are populated with data from the CSV files.
2. Open `test copy.html` in a web browser.
3. Use the Explore tab to search and filter Digimon.
4. Use the Aggregate tab to group and count Digimon by attributes.

---
This file documents the structure and technical details of `test copy.html` for future reference and development.
