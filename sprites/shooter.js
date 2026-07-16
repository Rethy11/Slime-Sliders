// sprites/shooter.js
// "Turret Eye" enemy (enemyDB key: shooter)
// Animations preserved from the original inline draw():
//   - always faces the player
//   - pupil grows and shifts white->red as it charges its shot (stateTimer 80-120)
//   - a pulsing red ring appears around the pupil once charge > 0
// Needs `player` (world position) to compute the facing angle.
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.shooter = function(ctx, e, player) {
    // Shadow (shared "grounded enemy" shadow)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.radius, e.radius, e.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(Math.atan2(player.worldY - e.y, player.worldX - e.x));
    ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(0, 0, e.radius * 0.7, 0, Math.PI * 2); ctx.fill();
    let charge = e.stateTimer > 80 ? (e.stateTimer - 80) / 40 : 0;
    ctx.fillStyle = `rgb(255, ${Math.floor(255 - charge * 255)}, ${Math.floor(255 - charge * 255)})`;
    ctx.beginPath(); ctx.arc(e.radius * 0.3, 0, e.radius * 0.4 + charge * 2, 0, Math.PI * 2); ctx.fill();
    if (charge > 0) {
        ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(e.radius * 0.3, 0, e.radius * 0.6 + Math.random() * 4, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(e.radius * 0.4, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};
