// Almanac (book) icon — corner button + Almanac modal header.
window.IconSprites = window.IconSprites || {};

window.IconSprites.book = function(tctx, s) {
    tctx.fillStyle = '#6d217d';
    tctx.beginPath(); tctx.roundRect(-10*s,-8*s,20*s,16*s,2*s); tctx.fill();
    tctx.fillStyle = '#f1c40f';
    tctx.fillRect(-10*s, -8*s, 4*s, 16*s);
    tctx.fillStyle = '#fff';
    tctx.beginPath(); tctx.roundRect(-5*s,-6*s,13*s,12*s,1*s); tctx.fill();
    tctx.fillStyle = '#e74c3c';
    tctx.fillRect(2*s, -8*s, 3*s, 10*s);
};
