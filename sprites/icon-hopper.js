// Small static Almanac-list icon for the Frog enemy.
window.IconSprites = window.IconSprites || {};

window.IconSprites.hopper = function(tctx, s) {
    tctx.fillStyle = '#27ae60'; tctx.beginPath(); tctx.ellipse(0,1*s,9*s,6.5*s,0,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#fff'; tctx.beginPath(); tctx.arc(-4*s,-5*s,3*s,0,Math.PI*2); tctx.arc(4*s,-5*s,3*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#000'; tctx.beginPath(); tctx.arc(-4*s,-5*s,1.3*s,0,Math.PI*2); tctx.arc(4*s,-5*s,1.3*s,0,Math.PI*2); tctx.fill();
};
