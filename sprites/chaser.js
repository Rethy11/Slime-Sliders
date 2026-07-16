// sprites/chaser.js
// "Bee" enemy (enemyDB key: chaser)
// Animations preserved from the original inline draw():
//   - wings flap via Date.now()/20 sine, rotated oppositely for the top/bottom wing
//   - faces the player while in 'chase' state, otherwise faces its wander angle
// Needs `player` (world position) to compute the chase-facing angle.
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.chaser = function(ctx, e, player) {
    // Shadow (shared "grounded enemy" shadow)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.radius, e.radius, e.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.state === 'chase' ? Math.atan2(player.worldY - e.y, player.worldX - e.x) : e.angle);
    let wingFlap = Math.sin(Date.now() / 20) * 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath(); ctx.ellipse(0, -e.radius, e.radius * 0.6, e.radius * 1.2, wingFlap * Math.PI / 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, e.radius, e.radius * 0.6, e.radius * 1.2, -wingFlap * Math.PI / 180, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.ellipse(0, 0, e.radius, e.radius * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(-e.radius * 0.6, -e.radius * 0.5, e.radius * 0.3, e.radius);
    ctx.fillRect(e.radius * 0.2, -e.radius * 0.5, e.radius * 0.3, e.radius);
    ctx.beginPath(); ctx.arc(e.radius, -2, 2, 0, Math.PI * 2); ctx.arc(e.radius, 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(-e.radius, 0); ctx.lineTo(-e.radius - 6, -4); ctx.lineTo(-e.radius - 6, 4); ctx.fill();
    ctx.restore();
};
