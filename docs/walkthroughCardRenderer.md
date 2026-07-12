# Walkthrough - Standalone Card Renderer Library, Colorless Mana, Custom Description, and Navigation

This walkthrough details the changes made to the Wizards Design System, including modularizing the high-fidelity MTG card rendering engine into a standalone library, merging colorless mana, adding interactive abilities, custom descriptions, and deck navigation.

## Standalone Card Renderer Library

We extracted the core high-fidelity canvas composition engine from `card_generator.html` into a standalone, modular library: [card_renderer.js](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/card_renderer.js).

### How to Use in Your Game

1. **Include the Library & Fonts**
   Copy `card_renderer.js` to your game directory. Load it and the required fonts in your HTML:
   ```html
   <!-- Load EB Garamond & Inter fonts -->
   <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">

   <!-- Load the renderer -->
   <script src="card_renderer.js"></script>
   ```

2. **Render a Card from JSON**
   Define a `<canvas>` element (standard 375x523 size or high-res 750x1046) and call the asynchronous rendering function `window.drawMTGCard(cardData, canvas)`:
   ```javascript
   // Target canvas element
   const canvas = document.getElementById("my-card-canvas");
   canvas.width = 375;
   canvas.height = 523;

   // Your imported card JSON object from the exported deck file
   const cardData = {
       cardName: "Volcano Elemental",
       frameStyle: "red",
       borderColor: "black",
       manaCost: ["R", "R", "C2"],
       cardType: "Creature",
       customDescription: "Born from the heart of a mountain.",
       keywords: ["Trample"],
       activatedAbilities: [
           { cost: ["R", "C1"], text: "This creature gains Haste until end of turn." }
       ],
       power: "4",
       toughness: "5",
       artBase64: "data:image/png;base64,..."
   };

   // Render!
   window.drawMTGCard(cardData, canvas).then(() => {
       console.log("Card rendered successfully with all custom text, icons, and illustrations!");
   });
   ```

3. **Options & Preloaded Images**
   If you have preloaded the card's illustration into an `HTMLImageElement` already, you can pass it in the options parameter to bypass the asynchronous base64 image loading:
   ```javascript
   window.drawMTGCard(cardData, canvas, { artImage: preloadedImage });
   ```

---

## Changes Made

### Card Generator & Editor

#### [card_generator.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/card_generator.html)
- **Modular Renderer Integration**: 
  - Included `<script src="card_renderer.js"></script>` to load the standalone rendering engine.
  - Linked the local `renderCardToCanvas(tempCtx, targetW, targetH)` function directly to `window.renderCardToCanvas` via a clean early-return check. This avoids duplicate code, slims down the main HTML file, and guarantees that card exports in the creator use the exact same logic as your game's card renderer.
- **Deck Navigation (UI Buttons & Keyboard shortcuts)**:
  - Added translucent glassmorphic navigation arrows with hover scales, cursor pointer changes, and disabled states.
  - Injected left (`#nav-prev-btn`) and right (`#nav-next-btn`) navigation buttons directly inside the preview panel.
  - Added keyboard event listeners (`ArrowLeft` / `ArrowRight`) to cycle cards, with safety checks that ignore keystrokes when typing inside inputs or when modals are active.
- **Custom Description Text**:
  - Added a **Custom Description Text** textarea in the sidebar form.
  - Placed the description text at the very top of the card's rules text area, preceding keywords and activated abilities.
  - Integrated this property into the app state, resets, and deck JSON import/export routines.
- **Colorless Mana Merging**:
  - Implemented automatic consolidation of colorless mana costs (e.g. adding two `{1}` symbols merges them into a single `{2}`).
- **Interactive Ability Simulation**:
  - Clicking on an activated ability in the card preview prompts a glassmorphic confirmation modal asking if you want to simulate the ability.

---

## Verification & testing

### Standalone Validation
- You can copy `card_renderer.js` into any game page to render the cards.
- The `card_generator.html` has been updated and verified to load the module correctly, export PNG files flawlessly, and sync perfectly with the card metadata creator.
