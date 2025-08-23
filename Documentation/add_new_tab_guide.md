# How to Add a New Tab/Screen to the DigimonScraper Web App

This guide summarizes the process for adding a new tab (screen) to the DigimonScraper web application. Follow these steps for a consistent, modular UI and navigation experience.

## 1. Create the HTML and JS Files
- Create a new `.html` file for the tab (e.g., `newtab.html`).
- Create a corresponding `.js` file for the tab's logic (e.g., `newtab.js`).

## 2. Add the Screen Code
- In the `.html` file:
  - Add the standard Bootstrap navbar (copy from an existing tab for consistency).
  - Add containers for your tab's content (tables, filters, etc.).
  - Link the new `.js` file at the bottom of the HTML.
- In the `.js` file:
  - Implement the logic to load, display, and interact with data as needed for the tab.

## 3. Add the New Tab to the Navbar of All Screens
- Edit the navbar in every existing `.html` file:
  - Add a new `<li class="nav-item"><a class="nav-link" href="newtab.html">New Tab</a></li>` entry.
  - Ensure the current tab is highlighted with the `active` class.
  - Keep the order and style consistent across all screens.

## Example
Suppose you want to add a "Skill Info" tab:
1. Create `skillinfo.html` and `skillinfo.js`.
2. Add the screen code to `skillinfo.html` and implement logic in `skillinfo.js`.
3. Add `<a class="nav-link" href="skillinfo.html">Skill Info</a>` to the navbar in all other `.html` files.

## Best Practices
- Always use the same navbar structure for all screens.
- Place the new tab logically in the navigation order.
- Test navigation to ensure all tabs are accessible and highlighted correctly.
- Keep your code modular: each tab should have its own HTML and JS file.

---

This file is now part of the MCP resources. Refer to it whenever you add a new tab or screen to the project.
