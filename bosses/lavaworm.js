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

    // How long (in frames) the sink-into-ground and burst-out-of-ground visuals play.
    // Shared between the attack's own tick (which flags the burst) and the silhouette
    // (which renders it), so they can't drift out of sync.
    const LAVAWORM_HOP_FRAMES = 4;      // quick anticipation hop before diving
    const LAVAWORM_DIVE_FRAMES = 11;    // headfirst plunge into the ground
    const LAVAWORM_SINK_FRAMES = LAVAWORM_HOP_FRAMES + LAVAWORM_DIVE_FRAMES;
    const LAVAWORM_DIVE_ANGLE = 1.85;   // radians the body rotates through during the dive (~106°)
    const LAVAWORM_BURST_FRAMES = 26;

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
                exec: (e) => { e.burrowed = true; e._burstTimer = 0; e.slamTargetX = player.worldX; e.slamTargetY = player.worldY; bossTelegraphAoe(e, e.slamTargetX, e.slamTargetY, 100, 45); },
                tick: (e) => { if (e.stateTimer === 24) { e.x = e.slamTargetX; e.y = e.slamTargetY; e.burrowed = false; e._burstTimer = LAVAWORM_BURST_FRAMES; screenShake = Math.max(screenShake, 10); playSFX('enemy_hit'); } }
            },
            { // Ember Spray - rotating spiral of embers over a few ticks
                name: 'Ember Spray', telegraph: 60, duration: 40, cooldown: 160,
                exec: (e) => { e._sprayTicks = 5; e._sprayAngle = Math.random() * Math.PI * 2; },
                tick: (e) => { if (e._sprayTicks > 0 && e.stateTimer % 8 === 0) { e._sprayAngle += 0.9; for (let i = 0; i < 3; i++) { let a = e._sprayAngle + i * (Math.PI * 2 / 3); projectiles.push({ x: e.x, y: e.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, radius: 7, bossId: e.bossId }); } e._sprayTicks--; } }
            }
        ]
    };

    // ---- Lava Worm's own tiny deterministic hash (for jittering spikes/debris without flicker) ----
    function bossHash1(n) { let x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

    // ---- Lava Worm's visual design (silhouette) ----
    // Built from a chain of overlapping armor-plate segments that slither along an
    // undulating spine (not a fixed curl), each with a clear armored top and a
    // molten underbelly that's mostly hidden under the plate above it and the
    // next segment forward. Can sink underground and erupt back out for Burrow Strike.
    window.bossSilhouettes.lavaworm = (ctx, r, def, e) => {
        let t = (e.animTimer || 0);
        let hurting = (e.hitFlash || 0) > 0;
        let telegraphing = e.state === 'telegraph';
        let attacking = e.state === 'attack';
        let aggro = telegraphing || attacking;
        let burrowed = !!e.burrowed;
        if (e._burstTimer === undefined) e._burstTimer = 0;

        let hot = '#ffd27a', mid = def.bodyColor, rock = def.darkColor, crackGlow = '#fff2b0';
        let rim = 'rgba(20,6,2,0.82)';
        let bellyDeep = '#7a1206', bellyMid = '#ff7a30';

        // ==================================================================
        // Fully underground: skip the body entirely, just show a disturbed
        // patch of ground with a couple of pulsing cracks.
        // ==================================================================
        let sinkT = burrowed ? Math.min(1, (e.stateTimer || 0) / LAVAWORM_SINK_FRAMES) : 0;
        if (burrowed && sinkT >= 1) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#1a0a04';
            ctx.beginPath();
            for (let i = 0; i <= 14; i++) {
                let a = (i / 14) * Math.PI * 2;
                let jr = r * (0.62 + bossHash1(i * 5.1 + 2) * 0.12);
                let px = Math.cos(a) * jr, py = Math.sin(a) * jr * 0.42 + r * 0.1;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.strokeStyle = crackGlow; ctx.lineWidth = Math.max(1, r * 0.025);
            ctx.shadowColor = crackGlow; ctx.shadowBlur = r * 0.1;
            let pulse = 0.4 + 0.3 * Math.sin(t * 0.15);
            ctx.globalAlpha = pulse;
            for (let i = 0; i < 3; i++) {
                let a = i * 2.1 + Math.sin(t * 0.03 + i) * 0.2;
                ctx.beginPath();
                ctx.moveTo(0, r * 0.1);
                ctx.lineTo(Math.cos(a) * r * 0.45, r * 0.1 + Math.sin(a) * r * 0.18);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        // ==================================================================
        // Build the slithering spine: an undulating path trailing back from
        // the head, sampled finely so we can walk it by arc length.
        // ==================================================================
        const FN = 140;
        let totalLen = r * 3.55;
        let ampBase = r * 0.15;
        let waveCycles = 1.3;
        let waveSpeed = 0.045;

        let fine = new Array(FN + 1);
        for (let i = 0; i <= FN; i++) {
            let s = (i / FN) * totalLen;
            let u = s / totalLen;
            let amp = ampBase * (0.5 + 0.6 * u);
            let y = amp * Math.sin(u * waveCycles * Math.PI * 2 - t * waveSpeed);
            fine[i] = { x: -s, y: y };
        }
        let cum = new Array(FN + 1); cum[0] = 0;
        for (let i = 1; i <= FN; i++) {
            let dx = fine[i].x - fine[i - 1].x, dy = fine[i].y - fine[i - 1].y;
            cum[i] = cum[i - 1] + Math.hypot(dx, dy);
        }
        let arcTotal = cum[FN];
        function pointAtArc(target) {
            target = Math.max(0, Math.min(arcTotal, target));
            for (let i = 1; i <= FN; i++) {
                if (cum[i] >= target) {
                    let frac = (target - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
                    return { x: fine[i - 1].x + (fine[i].x - fine[i - 1].x) * frac, y: fine[i - 1].y + (fine[i].y - fine[i - 1].y) * frac };
                }
            }
            return fine[FN];
        }
        function tangentAtArc(target) {
            let eps = r * 0.02;
            let a = pointAtArc(target - eps), b = pointAtArc(target + eps);
            let dx = b.x - a.x, dy = b.y - a.y, dl = Math.hypot(dx, dy) || 1;
            return { x: dx / dl, y: dy / dl };
        }
        function radiusAt(u) { return Math.max(r * 0.055, r * 0.58 * (1 - Math.pow(u, 1.15) * 0.85)); }

        let segments = [];
        {
            let s = 0, prevR = null, guard = 0;
            while (s <= arcTotal && segments.length < 11 && guard < 60) {
                guard++;
                let uGuess = s / arcTotal;
                let rr = radiusAt(uGuess);
                let c = pointAtArc(s);
                let tg = tangentAtArc(s);
                let nrm = { x: -tg.y, y: tg.x }; // screen-up when tangent points left (dorsal side)
                segments.push({ c: c, t: tg, n: nrm, r: rr, u: uGuess, ang: Math.atan2(tg.y, tg.x) });
                let step = prevR === null ? rr * 0.85 : (prevR + rr) * 0.58;
                s += step;
                prevR = rr;
            }
        }
        let neck = segments[0];

        // ==================================================================
        // Transform state: idle / hop-and-dive (headfirst into the ground) /
        // unwind-and-pop (headfirst back out of the ground).
        // ==================================================================
        let bodyAlpha = 1, scaleAll = 1, rotation = 0, offY = 0;
        if (burrowed) {
            let st = e.stateTimer || 0;
            if (st < LAVAWORM_HOP_FRAMES) {
                // small anticipatory hop straight up before the plunge
                let hopP = st / LAVAWORM_HOP_FRAMES;
                offY = -Math.sin(hopP * Math.PI) * r * 0.24;
                scaleAll = 1 - Math.sin(hopP * Math.PI) * 0.05;
            } else {
                // headfirst dive: rotate nose-down and plunge in, accelerating
                let diveP = Math.min(1, (st - LAVAWORM_HOP_FRAMES) / LAVAWORM_DIVE_FRAMES);
                let eased = diveP * diveP;
                rotation = eased * LAVAWORM_DIVE_ANGLE;
                offY = eased * r * 0.95;
                scaleAll = 1 - eased * 0.3;
                bodyAlpha = diveP < 0.5 ? 1 : Math.max(0.05, 1 - (diveP - 0.5) / 0.5);
            }
        } else if (e._burstTimer > 0) {
            let p = 1 - e._burstTimer / LAVAWORM_BURST_FRAMES;
            // unwind the dive rotation quickly as it erupts, then settle upright
            let unwindP = Math.min(1, p / 0.5);
            rotation = (1 - unwindP) * LAVAWORM_DIVE_ANGLE;
            offY = (1 - unwindP) * r * 0.22;
            scaleAll = p < 0.6 ? (p / 0.6) * 1.16 : 1.16 - ((p - 0.6) / 0.4) * 0.16;
            bodyAlpha = Math.min(1, p / 0.2);
        }

        ctx.save();
        ctx.translate(0, offY);
        ctx.scale(scaleAll, scaleAll);

        // Soft ground shadow for weight - kept flat (unrotated) so it doesn't spin with the dive.
        ctx.save();
        ctx.globalAlpha = 0.26 * bodyAlpha; ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.ellipse(-r * 0.9, r * 0.5, r * 1.5, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        ctx.rotate(rotation);

        // ---- Body: draw tail-to-head so head-ward plates overlap the ones behind them ----
        for (let i = segments.length - 1; i >= 0; i--) {
            let seg = segments[i];
            let c = seg.c, tg = seg.t, nrm = seg.n, rr = seg.r, ang = seg.ang;

            // Underbelly: the full rounded body cross-section in molten tones. Most
            // of it gets covered by the armor dome (below) and by the next plate
            // toward the head, leaving a clear crescent showing along the bottom.
            ctx.globalAlpha = bodyAlpha;
            ctx.beginPath(); ctx.ellipse(c.x, c.y, rr * 1.05, rr * 0.90, ang, 0, Math.PI * 2);
            ctx.fillStyle = bellyDeep; ctx.fill();
            let bc2x = c.x - nrm.x * rr * 0.05, bc2y = c.y - nrm.y * rr * 0.05;
            ctx.beginPath(); ctx.ellipse(bc2x, bc2y, rr * 0.88, rr * 0.68, ang, 0, Math.PI * 2);
            ctx.fillStyle = bellyMid; ctx.fill();

            // Armor dome: sits high on the segment (offset toward the dorsal normal),
            // so only the top ~60% is covered - this is what leaves the belly showing.
            let shellCx = c.x + nrm.x * rr * 0.55, shellCy = c.y + nrm.y * rr * 0.55;
            let shellGrad = ctx.createRadialGradient(
                shellCx - tg.x * rr * 0.1 + nrm.x * rr * 0.12, shellCy - tg.y * rr * 0.1 + nrm.y * rr * 0.12, rr * 0.08,
                shellCx, shellCy, rr * 1.15
            );
            shellGrad.addColorStop(0, hot); shellGrad.addColorStop(0.55, mid); shellGrad.addColorStop(1, rock);
            ctx.beginPath(); ctx.ellipse(shellCx, shellCy, rr * 1.06, rr * 0.76, ang, 0, Math.PI * 2);
            ctx.fillStyle = shellGrad; ctx.fill();
            ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, rr * 0.06); ctx.stroke();

            // Seam shadow where this plate overlaps the one behind it (tail-ward edge).
            ctx.save();
            ctx.globalAlpha = 0.30 * bodyAlpha;
            let seamX = shellCx - tg.x * rr * 0.75, seamY = shellCy - tg.y * rr * 0.75;
            ctx.beginPath(); ctx.ellipse(seamX, seamY, rr * 0.5, rr * 0.62, ang, 0, Math.PI * 2);
            ctx.fillStyle = '#000'; ctx.fill();
            ctx.restore();

            // Dorsal spike, planted on the dome. Size/angle jittered per segment
            // (deterministic, so it doesn't flicker frame to frame). Tapered down on
            // the segments right behind the head so the horns read as the crest.
            let headTaper = 0.5 + 0.5 * Math.min(1, seg.u / 0.28);
            let jitter = (0.75 + bossHash1(i * 9.3) * 0.5) * headTaper;
            let spikeBaseX = shellCx + nrm.x * rr * 0.5, spikeBaseY = shellCy + nrm.y * rr * 0.5;
            let tipX = spikeBaseX + nrm.x * rr * 1.05 * jitter, tipY = spikeBaseY + nrm.y * rr * 1.05 * jitter;
            let leanX = tg.x * rr * 0.18 * (bossHash1(i * 4.4) - 0.5) * 2, leanY = tg.y * rr * 0.18 * (bossHash1(i * 4.4) - 0.5) * 2;
            let b0x = spikeBaseX - tg.x * rr * 0.32, b0y = spikeBaseY - tg.y * rr * 0.32;
            let b1x = spikeBaseX + tg.x * rr * 0.32, b1y = spikeBaseY + tg.y * rr * 0.32;
            ctx.beginPath();
            ctx.moveTo(b0x, b0y); ctx.lineTo(tipX + leanX, tipY + leanY); ctx.lineTo(b1x, b1y);
            ctx.closePath();
            ctx.fillStyle = '#e8ddc4'; ctx.fill();
            ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, rr * 0.04); ctx.stroke();

            // Glowing crack on every other plate.
            if (i % 2 === 0) {
                ctx.save();
                ctx.strokeStyle = crackGlow; ctx.lineWidth = Math.max(1, rr * 0.09);
                ctx.shadowColor = crackGlow; ctx.shadowBlur = rr * 0.25;
                ctx.globalAlpha = 0.7 * bodyAlpha;
                ctx.beginPath();
                ctx.moveTo(shellCx - tg.x * rr * 0.3 + nrm.x * rr * 0.3, shellCy - tg.y * rr * 0.3 + nrm.y * rr * 0.3);
                ctx.lineTo(shellCx + tg.x * rr * 0.35 - nrm.x * rr * 0.15, shellCy + tg.y * rr * 0.35 - nrm.y * rr * 0.15);
                ctx.stroke();
                ctx.restore();
            }
        }
        ctx.globalAlpha = bodyAlpha;

        // ==================================================================
        // Head, attached at the neck end, facing away from the body. Sized to
        // dominate the front of the creature, and built from the same rounded,
        // gradient-shaded language as the body plates so it reads as part of
        // the same animal rather than a separate piece stuck on the end.
        // ==================================================================
        let hr = r * 0.95;
        let fwd = { x: -neck.t.x, y: -neck.t.y };            // faces away from the body
        let perp = { x: -neck.n.x, y: -neck.n.y };           // +fy = ventral/jaw side, -fy = dorsal/horn side
        function pt(a, b) { return { x: fwd.x * a * hr + perp.x * b * hr, y: fwd.y * a * hr + perp.y * b * hr }; }
        function polyPts(pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); }
        // Rounds every corner of a polygon by curving through edge midpoints - gives the
        // head the same organic, sculpted feel as the body's ellipse-based plates instead
        // of a hard low-poly outline.
        function smoothPts(pts) {
            let n = pts.length;
            let start = { x: (pts[0].x + pts[n - 1].x) / 2, y: (pts[0].y + pts[n - 1].y) / 2 };
            ctx.beginPath(); ctx.moveTo(start.x, start.y);
            for (let i = 0; i < n; i++) {
                let cur = pts[i], next = pts[(i + 1) % n];
                let mid = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 };
                ctx.quadraticCurveTo(cur.x, cur.y, mid.x, mid.y);
            }
            ctx.closePath();
        }

        let jawOpen = hurting ? 0.55 : telegraphing ? 0.8 : attacking ? 1.15 : 0.72;
        let jo = jawOpen;

        // Nape/shoulder hump: a big rounded mass bridging the skull back into the
        // neck segment, shaded exactly like a body plate so head and body read as
        // one continuous animal with no visible seam.
        let napeC = pt(-0.58, -0.02);
        let napeHi = pt(-0.42, -0.22);
        let napeGrad = ctx.createRadialGradient(napeHi.x, napeHi.y, hr * 0.08, napeC.x, napeC.y, hr * 0.85);
        napeGrad.addColorStop(0, hot); napeGrad.addColorStop(0.55, mid); napeGrad.addColorStop(1, rock);
        ctx.beginPath(); ctx.ellipse(napeC.x, napeC.y, hr * 0.62, hr * 0.5, Math.atan2(fwd.y, fwd.x), 0, Math.PI * 2);
        ctx.fillStyle = napeGrad; ctx.fill();

        // Skull / upper jaw, lit from the dorsal side - rounded rather than faceted.
        let skull = [pt(-0.44, -0.62), pt(0.02, -0.86), pt(0.55, -0.57), pt(0.78, -0.10), pt(0.60, 0.18), pt(0.10, 0.08), pt(-0.28, 0.18), pt(-0.58, -0.14)];
        smoothPts(skull);
        let skullGrad = ctx.createRadialGradient(pt(0.1, -0.5).x, pt(0.1, -0.5).y, hr * 0.05, pt(0.1, -0.1).x, pt(0.1, -0.1).y, hr * 1.15);
        skullGrad.addColorStop(0, hot); skullGrad.addColorStop(0.5, mid); skullGrad.addColorStop(1, rock);
        ctx.fillStyle = skullGrad; ctx.fill();
        ctx.strokeStyle = rim; ctx.lineWidth = hr * 0.04; ctx.stroke();

        // Nostril slits.
        ctx.fillStyle = '#1c0603';
        [0.42, 0.30].forEach((fx, idx) => {
            let np = pt(fx, -0.38 + idx * 0.02);
            ctx.save(); ctx.translate(np.x, np.y); ctx.rotate(Math.atan2(fwd.y, fwd.x));
            ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.05, hr * 0.02, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        // Lower jaw, hinged open by jawOpen, shaded darker (in the skull's shadow).
        let lower = [pt(-0.34, 0.06), pt(0.12, 0.10), pt(0.68, 0.58 * jo), pt(0.34, 0.68 * jo), pt(-0.14, 0.36 * jo)];
        smoothPts(lower);
        let lowerGrad = ctx.createLinearGradient(pt(0, 0.05).x, pt(0, 0.05).y, pt(0.3, 0.5 * jo).x, pt(0.3, 0.5 * jo).y);
        lowerGrad.addColorStop(0, mid); lowerGrad.addColorStop(1, rock);
        ctx.fillStyle = lowerGrad; ctx.fill();
        ctx.strokeStyle = rim; ctx.lineWidth = hr * 0.045; ctx.stroke();

        // Jaw hinge shadow.
        ctx.save();
        ctx.globalAlpha = 0.35 * bodyAlpha;
        let hinge = pt(-0.15, 0.08);
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.ellipse(hinge.x, hinge.y, hr * 0.14, hr * 0.1, Math.atan2(fwd.y, fwd.x), 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Mouth interior + throat glow (brighter while attacking).
        polyPts([pt(0.06, 0.03), pt(0.58, 0.12 * jo), pt(0.58, 0.48 * jo), pt(0.16, 0.30 * jo)]);
        ctx.fillStyle = '#140404'; ctx.fill();
        let throatAlpha = (attacking ? 0.95 : telegraphing ? 0.6 : hurting ? 0.25 : 0.45) * bodyAlpha;
        ctx.save(); ctx.globalAlpha = throatAlpha; ctx.shadowColor = hot; ctx.shadowBlur = hr * 0.22;
        polyPts([pt(0.15, 0.10), pt(0.45, 0.16 * jo), pt(0.40, 0.34 * jo), pt(0.18, 0.24 * jo)]);
        ctx.fillStyle = '#ff7818'; ctx.fill();
        ctx.restore();

        // Fangs, upper and lower, with a subtle curved inner edge.
        let fangSets = [
            [0.10, 0.06, 0.19, 0.30 * jo, 0.05, 0.16],
            [0.30, 0.11, 0.43, 0.35 * jo, 0.25, 0.22],
            [0.49, 0.20, 0.62, 0.39 * jo, 0.44, 0.28],
            [0.15, 0.32 * jo, 0.22, 0.15, 0.29, 0.34 * jo],
            [0.36, 0.44 * jo, 0.42, 0.27, 0.50, 0.46 * jo]
        ];
        for (let f of fangSets) {
            let p0 = pt(f[0], f[1]), p1 = pt(f[2], f[3]), p2 = pt(f[4], f[5]);
            let mid_ = pt((f[0] + f[4]) / 2 - 0.02, (f[1] + f[5]) / 2);
            ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo(mid_.x, mid_.y, p2.x, p2.y); ctx.lineTo(p1.x, p1.y); ctx.closePath();
            ctx.fillStyle = '#efe6d2'; ctx.fill();
            ctx.strokeStyle = 'rgba(60,30,15,0.5)'; ctx.lineWidth = hr * 0.01; ctx.stroke();
        }

        // Back horns, gradient-shaded in the crown color, with a molten core at the base.
        let hornSets = [
            [-0.32, -0.38, -0.62, -0.85, -0.16, -0.52],
            [-0.02, -0.58, -0.12, -1.08, 0.18, -0.66],
            [0.28, -0.48, 0.44, -0.82, 0.42, -0.36]
        ];
        for (let hset of hornSets) {
            let p0 = pt(hset[0], hset[1]), p1 = pt(hset[2], hset[3]), p2 = pt(hset[4], hset[5]);
            ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.closePath();
            let hg = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
            hg.addColorStop(0, def.crownColor); hg.addColorStop(1, '#7a4a10');
            ctx.fillStyle = hg; ctx.fill();
            ctx.strokeStyle = '#4a2606'; ctx.lineWidth = hr * 0.025; ctx.stroke();
        }
        ctx.save();
        ctx.shadowColor = 'rgba(255,90,30,0.9)'; ctx.shadowBlur = hr * 0.22;
        ctx.fillStyle = '#ff3b30';
        let coreP = pt(-0.10, -0.5);
        ctx.beginPath(); ctx.arc(coreP.x, coreP.y, hr * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Brow ridge above the eye (more pronounced/angled while aggro).
        let browDrop = aggro ? -0.46 : -0.42;
        ctx.strokeStyle = rock; ctx.lineWidth = hr * 0.05; ctx.lineCap = 'round';
        let brow0 = pt(-0.22, browDrop + 0.02), brow1 = pt(0.14, browDrop - (aggro ? 0.06 : 0));
        ctx.beginPath(); ctx.moveTo(brow0.x, brow0.y); ctx.lineTo(brow1.x, brow1.y); ctx.stroke();

        // ---- Eye: idle glow, angry slit while aggro, wince while hurting ----
        let eyeP = pt(-0.02, -0.32);
        if (hurting) {
            ctx.strokeStyle = rock; ctx.lineWidth = hr * 0.06; ctx.lineCap = 'round';
            let a = pt(-0.14, -0.40), b = pt(0.10, -0.24);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        } else if (aggro) {
            ctx.save();
            ctx.shadowColor = '#fff6d8'; ctx.shadowBlur = hr * 0.16;
            let e0 = pt(-0.15, -0.34), e1 = pt(0.14, -0.29), e2 = pt(-0.02, -0.22);
            polyPts([e0, e1, e2]); ctx.fillStyle = '#fff6d8'; ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#2a0902';
            ctx.beginPath(); ctx.ellipse(eyeP.x, eyeP.y, hr * 0.05, hr * 0.05, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            let blinkPhase = t % 180;
            let blink = blinkPhase < 6 ? 0.15 : 1;
            ctx.save();
            ctx.translate(eyeP.x, eyeP.y);
            ctx.scale(1, blink);
            ctx.fillStyle = '#2a0902';
            ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.13, hr * 0.095, 0, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.shadowColor = hot; ctx.shadowBlur = hr * 0.1;
            ctx.fillStyle = hot;
            ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.055, hr * 0.055, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            ctx.restore();
            // tiny specular dot for life
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath(); ctx.ellipse(eyeP.x - hr * 0.03, eyeP.y - hr * 0.03 * blink, hr * 0.02, hr * 0.02, 0, 0, Math.PI * 2); ctx.fill();
        }

        // ---- Particles: ember burst while attacking, lazy rising embers while idle ----
        if (attacking) {
            for (let i = 0; i < 5; i++) {
                let a = -0.9 + i * 0.5 + Math.sin(t * 0.3 + i) * 0.15;
                let d = hr * (0.35 + 0.14 * ((t + i * 7) % 6));
                let ep = pt(0.35 + Math.cos(a) * d * 0.5, 0.25 + Math.sin(a) * d * 0.4);
                ctx.globalAlpha = (0.7 - (d / (hr * 1.2))) * bodyAlpha;
                ctx.fillStyle = i % 2 === 0 ? hot : crackGlow;
                ctx.beginPath(); ctx.arc(ep.x, ep.y, hr * 0.035, 0, Math.PI * 2); ctx.fill();
            }
        } else if (!hurting) {
            for (let i = 0; i < 3; i++) {
                let seed = i * 47.3;
                let phase = ((t * 0.9 + seed * 10) % 90) / 90;
                let ep = pt(0.3 + Math.sin(seed) * 0.15, 0.35 - phase * 0.9);
                ctx.globalAlpha = (1 - phase) * 0.75 * bodyAlpha;
                ctx.fillStyle = i % 2 === 0 ? hot : crackGlow;
                ctx.beginPath(); ctx.arc(ep.x, ep.y, hr * (0.03 + 0.015 * Math.sin(seed + t * 0.1)), 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore(); // matches the translate/scale save before the body loop

        // ==================================================================
        // Ground FX drawn undistorted (outside the sink/pop transform): dust
        // while sinking, and a dirt-and-cracks eruption right after emerging.
        // ==================================================================
        if (burrowed && sinkT < 1) {
            let st = e.stateTimer || 0;
            ctx.save();
            if (st < LAVAWORM_HOP_FRAMES) {
                // small poof where it pushes off for the hop
                let hopP = st / LAVAWORM_HOP_FRAMES;
                ctx.globalAlpha = 0.4 * Math.sin(hopP * Math.PI);
                ctx.fillStyle = rock;
                for (let i = 0; i < 4; i++) {
                    let a = i * 1.6 + bossHash1(i * 3.1) * 0.5;
                    let d = r * 0.22 * hopP;
                    ctx.beginPath(); ctx.arc(Math.cos(a) * d, r * 0.32 + Math.sin(a) * d * 0.3, r * 0.05, 0, Math.PI * 2); ctx.fill();
                }
            } else {
                // kicked-up dirt as it plunges in
                let diveP = Math.min(1, (st - LAVAWORM_HOP_FRAMES) / LAVAWORM_DIVE_FRAMES);
                ctx.globalAlpha = 0.6 * diveP;
                ctx.fillStyle = rock;
                for (let i = 0; i < 7; i++) {
                    let a = i * 0.9 + bossHash1(i * 3.3) * 0.6;
                    let d = r * (0.35 + diveP * 0.75) * (0.7 + bossHash1(i * 6.6) * 0.5);
                    let px = Math.cos(a) * d, py = r * (0.15 + diveP * 0.4) + Math.sin(a) * d * 0.3;
                    let ps = r * 0.06 * (0.5 + diveP);
                    ctx.beginPath(); ctx.arc(px, py, ps, 0, Math.PI * 2); ctx.fill();
                }
            }
            ctx.restore();
        }
        if (!burrowed && e._burstTimer > 0) {
            let p = 1 - e._burstTimer / LAVAWORM_BURST_FRAMES;
            ctx.save();
            // impact flash
            if (p < 0.35) {
                ctx.globalAlpha = (1 - p / 0.35) * 0.8;
                let fg = ctx.createRadialGradient(0, r * 0.2, 0, 0, r * 0.2, r * 1.1);
                fg.addColorStop(0, '#fff6d8'); fg.addColorStop(1, 'rgba(255,150,50,0)');
                ctx.fillStyle = fg;
                ctx.beginPath(); ctx.arc(0, r * 0.2, r * 1.1, 0, Math.PI * 2); ctx.fill();
            }
            // shockwave ring
            ctx.globalAlpha = Math.max(0, 1 - p) * 0.6;
            ctx.strokeStyle = crackGlow; ctx.lineWidth = Math.max(1, r * 0.05 * (1 - p));
            ctx.beginPath(); ctx.ellipse(0, r * 0.25, r * (0.3 + p * 1.3), r * (0.12 + p * 0.4), 0, 0, Math.PI * 2); ctx.stroke();
            // flying debris chunks
            ctx.globalAlpha = Math.max(0, 1 - p * 1.1);
            for (let i = 0; i < 8; i++) {
                let a = (i / 8) * Math.PI * 2 + bossHash1(i * 2.7);
                let dist = r * p * (1.1 + bossHash1(i * 5.5) * 0.6);
                let px = Math.cos(a) * dist, py = r * 0.25 + Math.sin(a) * dist * 0.55 - p * r * 0.3;
                let sz = r * (0.05 + bossHash1(i * 8.1) * 0.05);
                ctx.save();
                ctx.translate(px, py); ctx.rotate(a + p * 4);
                ctx.fillStyle = rock;
                ctx.beginPath(); ctx.moveTo(-sz, -sz * 0.7); ctx.lineTo(sz, -sz * 0.4); ctx.lineTo(sz * 0.6, sz * 0.8); ctx.lineTo(-sz * 0.7, sz * 0.6); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        }

        e._burstTimer = Math.max(0, e._burstTimer - 1);
    };

    // ---- Lava Worm's bestiary entry ----
    window.enemyDB.boss_lavaworm = { name: 'Lava Worm', desc: 'Burrows through molten rock, erupting in showers of magma. 3 hits to topple.' };
})();
