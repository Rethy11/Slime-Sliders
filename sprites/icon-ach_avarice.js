// Achievement badge icon: ach_avarice
// A grinning slime with dollar-sign eyes - for "hoard 50,000 coins".
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_avarice'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        // A grinning slime with dollar-sign eyes for "hoard 50,000 coins" -
        // reads as pure greed rather than a chest or a stack of coins.
        stamp(() => {
            tctx.beginPath();
            tctx.moveTo(0,-8.2*s); tctx.quadraticCurveTo(8.2*s,-2*s,7.2*s,4.2*s);
            tctx.quadraticCurveTo(6.2*s,9.2*s,0,9.2*s); tctx.quadraticCurveTo(-6.2*s,9.2*s,-7.2*s,4.2*s);
            tctx.quadraticCurveTo(-8.2*s,-2*s,0,-8.2*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = 'rgba(255,255,255,0.3)';
        tctx.beginPath(); tctx.ellipse(-3*s, -4.4*s, 1.6*s, 2.6*s, -0.3, 0, Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.ellipse(3*s, 5.8*s, 1.3*s, 2*s, 0.3, 0, Math.PI*2); tctx.fill();
        // Big greedy grin with teeth
        tctx.fillStyle = '#3f2400';
        tctx.beginPath();
        tctx.moveTo(-5.4*s, 2.4*s);
        tctx.quadraticCurveTo(0, 8.6*s, 5.4*s, 2.4*s);
        tctx.quadraticCurveTo(0, 5.6*s, -5.4*s, 2.4*s);
        tctx.closePath(); tctx.fill();
        tctx.fillStyle = SHINE;
        for (let i = -4; i <= 4; i += 2) { tctx.fillRect(i*s - 0.55*s, 2.6*s, 1.1*s, 1.6*s); }
        // Eyebrows, arched up in glee
        tctx.strokeStyle = '#3f2400'; tctx.lineWidth = 0.9*s; tctx.lineCap = 'round';
        tctx.beginPath(); tctx.moveTo(-5*s, -6.4*s); tctx.quadraticCurveTo(-3.4*s, -8.4*s, -1.6*s, -6.6*s); tctx.stroke();
        tctx.beginPath(); tctx.moveTo(1.6*s, -6.6*s); tctx.quadraticCurveTo(3.4*s, -8.4*s, 5*s, -6.4*s); tctx.stroke();
        // Dollar-sign eyes with a little sparkle in each
        tctx.fillStyle = '#3f2400';
        tctx.font = `bold ${7.6*s}px sans-serif`;
        tctx.textAlign = 'center'; tctx.textBaseline = 'middle';
        tctx.fillText('$', -3.4*s, -2*s);
        tctx.fillText('$', 3.4*s, -2*s);
        tctx.fillStyle = SHINE;
        tctx.beginPath(); tctx.arc(-4.2*s, -3.8*s, 0.55*s, 0, Math.PI*2); tctx.fill();
        tctx.beginPath(); tctx.arc(2.6*s, -3.8*s, 0.55*s, 0, Math.PI*2); tctx.fill();

    });
};
