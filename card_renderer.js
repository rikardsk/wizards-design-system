/**
 * card_renderer.js
 * 
 * Standalone MTG Card Canvas Rendering Library
 * Part of Wizards Design System
 * 
 * Usage:
 *   // 1. Include this file in your HTML:
 *   //    <script src="card_renderer.js"></script>
 *   
 *   // 2. Call the rendering function on a canvas:
 *   //    const canvas = document.getElementById("my-card-canvas");
 *   //    window.drawMTGCard(cardData, canvas).then(() => {
 *   //        console.log("Card rendered successfully!");
 *   //    });
 * 
 * Note: To ensure font styling matches the generator exactly, load the following Google Fonts in your page:
 *   - EB Garamond: <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
 *   - Inter (for art placeholder text): <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
 */

(function (global) {
    // Helper to get combined rules text from keywords, activated abilities, and custom rules text
    function getCardFullRulesText(card) {
        const parts = [];
        
        // 0. Custom description text
        if (card.customDescription && card.customDescription.trim()) {
            parts.push(card.customDescription.trim());
        }
        
        // 1. Keywords
        if (card.keywords && card.keywords.length > 0) {
            const keywordsStr = card.keywords.join(", ") + ".";
            parts.push(keywordsStr);
        }
        
        // 2. Activated Abilities
        if (card.activatedAbilities && card.activatedAbilities.length > 0) {
            card.activatedAbilities.forEach(ability => {
                const costStr = (ability.cost || []).map(sym => {
                    if (sym.startsWith("C")) {
                        return `{${sym.substring(1)}}`;
                    }
                    return `{${sym}}`;
                }).join("");
                
                parts.push((ability.cost || []).length > 0 ? `${costStr}: ${ability.text}` : ability.text);
            });
        }
        
        // 3. Custom rules text
        if (card.rulesText && card.rulesText.trim()) {
            parts.push(card.rulesText.trim());
        }
        
        return parts.join("\n\n");
    }

    // Draw individual Mana symbols in Canvas exports
    function drawManaSymbolOnCanvas(ctx, symbol, cx, cy, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        
        // Set circle fill based on color type
        if (symbol === "W") ctx.fillStyle = "#fdfbe6";
        else if (symbol === "U") ctx.fillStyle = "#cbdcf0";
        else if (symbol === "B") ctx.fillStyle = "#cbc5d0";
        else if (symbol === "R") ctx.fillStyle = "#f8a790";
        else if (symbol === "G") ctx.fillStyle = "#99d1ad";
        else ctx.fillStyle = "#cccccc"; // Colorless
        
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        
        // Draw symbol graphics inside circle
        ctx.fillStyle = "#111111";
        if (symbol === "W") { // Sun icon
            ctx.fillStyle = "#e2b127";
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.4, 0, 2 * Math.PI);
            ctx.fill();
            // Sun rays
            ctx.strokeStyle = "#e2b127";
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x1 = cx + Math.cos(angle) * (radius * 0.45);
                const y1 = cy + Math.sin(angle) * (radius * 0.45);
                const x2 = cx + Math.cos(angle) * (radius * 0.75);
                const y2 = cy + Math.sin(angle) * (radius * 0.75);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        } else if (symbol === "U") { // Droplet icon
            ctx.fillStyle = "#135292";
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius*0.6);
            ctx.bezierCurveTo(cx - radius*0.4, cy, cx - radius*0.5, cy + radius*0.5, cx, cy + radius*0.5);
            ctx.bezierCurveTo(cx + radius*0.5, cy + radius*0.5, cx + radius*0.4, cy, cx, cy - radius*0.6);
            ctx.fill();
        } else if (symbol === "B") { // Skull icon
            ctx.fillStyle = "#1a121d";
            ctx.beginPath();
            ctx.arc(cx, cy - radius*0.1, radius*0.4, Math.PI, 0);
            ctx.lineTo(cx + radius*0.3, cy + radius*0.4);
            ctx.lineTo(cx - radius*0.3, cy + radius*0.4);
            ctx.closePath();
            ctx.fill();
            // Eyes
            ctx.fillStyle = "#cbc5d0";
            ctx.beginPath();
            ctx.arc(cx - radius*0.15, cy - radius*0.1, radius*0.1, 0, 2*Math.PI);
            ctx.arc(cx + radius*0.15, cy - radius*0.1, radius*0.1, 0, 2*Math.PI);
            ctx.fill();
        } else if (symbol === "R") { // Fire icon
            ctx.fillStyle = "#b12d14";
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius*0.7);
            ctx.bezierCurveTo(cx + radius*0.5, cy - radius*0.2, cx + radius*0.4, cy + radius*0.5, cx, cy + radius*0.6);
            ctx.bezierCurveTo(cx - radius*0.5, cy + radius*0.5, cx - radius*0.4, cy - radius*0.1, cx + radius*0.1, cy - radius*0.1);
            ctx.bezierCurveTo(cx - radius*0.1, cy - radius*0.4, cx, cy - radius*0.7, cx, cy - radius*0.7);
            ctx.fill();
        } else if (symbol === "G") { // Tree icon
            ctx.fillStyle = "#0f4a1f";
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius*0.6);
            ctx.lineTo(cx + radius*0.4, cy + radius*0.2);
            ctx.lineTo(cx + radius*0.2, cy + radius*0.2);
            ctx.lineTo(cx + radius*0.5, cy + radius*0.6);
            ctx.lineTo(cx - radius*0.5, cy + radius*0.6);
            ctx.lineTo(cx - radius*0.2, cy + radius*0.2);
            ctx.lineTo(cx - radius*0.4, cy + radius*0.2);
            ctx.closePath();
            ctx.fill();
            // Trunk
            ctx.fillRect(cx - radius*0.1, cy + radius*0.6, radius*0.2, radius*0.2);
        } else if (symbol.startsWith("C")) { // Colorless text number
            const number = symbol.substring(1);
            ctx.fillStyle = "#111111";
            ctx.font = `bold ${Math.round(radius * 1.25)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(number, cx, cy + 0.5);
        }
        ctx.restore();
    }

    // Helper to measure text width considering inline mana symbols
    function measureTextWithSymbols(ctx, word, scale, isItalic = false) {
        if (!word) return 0;
        const parts = word.split(/(\{.+?\})/g);
        let width = 0;
        const diameter = 13 * scale;
        
        ctx.save();
        ctx.font = `${isItalic ? 'italic ' : ''}${Math.round(12.5 * scale)}px "EB Garamond", serif`;
        
        parts.forEach(part => {
            if (part.startsWith("{") && part.endsWith("}")) {
                const symbol = part.slice(1, -1);
                const isMana = /^[WUBRG]$/i.test(symbol);
                const isNumber = /^\d+$/.test(symbol);
                if (isMana || isNumber) {
                    width += diameter + (2 * scale);
                    return;
                }
            }
            width += ctx.measureText(part).width;
        });
        ctx.restore();
        return width;
    }

    function measureLineWithSymbols(ctx, line, scale, isItalic = false) {
        return measureTextWithSymbols(ctx, line, scale, isItalic);
    }

    // Helper to draw a line with inline mana symbols
    function drawLineWithSymbols(ctx, line, x, y, scale, isItalic = false) {
        if (!line) return;
        const parts = line.split(/(\{.+?\})/g);
        let currentX = x;
        const radius = 6.5 * scale;
        const diameter = radius * 2;
        
        ctx.save();
        ctx.textBaseline = "top";
        
        parts.forEach(part => {
            if (part.startsWith("{") && part.endsWith("}")) {
                const symbol = part.slice(1, -1);
                const isMana = /^[WUBRG]$/i.test(symbol);
                const isNumber = /^\d+$/.test(symbol);
                
                if (isMana || isNumber) {
                    const sym = isNumber ? "C" + symbol : symbol.toUpperCase();
                    const cx = currentX + radius;
                    const cy = y + (7 * scale); 
                    drawManaSymbolOnCanvas(ctx, sym, cx, cy, radius);
                    currentX += diameter + (2 * scale);
                    return;
                }
            }
            
            ctx.fillStyle = "#0c0b0b";
            ctx.font = `${isItalic ? 'italic ' : ''}${Math.round(12.5 * scale)}px "EB Garamond", serif`;
            ctx.textAlign = "left";
            ctx.fillText(part, currentX, y);
            currentX += ctx.measureText(part).width;
        });
        
        ctx.restore();
    }

    // Helper to parse any CSS color format to an RGBA object
    function colorToRGBA(colorStr) {
        if (!colorStr) return { r: 0, g: 0, b: 0, a: 1 };
        
        let normalized = colorStr.trim();
        // Check if it's just raw numbers like "255, 0, 0, 0.5" or "255 0 0 0.5"
        if (/^[\d\s.,/]+$/.test(normalized)) {
            const parts = normalized.split(/[\s,/]+/).filter(Boolean);
            if (parts.length === 3) {
                normalized = `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
            } else if (parts.length === 4) {
                normalized = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]})`;
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = normalized;
        const resolved = ctx.fillStyle;

        if (resolved.startsWith("#")) {
            const r = parseInt(resolved.substring(1, 3), 16);
            const g = parseInt(resolved.substring(3, 5), 16);
            const b = parseInt(resolved.substring(5, 7), 16);
            return { r, g, b, a: 1 };
        }
        const match = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            return {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10),
                a: match[4] !== undefined ? parseFloat(match[4]) : 1
            };
        }
        return { r: 0, g: 0, b: 0, a: 1 };
    }

    // Helper to normalize any input color string to a browser-safe rgba format
    function normalizeColor(colorStr) {
        const rgba = colorToRGBA(colorStr);
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }

    // Helper to darken a color (by percent < 0) or lighten it (by percent > 0)
    function adjustColorBrightness(colorStr, percent) {
        const rgba = colorToRGBA(colorStr);

        rgba.r = Math.max(0, Math.min(255, Math.round(rgba.r * (100 + percent) / 100)));
        rgba.g = Math.max(0, Math.min(255, Math.round(rgba.g * (100 + percent) / 100)));
        rgba.b = Math.max(0, Math.min(255, Math.round(rgba.b * (100 + percent) / 100)));

        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }

    // Helper to mix a custom color with white (to create a pastel tint)
    function mixColorWithWhite(colorStr, weight) {
        const rgba = colorToRGBA(colorStr);

        rgba.r = Math.round(rgba.r * weight + 255 * (1 - weight));
        rgba.g = Math.round(rgba.g * weight + 255 * (1 - weight));
        rgba.b = Math.round(rgba.b * weight + 255 * (1 - weight));

        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }

    /**
     * Main card drawing function.
     * Renders a full MTG card style vector/canvas composition onto canvas.
     */
    function renderCardToCanvasCtx(card, tempCtx, targetW, targetH, artImageElement = null) {
        const scale = targetW / 375;
        
        tempCtx.save();
        
        // Clip to outer card rounded corners
        tempCtx.beginPath();
        tempCtx.roundRect(0, 0, targetW, targetH, 18 * scale);
        tempCtx.clip();
        
        // 1. Draw frame borders and background texture gradient
        let gradColors = ["#ae3d24", "#6e1c0d"]; // Red default
        const frameStyle = card.frameStyle || "red";
        const presets = ["red", "green", "black", "white", "blue", "gold", "artifact"];
        if (frameStyle === "green") gradColors = ["#275924", "#112d0e"];
        else if (frameStyle === "black") gradColors = ["#37333d", "#151119"];
        else if (frameStyle === "white") gradColors = ["#e7ddc4", "#a49673"];
        else if (frameStyle === "blue") gradColors = ["#2c5c8e", "#122846"];
        else if (frameStyle === "gold") gradColors = ["#cb9b3c", "#7d591b"];
        else if (frameStyle === "artifact") gradColors = ["#8d9299", "#4b4e54"];
        else if (!presets.includes(frameStyle)) {
            const resolvedColor = normalizeColor(frameStyle);
            gradColors = [resolvedColor, adjustColorBrightness(resolvedColor, -40)];
        }
        
        const gradient = tempCtx.createLinearGradient(0, 0, targetW, targetH);
        gradient.addColorStop(0, gradColors[0]);
        gradient.addColorStop(1, gradColors[1]);
        
        const innerMargin = 20 * scale;
        const innerW = targetW - (innerMargin * 2);
        const innerH = targetH - (innerMargin * 2);
        const cornerRad = 8 * scale;
        const borderColor = card.borderColor || "black";

        if (borderColor === "none") {
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(0, 0, targetW, targetH);
        } else {
            let borderFill = "#0c0d0c";
            if (borderColor === "red") borderFill = "#ae3d24";
            else if (borderColor === "green") borderFill = "#275924";
            else if (borderColor === "black") borderFill = "#0c0d0c";
            else if (borderColor === "white") borderFill = "#fdfaf2";
            else if (borderColor === "blue") borderFill = "#2c5c8e";
            else if (borderColor === "gold") borderFill = "#cb9b3c";
            else if (borderColor === "artifact") borderFill = "#8d9299";
            else if (!presets.includes(borderColor)) borderFill = normalizeColor(borderColor);
            
            tempCtx.fillStyle = borderFill;
            tempCtx.fillRect(0, 0, targetW, targetH);
            
            tempCtx.fillStyle = gradient;
            tempCtx.beginPath();
            tempCtx.roundRect(innerMargin, innerMargin, innerW, innerH, cornerRad);
            tempCtx.fill();
        }
        
        // Draw inner border
        tempCtx.strokeStyle = "rgba(0,0,0,0.5)";
        tempCtx.lineWidth = 2 * scale;
        tempCtx.beginPath();
        tempCtx.roundRect(innerMargin + 2*scale, innerMargin + 2*scale, innerW - 4*scale, innerH - 4*scale, cornerRad - 2*scale);
        tempCtx.stroke();
        
        // 2. Draw Header Title Bar
        const headerY = innerMargin + 4*scale;
        const headerH = 30 * scale;
        const headerW = innerW - 8*scale;
        const headerX = innerMargin + 4*scale;
        
        let barFill = "#dfc4b9";
        if (frameStyle === "green") barFill = "#c6dfc3";
        else if (frameStyle === "black") barFill = "#cbc5d0";
        else if (frameStyle === "white") barFill = "#fdfaf2";
        else if (frameStyle === "blue") barFill = "#c7dcef";
        else if (frameStyle === "gold") barFill = "#eae1c9";
        else if (frameStyle === "artifact") barFill = "#dcdfe3";
        else if (!presets.includes(frameStyle)) {
            barFill = mixColorWithWhite(normalizeColor(frameStyle), 0.3);
        }
        
        tempCtx.fillStyle = barFill;
        tempCtx.beginPath();
        tempCtx.roundRect(headerX, headerY, headerW, headerH, 5 * scale);
        tempCtx.fill();
        tempCtx.strokeStyle = "#332b1d";
        tempCtx.lineWidth = 1.8 * scale;
        tempCtx.stroke();
        
        tempCtx.fillStyle = "#111111";
        tempCtx.font = `bold ${Math.round(15 * scale)}px "EB Garamond", serif`;
        tempCtx.textBaseline = "middle";
        tempCtx.fillText(card.cardName || "Unnamed Card", headerX + 8*scale, headerY + (headerH/2));

        // Draw Mana Cost symbols inside Header Bar
        const manaCost = card.manaCost || [];
        const manaSpacing = 18 * scale;
        let manaStartX = headerX + headerW - 8*scale;
        
        manaCost.forEach((symbol, index) => {
            const revIndex = manaCost.length - 1 - index;
            const sym = manaCost[revIndex];
            const cx = manaStartX - (index * manaSpacing) - (8 * scale);
            const cy = headerY + (headerH / 2);
            
            drawManaSymbolOnCanvas(tempCtx, sym, cx, cy, 8.5 * scale);
        });
        
        // 3. Draw Card Illustration (Art)
        const artY = headerY + headerH + 4*scale;
        const artH = 220 * scale;
        const artW = headerW;
        const artX = headerX;
        tempCtx.strokeStyle = "#332b1d";
        tempCtx.lineWidth = 2 * scale;
        tempCtx.strokeRect(artX, artY, artW, artH);

        // Fill art area with frame gradient so transparent images show the card color
        tempCtx.save();
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(artX, artY, artW, artH);
        tempCtx.restore();

        if (artImageElement) {
            tempCtx.save();
            tempCtx.beginPath();
            tempCtx.rect(artX, artY, artW, artH);
            tempCtx.clip();
            
            const imgW = artImageElement.width;
            const imgH = artImageElement.height;
            const scaleW = artW / imgW;
            const scaleH = artH / imgH;
            const fitScale = Math.max(scaleW, scaleH);
            
            const drawW = imgW * fitScale;
            const drawH = imgH * fitScale;
            
            const centerX = artX + artW / 2;
            const centerY = artY + artH / 2;
            tempCtx.translate(centerX, centerY);
            
            tempCtx.translate((card.artX || 0) * scale, (card.artY || 0) * scale);
            tempCtx.rotate((card.artRotation || 0) * Math.PI / 180);
            const customScale = card.artScale || 1.0;
            tempCtx.scale(customScale, customScale);
            
            tempCtx.drawImage(artImageElement, -drawW / 2, -drawH / 2, drawW, drawH);
            tempCtx.restore();
        } else {
            tempCtx.fillStyle = "#3a4058";
            tempCtx.font = `italic ${Math.round(12 * scale)}px "Inter", sans-serif`;
            tempCtx.textAlign = "center";
            tempCtx.textBaseline = "middle";
            tempCtx.fillText("No Illustration Selected", artX + (artW/2), artY + (artH/2));
        }
        
        // 4. Draw Card Type Bar
        const typeY = artY + artH + 4*scale;
        const typeH = 26 * scale;
        
        tempCtx.fillStyle = barFill;
        tempCtx.beginPath();
        tempCtx.roundRect(artX, typeY, artW, typeH, 5 * scale);
        tempCtx.fill();
        tempCtx.strokeStyle = "#332b1d";
        tempCtx.lineWidth = 1.8 * scale;
        tempCtx.stroke();
        
        tempCtx.fillStyle = "#111111";
        tempCtx.textAlign = "left";
        tempCtx.textBaseline = "middle";
        tempCtx.font = `bold ${Math.round(13 * scale)}px "EB Garamond", serif`;
        tempCtx.fillText(card.cardType || "Creature", artX + 8*scale, typeY + (typeH/2));
        
        // 5. Draw Rules Text Box
        const textBoxY = typeY + typeH + 4*scale;
        const textBoxH = innerH - (textBoxY - innerMargin) - (18 * scale);
        
        tempCtx.fillStyle = "rgba(234, 230, 222, 0.96)";
        tempCtx.beginPath();
        tempCtx.roundRect(artX, textBoxY, artW, textBoxH, 4 * scale);
        tempCtx.fill();
        tempCtx.strokeStyle = "#332b1d";
        tempCtx.lineWidth = 2 * scale;
        tempCtx.stroke();
        
        tempCtx.fillStyle = "#0c0b0b";
        
        // Build text blocks
        const blocks = [];
        
        // 0. Custom description text
        if (card.customDescription && card.customDescription.trim()) {
            const isItalic = card.customDescriptionItalic !== false;
            blocks.push({ text: card.customDescription.trim(), isItalic: isItalic });
        }
        
        // 1. Keywords
        if (card.keywords && card.keywords.length > 0) {
            const keywordsStr = card.keywords.join(", ") + ".";
            blocks.push({ text: keywordsStr, isItalic: false });
        }
        
        // 2. Activated Abilities
        if (card.activatedAbilities && card.activatedAbilities.length > 0) {
            card.activatedAbilities.forEach(ability => {
                const costStr = (ability.cost || []).map(sym => {
                    if (sym.startsWith("C")) {
                        return `{${sym.substring(1)}}`;
                    }
                    return `{${sym}}`;
                }).join("");
                
                blocks.push({
                    text: (ability.cost || []).length > 0 ? `${costStr}: ${ability.text}` : ability.text,
                    isItalic: false
                });
            });
        }
        
        // 3. Custom rules text
        if (card.rulesText && card.rulesText.trim()) {
            blocks.push({ text: card.rulesText.trim(), isItalic: false });
        }
        
        let textY = textBoxY + 14 * scale;
        const lineSpacing = 16 * scale;
        
        tempCtx.textAlign = "left";
        tempCtx.textBaseline = "top";
        
        blocks.forEach((block, blockIndex) => {
            // Add spacing between paragraphs/blocks
            if (blockIndex > 0) {
                textY += lineSpacing;
            }
            
            const lines = block.text.split('\n');
            lines.forEach(line => {
                const words = line.split(' ');
                let currentLine = '';
                const maxTextWidth = artW - (20 * scale);
                
                for(let i = 0; i < words.length; i++) {
                    const testLine = currentLine + words[i] + ' ';
                    const lineWidth = measureLineWithSymbols(tempCtx, testLine, scale, block.isItalic);
                    if(lineWidth > maxTextWidth && i > 0) {
                        drawLineWithSymbols(tempCtx, currentLine.trim(), artX + 10 * scale, textY, scale, block.isItalic);
                        currentLine = words[i] + ' ';
                        textY += lineSpacing;
                    } else {
                        currentLine = testLine;
                    }
                }
                drawLineWithSymbols(tempCtx, currentLine.trim(), artX + 10 * scale, textY, scale, block.isItalic);
                textY += lineSpacing;
            });
        });
        
        // 6. Draw Power / Toughness badge in corner (if card has P/T)
        if (card.hasPt || (card.hasPt === undefined && (card.cardType === "Creature" || card.cardType === "Tower"))) {
            const ptBadgeW = 50 * scale;
            const ptBadgeH = 22 * scale;
            const ptBadgeX = artX + artW - ptBadgeW - (8 * scale);
            const ptBadgeY = textBoxY + textBoxH - (ptBadgeH / 2);
            
            tempCtx.fillStyle = "#eae1c9";
            tempCtx.beginPath();
            tempCtx.roundRect(ptBadgeX, ptBadgeY, ptBadgeW, ptBadgeH, 4 * scale);
            tempCtx.fill();
            tempCtx.strokeStyle = "#332b1d";
            tempCtx.lineWidth = 1.8 * scale;
            tempCtx.stroke();
            
            tempCtx.fillStyle = "#111111";
            tempCtx.textAlign = "center";
            tempCtx.textBaseline = "middle";
            tempCtx.font = `bold ${Math.round(14 * scale)}px "EB Garamond", serif`;
            tempCtx.fillText(`${card.power || "1"}/${card.toughness || "1"}`, ptBadgeX + (ptBadgeW/2), ptBadgeY + (ptBadgeH/2));
        }
        
        // 7. Footer fine print
        const footerY = targetH - innerMargin - 6*scale;
        tempCtx.fillStyle = "#ffffff";
        tempCtx.font = `${Math.round(7.5 * scale)}px sans-serif`;
        tempCtx.textAlign = "left";
        tempCtx.fillText("001/015 M", innerMargin + 4*scale, footerY);
        tempCtx.textAlign = "right";
        tempCtx.fillText("© 2026 Wizards of the North", targetW - innerMargin - 4*scale, footerY);
        
        tempCtx.restore();
    }

    /**
     * Public API: Renders an MTG Card onto a canvas.
     * Handles async loading of base64 images if not already preloaded.
     * 
     * @param {Object} cardData - The JSON deck card configuration
     * @param {HTMLCanvasElement} canvas - Target canvas element
     * @param {Object} options - { artImage: HTMLImageElement }
     * @returns {Promise<HTMLCanvasElement>} Resolves with the canvas once fully rendered
     */
    function drawMTGCard(cardData, canvas, options = {}) {
        return new Promise((resolve, reject) => {
            const ctx = canvas.getContext("2d");
            const w = canvas.width;
            const h = canvas.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, w, h);
            
            if (options.artImage) {
                // Use preloaded image directly
                renderCardToCanvasCtx(cardData, ctx, w, h, options.artImage);
                resolve(canvas);
            } else if (cardData.artBase64) {
                // Load base64 art asynchronously
                const img = new Image();
                img.onload = function () {
                    renderCardToCanvasCtx(cardData, ctx, w, h, img);
                    resolve(canvas);
                };
                img.onerror = function () {
                    // Draw without image if failed to load
                    renderCardToCanvasCtx(cardData, ctx, w, h, null);
                    resolve(canvas);
                };
                img.src = cardData.artBase64;
            } else {
                // No illustration
                renderCardToCanvasCtx(cardData, ctx, w, h, null);
                resolve(canvas);
            }
        });
    }

    global.drawMTGCard = drawMTGCard;
    global.renderCardToCanvasCtx = renderCardToCanvasCtx;

})(typeof window !== 'undefined' ? window : this);
