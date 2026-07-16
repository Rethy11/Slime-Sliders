// Small static Almanac-list icon for the Chest Mimic enemy.
window.IconSprites = window.IconSprites || {};

window.IconSprites.mimic = function(tctx, s) {
    tctx.fillStyle = '#8b4513'; tctx.fillRect(-8*s,-4*s,16*s,10*s);
    tctx.fillStyle = '#d4a017'; tctx.fillRect(-8*s,0,16*s,2*s);
    tctx.fillStyle = '#fff';
    for (let i = -1; i <= 1; i++) { tctx.beginPath(); tctx.moveTo(i*5*s-2*s,-4*s); tctx.lineTo(i*5*s,-1*s); tctx.lineTo(i*5*s+2*s,-4*s); tctx.fill(); }
};
