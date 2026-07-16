// World loot pickup: Coin. Called from the render queue via window.LootSprites.coin(ctx, item.obj).
// Squish animation driven off c.seed so scattered coins don't all pulse in lockstep.
window.LootSprites = window.LootSprites || {};

window.LootSprites.coin = function(ctx, c) {
    let t = Date.now()/300 + (c.seed||0); let squish = Math.max(0.35, Math.abs(Math.cos(t)));
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 10, c.radius*0.8, c.radius*0.4, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(squish, 1);
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, c.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(0, 0, c.radius * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};
