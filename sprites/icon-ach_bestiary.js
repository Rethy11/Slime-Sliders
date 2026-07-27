// Achievement badge icon: ach_bestiary
// Closed book with a star emblem - "completed the whole bestiary".
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_bestiary'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // Closed book, spine facing out, with a star emblem tooled into
        // the cover - "completed the whole bestiary" reads as a trophy book.
        stamp(() => { tctx.beginPath(); tctx.roundRect(-6.6*s, -8.4*s, 13.2*s, 16.8*s, 1.4*s); tctx.fill(); });
        tctx.fillStyle = SHINE;
        tctx.fillRect(5.6*s, -7.6*s, 1.2*s, 15.2*s);
        tctx.strokeStyle = SHINE; tctx.lineWidth = 0.7*s;
        tctx.beginPath(); tctx.moveTo(-6.6*s,-4.6*s); tctx.lineTo(4.6*s,-4.6*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(-6.6*s,6.6*s); tctx.lineTo(4.6*s,6.6*s); tctx.stroke();
        tctx.fillStyle = '#3f2400';
        tctx.save(); tctx.translate(-0.9*s, 0.6*s); starPath(2.6*s, 1.1*s, 5); tctx.fill(); tctx.restore();

    });
};
