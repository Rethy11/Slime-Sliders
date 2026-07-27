// Galaxy rare skin — ambient/background stage effects only (sky color, starfield, nebula,
// distant planets, drifting asteroids in place of clouds, and the shooting-star sky
// animation). Rock/tree/hazard-tile reskins are specific interactions and stay in the main
// game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.galaxy = (function () {

    // Galaxy skin: deep-space gradient (near-black through nebula purple/magenta) behind the
    // starfield/nebula clouds/shooting stars, replacing the normal daytime blue.
    let skyCache = null, skyCacheH = -1;
    function buildSkyGradient(ctx, height) {
        if (!skyCache || skyCacheH !== height) {
            skyCache = ctx.createLinearGradient(0, 0, 0, height);
            skyCache.addColorStop(0, '#05020f'); skyCache.addColorStop(0.4, '#1b0c3d');
            skyCache.addColorStop(0.7, '#3a1361'); skyCache.addColorStop(1, '#6a2f8f');
            skyCacheH = height;
        }
        return skyCache;
    }

    // Soft, slow-drifting nebula clouds behind the starfield - tiled with a stable per-cell
    // seed so identity doesn't shift frame to frame, only the drift position and a gentle
    // pulse do. Each puff is a large, very translucent radial gradient blob so overlapping
    // puffs blend into wispy nebula color.
    function drawNebulaClouds(ctx, camera, canvas) {
        const spacingX = 520, spacingY = 480;
        let drift = (Date.now() / 1000) * 3;
        let iStart = Math.floor((camera.x - drift) / spacingX) - 1, iEnd = Math.ceil((camera.x + canvas.width - drift) / spacingX) + 1;
        let jStart = Math.floor(camera.y / spacingY) - 1, jEnd = Math.ceil((camera.y + canvas.height) / spacingY) + 1;
        const palette = ['rgba(255,64,158,0.16)', 'rgba(100,120,255,0.16)', 'rgba(64,220,220,0.13)', 'rgba(180,80,255,0.16)'];
        ctx.save();
        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                let seed = Math.abs(Math.sin(i * 17.13 + j * 55.71 + 8.6) * 33851.2); seed -= Math.floor(seed);
                if (seed > 0.55) continue; // keep nebula patches sparse
                let nx = i * spacingX + seed * 220 + drift, ny = j * spacingY + ((seed * 61) % 1) * 220;
                let size = 160 + seed * 180;
                let pulse = 0.85 + 0.15 * Math.sin(Date.now() / 2400 + seed * 30);
                let grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, size * pulse);
                let col = palette[Math.floor(seed * palette.length) % palette.length];
                grad.addColorStop(0, col); grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(nx, ny, size * pulse, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }

    // A couple of distant ringed/cratered planets, fixed in world space like the sun glow,
    // drifting past very slowly for a sense of scale behind the starfield.
    function drawDistantPlanets(ctx, camera, canvas) {
        const spacingX = 2200, spacingY = 1900;
        let drift = (Date.now() / 1000) * 1.2;
        let iStart = Math.floor((camera.x - drift) / spacingX) - 1, iEnd = Math.ceil((camera.x + canvas.width - drift) / spacingX) + 1;
        let jStart = Math.floor(camera.y / spacingY) - 1, jEnd = Math.ceil((camera.y + canvas.height) / spacingY) + 1;
        ctx.save();
        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                let seed = Math.abs(Math.sin(i * 63.7 + j * 11.3 + 3.2) * 19483.7); seed -= Math.floor(seed);
                if (seed > 0.35) continue; // one planet per several tiles, at most
                let px = i * spacingX + seed * 500 + drift, py = j * spacingY + ((seed * 37) % 1) * 500;
                let pr = 26 + seed * 34;
                let ringed = seed > 0.18;
                let bodyColor = seed > 0.27 ? '#e08a4b' : (seed > 0.09 ? '#7a5cff' : '#4fb8b0');
                if (ringed) {
                    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35);
                    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = pr * 0.16;
                    ctx.beginPath(); ctx.ellipse(0, 0, pr * 1.7, pr * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
                    ctx.restore();
                }
                let bodyGrad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
                bodyGrad.addColorStop(0, '#fff'); bodyGrad.addColorStop(0.15, bodyColor); bodyGrad.addColorStop(1, 'rgba(10,5,20,0.9)');
                ctx.fillStyle = bodyGrad;
                ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }

    // Sparse twinkling stars tiled the same way as the cloud/bird layers (stable per-cell
    // seed so identity doesn't shift frame-to-frame, only twinkle brightness does), drawn
    // over the sky while the Galaxy rare skin is equipped.
    function drawGalaxyStars(ctx, camera, canvas) {
        const spacingX = 130, spacingY = 130;
        let iStart = Math.floor(camera.x / spacingX) - 2, iEnd = Math.ceil((camera.x + canvas.width) / spacingX) + 2;
        let jStart = Math.floor(camera.y / spacingY) - 2, jEnd = Math.ceil((camera.y + canvas.height) / spacingY) + 2;
        ctx.save(); ctx.fillStyle = '#fff';
        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                let seed = Math.abs(Math.sin(i * 12.9898 + j * 78.233 + 42.13) * 43758.5453); seed -= Math.floor(seed);
                if (seed > 0.3) continue;
                let sx = i * spacingX + seed * 90, sy = j * spacingY + ((seed * 53) % 1) * 90;
                ctx.globalAlpha = 0.35 + 0.35 * Math.sin(Date.now()/500 + seed*25);
                ctx.beginPath(); ctx.arc(sx, sy, 1 + seed * 1.4, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }

    // Shooting stars streak across the sky on a timer, spawned only while the Galaxy skin
    // is equipped (spawnIfDue, called from that skin's branch), but advanced/culled every
    // tick regardless of currently-equipped skin so any already in flight finish their arc
    // even if the player switches away mid-animation (advanceAndCull, called unconditionally
    // each physics tick). Both mutate the main script's own shootingStars array in place so
    // it stays the single source of truth; draw() renders them with a fading tail, in the
    // same world-space convention as the stars above.
    function spawnIfDue(shootingStars, shootingStarTimer, camera, canvas) {
        shootingStarTimer -= 1;
        if (shootingStarTimer <= 0) {
            shootingStarTimer = 90 + Math.random() * 150;
            let sx = camera.x - 100, sy = camera.y + Math.random() * canvas.height * 0.5;
            shootingStars.push({ x: sx, y: sy, vx: 9 + Math.random()*4, vy: 3 + Math.random()*2, life: 1 });
        }
        return shootingStarTimer;
    }
    function advanceAndCull(shootingStars) {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let s = shootingStars[i];
            s.x += s.vx; s.y += s.vy; s.life -= 0.012;
            if (s.life <= 0) shootingStars.splice(i, 1);
        }
    }
    function drawShootingStars(ctx, shootingStars) {
        if (!shootingStars.length) return;
        ctx.save();
        for (let i = 0; i < shootingStars.length; i++) {
            let s = shootingStars[i];
            let tailX = s.x - s.vx * 6, tailY = s.y - s.vy * 6;
            let grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255,255,255,${s.life})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tailX, tailY); ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${s.life})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, 1.8, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }

    // Large tumbling asteroids drift across the sky in place of the normal puffy clouds.
    // Tiled the same stable-seed way as the cloud layer (identity comes from the integer
    // tile index, only the final draw position depends on drift) so they glide smoothly
    // rather than morphing, but each one also spins continuously at its own independent
    // rate/phase derived from its seed, so a whole field of them never spins in lockstep.
    function drawAsteroidLayer(ctx, camera, canvas, spacingX, spacingY, drift, sizeBase, sizeVar, seedOffset, colorRGB, alpha) {
        let iStart = Math.floor((camera.x - drift) / spacingX) - 1;
        let iEnd = Math.ceil((camera.x + canvas.width - drift) / spacingX) + 1;
        let jStart = Math.floor(camera.y / spacingY) - 1;
        let jEnd = Math.ceil((camera.y + canvas.height) / spacingY) + 1;
        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                let seed = Math.abs(Math.sin(i * 12.9898 + j * 78.233 + seedOffset) * 43758.5453);
                seed -= Math.floor(seed);
                let cx = i * spacingX + seed * 140 + drift;
                let cy = j * spacingY + ((seed * 71) % 1) * 120;
                drawAsteroidPuff(ctx, cx, cy, sizeBase + seed * sizeVar, seed, colorRGB, alpha);
            }
        }
    }
    // Draws one tumbling asteroid: a lumpy, irregular rock silhouette (fixed shape per seed)
    // with a few shaded craters, continuously rotated at a seed-derived rate/phase.
    function drawAsteroidPuff(ctx, cx, cy, size, seed, colorRGB, alpha) {
        ctx.save();
        ctx.translate(cx, cy);
        let spinSpeed = 0.15 + seed * 0.35;
        ctx.rotate((Date.now() / 1000) * spinSpeed + seed * 20);
        ctx.fillStyle = `rgba(${colorRGB},${alpha})`;
        const pts = 9;
        ctx.beginPath();
        for (let k = 0; k <= pts; k++) {
            let a = (k / pts) * Math.PI * 2;
            let wob = 0.7 + 0.3 * Math.sin(a * 3 + seed * 40) + 0.15 * Math.sin(a * 7 + seed * 13);
            let rad = size * wob;
            let px = Math.cos(a) * rad, py = Math.sin(a) * rad * 0.85;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(40,36,32,${alpha * 0.55})`;
        for (let c = 0; c < 3; c++) {
            let ca = seed * 30 + c * 2.4;
            let cr = size * (0.18 + ((seed * (c + 3)) % 1) * 0.12);
            let ccx = Math.cos(ca) * size * 0.35, ccy = Math.sin(ca) * size * 0.3;
            ctx.beginPath(); ctx.ellipse(ccx, ccy, cr, cr * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    // Hazard pockets become miniature black holes instead of the theme's usual water/lava/
    // ice - drawBlackHoleSwirl paints a swirling accretion disk on top of this near-black
    // base, with the edge doubling as the glowing accretion-disk color.
    function getHazardTheme(baseHazardType) {
        return { type: baseHazardType, color: '#020103', edge: '#ff8a3d' };
    }

    // Every rock renders as a cratered chunk of moon rock instead of its usual theme art -
    // pale lunar grey with a handful of shaded craters, a soft rim highlight on each, and
    // an occasional glinting mineral fleck.
    function drawMoonRock(ctx, x, y, radius) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + radius * 0.18, radius * 1.05, radius * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        let baseGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        baseGrad.addColorStop(0, '#e2ded6'); baseGrad.addColorStop(0.5, '#aca69c'); baseGrad.addColorStop(1, '#6d675e');
        ctx.fillStyle = baseGrad;
        ctx.beginPath(); ctx.arc(x, y, radius, Math.PI, 0, false);
        ctx.lineTo(x + radius * 0.9, y + radius * 0.18);
        ctx.quadraticCurveTo(x, y + radius * 0.35, x - radius * 0.9, y + radius * 0.18);
        ctx.closePath(); ctx.fill();
        // A few fixed-relative craters (stable per-rock since they're expressed purely as
        // fractions of x/y/radius, not random each frame).
        const craters = [[-0.32, -0.28, 0.22], [0.26, -0.12, 0.15], [0.02, 0.12, 0.13], [-0.08, -0.5, 0.09]];
        ctx.fillStyle = 'rgba(68,64,58,0.55)';
        for (let i = 0; i < craters.length; i++) {
            let cr = craters[i];
            ctx.beginPath(); ctx.ellipse(x + cr[0] * radius, y + cr[1] * radius, radius * cr[2], radius * cr[2] * 0.72, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        for (let i = 0; i < craters.length; i++) {
            let cr = craters[i];
            ctx.beginPath(); ctx.ellipse(x + cr[0] * radius, y + cr[1] * radius - radius * cr[2] * 0.15, radius * cr[2], radius * cr[2] * 0.72, 0, Math.PI, Math.PI * 2); ctx.stroke();
        }
        // Rare glinting mineral fleck, timed off position so it isn't perfectly synced
        // across every rock on screen.
        if (Math.sin(Date.now() / 500 + x * 0.05) > 0.9) {
            ctx.fillStyle = 'rgba(190,225,255,0.9)';
            ctx.beginPath(); ctx.arc(x + radius * 0.3, y - radius * 0.35, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - radius * 0.3, y - radius * 0.75); ctx.lineTo(x + radius * 0.15, y - radius * 0.55); ctx.stroke();
        ctx.restore();
    }

    // Every tree renders as a bioluminescent alien plant instead of its usual foliage - a
    // dark stalk rising from a mound of alien soil, a cluster of curling tendrils tipped
    // with pulsing glow-pods, and a larger glowing bud at the top. Sways gently the same
    // way trees do, keyed off the tree's own seed so neighboring plants don't pulse in
    // lockstep.
    function drawAlienPlant(ctx, x, y, radius, seed) {
        ctx.save();
        let t = Date.now();
        let sway = Math.sin(t / 1400 + seed) * 0.08;
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(x, y + radius * 0.5, radius * 0.85, radius * 0.38, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#241537'; ctx.beginPath(); ctx.ellipse(x, y + radius * 0.25, radius * 0.55, radius * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3d2461'; ctx.lineWidth = radius * 0.22; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y + radius * 0.15); ctx.quadraticCurveTo(x + sway * radius * 2, y - radius * 0.6, x + sway * radius * 3, y - radius * 1.3); ctx.stroke();
        const tendrilCount = 3;
        for (let i = 0; i < tendrilCount; i++) {
            let a = (i / tendrilCount) * Math.PI * 2 + seed * 3;
            let tx = x + Math.cos(a) * radius * 0.5, ty = y + radius * 0.05 + Math.sin(a) * radius * 0.15;
            let tipX = tx + Math.cos(a + sway * 2) * radius * 0.9, tipY = ty - radius * 0.9 + Math.sin(a) * radius * 0.2;
            ctx.strokeStyle = '#4a2f73'; ctx.lineWidth = radius * 0.1;
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * radius * 0.4, ty - radius * 0.5, tipX, tipY); ctx.stroke();
            let glow = 0.6 + 0.4 * Math.sin(t / 300 + i * 2 + seed * 5);
            let pulseR = radius * 0.16 * (0.85 + 0.15 * glow);
            let glowColor = i % 2 === 0 ? '100,255,220' : '255,110,220';
            let grad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, pulseR * 2.2);
            grad.addColorStop(0, `rgba(${glowColor},${0.9 * glow})`); grad.addColorStop(1, `rgba(${glowColor},0)`);
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(tipX, tipY, pulseR * 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = i % 2 === 0 ? '#7dffe0' : '#ff8ce0';
            ctx.beginPath(); ctx.arc(tipX, tipY, pulseR * 0.55, 0, Math.PI * 2); ctx.fill();
        }
        let mx = x + Math.sin(sway * 3) * radius * 0.3, my = y - radius * 1.15;
        let mainGlow = 0.7 + 0.3 * Math.sin(t / 260 + seed * 4);
        let mgrad = ctx.createRadialGradient(mx, my, 0, mx, my, radius * 0.6 * mainGlow);
        mgrad.addColorStop(0, `rgba(190,140,255,${0.85 * mainGlow})`); mgrad.addColorStop(1, 'rgba(190,140,255,0)');
        ctx.fillStyle = mgrad; ctx.beginPath(); ctx.arc(mx, my, radius * 0.6 * mainGlow, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c9a3ff'; ctx.beginPath(); ctx.arc(mx, my, radius * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // Hazard pockets are miniature black holes - a near-black core, a rotating multi-band
    // accretion disk (orange/violet), a scatter of particles spiraling inward on a
    // repeating cycle, and a bright thin event-horizon ring. Purely a function of
    // time/position, so it never needs any persistent state and reads consistently within
    // whatever clip is already active (see the main script's drawHazardHoles).
    // PERF: the 3 band gradients + 1 core gradient below depend only on `span` (which is
    // always HEX_SIZE - every hazard hole is the same size) and the fixed per-band hue, not
    // on tile position - they're identical for every hazard tile, every frame. Built once
    // here in *local* (post-translate) coordinates and cached.
    let blackHoleGradCache = null;
    function getBlackHoleGradients(ctx, span) {
        if (blackHoleGradCache && blackHoleGradCache.span === span) return blackHoleGradCache;
        let bands = [];
        for (let i = 0; i < 3; i++) {
            let bandR = span * (0.5 + i * 0.16);
            let bandGrad = ctx.createLinearGradient(-bandR, 0, bandR, 0);
            let hue = i % 2 === 0 ? 'rgba(255,138,61,' : 'rgba(157,78,221,';
            bandGrad.addColorStop(0, hue + '0)'); bandGrad.addColorStop(0.5, hue + '0.6)'); bandGrad.addColorStop(1, hue + '0)');
            bands.push(bandGrad);
        }
        let coreR = span * 0.34;
        let coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
        coreGrad.addColorStop(0, '#000000'); coreGrad.addColorStop(0.75, '#050208'); coreGrad.addColorStop(1, 'rgba(5,2,8,0)');
        blackHoleGradCache = { span, bands, coreGrad };
        return blackHoleGradCache;
    }

    function drawBlackHoleSwirl(ctx, cx, cy, span) {
        ctx.save();
        let t = Date.now() / 1000;
        let coreR = span * 0.34;
        let grads = getBlackHoleGradients(ctx, span);

        // Rotating accretion disk bands, drawn as thick partial-ellipse strokes so they
        // read as matter smeared around the core rather than solid rings.
        for (let i = 0; i < 3; i++) {
            let ang = t * (1.1 + i * 0.35) + i * 2.4;
            let bandR = span * (0.5 + i * 0.16);
            ctx.strokeStyle = grads.bands[i]; ctx.lineWidth = 3 - i * 0.5;
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
            ctx.beginPath(); ctx.ellipse(0, 0, bandR, bandR * 0.32, 0, 0, Math.PI * 1.4); ctx.stroke();
            ctx.restore();
        }

        // Particles spiraling inward on a repeating cycle (golden-ratio spacing keeps
        // them from clumping), fading in from the rim and vanishing at the core.
        ctx.fillStyle = '#fff';
        for (let p = 0; p < 9; p++) {
            let seed = (p * 0.618034) % 1;
            let cycle = (t * 0.5 + seed) % 1;
            let rad = span * (1 - cycle) * 0.95;
            let ang2 = seed * Math.PI * 2 + cycle * Math.PI * 7;
            let px = cx + Math.cos(ang2) * rad, py = cy + Math.sin(ang2) * rad * 0.55;
            ctx.globalAlpha = Math.min(1, cycle * 2) * (1 - cycle * 0.3);
            ctx.beginPath(); ctx.arc(px, py, 1.3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Near-black core with a soft inner falloff, then a crisp bright event-horizon
        // ring right at its edge.
        ctx.save(); ctx.translate(cx, cy);
        ctx.fillStyle = grads.coreGrad;
        ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    return {
        buildSkyGradient, drawNebulaClouds, drawDistantPlanets, drawGalaxyStars,
        spawnIfDue, advanceAndCull, drawShootingStars, drawAsteroidLayer, drawAsteroidPuff,
        getHazardTheme, drawMoonRock, drawAlienPlant, drawBlackHoleSwirl
    };
})();
