// ==UserScript==
// @name         WATransChat-苹果手机WhatsApp自动翻译
// @namespace    https://github.com/zla5/WATransChat
// @version      2025/11/15
// @description  根据电话区号查询国家语言和语言代码，显示国家信息和当地时间，支持消息翻译成中文(谷歌和Bing)。
// @author       zla5
// @match        https://web.whatsapp.com*
// @match        https://web.whatsapp.com/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      translate.googleapis.com
// @connect      translation.googleapis.com
// @connect      translate-pa.googleapis.com
// @connect      serial.babyamy.store
// @connect      edge.microsoft.com
// @connect      api-edge.cognitive.microsofttranslator.com
// @connect      translate.volcengine.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 创建样式
    GM_addStyle(`
        /* 隐藏水平滚动条，保持文本选择功能 */
        html, body {
            overflow-x: hidden !important;
            overflow-y: auto !important;
            touch-action: pan-y !important;
            -webkit-text-size-adjust: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
        }

        /* 隐藏水平滚动条 */
        ::-webkit-scrollbar:horizontal {
            display: none !important;
        }

        /* 保持垂直滚动条但隐藏水平滚动条 */
        ::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
        }

        /* 允许所有文本选择，但保持图标正常显示 */
        * {
            touch-action: pan-y !important;
        }

        /* 隐藏左侧边栏 */
        header[data-tab="2"] {
            display: none;
        }

        /* 隐藏左侧边陈虚线 */
        .x10l6tqk.x13vifvy.x78zum5.xh8yej3.x5yr21d.x6ikm8r.x10wlt62.x47corl.x1lzxqs6.x1oy9qf3.xpilrb4.x1t7ytsu.x1vb5itz {
            display: none;
        }

        /* 隐藏左侧边栏后点击新聊天按钮后能全屏显示 */
        .xevlxbw {
            margin-inline-start: 0 !important;
        }

        /* 默认情况下聊天列表全屏显示，但不超出屏幕 */
        .two ._aigw:not(._asu3) {
            flex: 1 1 auto !important;
            width: 100% !important;
            max-width: 100vw !important;
        }

        @media screen and (max-width: 900px) {
            .two ._aigw:not(._asu3) {
                flex: 1 1 auto !important;
                width: 100% !important;
                max-width: 100vw !important;
            }
        }

        /* 隐藏语音消息按钮，但保持客户语言按钮显示 */
        button[aria-label="语音消息"],
        button[aria-label="Voice message"],
        [data-icon="mic-outlined"],
        [data-icon*="mic"] {
            display: none !important;
        }

        /* 右侧聊天全屏显示 - 终极解决方案 */
        .x9f619.x1n2onr6.xupqr0c.wa-chat-active {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            transform: none !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            min-height: 100vh !important;
            max-height: 100vh !important;
            flex: none !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            flex-basis: auto !important;
            grid-column: none !important;
            grid-row: none !important;
            float: none !important;
            clear: none !important;
            vertical-align: baseline !important;
            display: block !important;
        }

        .wa-chat-active #main * {
            max-width: none !important;
            min-width: auto !important;
        }

        .wa-chat-active #main > * {
            width: 100% !important;
            max-width: 100% !important;
        }

        .x9f619.x1n2onr6.xupqr0c.wa-chat-active::-webkit-scrollbar {
            display: none !important;
        }

        @media screen and (max-width: 768px) {
            .x9f619.x1n2onr6.xupqr0c.wa-chat-active {
                width: 100vw !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                top: 0 !important;
                height: 100vh !important;
                min-width: 100vw !important;
                max-width: 100vw !important;
            }
        }

        @media screen and (min-width: 769px) {
            .x9f619.x1n2onr6.xupqr0c.wa-chat-active {
                width: 100vw !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                top: 0 !important;
                height: 100vh !important;
                min-width: 100vw !important;
                max-width: 100vw !important;
            }
        }

        /* 上传图片显示图片居中 */
        .x1n2onr6.xupqr0c.x78zum5.x1r8uery.x1iyjqo2.xdt5ytf.x1hc1fzr.x6ikm8r.x10wlt62 {
            width: 100vw !important;
        }

        /* 隐藏表情按钮 */
        div[aria-label="表情符号、动图、贴图"],
        div[aria-label="Emoji, GIF, Sticker"],
        .x78zum5.x98rzlu.xpvyfi4.x1fns5xo.x6s0dn4.xl56j7k.x1c9tyrk.xeusxvb.x1pahc9y.x1ertn4p.xbelrpt,
        .x78zum5.x98rzlu.xpvyfi4.x1fns5xo.x6s0dn4.xl56j7k.x1c9tyrk.xeusxvb.xlpahc9y.x1ertn4p.xbelrpt.xyklrzc.xlryltff {
            display: none !important;
        }

        /* 自定义SVG表情按钮样式 */
        .custom-emoji-button {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: none !important;
            border: none !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            padding: 8px !important;
            margin: 0 4px !important;
            transition: background-color 0.2s ease !important;
            outline: none !important;
            user-select: none !important;
        }

        .custom-emoji-button:hover {
            background: rgba(0, 0, 0, 0.1) !important;
        }

        .custom-emoji-button:active {
            background: rgba(0, 0, 0, 0.15) !important;
        }

        .custom-emoji-button svg {
            width: 20px !important;
            height: 20px !important;
            fill: currentColor !important;
            transition: fill 0.2s ease !important;
        }

        .dark .custom-emoji-button {
            background: none !important;
            color: white !important;
        }

        .dark .custom-emoji-button:hover {
            background: rgba(255, 255, 255, 0.1) !important;
        }

        .dark .custom-emoji-button:active {
            background: rgba(255, 255, 255, 0.15) !important;
        }

        .dark .custom-emoji-button svg,
        .dark .custom-emoji-button svg path {
            fill: white !important;
        }

        .customer-lang-button.wa-custom-back-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 40px !important;
            height: 40px !important;
            border-radius: 50% !important;
            background: transparent !important;
            color: #111b21 !important;
            transition: background-color 0.16s ease-in-out, color 0.16s ease-in-out !important;
        }

        .customer-lang-button.wa-custom-back-button svg {
            width: 20px !important;
            height: 20px !important;
        }

        .customer-lang-button.wa-custom-back-button:hover {
            background: rgba(17, 27, 33, 0.08) !important;
        }

        .customer-lang-button.wa-custom-back-button:active {
            background: rgba(17, 27, 33, 0.12) !important;
        }

        .dark .customer-lang-button.wa-custom-back-button {
            color: #e9edef !important;
            background: transparent !important;
        }

        .dark .customer-lang-button.wa-custom-back-button:hover {
            background: rgba(233, 237, 239, 0.15) !important;
        }

        .dark .customer-lang-button.wa-custom-back-button:active {
            background: rgba(233, 237, 239, 0.22) !important;
        }

        .dark .customer-lang-button,
        .dark .customer-lang-button svg,
        .dark .customer-lang-button svg circle {
            color: white !important;
            fill: white !important;
        }

        .custom-emoji-panel {
            position: fixed !important;
            bottom: 80px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 400px !important;
            max-height: 500px !important;
            background: white !important;
            border: 1px solid #e0e0e0 !important;
            border-radius: 8px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
            z-index: 10000 !important;
            display: none !important;
            flex-direction: column !important;
            overflow: hidden !important;
        }

        .custom-emoji-panel.show {
            display: flex !important;
        }

        .custom-emoji-panel.dark {
            background: #2a2a2a !important;
            border-color: #444 !important;
            color: white !important;
        }

        .emoji-panel-content {
            height: 100% !important;
            overflow-y: auto !important;
            padding: 0 !important;
        }

        .emoji-category-title {
            padding: 8px 16px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #666 !important;
            background: #f8f9fa !important;
            border-bottom: 1px solid #e0e0e0 !important;
            margin: 0 !important;
        }

        .dark .emoji-category-title {
            color: #ccc !important;
            background: #333 !important;
            border-bottom-color: #444 !important;
        }

        .emoji-row {
            display: flex !important;
            flex-wrap: wrap !important;
            padding: 8px 0 !important;
            margin: 0 !important;
        }

        .emoji-item {
            display: inline-block !important;
            width: 32px !important;
            height: 32px !important;
            cursor: pointer !important;
            border-radius: 4px !important;
            transition: background-color 0.15s ease !important;
            user-select: none !important;
            margin: 2px !important;
            position: relative !important;
            vertical-align: top !important;
            text-align: center !important;
            line-height: 32px !important;
            font-size: 18px !important;
            font-family: 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Android Emoji','EmojiSymbols',sans-serif !important;
        }

        .emoji-item:hover {
            background-color: #f0f0f0 !important;
        }

        .dark .emoji-item:hover {
            background-color: #444 !important;
        }

        .emoji-item:active {
            background-color: #e0e0e0 !important;
            transform: scale(0.95) !important;
        }

        .dark .emoji-item:active {
            background-color: #555 !important;
        }

        .emoji-close {
            position: absolute !important;
            top: 8px !important;
            right: 12px !important;
            background: none !important;
            border: none !important;
            font-size: 20px !important;
            cursor: pointer !important;
            color: #666 !important;
            padding: 4px !important;
            width: 24px !important;
            height: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 50% !important;
            transition: background-color 0.2s ease !important;
        }

        .emoji-close:hover {
            background: #f0f0f0 !important;
        }

        .dark .emoji-close {
            color: #ccc !important;
        }

        .dark .emoji-close:hover {
            background: #444 !important;
        }

        /* 消息气泡最大宽度设置为100% */
        ._amkd {
            max-width: 100% !important;
        }

        /* 减少消息气泡的内边距 */
        .xahtqtb {
            padding-inline-end: 8px !important;
        }

        .x1klvx2g {
            padding-inline-start: 8px !important;
        }

        /* 弹窗大小设置 */
        .xvue9z {
            width: 300px !important;
        }

        /* 解决删除消息弹窗不居中的问题 */
        .xpb48g7 {
            min-width: auto !important;
        }

        /* 消息搜索框全屏居中显示 */
        .three ._aig-:not(._asu3) {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(0.95) !important;
            z-index: 10000 !important;
            width: 90vw !important;
            max-width: 520px !important;
            background: white !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
            padding: 16px !important;
        }

        /* 将登陆二维码强制左对齐 */
        .xr3inr3.xr3inr3 {
            justify-content: left !important;
        }
    `);

    // 布局控制相关变量和函数
    const CHAT_ACTIVE_CLASS = 'wa-chat-active';
    let chatModeActive = false;

    function getChatAreaElement() {
        const main = document.querySelector('#main');
        return main ? main.parentElement : null;
    }

    function getSidePanelElement(chatArea) {
        const headers = document.querySelectorAll('header');
        if (headers.length > 1) {
            const panel = headers[1].parentElement;
            if (panel && panel !== chatArea && !panel.contains(chatArea)) {
                return panel;
            }
        }
        return null;
    }

    function hideChatListContainers() {
        document.querySelectorAll('.two ._aigw:not(._asu3)').forEach((container) => {
            container.style.display = 'none';
        });
    }

    function showChatListContainers() {
        document.querySelectorAll('.two ._aigw:not(._asu3)').forEach((container) => {
            container.style.display = '';
        });
    }

    function applyChatAreaFullscreen(chatArea) {
        if (!chatArea) return;
        chatArea.style.position = 'fixed';
        chatArea.style.top = '0';
        chatArea.style.left = '0';
        chatArea.style.right = '0';
        chatArea.style.bottom = '0';
        chatArea.style.width = '100vw';
        chatArea.style.height = '100vh';
        chatArea.style.margin = '0';
        chatArea.style.padding = '0';
        chatArea.style.boxSizing = 'border-box';
        chatArea.style.transform = 'none';
        chatArea.style.minWidth = '100vw';
        chatArea.style.maxWidth = '100vw';
        chatArea.style.minHeight = '100vh';
        chatArea.style.maxHeight = '100vh';
        chatArea.style.overflowX = 'hidden';
        chatArea.style.overflowY = 'auto';
        const parent = chatArea.parentElement;
        if (parent) {
            parent.style.width = '100vw';
            parent.style.maxWidth = 'none';
            parent.style.overflow = 'visible';
        }
    }

    function enterChatMode() {
        const chatArea = getChatAreaElement();
        if (!chatArea) return;

        const sidePanel = getSidePanelElement(chatArea);
        if (sidePanel) sidePanel.style.display = 'none';
        chatArea.style.display = 'flex';
        chatArea.classList.add(CHAT_ACTIVE_CLASS);
        hideChatListContainers();
        chatModeActive = true;

        requestAnimationFrame(() => {
            if (!chatModeActive || !chatArea.isConnected) return;
            applyChatAreaFullscreen(chatArea);
        });
    }

    function restoreChatAreaStyles(chatArea) {
        if (!chatArea) return;
        chatArea.style.removeProperty('position');
        chatArea.style.removeProperty('top');
        chatArea.style.removeProperty('left');
        chatArea.style.removeProperty('right');
        chatArea.style.removeProperty('bottom');
        chatArea.style.removeProperty('width');
        chatArea.style.removeProperty('height');
        chatArea.style.removeProperty('margin');
        chatArea.style.removeProperty('padding');
        chatArea.style.removeProperty('box-sizing');
        chatArea.style.removeProperty('transform');
        chatArea.style.removeProperty('min-width');
        chatArea.style.removeProperty('max-width');
        chatArea.style.removeProperty('min-height');
        chatArea.style.removeProperty('max-height');
        chatArea.style.removeProperty('overflow-x');
        chatArea.style.removeProperty('overflow-y');
        const parent = chatArea.parentElement;
        if (parent) {
            parent.style.removeProperty('width');
            parent.style.removeProperty('max-width');
            parent.style.removeProperty('overflow');
        }
    }

    function exitChatMode() {
        if (!chatModeActive && !document.querySelector(`.${CHAT_ACTIVE_CLASS}`)) return;
        const chatArea = getChatAreaElement();
        if (chatArea) {
            chatArea.classList.remove(CHAT_ACTIVE_CLASS);
            restoreChatAreaStyles(chatArea);
            chatArea.style.display = 'none';
        }
        const sidePanel = getSidePanelElement(chatArea);
        if (sidePanel) sidePanel.style.display = 'flex';
        showChatListContainers();
        chatModeActive = false;
    }

    function isBackControl(target) {
        if (!target) return false;
        return Boolean(
            target.closest('span[data-icon="back"]') ||
            target.closest('span[data-icon="arrow-left"]') ||
            target.closest('[data-testid="conversation-info-header-back"]') ||
            target.closest('button[aria-label="Back"]') ||
            target.closest('button[aria-label="返回"]') ||
            target.closest('div[role="button"][aria-label="Back"]') ||
            target.closest('div[role="button"][aria-label="返回"]')
        );
    }

    function handleGlobalClick(event) {
        const target = event.target;
        if (!target) return;

        if (
            target.closest('span[data-icon="more-refreshed"]') ||
            target.closest('div[role="toolbar"]') ||
            target.closest('[aria-label*="menu"]')
        ) {
            return;
        }

        const chatRow = target.closest('div[role="row"]');
        if (chatRow) {
            setTimeout(enterChatMode, 60);
            return;
        }

        if (isBackControl(target)) {
            setTimeout(exitChatMode, 60);
        }
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape' && chatModeActive) {
            exitChatMode();
        }
    }

    function setupChatLayoutHandlers() {
        if (window.__waChatLayoutHandlersInstalled) return;
        window.__waChatLayoutHandlersInstalled = true;

        function addBackButtonIfNeeded() {
            const headers = document.querySelectorAll('header');
            if (headers.length < 4) return;
            const targetHeader = headers[3];
            if (!targetHeader) return;
            if (targetHeader.querySelector('.wa-custom-back-button')) return;

            const button = document.createElement('button');
            button.className = 'customer-lang-button wa-custom-back-button';
            button.setAttribute('aria-label', '返回会话列表');
            button.setAttribute('title', '返回会话列表 (Esc)');
            button.style.marginInlineEnd = '6px';
            button.innerHTML = `
                <svg t="1763033155339" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                    <path d="M243.2 448L601.6 89.6 512 0 0 512l512 512 89.6-89.6L243.2 576H1024v-128z" fill="currentColor"></path>
                </svg>
            `;
            button.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                exitChatMode();
            });

            targetHeader.insertBefore(button, targetHeader.firstChild);
        }

        document.addEventListener('click', handleGlobalClick, true);
        document.addEventListener('keydown', handleEscapeKey, true);

        ['popstate', 'hashchange'].forEach((evt) => {
            window.addEventListener(evt, () => {
                if (!chatModeActive) return;
                setTimeout(() => {
                    const chatArea = getChatAreaElement();
                    if (!chatArea || window.getComputedStyle(chatArea).display === 'none') {
                        exitChatMode();
                    }
                }, 80);
            });
        });

        addBackButtonIfNeeded();
        const headerObserver = new MutationObserver(() => addBackButtonIfNeeded());
        headerObserver.observe(document.body, { childList: true, subtree: true });

        // 初始检测：若加载时已在聊天界面，确保进入聊天模式
        setTimeout(() => {
            const chatArea = getChatAreaElement();
            if (!chatArea) return;
            const sidePanel = document.querySelector('#side');
            if (
                sidePanel &&
                window.getComputedStyle(sidePanel).display !== 'none' &&
                window.getComputedStyle(chatArea).display !== 'none'
            ) {
                enterChatMode();
            } else if (chatArea && window.getComputedStyle(chatArea).display === 'none') {
                chatModeActive = false;
            }
        }, 800);
    }

    setupChatLayoutHandlers();

    // 全局变量
    const API_BASE_URL = 'https://serial.babyamy.store/api/';
    const DEFAULT_TRANSLATED_TEXT_COLOR = '#333333';
    let countryInfo = {};
    let currentPhoneNumber = '';

    const membershipState = {
        email: localStorage.getItem('memberEmail') || '',
        token: localStorage.getItem('memberToken') || '',
        planName: localStorage.getItem('memberPlanName') || '',
        subscriptionStatus: localStorage.getItem('memberStatusText') || '',
        subscriptionEnd: localStorage.getItem('memberSubscriptionEnd') || '',
        trialEnd: localStorage.getItem('memberTrialEnd') || '',
        subscriptionValid: localStorage.getItem('memberSubscriptionValid') === 'true',
        trialValid: localStorage.getItem('memberTrialValid') === 'true',
        lastSyncedAt: Number(localStorage.getItem('memberLastSyncedAt') || '0'),
        translatedTextColor: normalizeTranslatedColor(localStorage.getItem('memberTranslatedColor'))
    };

    ['expiresAt', 'serial', 'trialStart', 'trialEnd'].forEach(key => {
        try {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
            }
        } catch (_) {}
    });

    function getTranslatedTextColor() {
        return membershipState.translatedTextColor || DEFAULT_TRANSLATED_TEXT_COLOR;
    }

    function normalizeTranslatedColor(value) {
        if (typeof value !== 'string') {
            return DEFAULT_TRANSLATED_TEXT_COLOR;
        }
        const trimmed = value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
            return trimmed.toUpperCase();
        }
        if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
            const r = trimmed[1];
            const g = trimmed[2];
            const b = trimmed[3];
            return (`#${r}${r}${g}${g}${b}${b}`).toUpperCase();
        }
        return DEFAULT_TRANSLATED_TEXT_COLOR;
    }

    function applyTranslatedTextColor(color) {
        try {
            const normalized = normalizeTranslatedColor(color);
            document.querySelectorAll('.translated-text .selectable-text.copyable-text').forEach((el) => {
                el.style.color = normalized;
            });
        } catch (_) {}
    }

    function setTranslatedTextColor(color) {
        const normalized = normalizeTranslatedColor(color);
        if (membershipState.translatedTextColor === normalized) return;
        membershipState.translatedTextColor = normalized;
        localStorage.setItem('memberTranslatedColor', normalized);
        applyTranslatedTextColor(normalized);
    }

    applyTranslatedTextColor(getTranslatedTextColor());

    function persistMembershipState() {
        localStorage.setItem('memberEmail', membershipState.email || '');
        localStorage.setItem('memberToken', membershipState.token || '');
        localStorage.setItem('memberPlanName', membershipState.planName || '');
        localStorage.setItem('memberStatusText', membershipState.subscriptionStatus || '');
        localStorage.setItem('memberSubscriptionEnd', membershipState.subscriptionEnd || '');
        localStorage.setItem('memberTrialEnd', membershipState.trialEnd || '');
        localStorage.setItem('memberSubscriptionValid', membershipState.subscriptionValid ? 'true' : 'false');
        localStorage.setItem('memberTrialValid', membershipState.trialValid ? 'true' : 'false');
        localStorage.setItem('memberLastSyncedAt', membershipState.lastSyncedAt ? String(membershipState.lastSyncedAt) : '0');
        localStorage.setItem('memberTranslatedColor', getTranslatedTextColor());
    }

    function clearMembershipState() {
        membershipState.email = '';
        membershipState.token = '';
        membershipState.planName = '';
        membershipState.subscriptionStatus = '';
        membershipState.subscriptionEnd = '';
        membershipState.trialEnd = '';
        membershipState.subscriptionValid = false;
        membershipState.trialValid = false;
        membershipState.lastSyncedAt = 0;
        setTranslatedTextColor(DEFAULT_TRANSLATED_TEXT_COLOR);
        persistMembershipState();
        updateMemberButtonStatusText();
    }

    function getMembershipDeviceId() {
        const saved = localStorage.getItem('memberDeviceId');
        if (saved) return saved;
        try {
            if (typeof Android !== 'undefined' && typeof Android.getDeviceId === 'function') {
                const deviceId = Android.getDeviceId();
                if (deviceId) {
                    localStorage.setItem('memberDeviceId', deviceId);
                    return deviceId;
                }
            }
        } catch (err) {
            console.warn('Android.getDeviceId 调用失败:', err);
        }
        let id = null;
        if (window.crypto && crypto.randomUUID) {
            id = `android-web-${crypto.randomUUID()}`;
        } else {
            id = `android-web-${Math.random().toString(36).slice(2)}${Date.now()}`;
        }
        localStorage.setItem('memberDeviceId', id);
        return id;
    }

    function isMembershipValidLocal() {
        const now = Date.now();
        if (membershipState.subscriptionValid) {
            if (!membershipState.subscriptionEnd) return true;
            const end = Date.parse(membershipState.subscriptionEnd);
            if (!Number.isNaN(end)) {
                return end >= now;
            }
            return true;
        }
        if (membershipState.trialValid) {
            if (!membershipState.trialEnd) return true;
            const end = Date.parse(membershipState.trialEnd);
            if (!Number.isNaN(end)) {
                return end >= now;
            }
            return true;
        }
        return false;
    }

    function updateMembershipFromUser(user) {
        if (!user) return;
        membershipState.planName = user.plan_name || '';
        membershipState.subscriptionStatus = user.subscription_status || '';
        membershipState.subscriptionValid = !!user.is_subscription_valid;
        membershipState.trialValid = !!user.is_trial_valid;
        membershipState.subscriptionEnd = user.subscription_end_date || '';
        membershipState.trialEnd = user.trial_end_date || '';
        membershipState.lastSyncedAt = Date.now();
        if (typeof user.translated_text_color === 'string' && user.translated_text_color.trim()) {
            setTranslatedTextColor(user.translated_text_color);
        }
        persistMembershipState();
    }

    async function registerMembership(email, password) {
        if (!email || !password) {
            throw new Error('请输入邮箱和密码');
        }
        const payload = {
            email: email.trim(),
            password: password
        };
        const data = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: `${API_BASE_URL}auth/register`,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
                timeout: 15000,
                onload: (resp) => {
                    try {
                        const json = JSON.parse(resp.responseText || '{}');
                        if (resp.status >= 200 && resp.status < 300 && json.success === true) {
                            resolve(json);
                        } else {
                            const message = json.message || `注册失败 (HTTP ${resp.status})`;
                            reject(new Error(message));
                        }
                    } catch (err) {
                        reject(new Error('服务器返回数据异常'));
                    }
                },
                onerror: () => reject(new Error('网络错误，请稍后重试')),
                ontimeout: () => reject(new Error('请求超时，请检查网络后重试'))
            });
        });
        return data;
    }

    async function loginMembership(email, password) {
        if (!email || !password) {
            throw new Error('请输入邮箱和密码');
        }
        const payload = {
            email: email.trim(),
            password: password,
            device_type: 'android',
            device_id: getMembershipDeviceId()
        };
        const data = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: `${API_BASE_URL}auth/login`,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
                timeout: 15000,
                onload: (resp) => {
                    try {
                        const json = JSON.parse(resp.responseText || '{}');
                        if (resp.status >= 200 && resp.status < 300 && json.success === true) {
                            resolve(json);
                        } else {
                            const message = json.message || `登录失败 (HTTP ${resp.status})`;
                            reject(new Error(message));
                        }
                    } catch (err) {
                        reject(new Error('服务器返回数据异常'));
                    }
                },
                onerror: () => reject(new Error('网络错误，请稍后重试')),
                ontimeout: () => reject(new Error('请求超时，请检查网络后重试'))
            });
        });
        if (!data.user || !data.token) {
            throw new Error('登录成功但缺少用户数据');
        }
        membershipState.email = payload.email;
        membershipState.token = data.token;
        updateMembershipFromUser(data.user);
        persistMembershipState();
        updateMemberButtonStatusText();
        return data.user;
    }

    function logoutMembership() {
        clearMembershipState();
        updateMemberButtonStatusText();
    }

    async function refreshMembershipStatus(force = false) {
        if (!membershipState.email || !membershipState.token) return;
        const now = Date.now();
        if (!force && now - membershipState.lastSyncedAt < 180000) {
            return;
        }
        await new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${API_BASE_URL}user/status?email=${encodeURIComponent(membershipState.email)}`,
                headers: {
                    'Authorization': `Bearer ${membershipState.token}`
                },
                timeout: 15000,
                onload: (resp) => {
                    try {
                        if (resp.status === 401) {
                            clearMembershipState();
                            resolve();
                            return;
                        }
                        const json = JSON.parse(resp.responseText || '{}');
                        if (json && json.success && json.user) {
                            updateMembershipFromUser(json.user);
                            updateMemberButtonStatusText();
                        }
                    } catch (err) {
                        console.warn('解析会员状态失败:', err);
                    }
                    resolve();
                },
                onerror: () => resolve(),
                ontimeout: () => resolve()
            });
        });
    }

    function checkSubscriptionStatus() {
        try {
            if (typeof Android !== 'undefined' && typeof Android.checkSubscriptionStatus === 'function') {
                if (Android.checkSubscriptionStatus()) {
                    return true;
                }
            }
        } catch (error) {
            console.warn('Android.checkSubscriptionStatus 调用失败:', error);
        }
        return isMembershipValidLocal();
    }

    let lastMembershipPromptAt = 0;

    function ensureMembership() {
        const valid = checkSubscriptionStatus();
        if (!valid) {
            const now = Date.now();
            if (now - lastMembershipPromptAt > 2000) {
                lastMembershipPromptAt = now;
                showMembershipLoginDialog();
            }
            return false;
        }
        // 后台异步刷新会员状态，不阻塞翻译操作
        // 使用 setTimeout 确保不会阻塞当前执行
        setTimeout(() => {
            refreshMembershipStatus(false).catch(err => {
                console.warn('后台刷新会员状态失败:', err);
            });
        }, 0);
        return valid;
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (_) {
                // fall back to execCommand
            }
        }
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let succeeded = false;
        try {
            succeeded = document.execCommand('copy');
        } catch (_) {
            succeeded = false;
        }
        textarea.remove();
        return succeeded;
    }

    function notifyClipboardCopied(message) {
        try {
            if (typeof Android !== 'undefined' && typeof Android.showToast === 'function') {
                Android.showToast(message);
                return;
            }
        } catch (_) {}
        window.alert(message);
    }

    function showMembershipLoginDialog() {
        const existing = document.querySelector('.membership-login-overlay');
        if (existing) {
            existing.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'membership-login-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            z-index: 2147483646 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(12, 19, 24, 0.65) !important;
            backdrop-filter: blur(4px) !important;
        `;

        const dialog = document.createElement('div');
        dialog.className = 'membership-login-dialog';
        dialog.style.cssText = `
            width: min(400px, 90vw) !important;
            background: #ffffff !important;
            border-radius: 16px !important;
            padding: 28px 24px !important;
            box-shadow: 0 18px 48px rgba(15, 23, 42, 0.25) !important;
            position: relative !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.style.cssText = `
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            border: none !important;
            cursor: pointer !important;
            background: transparent !important;
            color: #667781 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 20px !important;
            transition: background 0.2s ease !important;
        `;
        closeBtn.textContent = '×';
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = 'rgba(17, 27, 33, 0.08)');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = 'transparent');
        closeBtn.addEventListener('click', () => overlay.remove());

        const title = document.createElement('h2');
        title.style.cssText = `
            margin: 0 0 16px 0 !important;
            font-size: 20px !important;
            font-weight: 600 !important;
            color: #111b21 !important;
            text-align: center !important;
        `;
        title.textContent = '会员登录';

        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            margin: 0 0 24px 0 !important;
            font-size: 14px !important;
            color: #667781 !important;
            text-align: center !important;
            line-height: 1.5 !important;
        `;
        subtitle.textContent = '登录后可同步订阅信息并继续使用翻译功能';

        const getIsLoggedIn = () => !!membershipState.token;

        let isRegisterMode = false;

        const form = document.createElement('form');
        form.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
        `;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = '邮箱';
        emailInput.value = membershipState.email || '';
        emailInput.style.cssText = `
            height: 44px !important;
            border-radius: 12px !important;
            border: 1px solid rgba(17, 27, 33, 0.12) !important;
            padding: 0 14px !important;
            font-size: 15px !important;
            outline: none !important;
            transition: border 0.2s ease !important;
        `;
        emailInput.addEventListener('focus', () => emailInput.style.borderColor = '#25D366');
        emailInput.addEventListener('blur', () => emailInput.style.borderColor = 'rgba(17, 27, 33, 0.12)');

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = '密码';
        passwordInput.style.cssText = emailInput.style.cssText;
        passwordInput.addEventListener('focus', () => passwordInput.style.borderColor = '#25D366');
        passwordInput.addEventListener('blur', () => passwordInput.style.borderColor = 'rgba(17, 27, 33, 0.12)');

        const statusText = document.createElement('div');
        statusText.style.cssText = `
            min-height: 20px !important;
            font-size: 13px !important;
            color: #d93025 !important;
            text-align: center !important;
        `;

        const loginButton = document.createElement('button');
        loginButton.type = 'submit';
        loginButton.textContent = '登录';
        loginButton.style.cssText = `
            height: 48px !important;
            border-radius: 12px !important;
            border: none !important;
            background: linear-gradient(135deg, #25D366, #128C7E) !important;
            color: #ffffff !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            box-shadow: 0 8px 16px rgba(18, 140, 126, 0.25) !important;
        `;
        loginButton.addEventListener('mouseenter', () => {
            loginButton.style.transform = 'translateY(-1px)';
            loginButton.style.boxShadow = '0 12px 24px rgba(18, 140, 126, 0.3)';
        });
        loginButton.addEventListener('mouseleave', () => {
            loginButton.style.transform = 'translateY(0)';
            loginButton.style.boxShadow = '0 8px 16px rgba(18, 140, 126, 0.25)';
        });

        const formContainer = document.createElement('div');
        formContainer.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            width: 100% !important;
        `;

        const helperRow = document.createElement('div');
        helperRow.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            gap: 8px !important;
            margin-top: 12px !important;
            font-size: 13px !important;
            width: 100% !important;
        `;

        const contactLink = document.createElement('a');
        contactLink.href = '#';
        contactLink.textContent = '充值请联系客服微信zla552200(点击复制微信号)';
        contactLink.style.cssText = `
            color: #128C7E !important;
            text-decoration: none !important;
            cursor: pointer !important;
            display: block !important;
            width: 100% !important;
            font-weight: 600 !important;
            padding: 10px 12px !important;
            border-radius: 12px !important;
            background: rgba(18, 140, 126, 0.08) !important;
            text-align: center !important;
            word-break: break-word !important;
            box-sizing: border-box !important;
        `;
        contactLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const contactText = 'zla552200';
            const success = await copyTextToClipboard(contactText);
            if (success) {
                notifyClipboardCopied('已复制到剪贴板');
            } else {
                notifyClipboardCopied('复制失败，请手动添加客服微信zla552200');
            }
        });

        helperRow.appendChild(contactLink);

        const switchModeLink = document.createElement('a');
        switchModeLink.href = '#';
        switchModeLink.textContent = '没有账号？立即注册';
        switchModeLink.style.cssText = `
            color: #128C7E !important;
            text-decoration: none !important;
            cursor: pointer !important;
            font-size: 13px !important;
            margin-top: 6px !important;
            display: inline-block !important;
            text-align: center !important;
            width: 100% !important;
        `;
        switchModeLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (getIsLoggedIn()) return;
            isRegisterMode = !isRegisterMode;
            updateFormMode();
        });

        const footer = document.createElement('div');
        footer.style.cssText = `
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: center !important;
            margin-top: 8px !important;
        `;
        footer.appendChild(helperRow);
        footer.appendChild(switchModeLink);

        const logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.textContent = '退出登录';
        logoutButton.style.cssText = `
            margin-top: 8px !important;
            height: 44px !important;
            width: 100% !important;
            border-radius: 12px !important;
            border: 1px solid rgba(217, 48, 37, 0.25) !important;
            background: rgba(217, 48, 37, 0.08) !important;
            color: #d93025 !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: background 0.2s ease, box-shadow 0.2s ease !important;
        `;
        logoutButton.addEventListener('mouseenter', () => {
            logoutButton.style.background = 'rgba(217, 48, 37, 0.15)';
        });
        logoutButton.addEventListener('mouseleave', () => {
            logoutButton.style.background = 'rgba(217, 48, 37, 0.08)';
        });
        logoutButton.addEventListener('click', () => {
            try {
                logoutMembership();
                emailInput.value = '';
                passwordInput.value = '';
                updateFormMode();
                statusText.style.color = '#25D366';
                statusText.textContent = '已退出登录';
            } catch (err) {
                console.error('Logout failed:', err);
                statusText.style.color = '#d93025';
                statusText.textContent = '退出登录失败，请稍后重试';
            }
        });

        form.appendChild(emailInput);
        form.appendChild(passwordInput);
        form.appendChild(statusText);
        form.appendChild(loginButton);
        formContainer.appendChild(form);
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                statusText.style.color = '#d93025';
                statusText.textContent = '请填写邮箱和密码';
                return;
            }
            statusText.textContent = '';
            statusText.style.color = '#d93025';
            loginButton.disabled = true;
            loginButton.style.opacity = '0.7';
            loginButton.textContent = isRegisterMode ? '注册中...' : '登录中...';
            try {
                if (isRegisterMode) {
                    await registerMembership(email, password);
                    statusText.style.color = '#25D366';
                    statusText.textContent = '注册成功，正在登录...';
                }
                await loginMembership(email, password);
                await refreshMembershipStatus(true);
                statusText.style.color = '#25D366';
                statusText.textContent = isRegisterMode ? '注册并登录成功' : '登录成功';
                setTimeout(() => {
                    overlay.remove();
                }, 500);
            } catch (error) {
                console.error('Login failed:', error);
                statusText.style.color = '#d93025';
                statusText.textContent = error && error.message ? error.message : (isRegisterMode ? '注册失败，请稍后重试' : '登录失败，请稍后重试');
            } finally {
                loginButton.disabled = false;
                loginButton.style.opacity = '1';
                loginButton.textContent = isRegisterMode ? '注册并登录' : '登录';
            }
        });

        const infoSection = document.createElement('div');
        infoSection.style.cssText = `
            display: none !important;
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
            background: linear-gradient(135deg, rgba(37, 211, 102, 0.14), rgba(18, 140, 126, 0.12)) !important;
            border-radius: 16px !important;
            padding: 18px 20px !important;
            border: 1px solid rgba(18, 140, 126, 0.18) !important;
            box-sizing: border-box !important;
        `;

        const infoHeader = document.createElement('div');
        infoHeader.style.cssText = `
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
        `;

        const infoTitle = document.createElement('div');
        infoTitle.textContent = '会员权益已激活';
        infoTitle.style.cssText = `
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #0f3d37 !important;
        `;

        const statusBadge = document.createElement('span');
        statusBadge.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 4px 10px !important;
            border-radius: 999px !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #0c4020 !important;
            background: rgba(37, 211, 102, 0.25) !important;
        `;

        infoHeader.appendChild(infoTitle);
        infoHeader.appendChild(statusBadge);

        const infoDetails = document.createElement('div');
        infoDetails.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
            font-size: 13px !important;
            color: #0f3d37 !important;
            line-height: 1.55 !important;
        `;

        const planLine = document.createElement('div');
        const expiryLine = document.createElement('div');
        const lastSyncLine = document.createElement('div');

        infoDetails.appendChild(planLine);
        infoDetails.appendChild(expiryLine);
        infoDetails.appendChild(lastSyncLine);

        infoSection.appendChild(infoHeader);
        infoSection.appendChild(infoDetails);

        dialog.appendChild(closeBtn);
        dialog.appendChild(title);
        dialog.appendChild(subtitle);

        dialog.appendChild(infoSection);
        dialog.appendChild(formContainer);
        dialog.appendChild(footer);
        dialog.appendChild(logoutButton);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.remove();
            }
        });

        setTimeout(() => {
            if (!getIsLoggedIn()) {
                emailInput.focus();
            }
        }, 100);

        function formatMembershipDate(raw) {
            if (!raw) return '';
            const parsed = Date.parse(raw);
            if (Number.isNaN(parsed)) return raw;
            try {
                return new Date(parsed).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (_) {
                return raw;
            }
        }

        function updateInfoSection() {
            const hasActiveSubscription = !!membershipState.subscriptionValid;
            const hasActiveTrial = !!membershipState.trialValid;
            const planName = membershipState.planName || (hasActiveTrial ? '免费试用' : '高级会员');

            let expiryText = '权益已激活，无固定到期时间';
            if (hasActiveSubscription || hasActiveTrial) {
                const expiryRaw = hasActiveSubscription
                    ? membershipState.subscriptionEnd
                    : membershipState.trialEnd;
                if (expiryRaw) {
                    expiryText = hasActiveTrial
                        ? `试用有效期至 ${formatMembershipDate(expiryRaw)}`
                        : `有效期至 ${formatMembershipDate(expiryRaw)}`;
                }
            } else if (membershipState.subscriptionEnd) {
                expiryText = `已于 ${formatMembershipDate(membershipState.subscriptionEnd)} 到期`;
            } else if (membershipState.subscriptionStatus) {
                expiryText = membershipState.subscriptionStatus;
            } else {
                expiryText = '订阅状态已过期，请尽快续费';
            }

            let statusTextValue = '订阅已到期';
            let badgeBackground = 'rgba(217, 48, 37, 0.18)';
            let badgeColor = '#a52714';
            if (hasActiveSubscription) {
                statusTextValue = '订阅有效';
                badgeBackground = 'rgba(37, 211, 102, 0.25)';
                badgeColor = '#0c4020';
            } else if (hasActiveTrial) {
                statusTextValue = '试用中';
                badgeBackground = 'rgba(255, 173, 51, 0.25)';
                badgeColor = '#7a3c00';
            }

            statusBadge.textContent = statusTextValue;
            statusBadge.style.background = badgeBackground;
            statusBadge.style.color = badgeColor;

            if (hasActiveSubscription) {
                infoTitle.textContent = '您的订阅已激活';
            } else if (hasActiveTrial) {
                infoTitle.textContent = '您正在使用试用权益';
            } else {
                infoTitle.textContent = '订阅已到期';
            }

            planLine.textContent = `当前套餐：${planName}`;
            expiryLine.textContent = expiryText;
            const lastSync = membershipState.lastSyncedAt
                ? new Date(membershipState.lastSyncedAt).toLocaleString('zh-CN')
                : '暂无';
            lastSyncLine.textContent = `最近同步：${lastSync}`;
        }

        function updateFormMode() {
            const loggedIn = getIsLoggedIn();
            if (loggedIn) {
                const hasActiveAccess = !!membershipState.subscriptionValid || !!membershipState.trialValid;
                isRegisterMode = false;
                title.textContent = '会员信息';
                subtitle.textContent = hasActiveAccess
                    ? '已登录，可继续使用翻译功能'
                    : '登录成功，但订阅已到期，请联系客服续费';
                formContainer.style.display = 'none';
                footer.style.display = 'flex';
                footer.removeAttribute('aria-hidden');
                helperRow.style.alignItems = 'stretch';
                helperRow.style.justifyContent = 'flex-start';
                contactLink.style.display = 'block';
                infoSection.style.display = 'flex';
                switchModeLink.style.display = 'none';
                switchModeLink.style.pointerEvents = 'none';
                switchModeLink.setAttribute('aria-hidden', 'true');
                updateInfoSection();
            } else {
                infoSection.style.display = 'none';
                formContainer.style.display = 'flex';
                footer.style.display = 'flex';
                footer.removeAttribute('aria-hidden');
                helperRow.style.alignItems = 'stretch';
                helperRow.style.justifyContent = 'flex-start';
                contactLink.style.display = 'block';
                switchModeLink.style.display = 'inline-block';
                switchModeLink.style.pointerEvents = 'auto';
                switchModeLink.removeAttribute('aria-hidden');
                if (isRegisterMode) {
                    title.textContent = '注册会员账号';
                    subtitle.textContent = '注册后将自动开启7天试用，并可使用高级功能';
                    loginButton.textContent = '注册并登录';
                    switchModeLink.textContent = '已有账号？返回登录';
                } else {
                    title.textContent = '会员登录';
                    subtitle.textContent = '登录后可同步订阅信息并继续使用翻译功能';
                    loginButton.textContent = '登录';
                    switchModeLink.textContent = '没有账号？立即注册';
                }
            }
            statusText.textContent = '';
            statusText.style.color = '#d93025';
            logoutButton.style.display = membershipState.token ? 'block' : 'none';
        }

        updateFormMode();
    }

    function buildMemberInfoButton() {
        const wrapper = document.createElement('div');
        wrapper.className = 'member-info-button';
        wrapper.style.cssText = 'flex-grow:0;margin:0;padding:0;';
        wrapper.innerHTML = `
            <div class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 xdt5ytf x1cy8zhl x1277o0a">
              <div class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x1cy8zhl x100vrsf x1vqgdyp xhgddhk x1ekkm8c x1143rjc xum4auv xj21bgg x1277o0a x13i9f1t xr9ek0c xjpr12u">
                <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j">
                  <button aria-pressed="false" aria-label="会员中心" tabindex="-1" data-navbar-item="true" data-navbar-item-selected="false" class="xjb2p0i xk390pu x1heor9g x1ypdohk xjbqb8w x972fbf x10w94by x1qhh985 x14e42zd xtnn1bt x9v5kkp xmw7ebm xrdum7p xt8t1vi x1xc408v x129tdwq x15urzxu xh8yej3 x1y1aw1k xf159sx xwib8y2 xmzvs34" data-navbar-item-index="99">
                    <div class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 xh8yej3">
                      <div class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 x1n2onr6" style="flex-grow: 1;">
                        <div>
                          <span aria-hidden="true" data-icon="vip" class="">
                            <svg t="1759127678478" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="41120" width="24" height="24"><path d="M701.304 577.715c-6.502-2.394-13.006-2.567-19.51-0.512-6.502 2.054-11.292 7.359-14.374 15.914a1117.326 1117.326 0 0 1-4.878 16.177 608.006 608.006 0 0 0-4.621 15.655c-1.54 5.48-3.42 11.382-5.647 17.717-2.224 6.33-5.05 13.605-8.472 21.817-3.422 8.898-8.3 13.093-14.632 12.577-6.332-0.513-11.208-4.191-14.631-11.038-3.767-6.845-7.275-14.203-10.524-22.073a7523.773 7523.773 0 0 1-9.5-23.104c-3.082-7.53-5.82-14.378-8.214-20.537-2.395-6.162-4.449-11.124-6.163-14.893-2.736-5.475-7.27-8.553-13.601-9.237-6.332-0.685-12.497 0.255-18.484 2.822-5.99 2.566-10.952 6.591-14.887 12.066-3.937 5.476-4.538 11.466-1.8 17.968a2786.847 2786.847 0 0 0 8.214 23.104 1284.4 1284.4 0 0 0 9.756 26.185c3.424 8.897 6.67 17.626 9.754 26.184 3.082 8.556 5.817 15.915 8.214 22.075 5.135 13.005 12.921 22.762 23.36 29.264 10.44 6.505 21.39 9.925 32.857 10.27 11.465 0.34 22.419-2.228 32.859-7.703 10.44-5.475 18.055-13.691 22.845-24.642a1774.441 1774.441 0 0 0 11.55-27.98 2418.295 2418.295 0 0 0 11.3-28.496c3.59-9.24 6.93-18.141 10.008-26.696 3.078-8.558 5.645-15.915 7.698-22.077 2.057-6.841 1.113-13.089-2.822-18.74-3.933-5.65-9.15-9.67-15.655-12.067z" fill="#4d5ec0" p-id="41121"></path><path d="M512 4.376C231.647 4.376 4.376 231.646 4.376 512c0 280.353 227.271 507.624 507.626 507.624 280.352 0 507.624-227.27 507.624-507.624C1019.624 231.646 792.353 4.376 512 4.376zM445.117 736.87c-9.925 0-21.476-0.34-34.654-1.024-13.175-0.685-26.781-1.629-40.814-2.826a1650.854 1650.854 0 0 1-41.843-4.106c-13.863-1.539-26.44-3.166-37.735-4.879-11.297-1.709-20.88-3.42-28.75-5.135-7.874-1.707-12.836-3.422-14.888-5.133-3.765-2.738-6.588-11.208-8.472-25.41-1.88-14.207-1.112-32.434 2.31-54.678 1.366-8.558 4.194-15.577 8.47-21.051 4.28-5.479 9.499-10.181 15.661-14.117 6.16-3.94 13.006-7.102 20.537-9.499a737.214 737.214 0 0 1 23.104-6.933 396.97 396.97 0 0 0 22.842-7.189c7.361-2.566 14.12-5.73 20.281-9.495 7.186-4.451 12.75-8.815 16.685-13.093 3.936-4.278 6.763-8.469 8.473-12.578a33.053 33.053 0 0 0 2.566-12.836c0-4.45-0.17-9.41-0.514-14.887-0.684-7.871-3.42-14.116-8.213-18.738-4.793-4.62-10.095-9.33-15.915-14.118-2.739-2.396-5.218-5.734-7.445-10.014a127.675 127.675 0 0 1-5.903-13.09 886.304 886.304 0 0 1-5.133-15.918c-2.397-0.682-4.793-1.88-7.189-3.593-2.054-1.708-4.277-4.104-6.673-7.185-2.398-3.082-4.447-7.531-6.16-13.352-1.712-5.817-2.399-11.12-2.054-15.911 0.342-4.793 1.366-9.073 3.079-12.836 1.372-3.766 3.593-7.362 6.676-10.782 0-13.006 0.683-26.012 2.052-39.019 1.369-10.955 3.766-22.76 7.189-35.424 3.423-12.667 8.727-23.961 15.914-33.887 6.846-9.585 14.205-17.37 22.076-23.36 7.874-5.99 16.086-10.696 24.645-14.116 8.556-3.426 17.025-5.733 25.41-6.933 8.387-1.199 16.515-1.797 24.385-1.797 9.927 0 19.766 1.112 29.522 3.337 9.755 2.226 18.911 5.218 27.468 8.983 8.56 3.766 16.17 8.043 22.848 12.836 6.671 4.793 11.892 9.583 15.656 14.375 8.9 10.952 15.402 23.018 19.51 36.193 4.108 13.178 7.018 25.757 8.725 37.738a334.383 334.383 0 0 1 2.569 41.584c2.396 1.712 4.277 3.935 5.647 6.674 1.37 2.396 2.483 5.478 3.338 9.24 0.858 3.766 0.944 8.386 0.26 13.863-0.685 7.532-2.142 13.435-4.365 17.713-2.227 4.278-4.708 7.615-7.448 10.01-3.079 2.737-6.33 4.622-9.753 5.648a159.817 159.817 0 0 0-2.052 6.672l-2.568 7.192c-0.685 2.394-1.542 4.96-2.567 7.701-17.456 7.187-33.457 16.769-48.005 28.748-14.548 11.98-27.126 25.67-37.735 41.071-10.61 15.404-18.825 32.26-24.643 50.572-5.82 18.312-8.727 37.566-8.727 57.758 0 17.799 2.31 34.823 6.93 51.082 4.62 16.257 11.037 31.576 19.253 45.948h-13.863z m329.088-33.627c-8.555 19.68-20.105 36.874-34.653 51.593-14.542 14.72-31.659 26.274-51.34 34.656-19.68 8.386-40.644 12.577-62.893 12.577-22.588 0-43.724-4.193-63.405-12.577-19.677-8.384-36.794-19.936-51.339-34.656-14.545-14.719-26.098-31.915-34.654-51.593-8.558-19.679-12.837-40.643-12.837-62.892 0-22.25 4.279-43.21 12.837-62.893 8.556-19.68 20.109-36.878 34.654-51.595s31.661-26.354 51.34-34.913c19.68-8.556 40.816-12.836 63.404-12.836 22.25 0 43.214 4.28 62.893 12.836 19.68 8.559 36.798 20.195 51.34 34.913 14.548 14.717 26.102 31.915 34.653 51.595 8.558 19.682 12.837 40.644 12.837 62.893 0 22.249-4.276 43.212-12.837 62.892z" fill="#4d5ec0" p-id="41122"></path></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </span>
              </div>
            </div>
        `;
        const button = wrapper.querySelector('button');
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (typeof Android !== 'undefined' && typeof Android.openMemberInfo === 'function') {
                Android.openMemberInfo();
            } else {
                showMembershipLoginDialog();
            }
        });
        return wrapper;
    }

    function updateMemberButtonStatusText() {
        const button = document.querySelector('.member-info-button button');
        if (!button) return;
        let tooltip = '';
        if (isMembershipValidLocal()) {
            const parts = [];
            if (membershipState.planName) {
                parts.push(membershipState.planName);
            }
            if (membershipState.subscriptionEnd) {
                parts.push(`到期 ${membershipState.subscriptionEnd}`);
            } else if (membershipState.trialEnd && membershipState.trialValid) {
                parts.push(`试用至 ${membershipState.trialEnd}`);
            } else if (membershipState.subscriptionStatus) {
                parts.push(membershipState.subscriptionStatus);
            } else {
                parts.push('已激活');
            }
            tooltip = parts.join(' · ');
        } else {
            if (membershipState.subscriptionEnd) {
                let formatted = membershipState.subscriptionEnd;
                const parsed = Date.parse(membershipState.subscriptionEnd);
                if (!Number.isNaN(parsed)) {
                    try {
                        formatted = new Date(parsed).toLocaleDateString('zh-CN');
                    } catch (_) {}
                }
                tooltip = `订阅已于 ${formatted} 到期`;
            } else if (membershipState.subscriptionStatus) {
                tooltip = membershipState.subscriptionStatus;
            } else if (membershipState.token) {
                tooltip = '订阅已到期，请联系客服续费';
            } else {
                tooltip = '点击登录以恢复会员权益';
            }
        }
        button.title = tooltip;
        button.setAttribute('aria-label', tooltip || '会员中心');
    }

    function addMemberInfoButton() {
        try {
            if (document.querySelector('.member-info-button')) return;
            const newChatButton = document.querySelector('div[aria-label="新聊天"][role="button"], div[aria-label="New chat"][role="button"]');
            if (!newChatButton) return;
            const anchor = newChatButton.parentNode?.parentNode?.parentNode;
            if (!anchor || !anchor.parentNode) return;
            const memberButton = buildMemberInfoButton();
            anchor.parentNode.insertBefore(memberButton, anchor);
            updateMemberButtonStatusText();
        } catch (error) {
            console.error('添加会员按钮失败:', error);
        }
    }

    function monitorMemberInfoButton() {
        addMemberInfoButton();
        const attempts = [1200, 3000, 6000];
        attempts.forEach(delay => setTimeout(addMemberInfoButton, delay));
        setInterval(addMemberInfoButton, 12000);
        const observer = new MutationObserver(() => addMemberInfoButton());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 刷新翻译按钮（已不使用自定义按钮，保持清理残留）
    function refreshTranslateButtons() {
        document.querySelectorAll('.translate-btn').forEach(btn => btn.remove());
    }

    // 初次检查订阅状态
    checkSubscriptionStatus();

    // 区号到语言和时区的映射（简化，仅包含部分示例）
    const areaCodeToCountry = {
        '+44': { language: '英国-英语', timeZone: 'Europe/London', id: 'en', currency: 'GBP' }, // 英镑
        '+93': { language: '阿富汗-达里语、普什图语', timeZone: 'Asia/Kabul', id: 'ps', currency: 'AFN' }, // 阿富汗尼
        '+355': { language: '阿尔巴尼亚-阿尔巴尼亚语', timeZone: 'Europe/Tirane', id: 'sq', currency: 'ALL' }, // 列克
        '+213': { language: '阿尔及利亚-阿拉伯语', timeZone: 'Africa/Algiers', id: 'ar', currency: 'DZD' }, // 阿尔及利亚第纳尔
        '+376': { language: '安道尔-加泰罗尼亚语', timeZone: 'Europe/Andorra', id: 'ca', currency: 'EUR' }, // 欧元
        '+244': { language: '安哥拉-葡萄牙语', timeZone: 'Africa/Luanda', id: 'pt', currency: 'AOA' }, // 宽扎
        '+1264': { language: '安圭拉-英语', timeZone: 'America/Anguilla', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+1268': { language: '安提瓜和巴布达-英语', timeZone: 'America/Antigua', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+54': { language: '阿根廷-西班牙语', timeZone: 'America/Argentina/Buenos_Aires', id: 'es', currency: 'ARS' }, // 阿根廷比索
        '+374': { language: '亚美尼亚-亚美尼亚语', timeZone: 'Asia/Yerevan', id: 'hy', currency: 'AMD' }, // 德拉姆
        '+297': { language: '阿鲁巴-荷兰语、帕皮亚门托语', timeZone: 'America/Aruba', id: 'nl', currency: 'AWG' }, // 阿鲁巴弗罗林
        '+61': { language: '澳大利亚-英语', timeZone: 'Australia/Sydney', id: 'en', currency: 'AUD' }, // 澳元
        '+43': { language: '奥地利-德语', timeZone: 'Europe/Vienna', id: 'de', currency: 'EUR' }, // 欧元
        '+994': { language: '阿塞拜疆-阿塞拜疆语', timeZone: 'Asia/Baku', id: 'az', currency: 'AZN' }, // 马纳特
        '+1242': { language: '巴哈马-英语', timeZone: 'America/Nassau', id: 'en', currency: 'BSD' }, // 巴哈马元
        '+973': { language: '巴林-阿拉伯语', timeZone: 'Asia/Bahrain', id: 'ar', currency: 'BHD' }, // 巴林第纳尔
        '+880': { language: '孟加拉国-孟加拉语', timeZone: 'Asia/Dhaka', id: 'bn', currency: 'BDT' }, // 塔卡
        '+1246': { language: '巴巴多斯-英语', timeZone: 'America/Barbados', id: 'en', currency: 'BBD' }, // 巴巴多斯元
        '+375': { language: '白俄罗斯-白俄罗斯语、俄语', timeZone: 'Europe/Minsk', id: 'be', currency: 'BYN' }, // 白俄罗斯卢布
        '+32': { language: '比利时-荷兰语、法语、德语', timeZone: 'Europe/Brussels', id: 'nl', currency: 'EUR' }, // 欧元
        '+501': { language: '伯利兹-英语', timeZone: 'America/Belize', id: 'en', currency: 'BZD' }, // 伯利兹元
        '+229': { language: '贝宁-法语', timeZone: 'Africa/Porto-Novo', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+1441': { language: '百慕大-英语', timeZone: 'Atlantic/Bermuda', id: 'en', currency: 'BMD' }, // 百慕大元
        '+975': { language: '不丹-宗卡语', timeZone: 'Asia/Thimphu', id: 'dz', currency: 'BTN' }, // 努尔特鲁姆
        '+591': { language: '玻利维亚-西班牙语、克丘亚语、艾马拉语', timeZone: 'America/La_Paz', id: 'es', currency: 'BOB' }, // 玻利维亚诺
        '+387': { language: '波斯尼亚和黑塞哥维那-波斯尼亚语、克罗地亚语、塞尔维亚语', timeZone: 'Europe/Sarajevo', id: 'bs', currency: 'BAM' }, // 可兑换马克
        '+267': { language: '博茨瓦纳-英语', timeZone: 'Africa/Gaborone', id: 'en', currency: 'BWP' }, // 普拉
        '+55': { language: '巴西-葡萄牙语', timeZone: 'America/Sao_Paulo', id: 'pt', currency: 'BRL' }, // 雷亚尔
        '+673': { language: '文莱-马来语', timeZone: 'Asia/Brunei', id: 'ms', currency: 'BND' }, // 文莱元
        '+359': { language: '保加利亚-保加利亚语', timeZone: 'Europe/Sofia', id: 'bg', currency: 'BGN' }, // 列弗
        '+226': { language: '布基纳法索-法语', timeZone: 'Africa/Ouagadougou', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+257': { language: '布隆迪-基隆迪语、法语', timeZone: 'Africa/Bujumbura', id: 'rn', currency: 'BIF' }, // 布隆迪法郎
        '+855': { language: '柬埔寨-高棉语', timeZone: 'Asia/Phnom_Penh', id: 'km', currency: 'KHR' }, // 瑞尔
        '+237': { language: '喀麦隆-英语、法语', timeZone: 'Africa/Yaounde', id: 'en', currency: 'XAF' }, // 中非法郎
        '+238': { language: '佛得角-葡萄牙语', timeZone: 'Atlantic/Cape_Verde', id: 'pt', currency: 'CVE' }, // 佛得角埃斯库多
        '+1345': { language: '开曼群岛-英语', timeZone: 'America/Cayman', id: 'en', currency: 'KYD' }, // 开曼群岛元
        '+236': { language: '中非共和国-法语、桑戈语', timeZone: 'Africa/Bangui', id: 'fr', currency: 'XAF' }, // 中非法郎
        '+235': { language: '乍得-阿拉伯语、法语', timeZone: 'Africa/Ndjamena', id: 'ar', currency: 'XAF' }, // 中非法郎
        '+56': { language: '智利-西班牙语', timeZone: 'America/Santiago', id: 'es', currency: 'CLP' }, // 智利比索
        '+86': { language: '中国-汉语', timeZone: 'Asia/Shanghai', id: 'zh-CN', currency: 'CNY' }, // 人民币
        '+57': { language: '哥伦比亚-西班牙语', timeZone: 'America/Bogota', id: 'es', currency: 'COP' }, // 哥伦比亚比索
        '+269': { language: '科摩罗-阿拉伯语、法语', timeZone: 'Indian/Comoro', id: 'ar', currency: 'KMF' }, // 科摩罗法郎
        '+242': { language: '刚果(布)-法语', timeZone: 'Africa/Brazzaville', id: 'fr', currency: 'XAF' }, // 中非法郎
        '+243': { language: '刚果(金)-法语', timeZone: 'Africa/Kinshasa', id: 'fr', currency: 'CDF' }, // 刚果法郎
        '+682': { language: '库克群岛-英语、毛利语', timeZone: 'Pacific/Rarotonga', id: 'en', currency: 'NZD' }, // 新西兰元
        '+506': { language: '哥斯达黎加-西班牙语', timeZone: 'America/Costa_Rica', id: 'es', currency: 'CRC' }, // 科朗
        '+385': { language: '克罗地亚-克罗地亚语', timeZone: 'Europe/Zagreb', id: 'hr', currency: 'EUR' }, // 欧元
        '+383': { language: '科索沃-阿尔巴尼亚语、塞尔维亚语', timeZone: 'Europe/Belgrade', id: 'sq', currency: 'EUR' }, // 欧元
        '+53': { language: '古巴-西班牙语', timeZone: 'America/Havana', id: 'es', currency: 'CUP' }, // 古巴比索
        '+357': { language: '塞浦路斯-希腊语、土耳其语', timeZone: 'Asia/Nicosia', id: 'el', currency: 'EUR' }, // 欧元
        '+420': { language: '捷克共和国-捷克语', timeZone: 'Europe/Prague', id: 'cs', currency: 'CZK' }, // 捷克克朗
        '+45': { language: '丹麦-丹麦语', timeZone: 'Europe/Copenhagen', id: 'da', currency: 'DKK' }, // 丹麦克朗
        '+253': { language: '吉布提-阿拉伯语、法语', timeZone: 'Africa/Djibouti', id: 'ar', currency: 'DJF' }, // 吉布提法郎
        '+1767': { language: '多米尼克-英语', timeZone: 'America/Dominica', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+1809': { language: '多米尼加共和国-西班牙语', timeZone: 'America/Santo_Domingo', id: 'es', currency: 'DOP' }, // 多米尼加比索
        '+593': { language: '厄瓜多尔-西班牙语', timeZone: 'America/Guayaquil', id: 'es', currency: 'USD' }, // 美元
        '+20': { language: '埃及-阿拉伯语', timeZone: 'Africa/Cairo', id: 'ar', currency: 'EGP' }, // 埃及镑
        '+503': { language: '萨尔瓦多-西班牙语', timeZone: 'America/El_Salvador', id: 'es', currency: 'USD' }, // 美元
        '+240': { language: '赤道几内亚-西班牙语、法语、葡萄牙语', timeZone: 'Africa/Malabo', id: 'es', currency: 'XAF' }, // 中非法郎
        '+291': { language: '厄立特里亚-提格利尼亚语、阿拉伯语', timeZone: 'Africa/Asmara', id: 'ti', currency: 'ERN' }, // 纳克法
        '+372': { language: '爱沙尼亚-爱沙尼亚语', timeZone: 'Europe/Tallinn', id: 'et', currency: 'EUR' }, // 欧元
        '+251': { language: '埃塞俄比亚-阿姆哈拉语', timeZone: 'Africa/Addis_Ababa', id: 'am', currency: 'ETB' }, // 比尔
        '+500': { language: '福克兰群岛-英语', timeZone: 'Atlantic/Stanley', id: 'en', currency: 'FKP' }, // 福克兰群岛镑
        '+298': { language: '法罗群岛-法罗语', timeZone: 'Atlantic/Faroe', id: 'fo', currency: 'DKK' }, // 丹麦克朗
        '+679': { language: '斐济-英语、斐济语、印度语', timeZone: 'Pacific/Fiji', id: 'en', currency: 'FJD' }, // 斐济元
        '+358': { language: '芬兰-芬兰语、瑞典语', timeZone: 'Europe/Helsinki', id: 'fi', currency: 'EUR' }, // 欧元
        '+33': { language: '法国-法语', timeZone: 'Europe/Paris', id: 'fr', currency: 'EUR' }, // 欧元
        '+689': { language: '法属波利尼西亚-法语', timeZone: 'Pacific/Tahiti', id: 'fr', currency: 'XPF' }, // 太平洋法郎
        '+241': { language: '加蓬-法语', timeZone: 'Africa/Libreville', id: 'fr', currency: 'XAF' }, // 中非法郎
        '+220': { language: '冈比亚-英语', timeZone: 'Africa/Banjul', id: 'en', currency: 'GMD' }, // 达拉西
        '+995': { language: '格鲁吉亚-格鲁吉亚语', timeZone: 'Asia/Tbilisi', id: 'ka', currency: 'GEL' }, // 拉里
        '+49': { language: '德国-德语', timeZone: 'Europe/Berlin', id: 'de', currency: 'EUR' }, // 欧元
        '+233': { language: '加纳-英语', timeZone: 'Africa/Accra', id: 'en', currency: 'GHS' }, // 塞地
        '+350': { language: '直布罗陀-英语', timeZone: 'Europe/Gibraltar', id: 'en', currency: 'GIP' }, // 直布罗陀镑
        '+30': { language: '希腊-希腊语', timeZone: 'Europe/Athens', id: 'el', currency: 'EUR' }, // 欧元
        '+299': { language: '格陵兰-格陵兰语、丹麦语', timeZone: 'America/Nuuk', id: 'kl', currency: 'DKK' }, // 丹麦克朗
        '+1473': { language: '格林纳达-英语', timeZone: 'America/Grenada', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+590': { language: '瓜德罗普-法语', timeZone: 'America/Guadeloupe', id: 'fr', currency: 'EUR' }, // 欧元
        '+1671': { language: '关岛-英语、查莫罗语', timeZone: 'Pacific/Guam', id: 'en', currency: 'USD' }, // 美元
        '+502': { language: '危地马拉-西班牙语', timeZone: 'America/Guatemala', id: 'es', currency: 'GTQ' }, // 格查尔
        '+224': { language: '几内亚-法语', timeZone: 'Africa/Conakry', id: 'fr', currency: 'GNF' }, // 几内亚法郎
        '+245': { language: '几内亚比绍-葡萄牙语', timeZone: 'Africa/Bissau', id: 'pt', currency: 'XOF' }, // 西非法郎
        '+592': { language: '圭亚那-英语', timeZone: 'America/Georgetown', id: 'en', currency: 'GYD' }, // 圭亚那元
        '+509': { language: '海地-法语、海地克里奥尔语', timeZone: 'America/Port-au-Prince', id: 'fr', currency: 'HTG' }, // 古德
        '+504': { language: '洪都拉斯-西班牙语', timeZone: 'America/Tegucigalpa', id: 'es', currency: 'HNL' }, // 伦皮拉
        '+852': { language: '香港-繁体、英语', timeZone: 'Asia/Hong_Kong', id: 'zh-TW', currency: 'HKD' }, // 港元
        '+36': { language: '匈牙利-匈牙利语', timeZone: 'Europe/Budapest', id: 'hu', currency: 'HUF' }, // 福林
        '+354': { language: '冰岛-冰岛语', timeZone: 'Atlantic/Reykjavik', id: 'is', currency: 'ISK' }, // 冰岛克朗
        '+91': { language: '印度-印地语、英语', timeZone: 'Asia/Kolkata', id: 'en', currency: 'INR' }, // 卢比
        '+62': { language: '印度尼西亚-印度尼西亚语', timeZone: 'Asia/Jakarta', id: 'id', currency: 'IDR' }, // 卢比
        '+98': { language: '伊朗-波斯语', timeZone: 'Asia/Tehran', id: 'fa', currency: 'IRR' }, // 里亚尔
        '+964': { language: '伊拉克-阿拉伯语、库尔德语', timeZone: 'Asia/Baghdad', id: 'ar', currency: 'IQD' }, // 伊拉克第纳尔
        '+353': { language: '爱尔兰-英语、爱尔兰语', timeZone: 'Europe/Dublin', id: 'en', currency: 'EUR' }, // 欧元
        '+972': { language: '以色列-希伯来语、阿拉伯语', timeZone: 'Asia/Jerusalem', id: 'he', currency: 'ILS' }, // 新谢克尔
        '+39': { language: '意大利-意大利语', timeZone: 'Europe/Rome', id: 'it', currency: 'EUR' }, // 欧元
        '+225': { language: '科特迪瓦-法语', timeZone: 'Africa/Abidjan', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+1876': { language: '牙买加-英语', timeZone: 'America/Jamaica', id: 'en', currency: 'JMD' }, // 牙买加元
        '+81': { language: '日本-日语', timeZone: 'Asia/Tokyo', id: 'ja', currency: 'JPY' }, // 日元
        '+962': { language: '约旦-阿拉伯语', timeZone: 'Asia/Amman', id: 'ar', currency: 'JOD' }, // 约旦第纳尔
        '+7': { language: '哈萨克斯坦-哈萨克语、俄语', timeZone: 'Asia/Almaty', id: 'kk', currency: 'KZT' }, // 坚戈
        '+254': { language: '肯尼亚-英语、斯瓦希里语', timeZone: 'Africa/Nairobi', id: 'en', currency: 'KES' }, // 肯尼亚先令
        '+686': { language: '基里巴斯-英语、吉尔伯特语', timeZone: 'Pacific/Tarawa', id: 'en', currency: 'AUD' }, // 澳元
        '+965': { language: '科威特-阿拉伯语', timeZone: 'Asia/Kuwait', id: 'ar', currency: 'KWD' }, // 科威特第纳尔
        '+996': { language: '吉尔吉斯斯坦-吉尔吉斯语、俄语', timeZone: 'Asia/Bishkek', id: 'ky', currency: 'KGS' }, // 索姆
        '+856': { language: '老挝-老挝语', timeZone: 'Asia/Vientiane', id: 'lo', currency: 'LAK' }, // 基普
        '+371': { language: '拉脱维亚-拉脱维亚语', timeZone: 'Europe/Riga', id: 'lv', currency: 'EUR' }, // 欧元
        '+961': { language: '黎巴嫩-阿拉伯语、法语', timeZone: 'Asia/Beirut', id: 'ar', currency: 'LBP' }, // 黎巴嫩镑
        '+266': { language: '莱索托-英语、塞索托语', timeZone: 'Africa/Maseru', id: 'en', currency: 'LSL' }, // 洛蒂
        '+231': { language: '利比里亚-英语', timeZone: 'Africa/Monrovia', id: 'en', currency: 'LRD' }, // 利比里亚元
        '+218': { language: '利比亚-阿拉伯语', timeZone: 'Africa/Tripoli', id: 'ar', currency: 'LYD' }, // 利比亚第纳尔
        '+423': { language: '列支敦士登-德语', timeZone: 'Europe/Vaduz', id: 'de', currency: 'CHF' }, // 瑞士法郎
        '+370': { language: '立陶宛-立陶宛语', timeZone: 'Europe/Vilnius', id: 'lt', currency: 'EUR' }, // 欧元
        '+352': { language: '卢森堡-卢森堡语、法语、德语', timeZone: 'Europe/Luxembourg', id: 'lb', currency: 'EUR' }, // 欧元
        '+853': { language: '澳门-中文、葡萄牙语', timeZone: 'Asia/Macau', id: 'zh', currency: 'MOP' }, // 澳门元
        '+389': { language: '北马其顿-马其顿语', timeZone: 'Europe/Skopje', id: 'mk', currency: 'MKD' }, // 第纳尔
        '+261': { language: '马达加斯加-马尔加什语、法语', timeZone: 'Indian/Antananarivo', id: 'mg', currency: 'MGA' }, // 阿里亚里
        '+265': { language: '马拉维-英语、齐切瓦语', timeZone: 'Africa/Blantyre', id: 'en', currency: 'MWK' }, // 克瓦查
        '+60': { language: '马来西亚-马来语', timeZone: 'Asia/Kuala_Lumpur', id: 'ms', currency: 'MYR' }, // 林吉特
        '+960': { language: '马尔代夫-迪维希语', timeZone: 'Indian/Maldives', id: 'dv', currency: 'MVR' }, // 拉菲亚
        '+223': { language: '马里-法语', timeZone: 'Africa/Bamako', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+356': { language: '马耳他-马耳他语、英语', timeZone: 'Europe/Malta', id: 'mt', currency: 'EUR' }, // 欧元
        '+692': { language: '马绍尔群岛-马绍尔语、英语', timeZone: 'Pacific/Majuro', id: 'en', currency: 'USD' }, // 美元
        '+596': { language: '马提尼克-法语', timeZone: 'America/Martinique', id: 'fr', currency: 'EUR' }, // 欧元
        '+222': { language: '毛里塔尼亚-阿拉伯语', timeZone: 'Africa/Nouakchott', id: 'ar', currency: 'MRU' }, // 乌吉亚
        '+230': { language: '毛里求斯-英语', timeZone: 'Indian/Mauritius', id: 'en', currency: 'MUR' }, // 毛里求斯卢比
        '+262': { language: '马约特-法语', timeZone: 'Indian/Mayotte', id: 'fr', currency: 'EUR' }, // 欧元
        '+52': { language: '墨西哥-西班牙语', timeZone: 'America/Mexico_City', id: 'es', currency: 'MXN' }, // 墨西哥比索
        '+691': { language: '密克罗尼西亚联邦-英语', timeZone: 'Pacific/Pohnpei', id: 'en', currency: 'USD' }, // 美元
        '+373': { language: '摩尔多瓦-罗马尼亚语', timeZone: 'Europe/Chisinau', id: 'ro', currency: 'MDL' }, // 摩尔多瓦列伊
        '+377': { language: '摩纳哥-法语', timeZone: 'Europe/Monaco', id: 'fr', currency: 'EUR' }, // 欧元
        '+976': { language: '蒙古-蒙古语', timeZone: 'Asia/Ulaanbaatar', id: 'mn', currency: 'MNT' }, // 图格里克
        '+382': { language: '黑山-塞尔维亚语、波斯尼亚语、克罗地亚语、阿尔巴尼亚语', timeZone: 'Europe/Podgorica', id: 'sr', currency: 'EUR' }, // 欧元
        '+1664': { language: '蒙特塞拉特-英语', timeZone: 'America/Montserrat', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+212': { language: '摩洛哥-阿拉伯语', timeZone: 'Africa/Casablanca', id: 'ar', currency: 'MAD' }, // 迪拉姆
        '+258': { language: '莫桑比克-葡萄牙语', timeZone: 'Africa/Maputo', id: 'pt', currency: 'MZN' }, // 梅蒂卡尔
        '+95': { language: '缅甸-缅甸语', timeZone: 'Asia/Yangon', id: 'my', currency: 'MMK' }, // 缅元
        '+264': { language: '纳米比亚-英语', timeZone: 'Africa/Windhoek', id: 'en', currency: 'NAD' }, // 纳米比亚元
        '+674': { language: '瑙鲁-英语、瑙鲁语', timeZone: 'Pacific/Nauru', id: 'en', currency: 'AUD' }, // 澳元
        '+977': { language: '尼泊尔-尼泊尔语', timeZone: 'Asia/Kathmandu', id: 'ne', currency: 'NPR' }, // 尼泊尔卢比
        '+31': { language: '荷兰-荷兰语', timeZone: 'Europe/Amsterdam', id: 'nl', currency: 'EUR' }, // 欧元
        '+687': { language: '新喀里多尼亚-法语', timeZone: 'Pacific/Noumea', id: 'fr', currency: 'XPF' }, // 太平洋法郎
        '+64': { language: '新西兰-英语、毛利语', timeZone: 'Pacific/Auckland', id: 'en', currency: 'NZD' }, // 新西兰元
        '+505': { language: '尼加拉瓜-西班牙语', timeZone: 'America/Managua', id: 'es', currency: 'NIO' }, // 科多巴
        '+227': { language: '尼日尔-法语', timeZone: 'Africa/Niamey', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+234': { language: '尼日利亚-英语', timeZone: 'Africa/Lagos', id: 'en', currency: 'NGN' }, // 奈拉
        '+683': { language: '纽埃-英语、纽埃语', timeZone: 'Pacific/Niue', id: 'en', currency: 'NZD' }, // 新西兰元
        '+850': { language: '朝鲜-朝鲜语', timeZone: 'Asia/Pyongyang', id: 'ko', currency: 'KPW' }, // 朝鲜元
        '+47': { language: '挪威-挪威语', timeZone: 'Europe/Oslo', id: 'no', currency: 'NOK' }, // 挪威克朗
        '+968': { language: '阿曼-阿拉伯语', timeZone: 'Asia/Muscat', id: 'ar', currency: 'OMR' }, // 阿曼里亚尔
        '+92': { language: '巴基斯坦-乌尔都语、英语', timeZone: 'Asia/Karachi', id: 'en', currency: 'PKR' }, // 巴基斯坦卢比
        '+680': { language: '帕劳-英语、帕劳语', timeZone: 'Pacific/Palau', id: 'en', currency: 'USD' }, // 美元
        '+970': { language: '巴勒斯坦领土-阿拉伯语', timeZone: 'Asia/Gaza', id: 'ar', currency: 'ILS' }, // 新谢克尔
        '+507': { language: '巴拿马-西班牙语', timeZone: 'America/Panama', id: 'es', currency: 'PAB' }, // 巴尔博亚
        '+675': { language: '巴布亚新几内亚-英语、托克皮辛、莫图语', timeZone: 'Pacific/Port_Moresby', id: 'en', currency: 'PGK' }, // 基那
        '+595': { language: '巴拉圭-西班牙语、瓜拉尼语', timeZone: 'America/Asuncion', id: 'es', currency: 'PYG' }, // 瓜拉尼
        '+51': { language: '秘鲁-西班牙语', timeZone: 'America/Lima', id: 'es', currency: 'PEN' }, // 索尔
        '+63': { language: '菲律宾-英语、菲律宾语', timeZone: 'Asia/Manila', id: 'en', currency: 'PHP' }, // 菲律宾比索
        '+48': { language: '波兰-波兰语', timeZone: 'Europe/Warsaw', id: 'pl', currency: 'PLN' }, // 兹罗提
        '+351': { language: '葡萄牙-葡萄牙语', timeZone: 'Europe/Lisbon', id: 'pt', currency: 'EUR' }, // 欧元
        '+974': { language: '卡塔尔-阿拉伯语', timeZone: 'Asia/Qatar', id: 'ar', currency: 'QAR' }, // 卡塔尔里亚尔
        '+40': { language: '罗马尼亚-罗马尼亚语', timeZone: 'Europe/Bucharest', id: 'ro', currency: 'RON' }, // 列伊
        '+7': { language: '俄罗斯-俄语', timeZone: 'Europe/Moscow', id: 'ru', currency: 'RUB' }, // 卢布
        '+250': { language: '卢旺达-卢旺达语、英语、法语', timeZone: 'Africa/Kigali', id: 'rw', currency: 'RWF' }, // 卢旺达法郎
        '+290': { language: '圣赫勒拿-英语', timeZone: 'Atlantic/St_Helena', id: 'en', currency: 'SHP' }, // 圣赫勒拿镑
        '+1869': { language: '圣基茨和尼维斯-英语', timeZone: 'America/St_Kitts', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+1758': { language: '圣卢西亚-英语', timeZone: 'America/St_Lucia', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+508': { language: '圣皮埃尔和密克隆-法语', timeZone: 'America/Miquelon', id: 'fr', currency: 'EUR' }, // 欧元
        '+1784': { language: '圣文森特和格林纳丁斯-英语', timeZone: 'America/St_Vincent', id: 'en', currency: 'XCD' }, // 东加勒比元
        '+685': { language: '萨摩亚-萨摩亚语、英语', timeZone: 'Pacific/Apia', id: 'sm', currency: 'WST' }, // 塔拉
        '+378': { language: '圣马力诺-意大利语', timeZone: 'Europe/San_Marino', id: 'it', currency: 'EUR' }, // 欧元
        '+239': { language: '圣多美和普林西比-葡萄牙语', timeZone: 'Africa/Sao_Tome', id: 'pt', currency: 'STN' }, // 多布拉
        '+966': { language: '沙特阿拉伯-阿拉伯语', timeZone: 'Asia/Riyadh', id: 'ar', currency: 'SAR' }, // 沙特里亚尔
        '+221': { language: '塞内加尔-法语', timeZone: 'Africa/Dakar', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+381': { language: '塞尔维亚-塞尔维亚语', timeZone: 'Europe/Belgrade', id: 'sr', currency: 'RSD' }, // 塞尔维亚第纳尔
        '+248': { language: '塞舌尔-英语、法语', timeZone: 'Indian/Mahe', id: 'en', currency: 'SCR' }, // 塞舌尔卢比
        '+232': { language: '塞拉利昂-英语', timeZone: 'Africa/Freetown', id: 'en', currency: 'SLL' }, // 利昂
        '+65': { language: '新加坡-英语、马来语、汉语', timeZone: 'Asia/Singapore', id: 'en', currency: 'SGD' }, // 新加坡元
        '+421': { language: '斯洛伐克-斯洛伐克语', timeZone: 'Europe/Bratislava', id: 'sk', currency: 'EUR' }, // 欧元
        '+386': { language: '斯洛文尼亚-斯洛文尼亚语', timeZone: 'Europe/Ljubljana', id: 'sl', currency: 'EUR' }, // 欧元
        '+677': { language: '所罗门群岛-英语', timeZone: 'Pacific/Guadalcanal', id: 'en', currency: 'SBD' }, // 所罗门群岛元
        '+252': { language: '索马里-索马里语、阿拉伯语', timeZone: 'Africa/Mogadishu', id: 'so', currency: 'SOS' }, // 索马里先令
        '+27': { language: '南非-祖鲁语、科萨语、阿非利卡语、英语、南非荷兰语', timeZone: 'Africa/Johannesburg', id: 'en', currency: 'ZAR' }, // 兰特
        '+82': { language: '韩国-韩语', timeZone: 'Asia/Seoul', id: 'ko', currency: 'KRW' }, // 韩元
        '+211': { language: '南苏丹-英语', timeZone: 'Africa/Juba', id: 'en', currency: 'SSP' }, // 南苏丹镑
        '+34': { language: '西班牙-西班牙语', timeZone: 'Europe/Madrid', id: 'es', currency: 'EUR' }, // 欧元
        '+94': { language: '斯里兰卡-僧伽罗语、泰米尔语', timeZone: 'Asia/Colombo', id: 'si', currency: 'LKR' }, // 斯里兰卡卢比
        '+249': { language: '苏丹-阿拉伯语、英语', timeZone: 'Africa/Khartoum', id: 'ar', currency: 'SDG' }, // 苏丹镑
        '+597': { language: '苏里南-荷兰语', timeZone: 'America/Paramaribo', id: 'nl', currency: 'SRD' }, // 苏里南元
        '+268': { language: '斯威士兰-斯瓦特语、英语', timeZone: 'Africa/Mbabane', id: 'en', currency: 'SZL' }, // 里兰吉尼
        '+46': { language: '瑞典-瑞典语', timeZone: 'Europe/Stockholm', id: 'sv', currency: 'SEK' }, // 瑞典克朗
        '+41': { language: '瑞士-德语、法语、意大利语、罗曼什语', timeZone: 'Europe/Zurich', id: 'de', currency: 'CHF' }, // 瑞士法郎
        '+963': { language: '叙利亚-阿拉伯语', timeZone: 'Asia/Damascus', id: 'ar', currency: 'SYP' }, // 叙利亚镑
        '+886': { language: '台湾-中文', timeZone: 'Asia/Taipei', id: 'zh', currency: 'TWD' }, // 新台币
        '+992': { language: '塔吉克斯坦-塔吉克语', timeZone: 'Asia/Dushanbe', id: 'tg', currency: 'TJS' }, // 索莫尼
        '+255': { language: '坦桑尼亚-斯瓦希里语', timeZone: 'Africa/Dar_es_Salaam', id: 'sw', currency: 'TZS' }, // 坦桑尼亚先令
        '+66': { language: '泰国-泰语', timeZone: 'Asia/Bangkok', id: 'th', currency: 'THB' }, // 泰铢
        '+228': { language: '多哥-法语', timeZone: 'Africa/Lome', id: 'fr', currency: 'XOF' }, // 西非法郎
        '+676': { language: '汤加-汤加语、英语', timeZone: 'Pacific/Tongatapu', id: 'en', currency: 'TOP' }, // 潘加
        '+216': { language: '突尼斯-阿拉伯语', timeZone: 'Africa/Tunis', id: 'ar', currency: 'TND' }, // 突尼斯第纳尔
        '+90': { language: '土耳其-土耳其语', timeZone: 'Europe/Istanbul', id: 'tr', currency: 'TRY' }, // 土耳其里拉
        '+993': { language: '土库曼斯坦-土库曼语', timeZone: 'Asia/Ashgabat', id: 'tk', currency: 'TMT' }, // 马纳特
        '+688': { language: '图瓦卢-图瓦卢语、英语', timeZone: 'Pacific/Funafuti', id: 'en', currency: 'AUD' }, // 澳元
        '+256': { language: '乌干达-英语、斯瓦希里语', timeZone: 'Africa/Kampala', id: 'en', currency: 'UGX' }, // 乌干达先令
        '+380': { language: '乌克兰-乌克兰语', timeZone: 'Europe/Kyiv', id: 'uk', currency: 'UAH' }, // 格里夫纳
        '+971': { language: '阿拉伯联合酋长国-阿拉伯语', timeZone: 'Asia/Dubai', id: 'ar', currency: 'AED' }, // 阿联酋迪拉姆
        '+598': { language: '乌拉圭-西班牙语', timeZone: 'America/Montevideo', id: 'es', currency: 'UYU' }, // 乌拉圭比索
        '+998': { language: '乌兹别克斯坦-乌兹别克语', timeZone: 'Asia/Tashkent', id: 'uz', currency: 'UZS' }, // 苏姆
        '+678': { language: '瓦努阿图-比斯拉马语、英语、法语', timeZone: 'Pacific/Efate', id: 'bi', currency: 'VUV' }, // 瓦图
        '+379': { language: '梵蒂冈城-意大利语', timeZone: 'Europe/Vatican', id: 'it', currency: 'EUR' }, // 欧元
        '+58': { language: '委内瑞拉-西班牙语', timeZone: 'America/Caracas', id: 'es', currency: 'VES' }, // 玻利瓦尔
        '+84': { language: '越南-越南语', timeZone: 'Asia/Ho_Chi_Minh', id: 'vi', currency: 'VND' }, // 越南盾
        '+681': { language: '瓦利斯和富图纳-法语', timeZone: 'Pacific/Wallis', id: 'fr', currency: 'XPF' }, // 太平洋法郎
        '+967': { language: '也门-阿拉伯语', timeZone: 'Asia/Aden', id: 'ar', currency: 'YER' }, // 也门里亚尔
        '+260': { language: '赞比亚-英语', timeZone: 'Africa/Lusaka', id: 'en', currency: 'ZMW' }, // 克瓦查
        '+263': { language: '津巴布韦-英语、绍纳语、辛德贝勒语', timeZone: 'Africa/Harare', id: 'en', currency: 'ZWL' } // 津巴布韦元
    };

    // 显示网络缓慢提示
    function showNetworkSlowNotification() {
        // 移除已存在的提示
        const existing = document.querySelector('.wa-network-slow-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'wa-network-slow-notification';
        notification.textContent = '网络缓慢，请检查您的网络或切换翻译接口重试';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff9800;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10002;
            font-size: 14px;
            font-weight: 500;
            animation: wa-slide-down 0.3s ease-out;
        `;
        
        // 添加动画样式
        if (!document.querySelector('#wa-network-slow-style')) {
            const style = document.createElement('style');
            style.id = 'wa-network-slow-style';
            style.textContent = `
                @keyframes wa-slide-down {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    function translateWithGoogle(sl, dl, txt, cb) {
        console.log(`Google 翻译请求: 源语言=${sl}, 目标语言=${dl}, 文本=${txt}`);
        let responded = false;
        let slowNotificationShown = false;
        
        // 3秒超时检测
        const slowTimeout = setTimeout(() => {
            if (!responded && !slowNotificationShown) {
                slowNotificationShown = true;
                showNetworkSlowNotification();
            }
        }, 3000);
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${dl}&dt=t&q=${encodeURI(txt)}`,
            onload: (response) => {
                clearTimeout(slowTimeout);
                responded = true;
                try {
                    const _r_text = response.responseText.replace(/\n/g, '');
                    const _r = JSON.parse(_r_text);
                    let translationString = '';
                    for (let i = 0; i < _r[0].length; i++) {
                        translationString += _r[0][i][0];
                    }

                    const sourceLang = _r[2];
                    console.log(`Google 翻译结果: ${translationString}`);
                    cb(translationString, sourceLang);
                } catch (e) {
                    console.error('Google 翻译响应解析失败:', e, response.responseText);
                    cb(null);
                }
            },
            onerror: (error) => {
                clearTimeout(slowTimeout);
                responded = true;
                console.error('Google 翻译请求失败:', error);
                cb(null);
            },
            ontimeout: () => {
                clearTimeout(slowTimeout);
                responded = true;
                console.error('Google 翻译请求超时');
                cb(null);
            }
        });
    }

    function normalizeVolcLanguageCode(code) {
        if (!code) return 'auto';
        if (code === 'zh-CN' || code === 'zh') return 'zh';
        if (code === 'zh-TW') return 'zh-Hant';
        return code;
    }

    function translateWithVolc(sl, dl, txt, cb) {
        const volcanoUrl = 'https://translate.volcengine.com/crx/translate/v1/';
        const source = normalizeVolcLanguageCode(sl);
        const target = normalizeVolcLanguageCode(dl);

        console.log(`火山翻译请求: 源语言=${source}, 目标语言=${target}, 文本=${txt}`);

        const payload = { target_language: target, text: txt };
        // API 不需要 source_language 字段，支持自动检测

        let responded = false;
        let slowNotificationShown = false;
        
        // 3秒超时检测
        const slowTimeout = setTimeout(() => {
            if (!responded && !slowNotificationShown) {
                slowNotificationShown = true;
                showNetworkSlowNotification();
            }
        }, 3000);

        GM_xmlhttpRequest({
            method: 'POST',
            url: volcanoUrl,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(payload),
            timeout: 15000,
            onload: (response) => {
                clearTimeout(slowTimeout);
                responded = true;
                try {
                    if (response.status < 200 || response.status >= 300) {
                        console.error('火山翻译HTTP错误:', response.status, response.responseText);
                        cb(null);
                        return;
                    }
                    const data = JSON.parse(response.responseText);
                    const translation = data && (data.translation || data.data || data.target_text);
                    if (typeof translation === 'string' && translation.length > 0) {
                        console.log(`火山翻译结果: ${translation}`);
                        cb(translation, null);
                    } else {
                        console.error('火山翻译响应无translation字段:', data);
                        cb(null);
                    }
                } catch (e) {
                    console.error('火山翻译解析失败:', e, response.responseText);
                    cb(null);
                }
            },
            onerror: (error) => {
                clearTimeout(slowTimeout);
                responded = true;
                console.error('火山翻译请求失败:', error);
                cb(null);
            },
            ontimeout: () => {
                clearTimeout(slowTimeout);
                responded = true;
                console.error('火山翻译请求超时');
                cb(null);
            }
        });
    }

    async function translateWithBing(sl, dl, txt, cb) {
        if (dl === 'zh-CN' || dl === 'zh') dl = 'zh-Hans';
        if (sl === 'zh-CN' || sl === 'zh') sl = 'zh-Hans';
        if (dl === 'zh-TW') dl = 'zh-Hant';
        if (sl === 'zh-TW') sl = 'zh-Hant';

        console.log(`Bing 翻译请求: 源语言=${sl}, 目标语言=${dl}, 文本=${txt}`);

        let responded = false;
        let slowNotificationShown = false;
        
        // 3秒超时检测
        const slowTimeout = setTimeout(() => {
            if (!responded && !slowNotificationShown) {
                slowNotificationShown = true;
                showNetworkSlowNotification();
            }
        }, 3000);

        try {
            const authUrl = "https://edge.microsoft.com/translate/auth";
            const authHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.23',
                'Accept-Language': 'zh-TW,zh;q=0.9,ja;q=0.8,zh-CN;q=0.7,en-US;q=0.6,en;q=0.5',
            };

            const accessToken = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: authUrl,
                    headers: authHeaders,
                    onload: res => res.status === 200 ? resolve(res.responseText) : reject(`Bing Auth Error: ${res.status}`),
                    onerror: err => reject(`Bing auth request error: ${err}`)
                });
            });

            let translateUrl = `https://api-edge.cognitive.microsofttranslator.com/translate?to=${dl}&api-version=3.0&includeSentenceLength=true`;
            if (sl !== 'auto') {
                translateUrl = `https://api-edge.cognitive.microsofttranslator.com/translate?from=${sl}&to=${dl}&api-version=3.0&includeSentenceLength=true`;
            }

            const translateHeaders = {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.23',
            };
            const body = JSON.stringify([{ 'Text': txt }]);

            const translatedText = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: translateUrl,
                    headers: translateHeaders,
                    data: body,
                    onload: function(translateResponse) {
                        try {
                            const resultJson = JSON.parse(translateResponse.responseText);
                            if (resultJson && resultJson.length > 0 && resultJson[0].translations && resultJson[0].translations.length > 0) {
                                resolve(resultJson[0].translations[0].text);
                            } else {
                                reject("Bing translation failed: No result.");
                            }
                        } catch (e) {
                            reject(`Bing translation parse error: ${e}`);
                        }
                    },
                    onerror: err => reject(`Bing translation request error: ${err}`)
                });
            });
            clearTimeout(slowTimeout);
            responded = true;
            console.log(`Bing 翻译结果: ${translatedText}`);
            cb(translatedText, null);
        } catch (error) {
            clearTimeout(slowTimeout);
            responded = true;
            console.error(error);
            cb(null);
        }
    }

    // 全局翻译函数
    function translate(sl, dl, txt, cb) {
        if (!ensureMembership()) {
            console.log('翻译被阻止，会员未验证');
            cb(null);
            return;
        }

        const engine = getCustomerTranslationEngine();
        console.log(`使用 ${engine} 翻译引擎进行翻译`);

		if (engine === 'bing') {
            translateWithBing(sl, dl, txt, cb);
		} else if (engine === 'volc') {
            translateWithVolc(sl, dl, txt, cb);
        } else {
            translateWithGoogle(sl, dl, txt, cb);
        }
    }

    // 显示国家语言和当地时间
    const targetSelector = '.xggjnk3';
    const pageObserver = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            document.querySelectorAll(targetSelector).forEach((targetElement) => {
                if (targetElement && !targetElement.classList.contains('language-added')) {
                    createInfo(targetElement);
                }
            });
        });
    });
    pageObserver.observe(document.body, { childList: true, subtree: true });

    function createInfo(targetElement) {
        targetElement.classList.add('language-added');
        const phoneNumber = targetElement.textContent.trim();
        currentPhoneNumber = phoneNumber.replace(/\s+/g, '');
        const areaCode = phoneNumber.split(' ')[0];

        let nextThreeDigits;
        if (phoneNumber.includes('(')) {
            nextThreeDigits = phoneNumber.match(/\((\d+)\)/)?.[1];
        } else {
            nextThreeDigits = phoneNumber.split(' ')[1]?.slice(0, 3);
        }

        if (!areaCode) return;

        if (areaCode === '+1') {
            if (['204', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '600', '604', '613', '639', '647', '705', '709', '742', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'].includes(nextThreeDigits)) {
                countryInfo = { language: '加拿大(Canada)-英语、法语(English/French)', timeZone: 'America/Toronto', id: 'en', currency: 'CAD' };
            } else if (['787', '939'].includes(nextThreeDigits)) {
                countryInfo = { language: '波多黎各(Puerto Rico)-英语(English)', timeZone: 'America/Puerto_Rico', id: 'en', currency: 'USD' };
            } else if (['671'].includes(nextThreeDigits)) {
                countryInfo = { language: '关岛(Guam)-英语(English)', timeZone: 'America/Guam', id: 'en', currency: 'USD' };
            } else if (['340'].includes(nextThreeDigits)) {
                countryInfo = { language: '美属维尔京群岛(US Virgin Islands)-英语(English)', timeZone: 'America/St_Thomas', id: 'en', currency: 'USD' };
            } else if (['684'].includes(nextThreeDigits)) {
                countryInfo = { language: '美属萨摩亚(American Samoa)-英语(English)', timeZone: 'Pacific/Pago_Pago', id: 'en', currency: 'USD' };
            } else if (['670'].includes(nextThreeDigits)) {
                countryInfo = { language: '北马里亚纳群岛(Northern Mariana Islands)-英语(English)', timeZone: 'Pacific/Saipan', id: 'en', currency: 'USD' };
            } else if (['868'].includes(nextThreeDigits)) {
                countryInfo = { language: '特立尼达和多巴哥(Trinidad and Tobago)-英语(English)', timeZone: 'America/Port_of_Spain', id: 'en', currency: 'TTD' };
            } else {
                countryInfo = { language: '美国(United States)-英语(English)', timeZone: 'America/New_York', id: 'en', currency: 'USD' };
            }
        } else {
            countryInfo = areaCodeToCountry[areaCode] || { language: '未知语言', timeZone: 'UTC', id: 'unknown', currency: '未知' };
        }

        const infoElement = document.createElement('div');
        infoElement.style.marginTop = '4px';
        infoElement.style.fontSize = '14px';
        targetElement.parentNode.insertBefore(infoElement, targetElement.nextSibling);

        function updateInfo() {
            const currentTime = getCurrentTimeInTimeZone(countryInfo.timeZone);
            infoElement.textContent = `${countryInfo.language}-${countryInfo.currency}-时间${currentTime}`;
        }
        updateInfo();
        setInterval(updateInfo, 1000);
    }

    function getCurrentTimeInTimeZone(timeZone) {
        const options = { timeZone, hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return new Date().toLocaleTimeString('en-US', options);
    }

    // 使用原生输入框方式：移除自定义输入区与常用短语；添加“客户语言设置”按钮到与APP一致的位置（第4个header的第三个子div的第一个子div）
    const LANGUAGE_OPTIONS = [
            { value: 'auto', text: '自动检测语言' },
            { value: 'en', text: '英语 (English)' },
        { value: 'zh-CN', text: '中文（简体）' },
        { value: 'zh-TW', text: '中文（繁体）' },
            { value: 'es', text: '西班牙语 (Spanish)' },
            { value: 'hi', text: '印地语 (Hindi)' },
            { value: 'ar', text: '阿拉伯语 (Arabic)' },
            { value: 'pt', text: '葡萄牙语 (Portuguese)' },
            { value: 'bn', text: '孟加拉语 (Bengali)' },
            { value: 'ru', text: '俄语 (Russian)' },
            { value: 'ja', text: '日语 (Japanese)' },
            { value: 'de', text: '德语 (German)' },
            { value: 'fr', text: '法语 (French)' },
            { value: 'id', text: '印尼语 (Indonesian)' },
            { value: 'ms', text: '马来语 (Malay)' },
            { value: 'ur', text: '乌尔都语 (Urdu)' },
            { value: 'vi', text: '越南语 (Vietnamese)' },
            { value: 'ko', text: '韩语 (Korean)' },
            { value: 'tr', text: '土耳其语 (Turkish)' },
            { value: 'it', text: '意大利语 (Italian)' },
            { value: 'fa', text: '波斯语 (Persian)' },
            { value: 'th', text: '泰语 (Thai)' },
            { value: 'pl', text: '波兰语 (Polish)' },
            { value: 'uk', text: '乌克兰语 (Ukrainian)' },
            { value: 'nl', text: '荷兰语 (Dutch)' },
            { value: 'ro', text: '罗马尼亚语 (Romanian)' },
            { value: 'sv', text: '瑞典语 (Swedish)' },
            { value: 'cs', text: '捷克语 (Czech)' },
            { value: 'el', text: '希腊语 (Greek)' },
            { value: 'he', text: '希伯来语 (Hebrew)' },
            { value: 'hu', text: '匈牙利语 (Hungarian)' },
            { value: 'fi', text: '芬兰语 (Finnish)' },
            { value: 'no', text: '挪威语 (Norwegian)' },
            { value: 'da', text: '丹麦语 (Danish)' },
            { value: 'sk', text: '斯洛伐克语 (Slovak)' },
            { value: 'sl', text: '斯洛文尼亚语 (Slovenian)' },
            { value: 'hr', text: '克罗地亚语 (Croatian)' },
            { value: 'bg', text: '保加利亚语 (Bulgarian)' },
            { value: 'lt', text: '立陶宛语 (Lithuanian)' },
            { value: 'sr', text: '塞尔维亚语 (Serbian)' },
            { value: 'et', text: '爱沙尼亚语 (Estonian)' },
            { value: 'ta', text: '泰米尔语 (Tamil)' },
            { value: 'te', text: '泰卢固语 (Telugu)' },
            { value: 'ml', text: '马拉雅拉姆语 (Malayalam)' },
            { value: 'kn', text: '卡纳达语 (Kannada)' },
            { value: 'mr', text: '马拉地语 (Marathi)' },
            { value: 'gu', text: '古吉拉特语 (Gujarati)' },
            { value: 'pa', text: '旁遮普语 (Punjabi)' },
            { value: 'am', text: '阿姆哈拉语 (Amharic)' },
            { value: 'my', text: '缅甸语 (Burmese)' },
            { value: 'km', text: '高棉语 (Khmer)' },
            { value: 'lo', text: '老挝语 (Lao)' },
            { value: 'si', text: '僧伽罗语 (Sinhala)' },
            { value: 'ne', text: '尼泊尔语 (Nepali)' },
            { value: 'mn', text: '蒙古语 (Mongolian)' },
            { value: 'hy', text: '亚美尼亚语 (Armenian)' },
            { value: 'ka', text: '格鲁吉亚语 (Georgian)' },
            { value: 'az', text: '阿塞拜疆语 (Azerbaijani)' },
            { value: 'kk', text: '哈萨克语 (Kazakh)' },
            { value: 'uz', text: '乌兹别克语 (Uzbek)' },
            { value: 'tg', text: '塔吉克语 (Tajik)' },
            { value: 'ps', text: '普什图语 (Pashto)' }
        ];

    function getCustomerSettings() {
        try { return JSON.parse(localStorage.getItem('customerLanguageSettings') || '{}'); } catch { return {}; }
    }
    function setCustomerSettings(all) {
        localStorage.setItem('customerLanguageSettings', JSON.stringify(all || {}));
    }
    function getCurrentChatSavedLang() {
        if (!currentPhoneNumber) return null;
        const all = getCustomerSettings();
        const setting = all[currentPhoneNumber];
        return (setting && setting.targetLang) ? setting.targetLang : null;
    }
    function getCustomerTranslationEngine() {
        // 优先客户单独设置；否则使用全局设置；默认google
        if (currentPhoneNumber) {
            const all = getCustomerSettings();
            const s = all[currentPhoneNumber];
            if (s && s.engine) return s.engine;
        }
        return localStorage.getItem('translationEngine') || 'google';
    }
    function showCustomerLanguagePopup() {
        const existing = document.querySelector('.customer-lang-popup');
        if (existing) existing.remove();
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const bg = isDark ? '#2d2d2d' : '#fff';
        const fg = isDark ? '#fff' : '#333';
        const popup = document.createElement('div');
        popup.className = 'customer-lang-popup';
        popup.style.cssText = `
            position: fixed; top:50%; left:50%; transform: translate(-50%,-50%);
            background:${bg}; color:${fg}; padding:20px; border-radius:8px;
            box-shadow:0 4px 20px rgba(0,0,0,0.15); z-index:10001; width:300px; max-width:90vw;
        `;
        const all = getCustomerSettings();
        const saved = all[currentPhoneNumber] || {};
        const header = document.createElement('h3');
        header.textContent = `客户语言设置${currentPhoneNumber ? ' (' + currentPhoneNumber + ')' : ''}`;
        header.style.margin = '0 0 20px 0';
        header.style.textAlign = 'center';
        header.style.color = fg;
        const langWrap = document.createElement('div');
        langWrap.style.marginBottom = '15px';
        const langLabel = document.createElement('label');
        langLabel.textContent = '目标语言:';
        langLabel.style.display = 'block';
        langLabel.style.marginBottom = '5px';
        langLabel.style.fontWeight = 'bold';
        langLabel.style.color = fg;
        const langSelect = document.createElement('select');
        langSelect.id = 'customerTargetLangSelect';
        langSelect.style.width = '100%';
        langSelect.style.padding = '8px';
        langSelect.style.border = `1px solid ${isDark ? '#555' : '#ccc'}`;
        langSelect.style.borderRadius = '4px';
        langSelect.style.backgroundColor = isDark ? '#3d3d3d' : '#fff';
        langSelect.style.color = fg;
        LANGUAGE_OPTIONS.forEach(opt => {
            const o = document.createElement('option'); o.value = opt.value; o.textContent = opt.text; langSelect.appendChild(o);
        });
        langSelect.value = saved.targetLang || 'auto';
        const engineWrap = document.createElement('div');
        engineWrap.style.marginBottom = '20px';
        const engineLabel = document.createElement('label');
        engineLabel.textContent = '翻译引擎:';
        engineLabel.style.display = 'block';
        engineLabel.style.marginBottom = '5px';
        engineLabel.style.fontWeight = 'bold';
        engineLabel.style.color = fg;
        const engineSelect = document.createElement('select');
        engineSelect.id = 'customerTranslationEngineSelect';
        engineSelect.style.width = '100%';
        engineSelect.style.padding = '8px';
        engineSelect.style.border = `1px solid ${isDark ? '#555' : '#ccc'}`;
        engineSelect.style.borderRadius = '4px';
        engineSelect.style.backgroundColor = isDark ? '#3d3d3d' : '#fff';
        engineSelect.style.color = fg;
        [
            { value: 'google', text: '谷歌翻译' },
            { value: 'bing', text: 'Bing翻译' },
            { value: 'volc', text: '火山翻译' }
        ].forEach(opt => {
            const o = document.createElement('option'); o.value = opt.value; o.textContent = opt.text; engineSelect.appendChild(o);
        });
        let savedEngine = saved.engine || (localStorage.getItem('translationEngine') || 'google');
        // 如果之前选择的是 ghtml，自动切换到 google
        if (savedEngine === 'ghtml') {
            savedEngine = 'google';
        }
        engineSelect.value = savedEngine;
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '8px';
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveCustomerLang';
        saveBtn.textContent = '保存';
        saveBtn.style.flex = '1';
        saveBtn.style.padding = '8px 12px';
        saveBtn.style.cursor = 'pointer';
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.flex = '1';
        cancelBtn.style.padding = '8px 12px';
        cancelBtn.style.cursor = 'pointer';
        saveBtn.addEventListener('click', () => {
            const targetLang = langSelect.value;
            const engine = engineSelect.value;
            const allNow = getCustomerSettings();
            if (currentPhoneNumber) {
                allNow[currentPhoneNumber] = { targetLang, engine, timestamp: Date.now() };
                setCustomerSettings(allNow);
                            } else {
                localStorage.setItem('customerTargetLang', targetLang);
                localStorage.setItem('customerTranslationEngine', engine);
            }
            popup.remove();
        });
        cancelBtn.addEventListener('click', () => popup.remove());
        langWrap.appendChild(langLabel); langWrap.appendChild(langSelect);
        engineWrap.appendChild(engineLabel); engineWrap.appendChild(engineSelect);
        btnRow.appendChild(saveBtn); btnRow.appendChild(cancelBtn);
        popup.appendChild(header); popup.appendChild(langWrap); popup.appendChild(engineWrap); popup.appendChild(btnRow);
        document.body.appendChild(popup);
    }
    function addCustomerLanguageButton() {
        try {
            if (document.querySelector('.customer-lang-button.customer-lang-settings')) return true;
            const headers = document.querySelectorAll('header');
            if (headers.length < 4) return false;
            const header = headers[3];
            const headerChildren = Array.from(header.children).filter(ch => ch.tagName === 'DIV');
            if (headerChildren.length < 3) return false;
            const thirdDiv = headerChildren[2];
            const thirdDivChildren = Array.from(thirdDiv.children).filter(ch => ch.tagName === 'DIV');
            if (thirdDivChildren.length < 1) return false;
            const firstChildDiv = thirdDivChildren[0];
            const button = document.createElement('button');
            button.className = 'customer-lang-button customer-lang-settings';
            button.setAttribute('aria-label', '客户语言设置');
            button.setAttribute('title', '客户语言设置');
            button.style.cssText = `
                background:none;border:none;padding:8px;margin:0 4px;cursor:pointer;border-radius:50%;
                display:inline-flex;align-items:center;justify-content:center;transition:background-color .2s;
                vertical-align:middle;width:40px;height:40px;flex-shrink:0;
            `;
            button.innerHTML = `
                <svg t="1762833406692" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                  <path d="M677.379 646.415c-13.623 2.215-25.594 11.016-31.983 23.246-16.051 30.722 7.067 65.506 39.454 65.506 25.138 0 44.687-20.944 44.687-44.68 0-26.046-23.535-48.731-52.158-44.072z" fill="#707070"></path>
                  <path d="M858.553 101.413H165.447c-35.295 0-63.907 28.612-63.907 63.907v693.36c0 35.295 28.612 63.907 63.907 63.907h693.106c35.295 0 63.907-28.612 63.907-63.907V165.32c0-35.295-28.612-63.907-63.907-63.907zM568.926 695.828l-29.348 18.867 6.123 10.33H231.884c-0.103-1.462-0.206-2.607-0.206-3.752 0-8.231-0.107-16.462 0-24.693 0-1.876 0.414-3.855 1.041-5.521 3.542-9.272 9.272-17.187 16.149-24.273 8.544-8.754 18.545-15.731 29.172-21.775 18.124-10.21 37.403-17.293 57.299-22.92 23.024-6.565 46.362-11.148 70.113-13.858 9.899-1.144 18.024-10.21 18.338-20.627 0.207-4.69-0.938-9.272-2.5-13.648-2.086-5.731-5.107-11.041-8.441-16.145-1.145-1.775-3.021-3.027-3.125-5.417 0-0.417-0.731-0.834-1.251-1.251-21.248-17.19-36.148-39.176-47.296-63.758-1.876-4.272-3.541-8.547-5.417-12.92-0.313-1.045-0.731-2.082-1.251-3.544-7.918 4.9-13.752 4.586-20.628-1.148-2.19-1.87-4.272-3.956-5.835-6.246-10.209-15.003-13.748-31.568-10-49.382 0.731-3.651 2.497-7.293 4.482-10.417 3.328-5.21 8.225-7.816 14.686-6.565 0.311 0.104 0.728 0 1.042 0 0.104 0 0.207-0.104 0.625-0.104v-2.71c-0.728-12.5-1.042-25.003-0.104-37.506 1.355-18.645 4.69-36.879 11.772-54.279 14.482-35.63 40.32-58.965 76.885-70.53 14.275-4.583 28.965-6.773 43.968-7.293 19.793-0.624 39.379 0.731 58.547 5.835 20.11 5.314 38.13 14.379 52.82 29.272 13.442 13.544 22.089 29.799 27.814 47.719 4.693 14.793 7.293 29.897 7.923 45.32 0.521 11.458 0.207 22.917 0.308 34.273v1.982c0.941 0 1.776 0.104 2.503 0 5.211-0.627 9.269 1.352 12.604 5.311 2.713 3.23 4.485 7.086 5.314 11.254 3.855 18.334 0.42 35.314-10.414 50.631-2.192 3.021-5.21 5.624-8.338 7.711-4.065 2.917-8.748 3.541-13.645 1.458-0.418-0.21-0.938-0.314-1.672-0.52a135.578 135.578 0 0 0-1.662 4.686c-7.503 21.151-17.714 40.947-31.776 58.551-5.834 7.293-12.296 13.961-19.381 20.107-2.287 1.979-4.683 3.752-6.039 6.668-1.876 3.959-4.793 7.396-6.879 11.252-3.018 5.314-4.997 11.045-5.831 17.189-1.355 10.207 3.959 19.69 13.441 23.751 1.873 0.834 4.166 0.938 6.246 1.148a587.05 587.05 0 0 1 17.666 2.55l-31.932 53.883 30.863 18.51c1.433 0.86 1.75 1.051 2.34 1.961 1.741 3.902 0.443 8.18-3.296 10.583z m208.086 15.602c4.188 6.979 9.774 12.565 15.358 13.962l-22.337 37.701c-20.947-11.17-47.478-5.587-58.648 15.361-4.191 6.982-5.583 13.962-5.583 20.944h-43.29c0-22.34-18.146-41.888-41.888-41.888-6.98 0-15.358 1.396-20.944 5.587l-22.343-37.704c19.548-12.566 26.531-37.698 15.361-58.645-4.188-6.982-8.379-11.173-15.361-15.36l22.343-37.698c20.944 11.17 47.475 5.583 58.648-15.361 4.185-5.587 5.583-13.964 5.583-20.947h43.284c0 23.739 18.153 43.288 41.891 43.288 6.983 0 15.361-1.396 20.947-5.587l22.337 37.704c-19.549 12.564-26.528 37.696-15.358 58.643z" fill="#707070"></path>
                </svg>
            `;
            button.addEventListener('mouseenter', () => { button.style.backgroundColor = 'rgba(0,0,0,0.1)'; });
            button.addEventListener('mouseleave', () => { button.style.backgroundColor = 'transparent'; });
            button.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); showCustomerLanguagePopup(); });
            firstChildDiv.appendChild(button);
            return true;
        } catch (e) { console.error('添加客户语言按钮失败:', e); return false; }
    }
    function monitorAndAddCustomerLangBtn() {
        addCustomerLanguageButton();
        const ob = new MutationObserver(() => { addCustomerLanguageButton(); });
        ob.observe(document.body, { childList: true, subtree: true });
    }

    // 拦截原生发送按钮：点击后先将输入框文本翻译为目标语言，再发送
    let waTranslatingAndSending = false;

    function getTargetLangForCurrentChat() {
        // 优先使用弹窗中的选择器（仅当弹窗存在时）
        let targetLang = '';
        try {
            const popup = document.querySelector('.customer-lang-popup');
            if (popup) {
                const inPopup = popup.querySelector('#customerTargetLangSelect');
                if (inPopup && inPopup.value) {
                    targetLang = inPopup.value;
                    console.log('使用弹窗中的语言设置:', targetLang);
                }
            }
        } catch (e) {
            console.warn('检查弹窗语言设置失败:', e);
        }
        
        // 其次使用保存的语言设置
        if (!targetLang || targetLang === 'auto' || targetLang === 'unknown') {
            targetLang = getCurrentChatSavedLang() || 'auto';
        }
        
        // 如果还没有确定目标语言，使用国家信息中的语言
        if (!targetLang || targetLang === 'auto' || targetLang === 'unknown') {
            targetLang = (countryInfo && countryInfo.id) ? countryInfo.id : 'en';
            console.log('使用国家信息中的语言设置:', targetLang);
        }
        
        if (!targetLang || targetLang === 'unknown') {
            targetLang = 'en';
            console.log('使用默认语言设置:', targetLang);
        }
        
        console.log('最终确定的目标语言:', targetLang);
        return targetLang;
    }

    function getNativeComposerElement() {
        // WhatsApp 桌面网页版输入框（contenteditable）
        const composer = document.querySelector('footer div[contenteditable="true"][data-lexical-editor="true"]');
        return composer || document.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
    }

    function readComposerText() {
        const composer = getNativeComposerElement();
        if (!composer) return '';
        return composer.innerText || composer.textContent || '';
    }

    function replaceComposerText(text) {
        const composer = getNativeComposerElement();
        if (!composer) return false;
        // 聚焦并通过 execCommand 注入文本（与现有 sendMessage 保持一致方式）
        const p = document.querySelector('footer p.selectable-text');
        (p ? p.parentNode : composer).focus();
        setTimeout(() => {
            document.execCommand('selectAll');
            setTimeout(() => {
                document.execCommand('cut');
                setTimeout(() => {
                    document.execCommand('insertText', false, text);
                    // 触发输入事件，确保WhatsApp启用发送按钮
                    try {
                        const inputEvt = new InputEvent('input', { bubbles: true, cancelable: true });
                        composer.dispatchEvent(inputEvt);
                        const keyupEvt = new KeyboardEvent('keyup', { key: 'Unidentified', bubbles: true });
                        composer.dispatchEvent(keyupEvt);
                    } catch (e) {}
                }, 50);
            }, 50);
        }, 0);
        return true;
    }

    function getSendButtonContainer() {
        // 兼容多种可能的发送按钮结构/图标
        for (const sel of SEND_BUTTON_SELECTORS) {
            const iconEl = document.querySelector(sel);
            if (iconEl) {
                const container = iconEl.closest('div[role="button"]') || iconEl.closest('button') || iconEl;
                if (container) return container;
            }
        }
        return null;
    }

    function triggerNativeSendFallback() {
        const composer = getNativeComposerElement();
        if (!composer) return false;
        try {
            // 合成 Enter 回车发送（WhatsApp 支持按Enter发送）
            const keydown = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true });
            const keyup = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true });
            composer.dispatchEvent(keydown);
            composer.dispatchEvent(keyup);
            return true;
        } catch (e) {
            return false;
        }
    }

    const SEND_BUTTON_SELECTORS = [
        '[data-icon="wds-ic-send-filled"]',
        'div[role="button"][aria-label="发送"]',
        'div[role="button"][aria-label="Send"]'
    ];

    function hookNativeSendButtons() {
        const candidates = new Set();
        SEND_BUTTON_SELECTORS.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const container = el.closest('div[role="button"]') || el.closest('button') || el;
                if (container) candidates.add(container);
            });
        });

        candidates.forEach(container => {
            if (!container || (container.classList && container.classList.contains('wa-translate-send-hooked'))) return;
            if (container.classList) container.classList.add('wa-translate-send-hooked');

            const handler = (evt) => {
                if (!ensureMembership()) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    return;
                }

                if (waTranslatingAndSending) return;

                const original = (readComposerText() || '').trim();
                if (!original) return;

                const now = Date.now();
                if (!window.__waEventLockTs) window.__waEventLockTs = 0;
                if (now - window.__waEventLockTs < 400 || window.__waSendInProgress) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    return;
                }
                window.__waEventLockTs = now;
                window.__waSendInProgress = true;

                evt.stopPropagation();
                evt.preventDefault();

                const finalize = () => {
                    window.__waSendInProgress = false;
                };

                const sourceLang = 'zh-CN';
                const targetLang = getTargetLangForCurrentChat();

                const doSend = (textToSend) => {
                    if (!textToSend) {
                        finalize();
                        return;
                    }
                    replaceComposerText(textToSend);
                        waTranslatingAndSending = true;
                        setTimeout(() => {
                        const btn = getSendButtonContainer();
                        if (btn) {
                            btn.click();
                        } else {
                            triggerNativeSendFallback();
                        }
                    setTimeout(() => {
                            waTranslatingAndSending = false;
                            finalize();
                        }, 180);
                    }, 400);
                };

                if (sourceLang === targetLang) {
                    doSend(original);
                } else {
                    translate(sourceLang, targetLang, original, (translated) => {
                        if (translated && translated.trim()) {
                            doSend(translated);
                        } else {
                            doSend(original);
                        }
                    });
                }
            };

            ['pointerdown', 'mousedown', 'click'].forEach(ev => {
                container.addEventListener(ev, handler, true);
            });
        });
    }

    // 拦截 Enter 键：按下回车时触发翻译并发送
    function hookEnterKey() {
        const composer = getNativeComposerElement();
        if (!composer || composer.classList.contains('wa-enter-hooked')) return;
        composer.classList.add('wa-enter-hooked');
        
        composer.addEventListener('keydown', (e) => {
            if (waTranslatingAndSending) return;
            if (!ensureMembership()) return;
            
            // Ctrl+Enter：不翻译，直接发送原文
            if (e.key === 'Enter' && e.ctrlKey) {
                const text = (readComposerText() || '').trim();
                if (!text) return;
                e.stopPropagation();
                e.preventDefault();
                const btn = getSendButtonContainer();
                if (btn) {
                    btn.click();
                } else {
                    triggerNativeSendFallback();
                }
                return;
            }
            
            // Enter：翻译后发送（Shift+Enter 用于换行，不拦截）
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                const text = (readComposerText() || '').trim();
                if (!text) return;
                
                const now = Date.now();
                if (!window.__waEventLockTs) window.__waEventLockTs = 0;
                if (now - window.__waEventLockTs < 400 || window.__waSendInProgress) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                window.__waEventLockTs = now;
                window.__waSendInProgress = true;
                
                e.stopPropagation();
                e.preventDefault();
                
                const finalize = () => {
                    window.__waSendInProgress = false;
                };
                
                const sourceLang = 'zh-CN';
                const targetLang = getTargetLangForCurrentChat();
                
                const doSend = (textToSend) => {
                    if (!textToSend) {
                        finalize();
                        return;
                    }
                    replaceComposerText(textToSend);
                    waTranslatingAndSending = true;
                    setTimeout(() => {
                        const btn = getSendButtonContainer();
                        if (btn) {
                            btn.click();
                        } else {
                            triggerNativeSendFallback();
                        }
                        setTimeout(() => {
                            waTranslatingAndSending = false;
                            finalize();
                        }, 180);
                    }, 400);
                };
                
                if (sourceLang === targetLang) {
                    doSend(text);
                } else {
                    translate(sourceLang, targetLang, text, (translated) => {
                        if (translated && translated.trim()) {
                            doSend(translated);
                        } else {
                            doSend(text);
                        }
                    });
                }
            }
        }, true);
    }

    // DOM 变化时保持钩子
    const sendBtnObserver = new MutationObserver(() => {
        hookNativeSendButtons();
        hookEnterKey();
        monitorAndAddCustomerLangBtn();
        addMemberInfoButton();
    });
    sendBtnObserver.observe(document.body, { childList: true, subtree: true });
    // 初始尝试
    hookNativeSendButtons();
    hookEnterKey();
    monitorAndAddCustomerLangBtn();
    monitorMemberInfoButton();
    updateMemberButtonStatusText();
    // 页面加载时立即初始化会员状态，避免首次翻译时的延迟
    if (membershipState.email && membershipState.token) {
        // 立即在后台异步刷新，不阻塞页面加载
        refreshMembershipStatus(true).catch(err => {
            console.warn('初始化会员状态失败:', err);
        });
    }
    setInterval(() => refreshMembershipStatus(false), 300000);
    // 定期确保已挂钩（处理输入框被重新创建的情况）
    setInterval(() => {
        hookNativeSendButtons();
        hookEnterKey();
    }, 800);

    // IndexedDB缓存实现
    const DB_NAME = 'wa_translate_db';
    const DB_STORE = 'msg_cache';
    const DB_VERSION = 1;
    let dbInstance = null;

    function openDB() {
        return new Promise((resolve, reject) => {
            if (dbInstance) return resolve(dbInstance);
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = (e) => reject(e);
            request.onsuccess = (e) => {
                dbInstance = e.target.result;
                resolve(dbInstance);
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(DB_STORE)) {
                    db.createObjectStore(DB_STORE);
                }
            };
        });
    }

    function getMsgCacheKey(text) {
        return 'wa_translate_cache_' + btoa(unescape(encodeURIComponent(text)));
    }

    async function getCache(key) {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction([DB_STORE], 'readonly');
            const store = tx.objectStore(DB_STORE);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(undefined);
        });
    }

    async function setCache(key, value) {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction([DB_STORE], 'readwrite');
            const store = tx.objectStore(DB_STORE);
            const req = store.put(value, key);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
        });
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function translateVisibleMessages() {
        if (document.querySelector('.membership-login-overlay')) return;
        if (!ensureMembership()) return;
        document.querySelectorAll('div._amk6._amlo').forEach(async (msg) => {
            const textElement = msg.querySelector('span._ao3e.selectable-text.copyable-text');
            if (!textElement) return;
            if (msg.querySelector('.translated-text')) return;
            if (msg.getAttribute('data-translated') === '1') return;
            if (!isElementInViewport(msg)) return;
            const originalText = textElement.innerText;
            if (!originalText) return;
            msg.setAttribute('data-translated', '1');

            // 检查IndexedDB缓存
            const cacheKey = getMsgCacheKey(originalText);
            const cached = await getCache(cacheKey);
            if (cached) {
                const wrapper = document.createElement('div');
                wrapper.className = 'translated-text';
                wrapper.style.marginTop = '6px';
                wrapper.style.fontSize = '14px';
                const color = getTranslatedTextColor();
                wrapper.innerHTML =
                    '<div class="selectable-text copyable-text" style="user-select: text; border-top:1px dashed #bbb;margin:4px 0 0 0;padding:4px 0 0 0;white-space:pre-line;color:' +
                    color +
                    ';">' +
                    cached +
                    '</div>';
                if (textElement.parentNode) {
                    textElement.parentNode.appendChild(wrapper);
                }
                return;
            }

            translate('auto', 'zh-CN', originalText, async (translatedText) => {
                if (translatedText) {
                    await setCache(cacheKey, translatedText);
                    const wrapper = document.createElement('div');
                    wrapper.className = 'translated-text';
                    wrapper.style.marginTop = '6px';
                    wrapper.style.fontSize = '14px';
                    const color = getTranslatedTextColor();
                    wrapper.innerHTML =
                        '<div class="selectable-text copyable-text" style="user-select: text; border-top:1px dashed #bbb;margin:4px 0 0 0;padding:4px 0 0 0;white-space:pre-line;color:' +
                        color +
                        ';">' +
                        translatedText +
                        '</div>';
                    if (textElement.parentNode) {
                        textElement.parentNode.appendChild(wrapper);
                    }
                }
            });
        });
    }

    // 定期只翻译可见区域的消息
    setInterval(() => {
        translateVisibleMessages();
    }, 500);
})();