// Achievement badge icon: ach_crane
// An origami crane - for a folding/crafting milestone.
// Shares the common stamped-coin badge scaffold (shadow, gold face, reeded edge,
// recessed plate) with every other achievement icon - see sprites/icon-ach-common.js
// for that shared drawAchievementCoinIcon(tctx, s, symbolFn) helper.
window.IconSprites = window.IconSprites || {};
window.IconSprites['ach_crane'] = function(tctx, s) {
    window.drawAchievementCoinIcon(tctx, s, function(stamp, SHINE, starPath) {
        stamp(() => {
            tctx.lineWidth = 1.4*s; tctx.lineCap = 'round';
            tctx.beginPath(); tctx.moveTo(0,-10*s); tctx.lineTo(0,-3*s); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(-6.2*s,-3*s); tctx.quadraticCurveTo(-8.4*s,4.4*s,-3.2*s,9.6*s); tctx.lineTo(-1*s,6.4*s); tctx.quadraticCurveTo(-3.2*s,2*s,0,-3*s); tctx.closePath(); tctx.fill();
            tctx.beginPath(); tctx.moveTo(6.2*s,-3*s); tctx.quadraticCurveTo(8.4*s,4.4*s,3.2*s,9.6*s); tctx.lineTo(1*s,6.4*s); tctx.quadraticCurveTo(3.2*s,2*s,0,-3*s); tctx.closePath(); tctx.fill();
        });
        tctx.fillStyle = SHINE; tctx.beginPath(); tctx.arc(0,-9.4*s,1.2*s,0,Math.PI*2); tctx.fill();

    });
};
