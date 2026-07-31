// ==========================================
// BOSS: Lava Worm (Volcano stage boss)
// ==========================================
// Self-contained boss module - see bosses/kingslime.js for the general shape of this
// file.

(function () {
    window.bossDB = window.bossDB || {};
    window.bossSilhouettes = window.bossSilhouettes || {};
    window.enemyDB = window.enemyDB || {};

    // ---- Lava Worm's own copies of the shared attack-projectile helpers ----
    // Every boss needs the same handful of small building blocks (fire a ring of bullets,
    // fire an aimed spread, drop a telegraphed ground AOE) but each boss file keeps its own
    // private copy instead of calling into one shared implementation, so this file has
    // everything it needs on its own and no boss's attacks depend on another boss's code.

    function bossFireRadial(e, count, speed, projRadius) {
        for (let i = 0; i < count; i++) {
            let a = (i / count) * Math.PI * 2 + (e.animTimer || 0) * 0.001;
            projectiles.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, radius: projRadius || 9, bossId: e.bossId });
        }
    }

    function bossTelegraphAoe(e, x, y, radius, delayFrames) {
        bossTelegraphs.push({ x, y, radius, timer: delayFrames, duration: delayFrames, bossId: e.bossId });
    }

    // ---- Lava Worm's attack data (stats + attacks) ----
    window.bossDB.lavaworm = {
        themeIndex: 3, radius: 48, speedMult: 0.55, name: 'Lava Worm',
        bodyColor: '#ff6a2b', darkColor: '#9c2b0e', crownColor: '#ffcf4a',
        attacks: [
            { // Magma Burst - erupting ring of embers
                name: 'Magma Burst', telegraph: 70, duration: 20, cooldown: 160,
                exec: (e) => { playSFX('fire'); bossFireRadial(e, 9, 3.4, 8); screenShake = Math.max(screenShake, 8); }
            },
            { // Burrow Strike - vanishes briefly then erupts under the player with a telegraphed AOE
                name: 'Burrow Strike', telegraph: 80, duration: 25, cooldown: 180,
                exec: (e) => { e.burrowed = true; e.slamTargetX = player.worldX; e.slamTargetY = player.worldY; bossTelegraphAoe(e, e.slamTargetX, e.slamTargetY, 100, 45); },
                tick: (e) => { if (e.stateTimer === 24) { e.x = e.slamTargetX; e.y = e.slamTargetY; e.burrowed = false; screenShake = Math.max(screenShake, 10); playSFX('enemy_hit'); } }
            },
            { // Ember Spray - rotating spiral of embers over a few ticks
                name: 'Ember Spray', telegraph: 60, duration: 40, cooldown: 160,
                exec: (e) => { e._sprayTicks = 5; e._sprayAngle = Math.random() * Math.PI * 2; },
                tick: (e) => { if (e._sprayTicks > 0 && e.stateTimer % 8 === 0) { e._sprayAngle += 0.9; for (let i = 0; i < 3; i++) { let a = e._sprayAngle + i * (Math.PI * 2 / 3); projectiles.push({ x: e.x, y: e.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, radius: 7, bossId: e.bossId }); } e._sprayTicks--; } }
            }
        ]
    };

    // ---- Lava Worm's visual design (silhouette) ----
    window.bossSilhouettes.lavaworm = (ctx, r, def, e) => {
        // Molten rock-worm: shaded/gradient segments with glowing magma seams,
        // a jeweled crown, and a face that reacts to attacking vs. getting hit.
        let t = (e.animTimer || 0);
        let hurting = (e.hitFlash || 0) > 0;
        let telegraphing = e.state === 'telegraph';
        let attacking = e.state === 'attack';
        let aggro = telegraphing || attacking;

        let hot = '#ffd27a';
        let mid = def.bodyColor;
        let rock = def.darkColor;
        let crackGlow = '#fff2b0';
        let rim = 'rgba(35,8,2,0.6)';

        // Trailing rock segments, drawn back-to-front, each with its own
        // gradient shading, a glowing seam, and a small obsidian dorsal spike.
        let segCount = 4;
        let segR = [0.60, 0.50, 0.41, 0.33];
        let segX = [];
        let cx = -r * 0.66;
        for (let i = 0; i < segCount; i++) {
            segX.push(cx);
            if (i < segCount - 1) cx -= (segR[i] + segR[i + 1]) * r * 0.78;
        }
        for (let i = segCount - 1; i >= 0; i--) {
            let sr = segR[i] * r;
            let sx = segX[i];
            let sway = Math.sin(t / 14 - i * 0.9) * r * 0.035;

            let g = ctx.createRadialGradient(sx - sr * 0.3, sway - sr * 0.35, sr * 0.1, sx, sway, sr);
            g.addColorStop(0, mid); g.addColorStop(1, rock);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(sx, sway, sr, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, sr * 0.06); ctx.stroke();

            ctx.strokeStyle = crackGlow;
            ctx.lineWidth = Math.max(1.5, sr * 0.1);
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(sx, sway, sr * 0.66, 0.5, 2.7); ctx.stroke();
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#3a1204';
            ctx.beginPath();
            ctx.moveTo(sx - sr * 0.22, sway - sr * 0.7);
            ctx.lineTo(sx, sway - sr * 1.12);
            ctx.lineTo(sx + sr * 0.22, sway - sr * 0.7);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(255,207,74,0.55)'; ctx.lineWidth = Math.max(0.8, sr * 0.05); ctx.stroke();
        }

        // Head, with a soft highlight/shadow gradient and a glowing crack.
        let hr = r * 0.8;
        let hg = ctx.createRadialGradient(-hr * 0.25, -hr * 0.35, hr * 0.15, 0, 0, hr * 1.05);
        hg.addColorStop(0, hot); hg.addColorStop(0.55, mid); hg.addColorStop(1, rock);
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.ellipse(0, 0, hr, hr * 0.86, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rim; ctx.lineWidth = hr * 0.035; ctx.stroke();

        ctx.save();
        ctx.shadowColor = crackGlow; ctx.shadowBlur = hr * 0.15;
        ctx.strokeStyle = crackGlow;
        ctx.lineWidth = hr * 0.06;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(-hr * 0.52, hr * 0.12); ctx.lineTo(-hr * 0.18, -hr * 0.14);
        ctx.lineTo(hr * 0.02, hr * 0.04); ctx.lineTo(hr * 0.4, -hr * 0.32);
        ctx.stroke();
        ctx.restore();

        // Jeweled molten crown.
        ctx.save();
        ctx.shadowColor = 'rgba(255,170,50,0.9)'; ctx.shadowBlur = hr * 0.32;
        let cBaseY = -hr * 0.6;
        ctx.fillStyle = def.crownColor;
        ctx.beginPath();
        ctx.moveTo(-hr * 0.48, cBaseY);
        ctx.lineTo(-hr * 0.42, cBaseY - hr * 0.36);
        ctx.lineTo(-hr * 0.22, cBaseY - hr * 0.08);
        ctx.lineTo(-hr * 0.13, cBaseY - hr * 0.58);
        ctx.lineTo(0, cBaseY - hr * 0.1);
        ctx.lineTo(hr * 0.13, cBaseY - hr * 0.58);
        ctx.lineTo(hr * 0.22, cBaseY - hr * 0.08);
        ctx.lineTo(hr * 0.42, cBaseY - hr * 0.36);
        ctx.lineTo(hr * 0.48, cBaseY);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6b3a08'; ctx.lineWidth = hr * 0.04; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#c98a1f';
        ctx.fillRect(-hr * 0.48, cBaseY - hr * 0.02, hr * 0.96, hr * 0.15);
        ctx.strokeStyle = '#6b3a08'; ctx.lineWidth = hr * 0.025;
        ctx.strokeRect(-hr * 0.48, cBaseY - hr * 0.02, hr * 0.96, hr * 0.15);
        ctx.shadowColor = 'rgba(255,60,30,0.9)'; ctx.shadowBlur = hr * 0.2;
        ctx.fillStyle = '#ff3b30';
        ctx.beginPath(); ctx.arc(0, cBaseY + hr * 0.05, hr * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.arc(-hr * 0.3, cBaseY + hr * 0.05, hr * 0.045, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(hr * 0.3, cBaseY + hr * 0.05, hr * 0.045, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Face: expression swaps between a content idle look, an angry
        // roar while telegraphing/attacking, and a wince right after being hit.
        let eyeY = -hr * 0.06;
        let eyeXOff = hr * 0.32;
        let mouthY = hr * 0.4;

        if (hurting) {
            ctx.strokeStyle = rock; ctx.lineWidth = hr * 0.055; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-eyeXOff - hr * 0.14, eyeY - hr * 0.16); ctx.lineTo(-eyeXOff + hr * 0.1, eyeY - hr * 0.27); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(eyeXOff + hr * 0.14, eyeY - hr * 0.16); ctx.lineTo(eyeXOff - hr * 0.1, eyeY - hr * 0.27); ctx.stroke();
            [-eyeXOff, eyeXOff].forEach(ex => {
                ctx.beginPath(); ctx.moveTo(ex - hr * 0.14, eyeY + hr * 0.04);
                ctx.quadraticCurveTo(ex, eyeY - hr * 0.1, ex + hr * 0.14, eyeY + hr * 0.04);
                ctx.stroke();
            });
            ctx.fillStyle = '#5a1206';
            ctx.beginPath(); ctx.ellipse(0, mouthY - hr * 0.02, hr * 0.1, hr * 0.13, 0, 0, Math.PI * 2); ctx.fill();
        } else if (aggro) {
            ctx.fillStyle = '#2a0a02';
            ctx.beginPath();
            ctx.moveTo(-eyeXOff - hr * 0.2, eyeY - hr * 0.24); ctx.lineTo(-eyeXOff + hr * 0.17, eyeY - hr * 0.03); ctx.lineTo(-eyeXOff - hr * 0.17, eyeY - hr * 0.01);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(eyeXOff + hr * 0.2, eyeY - hr * 0.24); ctx.lineTo(eyeXOff - hr * 0.17, eyeY - hr * 0.03); ctx.lineTo(eyeXOff + hr * 0.17, eyeY - hr * 0.01);
            ctx.closePath(); ctx.fill();
            [-eyeXOff, eyeXOff].forEach(ex => {
                ctx.save();
                ctx.shadowColor = '#fff6d8'; ctx.shadowBlur = hr * 0.14;
                ctx.fillStyle = '#fff6d8';
                ctx.beginPath(); ctx.ellipse(ex, eyeY + hr * 0.03, hr * 0.14, hr * 0.065, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                ctx.fillStyle = '#2a0902';
                ctx.beginPath(); ctx.ellipse(ex, eyeY + hr * 0.03, hr * 0.055, hr * 0.055, 0, 0, Math.PI * 2); ctx.fill();
            });
            let openAmt = telegraphing ? 0.5 : 1;
            ctx.save();
            ctx.translate(0, mouthY);
            ctx.scale(1, Math.max(0.25, openAmt));
            let mg = ctx.createRadialGradient(0, 0, hr * 0.02, 0, 0, hr * 0.32);
            mg.addColorStop(0, '#fff6c9'); mg.addColorStop(0.5, '#ff9a2e'); mg.addColorStop(1, '#7a1c04');
            ctx.fillStyle = mg;
            ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.3, hr * 0.26, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff8e6';
            for (let i = -1; i <= 1; i += 2) {
                ctx.beginPath(); ctx.moveTo(i * hr * 0.18, -hr * 0.2); ctx.lineTo(i * hr * 0.1, -hr * 0.06); ctx.lineTo(i * hr * 0.24, -hr * 0.06); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(i * hr * 0.18, hr * 0.2); ctx.lineTo(i * hr * 0.1, hr * 0.06); ctx.lineTo(i * hr * 0.24, hr * 0.06); ctx.closePath(); ctx.fill();
            }
            ctx.restore();

            if (attacking) {
                for (let i = 0; i < 4; i++) {
                    let a = -0.9 + i * 0.6 + Math.sin(t * 0.3 + i) * 0.15;
                    let d = hr * (0.4 + 0.12 * ((t + i * 7) % 6));
                    ctx.globalAlpha = 0.7 - (d / (hr * 1.1));
                    ctx.fillStyle = i % 2 === 0 ? hot : crackGlow;
                    ctx.beginPath(); ctx.arc(Math.cos(a) * d, mouthY + Math.sin(a) * d * 0.4, hr * 0.03, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        } else {
            let blinkPhase = t % 180;
            let blink = blinkPhase < 6 ? 0.12 : 1;
            [-eyeXOff, eyeXOff].forEach(ex => {
                ctx.save();
                ctx.translate(ex, eyeY);
                ctx.scale(1, blink);
                ctx.fillStyle = '#2a0902';
                ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.16, hr * 0.16, 0, 0, Math.PI * 2); ctx.fill();
                ctx.save();
                ctx.shadowColor = hot; ctx.shadowBlur = hr * 0.12;
                ctx.fillStyle = hot;
                ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.08, hr * 0.08, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                ctx.restore();
            });
            ctx.strokeStyle = rock; ctx.lineWidth = hr * 0.05; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-hr * 0.16, mouthY); ctx.quadraticCurveTo(0, mouthY + hr * 0.06, hr * 0.16, mouthY); ctx.stroke();

            let emberCount = 3;
            for (let i = 0; i < emberCount; i++) {
                let seed = i * 47.3;
                let phase = ((t * 0.9 + seed * 10) % 90) / 90;
                let ex2 = Math.sin(seed) * hr * 0.55;
                let ey2 = hr * 0.35 - phase * hr * 1.5;
                let ealpha = (1 - phase) * 0.75;
                let esize = hr * (0.03 + 0.015 * Math.sin(seed + t * 0.1));
                ctx.globalAlpha = ealpha;
                ctx.fillStyle = i % 2 === 0 ? hot : crackGlow;
                ctx.beginPath(); ctx.arc(ex2, ey2, esize, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    };

    // ---- Lava Worm's bestiary entry ----
    window.enemyDB.boss_lavaworm = { name: 'Lava Worm', desc: 'Burrows through molten rock, erupting in showers of magma. 3 hits to topple.' };
})();
