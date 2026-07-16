// Small static Almanac-list icon for the Slime enemy. Distinct from the animated
// in-game sprite in sprites/wanderer.js (window.EnemySprites.wanderer) — this is
// just a fixed pose for the Almanac's thumbnail, registered on window.IconSprites.
window.IconSprites = window.IconSprites || {};

window.IconSprites.wanderer = function(tctx, s) {
    tctx.fillStyle = '#2ecc71'; tctx.beginPath(); tctx.ellipse(0,0,9*s,7*s,0,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = 'rgba(255,255,255,0.3)'; tctx.beginPath(); tctx.ellipse(-3*s,-2*s,3*s,1.5*s,Math.PI/4,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#000'; tctx.beginPath(); tctx.arc(3*s,-1*s,1.3*s,0,Math.PI*2); tctx.arc(3*s,3*s,1.3*s,0,Math.PI*2); tctx.fill();
};
