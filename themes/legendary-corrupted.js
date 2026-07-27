// Corrupted Data (secret) rare skin — ambient/background stage effects only: the
// full-canvas color-invert filter (see legendary-corrupted.css) and the flat hot-pink sky
// fill. Rock/tree/hazard-tile reskins and hitbox-debug overlays are specific interactions
// and stay in the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.corrupted = (function () {

    // #gameCanvas is the only inverted element (UI/HUD divs sit outside the canvas), so
    // equipping the skin flips the world's colors without breaking HUD readability.
    function syncCanvasInvert(displayCanvas, active) {
        displayCanvas.classList.toggle('color-inverted', active);
    }

    // The sky is a flat hot-pink fill - skips the gradient/sun/cloud/bird layers entirely.
    function drawSkyFill(ctx, canvas, camera) {
        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    // Hazard pockets turn hot pink instead of the theme's usual water/lava/ice - keeps the
    // usual drawHazardTexture pattern on top, just recolored.
    function getHazardTheme(baseHazardType) {
        return { type: baseHazardType, color: '#ff1493', edge: '#ff8fd1' };
    }

    // Strips enemies, trees, rocks, and both enemy and player projectiles down to their
    // raw collision circles instead of their usual art - a faint translucent fill, a
    // stroked outline, a small center crosshair, and a short type label, the way a debug
    // hitbox overlay would render them. Color is the only thing that distinguishes what
    // kind of hitbox it is: red for anything that can hurt the player (enemies, enemy
    // projectiles), green for static obstacle collision (trees/rocks/fences), cyan for the
    // player's own attacks (projectiles, fire breath, lightning, shuriken), gold for
    // collectible pickups (coins/gems).
    function drawHitboxCircle(ctx, x, y, radius, color, label) {
        ctx.save();
        ctx.globalAlpha = 0.18; ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.35, y); ctx.lineTo(x + radius * 0.35, y);
        ctx.moveTo(x, y - radius * 0.35); ctx.lineTo(x, y + radius * 0.35);
        ctx.stroke();
        if (label) {
            ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
            ctx.fillText(label, x, y - radius - 8);
        }
        ctx.restore();
    }

    // Same debug-hitbox treatment as drawHitboxCircle above, but for segment-shaped
    // collision - fences (static, solid line obstacles) and the lightning power-up's beam
    // (a thin capsule of hurt-radius `thickness` running player->target).
    function drawHitboxLine(ctx, x1, y1, x2, y2, thickness, color, label) {
        ctx.save();
        let midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
        let angle = Math.atan2(y2 - y1, x2 - x1);
        let len = Math.hypot(x2 - x1, y2 - y1);
        ctx.translate(midX, midY); ctx.rotate(angle);
        ctx.globalAlpha = 0.18; ctx.fillStyle = color;
        ctx.fillRect(-len / 2, -thickness / 2, len, thickness);
        ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.strokeRect(-len / 2, -thickness / 2, len, thickness);
        ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.stroke();
        if (label) {
            ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
            ctx.fillText(label, 0, -thickness / 2 - 8);
        }
        ctx.restore();
    }

    // Same debug-hitbox treatment, but for the fire breath power-up's cone hit-check (a
    // pie slice of `radius` centered on `facing`, spanning +/- `halfAngle`).
    function drawHitboxCone(ctx, x, y, radius, facing, halfAngle, color, label) {
        ctx.save();
        ctx.globalAlpha = 0.18; ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, radius, facing - halfAngle, facing + halfAngle); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, radius, facing - halfAngle, facing + halfAngle); ctx.closePath(); ctx.stroke();
        if (label) {
            ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
            ctx.fillText(label, x + Math.cos(facing) * radius * 0.5, y + Math.sin(facing) * radius * 0.5 - 8);
        }
        ctx.restore();
    }

    // Shows/hides the perf overlay - purely a cosmetic UI toggle tied to this skin, same
    // "sync on equip/unequip" pattern as syncCanvasInvert above.
    function syncPerfOverlay(perfOverlay, active) {
        perfOverlay.style.display = active ? 'block' : 'none';
    }

    return {
        syncCanvasInvert, drawSkyFill, getHazardTheme,
        drawHitboxCircle, drawHitboxLine, drawHitboxCone, syncPerfOverlay
    };
})();
