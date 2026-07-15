# Walkthrough - Magic: The Gathering Card Generator

I have built a web-based, standalone MTG-style Card Generator in the workspace root. Aligned with the "Wizards of the North" aesthetic, it operates directly as a standalone HTML application that you can launch by double-clicking `card_generator.html` in your browser.

## Changes Made

1.  **Card Creator Page ([card_generator.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/card_generator.html))**
    *   **Left Sidebar (Card Parameters)**: Inputs for card name, frame style selector (Red, Green, Black, White, Blue, Gold, and Artifact), interactive mana cost builder (buttons to add colored and colorless symbols), type dropdown, conditional Power & Toughness stats, a drag-and-drop illustration dropzone, and a rules text editor.
    *   **Center Viewport (Live Preview)**: A centered, highly authentic MTG card display containing high-quality fonts (EB Garamond, Cinzel), SVG mana icons, layered text boxes, and card art overlays.
    *   **Right Sidebar (Deck Manager)**: Track and manage your card designs. Cards are automatically saved to your deck as soon as you type a Card Name, and all subsequent edits (mana cost, type, rules text, art, etc.) are saved in real-time to the IndexedDB database. Includes a "New Card" button to clear inputs and deselect cards, deck statistics, and deck JSON file export/import.
    *   **Interactive Deck Filters**: Added a premium-styled filters panel to the Deck Manager sidebar.
        *   **Filter by Mana**: Clean circular buttons representing each mana type (White, Blue, Black, Red, Green, and Colorless) utilizing the SVG mana icons from the page. Clicking toggles filtering.
        *   **Filter by Type**: Interactive pills for Artifact, Creature, Enchantment, Land, Spell, and Tower.
        *   **Clear Filters**: Inline buttons to quickly reset active filters when selections exist.
        *   **Dynamic Counter**: Updates the deck count text to show "X of Y Cards shown" when active filters are applied, with placeholder states for empty results.
    *   **High-Quality Downsampled PNG Exporter**: Draws the card components (vectors, borders, user's uploaded art, custom fonts) to an offline canvas at a high resolution (`750x1046 px`) and downsamples it using step-down smoothing to export a crisp, pixel-perfect PNG card image (`375x523 px`).

2.  **Navigation Inter-linkage**
    *   **[index.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/index.html)**: Added buttons at the bottom of the sidebar to launch both the Hex Tile Creator and the Card Creator.
    *   **[tile_creator.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/tile_creator.html)**: Updated the sidebar footer with links to return to the Map Generator or navigate to the Card Creator.

3.  **Documentation Update ([docs/walkthrough_CardGenerator.md](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/docs/walkthrough_CardGenerator.md))**
    *   Appended new filters feature and manual verification steps for testing the Deck Manager filters.

---

## Verification & Usage Steps

1.  **Launch the App**: Double-click `card_generator.html` (or click **Open Card Creator** from the bottom left of `index.html` or `tile_creator.html`).
2.  **Configure a Card**:
    *   Set **Card Name** to *"Infernal Drake"*. Notice that as soon as you type the name, a new card is added to the Deck Manager sidebar!
    *   Click the Red (**R**), Black (**B**), and Colorless (**2**) mana buttons. Verify that the mana symbols `2BR` appear in the top-right corner of the card preview, and verify that the deck list updates to show these symbols in real-time.
    *   Choose the **Gold** frame style.
    *   Select **Creature** or **Tower** as the Card Type; verify that the Power/Toughness input fields appear. Set them to `5` and `5`.
    *   Drag and drop any picture into the **Card Illustration** dropzone (or click it to browse files). Verify the image fits the art window perfectly.
    *   Add rules text: *"Flying, Haste.\n\nAt the beginning of your upkeep, discard a card."*
3.  **Start a New Card**:
    *   Click **New Card**. Verify that the form resets and is ready for a new entry.
4.  **Test Deck Manager Filters**:
    *   Set the new card's name to *"Aether Ring"*, set type to *"Artifact"*, and cost to Colorless (**1**). Verify it is auto-saved to the deck list.
    *   **Mana Filters**:
        *   Click the **Red (R)** mana button. Verify the list only shows *"Infernal Drake"*. The header should read: *"1 of 2 Cards shown"*.
        *   Toggle the **Red (R)** button off. Click the **Colorless (C)** mana button. Verify the list only shows *"Aether Ring"*.
        *   Click **Clear** next to "Filter by Mana". Verify all cards reappear.
    *   **Type Filters**:
        *   Click the **Artifact** type button. Verify only *"Aether Ring"* is listed.
        *   Click the **Creature** type button as well (both Artifact and Creature active). Verify both cards are shown.
        *   Click **Clear** next to "Filter by Type". Verify all cards reappear.
5.  **Edit Card**:
    *   Click on your card in the deck list. Verify the left sidebar form is populated with the card's values.
    *   Change the name or any other parameter, and verify that the changes are immediately saved and reflected in the deck list in real-time.
6.  **Save Card Image**:
    *   Click **Save Card Image (PNG)** at the top. Confirm that a high-quality, downsampled PNG of your card downloads.
7.  **Backup/Restore**:
    *   Edit the **Deck Name** at the top of the Deck Manager sidebar (e.g., set it to *"Fire and Ice"*).
    *   Click **Export Deck (JSON)**; verify that the exported file is named dynamically as `<deck_name>_<today's_date>.json` (e.g., `fire_and_ice_2026-07-01.json`).
    *   Click **Clear Entire Deck**; confirm the manager empties.
    *   Click **Import Deck (JSON)**, select the downloaded file, and verify your deck name (*"Fire and Ice"*) and cards are fully restored.
