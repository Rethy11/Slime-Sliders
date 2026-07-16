// Roguelite item badge icon: Spikes.
window.IconSprites = window.IconSprites || {};

window.IconSprites.spikes = function(tctx, s) {
    tctx.strokeStyle = '#7fdbff'; tctx.lineWidth = 2*s; tctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
        let a = (Math.PI/3)*i;
        tctx.beginPath(); tctx.moveTo(0,0); tctx.lineTo(Math.cos(a)*9*s, Math.sin(a)*9*s); tctx.stroke();
    }
    tctx.fillStyle = '#0a2e44'; tctx.beginPath(); tctx.arc(0,0,2.5*s,0,Math.PI*2); tctx.fill();
};
