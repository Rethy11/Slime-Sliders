// sprites/dasher.js
// "Bull" enemy (enemyDB key: dasher)
// Animations preserved from the original inline draw():
//   - a small random jitter/shake during the windup window (stateTimer 60-80) before charging
//   - eyes flash red while charging (stateTimer > 60)
//   - occasional dust puffs near the front legs while charging
// The ground shadow is delegated to the page's shared drawGroundShadow() (declared in the
// main inline script, reachable here via the shared page-global scope) so it gets the same
// checker-proof treatment as every other entity's shadow under 1-Bit.
// 1-Bit: body/ear swap to a flat black-fill + white-outline silhouette (horns stay white so
// they still pop against the body itself, not just the checker floor behind it). The
// charging cue can't rely on a red eye flash anymore - the page-wide grayscale/contrast
// filter would just collapse red to some fixed gray - so it becomes a bigger white eye with
// a pulsing white ring instead.
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.dasher = function(ctx, e, player) {
    let onebit = player.color === 'onebit';

    drawGroundShadow(ctx, e.x, e.y + e.radius, e.radius, e.radius * 0.5);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    if (e.stateTimer > 60 && e.stateTimer < 80) {
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }

    if (onebit) {
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.ellipse(0, 0, e.radius, e.radius * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, e.radius * 0.14); ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.ellipse(-e.radius * 0.7, 0, e.radius * 0.3, e.radius * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-e.radius, 0); ctx.lineTo(-e.radius - 8, -2); ctx.lineTo(-e.radius - 8, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
        ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.ellipse(0, 0, e.radius, e.radius * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.ellipse(-e.radius * 0.7, 0, e.radius * 0.3, e.radius * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-e.radius, 0); ctx.lineTo(-e.radius - 8, -2); ctx.lineTo(-e.radius - 8, 2); ctx.fill();
    }

    ctx.fillStyle = onebit ? '#ffffff' : '#3e2723';
    ctx.beginPath(); ctx.arc(e.radius * 0.2, -e.radius * 0.6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(e.radius * 0.2, e.radius * 0.6, 4, 0, Math.PI * 2); ctx.fill();
    if (onebit) {
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(e.radius * 0.2, -e.radius * 0.6, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(e.radius * 0.2, e.radius * 0.6, 4, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.fillStyle = onebit ? '#ffffff' : '#ecf0f1';
    ctx.beginPath(); ctx.moveTo(e.radius * 0.3, -e.radius * 0.5); ctx.lineTo(e.radius * 1.2, -e.radius * 1.2); ctx.lineTo(e.radius * 0.5, -e.radius * 0.2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(e.radius * 0.3, e.radius * 0.5); ctx.lineTo(e.radius * 1.2, e.radius * 1.2); ctx.lineTo(e.radius * 0.5, e.radius * 0.2); ctx.fill();
    if (onebit) {
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(e.radius * 0.3, -e.radius * 0.5); ctx.lineTo(e.radius * 1.2, -e.radius * 1.2); ctx.lineTo(e.radius * 0.5, -e.radius * 0.2); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(e.radius * 0.3, e.radius * 0.5); ctx.lineTo(e.radius * 1.2, e.radius * 1.2); ctx.lineTo(e.radius * 0.5, e.radius * 0.2); ctx.closePath(); ctx.stroke();
    }

    if (onebit) {
        let charging = e.stateTimer > 60;
        let eyeR = charging ? 3 : 2;
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(e.radius * 0.6, -e.radius * 0.3, eyeR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(e.radius * 0.6, e.radius * 0.3, eyeR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (charging) {
            ctx.save(); ctx.globalAlpha = 0.7;
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(e.radius * 0.6, -e.radius * 0.3, eyeR + 3, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(e.radius * 0.6, e.radius * 0.3, eyeR + 3, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    } else {
        ctx.fillStyle = e.stateTimer > 60 ? '#e74c3c' : '#000';
        ctx.beginPath(); ctx.arc(e.radius * 0.6, -e.radius * 0.3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.radius * 0.6, e.radius * 0.3, 2, 0, Math.PI * 2); ctx.fill();
    }

    if (e.stateTimer > 60 && Math.random() < 0.3) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath(); ctx.arc(e.radius * 0.8, -e.radius * 0.1, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.radius * 0.8, e.radius * 0.1, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};
