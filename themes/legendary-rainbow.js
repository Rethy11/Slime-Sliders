// Rainbow rare skin — ambient/background stage effects (sky, ground patchwork) plus every
// static reskin this skin applies to the world (trees, rocks, decorations, fences, hazard
// tiles). Nothing in this file is triggered by touching/bumping an object - it's all a
// constant cosmetic override applied uniformly while the skin is equipped, unlike (for
// example) Midas permanently gilding only the specific rock/tile the player has actually
// touched, which stays in the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.rainbow = (function () {

    // Flat coloring-book palette used for trees/rocks/decorations/fences, plus a softer
    // pastel set used for the floor patchwork. Shared by every helper below so the whole
    // theme reads as one consistent crayon-box set of colors.
    const PALETTE = ['#ff4d6d', '#ff922b', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac'];
    const PASTELS = ['#ffe3ec', '#fff3c4', '#d9f7be', '#cdeffd', '#e0d4fa', '#ffe0c2'];
    function hash(n) { let s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); }

    // Rainbow skin: soft candy-colored bands top to bottom, like a page straight out of a
    // coloring book instead of a realistic sky.
    let cache = null, cacheH = -1;
    function buildSkyGradient(ctx, height) {
        if (!cache || cacheH !== height) {
            cache = ctx.createLinearGradient(0, 0, 0, height);
            cache.addColorStop(0, '#ffd6e8'); cache.addColorStop(0.35, '#fff3b0');
            cache.addColorStop(0.65, '#c8f7c5'); cache.addColorStop(1, '#bde0fe');
            cacheH = height;
        }
        return cache;
    }

    // A soft, translucent multi-band arch fixed in world space (same "drifts past as the
    // camera moves" convention as the sun glow), lighting up the sky while equipped.
    function drawRainbowArcs(ctx, canvas) {
        ctx.save();
        // Anchored to the bottom of the canvas (not a fixed y that happened to land near the
        // player, who always renders at screen-center) so the arch reads as a real horizon
        // backdrop rising up from the bottom of the screen, same on every device regardless
        // of canvas height.
        let cx = canvas.width / 2, cy = canvas.height, baseR = Math.max(canvas.width, canvas.height) * 0.75;
        const bands = ['#ff3b3b', '#ff9f1c', '#ffe135', '#4caf50', '#3399ff', '#8e44ad'];
        ctx.lineWidth = 15; ctx.lineCap = 'round';
        for (let i = 0; i < bands.length; i++) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = bands[i];
            ctx.beginPath(); ctx.arc(cx, cy, baseR - i * 15, Math.PI, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }

    // While equipped, the floor becomes a patchwork coloring-book page - each hex gets its
    // own flat pastel color (stable per-tile, picked from PASTELS) and a bold black crayon
    // outline, like every cell of the honeycomb was colored in by hand with a different
    // marker. visLand/cachedHexCorners are passed in from the main script's own visible-
    // tile list and hex-corner cache rather than duplicated here.
    function drawGroundPatchwork(ctx, visLand, cachedHexCorners) {
        ctx.save();
        for (let li = 0; li < visLand.length; li++) {
            let lt = visLand[li];
            let h = hash(lt.q * 12.9898 + lt.r * 78.233);
            ctx.fillStyle = PASTELS[Math.floor(h * PASTELS.length)];
            let c = cachedHexCorners(lt);
            ctx.beginPath(); ctx.moveTo(c[0].x, c[0].y);
            for (let i = 1; i < 6; i++) ctx.lineTo(c[i].x, c[i].y);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5; ctx.stroke();
        }
        ctx.restore();
    }

    // A hand-drawn "crayon blob" - a wobbly, hand-wavering closed path instead of a perfect
    // circle, filled with a flat coloring-book color and traced in a thick black outline.
    // The fill path is jittered by more than the outline path (`overflow`), so at a few
    // points the color visibly pokes out past the black line - the "colored outside the
    // lines" look the whole theme leans on.
    function drawCrayonBlob(ctx, cx, cy, r, seed, fillColor, overflow) {
        let steps = 14;
        function tracePath(jitterAmp, seedOffset) {
            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
                let a = (i / steps) * Math.PI * 2;
                let n = hash(seed + seedOffset + i * 3.7);
                let rr = r * (1 + (n - 0.5) * jitterAmp);
                let px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
        }
        ctx.fillStyle = fillColor;
        tracePath(overflow, 0); ctx.fill();
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
        tracePath(0.12, 100); ctx.stroke();
    }

    // A simple doodled smiley - two dot eyes, a curved mouth, and rosy cheeks, scaled to
    // whatever the shape's radius is. Sprinkled onto a fraction of trees/rocks so the
    // level occasionally looks back at you.
    function drawCrayonFace(ctx, cx, cy, size) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(cx - size * 0.35, cy - size * 0.1, size * 0.11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + size * 0.35, cy - size * 0.1, size * 0.11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = size * 0.09; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy + size * 0.05, size * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        ctx.fillStyle = 'rgba(255,120,140,0.55)';
        ctx.beginPath(); ctx.arc(cx - size * 0.5, cy + size * 0.15, size * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + size * 0.5, cy + size * 0.15, size * 0.09, 0, Math.PI * 2); ctx.fill();
    }

    // Every tree renders as a doodled crayon tree - a plain brown trunk with a black
    // outline, topped with a wobbly, flat-colored crayon blob crown picked from the
    // coloring-book palette. About a third get a hand-drawn smiling face.
    function drawRainbowTree(ctx, x, y, radius, seed) {
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath(); ctx.ellipse(x, y + radius * 0.5, radius * 0.85, radius * 0.38, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c68642';
        ctx.fillRect(x - radius * 0.2, y - radius * 0.1, radius * 0.4, radius * 0.9);
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
        ctx.strokeRect(x - radius * 0.2, y - radius * 0.1, radius * 0.4, radius * 0.9);
        let color = PALETTE[Math.floor(hash(seed) * PALETTE.length)];
        let crownY = y - radius * 0.75;
        drawCrayonBlob(ctx, x, crownY, radius * 0.85, seed, color, 0.22);
        if (hash(seed + 500) < 0.35) drawCrayonFace(ctx, x, crownY, radius * 0.85);
    }

    // Every rock renders as a squashed crayon blob instead of the theme's usual rock art -
    // same wobbly outline-and-overflow treatment as the trees, just flattened, and
    // occasionally smiling too.
    function drawRainbowRock(ctx, x, y, radius, seed) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(x, y + radius * 0.18, radius * 1.05, radius * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        let color = PALETTE[Math.floor(hash(seed + 200) * PALETTE.length)];
        ctx.save();
        ctx.translate(x, y); ctx.scale(1, 0.75);
        drawCrayonBlob(ctx, 0, 0, radius * 0.95, seed + 50, color, 0.2);
        if (hash(seed + 700) < 0.3) drawCrayonFace(ctx, 0, 0, radius * 0.95);
        ctx.restore();
    }

    // Every grass/flower/leaf speck renders as a tiny black-outlined doodle in a bright
    // coloring-book color instead of its usual flat foliage dot/blade/curl.
    function drawRainbowDecor(ctx, d, breezeX) {
        let color = PALETTE[Math.floor(hash(d.x * 0.31 + d.y * 0.17) * PALETTE.length)];
        ctx.fillStyle = color; ctx.strokeStyle = '#1a1a1a';
        if (d.type === 0) {
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(d.x, d.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else if (d.type === 1) {
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 4 + breezeX * 5, d.y - 9); ctx.lineTo(d.x + 4 + breezeX * 5, d.y - 9); ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else {
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.quadraticCurveTo(d.x + breezeX * 5, d.y - 6, d.x + breezeX * 10, d.y - 12); ctx.stroke();
        }
    }

    // Every fence renders as a doodled crayon fence - a thick black outline with a
    // different bright coloring-book color on each rail, like a kid picked a new marker
    // partway through. Self-contained (post/shadow included) so the main script can call
    // this via an early return, the same way it does for Glitch's firewall fence and
    // Corrupted Data's hitbox-line fence.
    function drawRainbowFence(ctx, f) {
        let angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
        let len = Math.hypot(f.x2 - f.x1, f.y2 - f.y1);
        ctx.save(); ctx.translate(f.midX, f.midY); ctx.rotate(angle);
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(-len/2, 5, len, 4);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-len/2 - 2, -14, 5, 20);
        ctx.fillRect(len/2 - 3, -14, 5, 20);
        ctx.fillStyle = PALETTE[Math.floor(hash(f.midX * 0.13 + f.midY * 0.07) * PALETTE.length)];
        ctx.fillRect(-len/2, -10, len, 4);
        ctx.fillStyle = PALETTE[Math.floor(hash(f.midX * 0.13 + f.midY * 0.07 + 3) * PALETTE.length)];
        ctx.fillRect(-len/2, -2, len, 4);
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
        ctx.strokeRect(-len/2, -10, len, 4); ctx.strokeRect(-len/2, -2, len, 4);
        ctx.restore();
    }

    // Hazard pockets (water/lava/ice, whatever the theme normally puts there) fill with a
    // stack of wavy, hand-drawn rainbow crayon stripes instead of the usual themed texture
    // - reads like a scribbled-in pool on a coloring page. The base fill/edge for these
    // pockets (getHazardTheme) only matter for the flat pool color and hex-edge stroke;
    // this striped texture is drawn separately on top.
    function getHazardTheme(baseHazardType) {
        return { type: baseHazardType, color: '#eaf6ff', edge: '#1a1a1a' };
    }
    function drawRainbowHazardStripes(ctx, cx, cy, span) {
        let t = Date.now() / 1000;
        ctx.lineCap = 'round';
        for (let i = 0; i < PALETTE.length; i++) {
            let phase = t * 0.6 + i * 0.5;
            let rowY = cy - span * 0.75 + (i / (PALETTE.length - 1)) * span * 1.5;
            ctx.strokeStyle = PALETTE[i];
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let x = cx - span; x <= cx + span; x += 6) {
                let y = rowY + Math.sin(x * 0.04 + phase) * 6;
                if (x === cx - span) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    return {
        PALETTE, PASTELS, hash, buildSkyGradient, drawRainbowArcs, drawGroundPatchwork,
        drawCrayonBlob, drawCrayonFace, drawRainbowTree, drawRainbowRock, drawRainbowDecor,
        drawRainbowFence, getHazardTheme, drawRainbowHazardStripes
    };
})();
