// ==========================================
// BOSS: Bear (Autumn stage boss)
// ==========================================
// Self-contained boss module - see bosses/kingslime.js for the general shape of this
// file.

(function () {
    window.bossDB = window.bossDB || {};
    window.bossSilhouettes = window.bossSilhouettes || {};
    window.enemyDB = window.enemyDB || {};

    // ---- Bear's own copies of the shared attack-projectile helpers ----
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

    // ---- Bear's attack data (stats + attacks) ----
    window.bossDB.bear = {
        themeIndex: 5, radius: 44, speedMult: 0.75, name: 'Bear',
        bodyColor: '#7a5233', darkColor: '#4a2f1c', crownColor: '#c98a4b',
        attacks: [
            { // Ground Pound - telegraphed AOE shockwave ring
                name: 'Ground Pound', telegraph: 70, duration: 20, cooldown: 160,
                exec: (e) => { bossTelegraphAoe(e, e.x, e.y, 120, 35); },
                tick: (e) => { if (e.stateTimer === 34) { bossFireRadial(e, 8, 3, 7); screenShake = Math.max(screenShake, 9); playSFX('enemy_hit'); } }
            },
            { // Charge Swipe - dash across the arena leaving a projectile trail
                name: 'Charge Swipe', telegraph: 60, duration: 50, cooldown: 160, dash: true,
                exec: (e) => { playSFX('bull_charge'); },
                tick: (e) => { e.x += Math.cos(e.chargeAngle) * e.speed * 2.5; e.y += Math.sin(e.chargeAngle) * e.speed * 2.5; if (e.stateTimer % 10 === 0) projectiles.push({ x: e.x, y: e.y, vx: 0, vy: 0.01, radius: 9, bossId: e.bossId }); }
            },
            { // Leaf Fling - 3-way spread
                name: 'Leaf Fling', telegraph: 55, duration: 15, cooldown: 130,
                exec: (e) => { playSFX('eye_fire'); bossFireAimedSpread(e, 3, 0.6, 4, 8); }
            }
        ]
    };

    // ---- Bear's visual design (silhouette) ----
    window.bossSilhouettes.bear = (ctx, r, def, e) => {
        let hurt = (e.hitFlash || 0) > 0;
        let roar = e.state === 'attack';
        let snarl = e.state === 'telegraph';
        let aggro = roar || snarl;
        let bodyLight = shadeHex(def.bodyColor, 0.24);
        let bodyDeep = shadeHex(def.bodyColor, -0.22);
        let earInner = shadeHex(def.darkColor, 0.35);
        let ink = '#1a0f08';

        // Torso: haunches + a big-shouldered chest hump, classic bear silhouette
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath(); ctx.ellipse(0, r * 0.34, r * 0.78, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -r * 0.06, r * 0.6, r * 0.48, 0, 0, Math.PI * 2); ctx.fill();

        // Fur shading + belly patch, clipped to the torso so nothing spills past the outline
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, r * 0.34, r * 0.78, r * 0.6, 0, 0, Math.PI * 2);
        ctx.ellipse(0, -r * 0.06, r * 0.6, r * 0.48, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = bodyDeep;
        ctx.beginPath(); ctx.ellipse(r * 0.4, r * 0.16, r * 0.34, r * 0.58, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bodyLight;
        ctx.beginPath(); ctx.ellipse(-r * 0.02, r * 0.42, r * 0.36, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Arms: reared up with claws bared while telegraphing/attacking, relaxed otherwise
        let armL = aggro ? { sx: -r * 0.5, sy: -r * 0.15, px: -r * 0.85, py: -r * 0.72 }
                         : { sx: -r * 0.5, sy: r * 0.05, px: -r * 0.78, py: r * 0.35 };
        let armR = aggro ? { sx: r * 0.5, sy: -r * 0.15, px: r * 0.9, py: -r * 0.76 }
                         : { sx: r * 0.5, sy: r * 0.02, px: r * 0.82, py: r * 0.3 };
        [armL, armR].forEach(arm => {
            ctx.strokeStyle = def.bodyColor; ctx.lineWidth = r * 0.32; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(arm.sx, arm.sy); ctx.lineTo(arm.px, arm.py); ctx.stroke();
            ctx.fillStyle = bodyDeep;
            ctx.beginPath(); ctx.arc(arm.px, arm.py, r * 0.17, 0, Math.PI * 2); ctx.fill();
            let dirAngle = Math.atan2(arm.py - arm.sy, arm.px - arm.sx);
            ctx.strokeStyle = '#f5ead0'; ctx.lineWidth = Math.max(1, r * 0.045); ctx.lineCap = 'round';
            for (let i = -1; i <= 1; i++) {
                let a = dirAngle + i * 0.4;
                ctx.beginPath();
                ctx.moveTo(arm.px + Math.cos(a) * r * 0.08, arm.py + Math.sin(a) * r * 0.08);
                ctx.lineTo(arm.px + Math.cos(a) * r * 0.3, arm.py + Math.sin(a) * r * 0.3);
                ctx.stroke();
            }
        });

        // Head - tips back slightly on a hit
        let headX = r * 0.04, headY = -r * 0.58;
        ctx.save();
        ctx.translate(headX, headY);
        if (hurt) ctx.rotate(-0.14);
        let hx = 0, hy = 0;

        ctx.fillStyle = def.bodyColor;
        ctx.beginPath(); ctx.arc(hx, hy, r * 0.46, 0, Math.PI * 2); ctx.fill();

        // Ears
        ctx.fillStyle = def.bodyColor;
        ctx.beginPath(); ctx.arc(hx - r * 0.32, hy - r * 0.36, r * 0.19, 0, Math.PI * 2); ctx.arc(hx + r * 0.32, hy - r * 0.36, r * 0.19, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = earInner;
        ctx.beginPath(); ctx.arc(hx - r * 0.32, hy - r * 0.36, r * 0.095, 0, Math.PI * 2); ctx.arc(hx + r * 0.32, hy - r * 0.36, r * 0.095, 0, Math.PI * 2); ctx.fill();

        // Crown, worn between the ears
        let bandBottom = hy - r * 0.28, bandTop = hy - r * 0.42, hw = r * 0.38;
        ctx.fillStyle = def.crownColor;
        ctx.beginPath();
        ctx.moveTo(hx - hw, bandBottom);
        ctx.lineTo(hx - hw, bandTop - r * 0.16);
        ctx.lineTo(hx - hw * 0.5, bandTop - r * 0.02);
        ctx.lineTo(hx, bandTop - r * 0.3);
        ctx.lineTo(hx + hw * 0.5, bandTop - r * 0.02);
        ctx.lineTo(hx + hw, bandTop - r * 0.16);
        ctx.lineTo(hx + hw, bandBottom);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = shadeHex(def.crownColor, -0.4); ctx.lineWidth = Math.max(1, r * 0.032); ctx.lineJoin = 'round'; ctx.stroke();
        ctx.fillStyle = shadeHex(def.crownColor, 0.35);
        [[-hw, bandTop - r * 0.16], [0, bandTop - r * 0.3], [hw, bandTop - r * 0.16]].forEach(([px, py]) => {
            ctx.beginPath(); ctx.arc(hx + px, py, r * 0.045, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = '#c81e39';
        ctx.beginPath(); ctx.arc(hx, (bandTop + bandBottom) / 2 + r * 0.02, r * 0.065, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath(); ctx.arc(hx - r * 0.02, (bandTop + bandBottom) / 2, r * 0.02, 0, Math.PI * 2); ctx.fill();

        // Muzzle + nose
        ctx.fillStyle = bodyLight;
        ctx.beginPath(); ctx.ellipse(hx, hy + r * 0.24, r * 0.3, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink;
        ctx.beginPath(); ctx.ellipse(hx, hy + r * 0.14, r * 0.095, r * 0.07, 0, 0, Math.PI * 2); ctx.fill();

        // Expression - reacts to being hurt, and to winding up / unleashing an attack
        if (hurt) {
            ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, r * 0.05); ctx.lineCap = 'round';
            [-1, 1].forEach(s => {
                ctx.beginPath();
                ctx.moveTo(hx + s * r * 0.24 - r * 0.09, hy - r * 0.02);
                ctx.quadraticCurveTo(hx + s * r * 0.24, hy + r * 0.07, hx + s * r * 0.24 + r * 0.09, hy - r * 0.02);
                ctx.stroke();
            });
            ctx.fillStyle = ink;
            ctx.beginPath(); ctx.ellipse(hx, hy + r * 0.32, r * 0.08, r * 0.1, 0, 0, Math.PI * 2); ctx.fill();
        } else if (roar) {
            ctx.fillStyle = ink;
            ctx.beginPath(); ctx.arc(hx - r * 0.2, hy - r * 0.05, r * 0.07, 0, Math.PI * 2); ctx.arc(hx + r * 0.24, hy - r * 0.05, r * 0.07, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, r * 0.05); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(hx - r * 0.34, hy - r * 0.22); ctx.lineTo(hx - r * 0.12, hy - r * 0.13); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(hx + r * 0.38, hy - r * 0.22); ctx.lineTo(hx + r * 0.16, hy - r * 0.13); ctx.stroke();
            ctx.fillStyle = '#2b0f0a';
            ctx.beginPath(); ctx.ellipse(hx + r * 0.02, hy + r * 0.38, r * 0.2, r * 0.19, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fdf6e3';
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(hx + i * r * 0.13, hy + r * 0.24);
                ctx.lineTo(hx + i * r * 0.13 - r * 0.04, hy + r * 0.33);
                ctx.lineTo(hx + i * r * 0.13 + r * 0.04, hy + r * 0.33);
                ctx.closePath(); ctx.fill();
            }
            ctx.fillStyle = '#ff8fa3';
            ctx.beginPath(); ctx.ellipse(hx, hy + r * 0.46, r * 0.11, r * 0.07, 0, 0, Math.PI * 2); ctx.fill();
        } else if (snarl) {
            ctx.fillStyle = ink;
            ctx.beginPath(); ctx.ellipse(hx - r * 0.2, hy - r * 0.03, r * 0.08, r * 0.04, 0, 0, Math.PI * 2); ctx.ellipse(hx + r * 0.24, hy - r * 0.03, r * 0.08, r * 0.04, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, r * 0.045); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(hx - r * 0.32, hy - r * 0.18); ctx.lineTo(hx - r * 0.13, hy - r * 0.12); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(hx + r * 0.36, hy - r * 0.18); ctx.lineTo(hx + r * 0.17, hy - r * 0.12); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(hx - r * 0.14, hy + r * 0.28); ctx.quadraticCurveTo(hx, hy + r * 0.34, hx + r * 0.18, hy + r * 0.24); ctx.stroke();
            ctx.fillStyle = '#fdf6e3';
            ctx.beginPath(); ctx.moveTo(hx - r * 0.08, hy + r * 0.26); ctx.lineTo(hx - r * 0.12, hy + r * 0.34); ctx.lineTo(hx - r * 0.02, hy + r * 0.3); ctx.closePath(); ctx.fill();
        } else {
            ctx.fillStyle = ink;
            ctx.beginPath(); ctx.arc(hx - r * 0.2, hy - r * 0.03, r * 0.075, 0, Math.PI * 2); ctx.arc(hx + r * 0.24, hy - r * 0.03, r * 0.075, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.beginPath(); ctx.arc(hx - r * 0.23, hy - r * 0.06, r * 0.02, 0, Math.PI * 2); ctx.arc(hx + r * 0.21, hy - r * 0.06, r * 0.02, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, r * 0.045); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(hx - r * 0.1, hy + r * 0.3); ctx.quadraticCurveTo(hx + r * 0.02, hy + r * 0.34, hx + r * 0.14, hy + r * 0.28); ctx.stroke();
        }

        ctx.restore();
    };

    // ---- Bear's bestiary entry ----
    window.enemyDB.boss_bear = { name: 'Bear', desc: 'A hulking woodland brute. Pounds the earth and swipes with claws like falling branches. 3 hits to topple.' };
})();
