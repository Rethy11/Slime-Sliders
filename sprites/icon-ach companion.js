// Achievement badge icon: ach_companion
// A small slime friend, bronzed for the badge.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_companion'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // A small slime friend, face front and center - matches the
        // in-game companion silhouette, bronzed for the badge.
        stamp(() => {
            tctx.beginPath();
            tctx.moveTo(0,-8.2*s); tctx.quadraticCurveTo(8.2*s,-2*s,7.2*s,4.2*s);
            tctx.quadraticCurveTo(6.2*s,9.2*s,0,9.2*s); tctx.quadraticCurveTo(-6.2*s,9.2*s,-7.2*s,4.2*s);
            tctx.quadraticCurveTo(-8.2*s,-2*s,0,-8.2*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = SHINE;
        tctx.beginPath(); tctx.arc(-2.5*s, 2*s, 1.3*s, 0, Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.arc(2.5*s, 2*s, 1.3*s, 0, Math.PI*2); tctx.fill();
        tctx.fillStyle = 'rgba(255,255,255,0.3)';
        tctx.beginPath(); tctx.ellipse(-3*s, -3.2*s, 1.6*s, 2.6*s, -0.3, 0, Math.PI*2); tctx.fill();

    });
};
