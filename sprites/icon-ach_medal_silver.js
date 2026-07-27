// Achievement badge icon: ach_medal_silver
// A single 5-point star badge - the "first tier" medal.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_medal_silver'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // A single 5-point star badge - the "first tier" medal.
        stamp(() => {
            tctx.beginPath();
            for (let i = 0; i < 10; i++) {
                let rad = i % 2 === 0 ? 7.4*s : 3.2*s;
                let ang = -Math.PI/2 + i * Math.PI/5;
                let px = Math.cos(ang)*rad, py = Math.sin(ang)*rad;
                if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
            }
            tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = SHINE;
        tctx.beginPath(); tctx.ellipse(-1.6*s, -2.2*s, 1.3*s, 2*s, -0.4, 0, Math.PI*2); tctx.fill();

    });
};
