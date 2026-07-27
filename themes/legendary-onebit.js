// 1-Bit rare skin — ambient/background stage effects only: the page-wide monochrome
// threshold filter (see legendary-onebit.css) and the flat black sky fill. Rock/tree
// reskins (drawOnebitHouse, drawOnebitTree, etc.) are specific interactions and stay in
// the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.onebit = (function () {

    // Toggles the page-wide monochrome threshold filter (see the body.onebit-page-filter
    // CSS rule in legendary-onebit.css) on and off body-wide, so it picks up/drops the
    // moment the skin is equipped or unequipped.
    function syncBodyClass(active) {
        document.body.classList.toggle('onebit-page-filter', active);
    }

    // The sky is a flat black fill - no gradient, no sun glow - while the white puffy
    // clouds (drawn separately by the main script's shared cloud layer) are left untouched,
    // giving a stark two-tone silhouette instead of the usual daytime blue.
    function drawSkyFill(ctx, canvas, camera) {
        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    // Hazard pockets turn solid black with a white edge - every hazard type (water/lava/
    // ice) shares the same dedicated ripple/sparkle pattern (the main script's
    // drawHazardTexture) instead of its usual themed bubble/arc/line texture, so the whole
    // skin reads as one consistent monochrome look rather than only water changing.
    function getHazardTheme(baseHazardType) {
        return { type: baseHazardType, color: '#000000', edge: '#ffffff' };
    }

    // Every tree renders as a flat black silhouette (one of three canopy shapes, picked the
    // same way the normal tree art picks its variant) outlined in white so it reads against
    // both light and dark checker tiles, with a stable stipple of white dots scattered
    // inside via the golden angle (seed-keyed, so it never reshuffles frame to frame)
    // standing in for foliage texture the way dithered pixel-art trees do it in two colors
    // instead of a gradient.
    function drawOnebitTree(ctx, x, y, radius, variant, seed) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + radius * 0.5, radius * 0.85, radius * 0.32, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - radius * 0.12, y - radius * 0.1, radius * 0.24, radius * 0.85);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
        ctx.strokeRect(x - radius * 0.12, y - radius * 0.1, radius * 0.24, radius * 0.85);
        ctx.beginPath();
        if (variant === 1) {
            ctx.arc(x, y - radius * 0.55, radius * 0.85, 0, Math.PI * 2);
        } else if (variant === 2) {
            ctx.moveTo(x, y - radius * 1.5); ctx.lineTo(x + radius * 0.55, y - radius * 0.55); ctx.lineTo(x + radius * 0.3, y - radius * 0.55);
            ctx.lineTo(x + radius * 0.75, y + radius * 0.1); ctx.lineTo(x - radius * 0.75, y + radius * 0.1);
            ctx.lineTo(x - radius * 0.3, y - radius * 0.55); ctx.lineTo(x - radius * 0.55, y - radius * 0.55); ctx.closePath();
        } else {
            ctx.moveTo(x, y - radius * 1.4); ctx.lineTo(x + radius * 0.9, y + radius * 0.15); ctx.lineTo(x - radius * 0.9, y + radius * 0.15); ctx.closePath();
        }
        ctx.fillStyle = '#000000'; ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.clip();
        for (let i = 0; i < 16; i++) {
            let a = (seed * 7 + i * 2.399963) % (Math.PI * 2); // golden-angle scatter - stable per tree, no per-frame flicker
            let rr = radius * 0.8 * Math.sqrt((i * 0.6180339887) % 1);
            let px = x + Math.cos(a) * rr, py = (y - radius * 0.5) + Math.sin(a) * rr * 0.85;
            ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 1, py - 1, 2, 2);
        }
        ctx.restore();
        ctx.restore();
    }

    // Every rock renders as a small monochrome house instead of theme rock art - three flat
    // black/white cottage silhouettes (picked the same way rocks already pick a shape
    // variant), each with a hash-picked window count/door so a cluster of houses doesn't
    // look identically stamped.
    function drawOnebitHouse(ctx, x, y, radius, variant, seed) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + radius * 0.85, radius * 1.05, radius * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        let hash = Math.abs(Math.sin(seed * 12.9898) * 43758.5453); hash -= Math.floor(hash);
        let w = radius * 1.7, h = radius * 1.35;
        let baseY = y + radius * 0.72, topY = baseY - h;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - w / 2, topY + h * 0.35, w, h * 0.65);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2.5;
        ctx.strokeRect(x - w / 2, topY + h * 0.35, w, h * 0.65);
        ctx.beginPath();
        if (variant === 1) {
            ctx.moveTo(x - w * 0.6, topY + h * 0.4); ctx.lineTo(x - w * 0.25, topY); ctx.lineTo(x, topY + h * 0.12);
            ctx.lineTo(x + w * 0.25, topY); ctx.lineTo(x + w * 0.6, topY + h * 0.4); ctx.closePath();
        } else if (variant === 2) {
            ctx.moveTo(x - w * 0.62, topY + h * 0.4); ctx.lineTo(x, topY - h * 0.15); ctx.lineTo(x + w * 0.62, topY + h * 0.4); ctx.closePath();
        } else {
            ctx.moveTo(x - w * 0.65, topY + h * 0.4); ctx.lineTo(x, topY - h * 0.05); ctx.lineTo(x + w * 0.65, topY + h * 0.4); ctx.closePath();
        }
        ctx.fillStyle = '#000000'; ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
        let doorW = w * 0.22, doorH = h * 0.4;
        ctx.fillStyle = '#000000'; ctx.fillRect(x - doorW / 2, baseY - doorH, doorW, doorH);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(x - doorW / 2, baseY - doorH, doorW, doorH);
        let winCount = 2 + Math.floor(hash * 2);
        for (let wi = 0; wi < winCount; wi++) {
            let wx = x - w * 0.32 + wi * (w * 0.64 / Math.max(1, winCount - 1));
            if (Math.abs(wx - x) < doorW * 0.7) continue; // skip windows that would overlap the door
            let wy = topY + h * 0.5;
            ctx.fillStyle = '#000000'; ctx.fillRect(wx - 4, wy, 8, 8);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(wx - 4, wy, 8, 8);
            ctx.beginPath(); ctx.moveTo(wx - 4, wy + 4); ctx.lineTo(wx + 4, wy + 4); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + 8); ctx.stroke();
        }
        if (variant === 2) {
            ctx.fillStyle = '#000000'; ctx.fillRect(x + w * 0.28, topY - h * 0.08, w * 0.09, h * 0.26);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(x + w * 0.28, topY - h * 0.08, w * 0.09, h * 0.26);
        }
        ctx.restore();
    }

    // Every grass/flower/leaf speck renders as a small flat glyph instead of its usual
    // colored foliage art - a tuft of blade dashes, a plus-shaped cluster of dots for
    // flowers, or a crisp dash-pair for leaves/vines. Color (pure black or white) comes
    // from a stable hash of the speck's fixed world position so it stays legible against
    // either checker tile it happens to land on, rather than flickering or vanishing on
    // one color.
    function drawOnebitDecor(ctx, d, breezeX) {
        let seed = Math.abs(Math.sin(d.x * 12.9898 + d.y * 78.233) * 43758.5453); seed -= Math.floor(seed);
        let col = seed > 0.5 ? '#ffffff' : '#000000';
        ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        if (d.type === 0) {
            ctx.beginPath();
            ctx.moveTo(d.x - 3, d.y + 2); ctx.lineTo(d.x - 2 + breezeX*2, d.y - 4);
            ctx.moveTo(d.x, d.y + 2); ctx.lineTo(d.x + breezeX*2, d.y - 5);
            ctx.moveTo(d.x + 3, d.y + 2); ctx.lineTo(d.x + 4 + breezeX*2, d.y - 4);
            ctx.stroke();
        } else if (d.type === 1) {
            ctx.beginPath();
            ctx.arc(d.x, d.y - 6, 1.6, 0, Math.PI*2); ctx.arc(d.x - 4, d.y - 3, 1.6, 0, Math.PI*2);
            ctx.arc(d.x + 4, d.y - 3, 1.6, 0, Math.PI*2); ctx.arc(d.x, d.y, 1.6, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + breezeX*5, d.y - 6);
            ctx.moveTo(d.x + 2, d.y - 2); ctx.lineTo(d.x + 2 + breezeX*5, d.y - 8);
            ctx.stroke();
        }
    }

    return { syncBodyClass, drawSkyFill, getHazardTheme, drawOnebitTree, drawOnebitHouse, drawOnebitDecor };
})();
