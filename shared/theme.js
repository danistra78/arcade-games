/**
 * Shared Arcade Theme System
 * 4 Design-Paletten (Neon / Monochrom / 8-Bit / Flat Design 2.0),
 * persistiert in localStorage und ueber alle Spiele + Index hinweg gueltig.
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'arcadeTheme';

    const THEMES = {
        neon: {
            label: 'Neon',
            bg: '#050505', bg2: '#111111',
            primary: '#00ffff', secondary: '#ff00ff', accent: '#ffe600',
            good: '#00ff41', warn: '#ff2255',
            text: '#ffffff', border: '#333333',
            glow: true, outline: false,
            pieces: ['#00ffff', '#ffff00', '#ff00ff', '#00ff00', '#ff2255', '#3355ff', '#ff8800']
        },
        mono: {
            label: 'Monochrom',
            bg: '#0a0f08', bg2: '#131f10',
            primary: '#8fbc4f', secondary: '#4a6b2a', accent: '#c9e08a',
            good: '#a8d15f', warn: '#3f5a24',
            text: '#d9e8c0', border: '#2b3a20',
            glow: true, outline: false,
            pieces: ['#c9e08a', '#a8d15f', '#8fbc4f', '#6f9a3c', '#587c30', '#4a6b2a', '#3f5a24']
        },
        retro8bit: {
            label: '8-Bit',
            bg: '#1a1a0f', bg2: '#2b2318',
            primary: '#6b8e23', secondary: '#b5651d', accent: '#d4a017',
            good: '#7a9c3a', warn: '#a13a2f',
            text: '#e8d9b5', border: '#4a3f2a',
            glow: false, outline: false,
            pieces: ['#6b8e23', '#d4a017', '#b5651d', '#a13a2f', '#7a9c3a', '#8a6d3f', '#5c4a2f']
        },
        flat: {
            label: 'Flat Design 2.0',
            bg: '#23272f', bg2: '#2f3542',
            primary: '#3d5af1', secondary: '#ff6f61', accent: '#ffd23f',
            good: '#3dd6c8', warn: '#e74c3c',
            text: '#ffffff', border: '#ffffff',
            glow: false, outline: true,
            pieces: ['#3d5af1', '#ffd23f', '#ff6f61', '#3dd6c8', '#e74c3c', '#7c6fed', '#ffa41b']
        }
    };

    function getStoredTheme() {
        const t = localStorage.getItem(STORAGE_KEY);
        return THEMES[t] ? t : 'neon';
    }

    function applyCssVars(themeName) {
        const t = THEMES[themeName];
        const root = document.documentElement.style;
        root.setProperty('--t-bg', t.bg);
        root.setProperty('--t-bg2', t.bg2);
        root.setProperty('--t-primary', t.primary);
        root.setProperty('--t-secondary', t.secondary);
        root.setProperty('--t-accent', t.accent);
        root.setProperty('--t-good', t.good);
        root.setProperty('--t-warn', t.warn);
        root.setProperty('--t-text', t.text);
        root.setProperty('--t-border', t.border);
        document.documentElement.setAttribute('data-theme', themeName);
    }

    const listeners = [];

    function setTheme(themeName) {
        if (!THEMES[themeName]) themeName = 'neon';
        localStorage.setItem(STORAGE_KEY, themeName);
        applyCssVars(themeName);
        const palette = THEMES[themeName];
        listeners.forEach(fn => fn(palette, themeName));
    }

    function onThemeChange(fn) {
        listeners.push(fn);
    }

    function current() {
        return THEMES[getStoredTheme()];
    }

    function injectSwitcher() {
        if (document.getElementById('theme-switcher-widget')) return;
        const wrap = document.createElement('div');
        wrap.id = 'theme-switcher-widget';
        wrap.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;font-family:inherit;';

        const select = document.createElement('select');
        select.setAttribute('aria-label', 'Design-Thema waehlen');
        select.style.cssText = 'background:rgba(0,0,0,0.75);color:#fff;border:1px solid #888;' +
            'border-radius:4px;padding:5px 8px;font-size:12px;cursor:pointer;';
        Object.keys(THEMES).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = THEMES[key].label;
            select.appendChild(opt);
        });
        select.value = getStoredTheme();
        select.addEventListener('change', () => setTheme(select.value));

        wrap.appendChild(select);

        function mount() {
            document.body.appendChild(wrap);
        }
        if (document.body) mount();
        else document.addEventListener('DOMContentLoaded', mount);
    }

    function init() {
        applyCssVars(getStoredTheme());
        injectSwitcher();
    }

    global.Theme = { THEMES, setTheme, onThemeChange, current, getStoredTheme, init };
    init();
})(window);
