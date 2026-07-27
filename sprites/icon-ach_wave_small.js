// Achievement badge icon: ach_wave_small
// Wave Rider: a plain shortboard tilted into a wave crest.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_wave_small'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Wave Rider: a plain shortboard with one racing stripe, tilted
        // into a wave crest, ridden by a small scared slime hanging on.
        tctx.save(); tctx.rotate(Math.PI/4);
        stamp(() => {
            tctx.beginPath();
            tctx.moveTo(0,-9.2*s);
            tctx.quadraticCurveTo(3.2*s,-5.6*s,3*s,0.4*s);
            tctx.quadraticCurveTo(2.8*s,5.6*s,1.7*s,8.4*s);
            tctx.lineTo(-1.7*s,8.4*s);
            tctx.quadraticCurveTo(-2.8*s,5.6*s,-3*s,0.4*s);
            tctx.quadraticCurveTo(-3.2*s,-5.6*s,0,-9.2*s);
            tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.4)';
        tctx.fillRect(-0.8*s, -7.6*s, 1.6*s, 14.8*s);
        tctx.fillStyle = SHINE;
        tctx.beginPath(); tctx.ellipse(-1.8*s, -4*s, 0.8*s, 2.4*s, -0.2, 0, Math.PI*2); tctx.fill();
        tctx.restore();

    });
};
