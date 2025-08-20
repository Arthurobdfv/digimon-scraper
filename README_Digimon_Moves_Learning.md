# Digimon Moves Data Enrichment Process

## Overview
This document describes the process used to enrich the `digimon_moves.csv` file for the Digimon browser app, specifically how additional move details were fetched, parsed, and merged from grindosaur.com.

## Initial State
- The local `digimon_moves.csv` contained basic move information, but lacked several important columns: Icon, Attribute, Type, SP Cost, Power, and Inheritable.
- These columns are necessary for a complete Digimon move database and a richer user experience in the app.

## Fetching Data
- Attempting to fetch the moves table from grindosaur.com using standard HTTP requests (e.g., `fetch` or static scraping) did not work, because the table is rendered dynamically with JavaScript and is not present in the initial HTML response.

## Using Puppeteer MCP Server
- To solve this, the Puppeteer MCP server was used. Puppeteer is a browser automation tool that can load pages, execute JavaScript, and interact with dynamic content just like a real user.
- By navigating to the moves page in a browser context, Puppeteer was able to access the fully rendered moves table, including all columns and icons.

## Parsing and Merging
- The table HTML was extracted and parsed row by row.
- For each move, the following columns were captured:
  - **Icon**: URL to the move's icon image.
  - **Name**: Move name.
  - **Attribute**: Elemental attribute (e.g., Fire, Water).
  - **Type**: Move type (Physical, Magic, Support, etc.).
  - **SP Cost**: The SP cost to use the move.
  - **Power**: The move's power value.
  - **Inheritable**: Boolean flag indicating if the move is inheritable (parsed from a checkmark icon).
- The enriched data was then merged into the local CSV, either by overwriting or creating a new file, ensuring all moves have complete details.

## Lessons Learned
- Dynamic web content often requires browser automation for scraping.
- Puppeteer MCP server is essential for extracting data from JavaScript-rendered tables.
- Parsing HTML tables and mapping columns is straightforward once the rendered content is available.

## Additional Insights & Troubleshooting

- Always verify the output file after scraping, as manual edits or previous runs may leave files incomplete or with formatting issues.
- If the output CSV is empty, check for errors in the terminal and review the scrape log for details.
- Ensure the script writes to the correct destination file and includes all required columns for downstream use.
- The moves table on grindosaur.com is dynamic and may change; always confirm the number of moves scraped matches the expected count (currently 503).
- For best results, update the script to directly scrape the moves table at https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/moves, rather than aggregating from individual Digimon pages.
- When troubleshooting, check for dependency issues (e.g., Puppeteer installation) and browser launch errors.
- Document every step and update the README after major changes to the scraping logic or data format.

## Future Use


## Recent Automated Fetch (August 19, 2025)
To ensure the moves table is up-to-date, the following steps were performed using the Puppeteer MCP Server:

1. Navigated to https://www.grindosaur.com/en/games/digimon-story-cyber-sleuth/moves using Puppeteer MCP Server.
2. Waited for the page to fully render the moves table (dynamic JavaScript content).
3. Executed a browser-side script to count the number of table rows:
  - `Array.from(document.querySelectorAll('table tbody tr')).length`
4. Result: The moves table currently contains **503 move records**.

This confirms the table is dynamic and must be accessed via browser automation. The process can be repeated for future updates or to extract the full table for enrichment.
