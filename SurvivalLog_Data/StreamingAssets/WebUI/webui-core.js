(function(global) {
    'use strict';

    if (!global.__ES_TRANSLATIONS__) {
        try {
            if (global.parent && global.parent.__ES_TRANSLATIONS__) {
                global.__ES_TRANSLATIONS__ = global.parent.__ES_TRANSLATIONS__;
            } else if (global.top && global.top.__ES_TRANSLATIONS__) {
                global.__ES_TRANSLATIONS__ = global.top.__ES_TRANSLATIONS__;
            } else {
                const s = document.createElement('script');
                s.src = '../../es-translation.js';
                document.head.appendChild(s);
            }
        } catch (e) {}
    }

    function getTranslationDict() {
        try {
            if (global.__ES_TRANSLATIONS__) return global.__ES_TRANSLATIONS__;
            if (global.parent && global.parent.__ES_TRANSLATIONS__) return global.parent.__ES_TRANSLATIONS__;
            if (global.top && global.top.__ES_TRANSLATIONS__) return global.top.__ES_TRANSLATIONS__;
        } catch (e) {}
        return null;
    }

    function translateDeep(val) {
        if (!val) return val;
        const dict = getTranslationDict();
        if (!dict) return val;

        if (typeof val === 'string') {
            if (dict[val]) return dict[val];
            const trimmed = val.trim();
            if (trimmed && dict[trimmed]) {
                return val.replace(trimmed, dict[trimmed]);
            }
            return val;
        }

        if (Array.isArray(val)) {
            for (let i = 0; i < val.length; i++) {
                val[i] = translateDeep(val[i]);
            }
            return val;
        }

        if (typeof val === 'object') {
            for (const k of Object.keys(val)) {
                if (k === 'id' || k === 'type' || k === 'action' || k === 'sourcePageId' || k === 'pageId') continue;
                val[k] = translateDeep(val[k]);
            }
            return val;
        }

        return val;
    }

    function translateDOMNode(node) {
        if (!node) return;
        const dict = getTranslationDict();
        if (!dict) return;

        if (node.nodeType === 3) {
            const val = node.nodeValue;
            if (!val) return;
            const trimmed = val.trim();
            if (trimmed && dict[trimmed]) {
                node.nodeValue = val.replace(trimmed, dict[trimmed]);
            }
            return;
        }

        if (node.nodeType === 1) {
            const tag = node.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'SVG' || tag === 'CANVAS') return;
            const i18nKey = node.getAttribute('data-i18n');
            if (i18nKey && dict[i18nKey]) {
                node.textContent = dict[i18nKey];
            }
            for (const attr of ['placeholder', 'title', 'data-tooltip']) {
                const val = node.getAttribute(attr);
                if (val && dict[val.trim()]) {
                    node.setAttribute(attr, dict[val.trim()]);
                }
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                translateDOMNode(node.childNodes[i]);
            }
        }
    }

    function createWebUICore(pageId) {
        const messageHandlers = {};

        const sendMessage = (action, data = {}) => {
            const message = { type: action, data: data, sourcePageId: pageId };
            if (window.parent) {
                window.parent.postMessage(message, '*');
            }
        };

        const UnitySendEvent = (action, extraData = {}) => {
            sendMessage(action, extraData);
        };

        const registerHandlers = (handlers) => {
            Object.assign(messageHandlers, handlers);
        };

        const initMessageListener = () => {
            window.addEventListener('message', (event) => {
                const message = event.data;
                if (!message) return;

                if (message.type === '__CLICK_PASSTHROUGH__') {
                    if (message.sourcePageId === pageId) return;
                    if (inspector.isActive()) {
                        inspector.handlePoint(message.clientX, message.clientY, true);
                        return;
                    }
                    const el = document.elementFromPoint(message.clientX, message.clientY);
                    console.log('[bug][passthrough] ' + pageId + ' received', message.clientX, message.clientY, '→ el=', el, 'pe=', el ? getComputedStyle(el).pointerEvents : 'N/A');
                    if (el && getComputedStyle(el).pointerEvents !== 'none') {
                        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    }
                    return;
                }

                if (message.type === '__INSPECT_MODE__') {
                    const d = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                    if (d && d.on) { inspector.start(); } else { inspector.stop(); }
                    return;
                }

                if (message.type === '__QUALITY_TIER__') {
                    const d = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                    const root = document.documentElement;
                    root.classList.remove('quality-low', 'quality-medium');
                    if (d && d.tier) { root.classList.add('quality-' + d.tier); }
                    return;
                }

                if (message.type === '__CHEAT_MARK__') {
                    const d = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                    document.documentElement.classList.toggle('cheat-marked', !!(d && d.on));
                    return;
                }

                const handler = messageHandlers[message.type];
                if (handler) {
                    let data = typeof message.data === 'string'
                        ? JSON.parse(message.data)
                        : message.data;
                    data = translateDeep(data);
                    handler(data);
                }
            });
        };

        const notifyReady = () => {
            let sent = false;
            const sendOnce = () => {
                if (sent) return;
                sent = true;
                try {
                    if (window.parent && window.parent.notifyPageReady) {
                        window.parent.notifyPageReady(pageId);
                        return;
                    }
                } catch (e) {
                }
                if (window.parent) {
                    window.parent.postMessage({ type: '__PAGE_READY__', sourcePageId: pageId }, '*');
                }
            };
            requestAnimationFrame(() => requestAnimationFrame(sendOnce));
            setTimeout(sendOnce, 150);
        };

        const i18n = {
            updateText: (selector, text) => {
                const el = document.querySelector(selector);
                if (el && text) {
                    const dict = getTranslationDict();
                    const trans = (dict && (dict[text] || dict[text.trim()])) || text;
                    el.textContent = trans;
                }
            },

            updateTooltip: (selector, text) => {
                const el = document.querySelector(selector);
                if (el && text) {
                    const dict = getTranslationDict();
                    const trans = (dict && (dict[text] || dict[text.trim()])) || text;
                    el.setAttribute('data-tooltip', trans);
                }
            }
        };

        initMessageListener();

        if (typeof MutationObserver !== 'undefined') {
            const domObserver = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    for (let j = 0; j < m.addedNodes.length; j++) {
                        translateDOMNode(m.addedNodes[j]);
                    }
                }
            });
            const startObserving = () => {
                if (document.body) {
                    translateDOMNode(document.body);
                    domObserver.observe(document.body, { childList: true, subtree: true });
                }
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startObserving);
            } else {
                startObserving();
            }
        }

        // clip: null = 不裁; { pad } = 让 Root 把本页 iframe 的 DOM 命中范围裁到 rects 包围盒外扩 pad px(见 Root.html applyFrameClip)
        const syncInteractiveRects = (rects, clip = null) => {
            try {
                if (window.parent && window.parent.syncInteractiveRects) {
                    window.parent.syncInteractiveRects(pageId, rects, clip);
                    return;
                }
            } catch (e) {
            }
            if (window.parent) {
                window.parent.postMessage({ type: '__SYNC_RECTS__', sourcePageId: pageId, rects: rects, clip: clip }, '*');
            }
        };

        const clickThrough = (function() {
            const config = {
                debounceMs: 100,
                selector: '.unity-interactive, button, input, select, a, [data-interactive]'
            };

            let syncTimer = null;
            let observer = null;
            let isRunning = false;
            let frameClip = null; // { pad } = 已请求 Root 裁切本页 iframe 命中范围(见 setFrameClip)

            function collectRects() {
                const rects = [];
                const elements = document.querySelectorAll(config.selector);

                elements.forEach(el => {
                    const style = getComputedStyle(el);

                    if (style.pointerEvents === 'none' ||
                        style.visibility === 'hidden' ||
                        style.display === 'none' ||
                        el.disabled) {
                        return;
                    }

                    const rect = el.getBoundingClientRect();

                    if (rect.width <= 0 || rect.height <= 0) return;
                    if (rect.right < 0 || rect.bottom < 0) return;
                    if (rect.left > window.innerWidth || rect.top > window.innerHeight) return;

                    rects.push({
                        x: Math.max(0, rect.left / window.innerWidth),
                        y: Math.max(0, rect.top / window.innerHeight),
                        w: Math.min(rect.width / window.innerWidth, 1),
                        h: Math.min(rect.height / window.innerHeight, 1)
                    });
                });

                return rects;
            }

            function debounceSyncRects() {
                if (!isRunning) return;

                if (syncTimer) return;
                syncTimer = setTimeout(() => {
                    syncTimer = null;
                    syncInteractiveRects(collectRects(), frameClip);
                }, config.debounceMs);
            }

            function syncNow() {
                if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
                syncInteractiveRects(collectRects(), frameClip);
            }

            function syncNowAfterReflow() {
                if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
                requestAnimationFrame(() => {
                    syncInteractiveRects(collectRects(), frameClip);
                });
            }

            function start(options = {}) {
                if (isRunning) return;
                isRunning = true;

                if (options.debounceMs) config.debounceMs = options.debounceMs;
                if (options.selector) config.selector = options.selector;

                syncNow();

                observer = new MutationObserver((mutations) => {
                    for (let i = 0; i < mutations.length; i++) {
                        const t = mutations[i].target;
                        if (t && t.nodeType === 1 && t.closest && t.closest('[data-no-sync]')) continue;
                        debounceSyncRects();
                        return;
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'disabled', 'hidden']
                });

                window.addEventListener('resize', debounceSyncRects);
                window.addEventListener('scroll', debounceSyncRects);
            }

            function stop() {
                if (!isRunning) return;
                isRunning = false;

                if (syncTimer) {
                    clearTimeout(syncTimer);
                    syncTimer = null;
                }

                if (observer) {
                    observer.disconnect();
                    observer = null;
                }

                window.removeEventListener('resize', debounceSyncRects);
                window.removeEventListener('scroll', debounceSyncRects);

                syncInteractiveRects([], frameClip);
            }

            /**
             * 让 Root 把本页 iframe 的 DOM 命中范围裁到交互矩形包围盒(外扩 padPx, 默认 24)。
             * 解决的是 Unity 层 Calculate 已放行、但全屏 iframe 仍在 DOM 层截住下层 iframe 点击的问题:
             * 页面内 CSS 管不到 iframe 元素本身, 只有 Root 改 iframe 的 clip-path 才能让矩形外的点击真正落到下层。
             * clip-path 同时裁渲染: 只对可见内容全在交互元素内的浮层开启; Block 全屏档必须传 false。
             */
            function setFrameClip(enabled, padPx) {
                const next = enabled ? { pad: typeof padPx === 'number' ? padPx : 24 } : null;
                if ((next ? next.pad : -1) === (frameClip ? frameClip.pad : -1)) return;
                frameClip = next;
                syncInteractiveRects(isRunning ? collectRects() : [], frameClip);
            }

            return { start, stop, syncNow, syncNowAfterReflow, collectRects, setFrameClip };
        })();

        const inspector = (function() {
            let active = false;
            let box = null;
            let label = null;
            let peStyle = null;

            function injectPeFix() {
                if (peStyle) return;
                peStyle = document.createElement('style');
                peStyle.setAttribute('data-inspect-pe-fix', '');
                peStyle.textContent = '* { pointer-events: auto !important; }\n'
                    + '[data-no-sync], [data-no-sync] * { pointer-events: none !important; }';
                document.head.appendChild(peStyle);
            }

            function removePeFix() {
                if (!peStyle) return;
                peStyle.remove();
                peStyle = null;
                clickThrough.syncNowAfterReflow();
            }

            function ensureOverlay() {
                if (box) return;
                box = document.createElement('div');
                box.setAttribute('data-no-sync', '');
                box.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;display:none;'
                    + 'border:2px solid #FFC107;background:rgba(255,193,7,0.12);box-sizing:border-box;border-radius:2px;';
                label = document.createElement('div');
                label.setAttribute('data-no-sync', '');
                label.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;display:none;'
                    + 'background:rgba(20,16,8,0.92);color:#FFE082;font:12px/1.6 Consolas,monospace;'
                    + 'padding:2px 8px;border:1px solid rgba(255,193,7,0.5);border-radius:3px;'
                    + 'max-width:60vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
                document.documentElement.appendChild(box);
                document.documentElement.appendChild(label);
            }

            function describeEl(el) {
                if (!el || !el.tagName) return '';
                let s = el.tagName.toLowerCase();
                if (el.id) s += '#' + el.id;
                if (el.classList && el.classList.length) s += '.' + Array.from(el.classList).slice(0, 3).join('.');
                return s;
            }

            function domPath(el, maxDepth) {
                const parts = [];
                let cur = el, d = 0;
                while (cur && cur !== document.body && cur.nodeType === 1 && d < (maxDepth || 8)) {
                    parts.unshift(describeEl(cur));
                    cur = cur.parentElement; d++;
                }
                return parts.join(' > ');
            }

            function onMove(e) {
                const el = document.elementFromPoint(e.clientX, e.clientY);
                if (!el || el === document.body || el === document.documentElement) {
                    box.style.display = 'none'; label.style.display = 'none';
                    return;
                }
                const r = el.getBoundingClientRect();
                box.style.display = 'block';
                box.style.left = r.left + 'px'; box.style.top = r.top + 'px';
                box.style.width = r.width + 'px'; box.style.height = r.height + 'px';
                label.style.display = 'block';
                label.textContent = pageId + ' ▸ ' + describeEl(el);
                label.style.left = Math.min(e.clientX + 14, window.innerWidth - 280) + 'px';
                label.style.top = Math.min(e.clientY + 18, window.innerHeight - 30) + 'px';
            }

            function collect(clientX, clientY, viaPassthrough) {
                const el = document.elementFromPoint(clientX, clientY);
                const meaningful = !!(el && el !== document.body && el !== document.documentElement);
                const payload = {
                    page: pageId,
                    file: location.pathname.split('/').pop() || '',
                    clientX: clientX,
                    clientY: clientY,
                    nx: clientX / window.innerWidth,
                    ny: clientY / window.innerHeight,
                    viaPassthrough: !!viaPassthrough,
                    meaningful: meaningful
                };
                if (meaningful) {
                    const r = el.getBoundingClientRect();
                    const i18nEl = el.closest('[data-i18n]');
                    payload.el = {
                        desc: describeEl(el),
                        domPath: domPath(el),
                        text: (el.innerText || el.textContent || '').trim().slice(0, 120),
                        i18n: i18nEl ? i18nEl.getAttribute('data-i18n') : null,
                        dataset: Object.assign({}, el.dataset),
                        rectPx: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
                        fullViewport: r.width >= window.innerWidth * 0.95 && r.height >= window.innerHeight * 0.95
                    };
                }
                sendMessage('__INSPECT_PICK__', payload);
            }

            function handlePoint(clientX, clientY, viaPassthrough) {
                if (!active) return;
                collect(clientX, clientY, viaPassthrough);
                if (!viaPassthrough && window.parent) {
                    window.parent.postMessage({
                        type: '__CLICK_PASSTHROUGH__',
                        sourcePageId: pageId,
                        clientX: clientX,
                        clientY: clientY
                    }, '*');
                }
            }

            function onClick(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                handlePoint(e.clientX, e.clientY, false);
            }

            function swallow(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }

            function start() {
                if (active) return;
                active = true;
                ensureOverlay();
                injectPeFix();
                document.addEventListener('mousemove', onMove, true);
                document.addEventListener('click', onClick, true);
                document.addEventListener('mousedown', swallow, true);
                document.addEventListener('mouseup', swallow, true);
                document.addEventListener('pointerdown', swallow, true);
                document.addEventListener('pointerup', swallow, true);
                console.log('[bug][指认] ' + pageId + ' 检查模式 ON');
            }

            function stop() {
                if (!active) return;
                active = false;
                removePeFix();
                document.removeEventListener('mousemove', onMove, true);
                document.removeEventListener('click', onClick, true);
                document.removeEventListener('mousedown', swallow, true);
                document.removeEventListener('mouseup', swallow, true);
                document.removeEventListener('pointerdown', swallow, true);
                document.removeEventListener('pointerup', swallow, true);
                if (box) { box.style.display = 'none'; label.style.display = 'none'; }
                console.log('[bug][指认] ' + pageId + ' 检查模式 OFF');
            }

            return { start: start, stop: stop, handlePoint: handlePoint, isActive: function() { return active; } };
        })();

        return {
            sendMessage,
            UnitySendEvent,
            registerHandlers,
            notifyReady,
            pageId,
            i18n,
            syncInteractiveRects,
            clickThrough,
            createCountdownEngine,
            createClockEngine,
            createProgressEngine,
            formatTime
        };
    }

    function formatTime(seconds) {
        const s = Math.max(0, Math.floor(seconds));
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function createCountdownEngine(options = {}) {
        const config = {
            onTick: options.onTick || (() => {}),
            onComplete: options.onComplete || (() => {}),
            formatFn: options.formatFn || formatTime
        };

        let remainSeconds = 0;
        let timeScale = 1;
        let lastTimestamp = 0;
        let running = false;
        let paused = false;
        let lastFormatted = null;

        function tick(timestamp) {
            if (!running) return;
            if (lastTimestamp === 0) {
                lastTimestamp = timestamp;
                requestAnimationFrame(tick);
                return;
            }
            const dt = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            if (!paused && remainSeconds > 0) {
                remainSeconds -= dt * timeScale;
                if (remainSeconds < 0) remainSeconds = 0;
                const formatted = config.formatFn(remainSeconds);
                if (formatted !== lastFormatted) {
                    lastFormatted = formatted;
                    config.onTick(remainSeconds, formatted);
                }
                if (remainSeconds <= 0) {
                    config.onComplete();
                }
            }
            requestAnimationFrame(tick);
        }

        return {
            start(seconds, scale = 1) {
                remainSeconds = seconds;
                timeScale = scale;
                lastFormatted = config.formatFn(remainSeconds);
                config.onTick(remainSeconds, lastFormatted);
                if (!running) {
                    running = true;
                    lastTimestamp = 0;
                    requestAnimationFrame(tick);
                }
            },
            stop() {
                running = false;
                lastTimestamp = 0;
            },
            pause(isPause) { paused = isPause; },
            setTimeScale(scale) { timeScale = scale; },
            getRemainSeconds() { return remainSeconds; },
            setRemainSeconds(seconds) {
                remainSeconds = seconds;
                lastFormatted = config.formatFn(remainSeconds);
                config.onTick(remainSeconds, lastFormatted);
            }
        };
    }

    function createClockEngine(options = {}) {
        const config = {
            onTick: options.onTick || (() => {})
        };

        let totalSeconds = 0;
        let maxSeconds = 0;
        let currentTimeScale = 1;
        let lastTimestamp = 0;
        let running = false;
        let paused = false;
        let lastHour = -1;
        let lastMinute = -1;

        function syncFromSeconds(skipIfUnchanged) {
            const hour = Math.floor(totalSeconds / 3600) % 24;
            const minute = Math.floor((totalSeconds % 3600) / 60);
            if (skipIfUnchanged && hour === lastHour && minute === lastMinute) return;
            lastHour = hour;
            lastMinute = minute;
            config.onTick(hour, minute);
        }

        function tick(timestamp) {
            if (!running) return;
            if (lastTimestamp === 0) {
                lastTimestamp = timestamp;
                requestAnimationFrame(tick);
                return;
            }
            const dt = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            if (!paused && maxSeconds > 0) {
                const speed = 86400 / maxSeconds;
                totalSeconds += dt * speed * currentTimeScale;
                if (totalSeconds >= 86400) totalSeconds -= 86400;
                if (totalSeconds < 0) totalSeconds = 0;
                syncFromSeconds(true);
            }
            requestAnimationFrame(tick);
        }

        return {
            start() {
                if (running) return;
                running = true;
                lastTimestamp = 0;
                requestAnimationFrame(tick);
            },
            stop() {
                running = false;
                lastTimestamp = 0;
            },
            pause(isPause) {
                paused = isPause;
                if (isPause) lastTimestamp = 0;
            },
            reset(newTotalSeconds, newMaxSeconds) {
                totalSeconds = newTotalSeconds;
                if (newMaxSeconds !== undefined && newMaxSeconds > 0) {
                    maxSeconds = newMaxSeconds;
                }
                lastTimestamp = 0;
                syncFromSeconds();
            },
            setTimeScale(scale) { currentTimeScale = scale; },
            getTotalSeconds() { return totalSeconds; },
            getMaxSeconds() { return maxSeconds; },
            getTimeScale() { return currentTimeScale; },
            syncFromSeconds
        };
    }

    function createProgressEngine(options = {}) {
        const config = {
            onTick: options.onTick || (() => {}),
            quantize: options.quantize > 0 ? options.quantize : 0.005
        };

        let startPercent = 0;
        let totalDurationMs = 0;
        let remainingMs = 0;
        let currentPercent = 0;
        let currentTimeScale = 1;
        let running = false;
        let paused = false;
        let lastTimestamp = 0;
        let lastEmitted = -1;

        function tick(timestamp) {
            if (!running) return;

            if (lastTimestamp === 0) {
                lastTimestamp = timestamp;
                requestAnimationFrame(tick);
                return;
            }

            const dt = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            if (!paused && remainingMs > 0) {
                remainingMs -= dt * currentTimeScale;
                if (remainingMs < 0) remainingMs = 0;

                if (totalDurationMs > 0) {
                    const progress = 1 - (remainingMs / totalDurationMs);
                    currentPercent = startPercent * (1 - progress);
                } else {
                    currentPercent = 0;
                }

                const quantized = Math.round(currentPercent / config.quantize) * config.quantize;
                if (quantized !== lastEmitted) {
                    lastEmitted = quantized;
                    config.onTick(quantized);
                }
            }

            requestAnimationFrame(tick);
        }

        return {
            start() {
                if (running) return;
                running = true;
                lastTimestamp = 0;
                requestAnimationFrame(tick);
            },

            stop() {
                running = false;
                lastTimestamp = 0;
            },

            pause(isPause) {
                paused = isPause;
                if (isPause) {
                    lastTimestamp = 0;
                }
            },

            reset(newPercent, durationMs) {
                startPercent = newPercent;
                currentPercent = newPercent;
                totalDurationMs = durationMs;
                remainingMs = durationMs;
                lastTimestamp = 0;
                lastEmitted = Math.round(newPercent / config.quantize) * config.quantize;
                config.onTick(newPercent);
            },

            setScale(newScale) {
                if (newScale === currentTimeScale) return;
                currentTimeScale = newScale;
            },

            getPercent() { return currentPercent; },
            getTimeScale() { return currentTimeScale; }
        };
    }

    const RES_IMG_EXTS = ['.webp', '.png', '.jpeg', '.jpg'];

    function tryNextResImageExt(img) {
        const src = img.getAttribute('src') || '';
        if (src.indexOf('/Res/') < 0) return false;

        const q = src.search(/[?#]/);
        const path = q < 0 ? src : src.slice(0, q);
        const tail = q < 0 ? '' : src.slice(q);
        const slash = path.lastIndexOf('/');
        const dot = path.lastIndexOf('.');
        if (dot <= slash) return false;
        const base = path.slice(0, dot);
        const curExt = path.slice(dot).toLowerCase();

        let tried = img.__resTriedExts;
        if (!tried || img.__resTriedBase !== base) {
            tried = img.__resTriedExts = [];
            img.__resTriedBase = base;
        }
        if (tried.indexOf(curExt) < 0) tried.push(curExt);

        for (let i = 0; i < RES_IMG_EXTS.length; i++) {
            const ext = RES_IMG_EXTS[i];
            if (tried.indexOf(ext) >= 0) continue;
            tried.push(ext);
            img.setAttribute('src', base + ext + tail);
            return true;
        }
        img.setAttribute('data-res-missing', '1');
        img.dispatchEvent(new CustomEvent('res-image-missing', { bubbles: true }));
        return false;
    }

    document.addEventListener('error', function (e) {
        const t = e.target;
        if (!t || t.tagName !== 'IMG') return;
        if (tryNextResImageExt(t)) {
            e.stopPropagation();
        }
    }, true);

    global.createWebUICore = createWebUICore;
    global.tryNextResImageExt = tryNextResImageExt;

})(window);
