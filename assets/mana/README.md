# Mana Icon Assets

This folder contains MTG-style mana icon assets extracted from the Card Generator, formatted for easy integration into web apps, Canvas games, React projects, or other game engines.

## Folder Structure

```
assets/mana/
├── mana_w.svg       # Plains (White)
├── mana_u.svg       # Island (Blue)
├── mana_b.svg       # Swamp (Black)
├── mana_r.svg       # Mountain (Red)
├── mana_g.svg       # Forest (Green)
├── mana_c.svg       # Colorless / Generic base (default 'C')
├── manaIcons.ts     # TypeScript module with raw strings & Data URI helpers
└── README.md        # This file
```

---

## 1. Using SVG Files Directly

You can import the individual `.svg` files directly into your project's assets folder and reference them like any image:

```html
<img src="path/to/mana_w.svg" alt="White Mana" width="18" height="18" />
```

---

## 2. Using the TypeScript Module (`manaIcons.ts`)

For dynamic rendering (especially useful for generic colorless costs like `1`, `2`, `3` etc. or dynamic UI rendering in JavaScript/TypeScript/React), you can import the TypeScript module:

### Direct SVG Insertion (HTML)

```typescript
import { getManaSvg } from './manaIcons';

// Insert directly into DOM
const container = document.getElementById('mana-cost');
container.innerHTML = getManaSvg('W') + getManaSvg('R') + getManaSvg('2');
```

### Direct Image Sources (React / Vue)

You can use the Data URI helper to set the `src` attribute of any `<img>` tag:

```typescript
import { getManaDataUri } from './manaIcons';

function ManaSymbol({ symbol }: { symbol: string }) {
  return (
    <img 
      src={getManaDataUri(symbol)} 
      alt={`${symbol} mana`} 
      style={{ width: '18px', height: '18px' }} 
    />
  );
}
```

### Canvas Games (HTML5 Canvas / PixiJS)

If your game draws to a canvas, you can load the data URIs as images to draw them:

```typescript
import { getManaDataUri } from './manaIcons';

function drawManaIcon(ctx: CanvasRenderingContext2D, symbol: string, x: number, y: number) {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, x, y, 18, 18);
  };
  img.src = getManaDataUri(symbol);
}
```
