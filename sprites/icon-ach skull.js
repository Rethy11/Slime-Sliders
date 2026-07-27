// Achievement badge icon: ach_skull
// A skull - for a death-count or danger milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_skull'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.beginPath(); tctx.arc(0,-2*s,6.8*s,Math.PI,0); tctx.fill();
            tctx.fillRect(-6.8*s,-2*s,13.6*s,6.8*s);
            tctx.beginPath(); tctx.moveTo(-6.8*s,4.8*s); tctx.quadraticCurveTo(0,9.6*s,6.8*s,4.8*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = '#3f2400';
        tctx.beginPath(); tctx.arc(-2.9*s,-1*s,2.1*s,0,Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.arc(2.9*s,-1*s,2.1*s,0,Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.moveTo(0,1.8*s); tctx.lineTo(-1.4*s,4.8*s); tctx.lineTo(1.4*s,4.8*s); tctx.closePath(); tctx.fill();

    });
};
