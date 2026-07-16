// Small static Almanac-list icon for the Bull enemy.
window.IconSprites = window.IconSprites || {};

window.IconSprites.dasher = function(tctx, s) {
    tctx.fillStyle = '#795548'; tctx.beginPath(); tctx.ellipse(0,0,9*s,6.5*s,0,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#ecf0f1';
    tctx.beginPath(); tctx.moveTo(3*s,-5*s); tctx.lineTo(9*s,-9*s); tctx.lineTo(5*s,-2*s); tctx.fill();
    tctx.beginPath(); tctx.moveTo(3*s,5*s); tctx.lineTo(9*s,9*s); tctx.lineTo(5*s,2*s); tctx.fill();
    tctx.fillStyle = '#3e2723'; tctx.beginPath(); tctx.arc(5*s,-2*s,1.2*s,0,Math.PI*2); tctx.fill(); tctx.beginPath(); tctx.arc(5*s,2*s,1.2*s,0,Math.PI*2); tctx.fill();
};
