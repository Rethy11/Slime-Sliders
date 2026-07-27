// Achievement badge icon: ach_backpack
// A backpack - for an inventory/collection milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_backpack'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.beginPath(); tctx.roundRect(-5.6*s,-6*s,11.2*s,13.6*s,3*s); tctx.fill();
            tctx.beginPath(); tctx.roundRect(-3.6*s,-8.6*s,7.2*s,4.6*s,2*s); tctx.fill();
        });
        tctx.strokeStyle = SHINE; tctx.lineWidth = 1*s;
        tctx.beginPath(); tctx.moveTo(-2.8*s,-0.5*s); tctx.lineTo(2.8*s,-0.5*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(-4*s,-6.4*s); tctx.lineTo(-4*s,-3.6*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(4*s,-6.4*s); tctx.lineTo(4*s,-3.6*s); tctx.stroke();
        tctx.fillStyle = SHINE; tctx.beginPath(); tctx.arc(0,3*s,1.4*s,0,Math.PI*2); tctx.fill();

    });
};
