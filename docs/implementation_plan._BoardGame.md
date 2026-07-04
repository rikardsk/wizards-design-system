# Implementation Plan - Web-based Board Game Client Setup

This plan details the steps to set up a new React + TypeScript board game application within the workspace, integrate the assets (tile maps, card illustrations), and implement reusable rendering components.

## User Review Required

> [!IMPORTANT]
> The new project will be created in a subdirectory named `boardgame/` inside the current workspace `c:\Users\rikar\OneDrive\Skrivbord\Wizards Design System` using Vite + React + TypeScript. Please review the directory location and project settings.

> [!IMPORTANT]
> We will need to copy the design system assets (`game tiles`, `creatures`) to the new project's public folder to prevent missing asset references.

## Open Questions
- Do you have a preferred state management approach (e.g., standard React state, Zustand, or Redux) for managing game rounds and board states?
- Would you like the initial setup to include a mock multiplayer backend interface (WebSockets skeleton) or just focus on offline loading and rendering of exported maps/cards?

## Proposed Changes

### [NEW] boardgame Component

We will initialize a new React + TypeScript application using Vite and build the game renderer components.

#### [NEW] boardgame/package.json
- Standard package configuration for React, TypeScript, and Vite.

#### [NEW] boardgame/public/assets
- Copy `game tiles/` and `game tiles large/` into `boardgame/public/assets/tiles/`.
- Copy `creatures/` and `creatures small/` into `boardgame/public/assets/creatures/`.
- Create a sample map configuration under `boardgame/public/assets/maps/sample_map.json`.

#### [NEW] [game.ts](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/boardgame/src/types/game.ts)
- Define TypeScript models for map structure, card configuration, and starting positions.

#### [NEW] [GameBoard.tsx](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/boardgame/src/components/GameBoard.tsx)
- Reusable canvas-based hexagonal map rendering component. Reuses the flat-topped grid rendering, spacing offsets (`HEX_WIDTH = 128`, `HEX_HEIGHT = 111`, etc.), and drawing algorithms from `app.js`.

#### [NEW] [GameCard.tsx](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/boardgame/src/components/GameCard.tsx)
- Dynamic MTG-style card renderer built using HTML/CSS (styled div structures matching the layout in `card_generator.html`).

#### [NEW] [GameCard.css](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/boardgame/src/components/GameCard.css)
- CSS styles for card borders, gradients (red, blue, green, black, white, gold, artifact), header text, and rules layout.

#### [NEW] [App.tsx](file:///c:/Users/rikar/OneDrive/Skrivbord/Wizards%20Design%20System/boardgame/src/App.tsx)
- Primary entry point showing an interactive split-pane interface with the board game canvas on top and a card hand at the bottom.

---

## Verification Plan

### Automated Tests
- Build verification using Vite build: `npm run build` inside `boardgame/` directory to ensure zero TypeScript errors.

### Manual Verification
- Run the local development server: `npm run dev` inside `boardgame/`.
- Verify the map renders procedural/imported JSON data successfully.
- Verify cards render correct color frames, mana costs, and illustration assets without any console image-load errors.
