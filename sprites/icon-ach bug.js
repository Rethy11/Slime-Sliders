// Achievement badge icon: ach_bug
// A little beetle - for the bug-report/feedback achievement.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_bug'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.beginPath(); tctx.ellipse(0, 1*s, 6.4*s, 7.6*s, 0, 0, Math.PI*2); tctx.fill();
            tctx.lineWidth = 1*s; tctx.beginPath(); tctx.moveTo(0,-6.4*s); tctx.lineTo(0,8.4*s); tctx.stroke();
            [[-3,-2],[3,-2],[-3.8,3],[3.8,3]].forEach(p => { tctx.beginPath(); tctx.arc(p[0]*s,p[1]*s,1.1*s,0,Math.PI*2); tctx.fill(); });
            tctx.beginPath(); tctx.arc(0,-6.4*s,2.8*s,0,Math.PI*2); tctx.fill();
            tctx.lineWidth = 0.9*s;
            tctx.beginPath(); tctx.moveTo(-1.4*s,-8.2*s); tctx.lineTo(-3.2*s,-10.4*s); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(1.4*s,-8.2*s); tctx.lineTo(3.2*s,-10.4*s); tctx.stroke();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.3)';
        tctx.beginPath(); tctx.ellipse(-2*s, -1.5*s, 1.4*s, 2.6*s, -0.2, 0, Math.PI*2); tctx.fill();

    });
};
