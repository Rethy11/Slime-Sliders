// Achievement badge icon: ach_perfectionist
// The "harder mode" counterpart to ach_model_student: the same ribbon medal, now wrapped
// in a laurel wreath for an A+ in the tougher, ever-scaling Endless Waves mode - mirrors
// how ach_medal_gold dresses up ach_medal_silver's plain star for its second tier.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_perfectionist'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            [-1, 1].forEach(side => {
                tctx.save();
                tctx.translate(side * 2.4 * s, 1.4 * s);
                tctx.rotate(-side * 0.22);
                tctx.beginPath();
                tctx.moveTo(-1.5*s, 0); tctx.lineTo(1.5*s, 0);
                tctx.lineTo(1.5*s, 7.8*s); tctx.lineTo(0, 5.4*s); tctx.lineTo(-1.5*s, 7.8*s);
                tctx.closePath(); tctx.fill();
                tctx.restore();
            });
            // Fluted medal disc, same scalloped-rim construction as ach_model_student, just
            // sized a touch smaller to leave room for the wreath curling around it.
            tctx.beginPath();
            let flutes = 12, steps = flutes * 8;
            for (let i = 0; i <= steps; i++) {
                let ang = (i / steps) * Math.PI * 2;
                let rad = 5.6*s + 0.7*s * Math.cos(ang * flutes);
                let px = Math.cos(ang - Math.PI/2) * rad, py = Math.sin(ang - Math.PI/2) * rad - 1.8*s;
                if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
            }
            tctx.closePath(); tctx.fill();
        });
        // Laurel leaves curling up either side, reusing ach_medal_gold's construction.
        tctx.fillStyle = '#5c3808';
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 4; i++) {
                let t = i / 3;
                let ang = side * (Math.PI*0.5 + t*Math.PI*0.4);
                let rad = 8.4*s + t*1.3*s;
                let cx2 = Math.cos(ang)*rad, cy2 = Math.sin(ang)*rad - 0.4*s;
                tctx.save(); tctx.translate(cx2, cy2); tctx.rotate(ang + side*Math.PI/2);
                tctx.beginPath(); tctx.ellipse(0, 0, 1.8*s, 0.85*s, 0, 0, Math.PI*2); tctx.fill();
                tctx.restore();
            }
        }
        // Recessed medal center + rim highlight, echoing the coin's own plate treatment.
        tctx.fillStyle = 'rgba(0,0,0,0.18)';
        tctx.beginPath(); tctx.arc(0, -1.8*s, 3.9*s, 0, Math.PI*2); tctx.fill();
        tctx.strokeStyle = SHINE; tctx.lineWidth = 0.55*s;
        tctx.beginPath(); tctx.arc(0, -1.8*s, 3.9*s, Math.PI*1.1, Math.PI*1.9); tctx.stroke();
        // "A+" engraved into the medal center, same dark-base + raised-SHINE pairing as
        // ach_model_student.
        tctx.textAlign = 'center'; tctx.textBaseline = 'middle';
        tctx.font = 'bold ' + (4.4*s) + 'px sans-serif';
        tctx.fillStyle = '#3f2400'; tctx.fillText('A+', 0.3*s, -1.5*s);
        tctx.fillStyle = SHINE; tctx.fillText('A+', 0, -1.8*s);

    });
};
