// Achievement badge icon: ach_wave_medium
// Wave Breaker: a longer board with twin rails and a fin.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_wave_medium'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Wave Breaker: a longer, tilted board with a nose chevron, twin
        // rails and a fin, ridden by a small happily smiling slime.
        tctx.save(); tctx.rotate(Math.PI/4);
        stamp(() => {
            tctx.beginPath();
            tctx.moveTo(0,-10*s);
            tctx.quadraticCurveTo(3.6*s,-6*s,3.4*s,0.6*s);
            tctx.quadraticCurveTo(3.2*s,6.4*s,2*s,8.6*s);
            tctx.lineTo(-2*s,8.6*s);
            tctx.quadraticCurveTo(-3.2*s,6.4*s,-3.4*s,0.6*s);
            tctx.quadraticCurveTo(-3.6*s,-6*s,0,-10*s);
            tctx.closePath(); tctx.fill();
            tctx.beginPath(); tctx.moveTo(0,7.6*s); tctx.lineTo(1.7*s,10.6*s); tctx.lineTo(-1.7*s,10.6*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.4)';
        tctx.beginPath(); tctx.moveTo(0,-8.4*s); tctx.lineTo(2.1*s,-2.6*s); tctx.lineTo(0,-4.2*s); tctx.lineTo(-2.1*s,-2.6*s); tctx.closePath(); tctx.fill();
        tctx.fillStyle = SHINE;
        tctx.fillRect(-3.1*s,-1.6*s,1*s,7.4*s);
        tctx.fillRect(2.1*s,-1.6*s,1*s,7.4*s);
        tctx.restore();

    });
};
