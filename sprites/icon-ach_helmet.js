// Achievement badge icon: ach_helmet
// A knight's helmet - for a survival/defense milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_helmet'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.beginPath(); tctx.arc(0, 1*s, 6.8*s, Math.PI, 0); tctx.fill();
            tctx.fillRect(-6.8*s, 1*s, 13.6*s, 3*s);
            tctx.beginPath(); tctx.moveTo(-1.3*s,-9.6*s); tctx.quadraticCurveTo(0,-12.2*s,1.3*s,-9.6*s); tctx.lineTo(2.6*s,6.2*s); tctx.lineTo(-2.6*s,6.2*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.3)';
        tctx.beginPath(); tctx.ellipse(-3.4*s, -1.6*s, 1.3*s, 2.6*s, -0.3, 0, Math.PI*2); tctx.fill();

    });
};
