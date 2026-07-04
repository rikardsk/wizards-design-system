# Walkthrough - Board Game Project Setup

I have successfully initialized the web-based board game project in the `boardgame/` folder, copied all design assets, and built the gameplay loop complete with an interactive canvas map, MTG-style cards, and an active Bot opponent.

---

## 📂 Project Structure Created

The project is structured under the `boardgame/` folder as follows:

- **`public/assets/`**: Contains assets copied from the design suite:
  - `tiles/`: All hexagonal biome tiles.
  - `creatures/`: Illustrations for card artwork.
  - `maps/sample_map.json`: Configured 11x9 hex map layout.
  - `decks/starter_deck.json`: Configured MTG-style starter deck cards.
- **`src/types/game.ts`**: TypeScript definitions for `CardJSON`, `MapCell`, `Player`, and the unified `GameState` to ensure compile-time safety.
- **`src/components/GameBoard.tsx`**: Interactive canvas-based hex grid renderer.
  - Reuses drawing algorithms, hex dimensions (`128px` wide, `111px` high), and column offsets.
  - Features high-fidelity **right-click panning** and **scroll-to-zoom**.
  - Renders ownership rings around hexes matching the player colors, and draws circular portrait overlays on hex centers if occupied by creatures.
- **`src/components/GameCard.tsx` / `GameCard.css`**: Dynamic HTML/CSS-based MTG card renderers.
  - Renders colored frames based on card attributes (Red, Green, Blue, Black, White, Gold, Artifact).
  - Uses CSS transforms for smooth hover pop-ups, slide animations, and selectable borders.
- **`src/App.tsx` / `App.css`**: Game controller state manager:
  - Manages player decks, hands, turns, and mana pools.
  - Implements an AI bot that evaluates playable cards and places them strategically.
  - Controls victory/defeat conditions based on Tower health points.

---

## 🎮 How to Run and Play

Open your terminal, navigate to the new project folder, and start the development server:

```powershell
cd boardgame
npm run dev
```

### Game Rules & Mechanics Implemented

1. **Mana & Turn Progression**:
   - Both players start with 3 mana.
   - At the beginning of each turn, players draw a card and their max mana capacity increases progressively (capping at 10 mana).
2. **Deploying Summonings**:
   - Select a card in your hand (at the bottom of the screen). If you have enough mana, it will highlight.
   - Click any empty cell on the map that is adjacent to your owned tiles or your starting tower (Player 1 starts on the left at `(0, 4)`).
   - Once placed, your creature appears on the tile and you claim ownership of that hexagonal sector.
3. **Card-Specific Ability Triggers**:
   - **Wizard Apprentice**: Automatically draws an extra card when played.
   - **Plains Unicorn**: Automatically heals your Wizards Tower for 1 HP when played.
4. **Tower Combat**:
   - Deploying a creature adjacent to the enemy's starting tower triggers an automatic attack.
   - The enemy's Tower HP is reduced by the creature's Power.
   - Starting towers have 10 HP. If a tower reaches 0 HP, the game ends and a victory modal is displayed.
5. **Bot AI (Sauron Bot)**:
   - When you click **End Turn**, Sauron Bot takes over.
   - The bot evaluates its cards, waits 1.5 seconds (to simulate thinking), places a card it can afford on a valid grid cell, and ends its turn.

---

> [!TIP]
> The folder `boardgame/` is fully self-contained. Since all assets have been copied and structured locally, you can safely copy or move this entire `boardgame/` directory anywhere else on your computer (e.g. to a new Git repository) and run it using the same `npm install` and `npm run dev` commands.
