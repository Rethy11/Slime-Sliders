// ==========================================
// BOSS: Yeti (Snow stage boss)
// ==========================================
// Self-contained boss module - see bosses/kingslime.js for the general shape of this
// file. Yeti's Avalanche Charge attack drops stationary ice blocks (pushed straight onto
// the shared global `iceBlocks` array) that explode when touched by the player or almost
// anything else in the game - that explosion mechanic is shared engine infrastructure
// (many different systems can pop a block), so it stays in index.html rather than here;
// this file only owns the attack that creates the blocks in the first place.

(function () {
    window.bossDB = window.bossDB || {};
    window.bossSilhouettes = window.bossSilhouettes || {};
    window.enemyDB = window.enemyDB || {};

    // ---- Yeti's own copies of the shared attack-projectile helpers ----
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

    function bossFireAimedSpread(e, count, spreadRad, speed, projRadius) {
        let base = Math.atan2(player.worldY - e.y, player.worldX - e.x);
        for (let i = 0; i < count; i++) {
            let t = count === 1 ? 0 : (i / (count - 1)) - 0.5;
            let a = base + t * spreadRad;
            projectiles.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, radius: projRadius || 9, bossId: e.bossId });
        }
    }

    function bossTelegraphAoe(e, x, y, radius, delayFrames) {
        bossTelegraphs.push({ x, y, radius, timer: delayFrames, duration: delayFrames, bossId: e.bossId });
    }

    // ---- Yeti's attack data (stats + attacks) ----
    window.bossDB.yeti = {
        themeIndex: 2, radius: 44, speedMult: 0.7, name: 'Yeti',
        bodyColor: '#eef7fb', darkColor: '#a9c9d6', crownColor: '#4fa3c7',
        attacks: [
            { // Ice Slam - telegraphed ground AOE plus an outward ring of icicle shards
                name: 'Ice Slam', telegraph: 70, duration: 20, cooldown: 160,
                exec: (e) => { bossTelegraphAoe(e, e.x, e.y, 110, 30); bossFireRadial(e, 8, 3, 7); playSFX('ice_nova'); }
            },
            { // Frost Breath - slow-moving cone of projectiles toward the player
                name: 'Frost Breath', telegraph: 60, duration: 45, cooldown: 170,
                exec: (e) => { e._breathTicks = 6; },
                tick: (e) => { if (e._breathTicks > 0 && e.stateTimer % 8 === 0) { bossFireAimedSpread(e, 2, 0.35, 2.6, 8); e._breathTicks--; } }
            },
            { // Avalanche Charge - charges across the map leaving a trail of stationary
              // ice blocks behind it. Each block sits harmlessly until the player
              // touches it, then explodes into an outward ring of bullets (see the
              // iceBlocks handling in update()).
                name: 'Avalanche Charge', telegraph: 65, duration: 60, cooldown: 170, dash: true,
                exec: (e) => { playSFX('bull_charge'); },
                tick: (e) => { e.x += Math.cos(e.chargeAngle) * e.speed * 2.4; e.y += Math.sin(e.chargeAngle) * e.speed * 2.4; if (e.stateTimer % 12 === 0) iceBlocks.push({ x: e.x, y: e.y, radius: 14, bossId: e.bossId }); }
            }
        ]
    };

    // ---- Yeti's visual design (silhouette) ----
    window.bossSilhouettes.yeti = (ctx, r, def, e) => {
        // Same expression pattern as kingslime: hurt beats whatever it was doing, then
        // its own windup/attack frames (the attack sub-expression varies by which of
        // its three attacks is actually playing - see bossDB.yeti.attacks), then a
        // calm idle default.
        let hurt = (e.hitFlash || 0) > 0;
        let winding = e.state === 'telegraph';
        let attacking = e.state === 'attack';
        let atkName = (attacking && e.currentAttack) ? e.currentAttack.name : null;
        let breathing = atkName === 'Frost Breath';
        let weary = !hurt && !winding && !attacking && e.hp === 1;
        let blink = !hurt && !winding && !attacking && (((e.animTimer || 0) % 170) > 161);

        // Paws swing with the pose: gathered up on the windup, driven down/out on the swing.
        let pawY = r * 0.16, pawSpread = 1.0;
        if (winding) { pawY = -r * 0.06; pawSpread = 0.9; }
        else if (attacking) { pawY = breathing ? r * 0.14 : r * 0.34; pawSpread = breathing ? 1.0 : 1.1; }
        else if (hurt) { pawY = r * 0.2; pawSpread = 1.05; }

        let wob = Math.sin((e.animTimer || 0) / 16) * r * 0.015;

        // ---- Torso: gradient-shaded for volume instead of a flat fill. ----
        ctx.beginPath(); ctx.ellipse(0, r * 0.1 + wob * 0.3, r * 0.94, r * 0.84, 0, 0, Math.PI * 2);
        let bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.34, r * 0.08, -r * 0.04, r * 0.06, r * 1.2);
        bodyGrad.addColorStop(0, '#ffffff'); bodyGrad.addColorStop(0.38, def.bodyColor); bodyGrad.addColorStop(1, def.darkColor);
        ctx.fillStyle = bodyGrad; ctx.fill();
        ctx.lineWidth = Math.max(1.5, r * 0.04); ctx.strokeStyle = def.darkColor; ctx.stroke();

        // Stubby feet shading, low on the body.
        ctx.fillStyle = 'rgba(0,0,0,0.13)';
        [-0.36, 0.36].forEach(fx => { ctx.beginPath(); ctx.ellipse(r * fx, r * 0.72, r * 0.26, r * 0.16, 0, 0, Math.PI * 2); ctx.fill(); });

        // ---- Paws: chunky mitten shapes that poke past the torso silhouette, with a
        // cuff and claws, and shift pose with the attack state above. ----
        [-1, 1].forEach(s => {
            let px = s * r * 0.92 * pawSpread, py = pawY;
            ctx.fillStyle = def.bodyColor;
            ctx.beginPath(); ctx.ellipse(px, py, r * 0.24, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = def.darkColor;
            ctx.beginPath(); ctx.ellipse(px, py - r * 0.14, r * 0.22, r * 0.09, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#6f8f9e'; ctx.lineWidth = Math.max(1.2, r * 0.025); ctx.lineCap = 'round';
            [-1, 0, 1].forEach(c => { ctx.beginPath(); ctx.moveTo(px + c * r * 0.08, py + r * 0.2); ctx.lineTo(px + c * r * 0.08, py + r * 0.32); ctx.stroke(); });
        });

        // ---- Shaggy fur collar framing the sides of the head/shoulders, left clear on
        // top for the crown: layered shadow + highlight tufts. ----
        let tufts = [[-0.88, -0.05, 0.19], [-0.9, -0.28, 0.2], [-0.82, -0.5, 0.2], [-0.6, -0.66, 0.19],
                     [0.88, -0.05, 0.19], [0.9, -0.28, 0.2], [0.82, -0.5, 0.2], [0.6, -0.66, 0.19]];
        tufts.forEach(t => { ctx.fillStyle = def.darkColor; ctx.beginPath(); ctx.arc(r * t[0] + r * 0.02, r * t[1] + r * 0.03, r * t[2] * 1.05, 0, Math.PI * 2); ctx.fill(); });
        tufts.forEach(t => { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(r * t[0], r * t[1], r * t[2], 0, Math.PI * 2); ctx.fill(); });

        // Muzzle patch.
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.ellipse(0, r * 0.24, r * 0.36, r * 0.24, 0, 0, Math.PI * 2); ctx.fill();

        // Blush.
        ctx.fillStyle = 'rgba(255,110,140,0.22)';
        [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * r * 0.56, r * 0.14, r * 0.12, r * 0.07, 0, 0, Math.PI * 2); ctx.fill(); });

        // ---- Crown: same proven zigzag as kingslime's (keeps the tip clear of the HP
        // pips through the attack-pose stretch), re-themed to icicle points with
        // ice-crystal gems instead of gold and rubies. ----
        ctx.fillStyle = '#bfe9ff';
        ctx.fillRect(-r * 0.5, -r * 0.6, r * 1.0, r * 0.08);
        let crownGrad = ctx.createLinearGradient(-r * 0.5, -r * 1.3, r * 0.5, -r * 0.55);
        crownGrad.addColorStop(0, '#ffffff'); crownGrad.addColorStop(0.5, def.crownColor); crownGrad.addColorStop(1, '#4a7f9e');
        ctx.fillStyle = crownGrad;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.62); ctx.lineTo(r * 0.5, -r * 0.62);
        ctx.lineTo(r * 0.62, -r * 1.02); ctx.lineTo(r * 0.24, -r * 0.78);
        ctx.lineTo(0, -r * 1.3); ctx.lineTo(-r * 0.24, -r * 0.78);
        ctx.lineTo(-r * 0.62, -r * 1.02);
        ctx.closePath(); ctx.lineJoin = 'round'; ctx.fill();
        ctx.lineWidth = Math.max(1.5, r * 0.035); ctx.strokeStyle = '#4a7f9e'; ctx.stroke();
        ctx.fillStyle = '#dff3ff';
        ctx.fillRect(-r * 0.5, -r * 0.68, r * 1.0, r * 0.12);
        ctx.strokeRect(-r * 0.5, -r * 0.68, r * 1.0, r * 0.12);
        ctx.fillStyle = '#bdeeff'; ctx.strokeStyle = '#7fc9ea'; ctx.lineWidth = Math.max(1, r * 0.02);
        ctx.beginPath(); ctx.moveTo(0, -r * 1.24); ctx.lineTo(r * 0.075, -r * 1.16); ctx.lineTo(0, -r * 1.08); ctx.lineTo(-r * 0.075, -r * 1.16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7fd0ff';
        [-1, 1].forEach(s => {
            let cx = s * r * 0.62, cy = -r * 0.95;
            ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.05); ctx.lineTo(cx + r * 0.045, cy); ctx.lineTo(cx, cy + r * 0.05); ctx.lineTo(cx - r * 0.045, cy); ctx.closePath(); ctx.fill();
        });
        if (Math.sin((e.animTimer || 0) / 16) > 0.75) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(-r * 0.03, -r * 1.22, r * 0.025, 0, Math.PI * 2); ctx.fill();
        }

        // ---- Face. ----
        let eyeY = -r * 0.12, eyeDX = r * 0.32;
        if (hurt) {
            // Dazed: scrunched X eyes, a small wobbly mouth, a couple of jarred-loose ice chips.
            ctx.strokeStyle = '#123a48'; ctx.lineWidth = Math.max(2, r * 0.055); ctx.lineCap = 'round';
            [-1, 1].forEach(s => {
                let ex = s * eyeDX;
                ctx.beginPath(); ctx.moveTo(ex - r * 0.11, eyeY - r * 0.11); ctx.lineTo(ex + r * 0.11, eyeY + r * 0.11); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ex + r * 0.11, eyeY - r * 0.11); ctx.lineTo(ex - r * 0.11, eyeY + r * 0.11); ctx.stroke();
            });
            ctx.fillStyle = '#2a5064';
            ctx.beginPath(); ctx.ellipse(0, r * 0.28, r * 0.08, r * 0.1, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(190,235,255,0.9)'; ctx.lineWidth = Math.max(1.2, r * 0.03); ctx.lineCap = 'round';
            [[r * 0.6, -r * 0.35], [-r * 0.62, -r * 0.15]].forEach(p => {
                ctx.beginPath(); ctx.moveTo(p[0] - r * 0.045, p[1]); ctx.lineTo(p[0] + r * 0.045, p[1]); ctx.moveTo(p[0], p[1] - r * 0.045); ctx.lineTo(p[0], p[1] + r * 0.045); ctx.stroke();
            });
        } else if (attacking) {
            // Mid-attack: sharp brows and narrowed eyes always; the mouth differs by
            // which attack is actually playing.
            ctx.fillStyle = '#123a48';
            ctx.beginPath(); ctx.ellipse(-eyeDX, eyeY, r * 0.095, r * 0.05, 0, 0, Math.PI * 2); ctx.ellipse(eyeDX, eyeY, r * 0.095, r * 0.05, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#f4fbff'; ctx.lineWidth = Math.max(2, r * 0.065); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.17, eyeY - r * 0.2); ctx.lineTo(-eyeDX + r * 0.12, eyeY - r * 0.09); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(eyeDX + r * 0.17, eyeY - r * 0.2); ctx.lineTo(eyeDX - r * 0.12, eyeY - r * 0.09); ctx.stroke();
            if (breathing) {
                // Frost Breath: a rounder exhale, with a little cloud of mist drifting off it.
                ctx.fillStyle = '#2a5064';
                ctx.beginPath(); ctx.ellipse(0, r * 0.34, r * 0.14, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
                let mt = (e.animTimer || 0) / 10;
                ctx.fillStyle = 'rgba(220,245,255,0.55)';
                [0, 1, 2].forEach(i => {
                    let p = ((mt + i * 6) % 18) / 18;
                    ctx.beginPath(); ctx.arc(0, r * 0.5 + p * r * 0.5, r * (0.08 + p * 0.1), 0, Math.PI * 2); ctx.fill();
                });
            } else {
                // Ice Slam / Avalanche Charge: full roar, bared tusks.
                ctx.fillStyle = '#2a5064';
                ctx.beginPath(); ctx.ellipse(0, r * 0.32, r * 0.24, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f4fbff';
                [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * r * 0.16, r * 0.15); ctx.lineTo(s * r * 0.06, r * 0.36); ctx.lineTo(s * r * 0.24, r * 0.24); ctx.closePath(); ctx.fill(); });
            }
        } else if (winding) {
            // Winding up: narrowed, gritted, readying whichever attack comes next.
            ctx.fillStyle = '#123a48';
            ctx.beginPath(); ctx.ellipse(-eyeDX, eyeY, r * 0.1, r * 0.04, 0, 0, Math.PI * 2); ctx.ellipse(eyeDX, eyeY, r * 0.1, r * 0.04, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#f4fbff'; ctx.lineWidth = Math.max(2, r * 0.055); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.15, eyeY - r * 0.15); ctx.lineTo(-eyeDX + r * 0.1, eyeY - r * 0.06); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(eyeDX + r * 0.15, eyeY - r * 0.15); ctx.lineTo(eyeDX - r * 0.1, eyeY - r * 0.06); ctx.stroke();
            ctx.strokeStyle = '#2a5064'; ctx.lineWidth = Math.max(2, r * 0.04);
            ctx.beginPath(); ctx.moveTo(-r * 0.14, r * 0.3); ctx.lineTo(r * 0.14, r * 0.3); ctx.stroke();
        } else {
            // Calm default: round content eyes with a highlight, tusks, and a gentle
            // smile, with an occasional blink; droops when down to its last hit.
            if (blink) {
                ctx.strokeStyle = '#123a48'; ctx.lineWidth = Math.max(2, r * 0.04); ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.1, eyeY); ctx.lineTo(-eyeDX + r * 0.1, eyeY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(eyeDX - r * 0.1, eyeY); ctx.lineTo(eyeDX + r * 0.1, eyeY); ctx.stroke();
            } else if (weary) {
                ctx.fillStyle = '#123a48';
                ctx.beginPath(); ctx.arc(-eyeDX, eyeY, r * 0.11, 0, Math.PI * 2); ctx.arc(eyeDX, eyeY, r * 0.11, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = def.bodyColor;
                ctx.beginPath(); ctx.rect(-eyeDX - r * 0.13, eyeY - r * 0.16, r * 0.26, r * 0.1); ctx.rect(eyeDX - r * 0.13, eyeY - r * 0.16, r * 0.26, r * 0.1); ctx.fill();
            } else {
                ctx.fillStyle = '#123a48';
                ctx.beginPath(); ctx.arc(-eyeDX, eyeY, r * 0.11, 0, Math.PI * 2); ctx.arc(eyeDX, eyeY, r * 0.11, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(-eyeDX + r * 0.035, eyeY - r * 0.035, r * 0.035, 0, Math.PI * 2); ctx.arc(eyeDX + r * 0.035, eyeY - r * 0.035, r * 0.035, 0, Math.PI * 2); ctx.fill();
            }
            if (weary) {
                // Down to its last hit - shivering, droopy-browed.
                ctx.strokeStyle = '#123a48'; ctx.lineWidth = Math.max(1.5, r * 0.035); ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(-r * 0.09, r * 0.3); ctx.lineTo(-r * 0.03, r * 0.34); ctx.lineTo(r * 0.03, r * 0.3); ctx.lineTo(r * 0.09, r * 0.34); ctx.stroke();
                ctx.strokeStyle = '#123a48'; ctx.lineWidth = Math.max(1.3, r * 0.03); ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.12, eyeY - r * 0.2); ctx.lineTo(-eyeDX + r * 0.08, eyeY - r * 0.16); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(eyeDX + r * 0.12, eyeY - r * 0.2); ctx.lineTo(eyeDX - r * 0.08, eyeY - r * 0.16); ctx.stroke();
            } else {
                ctx.strokeStyle = '#123a48'; ctx.lineWidth = Math.max(2, r * 0.045); ctx.lineCap = 'round';
                ctx.beginPath(); ctx.arc(0, r * 0.22, r * 0.14, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
                ctx.fillStyle = '#f4fbff';
                [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * r * 0.13, r * 0.32); ctx.lineTo(s * r * 0.05, r * 0.44); ctx.lineTo(s * r * 0.19, r * 0.38); ctx.closePath(); ctx.fill(); });
            }
        }
    };

    // ---- Yeti's bestiary entry ----
    window.enemyDB.boss_yeti = { name: 'Yeti', desc: 'A towering ice-beast of the frozen peaks. Slams the ground and breathes killing frost. 3 hits to topple.' };
})();
