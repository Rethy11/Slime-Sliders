// The Void rare skin — ambient/background stage effects only (sky color + the map-wide
// desaturation filter). Rock/tree/hazard-tile reskins (drawFleshRock, drawVoidTentacle,
// getActiveHazardTheme's void branch, etc.) are specific interactions and stay in the
// main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.void = (function () {

    // Void's map-wide desaturation used to rely on `ctx.filter = 'grayscale(1)'`. Support
    // for CanvasRenderingContext2D.filter is inconsistent across browsers/webviews (notably
    // several mobile WebViews silently no-op it instead of erroring), so instead of trusting
    // the browser to grayscale pixels for us, we intercept every fillStyle/strokeStyle
    // assignment on the main offscreen ctx and convert the color ourselves whenever the
    // supplied isActiveFn() is true. This produces identical results everywhere, regardless
    // of ctx.filter support. Solid hex/rgb/rgba strings are converted; gradients and patterns
    // are passed through unchanged (see the main script's sun-glow skip for the one gradient
    // that needed separate handling).
    function toGrayscaleColor(input) {
        if (typeof input !== 'string') return input;
        let hexMatch = input.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
        if (hexMatch) {
            let hex = hexMatch[1], r, g, b;
            if (hex.length === 3) { r = parseInt(hex[0] + hex[0], 16); g = parseInt(hex[1] + hex[1], 16); b = parseInt(hex[2] + hex[2], 16); }
            else { r = parseInt(hex.slice(0, 2), 16); g = parseInt(hex.slice(2, 4), 16); b = parseInt(hex.slice(4, 6), 16); }
            let l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            return `rgb(${l},${l},${l})`;
        }
        let rgbMatch = input.match(/^rgba?\(([^)]+)\)$/);
        if (rgbMatch) {
            let parts = rgbMatch[1].split(',').map(s => s.trim());
            let r = parseFloat(parts[0]), g = parseFloat(parts[1]), b = parseFloat(parts[2]);
            let l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            return parts.length > 3 ? `rgba(${l},${l},${l},${parts[3]})` : `rgb(${l},${l},${l})`;
        }
        return input;
    }

    // Installs the fillStyle/strokeStyle interceptor described above onto the given canvas
    // context. isActiveFn is a zero-arg callback the main script supplies so this module
    // doesn't need to own the (frequently toggled, by specific-interaction code) active flag
    // itself — it just asks whether desaturation is on right now, every time a color is set.
    function installGrayscaleIntercept(ctx, isActiveFn) {
        let proto = Object.getPrototypeOf(ctx);
        let fillDesc = Object.getOwnPropertyDescriptor(proto, 'fillStyle');
        let strokeDesc = Object.getOwnPropertyDescriptor(proto, 'strokeStyle');
        Object.defineProperty(ctx, 'fillStyle', {
            set(v) { fillDesc.set.call(this, isActiveFn() ? toGrayscaleColor(v) : v); },
            get() { return fillDesc.get.call(this); }
        });
        Object.defineProperty(ctx, 'strokeStyle', {
            set(v) { strokeDesc.set.call(this, isActiveFn() ? toGrayscaleColor(v) : v); },
            get() { return strokeDesc.get.call(this); }
        });
    }

    // The Void skin darkens the outer sky to black/purple instead of the normal blue -
    // cached the same way as the base sky gradient, keyed off canvas height so a resize
    // correctly invalidates and rebuilds it.
    let cache = null, cacheH = -1;
    function buildSkyGradient(ctx, height) {
        if (!cache || cacheH !== height) {
            cache = ctx.createLinearGradient(0, 0, 0, height);
            cache.addColorStop(0, '#010001'); cache.addColorStop(0.55, '#0c0507'); cache.addColorStop(1, '#1c0e10');
            cacheH = height;
        }
        return cache;
    }

    // The Void skin darkens hazard water/lava/ice pockets to black/deep-purple instead of
    // the theme's usual palette. Everything else about the hazard (its type/behavior) is
    // untouched - purely a visual override consumed by the main script's drawHazardHoles/
    // drawHazardTexture.
    function getHazardTheme(baseHazardType) {
        return { type: baseHazardType, color: '#0d0621', edge: '#4b0082' };
    }

    // Every rock renders as a pulsing, oozing mass of red flesh instead of its usual theme
    // art - the one thing besides the blinking decor eyes that stays in full color while
    // the rest of the map desaturates, so it saves/restores its own filter rather than
    // relying on the grayscale toggle set once at the top of draw(). setGrayscaleActive is
    // the main script's own setter for its voidGrayscaleActive flag, passed in so this
    // module doesn't need to own that flag itself.
    function drawFleshRock(ctx, x, y, radius, setGrayscaleActive) {
        ctx.save();
        setGrayscaleActive(false);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + radius * 0.18, radius * 1.05, radius * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        let t = Date.now();
        let pulse = 0.5 + 0.5 * Math.sin(t / 900 + x * 0.01);
        let grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, radius * 0.1, x, y, radius * 1.1);
        grad.addColorStop(0, `rgba(255,100,95,${0.9 + 0.1 * pulse})`); grad.addColorStop(0.45, '#a5121f'); grad.addColorStop(1, '#43060c');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, radius, Math.PI, 0, false);
        ctx.lineTo(x + radius * 0.9, y + radius * 0.18);
        ctx.quadraticCurveTo(x, y + radius * 0.35, x - radius * 0.9, y + radius * 0.18);
        ctx.closePath(); ctx.fill();
        // Dark, thread-like veins across the surface.
        ctx.strokeStyle = 'rgba(25,0,4,0.55)'; ctx.lineWidth = 1.5;
        const veins = [[-0.3, -0.2, 0.2, -0.5], [0.1, 0.05, 0.35, -0.4], [-0.1, 0.15, -0.4, 0.3]];
        for (let i = 0; i < veins.length; i++) {
            let v = veins[i];
            ctx.beginPath(); ctx.moveTo(x + v[0] * radius, y + v[1] * radius);
            ctx.quadraticCurveTo(x + (v[0] + v[2]) * 0.5 * radius, y + (v[1] + v[3]) * 0.5 * radius - radius * 0.1, x + v[2] * radius, y + v[3] * radius);
            ctx.stroke();
        }
        // Wet, glistening highlight.
        ctx.fillStyle = `rgba(255,205,200,${0.3 + 0.2 * pulse})`;
        ctx.beginPath(); ctx.ellipse(x - radius * 0.35, y - radius * 0.4, radius * 0.22, radius * 0.12, -0.4, 0, Math.PI * 2); ctx.fill();
        // A slow drip of ooze forming and stretching down one side.
        let dripLen = radius * (0.25 + 0.3 * pulse);
        ctx.fillStyle = '#7a0d16';
        ctx.beginPath();
        ctx.moveTo(x + radius * 0.5 - radius * 0.05, y + radius * 0.1);
        ctx.lineTo(x + radius * 0.5 + radius * 0.05, y + radius * 0.1);
        ctx.quadraticCurveTo(x + radius * 0.58, y + radius * 0.1 + dripLen * 0.6, x + radius * 0.5, y + radius * 0.1 + dripLen);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(x + radius * 0.5, y + radius * 0.1 + dripLen, radius * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        setGrayscaleActive(true);
    }

    // Every tree renders as a single dark tentacle rising from a pool of black ooze, bent
    // toward the player as if being drawn in by the player's own gravity. The bend is
    // driven purely by the tree's current position relative to the player's world position
    // (passed in as playerWorldX/Y) - there's no idle sway or independent motion like the
    // other rare-skin foliage; a stationary player means a perfectly still tentacle. Only
    // the tip's eye-glow pulses (a timer-driven opacity flicker, not movement) to keep it
    // feeling alive.
    //
    // The tentacle is built out of SEG_COUNT rigid segments, base to tip, rather than one
    // smooth bezier bent uniformly from its base. Each segment gets its own "give"
    // threshold on `strength` before it starts rotating away from straight-up: the base
    // segment has a high threshold (it's thick/rooted and only leans once the player is
    // right on top of it), while the tip segment has essentially none (it's thin and
    // whip-like, so it's the first thing pulled over even at long range). This makes the
    // tentacle read as whipping over from the tip first and the bend progressively
    // travelling down toward the base as the player gets closer, instead of the whole
    // thing pivoting from its root immediately. normalizeAngle is the main script's own
    // generic angle-wrapping helper, passed in rather than duplicated here; cubicPoint/
    // cubicTangentAngle are no longer needed since the tentacle is a polyline of segments
    // rather than a single cubic bezier, but are still accepted as parameters to avoid
    // touching every call site in the main script.
    function drawVoidTentacle(ctx, x, y, radius, seed, playerWorldX, playerWorldY, setGrayscaleActive, normalizeAngle, cubicPoint, cubicTangentAngle) {
        ctx.save();
        // Pool of ooze at the base.
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(x, y + radius * 0.5, radius * 0.85, radius * 0.35, 0, 0, Math.PI * 2); ctx.fill();

        let ddx = playerWorldX - x, ddy = playerWorldY - y;
        let distToPlayer = Math.hypot(ddx, ddy);
        let targetAngle = Math.atan2(ddy, ddx);
        let upAngle = -Math.PI / 2;
        let angleDiff = normalizeAngle(targetAngle - upAngle);

        // strength: 0 far away (tentacle stands straight up, no bend anywhere) -> 1 right
        // at the player (full bend, tip-to-base). The steep exponent keeps strength near
        // zero across most of maxReach and only ramps up sharply in the last stretch, so
        // distant trees read as basically inert and the effect is strongest only when the
        // player is practically touching the tree.
        let maxReach = 560;
        let strength = Math.max(0, 1 - distToPlayer / maxReach);
        strength = Math.pow(strength, 2.4);

        let len = radius * (2.1 + 0.7 * strength);
        let baseX = x, baseY = y + radius * 0.1;

        // Build the tentacle as a chain of rigid segments. Segment 0 is rooted at the
        // base and points straight up until strength is high; segment SEG_COUNT-1 is the
        // tip and starts swinging toward the player as soon as strength is above zero.
        const SEG_COUNT = 6;
        // How much "give" the base segment holds in reserve - it only reaches full bend
        // once strength is within (1 - BASE_STIFFNESS) of max, i.e. the player is nearly
        // touching the tree.
        const BASE_STIFFNESS = 0.88;
        let segLen = len / SEG_COUNT;
        let points = [{ x: baseX, y: baseY }];
        let segAngles = [];
        for (let i = 0; i < SEG_COUNT; i++) {
            let tipness = SEG_COUNT === 1 ? 1 : i / (SEG_COUNT - 1); // 0 at base segment, 1 at tip segment
            let threshold = (1 - tipness) * BASE_STIFFNESS;
            let local = strength <= threshold ? 0 : (strength - threshold) / (1 - threshold);
            local = Math.min(1, Math.max(0, local));
            local = local * local * (3 - 2 * local); // smoothstep, for a softer transition along the length
            let segAngle = upAngle + angleDiff * local;
            segAngles.push(segAngle);
            let prev = points[points.length - 1];
            points.push({ x: prev.x + Math.cos(segAngle) * segLen, y: prev.y + Math.sin(segAngle) * segLen });
        }
        let tipX = points[SEG_COUNT].x, tipY = points[SEG_COUNT].y;

        // Interpolates a point and tangent angle at fraction t (0=base, 1=tip) along the
        // segment chain, for placing the suction-ridge decals below.
        function chainPointAt(t) {
            let target = t * (points.length - 1);
            let idx = Math.min(points.length - 2, Math.floor(target));
            let frac = target - idx;
            let p0 = points[idx], p1 = points[idx + 1];
            return { x: p0.x + (p1.x - p0.x) * frac, y: p0.y + (p1.y - p0.y) * frac, angle: Math.atan2(p1.y - p0.y, p1.x - p0.x) };
        }

        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = '#180e28'; ctx.lineWidth = radius * 0.44;
        ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
        // Faint violet underbelly stripe for dimension.
        ctx.strokeStyle = '#3d2461'; ctx.lineWidth = radius * 0.18;
        ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();

        // Suction ridges along the curve.
        const ridgeTs = [0.32, 0.52, 0.72];
        for (let rt of ridgeTs) {
            let pt = chainPointAt(rt);
            ctx.save();
            ctx.translate(pt.x, pt.y); ctx.rotate(pt.angle + Math.PI / 2);
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.beginPath(); ctx.ellipse(0, 0, radius * 0.17 * (1 - rt * 0.25), radius * 0.09, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        // Glowing eye at the tip, pupil oriented toward the player. Exempted from the
        // map's grayscale filter the same way the ground-level blinking eyes and the
        // fleshy rocks are - eyes stay in full color everywhere in Void.
        ctx.save();
        setGrayscaleActive(false);
        let glow = 0.7 + 0.3 * Math.sin(Date.now() / 450 + seed * 6);
        let egrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, radius * 0.55 * glow);
        egrad.addColorStop(0, `rgba(210,170,255,${0.8 * glow})`); egrad.addColorStop(1, 'rgba(210,170,255,0)');
        ctx.fillStyle = egrad; ctx.beginPath(); ctx.arc(tipX, tipY, radius * 0.55 * glow, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8d5ff'; ctx.beginPath(); ctx.arc(tipX, tipY, radius * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.save();
        ctx.translate(tipX, tipY); ctx.rotate(targetAngle + Math.PI / 2);
        ctx.fillStyle = '#0a0512';
        ctx.beginPath(); ctx.ellipse(0, 0, radius * 0.05, radius * 0.19, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.restore();
        setGrayscaleActive(true);

        ctx.restore();
    }

    // Every grass/flower/leaf speck renders as either a tiny drifting mote of dust (mostly
    // white or grey, ignoring the speck's usual theme color) or, rarely, a larger blinking
    // eye watching from the ground. Which one a given speck is comes from a stable hash of
    // its fixed world position, so the same specks are always eyes every frame rather than
    // flickering between the two. The dust motes are left under the map's grayscale filter
    // (their colors are already grayscale, so it doesn't matter); the eyes save/restore
    // their own filter so they stay in full color, same trick as drawFleshRock.
    function drawVoidDecor(ctx, d, breezeX, setGrayscaleActive) {
        let seed = Math.abs(Math.sin(d.x * 12.9898 + d.y * 78.233) * 43758.5453); seed -= Math.floor(seed);
        if (seed > 0.92) {
            ctx.save();
            setGrayscaleActive(false);
            let er = 6 + seed * 3; // noticeably larger than the standard 3px decor dot
            let blinkPhase = (Date.now() / 1000 + seed * 12) % (3 + seed * 2);
            let isBlinking = blinkPhase > (2.7 + seed * 1.6);
            ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(d.x, d.y + er * 0.25, er * 0.95, er * 0.55, 0, 0, Math.PI * 2); ctx.fill();
            if (isBlinking) {
                ctx.strokeStyle = '#b89494'; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(d.x - er * 0.75, d.y); ctx.lineTo(d.x + er * 0.75, d.y); ctx.stroke();
            } else {
                ctx.fillStyle = '#eee2dd'; ctx.beginPath(); ctx.ellipse(d.x, d.y, er * 0.75, er * 0.5, 0, 0, Math.PI * 2); ctx.fill();
                let pupilDrift = Math.sin(d.x * 0.7 + d.y * 0.3) * er * 0.12;
                ctx.fillStyle = '#7a0f14'; ctx.beginPath(); ctx.arc(d.x + pupilDrift, d.y, er * 0.28, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#1a0505'; ctx.beginPath(); ctx.arc(d.x + pupilDrift, d.y, er * 0.13, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(d.x + pupilDrift - er * 0.1, d.y - er * 0.12, er * 0.08, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            setGrayscaleActive(true);
        } else {
            ctx.fillStyle = seed > 0.5 ? 'rgba(225,225,225,0.7)' : 'rgba(130,130,130,0.65)';
            ctx.beginPath(); ctx.arc(d.x, d.y, 1.4 + seed * 1.3, 0, Math.PI * 2); ctx.fill();
        }
    }

    return {
        toGrayscaleColor, installGrayscaleIntercept, buildSkyGradient,
        getHazardTheme, drawFleshRock, drawVoidTentacle, drawVoidDecor
    };
})();
