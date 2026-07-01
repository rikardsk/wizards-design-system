# Implementation Plan - Magic: The Gathering Card Generator

We will implement a web-based, standalone MTG-style Card Generator (`card_generator.html`) in the project root. This tool will allow users to design custom playing cards with name, mana cost, type, text, and art, arrange them into a deck list, persist the deck using local storage, and export cards as high-quality PNG images.

## User Review Required

> [!IMPORTANT]
> The Card Generator will render cards using high-fidelity HTML/CSS layout in the center of the screen, which supports drag-and-drop art. Clicking **Save Card** or **Generate** will render the composition on an offline canvas using our step-down anti-aliasing filter to ensure a crisp, high-quality PNG download.

> [!TIP]
> We will add full support for all five core MTG colors (White/Plains, Blue/Island, Black/Swamp, Red/Mountain, Green/Forest) and Colorless mana symbols, including dynamic Power/Toughness fields that appear when the card type is set to "Creature".

## Open Questions

No blocker questions. We will support:
1. All five color mana symbols (Plains, Island, Swamp, Mountain, Forest) + Colorless numbers.
2. Local deck list saving/loading using `localStorage` so cards persist across refreshes.
3. Import/Export of the entire deck in JSON format.
4. Auto-filtering of UI controls (such as showing Power/Toughness controls only for "Creatures").

---

## Proposed Changes

### [NEW] [card_generator.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/card_generator.html)
A standalone single-file HTML/CSS/JS application including:
- **Responsive Layout**:
  - **Left Sidebar**: Card configuration parameters (Name, Mana Cost builder, Type dropdown, Textarea, Art Dropzone, Frame color presets, and Creature Stats).
  - **Center Viewport**: A highly authentic, live CSS render of the MTG card, centered on a dark glassmorphic grid background.
  - **Right Sidebar (Deck Manager)**: Displays the list of cards in the current deck. Clicking a card loads it back into the generator; clicking its delete icon removes it. Includes buttons to clear the deck or download/upload the deck as a `.json` file.
- **Mana Icon Builder**: Inline SVGs for Plains (Sun), Island (Water drop), Swamp (Skull), Mountain (Fire), Forest (Tree), and Colorless (gray circle with number).
- **High-Quality Export**: Canvas-rendered card generator using a step-down downsampling filter for pixel-perfect card images (target size: standard `375x523 px` or custom high-res `750x1046 px`).

### [MODIFY] [index.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/index.html)
- Add a navigation button at the bottom of the sidebar to easily launch the Card Generator.

### [MODIFY] [tile_creator.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20of%20the%20North/tile_creator.html)
- Add navigation links to make moving between the Map Generator, Tile Creator, and Card Generator seamless.

---

## Verification Plan

### Manual Verification
1. Open `card_generator.html` in a web browser.
2. Fill in card properties: Name: *"Forest Elemental"*, Mana: *`2GG`*, Type: *`Creature`*, Text: *"Trample, Reach. When Forest Elemental enters the battlefield, search your library for a forest card."*, P/T: *`4/5`*.
3. Choose the Green frame style and drag/drop an image into the Card Art drop zone.
4. Click **Generate** and verify the card is added to the deck sidebar on the right.
5. Click **Save Card** and verify that a high-quality PNG image of the card is downloaded.
6. Refresh the page and confirm the deck persists via `localStorage`.
7. Click the **Delete** button next to a card in the deck and verify it is removed.
8. Click **Export Deck JSON**, clear the deck, then import the JSON file and verify the deck is fully restored.
