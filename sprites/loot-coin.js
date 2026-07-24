// World loot pickup: Coin. Called from the render queue via window.LootSprites.coin(ctx, item.obj).
// Squish animation driven off c.seed so scattered coins don't all pulse in lockstep.
// The shadow goes through the page's shared drawGroundShadow() (declared in the main inline
// script) so it gets the same checker-proof black-fill-plus-white-ring treatment as every
// other entity's shadow under 1-Bit. Loot sprites aren't passed `player` (see the call site
// in the main draw loop), but it's reachable the same way drawGroundShadow is: top-level
// `let`/`function` declared in one <script> tag share the page's single global scope with
// every other script tag, so both are just visible here as free variables.
// 1-Bit: flat white disc with a black outline and inner ring instead of the gold/orange fill.
window.LootSprites = window.LootSprites || {};

window.LootSprites.coin = function(ctx, c) {
    let onebit = player.color === 'onebit';
    let t = Date.now()/300 + (c.seed||0); let squish = Math.max(0.35, Math.abs(Math.cos(t)));
    drawGroundShadow(ctx, c.x, c.y + 10, c.radius*0.8, c.radius*0.4);
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(squish, 1);
    if (onebit) {
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, c.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = Math.max(1.5, c.radius * 0.12); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, c.radius * 0.6, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, c.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(0, 0, c.radius * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};
