/**
 * Shared Arcade Game Core
 * Highscore-Persistence, Partikelsystem und dt-Clamp-Loop fuer alle Spiele.
 */
(function (global) {
    'use strict';

    function loadHighscore(key) {
        return parseInt(localStorage.getItem(key), 10) || 0;
    }

    function saveHighscore(key, score) {
        const current = loadHighscore(key);
        if (score > current) {
            localStorage.setItem(key, score);
            return score;
        }
        return current;
    }

    class Particle {
        constructor(x, y, vx, vy, color, life, options) {
            options = options || {};
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.size = options.size || 3;
            this.shape = options.shape || 'rect';
            this.gravity = options.gravity || 0;
        }
        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += this.gravity * dt;
            this.life -= dt;
        }
        get alive() {
            return this.life > 0;
        }
        draw(ctx) {
            const alpha = Math.max(this.life / this.maxLife, 0);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            }
            ctx.globalAlpha = 1;
        }
    }

    // Spawnt `count` Partikel radial um (x, y). options: speed, life, size, shape, gravity.
    function spawnParticles(list, x, y, color, count, options) {
        options = options || {};
        const speed = options.speed || 150;
        const life = options.life || 0.6;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = speed * (0.4 + Math.random() * 0.6);
            list.push(new Particle(
                x, y,
                Math.cos(angle) * spd, Math.sin(angle) * spd,
                color,
                life * (0.6 + Math.random() * 0.4),
                options
            ));
        }
    }

    function updateParticles(list, dt) {
        for (let i = list.length - 1; i >= 0; i--) {
            list[i].update(dt);
            if (!list[i].alive) list.splice(i, 1);
        }
    }

    function drawParticles(ctx, list) {
        for (const p of list) p.draw(ctx);
    }

    // dt-Clamp-Loop: kapselt requestAnimationFrame mit sekundenbasiertem,
    // auf 0.1s gedeckeltem Delta (verhindert Physik-Spruenge bei Tab-Wechsel/Resume).
    function startLoop(callback) {
        let lastTime = 0;
        let running = true;
        let rafId = null;

        function frame(timestamp) {
            if (!running) return;
            if (lastTime === 0) lastTime = timestamp;
            let dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            if (dt > 0.1) dt = 0.1;
            callback(dt, timestamp);
            if (running) rafId = requestAnimationFrame(frame);
        }

        rafId = requestAnimationFrame(frame);

        return {
            stop() {
                running = false;
                if (rafId) cancelAnimationFrame(rafId);
            },
            resume() {
                if (running) return;
                running = true;
                lastTime = 0;
                rafId = requestAnimationFrame(frame);
            }
        };
    }

    global.GameCore = {
        loadHighscore,
        saveHighscore,
        Particle,
        spawnParticles,
        updateParticles,
        drawParticles,
        startLoop
    };
})(window);
