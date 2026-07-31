// ==========================================
// BOSS: Desert Minotaur (Desert stage boss)
// ==========================================
// Self-contained boss module - see bosses/kingslime.js for the general shape of this
// file. Kept the 'desertlion' key/bossId throughout (save data, item unlocks, and the
// bestiary entry all line up on it) even though the look was reworked from lion to
// Minotaur - only the silhouette and flavor text changed.
//
// Silhouette v2: the first Minotaur pass kept the old lion's round head-on-a-blob
// proportions and just stuck two small horn shapes near the top of the skull, which
// read as chibi and left the horns looking tacked on. That pass reworked the geometry
// itself - narrower head-to-shoulder ratio, an actual neck bridging head to torso, a
// wedge-shaped bull skull instead of a circle, and horns rooted into a shared brow
// ridge so they read as part of the skull instead of floating props.
//
// Silhouette v3: horns were still oversized and drawn on top of the ears (should be
// the other way around - ears sit in front, horn base tucks in behind), and the horn
// root itself had no depth cue so it still read as glued-on rather than grown-in. Also
// adds the rest of the body (legs + a loincloth) below the torso, since up to this
// point the boss was just a floating bust, plus arms gripping an axe.

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
    // Draws one thick, hooked bull horn rooted at (sx,sy) - the outer edge sweeps out
    // and up in a strong curve before curling forward at the tip, the inner edge tapers
    // back down to a wide base so the horn reads as solid and load-bearing rather than
    // a thin decorative curl. dir = -1 for the left horn, 1 for the right. `scale` sets
    // the horn's size independently of the boss radius r (kept as its own factor after
    // the previous pass ran the horns too big at scale 1). Both silhouettes are rooted
    // into the shared brow ridge drawn just before this in the silhouette below, and a
    // small dark "collar" is stamped at the base afterward, both so the horn's root
    // reads as socketed into the skull instead of resting on top of the surface. The
    // caller draws the ears *after* calling this so they layer in front of the horn
    // base rather than the horn covering the ear. Relies on the global shadeHex(hex, amt)
    // helper (defined further down, alongside the fishing-scene figures) for the gradient's
    // base color; both are available by the time this ever actually runs, since bosses
    // aren't drawn until well after every <script> block on the page has loaded.
    function drawHorn(ctx, sx, sy, dir, r, baseColor, tipColor, scale) {
        let s = r * (scale || 0.7);
        ctx.beginPath();
        ctx.moveTo(sx + dir * s * 0.04, sy + s * 0.36);
        ctx.quadraticCurveTo(sx + dir * s * 0.64, sy + s * 0.16, sx + dir * s * 0.83, sy - s * 0.16);
        ctx.quadraticCurveTo(sx + dir * s * 1.03, sy - s * 0.48, sx + dir * s * 0.93, sy - s * 0.78);
        ctx.quadraticCurveTo(sx + dir * s * 0.84, sy - s * 1.08, sx + dir * s * 0.64, sy - s * 1.21);
        ctx.quadraticCurveTo(sx + dir * s * 0.44, sy - s * 1.35, sx + dir * s * 0.32, sy - s * 1.39);
        ctx.lineTo(sx + dir * s * 0.21, sy - s * 1.43); // tip
        ctx.quadraticCurveTo(sx + dir * s * 0.36, sy - s * 1.25, sx + dir * s * 0.51, sy - s * 1.11);
        ctx.quadraticCurveTo(sx + dir * s * 0.65, sy - s * 0.96, sx + dir * s * 0.67, sy - s * 0.76);
        ctx.quadraticCurveTo(sx + dir * s * 0.70, sy - s * 0.56, sx + dir * s * 0.53, sy - s * 0.42);
        ctx.quadraticCurveTo(sx + dir * s * 0.37, sy - s * 0.28, sx + dir * s * 0.16, sy - s * 0.32);
        ctx.lineTo(sx - dir * s * 0.04, sy - s * 0.36); // back to root
        ctx.closePath();
        let grad = ctx.createLinearGradient(sx, sy, sx + dir * s * 0.55, sy - s * 1.2);
        grad.addColorStop(0, baseColor); grad.addColorStop(0.5, baseColor); grad.addColorStop(1, tipColor);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.38)'; ctx.lineWidth = r * 0.028; ctx.stroke();
        // two ridge lines for texture, visible up close without muddying the silhouette
        ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = r * 0.02;
        ctx.beginPath(); ctx.moveTo(sx + dir * s * 0.78, sy - s * 0.2); ctx.lineTo(sx + dir * s * 0.5, sy - s * 0.02); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + dir * s * 0.86, sy - s * 0.65); ctx.lineTo(sx + dir * s * 0.58, sy - s * 0.5); ctx.stroke();
        // base collar/socket: a short dark band right where the horn meets the skull,
        // like a root/burr, so it reads as plugged in rather than sitting on the surface
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath(); ctx.ellipse(sx + dir * s * 0.02, sy + s * 0.02, s * 0.22, s * 0.42, dir * 0.35, 0, Math.PI * 2); ctx.fill();
    }

    // ---- Desert Minotaur's own copy of a simple limb-drawing helper (used for both
    // arms) ---- Draws one stubby capsule-like limb segment between two joints as a
    // single rotated ellipse; a small round "joint" cap is drawn separately at each
    // elbow/shoulder/hand so consecutive segments blend into each other instead of
    // showing a hard seam where they meet.
    function limbSegment(ctx, x0, y0, x1, y1, thickness, color) {
        let dx = x1 - x0, dy = y1 - y0;
        let length = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse((x0 + x1) / 2, (y0 + y1) / 2, length / 2 + thickness * 0.3, thickness, angle, 0, Math.PI * 2);
        ctx.fill();
    }

    function limbJoint(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
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
        let hornBase = shadeHex(def.crownColor, 0.1); // crownColor = the horns now, not a mane
        let hornTip = shadeHex(def.darkColor, -0.5);

        // Legs, drawn first so the torso/loincloth below overlaps and hides the hip seam.
        [-1, 1].forEach(dirx => {
            let hipX = dirx * 0.3 * r, hipY = r * 0.95;
            let kneeX = dirx * 0.36 * r, kneeY = r * 1.4;
            let ankleX = dirx * 0.34 * r, ankleY = r * 1.8;
            ctx.fillStyle = def.bodyColor;
            ctx.beginPath();
            ctx.moveTo(hipX - dirx * 0.2 * r, hipY);
            ctx.quadraticCurveTo(hipX - dirx * 0.24 * r, kneeY - r * 0.1, kneeX - dirx * 0.18 * r, kneeY);
            ctx.quadraticCurveTo(kneeX - dirx * 0.16 * r, ankleY - r * 0.1, ankleX - dirx * 0.13 * r, ankleY);
            ctx.lineTo(ankleX + dirx * 0.15 * r, ankleY);
            ctx.quadraticCurveTo(kneeX + dirx * 0.18 * r, ankleY - r * 0.1, kneeX + dirx * 0.2 * r, kneeY);
            ctx.quadraticCurveTo(hipX + dirx * 0.26 * r, kneeY - r * 0.1, hipX + dirx * 0.22 * r, hipY);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = bodyDark; ctx.globalAlpha = 0.3;
            ctx.beginPath(); ctx.ellipse(hipX + dirx * 0.05 * r, (hipY + kneeY) / 2, r * 0.12, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            // hoof
            ctx.fillStyle = shadeHex(bodyDark, -0.35);
            ctx.beginPath();
            ctx.moveTo(ankleX - dirx * 0.16 * r, ankleY);
            ctx.quadraticCurveTo(ankleX - dirx * 0.2 * r, ankleY + r * 0.22, ankleX - dirx * 0.05 * r, ankleY + r * 0.26);
            ctx.lineTo(ankleX + dirx * 0.2 * r, ankleY + r * 0.26);
            ctx.quadraticCurveTo(ankleX + dirx * 0.22 * r, ankleY + r * 0.1, ankleX + dirx * 0.17 * r, ankleY);
            ctx.closePath(); ctx.fill();
        });

        // Torso: broad wedge from shoulders down to waist (not a single soft blob) -
        // this plus the neck below is most of what keeps the whole thing from reading
        // as a bobblehead once the head size comes down.
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath();
        ctx.moveTo(-r * 0.92, -r * 0.05);
        ctx.quadraticCurveTo(-r * 1.08, r * 0.2, -r * 0.88, r * 0.5);
        ctx.quadraticCurveTo(-r * 0.7, r * 0.85, -r * 0.42, r * 1.0);
        ctx.quadraticCurveTo(-r * 0.15, r * 1.12, 0, r * 1.12);
        ctx.quadraticCurveTo(r * 0.15, r * 1.12, r * 0.42, r * 1.0);
        ctx.quadraticCurveTo(r * 0.7, r * 0.85, r * 0.88, r * 0.5);
        ctx.quadraticCurveTo(r * 1.08, r * 0.2, r * 0.92, -r * 0.05);
        ctx.quadraticCurveTo(0, -r * 0.28, -r * 0.92, -r * 0.05);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = bodyDark; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.ellipse(-r * 0.55, r * 0.2, r * 0.4, r * 0.55, 0.2, 0, Math.PI * 2); ctx.fill(); // far shoulder in shadow
        ctx.globalAlpha = 1;
        ctx.fillStyle = bodyLight; ctx.globalAlpha = 0.45;
        ctx.beginPath(); ctx.ellipse(r * 0.45, -r * 0.02, r * 0.32, r * 0.42, -0.15, 0, Math.PI * 2); ctx.fill(); // near shoulder highlight
        ctx.globalAlpha = 1;
        ctx.fillStyle = bodyDark; // chest fur fringe
        ctx.beginPath();
        for (let i = -1; i <= 1; i++) {
            let cx = i * r * 0.16;
            ctx.moveTo(cx - r * 0.09, r * 0.02); ctx.lineTo(cx + r * 0.09, r * 0.02); ctx.lineTo(cx, r * 0.32);
        }
        ctx.fill();

        // Loincloth: bands the waist, hides the leg/torso seam and reads as "body"
        // rather than a floating bust sitting directly on top of two legs.
        ctx.fillStyle = shadeHex(bodyDark, -0.2);
        ctx.beginPath();
        ctx.moveTo(-r * 0.55, r * 0.88);
        ctx.quadraticCurveTo(0, r * 1.0, r * 0.55, r * 0.88);
        ctx.lineTo(r * 0.48, r * 1.22);
        ctx.quadraticCurveTo(0, r * 1.34, -r * 0.48, r * 1.22);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = r * 0.02;
        ctx.beginPath(); ctx.moveTo(-r * 0.5, r * 0.95); ctx.quadraticCurveTo(0, r * 1.06, r * 0.5, r * 0.95); ctx.stroke();

        let hx = 0, hy = -r * 0.6, hr = r * 0.46;

        // Neck: a filled wedge bridging the jaw down to the chest, drawn before the
        // head so the head's base overlaps and hides the seam. Without this the head
        // just sits directly on the torso and reads as a bobblehead.
        let neckTopY = hy + hr * 0.75;
        ctx.fillStyle = bodyDark;
        ctx.beginPath();
        ctx.moveTo(hx - hr * 0.55, neckTopY);
        ctx.lineTo(hx + hr * 0.55, neckTopY);
        ctx.lineTo(r * 0.5, -r * 0.14);
        ctx.lineTo(-r * 0.5, -r * 0.14);
        ctx.closePath(); ctx.fill();

        // Horn root anchors - defined before the skull/brow ridge/horns below so all
        // three line up on the same two points.
        let lhx = hx - hr * 0.92, lhy = hy - hr * 0.58;
        let rhx = hx + hr * 0.92, rhy = hy - hr * 0.58;

        // Head: a symmetric wedge-shaped bull skull (wide cheekbones, narrow crown,
        // tapered jaw) instead of a plain circle - this alone does a lot to sell
        // "Minotaur" over "guy with horns glued to a round head".
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath();
        ctx.moveTo(hx, hy - hr * 1.05);
        ctx.quadraticCurveTo(hx - hr * 0.35, hy - hr * 1.02, hx - hr * 1.05, hy - hr * 0.55);
        ctx.quadraticCurveTo(hx - hr * 1.1, hy - hr * 0.05, hx - hr * 0.78, hy + hr * 0.5);
        ctx.quadraticCurveTo(hx - hr * 0.35, hy + hr * 0.78, hx, hy + hr * 0.82);
        ctx.quadraticCurveTo(hx + hr * 0.35, hy + hr * 0.78, hx + hr * 0.78, hy + hr * 0.5);
        ctx.quadraticCurveTo(hx + hr * 1.1, hy - hr * 0.05, hx + hr * 1.05, hy - hr * 0.55);
        ctx.quadraticCurveTo(hx + hr * 0.35, hy - hr * 1.02, hx, hy - hr * 1.05);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = bodyDark; ctx.globalAlpha = 0.22;
        ctx.beginPath(); ctx.ellipse(hx - hr * 0.35, hy + hr * 0.15, hr * 0.65, hr * 0.75, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Brow ridge - a thick banded connector between the two horn roots. This has
        // real width all the way out to each end (not tapering to a point) so it fully
        // backs the base of each horn with no skull-color sliver showing through the seam.
        ctx.fillStyle = shadeHex(bodyDark, -0.1);
        ctx.beginPath();
        ctx.moveTo(lhx - hr * 0.1, lhy - hr * 0.06);
        ctx.quadraticCurveTo(hx, hy - hr * 1.0, rhx + hr * 0.1, rhy - hr * 0.06);
        ctx.quadraticCurveTo(rhx + hr * 0.02, rhy + hr * 0.2, hx, hy - hr * 0.58);
        ctx.quadraticCurveTo(lhx - hr * 0.02, lhy + hr * 0.2, lhx - hr * 0.1, lhy - hr * 0.06);
        ctx.closePath(); ctx.fill();

        // Horns - the boss's signature "crown", rooted into the brow ridge above and
        // sized down from the previous pass so they read as bold rather than gigantic.
        drawHorn(ctx, lhx, lhy, -1, r, hornBase, hornTip, 0.7);
        drawHorn(ctx, rhx, rhy, 1, r, hornBase, hornTip, 0.7);

        // Ears - drawn AFTER the horns so they layer in front of the horn base instead
        // of the horn base covering them; positioned to overlap that base on purpose.
        let earY = hy - hr * 0.32;
        ctx.fillStyle = bodyDark;
        ctx.beginPath(); ctx.ellipse(hx - hr * 1.0, earY, r * 0.16, r * 0.24, -0.55, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(hx + hr * 1.0, earY, r * 0.16, r * 0.24, 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = shadeHex(bodyDark, -0.25);
        ctx.beginPath(); ctx.ellipse(hx - hr * 1.0, earY, r * 0.085, r * 0.13, -0.55, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(hx + hr * 1.0, earY, r * 0.085, r * 0.13, 0.55, 0, Math.PI * 2); ctx.fill();

        // Snout / muzzle, centered under the skull, with nostrils and a nose ring.
        let sx = hx, sy = hy + hr * 0.62;
        ctx.fillStyle = def.darkColor;
        ctx.beginPath(); ctx.ellipse(sx, sy, r * 0.44, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = shadeHex(def.darkColor, 0.12);
        ctx.beginPath(); ctx.ellipse(sx, sy - r * 0.06, r * 0.27, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a0e05';
        ctx.beginPath();
        ctx.ellipse(sx - r * 0.13, sy - r * 0.05, r * 0.05, r * 0.08, 0.3, 0, Math.PI * 2);
        ctx.ellipse(sx + r * 0.13, sy - r * 0.05, r * 0.05, r * 0.08, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f4d35e'; ctx.lineWidth = r * 0.05;
        ctx.beginPath(); ctx.arc(sx, sy + r * 0.22, r * 0.1, 0.2, Math.PI - 0.2); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = r * 0.015;
        ctx.beginPath(); ctx.arc(sx, sy + r * 0.22, r * 0.1, 0.2, Math.PI - 0.2); ctx.stroke();

        // Face: brow + eyes + mouth, all driven by `expr` above. Eyes are set wide
        // (matching the wide cheekbones) rather than close together over the snout.
        let ex1 = hx - hr * 0.5, ex2 = hx + hr * 0.5, ey = hy - hr * 0.02;
        let eyeR = r * 0.12;
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
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.1, ey - eyeR * 1.5); ctx.lineTo(ex1 + eyeR * 0.7, ey - eyeR * 2.1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR * 0.7, ey - eyeR * 2.1); ctx.lineTo(ex2 + eyeR * 1.1, ey - eyeR * 1.5); ctx.stroke();
            ctx.fillStyle = '#1a0e05';
            ctx.beginPath(); ctx.ellipse(sx, sy + r * 0.28, r * 0.07, r * 0.09, 0, 0, Math.PI * 2); ctx.fill();
        } else if (expr === 'attack') {
            // Wide bellowing mouth with bared teeth, eyes narrowed and furious.
            ctx.fillStyle = '#2a1608';
            [ex1, ex2].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, ey, eyeR * 1.05, eyeR * 0.55, 0, 0, Math.PI * 2); ctx.fill(); });
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(ex1 + eyeR * 0.3, ey, eyeR * 0.28, 0, Math.PI * 2); ctx.arc(ex2 + eyeR * 0.3, ey, eyeR * 0.28, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = shadeHex(def.darkColor, -0.3); ctx.lineWidth = r * 0.06;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.3, ey - eyeR * 0.3); ctx.lineTo(ex1 + eyeR * 1.1, ey - eyeR * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR * 1.1, ey - eyeR * 1.5); ctx.lineTo(ex2 + eyeR * 1.3, ey - eyeR * 0.3); ctx.stroke();
            let mx = sx, my = sy + r * 0.3;
            ctx.fillStyle = '#3a0a0a';
            ctx.beginPath(); ctx.ellipse(mx, my, r * 0.19, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff8e8';
            ctx.beginPath();
            ctx.moveTo(mx - r * 0.16, my - r * 0.06); ctx.lineTo(mx - r * 0.09, my); ctx.lineTo(mx - r * 0.02, my - r * 0.06);
            ctx.lineTo(mx + r * 0.05, my); ctx.lineTo(mx + r * 0.12, my - r * 0.06); ctx.lineTo(mx + r * 0.16, my);
            ctx.lineTo(mx + r * 0.12, my + r * 0.11); ctx.lineTo(mx + r * 0.02, my + r * 0.05); ctx.lineTo(mx - r * 0.07, my + r * 0.11);
            ctx.lineTo(mx - r * 0.16, my - r * 0.02);
            ctx.closePath(); ctx.fill();
        } else if (expr === 'telegraph') {
            // Gritted snarl: narrowed eyes, brows angled down, one tusk bared.
            ctx.fillStyle = '#2a1608';
            [ex1, ex2].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, ey + eyeR * 0.15, eyeR * 0.9, eyeR * 0.45, 0, 0, Math.PI * 2); ctx.fill(); });
            ctx.strokeStyle = shadeHex(def.darkColor, -0.3); ctx.lineWidth = r * 0.055;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.2, ey - eyeR * 0.6); ctx.lineTo(ex1 + eyeR, ey - eyeR * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR, ey - eyeR * 1.5); ctx.lineTo(ex2 + eyeR * 1.2, ey - eyeR * 0.6); ctx.stroke();
            let mx = sx, my = sy + r * 0.28;
            ctx.strokeStyle = '#2a1608'; ctx.lineWidth = r * 0.04;
            ctx.beginPath(); ctx.moveTo(mx - r * 0.16, my); ctx.quadraticCurveTo(mx, my + r * 0.08, mx + r * 0.16, my - r * 0.03); ctx.stroke();
            ctx.fillStyle = '#fff8e8';
            ctx.beginPath(); ctx.moveTo(mx + r * 0.09, my - r * 0.01); ctx.lineTo(mx + r * 0.13, my + r * 0.09); ctx.lineTo(mx + r * 0.16, my - r * 0.02); ctx.closePath(); ctx.fill();
        } else {
            // Idle: calm but heavy-lidded, faint downturned brow - menacing at rest.
            ctx.fillStyle = '#2a1608';
            [ex1, ex2].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, ey, eyeR * 0.85, eyeR * 0.6, 0, 0, Math.PI * 2); ctx.fill(); });
            ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.arc(ex1 + eyeR * 0.25, ey - eyeR * 0.15, eyeR * 0.22, 0, Math.PI * 2); ctx.arc(ex2 + eyeR * 0.25, ey - eyeR * 0.15, eyeR * 0.22, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = shadeHex(def.darkColor, -0.15); ctx.lineWidth = r * 0.045;
            ctx.beginPath(); ctx.moveTo(ex1 - eyeR * 1.1, ey - eyeR * 0.6); ctx.lineTo(ex1 + eyeR * 0.9, ey - eyeR * 1.1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ex2 - eyeR * 0.9, ey - eyeR * 1.1); ctx.lineTo(ex2 + eyeR * 1.1, ey - eyeR * 0.6); ctx.stroke();
        }

        // ---- Arms + axe ----
        // Both arms reach in toward a diagonal haft rather than staying symmetric -
        // deliberate asymmetry against the otherwise-symmetric head/torso so the pose
        // reads as "gripping a weapon" instead of two decorative stub arms.
        let shoulderL = [-r * 0.85, 0], shoulderR = [r * 0.85, 0];
        let elbowL = [-r * 0.65, r * 0.5], elbowR = [r * 1.05, r * 0.35];
        let gripTop = [r * 0.5, r * 0.05];      // right hand: upper grip, near the axe head
        let gripBottom = [-r * 0.05, r * 0.78]; // left hand: lower grip, near the haft butt
        let haftTop = [r * 0.68, -r * 0.42];
        let haftButt = [-r * 0.18, r * 1.05];
        let skin = def.bodyColor;

        limbSegment(ctx, shoulderR[0], shoulderR[1], elbowR[0], elbowR[1], r * 0.14, skin);
        limbJoint(ctx, elbowR[0], elbowR[1], r * 0.13, skin);
        limbSegment(ctx, elbowR[0], elbowR[1], gripTop[0], gripTop[1], r * 0.12, skin);
        limbSegment(ctx, shoulderL[0], shoulderL[1], elbowL[0], elbowL[1], r * 0.14, skin);
        limbJoint(ctx, elbowL[0], elbowL[1], r * 0.13, skin);
        limbSegment(ctx, elbowL[0], elbowL[1], gripBottom[0], gripBottom[1], r * 0.12, skin);
        limbJoint(ctx, shoulderL[0], shoulderL[1], r * 0.15, skin);
        limbJoint(ctx, shoulderR[0], shoulderR[1], r * 0.15, skin);

        // haft
        ctx.strokeStyle = '#5c3a1e'; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(haftButt[0], haftButt[1]); ctx.lineTo(haftTop[0], haftTop[1]); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = r * 0.015;
        ctx.beginPath(); ctx.moveTo(haftButt[0], haftButt[1]); ctx.lineTo(haftTop[0], haftTop[1]); ctx.stroke();

        // axe head: bold single-edged crescent blade plus a small back-spike
        let tx = haftTop[0], ty = haftTop[1];
        ctx.fillStyle = '#c9cdd4';
        ctx.beginPath();
        ctx.moveTo(tx - r * 0.1, ty - r * 0.16);
        ctx.quadraticCurveTo(tx + r * 0.5, ty - r * 0.42, tx + r * 0.62, ty - r * 0.1);
        ctx.quadraticCurveTo(tx + r * 0.68, ty + r * 0.2, tx + r * 0.4, ty + r * 0.42);
        ctx.quadraticCurveTo(tx + r * 0.15, ty + r * 0.5, tx - r * 0.02, ty + r * 0.22);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = shadeHex('#c9cdd4', -0.25);
        ctx.beginPath();
        ctx.moveTo(tx + r * 0.62, ty - r * 0.1);
        ctx.quadraticCurveTo(tx + r * 0.68, ty + r * 0.2, tx + r * 0.4, ty + r * 0.42);
        ctx.lineTo(tx + r * 0.3, ty + r * 0.22);
        ctx.quadraticCurveTo(tx + r * 0.52, ty + r * 0.08, tx + r * 0.5, ty - r * 0.12);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#8a8f99'; // back spike
        ctx.beginPath();
        ctx.moveTo(tx - r * 0.1, ty - r * 0.16);
        ctx.lineTo(tx - r * 0.34, ty - r * 0.3);
        ctx.lineTo(tx - r * 0.08, ty + r * 0.04);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#4a4f58'; // collar where blade meets haft
        ctx.beginPath(); ctx.ellipse(tx, ty, r * 0.09, r * 0.13, 0.9, 0, Math.PI * 2); ctx.fill();

        // hands, drawn on top of the haft at each grip point so they read as gripping it
        limbJoint(ctx, gripTop[0], gripTop[1], r * 0.135, skin);
        limbJoint(ctx, gripBottom[0], gripBottom[1], r * 0.135, skin);
        limbJoint(ctx, gripTop[0] + r * 0.02, gripTop[1] + r * 0.02, r * 0.06, bodyDark);
        limbJoint(ctx, gripBottom[0] + r * 0.02, gripBottom[1] + r * 0.02, r * 0.06, bodyDark);
    };

    // ---- Desert Minotaur's bestiary entry ----
    window.enemyDB.boss_desertlion = { name: 'Desert Minotaur', desc: 'A hulking, horned brute of the dunes, an axe slung across its shoulders. Bellows a shockwave and charges like a sandstorm. 3 hits to topple.' };
})();
