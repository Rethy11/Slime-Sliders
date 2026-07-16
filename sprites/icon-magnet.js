// Roguelite item badge icon: Magnet.
window.IconSprites = window.IconSprites || {};

window.IconSprites.magnet = function(tctx, s) {
    tctx.fillStyle = '#e74c3c';
    tctx.beginPath(); tctx.arc(0, -1*s, 8*s, Math.PI, 0, false); tctx.lineTo(8*s, 7*s); tctx.lineTo(4*s, 7*s); tctx.lineTo(4*s, -1*s); tctx.arc(0, -1*s, 4*s, 0, Math.PI, true); tctx.lineTo(-4*s, 7*s); tctx.lineTo(-8*s, 7*s); tctx.closePath(); tctx.fill();
    tctx.strokeStyle = '#a5271b'; tctx.lineWidth = 1*s; tctx.stroke();
    tctx.fillStyle = '#ecf0f1'; tctx.fillRect(-8*s, 4*s, 4*s, 3*s); tctx.fillRect(4*s, 4*s, 4*s, 3*s);
    tctx.strokeStyle = '#95a5a6'; tctx.lineWidth = 0.6*s; tctx.strokeRect(-8*s, 4*s, 4*s, 3*s); tctx.strokeRect(4*s, 4*s, 4*s, 3*s);
};
