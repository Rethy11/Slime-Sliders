// Achievement badge icon: ach_gem
// A faceted gem - for a gem-collection milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_gem'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.beginPath(); tctx.moveTo(-7.4*s,-2.2*s); tctx.lineTo(0,-9.4*s); tctx.lineTo(7.4*s,-2.2*s); tctx.lineTo(0,9.6*s); tctx.closePath(); tctx.fill();
        });
        tctx.strokeStyle = '#3f2400'; tctx.lineWidth = 0.8*s;
        tctx.beginPath(); tctx.moveTo(-3.7*s,-2.2*s); tctx.lineTo(0,9.6*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(3.7*s,-2.2*s); tctx.lineTo(0,9.6*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(-7.4*s,-2.2*s); tctx.lineTo(7.4*s,-2.2*s); tctx.stroke();
        tctx.fillStyle = 'rgba(255,255,255,0.55)';
        tctx.beginPath(); tctx.moveTo(-7.4*s,-2.2*s); tctx.lineTo(0,-9.4*s); tctx.lineTo(-2*s,-2.2*s); tctx.closePath(); tctx.fill();

    });
};
