// Achievement badge icon: ach_legendary
// A four-bladed throwing star, for the rare Shuriken item pickup.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_legendary'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Four-bladed throwing star, for the rare Shuriken item pickup.
        stamp(() => {
            tctx.beginPath();
            tctx.moveTo(0,-9.6*s); tctx.lineTo(2.4*s,-2.4*s); tctx.lineTo(9.6*s,0); tctx.lineTo(2.4*s,2.4*s);
            tctx.lineTo(0,9.6*s); tctx.lineTo(-2.4*s,2.4*s); tctx.lineTo(-9.6*s,0); tctx.lineTo(-2.4*s,-2.4*s);
            tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.4)';
        tctx.beginPath(); tctx.moveTo(0,-9.6*s); tctx.lineTo(2.4*s,-2.4*s); tctx.lineTo(0.6*s,-2.4*s); tctx.closePath(); tctx.fill();
        tctx.fillStyle = SHINE; tctx.beginPath(); tctx.arc(0,0,1.7*s,0,Math.PI*2); tctx.fill();

    });
};
