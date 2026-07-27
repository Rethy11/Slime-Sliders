// Item icon: Skeleton Key
window.IconSprites = window.IconSprites || {};
window.IconSprites['skeletonkey'] = function(tctx, s) {
    // Bone-white key with a tiny skull worked into the bow, teeth notched like a classic
    // old-fashioned key rather than a modern flat one.
    tctx.strokeStyle = '#f4f1de'; tctx.fillStyle = '#f4f1de'; tctx.lineWidth = 2.4*s; tctx.lineCap = 'round';
    tctx.beginPath(); tctx.moveTo(-3*s,-3*s); tctx.lineTo(7*s,7*s); tctx.stroke();
    tctx.fillRect(3.5*s, 5*s, 2.6*s, 2.6*s); tctx.fillRect(6*s, 2.5*s, 2.6*s, 2.6*s);
    tctx.beginPath(); tctx.arc(-6*s,-6*s,5*s,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = '#2b2b2b';
    tctx.beginPath(); tctx.arc(-7.6*s,-6.6*s,1.1*s,0,Math.PI*2); tctx.fill();
    tctx.beginPath(); tctx.arc(-4.6*s,-6.6*s,1.1*s,0,Math.PI*2); tctx.fill();
    tctx.fillRect(-6.6*s, -4.6*s, 1.2*s, 1.6*s);
    tctx.strokeStyle = '#8b8b7a'; tctx.lineWidth = 0.8*s; tctx.beginPath(); tctx.arc(-6*s,-6*s,5*s,0,Math.PI*2); tctx.stroke();
};
