// World loot pickup: Emerald. Sparkle animation driven off c.seed.
// See loot-coin.js for why `player` and drawGroundShadow are reachable here despite not
// being passed in: they're page-global `let`/`function` declarations shared across every
// <script> tag on the page, including this one.
// 1-Bit: flat black hexagon outlined in white (with a thin white facet line standing in for
// the two-tone green/dark-green split) instead of the green/dark-green fill.
window.LootSprites = window.LootSprites || {};

window.LootSprites.emerald = function(ctx, c) {
    let onebit = player.color === 'onebit';
    let t = Date.now()/300 + (c.seed||0);
    drawGroundShadow(ctx, c.x, c.y + 10, c.radius*0.8, c.radius*0.4);
    if (onebit) {
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.5, c.y - c.radius); ctx.lineTo(c.x + c.radius*0.5, c.y - c.radius); ctx.lineTo(c.x + c.radius, c.y); ctx.lineTo(c.x + c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x - c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x - c.radius, c.y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, c.radius * 0.14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x, c.y); ctx.lineTo(c.x + c.radius*0.5, c.y + c.radius);
        ctx.lineWidth = 1; ctx.stroke();
        ctx.globalAlpha = 0.4 + 0.6*Math.abs(Math.sin(t*2+2)); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(c.x - c.radius*0.2, c.y - c.radius*0.5, 1.6, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.5, c.y - c.radius); ctx.lineTo(c.x + c.radius*0.5, c.y - c.radius); ctx.lineTo(c.x + c.radius, c.y); ctx.lineTo(c.x + c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x - c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x - c.radius, c.y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#219150'; ctx.beginPath(); ctx.moveTo(c.x - c.radius*0.5, c.y + c.radius); ctx.lineTo(c.x, c.y); ctx.lineTo(c.x + c.radius*0.5, c.y + c.radius); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 0.4 + 0.6*Math.abs(Math.sin(t*2+2)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x - c.radius*0.2, c.y - c.radius*0.5, 1.6, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    }
};
