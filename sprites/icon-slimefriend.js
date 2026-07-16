// Roguelite item badge icon: Slime Squad.
window.IconSprites = window.IconSprites || {};

window.IconSprites.slimefriend = function(tctx, s) {
    tctx.fillStyle = '#ff8da1'; tctx.beginPath(); tctx.ellipse(0,0,9*s,7*s,0,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = 'rgba(255,255,255,0.4)'; tctx.beginPath(); tctx.ellipse(-3*s,-2*s,3*s,1.5*s,Math.PI/4,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#000'; tctx.beginPath(); tctx.arc(3*s,-1*s,1.3*s,0,Math.PI*2); tctx.arc(3*s,3*s,1.3*s,0,Math.PI*2); tctx.fill();
};
