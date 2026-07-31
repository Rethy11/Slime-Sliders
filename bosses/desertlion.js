// ==========================================
// BOSS: Desert Minotaur (Desert stage boss)
// ==========================================
// Self-contained boss module - see bosses/kingslime.js for the general shape of this
// file. Kept the 'desertlion' key/bossId throughout (save data, item unlocks, and the
// bestiary entry all line up on it) even though the look was reworked from lion to
// Minotaur - only the silhouette and flavor text changed.

(function () {
    window.bossDB = window.bossDB || {};
    window.bossSilhouettes = window.bossSilhouettes || {};
    window.enemyDB = window.enemyDB || {};

    // ---- Desert Minotaur's own copies of the shared attack-projectile helpers ----
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

    // ---- Desert Minotaur's own copy of the horn-drawing helper (used twice by its
    // own silhouette below, once per horn) ----
    // Draws one curved bull horn rooted at (sx,sy), sweeping outward/up and curling
    // slightly inward at the tip. dir = -1 for the rear horn, 1 for the front horn (each
    // silhouette places one on either side of the skull - see desertlion's Minotaur
    // rework below). Deliberately big and chunky so it reads clearly as the boss's
    // signature "crown" even at the small in-game boss radius, not just zoomed in.
    // Relies on the global shadeHex(hex, amt) helper (defined further down, alongside
    // the fishing-scene figures) for the gradient's base color; both are available by
    // the time this ever actually runs, since bosses aren't drawn until well after every
    // <script> block on the page has loaded.
    function drawHorn(ctx, sx, sy, dir, r, baseColor, tipColor) {
        ctx.beginPath();
        ctx.moveTo(sx - dir * r * 0.1, sy + r * 0.08);
        ctx.quadraticCurveTo(sx + dir * r * 0.08, sy - r * 0.4, sx + dir * r * 0.5, sy - r * 0.72);
        ctx.quadraticCurveTo(sx + dir * r * 0.8, sy - r * 0.95, sx + dir * r * 0.7, sy - r * 1.18);
        ctx.quadraticCurveTo(sx + dir * r * 0.6, sy - r * 1.02, sx + dir * r * 0.32, sy - r * 0.68);
        ctx.quadraticCurveTo(sx + dir * r * 0.02, sy - r * 0.36, sx + dir * r * 0.12, sy - r * 0.02);
        ctx.closePath();
        let grad = ctx.createLinearGradient(sx, sy, sx + dir * r * 0.7, sy - r * 1.18);
        grad.addColorStop(0, baseColor); grad.addColorStop(0.55, baseColor); grad.addColorStop(1, tipColor);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = r * 0.035; ctx.stroke();
        // one ridge line for texture, visible up close without muddying the silhouette
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = r * 0.025;
        ctx.beginPath();
        ctx.moveTo(sx + dir * r * 0.14, sy - r * 0.12); ctx.lineTo(sx + dir * r * 0.4, sy - r * 0.58);
        ctx.stroke();
    }

    // ---- Desert Minotaur's attack data (stats + attacks) ----
    window.bossDB.desertlion = {
        themeIndex: 1, radius: 42, speedMult: 1.05, name: 'Desert Minotaur',
        bodyColor: '#d9a441', darkColor: '#8a5a1e', crownColor: '#e8dcc0',
        attacks: [
            { // Sand Charge - fast charge toward the player, dasher-style. Direction is
              // locked in and telegraphed the instant the wind-up starts (see the dash
              // flag handling in the boss telegraph-state update / draw code) rather
              // than only decided the instant it fires.
                name: 'Sand Charge', telegraph: 65, duration: 55, cooldown: 150, dash: true,
                exec: (e) => { playSFX('bull_charge'); },
                tick: (e) => { e.x += Math.cos(e.chargeAngle) * e.speed * 3.2; e.y += Math.sin(e.chargeAngle) * e.speed * 3.2; }
            },
            { // Roar Shockwave - full-ring bullet-hell burst
                name: 'Roar Shockwave', telegraph: 75, duration: 20, cooldown: 170,
                exec: (e) => { playSFX('lightning'); bossFireRadial(e, 10, 3.6, 7); screenShake = Math.max(screenShake, 8); }
            },
            { // Sandstorm Fists - quick 3-swipe fan of close-range shots
                name: 'Sandstorm Fists', telegraph: 50, duration: 30, cooldown: 130,
                exec: (e) => { e._clawTicks = 3; },
                tick: (e) => { if (e._clawTicks > 0 && e.stateTimer % 10 === 0) { bossFireAimedSpread(e, 3, 0.8, 5, 8); e._clawTicks--; playSFX('enemy_hit'); } }
            }
        ]
    };

    // ---- Desert Minotaur's visual design (silhouette) ----
    window.bossSilhouettes.desertlion = (ctx, r, def, e) => {
        // Facial expression: a brief pained wince while in its post-hit hitFlash
        // window (see destroyEnemyByIndex - that's a short, readable 24-frame beat,
        // unlike the much longer BOSS_IFRAME_FRAMES invulnerability window), an open
        // bellow mid-attack, a gritted snarl while winding one up, otherwise calm.
        let expr = 'idle';
        if ((e.hitFlash || 0) > 0) expr = 'hurt';
        else if (e.state === 'attack') expr = 'attack';
        else if (e.state === 'telegraph') expr = 'telegraph';

        let bodyLight = shadeHex(def.bodyColor, 0.18);
        let bodyDark = def.darkColor;
        let hornBase = shadeHex(def.crownColor, 0.15); // crownColor = the horns now, not a mane
        let hornTip = shadeHex(def.darkColor, -0.55);

        // Body: broad muscular shoulders/chest, lightly shaded for some form.
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath(); ctx.ellipse(-r * 0.06, r * 0.22, r * 0.92, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bodyDark; ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.ellipse(-r * 0.42, r * 0.2, r * 0.4, r * 0.5, 0.25, 0, Math.PI * 2); ctx.fill(); // far shoulder in shadow
        ctx.globalAlpha = 1;
        ctx.fillStyle = bodyLight; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.ellipse(r * 0.4, r * 0.05, r * 0.32, r * 0.4, -0.2, 0, Math.PI * 2); ctx.fill(); // near shoulder highlight
        ctx.globalAlpha = 1;
        ctx.fillStyle = bodyDark; // chest fur fringe
        ctx.beginPath();
        for (let i = -1; i <= 1; i++) {
            let cx = i * r * 0.13;
            ctx.moveTo(cx - r * 0.07, r * 0.1); ctx.lineTo(cx + r * 0.07, r * 0.1); ctx.lineTo(cx, r * 0.32);
        }
        ctx.fill();

        // Head.
        let hx = r * 0.1, hy = -r * 0.32, hr = r * 0.6;
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bodyDark; ctx.globalAlpha = 0.28;
        ctx.beginPath(); ctx.arc(hx - hr * 0.25, hy + hr * 0.3, hr * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Ears, tucked behind the horns.
        ctx.fillStyle = bodyDark;
        ctx.beginPath(); ctx.ellipse(hx - hr * 0.85, hy - hr * 0.15, r * 0.16, r * 0.24, -0.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(hx + hr * 0.55, hy - hr * 0.75, r * 0.15, r * 0.22, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = shadeHex(bodyDark, -0.3);
        ctx.beginPath(); ctx.ellipse(hx - hr * 0.85, hy - hr * 0.15, r * 0.08, r * 0.13, -0.6, 0, Math.PI * 2); ctx.fill();

        // Horns - the boss's signature "crown".
        drawHorn(ctx, hx - hr * 0.35, hy - hr * 0.55, -1, r, hornBase, hornTip);
        drawHorn(ctx, hx + hr * 0.35, hy - hr * 0.6, 1, r, hornBase, hornTip);

        // Forehead fur tuft between the horns.
        ctx.fillStyle = bodyDark;
        ctx.beginPath(); ctx.ellipse(hx + hr * 0.05, hy - hr * 0.55, r * 0.14, r * 0.1, 0.2, 0, Math.PI * 2); ctx.fill();

        // Snout / muzzle, with nostrils and a nose ring.
        let sx = hx + hr * 0.85, sy = hy + hr * 0.28;
        ctx.fillStyle = def.darkColor;
        ctx.beginPath(); ctx.ellipse(sx, sy, r * 0.36, r * 0.27, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = shadeHex(def.darkColor, 0.12);
        ctx.beginPath(); ctx.ellipse(sx - r * 0.05, sy - r * 0.08, r * 0.24, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a0e05';
        ctx.beginPath();
        ctx.ellipse(sx + r * 0.14, sy - r * 0.09, r * 0.05, r * 0.08, 0.4, 0, Math.PI * 2);
        ctx.ellipse(sx + r * 0.14, sy + r * 0.11, r * 0.05, r * 0.08, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f4d35e'; ctx.lineWidth = r * 0.045;
        ctx.beginPath(); ctx.arc(sx + r * 0.05, sy + r * 0.24, r * 0.09, 0.15, Math.PI - 0.15); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = r * 0.015;
        ctx.beginPath(); ctx.arc(sx + r * 0.05, sy + r * 0.24, r * 0.09, 0.15, Math.PI - 0.15); ctx.stroke();

        // Face: brow + eyes + mouth, all driven by `expr` above.
        let ex1 = hx - hr * 0.28, ex2 = hx + hr * 0.42, ey = hy - hr * 0.02;
        let eyeR = r * 0.13;
        ctx.lineCap = 'round';
        if (expr === 'hurt') {
            // Eyes squeezed shut, brows raised in a wince, small pained "o" mouth.
            ctx.strokeStyle = '#1a0e05'; ctx.lineWidth = r * 0.045;
            [ex1, ex2].forEach(ex => {
                ctx.beginPath();
                ctx.moveTo(ex - eyeR, ey + eyeR * 0.4); ctx.lineTo(ex, ey - eyeR * 0.5); ctx.lineTo(ex + eyeR, ey + eyeR * 0.4);
                ctx.stroke();
            });
            ctx.strokeStyle = shadeHex(def.darkColor, -0.2); ctx.lineWidth = r * 0.05;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.1, ey - eyeR * 1.6); ctx.lineTo(ex1 + eyeR * 0.6, ey - eyeR * 2.2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR * 0.6, ey - eyeR * 2.2); ctx.lineTo(ex2 + eyeR * 1.1, ey - eyeR * 1.6); ctx.stroke();
            ctx.fillStyle = '#1a0e05';
            ctx.beginPath(); ctx.ellipse(sx - r * 0.32, sy + r * 0.3, r * 0.06, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
        } else if (expr === 'attack') {
            // Wide bellowing mouth with bared teeth, eyes narrowed and furious.
            ctx.fillStyle = '#2a1608';
            [ex1, ex2].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, ey, eyeR * 1.05, eyeR * 0.55, 0, 0, Math.PI * 2); ctx.fill(); });
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(ex1 + eyeR * 0.3, ey, eyeR * 0.28, 0, Math.PI * 2); ctx.arc(ex2 + eyeR * 0.3, ey, eyeR * 0.28, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = shadeHex(def.darkColor, -0.3); ctx.lineWidth = r * 0.06;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.3, ey - eyeR * 0.3); ctx.lineTo(ex1 + eyeR * 1.1, ey - eyeR * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR * 1.1, ey - eyeR * 1.5); ctx.lineTo(ex2 + eyeR * 1.3, ey - eyeR * 0.3); ctx.stroke();
            let mx = sx - r * 0.28, my = sy + r * 0.32;
            ctx.fillStyle = '#3a0a0a';
            ctx.beginPath(); ctx.ellipse(mx, my, r * 0.16, r * 0.13, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff8e8';
            ctx.beginPath();
            ctx.moveTo(mx - r * 0.14, my - r * 0.06); ctx.lineTo(mx - r * 0.08, my); ctx.lineTo(mx - r * 0.02, my - r * 0.06);
            ctx.lineTo(mx + r * 0.04, my); ctx.lineTo(mx + r * 0.1, my - r * 0.06); ctx.lineTo(mx + r * 0.14, my);
            ctx.lineTo(mx + r * 0.1, my + r * 0.11); ctx.lineTo(mx + r * 0.02, my + r * 0.05); ctx.lineTo(mx - r * 0.06, my + r * 0.11);
            ctx.lineTo(mx - r * 0.14, my - r * 0.02);
            ctx.closePath(); ctx.fill();
        } else if (expr === 'telegraph') {
            // Gritted snarl: narrowed eyes, brows angled down, one tusk bared.
            ctx.fillStyle = '#2a1608';
            [ex1, ex2].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, ey + eyeR * 0.15, eyeR * 0.9, eyeR * 0.45, 0, 0, Math.PI * 2); ctx.fill(); });
            ctx.strokeStyle = shadeHex(def.darkColor, -0.3); ctx.lineWidth = r * 0.055;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.2, ey - eyeR * 0.6); ctx.lineTo(ex1 + eyeR, ey - eyeR * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR, ey - eyeR * 1.5); ctx.lineTo(ex2 + eyeR * 1.2, ey - eyeR * 0.6); ctx.stroke();
            let mx = sx - r * 0.26, my = sy + r * 0.3;
            ctx.strokeStyle = '#2a1608'; ctx.lineWidth = r * 0.04;
            ctx.beginPath(); ctx.moveTo(mx - r * 0.14, my); ctx.quadraticCurveTo(mx, my + r * 0.08, mx + r * 0.16, my - r * 0.03); ctx.stroke();
            ctx.fillStyle = '#fff8e8';
            ctx.beginPath(); ctx.moveTo(mx + r * 0.08, my - r * 0.01); ctx.lineTo(mx + r * 0.12, my + r * 0.09); ctx.lineTo(mx + r * 0.15, my - r * 0.02); ctx.closePath(); ctx.fill();
        } else {
            // Idle: calm but heavy-lidded, faint downturned brow - menacing at rest.
            ctx.fillStyle = '#2a1608';
            [ex1, ex2].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, ey, eyeR * 0.85, eyeR * 0.6, 0, 0, Math.PI * 2); ctx.fill(); });
            ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.arc(ex1 + eyeR * 0.25, ey - eyeR * 0.15, eyeR * 0.22, 0, Math.PI * 2); ctx.arc(ex2 + eyeR * 0.25, ey - eyeR * 0.15, eyeR * 0.22, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = shadeHex(def.darkColor, -0.15); ctx.lineWidth = r * 0.045;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.1, ey - eyeR * 0.5); ctx.lineTo(ex1 + eyeR * 0.9, ey - eyeR * 1.0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR * 0.9, ey - eyeR * 1.0); ctx.lineTo(ex2 + eyeR * 1.1, ey - eyeR * 0.5); ctx.stroke();
        }
    };

    // ---- Desert Minotaur's bestiary entry ----
    window.enemyDB.boss_desertlion = { name: 'Desert Minotaur', desc: 'A hulking, horned brute of the dunes. Bellows a shockwave and charges like a sandstorm. 3 hits to topple.' };
})();
