// Achievement badge icon: ach_glitchbadge
// A garish glitch-colored badge - for the Glitch skin/secret milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_glitchbadge'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => { tctx.beginPath(); tctx.roundRect(-8.4*s,-8.4*s,16.8*s,16.8*s,3*s); tctx.fill(); });
        tctx.fillStyle = '#00e5ff'; tctx.fillRect(-7*s,-6*s,9.4*s,3*s);
        tctx.fillStyle = '#ff2ec4'; tctx.fillRect(-3.6*s,-1*s,11.2*s,3*s);
        tctx.fillStyle = '#00e5ff'; tctx.fillRect(-7*s,4*s,6.6*s,3*s);
        tctx.fillStyle = SHINE; tctx.fillRect(2.2*s,-6*s,2.8*s,3*s);

    });
};
