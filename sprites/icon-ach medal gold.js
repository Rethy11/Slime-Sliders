// Achievement badge icon: ach_medal_gold
// The "second tier" medal: same star, wrapped in a laurel wreath.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_medal_gold'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // The "second tier" medal: same star, now wrapped in a laurel
        // wreath to signal it's the bigger achievement of the pair.
        stamp(() => {
            tctx.beginPath();
            for (let i = 0; i < 10; i++) {
                let rad = i % 2 === 0 ? 6.2*s : 2.7*s;
                let ang = -Math.PI/2 + i * Math.PI/5;
                let px = Math.cos(ang)*rad, py = Math.sin(ang)*rad;
                if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
            }
            tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = SHINE;
        tctx.beginPath(); tctx.ellipse(-1.3*s, -1.8*s, 1.1*s, 1.7*s, -0.4, 0, Math.PI*2); tctx.fill();
        // Laurel leaves curling up either side.
        tctx.fillStyle = '#5c3808';
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 4; i++) {
                let t = i / 3;
                let ang = side * (Math.PI*0.55 + t*Math.PI*0.35);
                let rad = 8*s + t*1.4*s;
                let cx2 = Math.cos(ang)*rad, cy2 = Math.sin(ang)*rad + 1*s;
                tctx.save(); tctx.translate(cx2, cy2); tctx.rotate(ang + side*Math.PI/2);
                tctx.beginPath(); tctx.ellipse(0, 0, 1.9*s, 0.9*s, 0, 0, Math.PI*2); tctx.fill();
                tctx.restore();
            }
        }

    });
};
