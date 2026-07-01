Viewed pending.md:1-21

To build an online, multiplayer version of the board game using your hex maps and custom cards, I recommend **creating a new, separate project folder** structured as a monorepo (client + server), while keeping your current workspace as an offline "Creator & Asset Tool Suite" (to build decks, export tiles, and lay out maps).

Here is the recommended tech stack:

### 1. The Recommended Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** (or Vite + React) with **TypeScript** | React makes it incredibly easy to manage turn state, inventory, chat windows, modals, and render HTML-based cards dynamically. TypeScript ensures type safety across rules. |
| **Game Board Render** | **HTML5 Canvas / PixiJS** (or simple SVG) | Perfect for rendering the hex map dynamically, handling zoom/pan, dragging player tokens, and rendering selection highlights. |
| **Real-time Sync** | **Socket.io** or **Colyseus** | **Colyseus** is a specialized Node.js/TypeScript multiplayer framework that handles game state, rooms, client sync, and matchmaking automatically. |
| **Backend Server** | **Node.js** with **Express** | Fast, lightweight, and allows you to share game logic types (e.g., Card interfaces, Map coordinates) between frontend and backend. |
| **Database** | **PostgreSQL** or **MongoDB** | Store user accounts, custom saved cards/decks (imported from your JSON cards generator), and match histories. |

---

### 2. Should you use a new separate project folder?
**Yes, definitely start a separate project.** 

* **Clean Separation of Concerns**: Your current folder is a lightweight, vanilla HTML/JS static prototype workshop. A full multiplayer game will require package managers (`package.json`), build pipelines, backend servers, and web sockets. Keeping them separate avoids cluttering your creator tools.
* **Asset Pipeline**: You can treat this current folder as your **Design Suite**. Whenever you design a deck or map, you can export the JSON and copy it into the new game server folder to instantly load them as playable game data.