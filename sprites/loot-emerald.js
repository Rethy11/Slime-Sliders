// World loot pickup: Emerald. Sparkle animation driven off c.seed.
window.LootSprites = window.LootSprites || {};

window.LootSprites.emerald = function(ctx, c) {
    let t = Date.now()/300 + (c.seed||0);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 10, c.radius*0.8, c.radius*0.4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.5, c.y - c.radius); ctx.lineTo(c.x + c.radius*0.5, c.y - c.radius); ctx.lineTo(c.x + c.radius, c.y); ctx.lineTo(c.x + c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x - c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x - c.radius, c.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#219150'; ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x, c.y); ctx.lineTo(c.x + c.radius*0.5, c.y + c.radius); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.4 + 0.6*Math.abs(Math.sin(t*2+2)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x - c.radius*0.2, c.y - c.radius*0.5, 1.6, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
};
