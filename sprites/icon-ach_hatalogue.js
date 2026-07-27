// Achievement badge icon: ach_hatalogue
// A top hat with a ribbon band - stands in for the full hat collection.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_hatalogue'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // A top hat with a ribbon band - stands in for the full hat
        // collection, without reusing the actual shop hat icon.
        stamp(() => {
            tctx.beginPath(); tctx.roundRect(-7.6*s, 4*s, 15.2*s, 2.8*s, 1.3*s); tctx.fill();
            tctx.beginPath(); tctx.roundRect(-5*s, -8.4*s, 10*s, 12.6*s, 1.2*s); tctx.fill();
        });
        tctx.fillStyle = SHINE; tctx.fillRect(-5*s, 0.4*s, 10*s, 2.1*s);
        tctx.fillStyle = 'rgba(255,255,255,0.3)';
        tctx.beginPath(); tctx.ellipse(-2.8*s, -4*s, 1.2*s, 4*s, 0, 0, Math.PI*2); tctx.fill();

    });
};
