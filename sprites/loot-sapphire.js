// World loot pickup: Sapphire. Sparkle animation driven off c.seed.
window.LootSprites = window.LootSprites || {};

window.LootSprites.sapphire = function(ctx, c) {
    let t = Date.now()/300 + (c.seed||0);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 10, c.radius*0.8, c.radius*0.4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.8, c.y - c.radius*0.8); ctx.lineTo(c.x + c.radius*0.8, c.y - c.radius*0.8); ctx.lineTo(c.x, c.y + c.radius); ctx.fill();
    ctx.fillStyle = '#2980b9'; ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.8, c.y - c.radius*0.8); ctx.lineTo(c.x, c.y); ctx.lineTo(c.x, c.y + c.radius); ctx.fill();
    ctx.globalAlpha = 0.4 + 0.6*Math.abs(Math.sin(t*2+1)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x + c.radius*0.2, c.y - c.radius*0.5, 1.6, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
};
