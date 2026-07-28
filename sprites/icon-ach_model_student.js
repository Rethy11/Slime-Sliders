// Achievement badge icon: ach_model_student
// A ribbon medal (a stamped, single-tone take on the level-complete grade rosette) for
// "get an A+ in Classic mode" - the plain first-tier medal in this pair, the same way
// ach_medal_silver is the plain version of ach_medal_gold.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_model_student'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Two swallowtail ribbon ends hanging below the medal, each cut with a single V
        // notch - drawn first so the fluted medal disc overlaps their top edges, same
        // layering a real ribbon-and-medal rosette would have.
        stamp(() => {
            [-1, 1].forEach(side => {
                tctx.save();
                tctx.translate(side * 2.6 * s, 1.6 * s);
                tctx.rotate(-side * 0.22);
                tctx.beginPath();
                tctx.moveTo(-1.6*s, 0); tctx.lineTo(1.6*s, 0);
                tctx.lineTo(1.6*s, 8.4*s); tctx.lineTo(0, 5.8*s); tctx.lineTo(-1.6*s, 8.4*s);
                tctx.closePath(); tctx.fill();
                tctx.restore();
            });
            // Fluted medal disc: a smoothly scalloped rim (a sine-modulated radius rather
            // than sharp star points) standing in for the grade rosette's pleated edge.
            tctx.beginPath();
            let flutes = 12, steps = flutes * 8;
            for (let i = 0; i <= steps; i++) {
                let ang = (i / steps) * Math.PI * 2;
                let rad = 6.6*s + 0.8*s * Math.cos(ang * flutes);
                let px = Math.cos(ang - Math.PI/2) * rad, py = Math.sin(ang - Math.PI/2) * rad - 1.4*s;
                if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
            }
            tctx.closePath(); tctx.fill();
        });
        // Recessed medal center + rim highlight, echoing the coin's own plate treatment.
        tctx.fillStyle = 'rgba(0,0,0,0.18)';
        tctx.beginPath(); tctx.arc(0, -1.4*s, 4.6*s, 0, Math.PI*2); tctx.fill();
        tctx.strokeStyle = SHINE; tctx.lineWidth = 0.6*s;
        tctx.beginPath(); tctx.arc(0, -1.4*s, 4.6*s, Math.PI*1.1, Math.PI*1.9); tctx.stroke();
        // "A+" engraved into the medal center: a soft dark base pass, then a raised SHINE
        // pass offset up-left, matching the stamp's own shadow/highlight logic.
        tctx.textAlign = 'center'; tctx.textBaseline = 'middle';
        tctx.font = 'bold ' + (5.2*s) + 'px sans-serif';
        tctx.fillStyle = '#3f2400'; tctx.fillText('A+', 0.35*s, -1.05*s);
        tctx.fillStyle = SHINE; tctx.fillText('A+', 0, -1.4*s);

    });
};
