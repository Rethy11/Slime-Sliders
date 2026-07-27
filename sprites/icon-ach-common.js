// Shared "stamped coin" scaffold used by every achievement badge icon (see the individual
// sprites/icon-ach_*.js files). Every achievement badge draws this same construction: a
// cast shadow, a two-tone gold coin face, a reeded (ridged) edge, a rim highlight, and a
// recessed engraved plate the symbol is stamped onto - then hands control to symbolFn to
// draw that badge's specific emblem via the `stamp` helper (for a pressed/engraved look)
// and the shared `SHINE` highlight color. Locked achievements still get desaturated to
// grey by the .locked-entry CSS filter wherever these are displayed, same as before.
window.drawAchievementCoinIcon = function (tctx, s, symbolFn) {
    let r = 11.6 * s;

    // Cast shadow behind the whole coin, so it sits above the tile background.
    tctx.save();
    tctx.beginPath(); tctx.arc(0.7*s, 1.1*s, r, 0, Math.PI*2);
    tctx.fillStyle = 'rgba(45,25,0,0.4)'; tctx.fill();
    tctx.restore();

    // Coin face: warm gold radial gradient, brightest toward the upper-left like a single
    // light source.
    let faceGrad = tctx.createRadialGradient(-4*s, -5*s, 1*s, 0, 0, r * 1.3);
    faceGrad.addColorStop(0, '#fffbe0');
    faceGrad.addColorStop(0.3, '#ffe066');
    faceGrad.addColorStop(0.62, '#f2b400');
    faceGrad.addColorStop(1, '#a8650a');
    tctx.fillStyle = faceGrad;
    tctx.beginPath(); tctx.arc(0, 0, r, 0, Math.PI*2); tctx.fill();

    // Reeded (ridged) coin edge: a dashed ring hugging the rim.
    tctx.save();
    tctx.beginPath(); tctx.arc(0, 0, r - 0.5*s, 0, Math.PI*2); tctx.clip();
    tctx.lineWidth = 2.2*s; tctx.strokeStyle = 'rgba(110,60,0,0.4)';
    tctx.setLineDash([1*s, 1.3*s]);
    tctx.beginPath(); tctx.arc(0, 0, r - 1.1*s, 0, Math.PI*2); tctx.stroke();
    tctx.restore();
    tctx.setLineDash([]);

    // Outer rim line + a bright highlight arc along the top-left.
    tctx.lineWidth = 1.4*s; tctx.strokeStyle = '#6e4200';
    tctx.beginPath(); tctx.arc(0, 0, r, 0, Math.PI*2); tctx.stroke();
    tctx.lineWidth = 1*s; tctx.strokeStyle = 'rgba(255,255,255,0.55)';
    tctx.beginPath(); tctx.arc(0, 0, r - 1.9*s, Math.PI*0.95, Math.PI*1.85); tctx.stroke();

    // Recessed inner plate the symbol is stamped onto - a touch darker than the face, with
    // its own thin light/dark rim so it reads as sunken metal.
    let r2 = r * 0.72;
    let plateGrad = tctx.createRadialGradient(-2*s, -3*s, 0.5*s, 0, 0, r2 * 1.2);
    plateGrad.addColorStop(0, '#e8a800');
    plateGrad.addColorStop(1, '#bd7400');
    tctx.fillStyle = plateGrad;
    tctx.beginPath(); tctx.arc(0, 0, r2, 0, Math.PI*2); tctx.fill();
    tctx.lineWidth = 1*s;
    tctx.strokeStyle = 'rgba(80,45,0,0.55)';
    tctx.beginPath(); tctx.arc(0, 0, r2, Math.PI*1.85, Math.PI*0.95); tctx.stroke();
    tctx.strokeStyle = 'rgba(255,255,255,0.4)';
    tctx.beginPath(); tctx.arc(0, 0, r2, Math.PI*0.95, Math.PI*1.85); tctx.stroke();

    // Stamps drawFn twice - once as a soft dark offset shadow, once as the real bronze fill
    // - so the symbol looks pressed/engraved into the plate instead of pasted flat on top
    // of it.
    function stamp(drawFn) {
        tctx.save();
        tctx.translate(0.5*s, 0.8*s);
        tctx.globalAlpha = 0.4;
        tctx.fillStyle = '#3f2400'; tctx.strokeStyle = '#3f2400';
        drawFn();
        tctx.restore();
        tctx.fillStyle = '#5c3808'; tctx.strokeStyle = '#3f2408';
        drawFn();
    }
    // Highlight color used for shine details drawn after the stamp (no shadow).
    const SHINE = '#fff8d6';

    // Star-path helper some badges (ach_bestiary, ach_wave_large) use for a small emblem -
    // shared here rather than duplicated in each of those files.
    function starPath(r1, rInner, points) {
        tctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            let rad = i % 2 === 0 ? r1 : rInner;
            let a = (Math.PI / points) * i - Math.PI / 2;
            let px = Math.cos(a) * rad, py = Math.sin(a) * rad;
            if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
        }
        tctx.closePath();
    }

    symbolFn(stamp, SHINE, starPath);
};
