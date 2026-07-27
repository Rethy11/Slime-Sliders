// Item icon: Plasma Beam
window.IconSprites = window.IconSprites || {};
window.IconSprites['plasmabeam'] = function(tctx, s) {
    // A tight neon laser bolt (as opposed to 'lightning's jagged yellow zigzag) with a
    // bright impact burst at the tip, magenta/cyan to read as "plasma".
    tctx.strokeStyle = 'rgba(255, 71, 226, 0.35)'; tctx.lineWidth = 7*s; tctx.lineCap = 'round';
    tctx.beginPath(); tctx.moveTo(-8*s,8*s); tctx.lineTo(6*s,-8*s); tctx.stroke();
    tctx.strokeStyle = '#ff47e2'; tctx.lineWidth = 3*s;
    tctx.beginPath(); tctx.moveTo(-8*s,8*s); tctx.lineTo(6*s,-8*s); tctx.stroke();
    tctx.strokeStyle = '#e8fbff'; tctx.lineWidth = 1.3*s;
    tctx.beginPath(); tctx.moveTo(-8*s,8*s); tctx.lineTo(6*s,-8*s); tctx.stroke();
    tctx.fillStyle = '#e8fbff'; tctx.beginPath(); tctx.arc(6*s,-8*s,3*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = 'rgba(0, 229, 255, 0.6)'; tctx.beginPath(); tctx.arc(6*s,-8*s,5.5*s,0,Math.PI*2); tctx.fill();
};
