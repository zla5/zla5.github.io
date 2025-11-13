(function(){
    'use strict';

    if (window.__waUserscriptInstalled) return; window.__waUserscriptInstalled = true;

    function $(sel){ return document.querySelector(sel); }
    function $$(sel){ return Array.from(document.querySelectorAll(sel)); }

    function log(){ try { Android && Android.logInfo && Android.logInfo(Array.from(arguments).join(' ')); } catch(_){} }
    function warn(){ try { Android && Android.logWarn && Android.logWarn(Array.from(arguments).join(' ')); } catch(_){} }
    function error(){ try { Android && Android.logError && Android.logError(Array.from(arguments).join(' ')); } catch(_){ console.error.apply(console, arguments); } }

    // Simple LRU in-memory cache
    const memCache = new Map();
    const MEM_CAP = 600;
    function memGet(key){ if(!memCache.has(key)) return null; const val = memCache.get(key); memCache.delete(key); memCache.set(key,val); return val; }
    function memSet(key,val){ if(memCache.has(key)) memCache.delete(key); memCache.set(key,String(val||'')); if(memCache.size>MEM_CAP){ const oldest = memCache.keys().next().value; if(oldest!=null) memCache.delete(oldest);} }

    function getMsgCacheKey(text){ try{ if(!text) return null; return 'wa_translate_cache_'+btoa(unescape(encodeURIComponent(text))); }catch(_){ return null; } }

    // Minimal CSS (non-destructive)
    try {
        const color = (window.Android && Android.getTranslationTextColor) ? (Android.getTranslationTextColor()||'#333333') : '#333333';
        const css = `
            html, body { overflow-x:hidden !important; }
            /* Hide mic */
            button[aria-label="语音消息"], button[aria-label="Voice message"], [data-icon*="mic"] { display:none !important; }
            /* Translated block */
            .translated-text { margin-top:6px; font-size:14px; }
            .translated-text .selectable-text.copyable-text { user-select:text; border-top:1px dashed #bbb; margin:4px 0 0 0; padding:4px 0 0 0; white-space:pre-line; color:${color}; }
        `;
        (function addStyle(css){ try{ if (typeof GM_addStyle === 'function') { GM_addStyle(css); return; } }catch(_){}
            var s=document.createElement('style'); s.textContent=css; (document.head||document.documentElement).appendChild(s);
        })(css);
    } catch(e) { warn('add style failed', e && e.message); }

    // Theme color detection (best-effort)
    try {
        const meta = document.querySelector('meta[name="theme-color"]');
        const theme = (meta && meta.getAttribute('content')) || getComputedStyle(document.body||document.documentElement).backgroundColor || '#ffffff';
        if (window.Android && Android.onThemeColorDetected) Android.onThemeColorDetected(theme);
    } catch(_){ }

    // Helpers for languages/engine
    function getUserLanguage(){ try { return (Android && Android.getUserLanguage) ? (Android.getUserLanguage()||'auto') : 'auto'; } catch(_){ return 'auto'; } }
    function getGlobalEngine(){ try { return (Android && Android.getGlobalTranslationEngine) ? (Android.getGlobalTranslationEngine()||'google') : 'google'; } catch(_){ return 'google'; } }

    // Per-contact language (optional): localStorage key used by native script
    function getCurrentCustomerPhone(){
        // Heuristic: read header region for phone title
        try {
            const headers = document.querySelectorAll('header');
            const targetHeader = headers.length >= 4 ? headers[3] : headers[headers.length-1];
            const phoneEl = targetHeader && targetHeader.querySelector('span[title*="+"]');
            const t = phoneEl && (phoneEl.getAttribute('title')||phoneEl.textContent||'').trim();
            return t && t.startsWith('+') ? t : null;
        } catch(_){ return null; }
    }

    function getCustomerTargetLang(){
        try {
            const phone = getCurrentCustomerPhone();
            if (!phone) return null;
            const all = JSON.parse(localStorage.getItem('customerLanguageSettings')||'{}');
            const ex = all[phone];
            if (ex && ex.targetLang && ex.targetLang !== 'auto') return ex.targetLang;
        } catch(_){ }
        return null;
    }

    // Send translation callback registry
    const __sendCallbacks = Object.create(null);

    // Bridge delivery handlers (called by Android)
    window.__applyTranslation = function(nodeId, translated, errorMessage){
        try {
            const msg = document.querySelector('div._amk6._amlo[data-android-id="'+nodeId+'"]');
            if (!msg) return;
            if (msg.querySelector('.translated-text')) return;
            const textEl = msg.querySelector('span._ao3e.selectable-text.copyable-text');
            if (!textEl) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'translated-text';
            const inner = document.createElement('div');
            inner.className = 'selectable-text copyable-text';
            inner.textContent = (translated||'');
            if (errorMessage) inner.textContent = '翻译失败: ' + errorMessage;
            wrapper.appendChild(inner);
            textEl.parentNode && textEl.parentNode.appendChild(wrapper);
            try { const key = getMsgCacheKey((textEl.innerText||'').trim()); if (key && translated) memSet(key, translated); } catch(_){ }
        } catch(e){ error('applyTranslation error', e && e.message); }
    };

    window.__applyTranslationForSend = function(reqId, translated){
        try { if (reqId && __sendCallbacks[reqId]) { __sendCallbacks[reqId](translated); delete __sendCallbacks[reqId]; } } catch(_){ }
    };

    // Utility to ensure a message element has a stable id for callbacks
    function ensureMessageId(el){
        if (!el) return null;
        if (!el.getAttribute('data-android-id')){
            const textEl = el.querySelector('span._ao3e.selectable-text.copyable-text');
            const t = (textEl && textEl.innerText||'').trim();
            let hash = 0; for (let i=0;i<t.length;i++){ hash = ((hash<<5)-hash)+t.charCodeAt(i); hash|=0; }
            el.setAttribute('data-android-id', String(Date.now())+'_'+Math.abs(hash));
        }
        return el.getAttribute('data-android-id');
    }

    // Auto-translate visible messages (viewport-priority + mem cache only)
    function isInViewport(el){ const r = el.getBoundingClientRect(); return r.bottom>0 && r.top < (innerHeight||document.documentElement.clientHeight); }

    async function translateVisibleMessages(){
        try {
            const cards = document.querySelectorAll('div._amk6._amlo');
            const targetLangUser = getUserLanguage();
            for (const msg of cards){
                if (msg.getAttribute('data-translated')==='1') continue;
                if (!isInViewport(msg)) continue;
                const textEl = msg.querySelector('span._ao3e.selectable-text.copyable-text');
                if (!textEl) continue;
                const original = (textEl.innerText||'').trim();
                if (!original) continue;
                const key = getMsgCacheKey(original);
                const cached = key ? memGet(key) : null;
                if (cached){
                    if (!msg.querySelector('.translated-text')){
                        const wrapper = document.createElement('div'); wrapper.className='translated-text';
                        const inner = document.createElement('div'); inner.className='selectable-text copyable-text'; inner.textContent=cached; wrapper.appendChild(inner);
                        textEl.parentNode && textEl.parentNode.appendChild(wrapper);
                    }
                    msg.setAttribute('data-translated','1');
                    continue;
                }
                // Request translation via Android bridge
                const id = ensureMessageId(msg);
                const targetLang = targetLangUser && targetLangUser !== 'auto' ? targetLangUser : 'zh-CN';
                try { Android.translateGenericForNode && Android.translateGenericForNode('auto', targetLang, original, id); } catch(_){ }
                msg.setAttribute('data-translated','1');
            }
        } catch(e){ warn('translateVisibleMessages error', e && e.message); }
    }

    const mo = new MutationObserver(() => { try { translateVisibleMessages(); } catch(_){ } });
    try { mo.observe(document.body, {subtree:true, childList:true}); } catch(_){ }
    setInterval(translateVisibleMessages, 800);

    // Intercept send, translate then send
    function getComposer(){ return document.querySelector('footer div[contenteditable="true"]') || document.querySelector('[contenteditable="true"]'); }
    function readComposer(){ const ed=getComposer(); return ed ? (ed.innerText||ed.textContent||'') : ''; }
    function replaceComposer(text){ const ed=getComposer(); if(!ed) return; ed.focus(); try{ document.execCommand('selectAll'); setTimeout(()=>{ document.execCommand('insertText', false, text); try{ ed.dispatchEvent(new InputEvent('input',{bubbles:true,cancelable:true})); }catch(_){ } }, 200); }catch(_){ ed.textContent=text; try{ ed.dispatchEvent(new InputEvent('input',{bubbles:true,cancelable:true})); }catch(_){ } } }

    function getEngine(){ const c = getCustomerTargetLang(); if (c) return (localStorage.getItem('customerEngine')||getGlobalEngine()); return getGlobalEngine(); }

    function hookSendButtons(){
        const selectors = [
            '[data-icon="wds-ic-send-filled"]', '[data-icon^="wds-ic-send"]', '[data-icon*="send"]',
            'button[aria-label="发送"]', 'button[aria-label="Send"]', '[data-testid="send"]',
            'button[title="发送"]', 'button[title="Send"]', 'button[data-testid="compose-btn-send"]', 'div[data-testid="send-button"]'
        ];
        const icons = [];
        selectors.forEach(s => { icons.push(...$$(s)); });
        icons.forEach(icon => {
            const btn = icon.closest('div[role="button"]') || icon.closest('button') || icon;
            if (!btn || (btn.classList && btn.classList.contains('wa-translate-send-hooked'))) return;
            btn.classList && btn.classList.add('wa-translate-send-hooked');
            const handler = (evt) => {
                try {
                    const original = (readComposer()||'').trim(); if (!original) return;
                    // Debounce/lock
                    const now = Date.now(); if (!window.__waEventLockTs) window.__waEventLockTs=0; if (now - window.__waEventLockTs < 400 || window.__waSendInProgress){ evt.preventDefault(); evt.stopPropagation(); return; }
                    window.__waEventLockTs = now; window.__waSendInProgress = true; evt.preventDefault(); evt.stopPropagation();

                    // Resolve languages
                    let sourceLang = 'zh-CN';
                    try { const u = getUserLanguage(); sourceLang = (u && u!=='auto') ? u : 'zh-CN'; } catch(_){ }
                    const cfgLang = getCustomerTargetLang();
                    const targetLang = cfgLang || 'en';

                    const finalize = () => { setTimeout(()=>{ window.__waSendInProgress=false; }, 250); };
                    const doSend = (txt) => {
                        replaceComposer(txt);
                        setTimeout(()=>{ try { const b = btn; b && b.click && b.click(); } catch(_){ } finalize(); }, 350);
                    };

                    if (sourceLang !== targetLang){
                        const reqId = 'send_'+Date.now()+'_'+Math.random().toString(36).slice(2);
                        const engine = getEngine();
                        __sendCallbacks[reqId] = (translated) => {
                            if (translated && translated.trim()) { doSend(translated); } else { finalize(); }
                        };
                        try {
                            if (engine === 'bing' && Android.translateWithBing) Android.translateWithBing(sourceLang, targetLang, original, reqId);
                            else if (engine === 'volc' && Android.translateWithVolc) Android.translateWithVolc(sourceLang, targetLang, original, reqId);
                            else if (engine === 'ghtml' && Android.translateWithGoogleHtml) Android.translateWithGoogleHtml(sourceLang, targetLang, original, reqId);
                            else if (Android.translateGeneric) Android.translateGeneric(sourceLang, targetLang, original, reqId);
                            else finalize();
                        } catch(e){ warn('send translate call failed', e && e.message); finalize(); }
                    } else {
                        doSend(original);
                    }
                } catch(e){ warn('send handler error', e && e.message); }
            };
            ['pointerdown','mousedown','click'].forEach(ev => btn.addEventListener(ev, handler, true));
        });
    }
    setInterval(hookSendButtons, 800);

    // Link handling: open in external browser via Android
    try {
        document.addEventListener('click', function(e){
            const a = e.target && e.target.closest && e.target.closest('a[href]');
            if (!a) return;
            const href = a.getAttribute('href'); if (!href) return;
            if (href.startsWith('#') || href.startsWith('/')) return; // let internal links pass
            e.preventDefault(); e.stopPropagation();
            try { Android && Android.openExternalLink && Android.openExternalLink(href); } catch(_){ window.open(href, '_blank'); }
        }, true);
        // Remove target=_blank for consistency
        $$('a[target="_blank"]').forEach(a => a.removeAttribute('target'));
    } catch(_){ }

    // Initial kick
    setTimeout(translateVisibleMessages, 1000);
})();
