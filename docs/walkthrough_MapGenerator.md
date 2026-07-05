# Walkthrough - Hexagonal Map Generator

I have built the web-based hexagonal map generator in the workspace root. It is designed to work standalone: you can run it directly by double-clicking `index.html` in your browser.

## Changes Made

1.  **Main UI Page ([index.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/index.html))**
    *   Defines a full-screen app container.
    *   Left side holds the **Glassmorphic Control Panel** with sliders for width, height, seed, zoom, grid toggle, and export. Each slider is equipped with dynamic `+` and `-` buttons to fine-tune the values by 1 unit. Also includes toggle switches for grid visibility, tile rendering (Show Terrain Art), starting towers axis, and high-res assets.
    *   Bottom holds the **Tile Palette** showing all 21 tiles.
    *   Main area displays the dynamic `<canvas>`.
2.  **Styles ([style.css](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/style.css))**
    *   Dark theme design with high-fantasy gold and neon glows.
    *   Custom controls (range sliders, switches, select boxes, hover states).
    *   Sleek circular custom buttons for slider controls with transition effects on hover.
    *   Smooth transitions and micro-animations for grid selections.
3.  **Map Logic ([app.js](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/app.js))**
    *   **Hex Grid Layout:** Calculates coordinates for flat-topped hexes (128x103) with appropriate row offsets.
    *   **Procedural Noise Generator:** Generates seeded noise and runs a cellular smoothing filter. It scales terrain variants (L1-L4) continuously to match height gradients.
    *   **Paintbrush System:** Implements click-to-paint terrain tools, hover previews on the grid, and native title tooltips on the brush palette.
    *   **Controls & Helpers:** Implements zoom-to-mouse-wheel, click-drag panning, event delegation for the slider `+` and `-` buttons, and a sleek absolute floating tooltip tracking mouse movement over map hexagons.
    *   **Section Reset Buttons:** Each control group (Dimensions, Terrain, Towers, Players, and Display) features a dedicated reset button (`fa-arrow-rotate-left`) to instantly restore its settings back to the initial high-fantasy defaults.
    *   **Player Selection & Starting Positions:**
        *   Supports 2-4 players configurable via a dropdown selector in the sidebar.
        *   Procedural generation places starting towers (Wizards Tower L1) automatically: 2 players (opposite sides based on axis), 3 players (opposite sides + top/left), 4 players (corners/sides on all 4 directions).
        *   Provides individual starting position select dropdowns for each player, dynamically listing coordinates and names of all active Wizards Tower tiles currently on the map. Each dropdown in the sidebar is styled with a circular colored indicator prefix matching the player's assigned color (Indigo, Crimson, Emerald, and Gold).
        *   **Unique Positions Enforcement:** Players are not allowed to start in the same tile. During dropdown initialization/change, starting coordinates are assigned uniquely. If a player manually selects a tower already occupied by another player, their positions automatically swap, ensuring zero overlaps.
        *   Draws custom-colored, circular player starting badges ("P1", "P2", "P3", "P4") floating above the tower tiles on the interactive canvas.
    *   **Special Rules:** Protects starting player towers from being painted over or erased in automatic placement mode.
    *   **Show Terrain Art toggle:** Supports hiding tile images and rendering clean flat-colored hexagons representing each biome/terrain type (for a simplified tactical layout view).
    *   **Inside Terrain Borders:** Implemented terrain-specific inside borders (drawn with a thicker `3.0px` stroke width and `1.5px` inset to align cleanly inside) for Swamp (black), Mountain (red), Forest (green), and Plain (white). Includes a toggle switch to show or hide these borders entirely. Supports main canvas rendering, PNG exports, and SVG exports.
    *   **Standalone Exporters:**
        *   *PNG:* Draws tiles, borders, highlights, and player starting badges to a hidden 1:1 canvas and triggers download.
        *   *SVG:* Builds a complete vector grid, using `<clipPath>` for hexagons, embeds images as base64 URLs, and renders player starting badges as vector graphics so the SVG works standalone.
        *   *JSON:* Saves and loads `playerCount` and `playerStartCells` alongside the map layout data.
    *   **Map Manager Sidebar (IndexedDB Persistence):** Added a floating right sidebar to name, save, list, filter, delete, and import/export map designs persistent across sessions via IndexedDB. Includes a collapsible panel toggled via a smooth-sliding button.

## Verification Steps

To verify the map generator:
1.  Double-click `index.html` to open it in your browser.
2.  **Verify Sizing Sliders & Buttons:**
    *   Click the `+` and `-` buttons next to **Columns** and **Rows**; confirm the values change by exactly 1 and the grid updates instantly.
    *   Click the `+` and `-` buttons next to **Zoom Level**; confirm the map zooms in or out by 1% per click.
3.  **Verify Tooltips:**
    *   Hover over any brush tile in the bottom palette; a browser native tooltip showing the exact tile name (e.g. *Mountain L3*) should appear.
    *   Hover over any hexagonal tile in the map grid; a styled, floating glassmorphic tooltip showing the terrain type and cell coordinates (e.g. *Wizards Tower L1* and *Col: 0, Row: 5*) should follow your mouse cursor.
4.  **Verify Display Toggle switches:**
    *   **Show Grid Lines:** Toggle off to hide the overlay grid borders.
    *   **Show Terrain Art:** Toggle off to hide the images and see clean, flat-colored hexagons (dark green for grass, gold-brown for plains, deep forest green for forest, murky teal for swamp, rocky grey for mountain, and gold for wizards towers). Toggling it on restores the tile artwork.
    *   **Show Inside Borders:** Toggle off to hide the inside terrain borders (black for Swamp, red for Mountain, green for Forest, and white for Plain). Toggle it on to display them with a thick `3.0px` stroke line.
    *   **Highlight Center Tile(s):** Toggle on to highlight the exact center tile (or tiles if dimensions are even) with a red fill, red border outline, and central red target dot.
5.  **Verify Player Settings & Start Towers:**
    *   **Player Count:** Change the **Number of Players** dropdown between 2, 3, and 4. Verify that the procedural generator dynamically places the correct number of start towers (2, 3, or 4) on the grid.
    *   **Start Towers Axis:** Toggle the start axis switch. Check that the procedurally generated starting towers move accordingly.
    *   **Player Start Dropdowns:** Confirm that a starting position selector appears in the sidebar for each player, containing a list of all currently placed tower tiles on the map.
    *   **Canvas Badges:** Confirm that player badges (P1, P2, P3, P4) render on top of their selected towers on the canvas.
    *   **Unique Positions (Swapping):** Set Player 2 to the same starting position as Player 1 using the dropdown. Verify that Player 1 and Player 2 automatically swap their starting positions so that no two players share a starting tile.
6.  **Verify Seed:** Click the random dice button or type a seed; click **Regenerate** to see new terrain.
7.  **Verify Painting:** Click a tile in the bottom palette (e.g., *Mountain IV*), then click/drag on the map to paint. Check that start positions are protected from manual painting.
8.  **Verify Navigation:** Scroll to zoom, and right-click & drag to pan around the map.
9.  **Verify Export:** Click **Export as PNG** or **Export as SVG** and verify the downloaded image matches your map (including matching the Show Terrain Art state).
10. **Verify Bugfix:** Ensure painting into previously undefined coordinate space (if canvas expansion is enabled) initializes arrays correctly without crashing.
11. **Verify Map Manager & Collapse Toggle:**
    *   Click the circular toggle button (folder/chevron icon) on the right; confirm the sidebar slides away smoothly and the canvas fills the expanded area.
    *   Type a Map Name, make edits to the map, and verify that the map is automatically saved to the list in the sidebar.
    *   Filter maps by size or player counts and verify the list updates instantly.
    *   Reload the page and verify that your saved maps and the sidebar collapse state persist.

## Standalone Hex Tile Creator (tile_creator.html)

A separate utility `tile_creator.html` is provided in the project root to generate custom hex tiles.

### Features
*   **Layer Composition:** Composite a background terrain texture (or solid biome color) with a transparent foreground creature/object image.
*   **Layer Controls:** Individually pan, scale, and rotate both background and foreground layers for perfect centering.
*   **Inside Borders:** Select a preconfigured inside border (matching default terrains) or customize colors, widths, and insets.
*   **Exports:**
    *   *Standard (128x111px):* Export small PNGs ready to copy to `game tiles/`.
    *   *High-Res (512x444px):* Export large PNGs ready to copy to `game tiles large/`.
    *   *Copy Base64:* Copy the raw DataURL string to clipboard for directly patching into `assets_base64.js`.

### Verification Steps
1.  Double-click `tile_creator.html` in your browser.
2.  Choose a background biome preset (e.g. **Grass**) or upload a custom image.
3.  Drag and drop or select a transparent foreground PNG image in the **Foreground (Creature)** box.
4.  Toggle **Drag Background** or **Drag Creature** in the viewport header and click-drag on the canvas to pan that layer. Use your mouse scroll wheel to zoom the active layer.
5.  Select an inside border (e.g., **Mountain** or **Custom**), adjust width and inset sliders, and verify real-time canvas updates.
6.  Click **Copy Base64 String** and paste it into a text file to ensure the resulting base64 representation is valid and copied.
7.  Click **Save Standard (128x111 px)** and verify that the downloaded PNG is perfectly clipped into a flat-topped hexagon with transparent corners.

## Standalone Playing Card Creator (card_generator.html)

A separate web utility `card_generator.html` is provided in the project root to generate custom Magic: The Gathering (MTG) style playing cards.

### Features
*   **High-Fidelity MTG Layout**: Features outer dark card borders, themed frame gradients (Red, Green, Black, White, Blue, Gold, and Artifact), title bars, type headers, standard serif typography (EB Garamond), and rules text styling.
*   **Mana Cost Builder**: An interactive click-to-add system that builds a custom mana cost sequence using SVG graphics for all five core mana types (Plains/W, Island/U, Swamp/B, Mountain/R, Forest/G) and generic Colorless mana numbers.
*   **Art Dropzone**: Drag and drop any image directly onto the card's dropzone, and it will render instantly as the card's illustration.
*   **Creature Stats**: Power and Toughness fields appear dynamically only when the selected card type is set to **Creature**.
*   **Deck List & Persistent Storage**: All generated cards are added to a deck collection shown in the right sidebar. Decks are saved/loaded automatically in the browser's `localStorage` and can be imported/exported as a single `.json` text file.
*   **High-Quality Image Export**: Uses a multi-pass step-down downsampling filter to export pixel-perfect, crisp cards as PNG downloads (target size: `375x523 px`).

### Verification Steps
1.  Double-click `card_generator.html` in your browser.
2.  Type a title (e.g., *"Eldritch Dragon"*) and select **Creature** as the card type.
3.  Click the Red (R) and Colorless (2) mana buttons in the sidebar and verify that `2RR` appears as the mana cost on the preview card.
4.  Type a Power and Toughness value (e.g., *7* and *6*) and confirm that a styled P/T box appears in the bottom right corner of the card preview containing *"7/6"*.
5.  Drag and drop an image file (e.g., an illustration or photo) into the **Card Illustration** dropzone and confirm that the image automatically fills the card's art frame.
6.  Click **Generate & Add to Deck**. Verify that the card is added as a row in the **Deck Manager** on the right side of the screen and that the count updates.
7.  Click the card row in the deck list, modify some values (e.g., edit text or title), and click **Update Card in Deck** to save changes.
8.  Click **Save Card Image (PNG)** and verify that a crisp, high-quality PNG of the custom card is saved to your downloads folder.
9.  Click **Export Deck (JSON)** and verify that a `wizards_deck.json` configuration downloads containing the structured deck details.
10. Click **Clear Entire Deck**, then click **Import Deck (JSON)**, upload the downloaded file, and verify your cards are fully loaded back into the collection!

