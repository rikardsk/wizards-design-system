# Wizards of the North - Game Design Suite

A premium, interactive web-based toolkit for creating, generating, and exporting hexagonal game boards, custom Magic: The Gathering-style playing cards, and standalone hex game assets.

---

## 🛠️ Included Applications

### 1. 🗺️ Hexagonal Map Generator (`index.html`)
An advanced map editor for drawing and generating tactical hexagonal game grids.
*   **Procedural Generation:** Seed-based cellular noise generator that creates organic terrain distributions.
*   **Multiplayer Ready:** Configurable start towers for 2, 3, or 4 players. Features individual starting selector dropdowns that automatically enforce unique start positions and swap coordinates on conflict.
*   **Aesthetics:** Sleek dark-fantasy glassmorphism sidebar, glow effects, floating cell-tracking tooltips, and custom player badges (P1–P4).
*   **Advanced Visuals:** Custom biomes (Grass, Plain, Swamp, Forest, Mountain, Towers) with inside borders, grid toggles, and flat-color vector views.
*   **Exporters:** Clean vector SVG downloader, high-resolution PNG exporter, and layout JSON configuration storage.

### 2. 🎴 Playing Card Creator (`card_generator.html`)
A high-fidelity custom card builder designed to match Magic: The Gathering layouts.
*   **Frictionless Auto-Save:** Persistent IndexedDB storage ensuring designs are saved instantly without loading lag.
*   **Interactive Customization:** Custom mana cost sequence builder, creature stats, frame gradients (Red, Green, Black, White, Blue, Gold, Artifact), and drag-and-drop art illustrations.
*   **Deck Manager:** Browse, select, and filter your collection by color/type in a sidebar panel. Supports deck naming, dynamic date-stamped JSON exporting (`<deck_name>_<yyyy-mm-dd>.json`), and importing.

### 3. 🛡️ Standalone Hex Tile Creator (`tile_creator.html`)
A creation lab for composite hexagonal tokens/tiles.
*   **Layering:** Composite transparent creature/object overlays on top of biome backgrounds.
*   **Fine-tuning:** Pan, scale, and rotate layers individually.
*   **Borders:** Custom borders and preset inside biomes (Plain, Swamp, Forest, Mountain).
*   **Base64 Export:** Encodes tiles to data URI string for direct copying.

---

## 🚀 How to Run Locally

Due to browser security protocols (`CORS` / tainted canvas restrictions), canvas operations and image exports will fail when opening files directly using the `file://` protocol. 

To run the apps with full export capabilities:

1.  Open your terminal inside the project folder.
2.  Start a local HTTP server:
    ```bash
    python -m http.server 8000
    ```
3.  Open your browser and navigate to:
    ```
    http://localhost:8000
    ```

---

## 📂 Project Structure
*   `index.html` / `app.js` / `style.css` — Core Map Generator files.
*   `card_generator.html` — Card Creator application.
*   `tile_creator.html` — Hex Tile Creator utility.
*   `docs/` — Walkthroughs and technical documentation.
*   `game tiles/` — Active hex assets used by the map generator.
*   `creatures/` / `creatures small/` — Transparent foreground illustrations.
*   `*.py` — Python utility scripts for asset pre-processing.
