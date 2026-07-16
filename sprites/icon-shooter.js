// Small static Almanac-list icon for the Turret Eye enemy.
window.IconSprites = window.IconSprites || {};

window.IconSprites.shooter = function(tctx, s) {
    tctx.fillStyle = '#34495e'; tctx.beginPath(); tctx.arc(0,0,9*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#fff'; tctx.beginPath(); tctx.arc(0,0,6*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#ff0055'; tctx.beginPath(); tctx.arc(0,0,3*s,0,Math.PI*2); tctx.fill();
};
