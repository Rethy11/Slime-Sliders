// Small static Almanac-list icon for the Bee enemy.
window.IconSprites = window.IconSprites || {};

window.IconSprites.chaser = function(tctx, s) {
    tctx.fillStyle = 'rgba(255,255,255,0.7)'; tctx.beginPath(); tctx.ellipse(0,-6*s,4*s,7*s,0,0,Math.PI*2); tctx.ellipse(0,6*s,4*s,7*s,0,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#f1c40f'; tctx.beginPath(); tctx.ellipse(0,0,8*s,5*s,0,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#000'; tctx.fillRect(-5*s,-4*s,2.5*s,8*s); tctx.fillRect(1*s,-4*s,2.5*s,8*s);
};
