// Achievement badge icon: ach_scroll
// An unrolled scroll - for a lore/almanac milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_scroll'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => { tctx.beginPath(); tctx.roundRect(-6.8*s,-6.2*s,13.6*s,12.4*s,2*s); tctx.fill(); });
        tctx.strokeStyle = SHINE; tctx.lineWidth = 0.9*s;
        tctx.beginPath(); tctx.moveTo(-4.8*s,-2.2*s); tctx.lineTo(4.8*s,-2.2*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(-4.8*s,1*s); tctx.lineTo(4.8*s,1*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(-4.8*s,4.2*s); tctx.lineTo(1.8*s,4.2*s); tctx.stroke();
        tctx.fillStyle = '#3f2400';
        tctx.beginPath(); tctx.ellipse(-6.8*s,0,2*s,6.2*s,0,0,Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.ellipse(6.8*s,0,2*s,6.2*s,0,0,Math.PI*2); tctx.fill();

    });
};
