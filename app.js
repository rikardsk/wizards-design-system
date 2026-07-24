/**
 * Hexagonal Map Generator
 * Wizards of the North
 */

// Define available tiles and their relative path names
const TILE_MANIFEST = [
    { id: "Grass", label: "Grass", file: "Grass.png" },
    { id: "Forrest L1", label: "Forest I", file: "Forrest L1.png" },
    { id: "Forrest L2", label: "Forest II", file: "Forrest L2.png" },
    { id: "Forrest L3", label: "Forest III", file: "Forrest L3.png" },
    { id: "Forrest L4", label: "Forest IV", file: "Forrest L4.png" },
    { id: "Mountain L1", label: "Mountain I", file: "Mountain L1.png" },
    { id: "Mountain L2", label: "Mountain II", file: "Mountain L2.png" },
    { id: "Mountain L3", label: "Mountain III", file: "Mountain L3.png" },
    { id: "Mountain L4", label: "Mountain IV", file: "Mountain L4.png" },
    { id: "Plain L1", label: "Plain I", file: "Plain L1.png" },
    { id: "Plain L2", label: "Plain II", file: "Plain L2.png" },
    { id: "Plain L3", label: "Plain III", file: "Plain L3.png" },
    { id: "Plain L4", label: "Plain IV", file: "Plain L4.png" },
    { id: "Swamp L1", label: "Swamp I", file: "Swamp L1.png" },
    { id: "Swamp L2", label: "Swamp II", file: "Swamp L2.png" },
    { id: "Swamp L3", label: "Swamp III", file: "Swamp L3.png" },
    { id: "Swamp L4", label: "Swamp IV", file: "Swamp L4.png" },
    { id: "Wizards Tower L1", label: "Tower I", file: "Wizards Tower L1.png" },
    { id: "Wizards Tower L2", label: "Tower II", file: "Wizards Tower L2.png" },
    { id: "Wizards Tower L3", label: "Tower III", file: "Wizards Tower L3.png" },
    { id: "Wizards Tower L4", label: "Tower IV", file: "Wizards Tower L4.png" },
    { id: "Active Volcanic Forge", label: "Volcanic Forge", file: "Active Volcanic Forge.png" },
    { id: "Cave Network", label: "Cave Network", file: "Cave Network.png" },
    { id: "Coastal Fort", label: "Coastal Fort", file: "Coastal Fort.png" },
    { id: "Dragons Peak", label: "Dragon's Peak", file: "Dragons Peak.png" },
    { id: "Forest", label: "Forest", file: "Forest.png" },
    { id: "Grove Temple", label: "Grove Temple", file: "Grove Temple.png" },
    { id: "Misty Swamp", label: "Misty Swamp", file: "Misty Swamp.png" },
    { id: "Plains Town", label: "Plains Town", file: "Plains Town.png" },
    { id: "Ruined Mountain Pass", label: "Ruined Pass", file: "Ruined Mountain Pass.png" },
    { id: "Scorched Earth", label: "Scorched Earth", file: "Scorched Earth.png" },
    { id: "Tower of terror", label: "Tower of Terror", file: "Tower of terror.png" }
];

// Hexagon Dimensions (Perfect flat-topped regular hexagon)
const HEX_WIDTH = 128;
const HEX_HEIGHT = 111;
const DX = 96; // 0.75 * HEX_WIDTH (horizontal distance between column centers)
const DY = 111; // vertical distance between row centers in same column

// Seeded Pseudo-Random Generator (LCG)
class SeededRandom {
    constructor(seedStr) {
        let h = 1779033703 ^ seedStr.length;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        }
        this.seed = h >>> 0;
    }
    next() {
        this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
        return this.seed / 4294967296;
    }
}

// App State
const state = {
    cols: 15,
    rows: 10,
    seed: "12345",
    showGrid: true,
    useHires: false,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isPanning: false,
    startPanX: 0,
    startPanY: 0,
    selectedBrush: null, // null means select mode / no painting brush active
    mapData: [],         // 2D Array of tile IDs
    mode: "auto",        // "auto" (procedural) or "manual" (user edited)
    hoveredCell: null,   // { col, row } currently hovered
    isPainting: false,   // Mouse drag painting state
    images: {},          // Preloaded Image elements (loadedImages)
    startVertical: true, // Start towers axis (true = Left-Right Columns, false = Top-Bottom Rows)
    showTiles: true,     // Toggle showing tile artwork (true = show images, false = show biome flat colors)
    showBorders: true,   // Toggle showing inside biome borders (true = show borders, false = hide borders)
    fixedDimensions: true, // Whether the map dimensions are limited (true) or infinite (false)
    manualTowers: false,   // Whether wizard towers are placed manually by the user
    showCenter: false,     // Whether the center tile(s) of the board are highlighted
    maxCols: 30,          // Maximum columns slider setting (default 30)
    maxRows: 30,          // Maximum rows slider setting (default 30)
    playerCount: 2,       // Number of players (2 to 4)
    playerStartCells: [null, null, null, null], // Starting coordinates for each player
    mapName: "",                                // Current map name
    selectedMapId: null,                        // Currently selected map ID
    isNewSessionMap: true,                      // Whether this is a new session map
    maps: [],                                   // Saved maps list
    activeFilters: { size: null, players: null }, // Active filter state
    hiddenTiles: new Set(),                          // Tiles hidden from the paint brush palette
    quests: []                                      // Active quests configuration (each with name, tileId, x, y)
};

// UI Elements
const canvas = document.getElementById("map-canvas");
const ctx = canvas.getContext("2d");
const canvasWrapper = document.getElementById("canvas-wrapper");
const colsSlider = document.getElementById("cols-slider");
const rowsSlider = document.getElementById("rows-slider");
const colsVal = document.getElementById("cols-val");
const rowsVal = document.getElementById("rows-val");
const seedInput = document.getElementById("seed-input");
const randomSeedBtn = document.getElementById("random-seed-btn");
const generateBtn = document.getElementById("generate-btn");
const gridToggle = document.getElementById("grid-toggle");
const hiresToggle = document.getElementById("hires-toggle");
const centerToggle = document.getElementById("center-toggle");
const zoomSlider = document.getElementById("zoom-slider");
const zoomVal = document.getElementById("zoom-val");
const modeBadge = document.getElementById("mode-badge");
const dimensionsDisplay = document.getElementById("dimensions-display");
const coordinatesDisplay = document.getElementById("coordinates-display");

// Settings Modal Selectors
const gridSettingsBtn = document.getElementById("grid-settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelSettingsBtn = document.getElementById("cancel-settings-btn");
const saveSettingsBtn = document.getElementById("save-settings-btn");
const maxColsInput = document.getElementById("max-cols-input");
const maxRowsInput = document.getElementById("max-rows-input");
const tilePalette = document.getElementById("tile-palette");
const clearMapBtn = document.getElementById("clear-map-btn");
const clearCanvasBtn = document.getElementById("clear-canvas-btn");
const resetModeBtn = document.getElementById("reset-mode-btn");
const exportPngBtn = document.getElementById("export-png-btn");
const exportSvgBtn = document.getElementById("export-svg-btn");
const centerMapBtn = document.getElementById("center-map-btn");
const exportJsonBtn = document.getElementById("export-json-btn");
const importJsonBtn = document.getElementById("import-json-btn");
const importJsonInput = document.getElementById("import-json-input");
const startAxisToggle = document.getElementById("start-axis-toggle");
const startAxisLabel = document.getElementById("start-axis-label");
const startAxisContainer = document.getElementById("start-axis-container");
const tilesToggle = document.getElementById("tiles-toggle");
const bordersToggle = document.getElementById("borders-toggle");
const mapTooltip = document.getElementById("map-tooltip");
const dimensionsToggle = document.getElementById("dimensions-toggle");
const manualTowersToggle = document.getElementById("manual-towers-toggle");
const playerCountSelect = document.getElementById("player-count-select");
const playerPositionsContainer = document.getElementById("player-positions-container");
const dimensionsResetBtn = document.getElementById("dimensions-reset-btn");
const terrainResetBtn = document.getElementById("terrain-reset-btn");
const towersResetBtn = document.getElementById("towers-reset-btn");
const playersResetBtn = document.getElementById("players-reset-btn");
const displayResetBtn = document.getElementById("display-reset-btn");

// Map Manager UI Elements
const mapNameInput = document.getElementById("map-name-input");
const mapListContainer = document.getElementById("map-list-container");
const mapsCountDisplay = document.getElementById("maps-count");
const newMapBtn = document.getElementById("new-map-btn");
const exportMapsBtn = document.getElementById("export-maps-btn");
const importMapsBtn = document.getElementById("import-maps-btn");
const importMapsFileInput = document.getElementById("import-maps-file");
const clearMapsBtn = document.getElementById("clear-maps-btn");
const mapManagerToggleBtn = document.getElementById("map-manager-toggle-btn");
const mapManagerSidebar = document.getElementById("map-manager-sidebar");

// Tile Visibility Modal Elements
const manageTilesBtn = document.getElementById("manage-tiles-btn");
const tileVisibilityModal = document.getElementById("tile-visibility-modal");
const closeTileVisibilityBtn = document.getElementById("close-tile-visibility-btn");
const tileVisibilityList = document.getElementById("tile-visibility-list");
const tileVisShowAllBtn = document.getElementById("tile-vis-show-all");
const tileVisHideAllBtn = document.getElementById("tile-vis-hide-all");

// Settings Quest UI elements
const addQuestBtn = document.getElementById("add-quest-btn");
const questsListContainer = document.getElementById("quests-list");


// Left Sidebar Toggle Elements
const leftSidebar = document.getElementById("left-sidebar");
const leftSidebarToggleBtn = document.getElementById("left-sidebar-toggle-btn");
const viewportHeader = document.querySelector(".viewport-header");
const paletteContainer = document.querySelector(".palette-container");


// Initialize application
async function init() {
    // Sync state with initial DOM values (handles browser refresh state caching)
    state.cols = parseInt(colsSlider.value);
    state.rows = parseInt(rowsSlider.value);
    state.seed = seedInput.value;
    state.showGrid = gridToggle.checked;
    state.showTiles = tilesToggle.checked;
    state.showBorders = bordersToggle.checked;
    state.startVertical = startAxisToggle.checked;
    state.useHires = hiresToggle.checked;
    state.fixedDimensions = dimensionsToggle.checked;
    state.manualTowers = manualTowersToggle.checked;
    state.showCenter = centerToggle.checked;
    state.playerCount = parseInt(playerCountSelect.value) || 2;
    state.playerStartCells = [null, null, null, null];
    
    // Set initial slider max properties
    colsSlider.max = state.maxCols;
    rowsSlider.max = state.maxRows;
    
    updateStartAxisVisibility();
    
    // Update labels to match DOM state
    colsVal.value = state.cols;
    rowsVal.value = state.rows;

    // Show CORS warnings if running via file:// protocol and base64 assets aren't loaded
    if (window.location.protocol === "file:" && !window.TILE_ASSETS) {
        const warningBox = document.getElementById("file-protocol-warning");
        if (warningBox) warningBox.style.display = "flex";
    }

    // Initialize Maps DB
    await initMapsDB();
    
    // Sync map name input
    if (mapNameInput) {
        mapNameInput.value = state.mapName;
    }

    // Sync Map Manager collapse state from localStorage
    const mapManagerCollapsed = localStorage.getItem("mapManagerCollapsed") === "true";
    if (mapManagerCollapsed) {
        if (mapManagerSidebar) mapManagerSidebar.classList.add("collapsed");
        if (mapManagerToggleBtn) {
            mapManagerToggleBtn.classList.add("collapsed");
            const icon = mapManagerToggleBtn.querySelector("i");
            if (icon) icon.className = "fa-solid fa-chevron-left";
        }
    } else {
        if (mapManagerToggleBtn) {
            const icon = mapManagerToggleBtn.querySelector("i");
            if (icon) icon.className = "fa-solid fa-chevron-right";
        }
    }

    // Sync Left Sidebar collapse state from localStorage
    const leftSidebarCollapsed = localStorage.getItem("leftSidebarCollapsed") === "true";
    if (leftSidebarCollapsed) {
        if (leftSidebar) leftSidebar.classList.add("collapsed");
        if (leftSidebarToggleBtn) leftSidebarToggleBtn.classList.add("collapsed");
        if (viewportHeader) viewportHeader.classList.add("sidebar-hidden");
        if (paletteContainer) paletteContainer.classList.add("sidebar-hidden");
        const icon = leftSidebarToggleBtn?.querySelector("i");
        if (icon) icon.className = "fa-solid fa-chevron-right";
    } else {
        const icon = leftSidebarToggleBtn?.querySelector("i");
        if (icon) icon.className = "fa-solid fa-chevron-left";
    }
    
    // Setup filter listeners
    setupFilterListeners();

    setupEventListeners();
    renderPalette();
    await loadTileImages();
    generateProceduralMap();
    updatePlayerDropdowns();
    centerMap();
    updateCanvasCursor();

    // Load hidden tiles from localStorage
    loadHiddenTiles();

    draw();
}

// Setup all event handlers
function setupEventListeners() {
    // Sliders
    colsSlider.addEventListener("input", (e) => {
        state.cols = parseInt(e.target.value);
        colsVal.value = state.cols;
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            resizeManualGrid();
        }
        draw();
    });

    colsVal.addEventListener("change", (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 15;
        val = Math.max(3, Math.min(state.maxCols, val)); // Clamp values to [3, state.maxCols]
        e.target.value = val;
        
        state.cols = val;
        colsSlider.value = val;
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            resizeManualGrid();
        }
        draw();
    });
    
    rowsSlider.addEventListener("input", (e) => {
        state.rows = parseInt(e.target.value);
        rowsVal.value = state.rows;
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            resizeManualGrid();
        }
        draw();
    });

    rowsVal.addEventListener("change", (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 10;
        val = Math.max(3, Math.min(state.maxRows, val)); // Clamp values to [3, state.maxRows]
        e.target.value = val;
        
        state.rows = val;
        rowsSlider.value = val;
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            resizeManualGrid();
        }
        draw();
    });

    // Settings Modal Listeners
    let tempQuests = [];

    // Settings tab buttons event handlers
    document.querySelectorAll(".settings-tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".settings-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".settings-tab-content").forEach(c => c.style.display = "none");
            
            e.target.classList.add("active");
            const tabContentId = e.target.getAttribute("data-tab");
            document.getElementById(tabContentId).style.display = "block";
        });
    });

    // Render Quests list inside modal
    function renderSettingsQuests() {
        if (!questsListContainer) return;
        questsListContainer.innerHTML = "";
        
        if (tempQuests.length === 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.style.textAlign = "center";
            emptyMsg.style.padding = "20px";
            emptyMsg.style.color = "var(--text-muted)";
            emptyMsg.style.fontSize = "0.85rem";
            emptyMsg.innerHTML = '<i class="fa-solid fa-folder-open" style="display:block;font-size:1.5rem;margin-bottom:8px;opacity:0.5;"></i> No quests configured yet.';
            questsListContainer.appendChild(emptyMsg);
            return;
        }
        
        tempQuests.forEach((quest, index) => {
            const row = document.createElement("div");
            row.className = "quest-row";
            
            // Quest Name Input
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.className = "modal-input quest-name-input";
            nameInput.value = quest.name;
            nameInput.placeholder = "Quest Card Name";
            nameInput.addEventListener("input", (e) => {
                tempQuests[index].name = e.target.value;
            });
            
            // Tile Select dropdown
            const tileSelect = document.createElement("select");
            tileSelect.className = "quest-tile-select";
            TILE_MANIFEST.forEach(tile => {
                const opt = document.createElement("option");
                opt.value = tile.id;
                opt.textContent = tile.label;
                tileSelect.appendChild(opt);
            });
            tileSelect.value = quest.tileId;
            tileSelect.addEventListener("change", (e) => {
                tempQuests[index].tileId = e.target.value;
            });
            
            // X (Col) input
            const xContainer = document.createElement("div");
            xContainer.className = "quest-coord-container";
            const xLabel = document.createElement("span");
            xLabel.className = "quest-coord-label";
            xLabel.textContent = "Col:";
            const xInput = document.createElement("input");
            xInput.type = "number";
            xInput.className = "modal-input quest-coord-input quest-x-input";
            xInput.value = quest.x;
            xInput.min = 0;
            xInput.max = state.cols - 1;
            xInput.addEventListener("input", (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 0) val = 0;
                if (val >= state.cols) val = state.cols - 1;
                tempQuests[index].x = val;
            });
            xContainer.appendChild(xLabel);
            xContainer.appendChild(xInput);
            
            // Y (Row) input
            const yContainer = document.createElement("div");
            yContainer.className = "quest-coord-container";
            const yLabel = document.createElement("span");
            yLabel.className = "quest-coord-label";
            yLabel.textContent = "Row:";
            const yInput = document.createElement("input");
            yInput.type = "number";
            yInput.className = "modal-input quest-coord-input quest-y-input";
            yInput.value = quest.y;
            yInput.min = 0;
            yInput.max = state.rows - 1;
            yInput.addEventListener("input", (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 0) val = 0;
                if (val >= state.rows) val = state.rows - 1;
                tempQuests[index].y = val;
            });
            yContainer.appendChild(yLabel);
            yContainer.appendChild(yInput);
            
            // Delete button
            const delBtn = document.createElement("button");
            delBtn.className = "delete-quest-btn";
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            delBtn.title = "Delete Quest";
            delBtn.addEventListener("click", () => {
                tempQuests.splice(index, 1);
                renderSettingsQuests();
            });
            
            row.appendChild(nameInput);
            row.appendChild(tileSelect);
            row.appendChild(xContainer);
            row.appendChild(yContainer);
            row.appendChild(delBtn);
            
            questsListContainer.appendChild(row);
        });
    }

    // Add New Quest button listener
    if (addQuestBtn) {
        addQuestBtn.addEventListener("click", () => {
            tempQuests.push({ name: "", tileId: "Tower of terror", x: 0, y: 0 });
            renderSettingsQuests();
            setTimeout(() => {
                if (questsListContainer) {
                    questsListContainer.scrollTop = questsListContainer.scrollHeight;
                }
            }, 50);
        });
    }

    gridSettingsBtn.addEventListener("click", () => {
        maxColsInput.value = state.maxCols;
        maxRowsInput.value = state.maxRows;
        
        // Reset tabs in modal to active "Grid Limits"
        document.querySelectorAll(".settings-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".settings-tab-content").forEach(c => c.style.display = "none");
        const defaultTabBtn = document.querySelector('.settings-tab-btn[data-tab="grid-tab"]');
        if (defaultTabBtn) defaultTabBtn.classList.add("active");
        const defaultTabContent = document.getElementById("grid-tab");
        if (defaultTabContent) defaultTabContent.style.display = "block";
        
        // Load copy of state quests to temp
        tempQuests = JSON.parse(JSON.stringify(state.quests || []));
        renderSettingsQuests();
        
        settingsModal.style.display = "flex";
    });

    const hideModal = () => {
        settingsModal.style.display = "none";
    };
    closeModalBtn.addEventListener("click", hideModal);
    cancelSettingsBtn.addEventListener("click", hideModal);
    
    settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
            hideModal();
        }
    });

    saveSettingsBtn.addEventListener("click", () => {
        let newMaxCols = parseInt(maxColsInput.value);
        let newMaxRows = parseInt(maxRowsInput.value);
        
        if (isNaN(newMaxCols) || newMaxCols < 3) newMaxCols = 3;
        if (newMaxCols > 100) newMaxCols = 100;
        if (isNaN(newMaxRows) || newMaxRows < 3) newMaxRows = 3;
        if (newMaxRows > 100) newMaxRows = 100;
        
        state.maxCols = newMaxCols;
        state.maxRows = newMaxRows;
        
        // Update slider max boundaries
        colsSlider.max = state.maxCols;
        rowsSlider.max = state.maxRows;
        
        // Clamp current size to the new maximums if needed
        if (state.cols > state.maxCols) {
            state.cols = state.maxCols;
            colsVal.value = state.cols;
            colsSlider.value = state.cols;
        }
        if (state.rows > state.maxRows) {
            state.rows = state.maxRows;
            rowsVal.value = state.rows;
            rowsSlider.value = state.rows;
        }
        
        // Save Quests from temp, filtering empty names and out-of-bound coords
        const validatedQuests = [];
        tempQuests.forEach(q => {
            const name = (q.name || "").trim();
            if (!name) return;
            let x = parseInt(q.x) || 0;
            let y = parseInt(q.y) || 0;
            if (x < 0) x = 0;
            if (x >= state.cols) x = state.cols - 1;
            if (y < 0) y = 0;
            if (y >= state.rows) y = state.rows - 1;
            validatedQuests.push({ name, tileId: q.tileId, x, y });
        });
        state.quests = validatedQuests;
        
        // Regenerate or resize the map grid
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            resizeManualGrid();
        }
        
        hideModal();
        draw();
    });
    
    zoomSlider.addEventListener("input", (e) => {
        setZoom(parseInt(e.target.value) / 100.0);
    });

    // Seed controls
    randomSeedBtn.addEventListener("click", () => {
        state.seed = Math.floor(10000 + Math.random() * 90000).toString();
        seedInput.value = state.seed;
        setMode("auto");
        generateProceduralMap();
        draw();
    });
    
    seedInput.addEventListener("change", (e) => {
        state.seed = e.target.value;
        setMode("auto");
        generateProceduralMap();
        draw();
    });
    
    generateBtn.addEventListener("click", () => {
        setMode("auto");
        generateProceduralMap();
        draw();
    });

    // Displays switches
    gridToggle.addEventListener("change", (e) => {
        state.showGrid = e.target.checked;
        draw();
    });

    tilesToggle.addEventListener("change", (e) => {
        state.showTiles = e.target.checked;
        draw();
    });

    bordersToggle.addEventListener("change", (e) => {
        state.showBorders = e.target.checked;
        draw();
    });
    
    hiresToggle.addEventListener("change", async (e) => {
        state.useHires = e.target.checked;
        await loadTileImages();
        draw();
    });

    centerToggle.addEventListener("change", (e) => {
        state.showCenter = e.target.checked;
        draw();
        autoSaveCurrentMap();
    });

    centerMapBtn.addEventListener("click", () => {
        centerMap();
        draw();
    });

    // Painting UI
    clearCanvasBtn.addEventListener("click", () => {
        setMode("manual");
        clearCanvas();
        draw();
    });

    clearMapBtn.addEventListener("click", () => {
        setMode("manual");
        clearToGrass();
        draw();
    });
    
    resetModeBtn.addEventListener("click", () => {
        setMode("auto");
        generateProceduralMap();
        draw();
    });

    // Exports
    exportPngBtn.addEventListener("click", exportPNG);
    exportSvgBtn.addEventListener("click", exportSVG);
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener("click", saveMapJSON);
    }
    if (importJsonBtn && importJsonInput) {
        importJsonBtn.addEventListener("click", () => importJsonInput.click());
        importJsonInput.addEventListener("change", loadMapJSON);
    }

    // Increment/Decrement buttons for all sliders
    document.querySelectorAll(".slider-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;
            const slider = document.getElementById(targetId);
            if (!slider) return;
            
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            const step = parseFloat(slider.step) || 1;
            let val = parseFloat(slider.value) || 0;
            
            if (btn.classList.contains("inc-btn")) {
                val = Math.min(max, val + step);
            } else {
                val = Math.max(min, val - step);
            }
            
            slider.value = val;
            // Dispatch input event to trigger slider update logic
            slider.dispatchEvent(new Event("input"));
        });
    });

    // Start Position Axis Toggle
    startAxisToggle.addEventListener("change", (e) => {
        state.startVertical = e.target.checked;
        
        // Re-enforce towers
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            enforceStartTowers();
        }
        draw();
        autoSaveCurrentMap();
    });

    // Map Dimensions Toggle
    dimensionsToggle.addEventListener("change", (e) => {
        state.fixedDimensions = e.target.checked;
        updateDimensionsControlsVisibility();
        draw();
        autoSaveCurrentMap();
    });

    // Manual Towers Toggle
    manualTowersToggle.addEventListener("change", (e) => {
        state.manualTowers = e.target.checked;
        updateStartAxisVisibility();
        
        if (state.manualTowers) {
            // Remove automatic start towers
            if (state.startVertical) {
                const midRow = Math.floor(state.rows / 2);
                if (state.mapData[0]?.[midRow] === "Wizards Tower L1") state.mapData[0][midRow] = "Grass";
                if (state.mapData[state.cols - 1]?.[midRow] === "Wizards Tower L1") state.mapData[state.cols - 1][midRow] = "Grass";
            } else {
                const midCol = Math.floor(state.cols / 2);
                if (state.mapData[midCol]?.[0] === "Wizards Tower L1") state.mapData[midCol][0] = "Grass";
                if (state.mapData[midCol]?.[state.rows - 1] === "Wizards Tower L1") state.mapData[midCol][state.rows - 1] = "Grass";
            }
        } else {
            // Re-enforce towers
            enforceStartTowers();
        }
        updatePlayerDropdowns();
        draw();
        autoSaveCurrentMap();
    });

    // Player Count Dropdown Change
    playerCountSelect.addEventListener("change", (e) => {
        state.playerCount = parseInt(e.target.value);
        enforceStartTowers();
        updatePlayerDropdowns();
        draw();
        autoSaveCurrentMap();
    });

    // Canvas panning, zoom, and painting
    canvasWrapper.addEventListener("mousedown", handleMouseDown);
    canvasWrapper.addEventListener("mousemove", handleMouseMove);
    canvasWrapper.addEventListener("mouseup", handleMouseUp);
    canvasWrapper.addEventListener("mouseleave", handleMouseLeave);
    canvasWrapper.addEventListener("wheel", handleWheel, { passive: false });
    
    // Prevent context menu on canvas
    canvasWrapper.addEventListener("contextmenu", (e) => e.preventDefault());
    
    // Handle window resizing
    window.addEventListener("resize", () => {
        draw();
    });

    // Map Manager Listeners
    if (mapNameInput) {
        mapNameInput.addEventListener("input", (e) => {
            state.mapName = e.target.value;
            autoSaveCurrentMap();
        });
    }

    if (newMapBtn) {
        newMapBtn.addEventListener("click", resetMapForm);
    }

    if (exportMapsBtn) {
        exportMapsBtn.addEventListener("click", exportMapsJSON);
    }

    if (importMapsBtn) {
        importMapsBtn.addEventListener("click", () => {
            if (importMapsFileInput) importMapsFileInput.click();
        });
    }

    if (importMapsFileInput) {
        importMapsFileInput.addEventListener("change", importMapsJSON);
    }

    if (clearMapsBtn) {
        clearMapsBtn.addEventListener("click", clearAllMaps);
    }

    if (mapManagerToggleBtn && mapManagerSidebar) {
        mapManagerToggleBtn.addEventListener("click", () => {
            const isCollapsed = mapManagerSidebar.classList.toggle("collapsed");
            mapManagerToggleBtn.classList.toggle("collapsed", isCollapsed);
            
            const icon = mapManagerToggleBtn.querySelector("i");
            if (icon) {
                if (isCollapsed) {
                    icon.className = "fa-solid fa-chevron-left";
                } else {
                    icon.className = "fa-solid fa-chevron-right";
                }
            }
            
            localStorage.setItem("mapManagerCollapsed", isCollapsed ? "true" : "false");
        });
    }

    // Left Sidebar Toggle
    if (leftSidebarToggleBtn && leftSidebar) {
        leftSidebarToggleBtn.addEventListener("click", () => {
            const isCollapsed = leftSidebar.classList.toggle("collapsed");
            leftSidebarToggleBtn.classList.toggle("collapsed", isCollapsed);
            if (viewportHeader) viewportHeader.classList.toggle("sidebar-hidden", isCollapsed);
            if (paletteContainer) paletteContainer.classList.toggle("sidebar-hidden", isCollapsed);

            const icon = leftSidebarToggleBtn.querySelector("i");
            if (icon) {
                icon.className = isCollapsed ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-left";
            }

            localStorage.setItem("leftSidebarCollapsed", isCollapsed ? "true" : "false");
        });
    }

    // Tile Visibility Modal Listeners
    if (manageTilesBtn) {
        manageTilesBtn.addEventListener("click", () => {
            renderTileVisibilityList();
            tileVisibilityModal.style.display = "flex";
        });
    }

    if (closeTileVisibilityBtn) {
        closeTileVisibilityBtn.addEventListener("click", () => {
            tileVisibilityModal.style.display = "none";
        });
    }

    if (tileVisibilityModal) {
        tileVisibilityModal.addEventListener("click", (e) => {
            if (e.target === tileVisibilityModal) {
                tileVisibilityModal.style.display = "none";
            }
        });
    }

    if (tileVisShowAllBtn) {
        tileVisShowAllBtn.addEventListener("click", () => {
            state.hiddenTiles.clear();
            saveHiddenTiles();
            renderTileVisibilityList();
            renderPalette();
        });
    }

    if (tileVisHideAllBtn) {
        tileVisHideAllBtn.addEventListener("click", () => {
            TILE_MANIFEST.forEach(tile => state.hiddenTiles.add(tile.id));
            saveHiddenTiles();
            renderTileVisibilityList();
            renderPalette();
        });
    }
}

// Render available tiles to bottom palette
function renderPalette() {
    tilePalette.innerHTML = "";

    // Update visible tile count badge
    const visibleCount = TILE_MANIFEST.filter(t => !state.hiddenTiles.has(t.id)).length;
    const tileCountBadge = document.getElementById("tile-count");
    if (tileCountBadge) tileCountBadge.textContent = `(${visibleCount})`;
    
    // Add Eraser Tool at the beginning of the palette
    const eraserItem = document.createElement("div");
    eraserItem.className = "palette-item eraser-item";
    eraserItem.dataset.id = "Eraser";
    eraserItem.title = "Eraser (Delete Tile)";
    
    const eraserIcon = document.createElement("div");
    eraserIcon.className = "palette-icon-wrapper";
    eraserIcon.innerHTML = '<i class="fa-solid fa-eraser"></i>';
    
    const eraserLabel = document.createElement("span");
    eraserLabel.className = "item-label";
    eraserLabel.textContent = "Eraser";
    
    eraserItem.appendChild(eraserIcon);
    eraserItem.appendChild(eraserLabel);
    
    if (state.selectedBrush === "Eraser") {
        eraserItem.classList.add("active");
    }
    
    eraserItem.addEventListener("click", () => {
        document.querySelectorAll(".palette-item").forEach(el => el.classList.remove("active"));
        if (state.selectedBrush === "Eraser") {
            state.selectedBrush = null;
        } else {
            state.selectedBrush = "Eraser";
            eraserItem.classList.add("active");
            setMode("manual"); // Switch to manual mode immediately
        }
        updateCanvasCursor();
    });
    
    tilePalette.appendChild(eraserItem);
    
    TILE_MANIFEST.forEach(tile => {
        // Skip tiles that are hidden
        if (state.hiddenTiles.has(tile.id)) return;

        const item = document.createElement("div");
        item.className = "palette-item";
        item.dataset.id = tile.id;
        item.title = tile.label;
        
        // Show low-res thumbnail in palette regardless of high-res toggle for smooth loading
        const img = document.createElement("img");
        img.src = `game tiles/${tile.file}`;
        img.alt = tile.label;
        
        const label = document.createElement("span");
        label.className = "item-label";
        label.textContent = tile.label;
        
        item.appendChild(img);
        item.appendChild(label);
        
        item.addEventListener("click", () => {
            document.querySelectorAll(".palette-item").forEach(el => el.classList.remove("active"));
            if (state.selectedBrush === tile.id) {
                state.selectedBrush = null;
            } else {
                state.selectedBrush = tile.id;
                item.classList.add("active");
                setMode("manual"); // Switch to manual mode immediately
            }
            updateCanvasCursor();
        });
        
        tilePalette.appendChild(item);
    });

    // Reset Dimensions handler
    dimensionsResetBtn.addEventListener("click", () => {
        state.cols = 15;
        state.rows = 10;
        state.fixedDimensions = true;
        
        colsSlider.value = 15;
        colsVal.value = 15;
        rowsSlider.value = 10;
        rowsVal.value = 10;
        dimensionsToggle.checked = true;
        
        updateDimensionsControlsVisibility();
        if (state.mode === "auto") {
            generateProceduralMap();
        } else {
            resizeManualGrid();
        }
        enforceStartTowers();
        updatePlayerDropdowns();
        draw();
        autoSaveCurrentMap();
    });

    // Reset Terrain handler
    terrainResetBtn.addEventListener("click", () => {
        state.seed = "12345";
        seedInput.value = "12345";
        if (state.mode === "auto") {
            generateProceduralMap();
        }
        enforceStartTowers();
        updatePlayerDropdowns();
        draw();
        autoSaveCurrentMap();
    });

    // Reset Start Towers handler
    towersResetBtn.addEventListener("click", () => {
        state.manualTowers = false;
        state.startVertical = true;
        
        manualTowersToggle.checked = false;
        startAxisToggle.checked = true;
        
        updateStartAxisVisibility();
        enforceStartTowers();
        updatePlayerDropdowns();
        draw();
        autoSaveCurrentMap();
    });

    // Reset Players handler
    playersResetBtn.addEventListener("click", () => {
        state.playerCount = 2;
        playerCountSelect.value = "2";
        enforceStartTowers();
        updatePlayerDropdowns();
        draw();
        autoSaveCurrentMap();
    });

    // Reset Display Options handler
    displayResetBtn.addEventListener("click", () => {
        state.showGrid = true;
        state.showTiles = true;
        state.showBorders = true;
        state.showCenter = false;
        
        gridToggle.checked = true;
        tilesToggle.checked = true;
        bordersToggle.checked = true;
        centerToggle.checked = false;
        
        draw();
    });
}

// Load hidden tiles from localStorage
function loadHiddenTiles() {
    const stored = localStorage.getItem("hex_hidden_tiles");
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            state.hiddenTiles = new Set(arr);
        } catch (e) {
            state.hiddenTiles = new Set();
        }
    }
    renderPalette();
}

// Save hidden tiles to localStorage
function saveHiddenTiles() {
    localStorage.setItem("hex_hidden_tiles", JSON.stringify([...state.hiddenTiles]));
}

// Render the tile visibility checklist inside the modal
function renderTileVisibilityList() {
    if (!tileVisibilityList) return;
    tileVisibilityList.innerHTML = "";

    TILE_MANIFEST.forEach(tile => {
        const isHidden = state.hiddenTiles.has(tile.id);

        const row = document.createElement("label");
        row.className = "tile-vis-item" + (isHidden ? " hidden-tile" : "");

        const img = document.createElement("img");
        img.src = `game tiles/${tile.file}`;
        img.alt = tile.label;

        const label = document.createElement("span");
        label.className = "tile-vis-label";
        label.textContent = tile.label;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !isHidden;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                state.hiddenTiles.delete(tile.id);
                row.classList.remove("hidden-tile");
            } else {
                state.hiddenTiles.add(tile.id);
                row.classList.add("hidden-tile");
            }
            saveHiddenTiles();
            renderPalette();
        });

        row.appendChild(img);
        row.appendChild(label);
        row.appendChild(checkbox);
        tileVisibilityList.appendChild(row);
    });
}

// Helper to retrieve base64 bundled asset if it exists
function getBase64Asset(tileId, useHires) {
    if (!window.TILE_ASSETS) return null;
    const group = useHires ? window.TILE_ASSETS.large : window.TILE_ASSETS.standard;
    return group ? group[tileId] : null;
}

// Preload Images based on Hires setting
async function loadTileImages() {
    const promises = TILE_MANIFEST.map(tile => {
        return new Promise(resolve => {
            const img = new Image();
            
            // Check if we have bundled base64 assets loaded in memory
            const base64Src = getBase64Asset(tile.id, state.useHires);
            if (base64Src) {
                img.src = base64Src;
            } else {
                const folder = state.useHires ? "game tiles large" : "game tiles";
                img.src = `${folder}/${tile.file}`;
            }
            
            img.onload = () => {
                state.images[tile.id] = img;
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load tile: ${tile.file}`);
                // Fallback to lowres if hires fails
                if (state.useHires) {
                    const fallbackSrc = getBase64Asset(tile.id, false);
                    if (fallbackSrc) {
                        img.src = fallbackSrc;
                    } else {
                        img.src = `game tiles/${tile.file}`;
                    }
                } else {
                    resolve();
                }
            };
        });
    });
    
    await Promise.all(promises);
}

// Change operation mode ("auto" or "manual")
function setMode(mode) {
    state.mode = mode;
    if (mode === "auto") {
        modeBadge.textContent = "Procedural Map";
        modeBadge.className = "mode-badge auto-mode";
        // Deselect brush
        state.selectedBrush = null;
        document.querySelectorAll(".palette-item").forEach(el => el.classList.remove("active"));
    } else {
        modeBadge.textContent = "Manual Editing";
        modeBadge.className = "mode-badge manual-mode";
    }
    updateCanvasCursor();
}

// Get center coordinates of cell (c, r)
function getCellCenter(c, r) {
    const x = c * DX + HEX_WIDTH / 2;
    // Odd columns are offset vertically by half a tile height
    const y = r * DY + HEX_HEIGHT / 2 + (c % 2 === 1 ? HEX_HEIGHT / 2 : 0);
    return { x, y };
}

// Centering the map grid inside the viewport
function centerMap() {
    const wrapperRect = canvasWrapper.getBoundingClientRect();
    const { minC, maxC, minR, maxR } = getMapBounds();
    
    state.zoom = 1.0;
    zoomSlider.value = 100;
    zoomVal.textContent = "100%";
    
    const activeCenterX = minC * DX + ((maxC - minC) * DX + HEX_WIDTH) / 2;
    const activeCenterY = minR * DY + ((maxR - minR) * DY + (maxC > minC ? HEX_HEIGHT / 2 : 0) + HEX_HEIGHT) / 2;
    
    state.panX = wrapperRect.width / 2 - activeCenterX;
    state.panY = wrapperRect.height / 2 - activeCenterY;
}

// Set zoom scale and clamp limits
function setZoom(val) {
    state.zoom = Math.max(0.3, Math.min(1.8, val));
    zoomSlider.value = Math.round(state.zoom * 100);
    zoomVal.textContent = `${zoomSlider.value}%`;
    draw();
}

// Procedural generation using cellular-smoothed random grid
function generateProceduralMap() {
    const rand = new SeededRandom(state.seed);
    
    // 1. Initialize random grid
    const rawNoise = [];
    for (let c = 0; c < state.cols; c++) {
        rawNoise[c] = [];
        for (let r = 0; r < state.rows; r++) {
            rawNoise[c][r] = rand.next();
        }
    }
    
    // 2. Perform cellular smoothing to create natural terrain biomes
    const noise = [];
    for (let c = 0; c < state.cols; c++) {
        noise[c] = [];
        for (let r = 0; r < state.rows; r++) {
            let sum = rawNoise[c][r] * 2.0; // Strong weight on center cell
            let count = 2;
            
            // 6-Direction Neighbors in flat-topped hex grid
            const odd = c % 2 === 1;
            const neighbors = [
                [c, r - 1], [c, r + 1],          // Top, Bottom
                [c - 1, r], [c + 1, r],          // Side Left/Right
                [c - 1, odd ? r + 1 : r - 1],    // Diagonal Left
                [c + 1, odd ? r + 1 : r - 1]     // Diagonal Right
            ];
            
            neighbors.forEach(([nc, nr]) => {
                if (nc >= 0 && nc < state.cols && nr >= 0 && nr < state.rows) {
                    sum += rawNoise[nc][nr];
                    count += 1;
                }
            });
            noise[c][r] = sum / count;
        }
    }
    
    // 3. Map smoothed values to terrain types
    state.mapData = [];
    for (let c = 0; c < state.cols; c++) {
        state.mapData[c] = [];
        for (let r = 0; r < state.rows; r++) {
            const val = noise[c][r];
            state.mapData[c][r] = chooseTerrainByNoise(val);
        }
    }
    
    // 4. Enforce Start towers
    enforceStartTowers();
    updatePlayerDropdowns();
    autoSaveCurrentMap();
}

// Maps a 0.0 - 1.0 noise value to specific variants
function chooseTerrainByNoise(val) {
    if (val < 0.28) {
        return "Grass";
    } else if (val < 0.48) {
        // Plain (L1 to L4) transition
        const t = (val - 0.28) / 0.20;
        const variant = Math.min(4, Math.floor(t * 4) + 1);
        return `Plain L${variant}`;
    } else if (val < 0.72) {
        // Forrest transition
        const t = (val - 0.48) / 0.24;
        const variant = Math.min(4, Math.floor(t * 4) + 1);
        return `Forrest L${variant}`;
    } else if (val < 0.86) {
        // Swamp transition
        const t = (val - 0.72) / 0.14;
        const variant = Math.min(4, Math.floor(t * 4) + 1);
        return `Swamp L${variant}`;
    } else {
        // Mountain transition
        const t = (val - 0.86) / 0.14;
        const variant = Math.min(4, Math.floor(t * 4) + 1);
        return `Mountain L${variant}`;
    }
}

// Apply configured quest tiles at their locations
function enforceQuestTiles() {
    if (!state.quests || state.quests.length === 0) return;
    state.quests.forEach(quest => {
        const c = quest.x;
        const r = quest.y;
        if (c >= 0 && c < state.cols && r >= 0 && r < state.rows) {
            if (!state.mapData[c]) {
                state.mapData[c] = [];
            }
            state.mapData[c][r] = quest.tileId;
        }
    });
}

// Apply Wizards Towers to the start cells
function enforceStartTowers() {
    if (state.cols === 0 || state.rows === 0) return;
    
    if (!state.manualTowers) {
        // Clear existing Wizards Tower L1 starting locations first
        for (let c = 0; c < state.cols; c++) {
            for (let r = 0; r < state.rows; r++) {
                if (state.mapData[c]?.[r] === "Wizards Tower L1") {
                    state.mapData[c][r] = "Grass";
                }
            }
        }
        
        const midRow = Math.floor(state.rows / 2);
        const midCol = Math.floor(state.cols / 2);
        
        if (state.playerCount === 2) {
            if (state.startVertical) {
                state.mapData[0][midRow] = "Wizards Tower L1";
                state.mapData[state.cols - 1][midRow] = "Wizards Tower L1";
            } else {
                state.mapData[midCol][0] = "Wizards Tower L1";
                state.mapData[midCol][state.rows - 1] = "Wizards Tower L1";
            }
        } else if (state.playerCount === 3) {
            if (state.startVertical) {
                state.mapData[0][midRow] = "Wizards Tower L1";
                state.mapData[state.cols - 1][midRow] = "Wizards Tower L1";
                state.mapData[midCol][0] = "Wizards Tower L1";
            } else {
                state.mapData[midCol][0] = "Wizards Tower L1";
                state.mapData[midCol][state.rows - 1] = "Wizards Tower L1";
                state.mapData[0][midRow] = "Wizards Tower L1";
            }
        } else if (state.playerCount === 4) {
            state.mapData[0][midRow] = "Wizards Tower L1";
            state.mapData[state.cols - 1][midRow] = "Wizards Tower L1";
            state.mapData[midCol][0] = "Wizards Tower L1";
            state.mapData[midCol][state.rows - 1] = "Wizards Tower L1";
        }
    }
    
    // Always enforce quest tiles placement
    enforceQuestTiles();
}

// Resize manual grid keeping existing painted tiles
function resizeManualGrid() {
    const newGrid = [];
    for (let c = 0; c < state.cols; c++) {
        newGrid[c] = [];
        for (let r = 0; r < state.rows; r++) {
            // Copy existing cell if it fits in dimensions
            if (state.mapData[c] && state.mapData[c][r] !== undefined) {
                newGrid[c][r] = state.mapData[c][r];
            } else {
                newGrid[c][r] = "Grass";
            }
        }
    }
    state.mapData = newGrid;
    enforceStartTowers();
    updatePlayerDropdowns();
    autoSaveCurrentMap();
}

// Fill entire map with Grass
function clearToGrass() {
    state.mapData = [];
    for (let c = 0; c < state.cols; c++) {
        state.mapData[c] = [];
        for (let r = 0; r < state.rows; r++) {
            state.mapData[c][r] = "Grass";
        }
    }
    enforceStartTowers();
    updatePlayerDropdowns();
    autoSaveCurrentMap();
}

// Clear entire map to empty space (null), keeping only start towers
function clearCanvas() {
    state.mapData = [];
    for (let c = 0; c < state.cols; c++) {
        state.mapData[c] = [];
        for (let r = 0; r < state.rows; r++) {
            state.mapData[c][r] = null;
        }
    }
    enforceStartTowers();
    updatePlayerDropdowns();
    autoSaveCurrentMap();
}

// Draw the grid and tiles on Canvas
function draw() {
    updateDimensionsDisplay();
    const wrapperRect = canvasWrapper.getBoundingClientRect();
    canvas.width = wrapperRect.width;
    canvas.height = wrapperRect.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save current transform state and apply Pan and Zoom
    ctx.save();
    ctx.translate(state.panX, state.panY);
    ctx.scale(state.zoom, state.zoom);
    
    const { minC, maxC, minR, maxR } = getMapBounds();
    
    // Draw cells
    for (let c = minC; c <= maxC; c++) {
        for (let r = minR; r <= maxR; r++) {
            const tileId = state.mapData[c]?.[r];
            const { x, y } = getCellCenter(c, r);
            
            // Draw tile image or flat color based on toggle
            if (tileId) {
                const img = state.images[tileId];
                if (state.showTiles && img) {
                    ctx.drawImage(
                        img, 
                        x - HEX_WIDTH / 2, 
                        y - HEX_HEIGHT / 2, 
                        HEX_WIDTH, 
                        HEX_HEIGHT
                    );
                } else {
                    drawHexagonFillOnCtx(ctx, x, y, getTerrainColor(tileId), 0.0);
                }
                
                // Draw inside border if enabled and the tile type has one
                if (state.showBorders) {
                    const borderColor = getTileBorderColor(tileId);
                    if (borderColor) {
                        drawHexagonGridLine(x, y, borderColor, 3.0, 1.5);
                    }
                }
            }
            
            // Draw grid line overlay
            if (state.showGrid) {
                drawHexagonGridLine(x, y, "rgba(255, 255, 255, 0.15)", 1, 0.0);
            }
            
            // Draw gold start highlight for player start cells
            let isPlayerStart = false;
            for (let i = 0; i < state.playerCount; i++) {
                const startCell = state.playerStartCells[i];
                if (startCell && startCell.col === c && startCell.row === r) {
                    if (tileId && tileId.startsWith("Wizards Tower")) {
                        isPlayerStart = true;
                        break;
                    }
                }
            }
            
            if (isPlayerStart) {
                drawHexagonGridLine(x, y, "rgba(226, 183, 71, 0.6)", 2, 0.0);
            }
        }
    }
    
    // Draw center tile highlight(s) if enabled
    if (state.showCenter) {
        let centerCols = [];
        let centerRows = [];
        
        if (state.fixedDimensions) {
            // Fixed dimensions center calculation
            const cols = state.cols;
            const rows = state.rows;
            
            if (cols % 2 === 0) {
                centerCols = [cols / 2 - 1, cols / 2];
            } else {
                centerCols = [Math.floor(cols / 2)];
            }
            
            if (rows % 2 === 0) {
                centerRows = [rows / 2 - 1, rows / 2];
            } else {
                centerRows = [Math.floor(rows / 2)];
            }
        } else {
            // Infinite canvas center calculation based on active painted bounds
            let minC = 0, maxC = 0, minR = 0, maxR = 0;
            let hasTiles = false;
            
            for (let c = 0; c < state.mapData.length; c++) {
                if (!state.mapData[c]) continue;
                for (let r = 0; r < state.mapData[c].length; r++) {
                    if (state.mapData[c][r] !== undefined && state.mapData[c][r] !== null) {
                        if (!hasTiles) {
                            minC = c; maxC = c; minR = r; maxR = r;
                            hasTiles = true;
                        } else {
                            minC = Math.min(minC, c);
                            maxC = Math.max(maxC, c);
                            minR = Math.min(minR, r);
                            maxR = Math.max(maxR, r);
                        }
                    }
                }
            }
            
            if (hasTiles) {
                const activeCols = maxC - minC + 1;
                const activeRows = maxR - minR + 1;
                
                if (activeCols % 2 === 0) {
                    centerCols = [minC + activeCols / 2 - 1, minC + activeCols / 2];
                } else {
                    centerCols = [minC + Math.floor(activeCols / 2)];
                }
                
                if (activeRows % 2 === 0) {
                    centerRows = [minR + activeRows / 2 - 1, minR + activeRows / 2];
                } else {
                    centerRows = [minR + Math.floor(activeRows / 2)];
                }
            } else {
                // If completely empty, fallback to the default size center
                const cols = state.cols;
                const rows = state.rows;
                
                if (cols % 2 === 0) {
                    centerCols = [cols / 2 - 1, cols / 2];
                } else {
                    centerCols = [Math.floor(cols / 2)];
                }
                
                if (rows % 2 === 0) {
                    centerRows = [rows / 2 - 1, rows / 2];
                } else {
                    centerRows = [Math.floor(rows / 2)];
                }
            }
        }
        
        // Draw the highlights
        for (const mc of centerCols) {
            for (const mr of centerRows) {
                const { x, y } = getCellCenter(mc, mr);
                drawHexagonFilled(x, y, "rgba(239, 68, 68, 0.95)", "rgba(239, 68, 68, 0.25)", 3, 2.0);
                
                // Draw a small target dot in the center of the hex
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
                ctx.fill();
            }
        }
    }
    
    // Draw hover outline (only when no brush or eraser is selected)
    if (state.hoveredCell && !state.selectedBrush) {
        const { x, y } = getCellCenter(state.hoveredCell.col, state.hoveredCell.row);
        drawHexagonGridLine(x, y, "#e2b747", 2.5, 1.2);
    }
    
    // Draw player starting badges
    const cellPlayerIndices = {};
    for (let i = 0; i < state.playerCount; i++) {
        const cell = state.playerStartCells[i];
        if (cell) {
            const tileId = state.mapData[cell.col]?.[cell.row];
            if (tileId && tileId.startsWith("Wizards Tower")) {
                const key = `${cell.col},${cell.row}`;
                if (!cellPlayerIndices[key]) cellPlayerIndices[key] = [];
                cellPlayerIndices[key].push(i);
            }
        }
    }
    
    Object.entries(cellPlayerIndices).forEach(([key, indices]) => {
        const [colStr, rowStr] = key.split(",");
        const col = parseInt(colStr);
        const row = parseInt(rowStr);
        const { x, y } = getCellCenter(col, row);
        
        if (indices.length === 1) {
            drawPlayerBadge(ctx, x, y, indices[0]);
        } else {
            const spacing = 24;
            const startX = x - ((indices.length - 1) * spacing) / 2;
            indices.forEach((playerIndex, idx) => {
                drawPlayerBadge(ctx, startX + idx * spacing, y, playerIndex);
            });
        }
    });
    
    ctx.restore();
    
    // Update dynamic statistics panel
    updateTerrainStats();
}

// Helper to draw hexagon borders
function drawHexagonGridLine(x, y, color, lineWidth, inset = 0.0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    const { wt, wp, ht } = getHexDims(inset);
    
    ctx.moveTo(x - wt, y - ht);
    ctx.lineTo(x + wt, y - ht);
    ctx.lineTo(x + wp, y);
    ctx.lineTo(x + wt, y + ht);
    ctx.lineTo(x - wt, y + ht);
    ctx.lineTo(x - wp, y);
    
    ctx.closePath();
    ctx.stroke();
}

// Helper to draw filled hexagons with borders
function drawHexagonFilled(x, y, strokeColor, fillColor, lineWidth, inset = 0.0) {
    ctx.beginPath();
    const { wt, wp, ht } = getHexDims(inset);
    
    ctx.moveTo(x - wt, y - ht);
    ctx.lineTo(x + wt, y - ht);
    ctx.lineTo(x + wp, y);
    ctx.lineTo(x + wt, y + ht);
    ctx.lineTo(x - wt, y + ht);
    ctx.lineTo(x - wp, y);
    
    ctx.closePath();
    
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

// Check which hexagon tile is closest to mouse coordinate (mx, my)
function getCellFromMouse(mx, my) {
    // Convert screen coordinates to world coordinates (accounting for pan and zoom)
    const worldX = (mx - state.panX) / state.zoom;
    const worldY = (my - state.panY) / state.zoom;
    
    let closestCell = null;
    let minDist = 999999;
    
    // Estimate column and row
    const approxCol = Math.round((worldX - HEX_WIDTH / 2) / DX);
    const approxRow = Math.round((worldY - HEX_HEIGHT / 2 - (Math.abs(approxCol) % 2 === 1 ? HEX_HEIGHT / 2 : 0)) / DY);
    
    // Search in a local 5x5 neighborhood around the estimate
    const searchRange = 2;
    for (let dc = -searchRange; dc <= searchRange; dc++) {
        for (let dr = -searchRange; dr <= searchRange; dr++) {
            const c = approxCol + dc;
            const r = approxRow + dr;
            
            // Restrict coordinates to non-negative values
            if (c < 0 || r < 0) continue;
            
            // If fixed dimensions are enabled, restrict to [0, cols-1] and [0, rows-1]
            if (state.fixedDimensions) {
                if (c >= state.cols || r >= state.rows) {
                    continue;
                }
            }
            
            const { x, y } = getCellCenter(c, r);
            const dist = Math.hypot(worldX - x, worldY - y);
            
            // Check bounding distance limit (distance should be roughly < HEX_WIDTH/2)
            if (dist < 64 && dist < minDist) {
                minDist = dist;
                closestCell = { col: c, row: r };
            }
        }
    }
    
    return closestCell;
}

// Painting trigger on click/drag
function paintCell(cell) {
    if (!cell || !state.selectedBrush) return;
    
    // Protect starting wizard towers (if NOT manual tower mode)
    if (!state.manualTowers) {
        const midRow = Math.floor(state.rows / 2);
        const midCol = Math.floor(state.cols / 2);
        let isProtected = false;
        
        if (state.playerCount === 2) {
            if (state.startVertical) {
                isProtected = ((cell.col === 0 || cell.col === state.cols - 1) && cell.row === midRow);
            } else {
                isProtected = (cell.col === midCol && (cell.row === 0 || cell.row === state.rows - 1));
            }
        } else if (state.playerCount === 3) {
            if (state.startVertical) {
                isProtected = (((cell.col === 0 || cell.col === state.cols - 1) && cell.row === midRow) || (cell.col === midCol && cell.row === 0));
            } else {
                isProtected = ((cell.col === midCol && (cell.row === 0 || cell.row === state.rows - 1)) || (cell.col === 0 && cell.row === midRow));
            }
        } else if (state.playerCount === 4) {
            isProtected = (((cell.col === 0 || cell.col === state.cols - 1) && cell.row === midRow) ||
                           (cell.col === midCol && (cell.row === 0 || cell.row === state.rows - 1)));
        }
        
        if (isProtected) return;
    }
    
    if (!state.mapData[cell.col]) {
        state.mapData[cell.col] = [];
    }
    
    const hadTower = state.mapData[cell.col][cell.row]?.startsWith("Wizards Tower");
    const placingTower = state.selectedBrush && state.selectedBrush.startsWith("Wizards Tower");
    
    state.mapData[cell.col][cell.row] = state.selectedBrush === "Eraser" ? null : state.selectedBrush;
    
    if (hadTower || placingTower || state.selectedBrush === "Eraser") {
        updatePlayerDropdowns();
    }
    draw();
    autoSaveCurrentMap();
}

// Mouse Event Handlers
function handleMouseDown(e) {
    const rect = canvasWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (e.button === 2) {
        // Right click: start panning
        state.isPanning = true;
        state.startPanX = mouseX - state.panX;
        state.startPanY = mouseY - state.panY;
        mapTooltip.style.display = "none";
    } else if (e.button === 0) {
        // Left click
        if (state.selectedBrush) {
            // Active brush: start painting
            state.isPainting = true;
            const cell = getCellFromMouse(mouseX, mouseY);
            paintCell(cell);
            mapTooltip.style.display = "none";
        } else {
            // Select mode / start panning also on left click if no brush selected
            state.isPanning = true;
            state.startPanX = mouseX - state.panX;
            state.startPanY = mouseY - state.panY;
            mapTooltip.style.display = "none";
        }
    }
}

function handleMouseMove(e) {
    const rect = canvasWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (state.isPanning) {
        state.panX = mouseX - state.startPanX;
        state.panY = mouseY - state.startPanY;
        mapTooltip.style.display = "none";
        draw();
    } else if (state.isPainting) {
        const cell = getCellFromMouse(mouseX, mouseY);
        paintCell(cell);
        mapTooltip.style.display = "none";
    } else {
        const cell = getCellFromMouse(mouseX, mouseY);
        if (JSON.stringify(cell) !== JSON.stringify(state.hoveredCell)) {
            state.hoveredCell = cell;
            if (cell) {
                coordinatesDisplay.textContent = `HEX coordinates: [Col: ${cell.col}, Row: ${cell.row}]`;
                
                // Show floating tooltip
                const tileId = state.mapData[cell.col]?.[cell.row];
                let displayLabel = tileId || "Empty";
                if (displayLabel.startsWith("Forrest")) {
                    displayLabel = displayLabel.replace("Forrest", "Forest");
                }
                
                const quest = state.quests?.find(q => q.x === cell.col && q.y === cell.row);
                let tooltipHtml = `<strong>${displayLabel}</strong>`;
                if (quest) {
                    tooltipHtml = `<strong style="color: var(--accent-gold);">${quest.name}</strong><br><span style="font-size: 0.75rem; color: #fff;">(Tile: ${displayLabel})</span>`;
                }
                tooltipHtml += `<br><span style="color: var(--text-muted); font-size: 0.65rem;">Col: ${cell.col}, Row: ${cell.row}</span>`;
                
                mapTooltip.innerHTML = tooltipHtml;
                mapTooltip.style.display = "block";
            } else {
                coordinatesDisplay.textContent = "Hover a tile to see coordinates";
                mapTooltip.style.display = "none";
            }
            draw();
        }
        
        // Continuously update tooltip position with mouse
        if (cell) {
            mapTooltip.style.left = `${e.clientX + 15}px`;
            mapTooltip.style.top = `${e.clientY + 15}px`;
        }
    }
}

function handleMouseUp(e) {
    state.isPanning = false;
    state.isPainting = false;
}

function handleMouseLeave(e) {
    state.isPanning = false;
    state.isPainting = false;
    state.hoveredCell = null;
    coordinatesDisplay.textContent = "Hover a tile to see coordinates";
    mapTooltip.style.display = "none";
    draw();
}

function handleWheel(e) {
    e.preventDefault();
    
    const rect = canvasWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Zoom centered around the cursor position
    const worldX = (mouseX - state.panX) / state.zoom;
    const worldY = (mouseY - state.panY) / state.zoom;
    
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.3, Math.min(1.8, state.zoom + zoomDelta));
    
    state.zoom = newZoom;
    state.panX = mouseX - worldX * newZoom;
    state.panY = mouseY - worldY * newZoom;
    
    zoomSlider.value = Math.round(state.zoom * 100);
    zoomVal.textContent = `${zoomSlider.value}%`;
    
    draw();
}

// Convert image elements to Base64 to make SVG standalone
async function imageToBase64(imgEl) {
    return new Promise(resolve => {
        // If image is already a Base64 data URL, return it immediately
        if (imgEl.src && imgEl.src.startsWith("data:")) {
            resolve(imgEl.src);
            return;
        }
        try {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = imgEl.naturalWidth || imgEl.width;
            tempCanvas.height = imgEl.naturalHeight || imgEl.height;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(imgEl, 0, 0);
            resolve(tempCanvas.toDataURL("image/png"));
        } catch (e) {
            console.error("Base64 conversion failed, falling back to relative paths", e);
            resolve(null);
        }
    });
}

// Export Map as SVG
async function exportSVG() {
    const { minC, maxC, minR, maxR } = getMapBounds();
    
    let maxCellX = 0;
    let maxCellY = 0;
    for (let c = minC; c <= maxC; c++) {
        for (let r = minR; r <= maxR; r++) {
            const { x, y } = getCellCenter(c, r);
            maxCellX = Math.max(maxCellX, x);
            maxCellY = Math.max(maxCellY, y);
        }
    }
    
    const originX = minC * DX;
    const originY = minR * DY;
    
    const mapW = maxCellX - originX + HEX_WIDTH / 2;
    const mapH = maxCellY - originY + HEX_HEIGHT / 2;
    
    console.log("Generating SVG map...");
    
    // 1. Gather all unique tile base64 representations
    const base64Images = {};
    for (const tile of TILE_MANIFEST) {
        const img = state.images[tile.id];
        if (img) {
            const b64 = await imageToBase64(img);
            if (b64) {
                base64Images[tile.id] = b64;
            } else {
                // Fallback to relative path if conversion fails
                base64Images[tile.id] = state.useHires ? `game tiles large/${tile.file}` : `game tiles/${tile.file}`;
            }
        }
    }
    
    // 2. Build SVG elements
    let svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${mapW} ${mapH}" width="${mapW}" height="${mapH}">
    <style>
        .hex-border { fill: none; stroke: rgba(255,255,255,0.18); stroke-width: 1; }
        .start-border { fill: none; stroke: #e2b747; stroke-width: 2; }
        .player-badge-bg { fill: rgba(0,0,0,0.65); stroke-width: 2.5; }
        .player-badge-text { font-family: sans-serif; font-size: 11px; font-weight: bold; text-anchor: middle; dominant-baseline: central; }
    </style>
    <defs>
        <!-- Flat-topped perfect regular hexagon relative clipping path -->
        <clipPath id="hex-clip" clipPathUnits="objectBoundingBox">
            <polygon points="0.25,0 0.75,0 1,0.5 0.75,1 0.25,1 0,0.5" />
        </clipPath>
    </defs>
    <!-- Background -->
    <rect width="${mapW}" height="${mapH}" fill="#0b0c16" />
`;

    // Draw tiles
    for (let c = minC; c <= maxC; c++) {
        for (let r = minR; r <= maxR; r++) {
            const tileId = state.mapData[c]?.[r];
            const { x: absX, y: absY } = getCellCenter(c, r);
            const x = absX - originX;
            const y = absY - originY;
            
            if (tileId) {
                const imgHref = base64Images[tileId];
                const xPos = x - HEX_WIDTH / 2;
                const yPos = y - HEX_HEIGHT / 2;
                
                // Draw image or flat color polygon
                if (state.showTiles && imgHref) {
                    svgContent += `    <image href="${imgHref}" x="${xPos}" y="${yPos}" width="${HEX_WIDTH}" height="${HEX_HEIGHT}" clip-path="url(#hex-clip)" />\n`;
                } else {
                    const { wt, wp, ht } = getHexDims(0.0);
                    const points = `
                        ${x - wt},${y - ht} 
                        ${x + wt},${y - ht} 
                        ${x + wp},${y} 
                        ${x + wt},${y + ht} 
                        ${x - wt},${y + ht} 
                        ${x - wp},${y}
                    `.replace(/\s+/g, ' ').trim();
                    svgContent += `    <polygon points="${points}" fill="${getTerrainColor(tileId)}" />\n`;
                }
                
                // Draw inside border if enabled and the tile type has one
                if (state.showBorders) {
                    const borderColor = getTileBorderColor(tileId);
                    if (borderColor) {
                        const { wt, wp, ht } = getHexDims(1.5);
                        const points = `
                            ${x - wt},${y - ht} 
                            ${x + wt},${y - ht} 
                            ${x + wp},${y} 
                            ${x + wt},${y + ht} 
                            ${x - wt},${y + ht} 
                            ${x - wp},${y}
                        `.replace(/\s+/g, ' ').trim();
                        svgContent += `    <polygon points="${points}" fill="none" stroke="${borderColor}" stroke-width="3.0" />\n`;
                    }
                }
            }
        }
    }

    // Draw grid overlays
    if (state.showGrid) {
        for (let c = minC; c <= maxC; c++) {
            for (let r = minR; r <= maxR; r++) {
                const { x: absX, y: absY } = getCellCenter(c, r);
                const x = absX - originX;
                const y = absY - originY;
                
                const { wt, wp, ht } = getHexDims(0.0);
                const points = `
                    ${x - wt},${y - ht} 
                    ${x + wt},${y - ht} 
                    ${x + wp},${y} 
                    ${x + wt},${y + ht} 
                    ${x - wt},${y + ht} 
                    ${x - wp},${y}
                `.replace(/\s+/g, ' ').trim();
                
                svgContent += `    <polygon points="${points}" class="hex-border" />\n`;
            }
        }
    }

    // Draw player starting badges in SVG
    const cellPlayerIndices = {};
    for (let i = 0; i < state.playerCount; i++) {
        const cell = state.playerStartCells[i];
        if (cell) {
            const tileId = state.mapData[cell.col]?.[cell.row];
            if (tileId && tileId.startsWith("Wizards Tower")) {
                const key = `${cell.col},${cell.row}`;
                if (!cellPlayerIndices[key]) cellPlayerIndices[key] = [];
                cellPlayerIndices[key].push(i);
            }
        }
    }
    
    const colors = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b"];
    
    // Draw start outline for player start towers
    for (let c = minC; c <= maxC; c++) {
        for (let r = minR; r <= maxR; r++) {
            const tileId = state.mapData[c]?.[r];
            let isPlayerStart = false;
            for (let i = 0; i < state.playerCount; i++) {
                const startCell = state.playerStartCells[i];
                if (startCell && startCell.col === c && startCell.row === r) {
                    if (tileId && tileId.startsWith("Wizards Tower")) {
                        isPlayerStart = true;
                        break;
                    }
                }
            }
            if (isPlayerStart) {
                const { x: absX, y: absY } = getCellCenter(c, r);
                const x = absX - originX;
                const y = absY - originY;
                const { wt, wp, ht } = getHexDims(0.0);
                const points = `
                    ${x - wt},${y - ht} 
                    ${x + wt},${y - ht} 
                    ${x + wp},${y} 
                    ${x + wt},${y + ht} 
                    ${x - wt},${y + ht} 
                    ${x - wp},${y}
                `.replace(/\s+/g, ' ').trim();
                
                svgContent += `    <polygon points="${points}" class="start-border" />\n`;
            }
        }
    }

    Object.entries(cellPlayerIndices).forEach(([key, indices]) => {
        const [colStr, rowStr] = key.split(",");
        const col = parseInt(colStr);
        const row = parseInt(rowStr);
        const { x: absX, y: absY } = getCellCenter(col, row);
        const x = absX - originX;
        const y = absY - originY;
        
        if (indices.length === 1) {
            const playerIndex = indices[0];
            const color = colors[playerIndex] || "#ffffff";
            svgContent += `    <circle cx="${x}" cy="${y - 25}" r="14" class="player-badge-bg" stroke="${color}" />\n`;
            svgContent += `    <text x="${x}" y="${y - 25}" fill="${color}" class="player-badge-text">P${playerIndex + 1}</text>\n`;
        } else {
            const spacing = 24;
            const startX = x - ((indices.length - 1) * spacing) / 2;
            indices.forEach((playerIndex, idx) => {
                const px = startX + idx * spacing;
                const color = colors[playerIndex] || "#ffffff";
                svgContent += `    <circle cx="${px}" cy="${y - 25}" r="14" class="player-badge-bg" stroke="${color}" />\n`;
                svgContent += `    <text x="${px}" y="${y - 25}" fill="${color}" class="player-badge-text">P${playerIndex + 1}</text>\n`;
            });
        }
    });

    svgContent += `</svg>`;
    
    // Download File
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = state.mapName || `map_seed_${state.seed}_${state.cols}x${state.rows}`;
    link.download = getExportFileName(baseName, "svg");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // If running under file:// protocol and we did not use bundled base64, show warning about relative paths
    const hasRelativeFallbacks = Object.values(base64Images).some(path => !path.startsWith("data:"));
    if (hasRelativeFallbacks && window.location.protocol === "file:") {
        alert(
            "SVG Export Note:\n\n" +
            "Because this tool is running locally via the file:// protocol, the exported SVG " +
            "cannot embed the tile images as base64 data. The SVG has been generated with " +
            "relative image links instead.\n\n" +
            "To view the SVG correctly, place the SVG file in your project folder, " +
            "or run a local web server (e.g. 'python -m http.server') and export again to get a self-contained SVG."
        );
    }
}

// Save current map configuration as JSON file
function saveMapJSON() {
    const data = {
        cols: state.cols,
        rows: state.rows,
        seed: state.seed,
        startVertical: state.startVertical,
        mode: state.mode,
        fixedDimensions: state.fixedDimensions,
        manualTowers: state.manualTowers,
        showCenter: state.showCenter,
        maxCols: state.maxCols,
        maxRows: state.maxRows,
        playerCount: state.playerCount,
        playerStartCells: state.playerStartCells,
        mapData: state.mapData,
        quests: state.quests || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = state.mapName || `wizards_map_${state.seed || "custom"}`;
    a.download = getExportFileName(baseName, "json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load map configuration from JSON file
function loadMapJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.cols || !data.rows || !data.mapData) {
                alert("Invalid map file format. Missing required fields.");
                return;
            }
            
            // Update state
            state.cols = parseInt(data.cols);
            state.rows = parseInt(data.rows);
            state.seed = data.seed || "";
            state.startVertical = data.startVertical !== undefined ? data.startVertical : true;
            state.mode = data.mode || "manual";
            state.fixedDimensions = data.fixedDimensions !== undefined ? data.fixedDimensions : true;
            state.manualTowers = data.manualTowers !== undefined ? data.manualTowers : false;
            state.showCenter = data.showCenter !== undefined ? data.showCenter : false;
            state.maxCols = data.maxCols !== undefined ? parseInt(data.maxCols) : 30;
            state.maxRows = data.maxRows !== undefined ? parseInt(data.maxRows) : 30;
            state.playerCount = data.playerCount !== undefined ? parseInt(data.playerCount) : 2;
            state.playerStartCells = data.playerStartCells !== undefined ? data.playerStartCells : [null, null, null, null];
            state.mapData = data.mapData;
            state.quests = data.quests !== undefined ? data.quests : [];
            
            // Extract map name from file name
            const fileName = file.name;
            let importedName = fileName.replace(/\.json$/i, "");
            importedName = importedName.replace(/_\d{4}-\d{2}-\d{2}$/, "");
            importedName = importedName.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            
            state.mapName = importedName;
            if (mapNameInput) {
                mapNameInput.value = state.mapName;
            }
            
            const newId = "map_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
            state.selectedMapId = newId;
            state.isNewSessionMap = true;
            
            // Create map object and add to local maps list
            const newMap = {
                id: newId,
                name: state.mapName,
                cols: state.cols,
                rows: state.rows,
                seed: state.seed,
                startVertical: state.startVertical,
                mode: state.mode,
                fixedDimensions: state.fixedDimensions,
                manualTowers: state.manualTowers,
                showCenter: state.showCenter,
                maxCols: state.maxCols,
                maxRows: state.maxRows,
                playerCount: state.playerCount,
                playerStartCells: JSON.parse(JSON.stringify(state.playerStartCells)),
                mapData: JSON.parse(JSON.stringify(state.mapData)),
                quests: JSON.parse(JSON.stringify(state.quests)),
                lastModified: Date.now()
            };
            state.maps.unshift(newMap);
            
            // Sync DOM inputs to new state
            colsSlider.max = state.maxCols;
            colsSlider.value = state.cols;
            colsVal.value = state.cols;
            rowsSlider.max = state.maxRows;
            rowsSlider.value = state.rows;
            rowsVal.value = state.rows;
            seedInput.value = state.seed;
            startAxisToggle.checked = state.startVertical;
            dimensionsToggle.checked = state.fixedDimensions;
            manualTowersToggle.checked = state.manualTowers;
            centerToggle.checked = state.showCenter;
            playerCountSelect.value = state.playerCount;
            
            updateDimensionsControlsVisibility();
            updateStartAxisVisibility();
            updatePlayerDropdowns();
            
            // Update badge operation mode
            setMode(state.mode);
            
            // Recenter and redraw
            centerMap();
            draw();
            
            // Save maps list to DB and update UI sidebar list
            saveMapsToDB().then(() => {
                updateMapsListUI();
                showToast(`Map "${state.mapName}" imported successfully!`);
            });
        } catch (error) {
            console.error("Error reading JSON file", error);
            alert("Error loading map. Could not parse JSON.");
        }
        
        // Reset file input value so same file can be loaded again
        event.target.value = "";
    };
    reader.readAsText(file);
}

// Export Map as high-res PNG image
function exportPNG() {
    const { minC, maxC, minR, maxR } = getMapBounds();
    
    let maxCellX = 0;
    let maxCellY = 0;
    for (let c = minC; c <= maxC; c++) {
        for (let r = minR; r <= maxR; r++) {
            const { x, y } = getCellCenter(c, r);
            maxCellX = Math.max(maxCellX, x);
            maxCellY = Math.max(maxCellY, y);
        }
    }
    
    const originX = minC * DX;
    const originY = minR * DY;
    
    const mapW = maxCellX - originX + HEX_WIDTH / 2;
    const mapH = maxCellY - originY + HEX_HEIGHT / 2;
    
    // Create temporary canvas to draw the whole map at 1:1 scale
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = mapW;
    tempCanvas.height = mapH;
    const tempCtx = tempCanvas.getContext("2d");
    
    // Fill deep dark background
    tempCtx.fillStyle = "#0b0c16";
    tempCtx.fillRect(0, 0, mapW, mapH);
    
    // Render all elements
    for (let c = minC; c <= maxC; c++) {
        for (let r = minR; r <= maxR; r++) {
            const tileId = state.mapData[c]?.[r];
            const { x: absX, y: absY } = getCellCenter(c, r);
            const x = absX - originX;
            const y = absY - originY;
            
            if (tileId) {
                const img = state.images[tileId];
                // Draw image or flat color based on toggle
                if (state.showTiles && img) {
                    tempCtx.drawImage(
                        img, 
                        x - HEX_WIDTH / 2, 
                        y - HEX_HEIGHT / 2, 
                        HEX_WIDTH, 
                        HEX_HEIGHT
                    );
                } else {
                    drawHexagonFillOnCtx(tempCtx, x, y, getTerrainColor(tileId), 0.0);
                }
                
                // Draw inside border if enabled and the tile type has one
                if (state.showBorders) {
                    const borderColor = getTileBorderColor(tileId);
                    if (borderColor) {
                        drawHexagonGridLineOnCtx(tempCtx, x, y, borderColor, 3.0, 1.5);
                    }
                }
            }
            
            // Draw grid line
            if (state.showGrid) {
                drawHexagonGridLineOnCtx(tempCtx, x, y, "rgba(255, 255, 255, 0.15)", 1, 0.0);
            }
            
            // Check if cell is a player start cell
            let isPlayerStart = false;
            for (let i = 0; i < state.playerCount; i++) {
                const startCell = state.playerStartCells[i];
                if (startCell && startCell.col === c && startCell.row === r) {
                    if (tileId && tileId.startsWith("Wizards Tower")) {
                        isPlayerStart = true;
                        break;
                    }
                }
            }
            
            if (isPlayerStart) {
                drawHexagonGridLineOnCtx(tempCtx, x, y, "rgba(226, 183, 71, 0.6)", 2, 0.0);
            }
        }
    }
    
    
    // Draw player starting badges on temp canvas
    const cellPlayerIndices = {};
    for (let i = 0; i < state.playerCount; i++) {
        const cell = state.playerStartCells[i];
        if (cell) {
            const tileId = state.mapData[cell.col]?.[cell.row];
            if (tileId && tileId.startsWith("Wizards Tower")) {
                const key = `${cell.col},${cell.row}`;
                if (!cellPlayerIndices[key]) cellPlayerIndices[key] = [];
                cellPlayerIndices[key].push(i);
            }
        }
    }
    
    const drawTempPlayerBadge = (tCtx, px, py, playerIndex) => {
        const colors = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b"];
        const color = colors[playerIndex] || "#ffffff";
        tCtx.save();
        tCtx.beginPath();
        tCtx.arc(px, py - 25, 14, 0, Math.PI * 2);
        tCtx.fillStyle = "rgba(0, 0, 0, 0.65)";
        tCtx.fill();
        tCtx.strokeStyle = color;
        tCtx.lineWidth = 2.5;
        tCtx.stroke();
        
        tCtx.fillStyle = color;
        tCtx.font = "bold 11px sans-serif";
        tCtx.textAlign = "center";
        tCtx.textBaseline = "middle";
        tCtx.fillText(`P${playerIndex + 1}`, px, py - 25);
        tCtx.restore();
    };
    
    Object.entries(cellPlayerIndices).forEach(([key, indices]) => {
        const [colStr, rowStr] = key.split(",");
        const col = parseInt(colStr);
        const row = parseInt(rowStr);
        const { x: absX, y: absY } = getCellCenter(col, row);
        const x = absX - originX;
        const y = absY - originY;
        
        if (indices.length === 1) {
            drawTempPlayerBadge(tempCtx, x, y, indices[0]);
        } else {
            const spacing = 24;
            const startX = x - ((indices.length - 1) * spacing) / 2;
            indices.forEach((playerIndex, idx) => {
                drawTempPlayerBadge(tempCtx, startX + idx * spacing, y, playerIndex);
            });
        }
    });

    // Download File with error handling for tainted canvas under file://
    try {
        const dataUrl = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        const baseName = state.mapName || `map_seed_${state.seed}_${state.cols}x${state.rows}`;
        link.download = getExportFileName(baseName, "png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("PNG Export failed:", e);
        alert(
            "Export failed due to browser security restrictions.\n\n" +
            "When opening index.html directly from your file system (using file:// protocol), " +
            "browsers block exporting canvas grids containing local images.\n\n" +
            "To fix this:\n" +
            "1. Run a local web server (e.g. 'python -m http.server' in the project directory).\n" +
            "2. Open http://localhost:8000 in your browser.\n" +
            "3. Alternatively, toggle OFF 'Show Terrain Art' to export flat-color maps."
        );
    }
}

// Helper to draw hex line on custom context
function drawHexagonGridLineOnCtx(tCtx, x, y, color, lineWidth, inset = 0.0) {
    tCtx.strokeStyle = color;
    tCtx.lineWidth = lineWidth;
    tCtx.beginPath();
    
    const { wt, wp, ht } = getHexDims(inset);
    
    tCtx.moveTo(x - wt, y - ht);
    tCtx.lineTo(x + wt, y - ht);
    tCtx.lineTo(x + wp, y);
    tCtx.lineTo(x + wt, y + ht);
    tCtx.lineTo(x - wt, y + ht);
    tCtx.lineTo(x - wp, y);
    
    tCtx.closePath();
    tCtx.stroke();
}

// Helper to get flat color of terrain for layout display/minimap representation
function getTerrainColor(tileId) {
    let level = 3; // Default level if not specified
    if (tileId.endsWith("L1")) level = 1;
    else if (tileId.endsWith("L2")) level = 2;
    else if (tileId.endsWith("L3")) level = 3;
    else if (tileId.endsWith("L4")) level = 4;

    if (tileId.startsWith("Grass")) {
        return "#2d4c38";
    }
    
    if (tileId.startsWith("Plain")) {
        if (level === 1) return "#dcc7a1";
        if (level === 2) return "#b2956b";
        if (level === 3) return "#87673f";
        return "#563c1e"; // L4
    }
    
    if (tileId.startsWith("Forrest")) {
        if (level === 1) return "#55a665";
        if (level === 2) return "#3b824c";
        if (level === 3) return "#225f33";
        return "#103b1e"; // L4
    }
    
    if (tileId.startsWith("Swamp")) {
        if (level === 1) return "#5e7f72";
        if (level === 2) return "#425f54";
        if (level === 3) return "#273832";
        return "#14201b"; // L4
    }
    
    if (tileId.startsWith("Mountain")) {
        if (level === 1) return "#7baed7";
        if (level === 2) return "#528cbe";
        if (level === 3) return "#2b5c8f";
        return "#132f50"; // L4
    }
    
    if (tileId.startsWith("Wizards Tower")) {
        if (level === 1) return "#f6df8a";
        if (level === 2) return "#d8b340";
        if (level === 3) return "#a17f1a";
        return "#654d09"; // L4
    }
    
    return "#111424";
}

// Helper to get inside border color for specific terrains
function getTileBorderColor(tileId) {
    if (tileId.startsWith("Swamp")) return "#000000";      // black
    if (tileId.startsWith("Mountain")) return "#ff3333";   // red
    if (tileId.startsWith("Forrest")) return "#2ecc71";    // green
    if (tileId.startsWith("Plain")) return "#ffffff";      // white
    return null;
}

// Helper to draw filled hexagons on custom context
function drawHexagonFillOnCtx(tCtx, x, y, color, inset = 0.0) {
    tCtx.fillStyle = color;
    tCtx.beginPath();
    
    const { wt, wp, ht } = getHexDims(inset);
    
    tCtx.moveTo(x - wt, y - ht);
    tCtx.lineTo(x + wt, y - ht);
    tCtx.lineTo(x + wp, y);
    tCtx.lineTo(x + wt, y + ht);
    tCtx.lineTo(x - wt, y + ht);
    tCtx.lineTo(x - wp, y);
    
    tCtx.closePath();
    tCtx.fill();
}

// Retrieve list of all tower cells present on the map
function getTowerCells() {
    const towers = [];
    for (let c = 0; c < state.cols; c++) {
        if (!state.mapData[c]) continue;
        for (let r = 0; r < state.rows; r++) {
            const tileId = state.mapData[c][r];
            if (tileId && tileId.startsWith("Wizards Tower")) {
                const manifestTile = TILE_MANIFEST.find(t => t.id === tileId);
                const label = manifestTile ? manifestTile.label : tileId;
                towers.push({ col: c, row: r, label: `${label} (Col: ${c}, Row: ${r})` });
            }
        }
    }
    return towers;
}

// Dynamically generate player start position selectors
function updatePlayerDropdowns() {
    const towers = getTowerCells();
    playerPositionsContainer.innerHTML = "";
    
    const colors = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b"];
    
    for (let i = 0; i < state.playerCount; i++) {
        const div = document.createElement("div");
        div.className = "input-container";
        div.style.marginBottom = "8px";
        
        const labelWrapper = document.createElement("div");
        labelWrapper.style.display = "flex";
        labelWrapper.style.alignItems = "center";
        labelWrapper.style.gap = "6px";
        labelWrapper.style.marginBottom = "4px";
        
        const colorIndicator = document.createElement("span");
        colorIndicator.style.display = "inline-block";
        colorIndicator.style.width = "10px";
        colorIndicator.style.height = "10px";
        colorIndicator.style.borderRadius = "50%";
        const color = colors[i] || "#ffffff";
        colorIndicator.style.backgroundColor = color;
        colorIndicator.style.boxShadow = `0 0 6px ${color}`;
        colorIndicator.style.flexShrink = "0";
        
        const label = document.createElement("label");
        label.textContent = `Player ${i + 1} Start Position`;
        label.style.fontSize = "0.75rem";
        label.style.margin = "0";
        
        labelWrapper.appendChild(colorIndicator);
        labelWrapper.appendChild(label);
        
        const select = document.createElement("select");
        select.id = `player-${i}-start-select`;
        select.style.fontSize = "0.8rem";
        select.style.padding = "6px 10px";
        
        if (towers.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "No Towers on Map";
            select.appendChild(opt);
            state.playerStartCells[i] = null;
        } else {
            towers.forEach(t => {
                const opt = document.createElement("option");
                opt.value = `${t.col},${t.row}`;
                opt.textContent = t.label;
                select.appendChild(opt);
            });
            
            // Try to select existing setting if still valid and unique
            const currentVal = state.playerStartCells[i];
            const isValid = currentVal && towers.some(t => t.col === currentVal.col && t.row === currentVal.row);
            const isUnique = isValid && !state.playerStartCells.slice(0, i).some(val => val && val.col === currentVal.col && val.row === currentVal.row);
            
            if (isValid && isUnique) {
                select.value = `${currentVal.col},${currentVal.row}`;
            } else {
                // Find first tower not already taken by a previous player
                let availableTower = towers.find(t => !state.playerStartCells.slice(0, i).some(val => val && val.col === t.col && val.row === t.row));
                if (!availableTower) {
                    // Fallback if there are fewer towers than players
                    availableTower = towers[i % towers.length];
                }
                select.value = `${availableTower.col},${availableTower.row}`;
                state.playerStartCells[i] = { col: availableTower.col, row: availableTower.row };
            }
        }
        
        select.addEventListener("change", (e) => {
            const val = e.target.value;
            if (val) {
                const [c, r] = val.split(",").map(Number);
                
                // Swap positions if another player is already at this position
                let swapIndex = -1;
                for (let j = 0; j < state.playerCount; j++) {
                    if (j !== i && state.playerStartCells[j] && state.playerStartCells[j].col === c && state.playerStartCells[j].row === r) {
                        swapIndex = j;
                        break;
                    }
                }
                
                if (swapIndex !== -1) {
                    const prevVal = state.playerStartCells[i];
                    state.playerStartCells[swapIndex] = prevVal;
                }
                
                state.playerStartCells[i] = { col: c, row: r };
            } else {
                state.playerStartCells[i] = null;
            }
            updatePlayerDropdowns();
            draw();
            autoSaveCurrentMap();
        });
        
        div.appendChild(labelWrapper);
        div.appendChild(select);
        playerPositionsContainer.appendChild(div);
    }
}

// Helper to draw player starting badge on canvas
function drawPlayerBadge(ctx, x, y, playerIndex) {
    const colors = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b"];
    const color = colors[playerIndex] || "#ffffff";
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y - 25, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.font = "bold 11px var(--font-body, sans-serif)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`P${playerIndex + 1}`, x, y - 25);
    ctx.restore();
}

// Helper to get hexagon dimensions with an optional inset to fit tile artwork exactly
function getHexDims(inset = 1.0) {
    const wt = 32 - inset * (32 / 64);
    const wp = 64 - inset;
    const ht = 55.5 - inset * (55.5 / 64);
    return { wt, wp, ht };
}

// Helper to update the cursor style on the canvas wrapper based on painting state
function updateCanvasCursor() {
    canvasWrapper.classList.remove("painting-active");
    canvasWrapper.classList.remove("eraser-active");
    if (state.selectedBrush === "Eraser") {
        canvasWrapper.classList.add("eraser-active");
    } else if (state.selectedBrush) {
        canvasWrapper.classList.add("painting-active");
    }
}

// Helper to calculate and display terrain statistics
function updateTerrainStats() {
    const statsPanel = document.getElementById("stats-panel");
    if (!statsPanel) return;

    let total = 0;
    const counts = {
        Grass: 0,
        Plain: 0,
        Forrest: 0,
        Swamp: 0,
        Mountain: 0,
        Tower: 0
    };

    for (let c = 0; c < state.mapData.length; c++) {
        if (!state.mapData[c]) continue;
        for (let r = 0; r < state.mapData[c].length; r++) {
            const tile = state.mapData[c][r];
            if (!tile) continue;
            total++;
            if (tile.startsWith("Grass")) counts.Grass++;
            else if (tile.startsWith("Plain")) counts.Plain++;
            else if (tile.startsWith("Forrest")) counts.Forrest++;
            else if (tile.startsWith("Swamp")) counts.Swamp++;
            else if (tile.startsWith("Mountain")) counts.Mountain++;
            else if (tile.startsWith("Wizards Tower")) counts.Tower++;
        }
    }

    if (total === 0) return;

    const createRowHTML = (name, icon, count, colorClass) => {
        const pct = ((count / total) * 100).toFixed(1);
        return `
            <div class="stats-row">
                <span class="stats-name"><i class="${icon}"></i> ${name}</span>
                <div class="stats-bar-wrapper">
                    <div class="stats-bar ${colorClass}" style="width: ${pct}%"></div>
                </div>
                <span class="stats-pct">${pct}%</span>
            </div>
        `;
    };

    statsPanel.innerHTML = `
        ${createRowHTML("Grass", "fa-solid fa-seedling", counts.Grass, "bar-grass")}
        ${createRowHTML("Plain", "fa-solid fa-leaf", counts.Plain, "bar-plain")}
        ${createRowHTML("Forest", "fa-solid fa-tree", counts.Forrest, "bar-forest")}
        ${createRowHTML("Swamp", "fa-solid fa-water", counts.Swamp, "bar-swamp")}
        ${createRowHTML("Mountain", "fa-solid fa-mountain", counts.Mountain, "bar-mountain")}
        ${createRowHTML("Tower", "fa-solid fa-chess-rook", counts.Tower, "bar-tower")}
    `;
}

// Get actual bounding box of the map grid, accounting for infinite/canvas mode
function getMapBounds() {
    let minC = 0;
    let maxC = state.cols - 1;
    let minR = 0;
    let maxR = state.rows - 1;
    
    if (!state.fixedDimensions) {
        let hasTiles = false;
        
        for (let c = 0; c < state.mapData.length; c++) {
            if (!state.mapData[c]) continue;
            for (let r = 0; r < state.mapData[c].length; r++) {
                if (state.mapData[c][r] !== undefined && state.mapData[c][r] !== null) {
                    if (!hasTiles) {
                        minC = c;
                        maxC = c;
                        minR = r;
                        maxR = r;
                        hasTiles = true;
                    } else {
                        minC = Math.min(minC, c);
                        maxC = Math.max(maxC, c);
                        minR = Math.min(minR, r);
                        maxR = Math.max(maxR, r);
                    }
                }
            }
        }
        
        // Pad the bounds slightly so the user can see adjacent empty cells to paint on!
        minC = Math.max(0, minC - 2);
        maxC = maxC + 2;
        minR = Math.max(0, minR - 2);
        maxR = maxR + 2;
    }
    
    return { minC, maxC, minR, maxR };
}

// Update the visibility and disabled state of columns/rows slider controls
function updateDimensionsControlsVisibility() {
    const colsContainer = colsSlider.closest(".slider-container");
    const rowsContainer = rowsSlider.closest(".slider-container");
    
    if (state.fixedDimensions) {
        colsContainer.classList.remove("disabled-control");
        rowsContainer.classList.remove("disabled-control");
        colsSlider.disabled = false;
        rowsSlider.disabled = false;
        colsVal.disabled = false;
        rowsVal.disabled = false;
        colsContainer.querySelectorAll("button").forEach(btn => btn.disabled = false);
        rowsContainer.querySelectorAll("button").forEach(btn => btn.disabled = false);
    } else {
        colsContainer.classList.add("disabled-control");
        rowsContainer.classList.add("disabled-control");
        colsSlider.disabled = true;
        rowsSlider.disabled = true;
        colsVal.disabled = true;
        rowsVal.disabled = true;
        colsContainer.querySelectorAll("button").forEach(btn => btn.disabled = true);
        rowsContainer.querySelectorAll("button").forEach(btn => btn.disabled = true);
    }
}

// Update the visibility and disabled state of the start axis toggle
function updateStartAxisVisibility() {
    if (state.manualTowers) {
        startAxisContainer.classList.add("disabled-control");
        startAxisToggle.disabled = true;
    } else {
        startAxisContainer.classList.remove("disabled-control");
        startAxisToggle.disabled = false;
    }
}

// Update the top panel display of the map dimensions
function updateDimensionsDisplay() {
    if (!dimensionsDisplay) return;
    
    if (state.fixedDimensions) {
        dimensionsDisplay.textContent = `Grid: ${state.cols} x ${state.rows}`;
    } else {
        let pMinC = Infinity, pMaxC = -Infinity, pMinR = Infinity, pMaxR = -Infinity;
        let hasPainted = false;
        
        for (let c = 0; c < state.mapData.length; c++) {
            if (!state.mapData[c]) continue;
            for (let r = 0; r < state.mapData[c].length; r++) {
                if (state.mapData[c][r]) {
                    pMinC = Math.min(pMinC, c);
                    pMaxC = Math.max(pMaxC, c);
                    pMinR = Math.min(pMinR, r);
                    pMaxR = Math.max(pMaxR, r);
                    hasPainted = true;
                }
            }
        }
        
        if (hasPainted) {
            const w = pMaxC - pMinC + 1;
            const h = pMaxR - pMinR + 1;
            dimensionsDisplay.textContent = `Active Area: ${w} x ${h} (Infinite)`;
        } else {
            dimensionsDisplay.textContent = `Active Area: 0 x 0 (Infinite)`;
        }
    }
}

/* ==========================================================================
   Map Manager Persistence, Auto-Save, and Filter Logic
   ========================================================================== */

// IndexedDB setup
const MAPS_DB_NAME = "WizardsMapGeneratorDB";
const MAPS_STORE_NAME = "mapsStore";
const MAPS_DB_VERSION = 1;
let mapsDb = null;
let autoSaveTimeout = null;
let isLoadingMap = false;

function initMapsDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(MAPS_DB_NAME, MAPS_DB_VERSION);
        
        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.errorCode);
            resolve();
        };
        
        request.onsuccess = (event) => {
            mapsDb = event.target.result;
            loadMapsFromDB().then(resolve);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(MAPS_STORE_NAME)) {
                db.createObjectStore(MAPS_STORE_NAME, { keyPath: "id" });
            }
        };
    });
}

function loadMapsFromDB() {
    return new Promise((resolve) => {
        if (!mapsDb) {
            resolve();
            return;
        }
        try {
            const transaction = mapsDb.transaction([MAPS_STORE_NAME], "readonly");
            const store = transaction.objectStore(MAPS_STORE_NAME);
            const request = store.get("saved_maps");
            
            request.onsuccess = (event) => {
                if (event.target.result) {
                    state.maps = event.target.result.maps || [];
                } else {
                    state.maps = [];
                }
                updateMapsListUI();
                resolve();
            };
            
            request.onerror = () => {
                state.maps = [];
                resolve();
            };
        } catch (e) {
            console.error("Failed to load maps from IndexedDB:", e);
            state.maps = [];
            resolve();
        }
    });
}

function saveMapsToDB() {
    return new Promise((resolve) => {
        if (!mapsDb) {
            resolve();
            return;
        }
        try {
            const transaction = mapsDb.transaction([MAPS_STORE_NAME], "readwrite");
            const store = transaction.objectStore(MAPS_STORE_NAME);
            const request = store.put({
                id: "saved_maps",
                maps: state.maps
            });
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                resolve();
            };
        } catch (e) {
            console.error("Failed to save maps to IndexedDB:", e);
            resolve();
        }
    });
}

function autoSaveCurrentMap() {
    if (isLoadingMap) return;
    
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    
    autoSaveTimeout = setTimeout(() => {
        const currentName = (state.mapName || "").trim();
        if (!currentName) {
            // Do not save if map name is empty/blank
            return;
        }
        
        // Find if there is an existing map with the same name (case-insensitive)
        // excluding the current map ID to avoid self-match when updating name
        const existingMap = state.maps.find(m => m.name.trim().toLowerCase() === currentName.toLowerCase() && m.id !== state.selectedMapId);
        
        if (existingMap) {
            // Case 1: Name matches another existing map. Update that map and switch session to it.
            state.selectedMapId = existingMap.id;
            state.isNewSessionMap = false;
            
            const mapIndex = state.maps.findIndex(m => m.id === existingMap.id);
            if (mapIndex !== -1) {
                state.maps[mapIndex] = {
                    id: existingMap.id,
                    name: currentName,
                    cols: state.cols,
                    rows: state.rows,
                    seed: state.seed,
                    startVertical: state.startVertical,
                    mode: state.mode,
                    fixedDimensions: state.fixedDimensions,
                    manualTowers: state.manualTowers,
                    showCenter: state.showCenter,
                    maxCols: state.maxCols,
                    maxRows: state.maxRows,
                    playerCount: state.playerCount,
                    playerStartCells: JSON.parse(JSON.stringify(state.playerStartCells)),
                    mapData: JSON.parse(JSON.stringify(state.mapData)),
                    quests: JSON.parse(JSON.stringify(state.quests)),
                    lastModified: Date.now()
                };
            }
        } else {
            // Case 2: Name is unique (or matches current map's own name).
            if (state.selectedMapId) {
                // If we are editing a map, update it in-place (no longer duplicating on rename)
                const mapIndex = state.maps.findIndex(m => m.id === state.selectedMapId);
                if (mapIndex !== -1) {
                    state.maps[mapIndex] = {
                        id: state.selectedMapId,
                        name: currentName,
                        cols: state.cols,
                        rows: state.rows,
                        seed: state.seed,
                        startVertical: state.startVertical,
                        mode: state.mode,
                        fixedDimensions: state.fixedDimensions,
                        manualTowers: state.manualTowers,
                        showCenter: state.showCenter,
                        maxCols: state.maxCols,
                        maxRows: state.maxRows,
                        playerCount: state.playerCount,
                        playerStartCells: JSON.parse(JSON.stringify(state.playerStartCells)),
                        mapData: JSON.parse(JSON.stringify(state.mapData)),
                        quests: JSON.parse(JSON.stringify(state.quests)),
                        lastModified: Date.now()
                    };
                }
            } else {
                // If selectedMapId is null (e.g. New Map was clicked), create a new map
                state.selectedMapId = "map_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                state.isNewSessionMap = true;
                
                const newMap = {
                    id: state.selectedMapId,
                    name: currentName,
                    cols: state.cols,
                    rows: state.rows,
                    seed: state.seed,
                    startVertical: state.startVertical,
                    mode: state.mode,
                    fixedDimensions: state.fixedDimensions,
                    manualTowers: state.manualTowers,
                    showCenter: state.showCenter,
                    maxCols: state.maxCols,
                    maxRows: state.maxRows,
                    playerCount: state.playerCount,
                    playerStartCells: JSON.parse(JSON.stringify(state.playerStartCells)),
                    mapData: JSON.parse(JSON.stringify(state.mapData)),
                    quests: JSON.parse(JSON.stringify(state.quests)),
                    lastModified: Date.now()
                };
                state.maps.unshift(newMap);
            }
        }
        
        saveMapsToDB().then(() => {
            updateMapsListUI();
        });
    }, 250);
}

function updateMapsListUI() {
    if (!mapListContainer || !mapsCountDisplay) return;
    
    mapsCountDisplay.textContent = `${state.maps.length} Saved Map${state.maps.length !== 1 ? "s" : ""}`;
    
    let filteredMaps = state.maps;
    if (state.activeFilters.size) {
        filteredMaps = filteredMaps.filter(map => {
            const tileCount = map.cols * map.rows;
            if (state.activeFilters.size === "Small") return tileCount <= 100;
            if (state.activeFilters.size === "Medium") return tileCount > 100 && tileCount <= 300;
            if (state.activeFilters.size === "Large") return tileCount > 300;
            return true;
        });
    }
    if (state.activeFilters.players) {
        filteredMaps = filteredMaps.filter(map => map.playerCount === parseInt(state.activeFilters.players));
    }
    
    mapListContainer.innerHTML = "";
    
    if (filteredMaps.length === 0) {
        mapListContainer.innerHTML = `
            <div class="map-empty-placeholder">
                <i class="fa-solid fa-map"></i>
                No matching maps found.
            </div>
        `;
        return;
    }
    
    filteredMaps.forEach(map => {
        const row = document.createElement("div");
        row.className = "map-card-row";
        if (map.id === state.selectedMapId) {
            row.classList.add("selected");
        }
        
        const info = document.createElement("div");
        info.className = "map-card-info";
        
        const name = document.createElement("div");
        name.className = "map-card-name";
        name.textContent = map.name || "Unnamed Map";
        
        const meta = document.createElement("div");
        meta.className = "map-card-meta";
        
        const sizeSpan = document.createElement("span");
        sizeSpan.className = "map-card-size";
        sizeSpan.textContent = `${map.cols}x${map.rows}`;
        
        const modeSpan = document.createElement("span");
        modeSpan.className = "map-card-mode";
        modeSpan.textContent = map.mode === "auto" ? "Procedural" : "Manual";
        
        const playersSpan = document.createElement("span");
        playersSpan.className = "map-card-size";
        playersSpan.textContent = `${map.playerCount} Players`;
        
        meta.appendChild(sizeSpan);
        meta.appendChild(modeSpan);
        meta.appendChild(playersSpan);
        
        info.appendChild(name);
        info.appendChild(meta);
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "map-card-delete-btn";
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.title = "Delete Map";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteMap(map.id);
        });
        
        row.appendChild(info);
        row.appendChild(deleteBtn);
        
        row.addEventListener("click", () => {
            loadMapDetails(map.id);
        });
        
        mapListContainer.appendChild(row);
    });
}

function loadMapDetails(id) {
    const map = state.maps.find(m => m.id === id);
    if (!map) return;
    
    isLoadingMap = true;
    
    state.selectedMapId = map.id;
    state.isNewSessionMap = false;
    state.mapName = map.name || "";
    if (mapNameInput) mapNameInput.value = state.mapName;
    
    state.cols = parseInt(map.cols);
    state.rows = parseInt(map.rows);
    state.seed = map.seed || "";
    state.startVertical = map.startVertical !== undefined ? map.startVertical : true;
    state.mode = map.mode || "manual";
    state.fixedDimensions = map.fixedDimensions !== undefined ? map.fixedDimensions : true;
    state.manualTowers = map.manualTowers !== undefined ? map.manualTowers : false;
    state.showCenter = map.showCenter !== undefined ? map.showCenter : false;
    state.maxCols = map.maxCols !== undefined ? parseInt(map.maxCols) : 30;
    state.maxRows = map.maxRows !== undefined ? parseInt(map.maxRows) : 30;
    state.playerCount = map.playerCount !== undefined ? parseInt(map.playerCount) : 2;
    state.playerStartCells = map.playerStartCells !== undefined ? JSON.parse(JSON.stringify(map.playerStartCells)) : [null, null, null, null];
    state.mapData = JSON.parse(JSON.stringify(map.mapData));
    state.quests = map.quests !== undefined ? JSON.parse(JSON.stringify(map.quests)) : [];
    
    // Sync UI elements
    colsSlider.max = state.maxCols;
    colsSlider.value = state.cols;
    colsVal.value = state.cols;
    rowsSlider.max = state.maxRows;
    rowsSlider.value = state.rows;
    rowsVal.value = state.rows;
    seedInput.value = state.seed;
    startAxisToggle.checked = state.startVertical;
    dimensionsToggle.checked = state.fixedDimensions;
    manualTowersToggle.checked = state.manualTowers;
    centerToggle.checked = state.showCenter;
    playerCountSelect.value = state.playerCount;
    
    updateDimensionsControlsVisibility();
    updateStartAxisVisibility();
    updatePlayerDropdowns();
    setMode(state.mode);
    
    centerMap();
    draw();
    
    isLoadingMap = false;
    
    showToast(`Loaded map "${state.mapName}"`);
    updateMapsListUI();
}

function deleteMap(id) {
    const map = state.maps.find(m => m.id === id);
    if (!map) return;
    
    if (confirm(`Are you sure you want to delete "${map.name || 'this map'}"?`)) {
        state.maps = state.maps.filter(m => m.id !== id);
        
        if (state.selectedMapId === id) {
            state.selectedMapId = null;
            state.isNewSessionMap = true;
            state.mapName = "";
            if (mapNameInput) {
                mapNameInput.value = "";
                mapNameInput.placeholder = "Enter Map Name...";
            }
        }
        
        saveMapsToDB().then(() => {
            updateMapsListUI();
            showToast("Map deleted");
        });
    }
}

function resetStateAndInputs() {
    state.cols = 15;
    state.rows = 10;
    state.seed = "12345";
    state.fixedDimensions = true;
    state.manualTowers = false;
    state.showCenter = false;
    state.playerCount = 2;
    state.playerStartCells = [null, null, null, null];
    
    colsSlider.value = 15;
    colsVal.value = 15;
    rowsSlider.value = 10;
    rowsVal.value = 10;
    seedInput.value = "12345";
    startAxisToggle.checked = true;
    dimensionsToggle.checked = true;
    manualTowersToggle.checked = false;
    centerToggle.checked = false;
    playerCountSelect.value = 2;
}

function resetMapForm() {
    state.selectedMapId = null;
    state.isNewSessionMap = true;
    
    let uniqueName = "New map 1";
    let counter = 1;
    while (state.maps.some(m => m.name.trim().toLowerCase() === uniqueName.toLowerCase())) {
        counter++;
        uniqueName = `New map ${counter}`;
    }
    
    state.mapName = uniqueName;
    if (mapNameInput) {
        mapNameInput.value = uniqueName;
        mapNameInput.placeholder = "Enter Map Name...";
    }
    
    resetStateAndInputs();
    
    updateDimensionsControlsVisibility();
    updateStartAxisVisibility();
    setMode("manual");
    clearCanvas();
    centerMap();
    draw();
    
    showToast("Started a new map");
    updateMapsListUI();
}

function showToast(text) {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toast-text");
    if (!toast || !toastText) return;
    
    toastText.textContent = text;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Helper to get formatted filename with today's date
function getExportFileName(baseName, extension) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const sanitized = baseName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    return `${sanitized}_${today}.${extension}`;
}

function exportMapsJSON() {
    if (state.maps.length === 0) {
        alert("No saved maps to export.");
        return;
    }
    const data = {
        version: 1,
        maps: state.maps
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getExportFileName("wizards_saved_maps", "json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Maps exported successfully!");
}

function importMapsJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.maps || !Array.isArray(data.maps)) {
                alert("Invalid file format. Missing maps collection.");
                return;
            }
            
            data.maps.forEach(importedMap => {
                const existingIndex = state.maps.findIndex(m => m.id === importedMap.id);
                if (existingIndex !== -1) {
                    importedMap.id = "map_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
                }
                state.maps.unshift(importedMap);
            });
            
            saveMapsToDB().then(() => {
                updateMapsListUI();
                showToast(`Imported ${data.maps.length} maps`);
            });
        } catch (error) {
            console.error("Error reading maps file:", error);
            alert("Error parsing file. Invalid JSON format.");
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

function clearAllMaps() {
    if (state.maps.length === 0) return;
    if (confirm("Are you sure you want to delete ALL saved maps? This action cannot be undone.")) {
        state.maps = [];
        state.selectedMapId = null;
        state.isNewSessionMap = true;
        state.mapName = "";
        if (mapNameInput) {
            mapNameInput.value = "";
            mapNameInput.placeholder = "Enter Map Name...";
        }
        
        saveMapsToDB().then(() => {
            updateMapsListUI();
            showToast("All maps deleted");
        });
    }
}

function setupFilterListeners() {
    const sizeBtns = document.querySelectorAll(".size-filter-btn");
    const clearSizeBtn = document.getElementById("clear-size-filters-btn");
    const sizeContainer = document.getElementById("size-filters-container");
    
    sizeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const size = btn.dataset.size;
            if (state.activeFilters.size === size) {
                state.activeFilters.size = null;
                btn.classList.remove("active");
            } else {
                sizeBtns.forEach(b => b.classList.remove("active"));
                state.activeFilters.size = size;
                btn.classList.add("active");
            }
            
            if (state.activeFilters.size) {
                if (clearSizeBtn) clearSizeBtn.style.display = "block";
                if (sizeContainer) sizeContainer.classList.add("has-active");
            } else {
                if (clearSizeBtn) clearSizeBtn.style.display = "none";
                if (sizeContainer) sizeContainer.classList.remove("has-active");
            }
            updateMapsListUI();
        });
    });
    
    if (clearSizeBtn) {
        clearSizeBtn.addEventListener("click", () => {
            state.activeFilters.size = null;
            sizeBtns.forEach(b => b.classList.remove("active"));
            clearSizeBtn.style.display = "none";
            if (sizeContainer) sizeContainer.classList.remove("has-active");
            updateMapsListUI();
        });
    }
    
    const playerBtns = document.querySelectorAll(".player-filter-btn");
    const clearPlayerBtn = document.getElementById("clear-player-filters-btn");
    const playerContainer = document.getElementById("player-filters-container");
    
    playerBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const players = btn.dataset.players;
            if (state.activeFilters.players === players) {
                state.activeFilters.players = null;
                btn.classList.remove("active");
            } else {
                playerBtns.forEach(b => b.classList.remove("active"));
                state.activeFilters.players = players;
                btn.classList.add("active");
            }
            
            if (state.activeFilters.players) {
                if (clearPlayerBtn) clearPlayerBtn.style.display = "block";
                if (playerContainer) playerContainer.classList.add("has-active");
            } else {
                if (clearPlayerBtn) clearPlayerBtn.style.display = "none";
                if (playerContainer) playerContainer.classList.remove("has-active");
            }
            updateMapsListUI();
        });
    });
    
    if (clearPlayerBtn) {
        clearPlayerBtn.addEventListener("click", () => {
            state.activeFilters.players = null;
            playerBtns.forEach(b => b.classList.remove("active"));
            clearPlayerBtn.style.display = "none";
            if (playerContainer) playerContainer.classList.remove("has-active");
            updateMapsListUI();
        });
    }
}

// Start Application
window.addEventListener("DOMContentLoaded", init);
