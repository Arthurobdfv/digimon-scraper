// home.js
// Home page navigation and feature links logic
window.initHomeTab = function() {
    // Add click handlers for feature navigation links
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            if (tab && window.loadTab) {
                window.loadTab(tab);
            }
        });
    });
};
