// Glitch rare skin — ambient/background stage effect (full-screen TV static) plus every
// static reskin this skin applies to the world (trees, rocks, coins, fences, hazard
// tiles, decorations). Nothing in this file is triggered by touching/bumping an object -
// it's all a constant cosmetic override applied uniformly while the skin is equipped.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.glitch = (function () {

    // Full-screen old-TV static, screen-fixed (not world space) since it's meant to read as
    // a broken signal rather than part of the level. Cheap chunky cells since the whole
    // frame gets downsampled through the pixelation pass anyway.
    function drawTVStatic(ctx, canvas) {
        ctx.save();
        let cell = 14;
        for (let x = 0; x < canvas.width; x += cell) {
            for (let y = 0; y < canvas.height; y += cell) {
                let v = Math.random();
                ctx.fillStyle = v > 0.7 ? '#f2f2f2' : (v > 0.4 ? '#888' : (v > 0.15 ? '#333' : '#000'));
                ctx.fillRect(x, y, cell, cell);
            }
        }
        // Occasional bright horizontal sync-roll bar tearing across the static.
        if (Math.random() < 0.06) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 6 + Math.random()*14);
        }
        ctx.restore();
    }

    // Hazard pockets turn solid black with a green matrix-digit edge - drawMatrixRain fills
    // them with scrolling digit rain instead of the usual texture.
    function getHazardTheme(baseHazardType) {
        return { type: baseHazardType, color: '#000000', edge: '#00ff41' };
    }
    function drawMatrixRain(ctx, cx, cy, span) {
        ctx.save();
        ctx.fillStyle = '#00ff41'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        for (let x = cx - span; x < cx + span; x += 11) {
            let colSeed = Math.abs(Math.sin(x * 0.17)) % 1;
            let speed = 40 + colSeed * 70;
            let offset = (Date.now()/1000 * speed + colSeed*400) % (span * 2.6);
            for (let k = -1; k <= 4; k++) {
                let y = cy - span + offset + k * 13;
                if (y < cy - span || y > cy + span) continue;
                ctx.globalAlpha = k === 0 ? 1 : Math.max(0, 0.85 - k*0.22);
                ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
            }
        }
        ctx.restore();
    }

    // Every tree renders as this "broken image" placeholder instead of its usual art - a
    // bright pink box with a torn corner and the classic broken-picture glyph.
    function drawMissingImageBox(ctx, x, y, radius) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(x, y + radius*0.5, radius*0.85, radius*0.38, 0, 0, Math.PI*2); ctx.fill();
        let w = radius * 1.7, h = radius * 1.7;
        ctx.translate(x, y - h*0.15);
        ctx.fillStyle = '#ff2fb2'; ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = '#7a0d51'; ctx.lineWidth = 3; ctx.strokeRect(-w/2, -h/2, w, h);
        // Torn top-right corner
        ctx.fillStyle = '#ffe0f5';
        ctx.beginPath(); ctx.moveTo(w/2 - w*0.28, -h/2); ctx.lineTo(w/2, -h/2); ctx.lineTo(w/2, -h/2 + h*0.28); ctx.closePath(); ctx.fill();
        // Classic broken-picture glyph: little "sun" + jagged "mountains"
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-w*0.18, -h*0.18, w*0.09, 0, Math.PI*2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w*0.32, h*0.22); ctx.lineTo(-w*0.08, -h*0.05); ctx.lineTo(w*0.08, h*0.1); ctx.lineTo(w*0.3, -h*0.18); ctx.lineTo(w*0.32, h*0.22);
        ctx.closePath(); ctx.fill();
        // Crack through the glyph
        ctx.strokeStyle = '#7a0d51'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-w*0.1, -h*0.35); ctx.lineTo(w*0.05, -h*0.05); ctx.lineTo(-w*0.05, h*0.1); ctx.lineTo(w*0.12, h*0.4); ctx.stroke();
        ctx.restore();
    }

    // Every rock renders as a garish pop-up ad box instead of its usual art, with a
    // cycling flashy border, an "AD" badge, a red close button, and fake headline bars.
    function drawPopupAdBox(ctx, x, y, radius) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + radius*0.55, radius*0.95, radius*0.4, 0, 0, Math.PI*2); ctx.fill();
        let w = radius * 2.2, h = radius * 1.5;
        ctx.translate(x, y - radius*0.25);
        const flashColors = ['#ff003c', '#ffee00', '#00e5ff', '#39ff14'];
        ctx.fillStyle = '#f4f6ff'; ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = flashColors[Math.floor(Date.now()/150) % flashColors.length]; ctx.lineWidth = 4; ctx.strokeRect(-w/2, -h/2, w, h);
        // "AD" badge, top-left
        ctx.fillStyle = '#ffcc00'; ctx.fillRect(-w/2 + 2, -h/2 + 2, w*0.22, h*0.24);
        ctx.fillStyle = '#3d2b00'; ctx.font = `bold ${Math.max(8, h*0.16)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AD', -w/2 + 2 + w*0.11, -h/2 + 2 + h*0.13);
        // Red circular close button, top-right
        ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(w/2 - h*0.14, -h/2 + h*0.14, h*0.13, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w/2 - h*0.2, -h/2 + h*0.08); ctx.lineTo(w/2 - h*0.08, -h/2 + h*0.2);
        ctx.moveTo(w/2 - h*0.08, -h/2 + h*0.08); ctx.lineTo(w/2 - h*0.2, -h/2 + h*0.2); ctx.stroke();
        // Garish fake headline/body bars
        ctx.fillStyle = '#e63946'; ctx.fillRect(-w*0.4, -h*0.05, w*0.8, h*0.12);
        ctx.fillStyle = '#457b9d'; ctx.fillRect(-w*0.4, h*0.14, w*0.55, h*0.1);
        ctx.restore();
    }

    // Every coin/gem renders as a spinning rainbow "wheel of death" (the classic OS
    // beachball/busy-spinner) instead of its usual loot-sprite art, all the time.
    function drawRainbowWheelOfDeath(ctx, x, y, radius) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(x, y + radius*0.6, radius*0.8, radius*0.32, 0, 0, Math.PI*2); ctx.fill();
        let segs = 8;
        let spin = (Date.now() / 220) % (Math.PI * 2);
        ctx.translate(x, y); ctx.rotate(spin);
        for (let i = 0; i < segs; i++) {
            let a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
            ctx.fillStyle = `hsl(${Math.round((i / segs) * 360)}, 90%, 55%)`;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, a0, a1); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, radius * 0.2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    // Every fence renders as a blazing brick "firewall" instead of the usual post-and-rail
    // art - hazard stripes along the top, flame licks, and a warning label on segments
    // long enough to fit one (playing on both senses of "firewall").
    function drawFirewallSegment(ctx, f) {
        let angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
        let len = Math.hypot(f.x2 - f.x1, f.y2 - f.y1);
        ctx.save(); ctx.translate(f.midX, f.midY); ctx.rotate(angle);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-len/2, 8, len, 5);
        // Brick wall body
        let brickGrad = ctx.createLinearGradient(0, -16, 0, 10);
        brickGrad.addColorStop(0, '#7a2a12'); brickGrad.addColorStop(1, '#3d1408');
        ctx.fillStyle = brickGrad; ctx.fillRect(-len/2, -16, len, 26);
        // Hazard stripes along the top edge
        ctx.save(); ctx.beginPath(); ctx.rect(-len/2, -16, len, 6); ctx.clip();
        for (let sx = -len/2 - 10; sx < len/2 + 10; sx += 12) {
            ctx.fillStyle = (Math.floor((sx + len/2) / 12) % 2 === 0) ? '#ffcc00' : '#1a1a1a';
            ctx.beginPath(); ctx.moveTo(sx, -16); ctx.lineTo(sx + 6, -16); ctx.lineTo(sx - 4, 10); ctx.lineTo(sx - 10, 10); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // Flame licks along the top edge
        let t = Date.now() / 150;
        for (let fx = -len/2 + 6; fx < len/2 - 4; fx += 10) {
            let flick = Math.sin(t + fx) * 3;
            let fh = 10 + Math.abs(Math.sin(t * 1.3 + fx * 0.7)) * 8;
            let flameGrad = ctx.createLinearGradient(fx, -16, fx, -16 - fh);
            flameGrad.addColorStop(0, '#ff7a00'); flameGrad.addColorStop(0.6, '#ffcf33'); flameGrad.addColorStop(1, 'rgba(255,240,150,0)');
            ctx.fillStyle = flameGrad;
            ctx.beginPath(); ctx.moveTo(fx - 3, -16); ctx.quadraticCurveTo(fx + flick, -16 - fh*0.6, fx, -16 - fh); ctx.quadraticCurveTo(fx - flick, -16 - fh*0.6, fx + 3, -16); ctx.closePath(); ctx.fill();
        }
        // Mortar lines and outline
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
        for (let by = -12; by < 10; by += 7) { ctx.beginPath(); ctx.moveTo(-len/2, by); ctx.lineTo(len/2, by); ctx.stroke(); }
        ctx.strokeStyle = '#ff4500'; ctx.lineWidth = 2; ctx.strokeRect(-len/2, -16, len, 26);
        if (len > 46) { ctx.fillStyle = '#ffcf33'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FIREWALL', 0, -2); }
        ctx.restore();
    }

    // Every grass/flower/leaf speck (normally a 3-8px dot/blade/curl) renders at roughly 4x
    // that size as a small annoying pop-up glyph instead - a mini ad window with titlebar
    // dots and fake body text, a mini gradient-filled warning-triangle alert, or a mini
    // chat/notification bubble with an unread badge, cycled by speck type (d.type 0/1/2,
    // same as the normal-skin foliage variants).
    function drawGlitchPopupDecor(ctx, d, breezeX) {
        if (d.type === 0) {
            let w = 32, h = 26;
            ctx.save(); ctx.translate(d.x, d.y - 6);
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-w/2 + 2, -h/2 + 3, w, h);
            ctx.fillStyle = '#f4f6fb'; ctx.fillRect(-w/2, -h/2, w, h);
            ctx.fillStyle = d.color; ctx.fillRect(-w/2, -h/2, w, h * 0.3);
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-w/2 + 5 + i * 6, -h/2 + h*0.15, 1.5, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(-w/2 + 3, -h*0.05, w * 0.6, 3);
            ctx.fillRect(-w/2 + 3, h*0.12, w * 0.4, 3);
            ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(w/2 - 5, -h/2 + 5, 4, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(w/2 - 7, -h/2 + 3); ctx.lineTo(w/2 - 3, -h/2 + 7);
            ctx.moveTo(w/2 - 3, -h/2 + 3); ctx.lineTo(w/2 - 7, -h/2 + 7); ctx.stroke();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(-w/2, -h/2, w, h);
            ctx.restore();
        } else if (d.type === 1) {
            let size = 30, bx = breezeX * 6;
            ctx.save(); ctx.translate(d.x + bx, d.y);
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath(); ctx.moveTo(2, -size + 3); ctx.lineTo(-size*0.42 + 2, 3); ctx.lineTo(size*0.42 + 2, 3); ctx.closePath(); ctx.fill();
            let grad = ctx.createLinearGradient(0, -size, 0, 0);
            grad.addColorStop(0, '#ffe066'); grad.addColorStop(1, d.color);
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(-size*0.42, 0); ctx.lineTo(size*0.42, 0); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#3d2b00'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#1a1200'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('!', 0, -size*0.36);
            ctx.restore();
        } else {
            let w = 26, h = 16, bx = breezeX * 10;
            ctx.save(); ctx.translate(d.x + bx, d.y - 10);
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.beginPath(); ctx.roundRect(-w/2 + 1, -h/2 + 2, w, h, 5); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w, h, 5); ctx.fill();
            ctx.strokeStyle = d.color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w, h, 5); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-4, h/2 - 1); ctx.lineTo(-8, h/2 + 5); ctx.lineTo(0, h/2 - 1); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = d.color; ctx.beginPath(); ctx.moveTo(-4, h/2 - 1); ctx.lineTo(-8, h/2 + 5); ctx.stroke();
            ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(-w/2 + 4, -1); ctx.lineTo(w/2 - 4, -1); ctx.stroke();
            ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(w/2 - 2, -h/2 - 1, 4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 6px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', w/2 - 2, -h/2 - 1);
            ctx.restore();
        }
    }

    return {
        drawTVStatic, getHazardTheme, drawMatrixRain, drawMissingImageBox, drawPopupAdBox,
        drawRainbowWheelOfDeath, drawFirewallSegment, drawGlitchPopupDecor
    };
})();
