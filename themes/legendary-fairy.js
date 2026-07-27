// Fairy Dust ("sparkle") rare skin — ambient/background stage effects only (night sky
// color, moon + starfield, and the whole-scene moonlight darkening/vignette/light-punch
// overlay). The permanent ground-bloom trail and sparkle trail particles are specific
// interactions and stay in the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.sparkle = (function () {

    // Fairy Dust skin: deep midnight-blue night sky, several shades darker/cooler than even
    // the Void sky, since Void is meant to read as "colorless void" while this needs to stay
    // recognizably blue-toned moonlight.
    let skyCache = null, skyCacheH = -1;
    function buildSkyGradient(ctx, height) {
        if (!skyCache || skyCacheH !== height) {
            skyCache = ctx.createLinearGradient(0, 0, 0, height);
            skyCache.addColorStop(0, '#03050f'); skyCache.addColorStop(0.55, '#0a1230');
            skyCache.addColorStop(1, '#152049');
            skyCacheH = height;
        }
        return skyCache;
    }

    // A single full moon, fixed in world space at the same spot the normal sun sits, so it
    // drifts past the same way as the camera moves. A soft two-stop halo first (same role as
    // the normal sun glow), then a shaded disc with a few faint craters so it doesn't read as
    // a flat circle.
    let moonGlowCache = null;
    function drawFullMoon(ctx, canvas) {
        ctx.save();
        const moonX = 500, moonY = -600, moonR = 85;
        if (!moonGlowCache) {
            moonGlowCache = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 640);
            moonGlowCache.addColorStop(0, 'rgba(190,215,255,0.55)');
            moonGlowCache.addColorStop(0.45, 'rgba(150,185,255,0.2)');
            moonGlowCache.addColorStop(1, 'rgba(150,185,255,0)');
        }
        ctx.fillStyle = moonGlowCache;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let bodyGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.1, moonX, moonY, moonR);
        bodyGrad.addColorStop(0, '#fbfeff'); bodyGrad.addColorStop(0.7, '#dbe9f8'); bodyGrad.addColorStop(1, '#a3b9d9');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(150,175,205,0.4)';
        const craters = [[-0.32, -0.22, 0.22], [0.24, 0.12, 0.16], [0.04, -0.42, 0.12], [-0.12, 0.36, 0.14]];
        for (let i = 0; i < craters.length; i++) {
            let c = craters[i];
            ctx.beginPath(); ctx.arc(moonX + c[0] * moonR, moonY + c[1] * moonR, moonR * c[2], 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    // A sparse, slow, pale-blue starfield behind the moon - same tiled/stable-seed approach
    // as Galaxy's starfield, just dimmer and sparser so it sits quietly in the background
    // rather than competing with the moon for attention.
    function drawFairyStars(ctx, camera, canvas) {
        const spacingX = 170, spacingY = 170;
        let iStart = Math.floor(camera.x / spacingX) - 2, iEnd = Math.ceil((camera.x + canvas.width) / spacingX) + 2;
        let jStart = Math.floor(camera.y / spacingY) - 2, jEnd = Math.ceil((camera.y + canvas.height) / spacingY) + 2;
        ctx.save(); ctx.fillStyle = '#cfe0ff';
        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                let seed = Math.abs(Math.sin(i * 12.9898 + j * 78.233 + 91.7) * 43758.5453); seed -= Math.floor(seed);
                if (seed > 0.18) continue;
                let sx = i * spacingX + seed * 120, sy = j * spacingY + ((seed * 53) % 1) * 120;
                ctx.globalAlpha = 0.25 + 0.25 * Math.sin(Date.now()/700 + seed*25);
                ctx.beginPath(); ctx.arc(sx, sy, 1 + seed * 1.1, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }

    // Aggressive, cool dark-blue "moonlight" cast over the whole scene - applied in plain
    // screen space, after every world layer (sky, ground, trees, entities, player) has
    // already been drawn, so it darkens everything uniformly no matter where the camera is.
    // 'multiply' darkens/tints without fully flattening whatever shape or color was
    // underneath. A darker vignette toward the screen edges layers on top of that base tint
    // (also via 'multiply', so it stacks rather than replaces), then every currently visible
    // light source (the player + any blossomed flower, registered into fairyLightSources as
    // it was drawn earlier this frame) gets its light punched back through both darkening
    // layers via an additive ('lighter') pass, so a light sitting near the screen edge
    // visibly pushes back the vignette there too, not just the base tint.
    // NOTE: the caller is still responsible for redrawing the player sprite on top afterward
    // (its own additive light pass would otherwise wash it out) - that's specific-interaction
    // character-rendering code and stays in the main game script.
    function drawMoonlightOverlay(ctx, canvas, opts) {
        let camX = opts.camX, camY = opts.camY, shakeX = opts.shakeX, shakeY = opts.shakeY;
        let tiltX = opts.tiltX, tiltY = opts.tiltY, fairyLightSources = opts.fairyLightSources;

        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(18,22,64,0.78)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let vignetteR = Math.max(canvas.width, canvas.height) * 0.68;
        let vignette = ctx.createRadialGradient(canvas.width/2, canvas.height/2, vignetteR*0.35, canvas.width/2, canvas.height/2, vignetteR);
        vignette.addColorStop(0, 'rgba(255,255,255,1)');
        vignette.addColorStop(0.6, 'rgba(120,120,140,1)');
        vignette.addColorStop(1, 'rgba(15,15,35,1)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let li = 0; li < fairyLightSources.length; li++) {
            let ls = fairyLightSources[li];
            let sx = ls.x - camX + shakeX + tiltX, sy = ls.y - camY + shakeY + tiltY;
            if (sx < -ls.radius || sx > canvas.width + ls.radius || sy < -ls.radius || sy > canvas.height + ls.radius) continue;
            // Gentle per-light flicker (seeded off position so lights don't pulse in
            // lockstep) - a natural breathing candle/firefly waver rather than a static disc.
            let seed = (ls.x * 0.013 + ls.y * 0.021) % 1;
            let flicker = ls.bright ? (0.92 + 0.08 * Math.sin(Date.now()/500)) : (0.75 + 0.25 * Math.sin(Date.now()/900 + seed*40));
            let grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, ls.radius);
            if (ls.bright) {
                // The player's own light - biggest, softest, and brightest at its core, but
                // still a hazy gradual falloff rather than a flat bright disc.
                grad.addColorStop(0, `rgba(255,246,222,${0.22*flicker})`);
                grad.addColorStop(0.2, `rgba(255,238,208,${0.15*flicker})`);
                grad.addColorStop(0.45, `rgba(225,232,255,${0.09*flicker})`);
                grad.addColorStop(0.75, `rgba(200,215,255,${0.04*flicker})`);
                grad.addColorStop(1, 'rgba(200,215,255,0)');
            } else {
                // Flower light - same hazy shape, noticeably dimmer/softer overall.
                grad.addColorStop(0, `rgba(255,240,210,${0.11*flicker})`);
                grad.addColorStop(0.3, `rgba(255,230,215,${0.07*flicker})`);
                grad.addColorStop(0.65, `rgba(255,220,225,${0.03*flicker})`);
                grad.addColorStop(1, 'rgba(255,220,225,0)');
            }
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(sx, sy, ls.radius, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    return { buildSkyGradient, drawFullMoon, drawFairyStars, drawMoonlightOverlay };
})();
