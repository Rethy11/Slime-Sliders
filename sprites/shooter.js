// sprites/shooter.js
// "Turret Eye" enemy (enemyDB key: shooter)
// Animations preserved from the original inline draw():
//   - always faces the player
//   - pupil grows and shifts white->red as it charges its shot (stateTimer 80-120)
//   - a pulsing red ring appears around the pupil once charge > 0
// Needs `player` (world position) to compute the facing angle. The ground shadow is
// delegated to the page's shared drawGroundShadow() (declared in the main inline script,
// reachable here via the shared page-global scope) so it gets the same checker-proof
// treatment as every other entity's shadow under 1-Bit.
// 1-Bit: flat black turret outlined in white, same treatment as every other 1-Bit enemy.
// The charge cue (normally a white->red iris plus a red ring) becomes a growing white iris
// over a black pupil plus a pulsing white ring instead, since a color shift alone would be
// lost once the page filter collapses everything toward black/white/gray.
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.shooter = function(ctx, e, player) {
    let onebit = player.color === 'onebit';

    drawGroundShadow(ctx, e.x, e.y + e.radius, e.radius, e.radius * 0.5);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(Math.atan2(player.worldY - e.y, player.worldX - e.x));

    let charge = e.stateTimer > 80 ? (e.stateTimer - 80) / 40 : 0;

    if (onebit) {
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, e.radius * 0.14); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, e.radius * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(e.radius * 0.3, 0, e.radius * 0.4 + charge * 2, 0, Math.PI * 2); ctx.fill();
        if (charge > 0) {
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(e.radius * 0.3, 0, e.radius * 0.6 + Math.random() * 4, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(e.radius * 0.4, 0, 3, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(0, 0, e.radius * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgb(255, ${Math.floor(255 - charge * 255)}, ${Math.floor(255 - charge * 255)})`;
        ctx.beginPath(); ctx.arc(e.radius * 0.3, 0, e.radius * 0.4 + charge * 2, 0, Math.PI * 2); ctx.fill();
        if (charge > 0) {
            ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(e.radius * 0.3, 0, e.radius * 0.6 + Math.random() * 4, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(e.radius * 0.4, 0, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};
