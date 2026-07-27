// Item icon: Wilkshirian Knowledge
window.IconSprites = window.IconSprites || {};
window.IconSprites['wilkshirianknowledge'] = function(tctx, s) {
    // A small open book with glowing pages - "knowledge" that occasionally shields you, so
    // a soft gold glow sits behind it like the invulnerability aura it grants.
    tctx.fillStyle = 'rgba(255, 235, 150, 0.5)'; tctx.beginPath(); tctx.arc(0,0,10*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#fdf6e3';
    tctx.beginPath(); tctx.moveTo(0,-2*s); tctx.quadraticCurveTo(-8*s,-6*s,-9*s,-1*s); tctx.quadraticCurveTo(-8*s,4*s,0,6*s); tctx.quadraticCurveTo(8*s,4*s,9*s,-1*s); tctx.quadraticCurveTo(8*s,-6*s,0,-2*s); tctx.fill();
    tctx.strokeStyle = '#b8860b'; tctx.lineWidth = 1*s;
    tctx.beginPath(); tctx.moveTo(0,-2*s); tctx.lineTo(0,6*s); tctx.stroke();
    tctx.beginPath(); tctx.moveTo(-9*s,-1*s); tctx.quadraticCurveTo(-8*s,4*s,0,6*s); tctx.quadraticCurveTo(8*s,4*s,9*s,-1*s); tctx.stroke();
};
