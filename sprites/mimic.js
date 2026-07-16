// sprites/mimic.js
// "Chest Mimic" enemy (enemyDB key: mimic)
// Animations preserved from the original inline draw():
//   - while idle (disguised as a chest), a small shake driven by Date.now()/50 + e.blinkSeed
//   - once it starts chasing, it "opens" into a chomping mouth (chomp offset via
//     Date.now()/100 sine) with visible teeth, and stops shaking
// This sprite draws its own shadow (identical shape to the generic one, but centered on the
// shake-adjusted x) since its silhouette/behavior differs enough from the other enemies that
// it was kept self-contained in the original code too.
window.EnemySprites = window.EnemySprites || {};

window.EnemySprites.mimic = function(ctx, e, player) {
    let shake = Math.sin(Date.now() / 50 + e.blinkSeed) * 3;
    ctx.save();
    ctx.translate(e.x + (e.state === 'idle' ? shake : 0), e.y);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, e.radius, e.radius, e.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (e.state === 'idle') {
        ctx.fillStyle = '#4a2311';
        ctx.beginPath(); ctx.roundRect(-e.radius, -e.radius * 0.5, e.radius * 2, e.radius * 1.5, 5); ctx.fill();
        ctx.fillStyle = '#7a3b1a'; ctx.fillRect(-e.radius, 0, e.radius * 2, 5);
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(0, 2, 4, 0, Math.PI * 2); ctx.fill();
    } else {
        let chomp = Math.abs(Math.sin(Date.now() / 100)) * 10;
        ctx.fillStyle = '#4a2311';
        ctx.beginPath(); ctx.roundRect(-e.radius, -e.radius * 1.2 - chomp, e.radius * 2, e.radius, 5); ctx.fill();
        ctx.fillStyle = '#fff';
        for (let t = 0; t < 3; t++) {
            ctx.beginPath();
            ctx.moveTo(-e.radius + t * (e.radius * 0.6) + 4, -e.radius * 0.2 - chomp);
            ctx.lineTo(-e.radius + t * (e.radius * 0.6) + 12, 0 - chomp);
            ctx.lineTo(-e.radius + t * (e.radius * 0.6) + 20, -e.radius * 0.2 - chomp);
            ctx.fill();
        }
        ctx.fillStyle = '#4a2311';
        ctx.beginPath(); ctx.roundRect(-e.radius, -e.radius * 0.2, e.radius * 2, e.radius * 1.2, 5); ctx.fill();
    }
    ctx.restore();
};
