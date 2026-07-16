// sprites/wanderer.js
// "Slime" enemy (enemyDB key: wanderer)
// Animations preserved from the original inline draw():
//   - body wobble (squash/stretch) driven by Date.now()/80 + e.blinkSeed, scaled by e.speed
//   - random blink (eyes become thin rects) driven by Date.now()/200 + e.blinkSeed
//   - if the slime has eaten a coin/gem (e.heldCoin), a small icon is drawn on top of it,
//     un-scaled relative to the body's wobble so it doesn't distort
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.wanderer = function(ctx, e, player) {
    // Shadow (shared "grounded enemy" shadow)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.radius, e.radius, e.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    let renderY = e.y;
    let speed = Math.sqrt(e.speed * e.speed);
    let wobble = Math.sin(Date.now() / 80 + e.blinkSeed) * speed * 0.1;
    let stretchX = 1 + wobble;
    let stretchY = 1 - wobble;

    ctx.save();
    ctx.translate(e.x, renderY);
    ctx.rotate(e.angle);
    ctx.scale(stretchX, stretchY);

    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, e.radius, e.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-e.radius * 0.3, -e.radius * 0.3, e.radius * 0.3, e.radius * 0.15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    if (e.heldCoin) {
        ctx.save();
        ctx.scale(1 / stretchX, 1 / stretchY);
        ctx.globalAlpha = 0.8;
        if (e.heldCoin === 'coin') {
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        } else if (e.heldCoin === 'ruby') {
            ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.fill();
        } else if (e.heldCoin === 'sapphire') {
            ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(0, 8); ctx.fill();
        } else if (e.heldCoin === 'emerald') {
            ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(8, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.lineTo(-8, 0); ctx.fill();
        }
        ctx.restore();
    }

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
    ctx.restore();
};
