// sprites/wanderer.js
// "Slime" enemy (enemyDB key: wanderer)
// Animations preserved from the original inline draw():
//   - body wobble (squash/stretch) driven by Date.now()/80 + e.blinkSeed, scaled by e.speed
//   - random blink (eyes become thin rects) driven by Date.now()/200 + e.blinkSeed
//   - if the slime has eaten a coin/gem (e.heldCoin), a small icon is drawn on top of it,
//     un-scaled relative to the body's wobble so it doesn't distort
// 1-Bit: body/eyes/held-coin icon all swap to a flat black-fill + white-outline treatment
// (the same look the player's own 1-Bit skin uses) instead of e.color, since e.color is
// whatever full-color palette the enemy DB assigns and that's exactly what the page-wide
// 1-Bit grayscale/contrast filter collapses into a same-tone blob against the checker
// floor. The ground shadow is delegated to the page's shared drawGroundShadow() (declared
// in the main inline script, reachable here because top-level `let`/`function` in one
// <script> tag share the page's single global scope with every other script tag) so every
// entity's shadow gets the same checker-proof black-fill-plus-white-ring treatment.
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.wanderer = function(ctx, e, player) {
    let onebit = player.color === 'onebit';

    drawGroundShadow(ctx, e.x, e.y + e.radius, e.radius, e.radius * 0.5);

    let renderY = e.y;
    let speed = Math.sqrt(e.speed * e.speed);
    let wobble = Math.sin(Date.now() / 80 + e.blinkSeed) * speed * 0.1;
    let stretchX = 1 + wobble;
    let stretchY = 1 - wobble;

    ctx.save();
    ctx.translate(e.x, renderY);
    ctx.rotate(e.angle);
    ctx.scale(stretchX, stretchY);

    if (onebit) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius, e.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, e.radius * 0.14);
        ctx.stroke();
    } else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius, e.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-e.radius * 0.3, -e.radius * 0.3, e.radius * 0.3, e.radius * 0.15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    if (e.heldCoin) {
        ctx.save();
        ctx.scale(1 / stretchX, 1 / stretchY);
        ctx.globalAlpha = 0.8;
        if (onebit) {
            // Flat white glyph with a thin black outline reads the same for any held-loot
            // type instead of relying on loot-specific hues the way the normal-mode icons
            // below do.
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
            if (e.heldCoin === 'coin') {
                ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (e.heldCoin === 'ruby') {
                ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (e.heldCoin === 'sapphire') {
                ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (e.heldCoin === 'emerald') {
                ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(8, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
            }
        } else {
            if (e.heldCoin === 'coin') {
                ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            } else if (e.heldCoin === 'ruby') {
                ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.fill();
            } else if (e.heldCoin === 'sapphire') {
                ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(0, 8); ctx.fill();
            } else if (e.heldCoin === 'emerald') {
                ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(8, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.lineTo(-8, 0); ctx.fill();
            }
        }
        ctx.restore();
    }

    if (onebit) {
        // White eyes with a thin black pupil-dot so they read against the slime's own flat
        // black body - plain black eyes (the normal-mode look below) would vanish into it.
        if (Math.sin(Date.now() / 200 + e.blinkSeed) > 0.95) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(e.radius * 0.2 - 1, -e.radius * 0.4 - 1, 4, 10);
            ctx.fillRect(e.radius * 0.2 - 1, e.radius * 0.2 - 1, 4, 10);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(e.radius * 0.4, -e.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.arc(e.radius * 0.4, e.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(e.radius * 0.4, -e.radius * 0.3, 1.5, 0, Math.PI * 2);
            ctx.arc(e.radius * 0.4, e.radius * 0.3, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#000';
        if (Math.sin(Date.now() / 200 + e.blinkSeed) > 0.95) {
            ctx.fillRect(e.radius * 0.2, -e.radius * 0.4, 2, 8);
            ctx.fillRect(e.radius * 0.2, e.radius * 0.2, 2, 8);
        } else {
            ctx.beginPath();
            ctx.arc(e.radius * 0.4, -e.radius * 0.3, 3, 0, Math.PI * 2);
            ctx.arc(e.radius * 0.4, e.radius * 0.3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
};
