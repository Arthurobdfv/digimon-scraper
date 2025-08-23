// spaNavigation.js
// Reusable SPA tab navigation helper for DigimonScraper

/**
 * Navigates to a tab using SPA routing, updating browser history.
 * @param {string} tabName - The tab key (e.g. 'skillinfo')
 * @param {Object} params - Key-value pairs for query params (optional)
 */
window.navigateToTab = function(tabName, params = {}) {
    let hash = `#${tabName}`;
    const paramStr = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
    if (paramStr) hash += `?${paramStr}`;
    window.location.hash = hash;
};
