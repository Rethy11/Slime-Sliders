// Achievement badge icon: ach_footprint
// A pair of footprints - for total distance traveled.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_footprint'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.beginPath(); tctx.ellipse(-3.3*s, -3.2*s, 3.6*s, 5.2*s, -0.3, 0, Math.PI*2); tctx.fill();
            tctx.beginPath(); tctx.arc(-6.4*s, -9.2*s, 1.6*s, 0, Math.PI*2); tctx.fill();
            tctx.beginPath(); tctx.ellipse(3.6*s, 3.6*s, 3.6*s, 5.2*s, 0.3, 0, Math.PI*2); tctx.fill();
            tctx.beginPath(); tctx.arc(6.6*s, 9.8*s, 1.6*s, 0, Math.PI*2); tctx.fill();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.35)';
        tctx.beginPath(); tctx.ellipse(-4.2*s, -4.7*s, 1.1*s, 2.1*s, -0.3, 0, Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.ellipse(2.7*s, 2.1*s, 1.1*s, 2.1*s, 0.3, 0, Math.PI*2); tctx.fill();

    });
};
