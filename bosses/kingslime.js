// ==========================================
// BOSS: King Slime (Forest stage boss)
// ==========================================
// Self-contained boss module: visual design (silhouette), attack data (bossDB entry,
// including King Slime's own private copies of the small projectile/telegraph attack
// helpers - see the note on helper duplication below), and its bestiary blurb.
// Registers itself onto the shared window.bossDB / window.bossSilhouettes / window.enemyDB
// objects, the same way sprites/wanderer.js etc. register onto window.EnemySprites and
// themes/forest.js etc. push onto window.StageThemes. Loaded before the generic boss
// chassis (bossBobOffset/drawBossGeneric/drawBossHPPips) and the main game script, which
// only ever read these objects - never define entries into them - so load order relative
// to this file doesn't matter as long as all bosses/*.js load before that first read.

(function () {
    window.bossDB = window.bossDB || {};
    window.bossSilhouettes = window.bossSilhouettes || {};
    window.enemyDB = window.enemyDB || {};

    // ---- King Slime's own copies of the shared attack-projectile helpers ----
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

    // ---- King Slime's attack data (stats + attacks) ----
    window.bossDB.kingslime = {
        themeIndex: 0, radius: 46, speedMult: 0.65, name: 'King Slime',
        bodyColor: '#3fd67a', darkColor: '#1f8a4c', crownColor: '#ffd23f',
        attacks: [
            { // Slime Split - lobs 5 small gobs outward in a ring
                name: 'Slime Split', telegraph: 70, duration: 20, cooldown: 150,
                exec: (e) => { playSFX('enemy_hit'); bossFireRadial(e, 5, 3.2, 8); screenShake = Math.max(screenShake, 6); }
            },
            { // Bounce Slam - jumps then slams down with a telegraphed shockwave AOE
                name: 'Bounce Slam', telegraph: 55, duration: 40, cooldown: 160,
                exec: (e) => { e.slamTargetX = player.worldX; e.slamTargetY = player.worldY; bossTelegraphAoe(e, e.slamTargetX, e.slamTargetY, 90, 40); },
                tick: (e) => { let t = e.stateTimer / 40; e.x += (e.slamTargetX - e.x) * 0.06; e.y += (e.slamTargetY - e.y) * 0.06; if (e.stateTimer === 39) { screenShake = Math.max(screenShake, 10); playSFX('enemy_hit'); } }
            },
            { // Sticky Spit - 3-shot aimed spread
                name: 'Sticky Spit', telegraph: 60, duration: 15, cooldown: 130,
                exec: (e) => { playSFX('eye_fire'); bossFireAimedSpread(e, 3, 0.5, 4.2, 9); }
            }
        ]
    };

    // ---- King Slime's visual design (silhouette) ----
    window.bossSilhouettes.kingslime = (ctx, r, def, e) => {
        // Expression state, read straight off the boss's own attack state machine
        // (SECTION 6/7: 'cooldown' | 'telegraph' | 'attack') plus the shared hitFlash
        // feedback that's already set whenever the player lands a hit (see
        // destroyEnemyByIndex). Getting hit takes priority over whatever it was doing,
        // then its own windup/attack frames, then a calm idle default.
        let hurt = (e.hitFlash || 0) > 0;
        let winding = e.state === 'telegraph';
        let attacking = e.state === 'attack';
        let weary = !hurt && !winding && !attacking && e.hp === 1;
        let blink = !hurt && !winding && !attacking && (((e.animTimer || 0) % 160) > 152);

        // ---- Bloated jelly body: gradient-shaded for real volume instead of a flat
        // fill, with a softly wobbling drip along the hem. ----
        let wob = Math.sin((e.animTimer || 0) / 14) * r * 0.02;
        ctx.beginPath(); ctx.ellipse(0, r * 0.06 + wob * 0.3, r, r * 0.82, 0, 0, Math.PI * 2);
        let bodyGrad = ctx.createRadialGradient(-r * 0.32, -r * 0.36, r * 0.08, -r * 0.05, r * 0.1, r * 1.25);
        bodyGrad.addColorStop(0, '#eafff0'); bodyGrad.addColorStop(0.32, def.bodyColor); bodyGrad.addColorStop(1, def.darkColor);
        ctx.fillStyle = bodyGrad; ctx.fill();
        ctx.lineWidth = Math.max(1.5, r * 0.045); ctx.strokeStyle = def.darkColor; ctx.stroke();

        // Little hanging drips around the bottom hem.
        ctx.fillStyle = def.bodyColor;
        [[-0.62, 0.62, 0.16], [-0.2, 0.82, 0.13], [0.28, 0.78, 0.14]].forEach(d => {
            ctx.beginPath(); ctx.ellipse(r * d[0], r * d[1] + wob, r * d[2], r * d[2] * 1.3, 0, 0, Math.PI * 2); ctx.fill();
        });

        // Underbelly shading for volume.
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.beginPath(); ctx.ellipse(0, r * 0.46, r * 0.75, r * 0.28, 0, 0, Math.PI); ctx.fill();

        // Gooey internal bubbles, drifting slowly.
        let bt = (e.animTimer || 0) / 45;
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        [[-0.42, 0.28, 0.1], [0.4, 0.4, 0.07], [-0.05, -0.32, 0.06]].forEach((b, i) => {
            let by = b[1] + Math.sin(bt + i * 2.1) * 0.025;
            ctx.beginPath(); ctx.arc(r * b[0], r * by, r * b[2], 0, Math.PI * 2); ctx.fill();
        });

        // Glossy highlight.
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.ellipse(-r * 0.36, -r * 0.4, r * 0.3, r * 0.17, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(-r * 0.08, -r * 0.56, r * 0.07, 0, Math.PI * 2); ctx.fill();

        // Blush.
        ctx.fillStyle = 'rgba(255,50,90,0.22)';
        ctx.beginPath(); ctx.ellipse(-r * 0.6, r * 0.14, r * 0.14, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.6, r * 0.14, r * 0.14, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();

        // ---- Crown: a proper jeweled 3-point crown (echoes the crown hat accessory's
        // look - see drawCharacterModel's hatId 'crown') instead of the old flat
        // triangle fan, with a sliver of velvet base peeking out under the gold band
        // and a twinkling center gem. ----
        ctx.fillStyle = '#7a1020';
        ctx.fillRect(-r * 0.5, -r * 0.6, r * 1.0, r * 0.08);
        let crownGrad = ctx.createLinearGradient(-r * 0.5, -r * 1.3, r * 0.5, -r * 0.55);
        crownGrad.addColorStop(0, '#fff4b8'); crownGrad.addColorStop(0.5, def.crownColor); crownGrad.addColorStop(1, '#c9960b');
        ctx.fillStyle = crownGrad;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.62); ctx.lineTo(r * 0.5, -r * 0.62);
        ctx.lineTo(r * 0.62, -r * 1.02); ctx.lineTo(r * 0.24, -r * 0.78);
        ctx.lineTo(0, -r * 1.3); ctx.lineTo(-r * 0.24, -r * 0.78);
        ctx.lineTo(-r * 0.62, -r * 1.02);
        ctx.closePath(); ctx.lineJoin = 'round'; ctx.fill();
        ctx.lineWidth = Math.max(1.5, r * 0.035); ctx.strokeStyle = '#8a5a06'; ctx.stroke();
        ctx.fillStyle = '#c9960b';
        ctx.fillRect(-r * 0.5, -r * 0.68, r * 1.0, r * 0.12);
        ctx.strokeRect(-r * 0.5, -r * 0.68, r * 1.0, r * 0.12);
        ctx.fillStyle = '#e0303f';
        ctx.beginPath(); ctx.arc(0, -r * 1.18, r * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2d7ff5';
        ctx.beginPath(); ctx.arc(-r * 0.62, -r * 0.95, r * 0.06, 0, Math.PI * 2); ctx.arc(r * 0.62, -r * 0.95, r * 0.06, 0, Math.PI * 2); ctx.fill();
        if (Math.sin((e.animTimer || 0) / 16) > 0.75) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(-r * 0.03, -r * 1.22, r * 0.025, 0, Math.PI * 2); ctx.fill();
        }

        // ---- Face - the one thing the old sprite never had beyond two dots. Mood
        // follows the state read above. ----
        let eyeY = -r * 0.06, eyeDX = r * 0.3;
        if (hurt) {
            // Dazed from the hit: scrunched X eyes, a small wobbly "ow" mouth, one bead of sweat.
            ctx.strokeStyle = '#0a2a12'; ctx.lineWidth = Math.max(2, r * 0.055); ctx.lineCap = 'round';
            [-1, 1].forEach(s => {
                let ex = s * eyeDX;
                ctx.beginPath(); ctx.moveTo(ex - r * 0.11, eyeY - r * 0.11); ctx.lineTo(ex + r * 0.11, eyeY + r * 0.11); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ex + r * 0.11, eyeY - r * 0.11); ctx.lineTo(ex - r * 0.11, eyeY + r * 0.11); ctx.stroke();
            });
            ctx.fillStyle = '#3a1416';
            ctx.beginPath(); ctx.ellipse(0, r * 0.3, r * 0.09, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(150,225,255,0.85)';
            ctx.beginPath(); ctx.ellipse(r * 0.58, -r * 0.32, r * 0.045, r * 0.075, 0.3, 0, Math.PI * 2); ctx.fill();
        } else if (attacking) {
            // Mid-attack: full roar, sharp brows, bared teeth.
            ctx.fillStyle = '#0a2a12';
            ctx.beginPath(); ctx.ellipse(-eyeDX, eyeY, r * 0.1, r * 0.055, 0, 0, Math.PI * 2); ctx.ellipse(eyeDX, eyeY, r * 0.1, r * 0.055, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#0a2a12'; ctx.lineWidth = Math.max(2, r * 0.065); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.17, eyeY - r * 0.23); ctx.lineTo(-eyeDX + r * 0.12, eyeY - r * 0.1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(eyeDX + r * 0.17, eyeY - r * 0.23); ctx.lineTo(eyeDX - r * 0.12, eyeY - r * 0.1); ctx.stroke();
            ctx.fillStyle = '#5c1420';
            ctx.beginPath(); ctx.ellipse(0, r * 0.34, r * 0.27, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * r * 0.17, r * 0.14); ctx.lineTo(s * r * 0.23, r * 0.25); ctx.lineTo(s * r * 0.1, r * 0.25); ctx.closePath(); ctx.fill(); });
        } else if (winding) {
            // Winding up: narrowed, gritted, readying the next attack.
            ctx.fillStyle = '#0a2a12';
            ctx.beginPath(); ctx.ellipse(-eyeDX, eyeY, r * 0.1, r * 0.04, 0, 0, Math.PI * 2); ctx.ellipse(eyeDX, eyeY, r * 0.1, r * 0.04, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#0a2a12'; ctx.lineWidth = Math.max(2, r * 0.055); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.15, eyeY - r * 0.17); ctx.lineTo(-eyeDX + r * 0.1, eyeY - r * 0.08); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(eyeDX + r * 0.15, eyeY - r * 0.17); ctx.lineTo(eyeDX - r * 0.1, eyeY - r * 0.08); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-r * 0.15, r * 0.3); ctx.lineTo(r * 0.15, r * 0.3); ctx.stroke();
        } else {
            // Calm default: round content eyes with a highlight and a gentle smile,
            // with an occasional blink so it doesn't look static while idling.
            if (blink) {
                ctx.strokeStyle = '#0a2a12'; ctx.lineWidth = Math.max(2, r * 0.04); ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.1, eyeY); ctx.lineTo(-eyeDX + r * 0.1, eyeY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(eyeDX - r * 0.1, eyeY); ctx.lineTo(eyeDX + r * 0.1, eyeY); ctx.stroke();
            } else {
                ctx.fillStyle = '#0a2a12';
                ctx.beginPath(); ctx.arc(-eyeDX, eyeY, r * 0.12, 0, Math.PI * 2); ctx.arc(eyeDX, eyeY, r * 0.12, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(-eyeDX + r * 0.04, eyeY - r * 0.04, r * 0.04, 0, Math.PI * 2); ctx.arc(eyeDX + r * 0.04, eyeY - r * 0.04, r * 0.04, 0, Math.PI * 2); ctx.fill();
            }
            ctx.strokeStyle = '#0a2a12'; ctx.lineWidth = Math.max(2, r * 0.045); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(0, r * 0.16, r * 0.15, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
            if (weary) {
                // Down to its last hit - a bit worn out even while idling.
                ctx.strokeStyle = '#0a2a12'; ctx.lineWidth = Math.max(1.5, r * 0.04); ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(-eyeDX - r * 0.13, eyeY - r * 0.2); ctx.lineTo(-eyeDX + r * 0.09, eyeY - r * 0.15); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(eyeDX + r * 0.13, eyeY - r * 0.2); ctx.lineTo(eyeDX - r * 0.09, eyeY - r * 0.15); ctx.stroke();
                ctx.fillStyle = 'rgba(150,225,255,0.7)';
                ctx.beginPath(); ctx.ellipse(r * 0.55, -r * 0.28, r * 0.04, r * 0.065, 0.3, 0, Math.PI * 2); ctx.fill();
            }
        }
    };

    // ---- King Slime's bestiary entry ----
    window.enemyDB.boss_kingslime = { name: 'King Slime', desc: 'The bloated ruler of the forest. Splits itself into lesser slimes when angered. 3 hits to topple.' };
})();
