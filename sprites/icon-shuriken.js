// Roguelite item badge icon: Shuriken. The in-game orbiting spin is applied by the
// caller (rotating ctx before invoking drawPixelIcon) — this icon itself is static.
window.IconSprites = window.IconSprites || {};

window.IconSprites.shuriken = function(tctx, s) {
    tctx.save(); tctx.rotate(Math.PI/4);
    tctx.fillStyle = '#bdc3c7';
    tctx.beginPath(); tctx.moveTo(0,-9*s); tctx.lineTo(2.5*s,-2.5*s); tctx.lineTo(9*s,0); tctx.lineTo(2.5*s,2.5*s); tctx.lineTo(0,9*s); tctx.lineTo(-2.5*s,2.5*s); tctx.lineTo(-9*s,0); tctx.lineTo(-2.5*s,-2.5*s); tctx.closePath(); tctx.fill();
    tctx.strokeStyle = '#7f8c8d'; tctx.lineWidth = 0.8*s; tctx.stroke();
    tctx.fillStyle = '#7f8c8d'; tctx.beginPath(); tctx.arc(0,0,2*s,0,Math.PI*2); tctx.fill();
    tctx.restore();
};
