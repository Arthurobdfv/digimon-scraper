# CSV Path Configuration

## Overview

All CSV file paths for browser-side code are now centralized in `config.js` as global variables. This allows future path changes to be made in only one place.

## Usage

**IMPORTANT**: Add `config.js` before other scripts in `index.html`:

```html
<script src="config.js"></script>
<script src="Experimentation/buildDigimonEvolutionGraph.js"></script>
<script src="Experimentation/getDigimonsForMove.js"></script>
<!-- other scripts -->
```

## Available Global Variables

| Variable Name | Path | Usage |
|---------------|------|-------|
| `window.DIGIMON_DATA_PATH` | `Database/digimon_data.csv` | Root-level files |
| `window.DIGIMON_EVOLUTIONS_PATH` | `Database/digimon_evolutions.csv` | Root-level files |
| `window.DIGIMON_MOVES_PATH` | `Database/digimon_moves.csv` | Root-level files |
| `window.DIGIMON_MOVES_COMPLETE_PATH` | `Database/digimon_moves_complete.csv` | Root-level files |
| `window.DIGIMON_ICON_MAP_PATH` | `Database/digimon_icon_map.csv` | Root-level files |
| `window.DIGIMON_DATA_PATH_RELATIVE` | `../../Database/digimon_data.csv` | Files in Pages/* subdirectories |
| `window.DIGIMON_EVOLUTIONS_PATH_RELATIVE` | `../../Database/digimon_evolutions.csv` | Files in Pages/* subdirectories |
| `window.DIGIMON_MOVES_PATH_RELATIVE` | `../../Database/digimon_moves.csv` | Files in Pages/* subdirectories |
| `window.DIGIMON_MOVES_COMPLETE_PATH_RELATIVE` | `../../Database/digimon_moves_complete.csv` | Files in Pages/* subdirectories |
| `window.DIGIMON_ICON_MAP_PATH_RELATIVE` | `../../Database/digimon_icon_map.csv` | Files in Pages/* subdirectories |
| `window.DIGIMON_DATA_PATH_DATA` | `data/digimon_data.csv` | Alternative data directory |
| `window.DIGIMON_EVOLUTIONS_PATH_DATA` | `data/digimon_evolutions.csv` | Alternative data directory |
| `window.DIGIMON_MOVES_PATH_DATA` | `data/digimon_moves.csv` | Alternative data directory |
| `window.DIGIMON_MOVES_COMPLETE_PATH_DATA` | `data/digimon_moves_complete.csv` | Alternative data directory |
| `window.DIGIMON_ICON_MAP_PATH_DATA` | `data/digimon_icon_map.csv` | Alternative data directory |

## Example Usage

Instead of:
```javascript
fetch('../../Database/digimon_data.csv')
```

Use:
```javascript
fetch(window.DIGIMON_DATA_PATH_RELATIVE)
```

## Files Updated

The following files have been updated to use the centralized configuration:

- `Pages/Browse/browse.js`
- `Pages/Aggregate/aggregate.js`
- `Pages/EvolutionPath/evolution_path.js`
- `digimon_pathfinder_tab.js`
- `main.js`
- `index.html` (to include config.js)

## Benefits

1. **Single source of truth**: All CSV paths are defined in one place
2. **Easy maintenance**: Path changes only need to be made in `config.js`
3. **Consistency**: All files use the same path variables
4. **Flexibility**: Different path patterns are supported for different contexts