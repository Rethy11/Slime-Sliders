// Achievement badge icon: ach_cult
// Two curling ram horns framing a small gem - for leading a squad of companions.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_cult'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Two curling ram horns framing a small gem - crown-like, for
        // "leading" a squad of companions.
        stamp(() => {
            tctx.beginPath(); tctx.moveTo(-1.6*s,6.4*s); tctx.quadraticCurveTo(-7.6*s,2*s,-6.4*s,-6.4*s); tctx.quadraticCurveTo(-5.4*s,-10.6*s,-2.2*s,-9.6*s); tctx.quadraticCurveTo(-4.4*s,-4*s,-1.1*s,4.4*s); tctx.closePath(); tctx.fill();
            tctx.beginPath(); tctx.moveTo(1.6*s,6.4*s); tctx.quadraticCurveTo(7.6*s,2*s,6.4*s,-6.4*s); tctx.quadraticCurveTo(5.4*s,-10.6*s,2.2*s,-9.6*s); tctx.quadraticCurveTo(4.4*s,-4*s,1.1*s,4.4*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = SHINE;
        tctx.beginPath(); tctx.arc(0, 6.8*s, 1.7*s, 0, Math.PI*2); tctx.fill();

    });
};
