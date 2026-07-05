const PlainsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="100%" height="100%"><circle cx="9" cy="9" r="9" fill="#fdfbe6"/><path d="M9 3.5 L9.5 5 L11 4 L10 5.5 L11.5 6 L10 7 L11 8.5 L9.5 8 L9 9.5 L8.5 8 L7 8.5 L8 7 L6.5 6 L8 5.5 L7 4 L8.5 5 Z" fill="#e2b127"/><circle cx="9" cy="6.2" r="1.8" fill="#e2b127"/></svg>`;

const IslandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="100%" height="100%"><circle cx="9" cy="9" r="9" fill="#cbdcf0"/><path d="M9 3.5 C9 3.5, 6 7.5, 6 9.5 C6 11.2, 7.3 12.5, 9 12.5 C10.7 12.5, 12 11.2, 12 9.5 C12 7.5, 9 3.5, 9 3.5 Z M9 11.5 C8 11.5, 7.3 10.8, 7.3 9.8 C7.3 9, 8.5 7, 9 6.2 C9.5 7, 10.7 9, 10.7 9.8 C10.7 10.8, 10 11.5, 9 11.5 Z" fill="#135292"/></svg>`;

const SwampSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="100%" height="100%"><circle cx="9" cy="9" r="9" fill="#cbc5d0"/><path d="M9 3.5 C7 3.5, 5.5 5, 5.5 7 C5.5 9, 6.5 10, 6.5 11.5 L8 11.5 L8 12.5 L10 12.5 L10 11.5 L11.5 11.5 C11.5 10, 12.5 9, 12.5 7 C12.5 5, 11 3.5, 9 3.5 Z M7.3 6.5 C7.8 6.5, 8.1 7, 8.1 7.5 C8.1 8, 7.8 8.5, 7.3 8.5 C6.8 8.5, 6.5 8, 6.5 7.5 C6.5 7, 6.8 6.5, 7.3 6.5 Z M10.7 6.5 C11.2 6.5, 11.5 7, 11.5 7.5 C11.5 8, 11.2 8.5, 10.7 8.5 C10.2 8.5, 9.9 8, 9.9 7.5 C9.9 7, 10.2 6.5, 10.7 6.5 Z" fill="#1a121d"/></svg>`;

const MountainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="100%" height="100%"><circle cx="9" cy="9" r="9" fill="#f8a790"/><path d="M9.5 3 C9.5 3, 11 5, 11 6.5 C11 8, 10.2 8.5, 10.2 9.5 C10.2 10.5, 11 11, 10.5 12 C10 12.5, 8.5 12.5, 7.8 11.5 C7 10.5, 7 9, 7.8 8 C8.2 7.5, 8.2 6.5, 8.2 6 C8.2 5.5, 7.2 6.2, 6.8 6.5 C6 7.2, 5.5 8, 5.5 9 C5.5 11.2, 7 13, 9 13 C11.5 13, 12.8 11, 12.5 9 C12.2 7.2, 10.5 4.5, 9.5 3 Z" fill="#b12d14"/></svg>`;

const ForestSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="100%" height="100%"><circle cx="9" cy="9" r="9" fill="#99d1ad"/><path d="M9 3 C9 3, 6.5 7, 6.5 8 L7.8 8 L6 10 L8 10 L6.8 12 L11.2 12 L10 10 L12 10 L10.2 8 L11.5 8 Z M8.3 12 L8.3 13.5 L9.7 13.5 L9.7 12 Z" fill="#0f4a1f"/></svg>`;

export const MANA_SVGS = {
    W: PlainsSvg,
    U: IslandSvg,
    B: SwampSvg,
    R: MountainSvg,
    G: ForestSvg,
} as const;

export type ManaColor = keyof typeof MANA_SVGS;

/**
 * Returns a colorless/generic mana SVG with the given numeric or string label.
 */
export function getGenericManaSvg(value: string | number): string {
    const strVal = String(value);
    const label = strVal.startsWith("C") ? strVal.substring(1) : strVal;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="100%" height="100%"><circle cx="9" cy="9" r="9" fill="#cccccc"/><text x="9" y="13" font-family="sans-serif" font-weight="700" font-size="11" text-anchor="middle" fill="#111111">${label}</text></svg>`;
}

/**
 * Returns the raw SVG string for the specified symbol.
 * Supports W, U, B, R, G (case insensitive) and generic values (e.g. "C", "C2", "3").
 */
export function getManaSvg(symbol: string): string {
    const sym = symbol.toUpperCase();
    if (sym === "W") return PlainsSvg;
    if (sym === "U") return IslandSvg;
    if (sym === "B") return SwampSvg;
    if (sym === "R") return MountainSvg;
    if (sym === "G") return ForestSvg;
    return getGenericManaSvg(sym);
}

/**
 * Returns the Data URI for the specified symbol, ready to be used in <img> src.
 */
export function getManaDataUri(symbol: string): string {
    const svgContent = getManaSvg(symbol);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}
