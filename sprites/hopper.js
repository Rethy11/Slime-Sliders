// sprites/hopper.js
// "Frog" enemy (enemyDB key: hopper)
// Animations preserved from the original inline draw():
//   - unique state-dependent shadow: a full grounded shadow while idle, a small thin shadow
//     while airborne mid-jump (this differs from every other enemy type, which is why it's
//     drawn here rather than in the shared caller)
//   - while aiming (idle, stateTimer > 0) draws a small target reticle at e.targetX/targetY
//   - while jumping, arcs upward via a sine curve and stretches/squashes with the jump
//   - a brief tongue-flick line+dot effect near the apex of the jump (stateTimer 65-85)
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.hopper = function(ctx, e, player) {
    if (e.state === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + e.radius, e.radius, e.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (e.state === 'jump') {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + e.radius, e.radius * 0.5, e.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    if (e.state === 'idle' && e.stateTimer > 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath(); ctx.arc(e.targetX, e.targetY, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(e.targetX - 3, e.targetY - 3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.targetX + 3, e.targetY - 3, 2, 0, Math.PI * 2); ctx.fill();
    }

    let renderY = e.state === 'jump' ? e.y - Math.sin((e.stateTimer - 60) / 30 * Math.PI) * 60 : e.y;
    let jumpStretch = e.state === 'jump' ? 1.3 : 1;
    let jumpSquash = e.state === 'jump' ? 0.8 : 1;
    if (e.state === 'idle' && e.stateTimer > 40) { jumpStretch = 0.8; jumpSquash = 1.2; }

    ctx.save();
    ctx.translate(e.x, renderY);
    ctx.rotate(e.angle);
    ctx.scale(jumpStretch, jumpSquash);
    ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.ellipse(0, 0, e.radius, e.radius * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.ellipse(e.radius * 0.2, 0, e.radius * 0.7, e.radius * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27ae60';
    ctx.beginPath(); ctx.ellipse(0, -e.radius * 0.7, e.radius * 0.4, e.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(0, e.radius * 0.7, e.radius * 0.4, e.radius * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(e.radius * 0.5, -e.radius * 0.4, 4, 0, Math.PI * 2); ctx.arc(e.radius * 0.5, e.radius * 0.4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(e.radius * 0.6, -e.radius * 0.4, 2, 0, Math.PI * 2); ctx.arc(e.radius * 0.6, e.radius * 0.4, 2, 0, Math.PI * 2); ctx.fill();
    if (e.state === 'jump' && e.stateTimer > 65 && e.stateTimer < 85) {
        ctx.strokeStyle = '#ff9ff3'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(e.radius * 0.8, 0); ctx.lineTo(e.radius * 2.5, 0); ctx.stroke();
        ctx.fillStyle = '#ff9ff3'; ctx.beginPath(); ctx.arc(e.radius * 2.5, 0, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};
