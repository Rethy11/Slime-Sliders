// ==========================================
// BOSS: Crocodile (Swamp stage boss)
// ==========================================
// Self-contained boss module - see bosses/kingslime.js for the general shape of this
// file. The Crocodile is the one boss with amphibious movement (it's allowed to prowl
// and submerge in non-sky hazard tiles instead of being steered back onto dry land like
// every other boss) - rather than hardcoding a bossId check into the shared movement
// code, that rule is expressed here as this boss's own `isOffLimits` hook on its bossDB
// entry, which the generic boss update loop in index.html calls if present (falling back
// to the normal "off-safe-ground" check for every boss that doesn't define one). The
// Crocodile also alone gets a 4th attack, Swamp Ambush, built specifically around
// non-sky hazard tiles - every other boss still has exactly 3.

(function () {
    window.bossDB = window.bossDB || {};
    window.bossSilhouettes = window.bossSilhouettes || {};
    window.enemyDB = window.enemyDB || {};

    // ---- Crocodile's own copies of the shared attack-projectile helpers ----
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

    // ---- Crocodile's attack data (stats + attacks) ----
    window.bossDB.crocodile = {
        themeIndex: 4, radius: 44, speedMult: 0.85, name: 'Crocodile',
        // crownColor is the actual gold of his crown now (see the crocodile
        // silhouette below) - the back-armor scutes reuse darkColor instead.
        bodyColor: '#5a7a2e', darkColor: '#33471a', crownColor: '#d4af37',
        // The Crocodile alone gets a 4th attack, Swamp Ambush, built specifically
        // around non-sky hazard tiles (see nearestHazardTile) - every other boss
        // still has exactly 3. Death Roll also leans on hazard tiles when one's
        // close by. See the isAmbush/lockChargeAngle hooks consumed in the main
        // boss update loop.
        // Amphibious movement: a swamp predator is allowed to stand on/submerge in
        // non-sky hazard tiles instead of being steered back onto dry land like every
        // other boss - it's only steered back if it drifts into the actual off-map
        // sky. The generic boss update loop in index.html calls this hook (falling
        // back to the normal "off safe ground" check) instead of hardcoding a
        // bossId==='crocodile' special case into shared movement code.
        isOffLimits: (e) => isOffMapSky(e.x, e.y),
        attacks: [
            { // Tail Sweep - a real melee tail-whip: the tail arcs through a wide
              // swing right around the boss's own body, hitting anything caught in
              // its reach, rather than flinging projectiles off across the screen.
                name: 'Tail Sweep', telegraph: 55, duration: 55, cooldown: 150,
                exec: (e) => { e._sweepBase = e.angle - Math.PI * 0.7; e._sweepStep = 0; playSFX('enemy_hit'); },
                tick: (e) => {
                    if (e._sweepStep <= 6 && e.stateTimer % 6 === 0) {
                        let a = e._sweepBase + (e._sweepStep / 6) * Math.PI * 1.4;
                        let reach = e.radius * 1.6;
                        bossTelegraphAoe(e, e.x + Math.cos(a) * reach, e.y + Math.sin(a) * reach, e.radius * 0.7, 10);
                        e._sweepStep++;
                    }
                }
            },
            { // Death Roll - real crocodiles death-roll best in water: the charge
              // bends toward the nearest patch of swamp water if one's close by
              // (locked in at the very first telegraph frame via lockChargeAngle,
              // same fairness window as any other charge), and the roll's ending
              // burst is bigger and splashier landing in water than stuck on dry land.
                name: 'Death Roll', telegraph: 60, duration: 45, cooldown: 170, dash: true,
                lockChargeAngle: (e) => {
                    let wet = nearestHazardTile(e.x, e.y, 300);
                    e._rollWet = !!wet;
                    return wet ? Math.atan2(wet.y - e.y, wet.x - e.x) : Math.atan2(player.worldY - e.y, player.worldX - e.x);
                },
                exec: (e) => { playSFX('bull_charge'); },
                tick: (e) => {
                    if (e.stateTimer < 30) { e.x += Math.cos(e.chargeAngle) * e.speed * 2.6; e.y += Math.sin(e.chargeAngle) * e.speed * 2.6; }
                    if (e.stateTimer === 30) {
                        if (e._rollWet) { spawnSplash(e.x, e.y); bossFireRadial(e, 10, 3.8, 8); screenShake = Math.max(screenShake, 11); }
                        else { bossFireRadial(e, 7, 3.2, 7); screenShake = Math.max(screenShake, 8); }
                        playSFX('lightning');
                    }
                }
            },
            { // Bone-Crushing Bite (formerly Snap Lunge) - a quick dash forward with
              // the jaws snapping shut in an AOE right at the snout, matching this
              // boss's own bestiary line: "snaps with a bone-crushing bite".
                name: 'Bone-Crushing Bite', telegraph: 45, duration: 20, cooldown: 120, dash: true,
                exec: (e) => { bossTelegraphAoe(e, e.x + Math.cos(e.chargeAngle) * 70, e.y + Math.sin(e.chargeAngle) * 70, 55, 20); playSFX('enemy_hit'); },
                tick: (e) => { e.x += Math.cos(e.chargeAngle) * e.speed * 1.6; e.y += Math.sin(e.chargeAngle) * e.speed * 1.6; }
            },
            { // Swamp Ambush - submerges into the nearest hazard pool near the
              // player and erupts back out right on top of it: the boss's signature
              // use of non-sky hazard tiles. isAmbush drives the sink/resurface fade
              // in drawBossGeneric. Falls back to a quick lurking snap in place, with
              // no teleport, on a level with no hazard tiles in reach.
                name: 'Swamp Ambush', telegraph: 65, duration: 26, cooldown: 190, isAmbush: true,
                exec: (e) => {
                    let spot = nearestHazardTile(player.worldX, player.worldY, 650);
                    if (spot) {
                        e.x = spot.x; e.y = spot.y;
                        spawnSplash(e.x, e.y);
                        bossTelegraphAoe(e, e.x, e.y, e.radius * 1.5, 20);
                        bossFireRadial(e, 8, 3.2, 7);
                    } else {
                        bossTelegraphAoe(e, player.worldX, player.worldY, e.radius * 1.2, 20);
                    }
                    playSFX('enemy_hit'); screenShake = Math.max(screenShake, 9);
                }
            }
        ]
    };

    // ---- Crocodile's visual design (silhouette) ----
    window.bossSilhouettes.crocodile = (ctx, r, def, e) => {
        // Expression priority: a brief hit-flash flinch beats an attack snarl beats a
        // telegraph narrow-eyed wind-up beats the default calm look - see hitFlash and
        // the attack/telegraph states set by the boss update loop.
        let hurt = (e.hitFlash || 0) > 0;
        let attacking = e.state === 'attack';
        let winding = e.state === 'telegraph';
        // The jaw hinges open through the wind-up and snaps fully open mid-attack,
        // then shuts the instant the attack resolves, so the bite itself reads as
        // the jaw closing on you.
        let jawOpen = hurt ? 0 : attacking ? 1 : winding ? 0.35 : 0;
        let scute = def.darkColor;

        // Tail - a tapered wedge trailing off the back of the body.
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 0.24);
        ctx.quadraticCurveTo(-r * 1.15, -r * 0.1, -r * 1.4, 0);
        ctx.quadraticCurveTo(-r * 1.15, r * 0.1, -r * 0.7, r * 0.24);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = scute;
        for (let i = 0; i < 3; i++) {
            let tx = -r * (0.8 + i * 0.2);
            ctx.beginPath(); ctx.moveTo(tx - r * 0.05, -r * 0.06); ctx.lineTo(tx, -r * 0.22); ctx.lineTo(tx + r * 0.05, -r * 0.06); ctx.closePath(); ctx.fill();
        }

        // Stubby legs peeking out from under the body.
        ctx.fillStyle = scute;
        ctx.beginPath(); ctx.ellipse(-r * 0.3, r * 0.42, r * 0.2, r * 0.12, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.1, r * 0.44, r * 0.2, r * 0.12, -0.25, 0, Math.PI * 2); ctx.fill();

        // Main body.
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath(); ctx.ellipse(-r * 0.15, 0, r * 0.78, r * 0.48, 0, 0, Math.PI * 2); ctx.fill();

        // Pale underbelly plates.
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath(); ctx.ellipse(-r * 0.1, r * 0.2, r * 0.5, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();

        // Back scutes - a jagged armor ridge down the spine (replaces the old plain dots).
        ctx.fillStyle = scute;
        for (let i = -2; i <= 2; i++) {
            let bx = i * r * 0.2 - r * 0.28;
            ctx.beginPath();
            ctx.moveTo(bx - r * 0.08, -r * 0.3);
            ctx.lineTo(bx, -r * 0.48);
            ctx.lineTo(bx + r * 0.08, -r * 0.3);
            ctx.closePath(); ctx.fill();
        }

        // Snout - a long tapered wedge with a rounded tip.
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath();
        ctx.moveTo(r * 0.2, -r * 0.26);
        ctx.quadraticCurveTo(r * 0.8, -r * 0.22, r * 1.02, -r * 0.05);
        ctx.quadraticCurveTo(r * 0.8, r * 0.14, r * 0.2, r * 0.2);
        ctx.closePath(); ctx.fill();

        // Nostril bumps at the very tip.
        ctx.fillStyle = scute;
        ctx.beginPath(); ctx.arc(r * 0.94, -r * 0.1, r * 0.045, 0, Math.PI * 2); ctx.arc(r * 0.94, r * 0.02, r * 0.045, 0, Math.PI * 2); ctx.fill();

        // Upper-jaw snaggle teeth - visible along the top edge of the snout even
        // with the mouth shut.
        ctx.fillStyle = '#eef2d8';
        for (let i = 0; i < 4; i++) {
            let tx = r * (0.35 + i * 0.16);
            ctx.beginPath(); ctx.moveTo(tx, -r * 0.16); ctx.lineTo(tx + r * 0.05, -r * 0.02); ctx.lineTo(tx - r * 0.05, -r * 0.02); ctx.closePath(); ctx.fill();
        }

        // Lower jaw - hinges open through the telegraph/attack (jawOpen), or draws
        // as a simple closed-mouth line otherwise.
        if (jawOpen > 0) {
            let drop = jawOpen * r * 0.32;
            ctx.fillStyle = '#7a1e1e';
            ctx.beginPath();
            ctx.moveTo(r * 0.22, r * 0.02);
            ctx.lineTo(r * 0.95, r * 0);
            ctx.lineTo(r * 0.85, r * (0.1 + drop));
            ctx.lineTo(r * 0.22, r * (0.15 + drop * 0.6));
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = def.bodyColor;
            ctx.beginPath();
            ctx.moveTo(r * 0.2, r * (0.15 + drop * 0.6));
            ctx.quadraticCurveTo(r * 0.6, r * (0.22 + drop), r * 0.85, r * (0.12 + drop));
            ctx.lineTo(r * 0.85, r * (0.2 + drop));
            ctx.quadraticCurveTo(r * 0.55, r * (0.32 + drop), r * 0.2, r * (0.26 + drop * 0.6));
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#eef2d8';
            for (let i = 0; i < 3; i++) {
                let tx = r * (0.38 + i * 0.18);
                let ty = r * (0.16 + drop * 0.85);
                ctx.beginPath(); ctx.moveTo(tx - r * 0.04, ty); ctx.lineTo(tx + r * 0.04, ty); ctx.lineTo(tx, ty - r * 0.09); ctx.closePath(); ctx.fill();
            }
        } else {
            ctx.strokeStyle = def.darkColor; ctx.lineWidth = Math.max(1.5, r * 0.04);
            ctx.beginPath(); ctx.moveTo(r * 0.22, r * 0.03); ctx.quadraticCurveTo(r * 0.7, r * 0.1, r * 0.95, r * 0.02); ctx.stroke();
        }

        // Eye ridges + eyes - the expression changes with state (idle / winding /
        // attacking / hurt).
        for (let ex of [r * 0.18, r * 0.4]) {
            ctx.fillStyle = def.bodyColor;
            ctx.beginPath(); ctx.arc(ex, -r * 0.28, r * 0.13, 0, Math.PI * 2); ctx.fill();
            if (hurt) {
                ctx.strokeStyle = '#0e1503'; ctx.lineWidth = Math.max(1.5, r * 0.045);
                ctx.beginPath(); ctx.moveTo(ex - r * 0.09, -r * 0.24); ctx.lineTo(ex, -r * 0.32); ctx.lineTo(ex + r * 0.09, -r * 0.24); ctx.stroke();
            } else if (winding) {
                ctx.fillStyle = '#0e1503';
                ctx.beginPath(); ctx.ellipse(ex, -r * 0.28, r * 0.09, r * 0.03, 0, 0, Math.PI * 2); ctx.fill();
            } else if (attacking) {
                ctx.fillStyle = '#0e1503';
                ctx.beginPath(); ctx.arc(ex, -r * 0.28, r * 0.1, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#c8d67a';
                ctx.beginPath(); ctx.arc(ex, -r * 0.28, r * 0.045, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = '#0e1503';
                ctx.beginPath(); ctx.arc(ex, -r * 0.28, r * 0.08, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#c8d67a';
                ctx.beginPath(); ctx.arc(ex + r * 0.015, -r * 0.3, r * 0.03, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Crown - a small tarnished-gold circlet resting on the brow, just behind
        // the eyes.
        ctx.save();
        ctx.translate(-r * 0.05, -r * 0.46);
        ctx.fillStyle = def.crownColor;
        ctx.beginPath();
        ctx.moveTo(-r * 0.24, r * 0.1);
        ctx.lineTo(-r * 0.24, -r * 0.02);
        ctx.lineTo(-r * 0.13, -r * 0.16);
        ctx.lineTo(-r * 0.01, -r * 0.03);
        ctx.lineTo(r * 0.11, -r * 0.18);
        ctx.lineTo(r * 0.22, -r * 0.02);
        ctx.lineTo(r * 0.22, r * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = Math.max(1, r * 0.025);
        ctx.strokeStyle = def.darkColor;
        ctx.stroke();
        ctx.fillStyle = '#8fe0a0';
        ctx.beginPath(); ctx.arc(-r * 0.01, -r * 0.02, r * 0.035, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    // ---- Crocodile's bestiary entry ----
    window.enemyDB.boss_crocodile = { name: 'Crocodile', desc: 'An ancient, crowned swamp predator. Death-rolls through the water, ambushes from hidden pools, and snaps with a bone-crushing bite. 3 hits to topple.' };
})();
