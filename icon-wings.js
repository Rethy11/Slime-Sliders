// Roguelite item badge icon: Wings.
window.IconSprites = window.IconSprites || {};

window.IconSprites.wings = function(tctx, s) {
    tctx.fillStyle = '#f5f5f5';
    tctx.beginPath(); tctx.moveTo(0,0); tctx.quadraticCurveTo(-10*s,-8*s,-9*s,2*s); tctx.quadraticCurveTo(-6*s,-1*s,-3*s,2*s); tctx.quadraticCurveTo(-4*s,4*s,0,3*s); tctx.closePath(); tctx.fill();
    tctx.beginPath(); tctx.moveTo(0,0); tctx.quadraticCurveTo(10*s,-8*s,9*s,2*s); tctx.quadraticCurveTo(6*s,-1*s,3*s,2*s); tctx.quadraticCurveTo(4*s,4*s,0,3*s); tctx.closePath(); tctx.fill();
    tctx.strokeStyle = '#ccc'; tctx.lineWidth = 0.8*s; tctx.stroke();
};
