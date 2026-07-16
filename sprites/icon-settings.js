// Settings (gear) icon — corner button. Has its own idle spin animation.
window.IconSprites = window.IconSprites || {};

window.IconSprites.gear = function(tctx, s) {
    tctx.save(); tctx.rotate((Date.now()/1500) % (Math.PI*2));
    tctx.fillStyle = '#e6e6e6';
    for (let i = 0; i < 8; i++) {
        let a = (Math.PI/4)*i;
        tctx.save(); tctx.rotate(a); tctx.fillRect(-1.6*s, -10*s, 3.2*s, 4*s); tctx.restore();
    }
    tctx.beginPath(); tctx.arc(0,0,7*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#555'; tctx.beginPath(); tctx.arc(0,0,3*s,0,Math.PI*2); tctx.fill();
    tctx.restore();
};
