// Achievement badge icon: ach_wave_large
// Wave Master: the showiest board with a lightning paint job and star medallion.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_wave_large'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Wave Master: the showiest tilted board - a bigger fin, a
        // lightning-bolt paint job and a star medallion - ridden by a small
        // slime cool enough for sunglasses.
        tctx.save(); tctx.rotate(Math.PI/4);
        stamp(() => {
            tctx.beginPath();
            tctx.moveTo(0,-10.8*s);
            tctx.quadraticCurveTo(3.9*s,-6.4*s,3.7*s,0.8*s);
            tctx.quadraticCurveTo(3.5*s,7*s,2.2*s,9.4*s);
            tctx.lineTo(-2.2*s,9.4*s);
            tctx.quadraticCurveTo(-3.5*s,7*s,-3.7*s,0.8*s);
            tctx.quadraticCurveTo(-3.9*s,-6.4*s,0,-10.8*s);
            tctx.closePath(); tctx.fill();
            tctx.beginPath(); tctx.moveTo(0,8.2*s); tctx.lineTo(2*s,11.8*s); tctx.lineTo(-2*s,11.8*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = SHINE;
        tctx.beginPath();
        tctx.moveTo(1.2*s,-9*s); tctx.lineTo(-1.6*s,-0.6*s); tctx.lineTo(0.4*s,-0.6*s); tctx.lineTo(-1.2*s,8*s); tctx.lineTo(2.4*s,-2.2*s); tctx.lineTo(0.4*s,-2.2*s);
        tctx.closePath(); tctx.fill();
        tctx.fillStyle = 'rgba(255,255,255,0.5)';
        tctx.save(); tctx.translate(0, -8*s); starPath(1.6*s, 0.7*s, 5); tctx.fill(); tctx.restore();
        tctx.restore();

    });
};
