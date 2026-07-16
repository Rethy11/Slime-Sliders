// sprites/dasher.js
// "Bull" enemy (enemyDB key: dasher)
// Animations preserved from the original inline draw():
//   - a small random jitter/shake during the windup window (stateTimer 60-80) before charging
//   - eyes flash red while charging (stateTimer > 60)
//   - occasional dust puffs near the front legs while charging
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.dasher = function(ctx, e, player) {
    // Shadow (shared "grounded enemy" shadow)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.radius, e.radius, e.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    if (e.stateTimer > 60 && e.stateTimer < 80) {
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }
    ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.ellipse(0, 0, e.radius, e.radius * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.ellipse(-e.radius * 0.7, 0, e.radius * 0.3, e.radius * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-e.radius, 0); ctx.lineTo(-e.radius - 8, -2); ctx.lineTo(-e.radius - 8, 2); ctx.fill();
    ctx.fillStyle = '#3e2723';
    ctx.beginPath(); ctx.arc(e.radius * 0.2, -e.radius * 0.6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(e.radius * 0.2, e.radius * 0.6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(e.radius * 0.3, -e.radius * 0.5); ctx.lineTo(e.radius * 1.2, -e.radius * 1.2); ctx.lineTo(e.radius * 0.5, -e.radius * 0.2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(e.radius * 0.3, e.radius * 0.5); ctx.lineTo(e.radius * 1.2, e.radius * 1.2); ctx.lineTo(e.radius * 0.5, e.radius * 0.2); ctx.fill();
    ctx.fillStyle = e.stateTimer > 60 ? '#e74c3c' : '#000';
    ctx.beginPath(); ctx.arc(e.radius * 0.6, -e.radius * 0.3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(e.radius * 0.6, e.radius * 0.3, 2, 0, Math.PI * 2); ctx.fill();
    if (e.stateTimer > 60 && Math.random() < 0.3) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath(); ctx.arc(e.radius * 0.8, -e.radius * 0.1, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.radius * 0.8, e.radius * 0.1, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};
