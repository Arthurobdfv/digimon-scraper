// config.js
// Centralized CSV file paths for browser-side code
// This file should be loaded before other scripts in index.html

// Global variables for CSV file paths
window.DIGIMON_DATA_PATH = 'Database/digimon_data.csv';
window.DIGIMON_EVOLUTIONS_PATH = 'Database/digimon_evolutions.csv';
window.DIGIMON_MOVES_PATH = 'Database/digimon_moves.csv';
window.DIGIMON_MOVES_COMPLETE_PATH = 'Database/digimon_moves_complete.csv';
window.DIGIMON_ICON_MAP_PATH = 'Database/digimon_icon_map.csv';

// For pages in subdirectories (Pages/*/), use relative paths
window.DIGIMON_DATA_PATH_RELATIVE = '../../Database/digimon_data.csv';
window.DIGIMON_EVOLUTIONS_PATH_RELATIVE = '../../Database/digimon_evolutions.csv';
window.DIGIMON_MOVES_PATH_RELATIVE = '../../Database/digimon_moves.csv';
window.DIGIMON_MOVES_COMPLETE_PATH_RELATIVE = '../../Database/digimon_moves_complete.csv';
window.DIGIMON_ICON_MAP_PATH_RELATIVE = '../../Database/digimon_icon_map.csv';

// Alternative data directory paths (for evolution_path.js compatibility)
window.DIGIMON_DATA_PATH_DATA = 'data/digimon_data.csv';
window.DIGIMON_EVOLUTIONS_PATH_DATA = 'data/digimon_evolutions.csv';
window.DIGIMON_MOVES_PATH_DATA = 'data/digimon_moves.csv';
window.DIGIMON_MOVES_COMPLETE_PATH_DATA = 'data/digimon_moves_complete.csv';
window.DIGIMON_ICON_MAP_PATH_DATA = 'data/digimon_icon_map.csv';