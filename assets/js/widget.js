/**
 * WATransChat AI 客服 - 访客端 Chat Widget 脚本
 * 在店铺页面引入: <script src="https://你的域名/static/widget.js"></script>
 * 或本地: <script src="/static/widget.js"></script>
 */
(function () {
  const BASE = window.CHAT_WIDGET_API || (window.location.origin + '/api');
  const API_ORIGIN = (function () {
    try {
      const u = new URL(BASE, window.location.origin);
      return (u.origin || '').replace(/\/+$/, '');
    } catch (e) {
      const s = String(BASE || '');
      return s.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
    }
  })();
  const WS_BASE = window.CHAT_WIDGET_WS || (window.location.origin.replace(/^http/, 'ws') + '/ws');
  // 客服头像 / 提示音：默认使用内置资源，可被后台“客服设置”覆盖
  let SUPPORT_AVATAR_URL = 'https://cdn.shopify.com/s/files/1/0073/3813/1519/files/avatar.jpg';
  let MSG_SOUND_URL = 'https://cdn.shopify.com/s/files/1/0073/3813/1519/files/mes.wav';
  // 是否要求访客填写姓名/邮箱后才能聊天（后台“访客设置”开关）
  let REQUIRE_GUEST_INFO = false;

  async function loadWidgetSettings() {
    try {
      const r = await fetch(BASE + '/settings?client=widget');
      const j = await r.json();
      if (j && j.ok && j.settings) {
        if (j.settings.support_avatar_url) {
          SUPPORT_AVATAR_URL = j.settings.support_avatar_url;
        }
        if (j.settings.msg_sound_url) {
          MSG_SOUND_URL = j.settings.msg_sound_url;
        }
        // 访客侧永远允许直接聊天：不强制要求填写姓名/邮箱
        // （仍然会把 name/email 作为可选信息同步到后端，用于客服侧识别）
        REQUIRE_GUEST_INFO = false;
      }
    } catch (e) {
      // 忽略错误，使用默认头像
    }
  }

  // 仅使用中文：移除多语言与路径语言检测
  const ZH = {
    headerTitle: '客服',
    profileHint: '首次咨询请填写姓名与邮箱，方便客服联系您。',
    namePlaceholder: '姓名',
    emailPlaceholder: '邮箱',
    inputPlaceholder: '输入消息...',
    sendLabel: '发送',
    profileSubmitLabel: '保存并继续',
    firstMessage: '亲，有什么可以帮您？',
    readReceipt: '已读',
    agentTyping: '客服正在输入…'
  };

  function t(key) {
    return (ZH && ZH[key]) ? ZH[key] : '';
  }

  function getWidgetCustomer() {
    try {
      return window.CHAT_WIDGET_CUSTOMER || null;
    } catch (e) {
      return null;
    }
  }

  // AIGC START
  function applyVisitorReadReceipts(ids, convId) {
    const msgsEl = document.getElementById('chat-msgs');
    if (!msgsEl || !conversationId || Number(convId) !== Number(conversationId)) return;
    const readLabel = t('readReceipt');
    if (!readLabel) return;
    (ids || []).forEach(function (mid) {
      const b = msgsEl.querySelector('.msg.visitor .bubble[data-mid="' + mid + '"]');
      if (!b) return;
      const meta = b.querySelector('.meta');
      if (!meta || meta.textContent.indexOf(readLabel) !== -1) return;
      meta.textContent = meta.textContent ? (meta.textContent + ' · ' + readLabel) : readLabel;
    });
  }

  let visitorMarkReadTimer = null;
  function scheduleVisitorMarkAgentRead() {
    if (!conversationId || !visitorId) return;
    if (visitorMarkReadTimer) clearTimeout(visitorMarkReadTimer);
    visitorMarkReadTimer = setTimeout(function () {
      visitorMarkReadTimer = null;
      fetch(BASE + '/conversation/visitor-mark-read?client=widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, visitor_id: visitorId }),
      }).catch(function () {});
    }, 450);
  }

  function setVisitorBubbleMid(mid) {
    const msgsEl = document.getElementById('chat-msgs');
    if (!msgsEl || !mid) return;
    const list = msgsEl.querySelectorAll('.msg.visitor');
    const row = list[list.length - 1];
    if (!row) return;
    const b = row.querySelector('.bubble');
    if (b && !b.getAttribute('data-mid')) b.setAttribute('data-mid', String(mid));
  }
  let widgetTypingStopTimer = null;
  function sendVisitorTyping(active) {
    try {
      if (!ws || ws.readyState !== 1 || !conversationId) return;
      ws.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversationId,
        visitor_id: visitorId,
        is_typing: !!active,
      }));
    } catch (e) {}
  }
  // AIGC END

  let visitorId = localStorage.getItem('chat_visitor_id') || 'v_' + Math.random().toString(36).slice(2, 12);
  let conversationId = parseInt(localStorage.getItem('chat_conversation_id'), 10) || null;
  let historyConversationId = parseInt(localStorage.getItem('chat_history_conversation_id'), 10) || null;
  let ws = null;
  let wsRetryTimer = null;
  let wsPingTimer = null;
  // 用于避免 visitor_id 变化导致 WS key 不一致，引起后台在线状态抖动
  let wsAddMsgRef = null;
  let wsRegisteredClientId = null;
  let lastMsgId = 0;
  const displayedMsgIds = new Set(); // 已展示的消息 ID，避免 doSend 回调和 poll 重复添加
  // 已改为 WebSocket 推送，不再使用 HTTP 轮询
  let pollTimer = null;
  let ipGeo = null;
  let profile = null;
  let pendingText = null;
  let pendingTs = null;
  const IMAGE_MESSAGE_PREFIX = '__CHAT_IMAGE__:';

  function saveVisitor() {
    localStorage.setItem('chat_visitor_id', visitorId);
  }

  function profileKey() {
    return 'chat_profile_' + visitorId;
  }

  function profileSyncedKey() {
    return 'chat_profile_synced_' + visitorId;
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(profileKey());
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function saveProfile(p) {
    profile = p;
    try { localStorage.setItem(profileKey(), JSON.stringify(p)); } catch (e) {}
    try { localStorage.setItem(profileSyncedKey(), '0'); } catch (e) {}
  }

  function markProfileSynced() {
    try { localStorage.setItem(profileSyncedKey(), '1'); } catch (e) {}
  }

  function isProfileSynced() {
    try { return localStorage.getItem(profileSyncedKey()) === '1'; } catch (e) { return false; }
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  async function register() {
    // 打开面板时会先 register()：这里必须先加载本地 profile，才能把 email 带给服务端做“找回访客/历史”
    profile = profile || loadProfile();
    // 已移除对第三方 ipapi.co 的地理信息请求
    const customer = getWidgetCustomer();
    const r = await fetch(BASE + '/visitor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        name: (profile && profile.name) || (customer && customer.name) || null,
        email: (profile && profile.email) || (customer && customer.email) || null,
        telephone: (customer && customer.telephone) || null,
        geo: null,
        country: null,
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.slice(0, 80)
      })
    });
    const data = await r.json();
    // 服务端可能会按邮箱把访客“认回去”，以服务端返回的 visitor_id 为准
    if (data && data.visitor_id && data.visitor_id !== visitorId) {
      const oldVisitorId = visitorId;
      visitorId = data.visitor_id;
      saveVisitor();
      // 尝试把已填写的资料迁移到新 visitor_id 的 key（避免清缓存/跨设备匹配后丢资料）
      try {
        if (profile && profile.name && profile.email) {
          localStorage.setItem('chat_profile_' + visitorId, JSON.stringify(profile));
        } else {
          const oldProfileRaw = localStorage.getItem('chat_profile_' + oldVisitorId);
          if (oldProfileRaw) localStorage.setItem('chat_profile_' + visitorId, oldProfileRaw);
        }
      } catch (e) {}
    } else {
      saveVisitor();
    }

    // visitor_id 变化后，若 WS 已用旧 id 注册，会导致后台在线状态来回跳
    try {
      if (ws && ws.readyState === 1 && wsAddMsgRef) {
        if (wsRegisteredClientId && wsRegisteredClientId !== visitorId) {
          try { ws.close(); } catch (e) {}
          ws = null;
          connectWs(wsAddMsgRef);
        }
      }
    } catch (e) {}

    if (data.conversation_id) {
      conversationId = data.conversation_id;
      try { localStorage.setItem('chat_conversation_id', String(conversationId)); } catch (e) {}
    }
    if (data.last_conversation_id) {
      historyConversationId = data.last_conversation_id;
      try { localStorage.setItem('chat_history_conversation_id', String(historyConversationId)); } catch (e) {}
    }
    // 若本地已有 profile，则认为已尝试同步（无论服务端是否保存成功都避免死循环）
    if (profile && profile.name && profile.email) markProfileSynced();
    return data;
  }

  function reportBehavior() {
    try {
      fetch(BASE + '/behavior/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          current_page_url: location.href,
          current_page_title: document.title
        })
      }).catch(function () {});
    } catch (e) {}
  }

  async function sendMessage(text, _retryOnce) {
    // Cursor Write It
    // 发送访客消息：先确保 profile/会话信息同步；若后端提示会话不存在/已关闭，则自动重新 register 并重试一次。Cursor Write It
    // （否则会出现“网页已显示但刷新/客服都看不到”的错觉）Cursor Write It
    _retryOnce = !!_retryOnce;
    // 确保在发送前把姓名/邮箱同步到后端 Cursor Write It
    profile = profile || loadProfile();
    if (profile && profile.name && profile.email && !isProfileSynced()) {
      await register();
    } else if (!conversationId) {
      await register();
    }

    let data = null;
    try {
      const r = await fetch(BASE + '/message/visitor-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          visitor_id: visitorId,
          message: text
        })
      });
      data = await r.json();
    } catch (e) {
      // 网络/解析失败：保持原有返回 null 行为，让 UI 不会卡死 Cursor Write It
      return null;
    }

    if (data && data.ok && data.ai_message !== undefined) return data;
    if (data && data.ok) return { visitor_message_id: data.visitor_message_id, ai_message: null };

    const err = (data && data.error ? String(data.error).toLowerCase() : '');
    // 会话不存在/已关闭时，自动重新 register 获取新会话并重试一次
    if (!_retryOnce && (err.includes('conversation not found') || err.includes('conversation closed') || err.includes('not found or closed'))) {
      try {
        conversationId = null;
        await register();
        // 重试一次避免死循环 Cursor Write It
        return await sendMessage(text, true);
      } catch (e) {}
    }
    return null;
  }

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(BASE + '/message/upload-image', { method: 'POST', body: fd });
    const data = await r.json().catch(function () { return null; });
    if (!data || !data.ok || !data.url) throw new Error((data && data.error) || 'upload failed');
    return data.url;
  }

  async function fetchHistory() {
    const cid = historyConversationId || conversationId;
    if (!cid) return [];
    const r = await fetch(BASE + `/conversation/messages?conversation_id=${cid}&limit=200&client=widget`, { cache: 'no-store' });
    const msgs = await r.json();
    if (Array.isArray(msgs) && msgs.length) {
      displayedMsgIds.clear();
      lastMsgId = msgs[msgs.length - 1].id;
      msgs.forEach(function (m) { displayedMsgIds.add(m.id); });
    }
    return Array.isArray(msgs) ? msgs : [];
  }

  let _soundEl = null;
  function playNewMessageSound() {
    try {
      if (!_soundEl) {
        _soundEl = new Audio();
        _soundEl.volume = 0.8;
        _soundEl.preload = 'auto';
      }
      if (_soundEl.src !== MSG_SOUND_URL) _soundEl.src = MSG_SOUND_URL;
      try { _soundEl.currentTime = 0; } catch (e) {}
      _soundEl.play().catch(function () {});
    } catch (e) {}
  }

  function connectWs(addMsg) {
    try {
      wsAddMsgRef = addMsg || wsAddMsgRef;
      if (ws) {
        try { ws.close(); } catch (e) {}
        ws = null;
      }
      if (wsPingTimer) { try { clearInterval(wsPingTimer); } catch (e) {} wsPingTimer = null; }
      ws = new WebSocket(WS_BASE + '/chat');
      ws.onopen = function () {
        try {
          wsRegisteredClientId = null;
          ws.send(JSON.stringify({ type: 'register', visitor_id: visitorId || null, session_id: visitorId || null }));
        } catch (e) {}
        // 心跳：每 30 秒发送一次 heartbeat，更新服务端 last_visit
        try {
          if (wsPingTimer) clearInterval(wsPingTimer);
          wsPingTimer = setInterval(function () {
            try {
              if (ws && ws.readyState === 1) {
                ws.send(JSON.stringify({
                  type: 'heartbeat',
                  visitor_id: visitorId || null,
                }));
              }
            } catch (e) {}
          }, 10000);
        } catch (e) {}
      };
      ws.onmessage = function (ev) {
        try {
          const msg = JSON.parse(ev.data || '{}');
          if (!msg || !msg.type) return;
          if (msg.type === 'registered') {
            wsRegisteredClientId = msg.client_id || null;
            return;
          }
          if (msg.type === 'agent_message') {
            // 收到客服/AI 推送：直接渲染（无需 HTTP 轮询）
            if (msg.conversation_id && conversationId && Number(msg.conversation_id) !== Number(conversationId)) return;
            const panel = document.getElementById('chat-widget-panel');
            const hadNewFromAgent = msg.sender && msg.sender !== 'visitor';
            if (hadNewFromAgent && panel && !panel.classList.contains('open')) {
              panel.classList.add('open');
            }
            if (msg.message_id && displayedMsgIds.has(msg.message_id)) return;
            if (msg.message_id) displayedMsgIds.add(msg.message_id);
            if (msg.message_id) lastMsgId = Math.max(lastMsgId, Number(msg.message_id) || 0);
            if (typeof addMsg === 'function') {
              const text = msg.message_original || '';
              addMsg(text, 'ai', msg.created_at || Date.now());
            }
            playNewMessageSound();
            // AIGC START
            scheduleVisitorMarkAgentRead();
            // AIGC END
          }
          // AIGC START
          if (msg.type === 'peer_typing' && msg.peer === 'agent') {
            if (msg.conversation_id && conversationId && Number(msg.conversation_id) !== Number(conversationId)) return;
            const bar = document.getElementById('chat-widget-typing');
            if (!bar) return;
            if (msg.is_typing) {
              bar.textContent = t('agentTyping');
              bar.style.display = 'block';
            } else {
              bar.style.display = 'none';
            }
          }
          if (msg.type === 'messages_read') {
            applyVisitorReadReceipts(msg.message_ids || [], msg.conversation_id);
          }
          // AIGC END
        } catch (e) {}
      };
      ws.onclose = function () {
        if (wsPingTimer) { try { clearInterval(wsPingTimer); } catch (e) {} wsPingTimer = null; }
        if (wsRetryTimer) return;
        wsRetryTimer = setTimeout(function () {
          wsRetryTimer = null;
          connectWs(addMsg);
        }, 2000);
      };
      ws.onerror = function () {
        try { ws.close(); } catch (e) {}
      };
    } catch (e) {
      if (wsRetryTimer) return;
      wsRetryTimer = setTimeout(function () {
        wsRetryTimer = null;
        connectWs(addMsg);
      }, 2000);
    }
  }

  function renderWidget() {
    if (document.getElementById('chat-widget-root')) return;
    const wrap = document.createElement('div');
    wrap.id = 'chat-widget-root';
    // 说明：页面中的第三方浮层常会用较高 z-index（如 cookie banner、弹窗等）
    // 这里将 widget 的按钮/面板设为极高层级，确保始终在最上层可点击
    wrap.innerHTML = '\n<style>\n#chat-widget-btn { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: #2563eb; color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.15); display: inline-flex; align-items: center; justify-content: center; z-index: 2147483647; animation: chatBtnPulse 2.4s ease-in-out infinite, chatBtnNudge 5s ease-in-out infinite; }\n#chat-widget-btn:hover { animation-play-state: paused; transform: scale(1.06); box-shadow: 0 8px 20px rgba(37,99,235,.35); }\n#chat-widget-btn:focus-visible { outline: 2px solid #93c5fd; outline-offset: 3px; }\n#chat-widget-btn::after { content: "人工客服"; position: absolute; right: 60px; top: 50%; transform: translateY(-50%); background: rgba(17,24,39,.92); color: #fff; font-size: 12px; line-height: 1; padding: 7px 10px; border-radius: 999px; white-space: nowrap; opacity: .92; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,.25); }\n@keyframes chatBtnPulse { 0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,.15), 0 0 0 0 rgba(37,99,235,.45); } 50% { box-shadow: 0 6px 18px rgba(0,0,0,.22), 0 0 0 12px rgba(37,99,235,0); } }\n@keyframes chatBtnNudge { 0%, 85%, 100% { transform: translateX(0); } 88% { transform: translateX(-2px); } 91% { transform: translateX(2px); } 94% { transform: translateX(-1px); } 97% { transform: translateX(1px); } }\n@media (max-width: 640px) {\n#chat-widget-btn::after { font-size: 11px; right: 58px; padding: 6px 9px; }\n}\n@media (prefers-reduced-motion: reduce) {\n#chat-widget-btn { animation: none; }\n#chat-widget-btn:hover { transform: none; }\n}\n#chat-widget-btn svg { width: 50px; height: 50px; display: block; }\n/* AIGC START 面板：桌面适中宽度高度；小屏底部全宽抽屉 + 安全区 */\n#chat-widget-panel { display: none; position: fixed; box-sizing: border-box; bottom: max(90px, calc(12px + env(safe-area-inset-bottom, 0px))); right: max(16px, env(safe-area-inset-right, 0px)); width: min(520px, calc(100vw - 32px)); height: min(700px, calc(100vh - 108px)); max-height: calc(100dvh - 100px); background: #efeae2; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.12); flex-direction: column; overflow: hidden; z-index: 2147483647; }\n#chat-widget-panel.open { display: flex; }\n@media (max-width: 640px) {\n#chat-widget-panel { bottom: 0; right: 0; left: 0; top: auto; width: 100%; max-width: 100%; height: min(72dvh, 560px); max-height: calc(100dvh - env(safe-area-inset-bottom, 0px) - 8px); border-radius: 16px 16px 0 0; }\n}\n@media (max-width: 640px) and (max-height: 700px) {\n#chat-widget-panel { height: min(68dvh, 520px); }\n}\n/* AIGC END */\n#chat-widget-panel .header { padding: 12px 16px; background: #075E54; color: #fff; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }\n#chat-widget-panel .header .title { flex: 1; }\n#chat-widget-panel .profile { padding: 20px 18px 22px; border-bottom: 1px solid #dfe5e7; background:#f0f2f5; }\n#chat-widget-panel .profile .hint { font-size:13px; color:#667781; margin-bottom:14px; text-align:center; line-height:1.4; }\n#chat-widget-panel .profile .row { display:flex; gap:8px; margin-bottom:10px; justify-content:center; }\n#chat-widget-panel .profile input { width:100%; max-width:100%; padding:10px 12px; border:1px solid #d1d7db; border-radius:10px; font-size:13px; color:#111B21; background:#fff; }\n#chat-widget-panel .profile button { width:100%; padding:10px; margin-top:4px; background:#128C7E; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:600; font-size:13px; }\n#chat-widget-panel .messages { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 12px; background:#efeae2; }\n#chat-widget-panel .msg { margin-bottom: 10px; font-size: 14px; }\n#chat-widget-panel .msg.visitor { text-align: right; }\n#chat-widget-panel .msg .bubble { display: inline-block; padding: 8px 12px; border-radius: 12px; max-width: 85%; }\n#chat-widget-panel .msg .bubble .text { white-space: pre-wrap; word-break: break-word; }\n#chat-widget-panel .msg.visitor .bubble { background: #d9fdd3; color: #111B21; border:1px solid #c7e9c0; border-radius: 8px 8px 2px 8px; box-shadow:0 1px 0 rgba(0,0,0,.04); }\n#chat-widget-panel .msg.ai .bubble { background: #fff; color:#111B21; border:1px solid #E5E7EB; border-radius: 8px 8px 8px 2px; box-shadow:0 1px 0 rgba(0,0,0,.04); }\n#chat-widget-panel .msg .meta { margin-top: 4px; font-size: 9px; opacity: 1; line-height: 1.2; color:#667781; }\n#chat-widget-panel .msg.visitor .meta { text-align: right; }\n#chat-widget-panel .footer { padding: 8px; border-top: 1px solid #dfe5e7; display: flex; gap: 8px; background:#f0f2f5; }\n#chat-widget-panel .footer input { flex: 1; padding: 10px 14px; border: 1px solid #d1d7db; border-radius: 999px; background:#fff; color:#111B21; }\n#chat-widget-panel .footer input::placeholder { color:#8696A0; }\n#chat-widget-panel .footer button { padding: 10px 16px; background: #25D366; color: #fff; border: none; border-radius: 999px; cursor: pointer; font-weight:600; }\n#chat-widget-panel .footer button:hover { filter: brightness(.96); }\n</style>\n<button id="chat-widget-btn" type="button" aria-label="打开客服" title="人工客服">\n  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" data-spec="button-icon"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 9.78374C4 5.84433 4.81543 5 8.62 5H11.38C15.1846 5 16 5.84433 16 9.78374C16 13.7232 15.1846 14.9008 11.38 14.9008H10.8303C10.8025 14.9346 10.7703 14.9666 10.7336 14.9962L8.54286 16.86C8.12929 17.1935 7.5137 16.898 7.5137 16.3667V14.87C4.65254 14.6884 4 13.3078 4 9.78374ZM10 10.6667C10.3682 10.6667 10.6667 10.3682 10.6667 10C10.6667 9.63181 10.3682 9.33333 10 9.33333C9.63181 9.33333 9.33333 9.63181 9.33333 10C9.33333 10.3682 9.63181 10.6667 10 10.6667ZM13.3333 10C13.3333 10.3682 13.0349 10.6667 12.6667 10.6667C12.2985 10.6667 12 10.3682 12 10C12 9.63181 12.2985 9.33333 12.6667 9.33333C13.0349 9.33333 13.3333 9.63181 13.3333 10ZM7.33333 10.6667C7.70152 10.6667 8 10.3682 8 10C8 9.63181 7.70152 9.33333 7.33333 9.33333C6.96514 9.33333 6.66667 9.63181 6.66667 10C6.66667 10.3682 6.96514 10.6667 7.33333 10.6667Z" fill="white"></path></svg>\n</button>\n<div id="chat-widget-panel">\n  <div class="header">客服 <button class="close" type="button">×</button></div>\n  <div class="profile" id="chat-profile" style="display:none;">\n    <div class="hint">首次咨询请填写姓名与邮箱，方便客服联系您。</div>\n    <div class="row"><input type="text" id="chat-name" placeholder="姓名" /></div>\n    <div class="row"><input type="email" id="chat-email" placeholder="邮箱" /></div>\n    <button type="button" id="chat-profile-save">保存并继续</button>\n  </div>\n  <div class="messages" id="chat-msgs"></div>\n  <div class="footer">\n    <input type="text" id="chat-input" placeholder="输入消息..." />\n    <button type="button" id="chat-send">发送</button>\n  </div>\n</div>\n';
    document.body.appendChild(wrap);

    const btn = document.getElementById('chat-widget-btn');
    if (btn) {
      btn.id = 'contact-support-btn';
      btn.className = 'contact-support-btn';
      btn.setAttribute('aria-label', '联系客服');
      btn.setAttribute('title', '联系客服');
      btn.innerHTML =
        '<svg class="contact-support-icon" viewBox="0 0 1051 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
          '<path d="M55.351351 553.402811v110.924108a83.027027 83.027027 0 0 0 166.054054 0v-110.924108a83.027027 83.027027 0 0 0-166.054054 0z m763.101406 211.552865A137.852541 137.852541 0 0 1 774.918919 664.326919v-110.924108A138.378378 138.378378 0 0 1 912.328649 415.135135C898.131027 214.071351 730.499459 55.351351 525.837838 55.351351 321.148541 55.351351 153.544649 214.071351 139.347027 415.135135A138.461405 138.461405 0 0 1 276.756757 553.402811v110.924108a138.378378 138.378378 0 0 1-276.756757 0v-110.924108a138.378378 138.378378 0 0 1 83.303784-126.865297C91.883243 189.523027 286.72 0 525.837838 0s433.954595 189.523027 442.534054 426.537514A138.461405 138.461405 0 0 1 1051.675676 553.402811v110.924108a138.378378 138.378378 0 0 1-184.790487 130.269405 470.763243 470.763243 0 0 1-188.858811 121.21946A96.809514 96.809514 0 0 1 580.912432 1010.162162h-82.528864c-53.690811 0-97.113946-43.174054-97.113946-96.864865 0-53.607784 43.284757-96.864865 97.141621-96.864865h82.473514c34.954378 0 65.536 18.265946 82.639567 45.803244a415.273514 415.273514 0 0 0 154.900757-97.28zM830.27027 553.402811v110.924108a83.027027 83.027027 0 0 0 166.054054 0v-110.924108a83.027027 83.027027 0 0 0-166.054054 0zM498.438919 954.810811h82.473513c23.302919 0 41.79027-18.487351 41.790271-41.513514 0-23.053838-18.570378-41.513514-41.790271-41.513513h-82.473513c-23.302919 0-41.79027 18.487351-41.79027 41.513513 0 23.053838 18.570378 41.513514 41.79027 41.513514z" fill="#ffffff"></path>' +
        '</svg>' +
        '<span class="contact-support-text">联系客服</span>';

      const customBtnStyle = document.createElement('style');
      customBtnStyle.textContent =
        '.contact-support-btn{position:fixed;bottom:20px;right:20px;z-index:2147483647;display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(0,0,0,.06);background:#1DAA61;color:#ffffff;font-size:12px;font-weight:600;cursor:pointer;box-shadow:none;transition:transform .15s ease,filter .15s ease;animation:chatBtnPulse 2.4s ease-in-out infinite,chatBtnNudge 5s ease-in-out infinite;}' +
        '.contact-support-btn:hover{animation-play-state:paused;transform:scale(1.06);filter:brightness(1.06);box-shadow:0 8px 20px rgba(102,126,234,.35);}' +
        '.contact-support-btn:focus-visible{outline:2px solid #c4b5fd;outline-offset:3px;}' +
        '.contact-support-btn::after{content:none;}' +
        '.contact-support-icon{width:18px;height:18px;display:block;flex-shrink:0;}' +
        '.contact-support-text{line-height:1;white-space:nowrap;}' +
        '@media (max-width:640px){.contact-support-btn{height:36px;padding:0 12px;}}' +
        '@media (prefers-reduced-motion:reduce){.contact-support-btn{animation:none;}.contact-support-btn:hover{transform:none;}}';
      document.head.appendChild(customBtnStyle);
    }
    const panel = document.getElementById('chat-widget-panel');
    if (panel) {
      panel.style.boxShadow = '0 8px 24px rgb(0 0 0 / 43%)';
    }
    const closeBtn = panel.querySelector('.close');
    const profileEl = document.getElementById('chat-profile');
    const nameEl = document.getElementById('chat-name');
    const emailEl = document.getElementById('chat-email');
    const profileSaveBtn = document.getElementById('chat-profile-save');
    const msgsEl = document.getElementById('chat-msgs');
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const footerEl = panel.querySelector('.footer');
    const imageBtn = document.createElement('button');
    if (msgsEl) {
      msgsEl.style.backgroundColor = '#efeae2';
      msgsEl.style.backgroundImage = 'linear-gradient(rgba(239,234,226,0.9), rgba(239,234,226,0.9)), url("https://chat.babyamy.store/static/OA5z0a81CZk.webp")';
      msgsEl.style.backgroundSize = 'cover';
      msgsEl.style.backgroundPosition = 'center';
      msgsEl.style.backgroundRepeat = 'no-repeat';
    }
    imageBtn.type = 'button';
    imageBtn.id = 'chat-image-btn';
    imageBtn.setAttribute('aria-label', '发送图片');
    imageBtn.title = '发送图片';
    imageBtn.style.padding = '7px 9px';
    imageBtn.style.background = '#fff';
    imageBtn.style.color = '#606060';
    imageBtn.style.border = '1px solid #d1d5db';
    imageBtn.style.width = '42px';
    imageBtn.style.height = '42px';
    imageBtn.style.minWidth = '42px';
    imageBtn.style.borderRadius = '999px';
    imageBtn.style.display = 'inline-flex';
    imageBtn.style.alignItems = 'center';
    imageBtn.style.justifyContent = 'center';
    imageBtn.style.transition = 'transform .08s ease, filter .15s ease, box-shadow .15s ease';
    imageBtn.style.boxShadow = 'none';
    imageBtn.innerHTML = '<svg t="1775577678665" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9443" width="28" height="28"><path d="M512 0c-30.72 0-51.2 20.48-51.2 51.2v409.6H51.2c-30.72 0-51.2 20.48-51.2 51.2s20.48 51.2 51.2 51.2h409.6v409.6c0 30.72 20.48 51.2 51.2 51.2s51.2-20.48 51.2-51.2v-409.6h409.6c30.72 0 51.2-20.48 51.2-51.2s-20.48-51.2-51.2-51.2h-409.6V51.2c0-30.72-20.48-51.2-51.2-51.2z" fill="#606060" p-id="9444"></path></svg>';
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    if (footerEl) {
      footerEl.insertBefore(imageBtn, inputEl);
      footerEl.appendChild(imageInput);
    }
    const headerEl = panel.querySelector('.header');
    if (headerEl) headerEl.remove();
    // AIGC START
    const typingBarEl = document.createElement('div');
    typingBarEl.id = 'chat-widget-typing';
    typingBarEl.style.display = 'none';
    typingBarEl.style.padding = '4px 12px';
    typingBarEl.style.fontSize = '12px';
    typingBarEl.style.color = '#6b7280';
    typingBarEl.style.fontStyle = 'italic';
    if (footerEl && footerEl.parentNode) footerEl.parentNode.insertBefore(typingBarEl, footerEl);
    // AIGC END

    // 按当前语言填充界面文案
    const langConf = {
      headerTitle: t('headerTitle'),
      profileHint: t('profileHint'),
      namePlaceholder: t('namePlaceholder'),
      emailPlaceholder: t('emailPlaceholder'),
      inputPlaceholder: t('inputPlaceholder'),
      sendLabel: t('sendLabel'),
      profileSubmitLabel: t('profileSubmitLabel') || t('sendLabel')
    };
    try {
      const hintEl = profileEl && profileEl.querySelector('.hint');
      if (hintEl) {
        const raw = langConf.profileHint || '';
        if (raw.indexOf('\n') >= 0) {
          const parts = raw.split('\n');
          const first = parts[0] || '';
          const second = (parts[1] || '') + (parts.slice(2).join(' ') ? ' ' + parts.slice(2).join(' ') : '');
          // 使用 escapeHtml 保证安全，再用两行显示，第一行加粗
          hintEl.innerHTML =
            '<div><strong>' + escapeHtml(first) + '</strong></div>' +
            (second.trim() ? '<div>' + escapeHtml(second) + '</div>' : '');
        } else {
          hintEl.textContent = raw;
        }
      }
      if (nameEl) {
        nameEl.placeholder = langConf.namePlaceholder || '';
        nameEl.style.width = '100%';
        nameEl.style.boxSizing = 'border-box';
      }
      if (emailEl) {
        emailEl.placeholder = langConf.emailPlaceholder || '';
        emailEl.style.width = '100%';
        emailEl.style.boxSizing = 'border-box';
      }
      if (inputEl) inputEl.placeholder = langConf.inputPlaceholder || '';
      if (inputEl) {
        inputEl.style.outline = 'none';
        inputEl.style.boxShadow = 'none';
      }
      if (profileSaveBtn) profileSaveBtn.textContent = langConf.profileSubmitLabel || langConf.sendLabel || '';
      if (sendBtn) {
        sendBtn.setAttribute('aria-label', langConf.sendLabel || '发送');
        sendBtn.setAttribute('title', langConf.sendLabel || '发送');
        sendBtn.style.width = '42px';
        sendBtn.style.height = '42px';
        sendBtn.style.minWidth = '42px';
        sendBtn.style.border = 'none';
        sendBtn.style.borderRadius = '999px';
        sendBtn.style.background = '#111827';
        sendBtn.style.color = '#fff';
        sendBtn.style.cursor = 'pointer';
        sendBtn.style.display = 'inline-flex';
        sendBtn.style.alignItems = 'center';
        sendBtn.style.justifyContent = 'center';
        sendBtn.style.boxShadow = '0 2px 8px rgba(17, 24, 39, 0.35)';
        sendBtn.style.transition = 'transform .08s ease, filter .15s ease, box-shadow .15s ease';
        sendBtn.style.padding = '0';
        sendBtn.innerHTML = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden="true" style="width:22px;height:22px;display:block;"><path d="M5.4 19.425C5.06667 19.5583 4.75 19.5291 4.45 19.3375C4.15 19.1458 4 18.8666 4 18.5V14L12 12L4 9.99997V5.49997C4 5.1333 4.15 4.85414 4.45 4.66247C4.75 4.4708 5.06667 4.44164 5.4 4.57497L20.8 11.075C21.2167 11.2583 21.425 11.5666 21.425 12C21.425 12.4333 21.2167 12.7416 20.8 12.925L5.4 19.425Z" fill="currentColor"></path></svg>';
      }
    } catch (e) {}

    const backBtn = document.getElementById('chat-header-back');

    function toggleProfilePage(show) {
      const actuallyShowProfile = show && REQUIRE_GUEST_INFO;
      if (profileEl) {
        if (actuallyShowProfile) {
          profileEl.style.display = 'flex';
          profileEl.style.flex = '1';
          profileEl.style.flexDirection = 'column';
          profileEl.style.justifyContent = 'center';
        } else {
          profileEl.style.display = 'none';
          profileEl.style.flex = '';
          profileEl.style.flexDirection = '';
          profileEl.style.justifyContent = '';
        }
      }
      if (msgsEl) msgsEl.style.display = show ? 'none' : 'block';
      if (footerEl) footerEl.style.display = show ? 'none' : 'flex';
      if (backBtn) backBtn.style.display = show ? 'inline-flex' : 'none';
    }

    function escapeHtml(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatTs(isoOrMs) {
      if (!isoOrMs) return '';
      try {
        const d = (typeof isoOrMs === 'number') ? new Date(isoOrMs) : new Date(String(isoOrMs));
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString();
      } catch (e) {
        return '';
      }
    }

    function isImageMessage(text) {
      return String(text || '').indexOf(IMAGE_MESSAGE_PREFIX) === 0;
    }

    function getImageUrl(text) {
      if (!isImageMessage(text)) return '';
      return String(text || '').slice(IMAGE_MESSAGE_PREFIX.length).trim();
    }

    function normalizeUrl(url) {
      const s = String(url || '').trim();
      if (!s) return '';
      if (/^https?:\/\//i.test(s)) return s;
      if (s.indexOf('/') === 0) return API_ORIGIN + s;
      return '';
    }

    function renderMsgContent(text) {
      if (!isImageMessage(text)) return '<div class="text">' + escapeHtml(text) + '</div>';
      const src = normalizeUrl(getImageUrl(text));
      if (!src) return '<div class="text">[图片]</div>';
      return '<div class="text"><img src="' + escapeHtml(src) + '" alt="image" data-chat-img="1" style="max-width:220px;max-height:240px;border-radius:8px;display:block;cursor:pointer;" /></div>';
    }

    function addMsg(text, who, ts, messageId, readAt) {
      const div = document.createElement('div');
      div.className = 'msg ' + who;
      const tsText = formatTs(ts);
      if (who === 'ai') {
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.innerHTML =
          '<div class="avatar" style="margin-right:8px;flex-shrink:0;">' +
            '<img src="' + SUPPORT_AVATAR_URL + '" ' +
            'alt="客服" style="width:50px;height:50px;border-radius:50%;display:block;" />' +
          '</div>' +
          '<div class="bubble">' +
            renderMsgContent(text) +
            (tsText ? ('<div class="meta">' + escapeHtml(tsText) + '</div>') : '') +
          '</div>';
      } else {
        // AIGC START
        const midAttr = messageId ? (' data-mid="' + String(messageId) + '"') : '';
        const metaParts = [];
        if (tsText) metaParts.push(escapeHtml(tsText));
        if (readAt) metaParts.push(escapeHtml(t('readReceipt')));
        const metaHtml = metaParts.length ? ('<div class="meta">' + metaParts.join(' · ') + '</div>') : '';
        div.innerHTML =
          '<div class="bubble"' + midAttr + '>' +
            renderMsgContent(text) +
            metaHtml +
          '</div>';
        // AIGC END
      }
      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleProfilePage(false);
      });
    }

    const imagePreviewMask = document.createElement('div');
    imagePreviewMask.id = 'chat-widget-image-preview';
    imagePreviewMask.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:2147483647;align-items:center;justify-content:center;padding:16px;cursor:zoom-out;';
    const imagePreview = document.createElement('img');
    imagePreview.style.cssText = 'max-width:96vw;max-height:92vh;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.45);';
    imagePreviewMask.appendChild(imagePreview);
    document.body.appendChild(imagePreviewMask);
    msgsEl.addEventListener('click', function (e) {
      const target = e.target;
      if (!target || target.tagName !== 'IMG' || !target.getAttribute('data-chat-img')) return;
      const src = target.getAttribute('src') || '';
      if (!src) return;
      imagePreview.src = src;
      imagePreviewMask.style.display = 'flex';
    });
    imagePreviewMask.addEventListener('click', function () {
      imagePreviewMask.style.display = 'none';
      imagePreview.src = '';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && imagePreviewMask.style.display !== 'none') {
        imagePreviewMask.style.display = 'none';
        imagePreview.src = '';
      }
    });

    btn.addEventListener('click', function () {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        profile = profile || loadProfile();
        const hasProfile = REQUIRE_GUEST_INFO ? (profile && profile.name && profile.email) : true;
        if (!hasProfile) {
          // 未填写资料且开启了“需填写姓名/邮箱”：显示资料页
          toggleProfilePage(true);
          nameEl.value = '';
          emailEl.value = '';
          if (nameEl) nameEl.focus();
          return;
        }
        toggleProfilePage(false);
        // 立即显示首句欢迎语（避免等待 register / 拉历史的异步延迟）
        // 后续若拉到历史消息会覆盖；若无历史则保留，不重复添加
        try {
          if (msgsEl && msgsEl.childElementCount === 0) {
            addMsg(t('firstMessage'), 'ai', Date.now());
          }
        } catch (e) {}
        if (conversationId) reportBehavior();
        if (!conversationId) {
          register().then(async function () {
            reportBehavior();
            const history = await fetchHistory();
            if (history.length) {
              msgsEl.innerHTML = '';
              history.forEach(m => {
                if (m.sender === 'visitor') addMsg(m.message_original, 'visitor', m.created_at, m.id, m.read_at);
                else addMsg(m.message_original, 'ai', m.created_at);
              });
            }
            connectWs(addMsg);
            // AIGC START
            scheduleVisitorMarkAgentRead();
            // AIGC END
          });
        } else {
          fetchHistory().then(function (history) {
            if (history && history.length) {
              msgsEl.innerHTML = '';
              history.forEach(m => {
                if (m.sender === 'visitor') addMsg(m.message_original, 'visitor', m.created_at, m.id, m.read_at);
                else addMsg(m.message_original, 'ai', m.created_at);
              });
            }
            connectWs(addMsg);
            // AIGC START
            scheduleVisitorMarkAgentRead();
            // AIGC END
          });
        }
      }
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        panel.classList.remove('open');
        // 保持后台轮询，关闭窗口后仍可接收客服/AI 新消息，重新打开时能看到
      });
    }

    sendBtn.addEventListener('click', doSend);
    imageBtn.addEventListener('click', function () { imageInput.click(); });
    imageInput.addEventListener('change', function () {
      const f = imageInput.files && imageInput.files[0];
      imageInput.value = '';
      if (!f) return;
      profile = profile || loadProfile();
      if (REQUIRE_GUEST_INFO && (!profile || !profile.name || !profile.email)) {
        toggleProfilePage(true);
        return;
      }
      imageBtn.disabled = true;
      uploadImage(f).then(function (url) {
        const payload = IMAGE_MESSAGE_PREFIX + url;
        addMsg(payload, 'visitor', Date.now());
        return sendMessage(payload);
      }).then(function (res) {
        if (res && res.visitor_message_id) setVisitorBubbleMid(res.visitor_message_id);
      }).catch(function () {
      }).finally(function () {
        imageBtn.disabled = false;
      });
    });
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSend(); });
    inputEl.addEventListener('focus', function () {
      inputEl.style.borderColor = '#d1d7db';
      inputEl.style.outline = 'none';
      inputEl.style.boxShadow = 'none';
    });
    // AIGC START
    if (inputEl) {
      inputEl.addEventListener('input', function () {
        if (!conversationId) return;
        sendVisitorTyping(true);
        if (widgetTypingStopTimer) clearTimeout(widgetTypingStopTimer);
        widgetTypingStopTimer = setTimeout(function () {
          widgetTypingStopTimer = null;
          sendVisitorTyping(false);
        }, 2800);
      });
      inputEl.addEventListener('blur', function () {
        if (widgetTypingStopTimer) { clearTimeout(widgetTypingStopTimer); widgetTypingStopTimer = null; }
        sendVisitorTyping(false);
      });
    }
    // AIGC END

    function doSend() {
      const text = inputEl.value.trim();
      if (!text) return;
      profile = profile || loadProfile();
      if (REQUIRE_GUEST_INFO && (!profile || !profile.name || !profile.email)) {
        // 开启了“需填写姓名/邮箱”但还没填写：先缓存这条消息，等资料保存后自动补发
        pendingText = text;
        pendingTs = Date.now();
        inputEl.value = '';
        toggleProfilePage(true);
        nameEl.value = (profile && profile.name) || '';
        emailEl.value = (profile && profile.email) || '';
        if (!nameEl.value) nameEl.focus();
        else emailEl.focus();
        return;
      }
      addMsg(text, 'visitor', Date.now());
      inputEl.value = '';
      sendMessage(text).then(function (res) {
        // AIGC START
        if (res && res.visitor_message_id) setVisitorBubbleMid(res.visitor_message_id);
        // AIGC END
        if (!res || !res.ai_message) return;
        if (res.ai_message_id && displayedMsgIds.has(res.ai_message_id)) return;
        if (res.ai_message_id) {
          displayedMsgIds.add(res.ai_message_id);
          lastMsgId = Math.max(lastMsgId, res.ai_message_id);
        }
        addMsg(res.ai_message, 'ai', Date.now());
      });
    }

    profileSaveBtn.addEventListener('click', async function () {
      const n = (nameEl.value || '').trim();
      const e = (emailEl.value || '').trim();
      if (!n || !validEmail(e)) return;
      saveProfile({ name: n, email: e });
      toggleProfilePage(false);
      // 资料保存后立刻同步到后端（即使 conversationId 已存在也会更新 Visitor）
      await register();
      // 隐身/新设备场景：保存邮箱后服务端可能找回旧访客/旧会话，这里立刻重拉历史并刷新 UI
      try {
        const history = await fetchHistory();
        msgsEl.innerHTML = '';
            if (history && history.length) {
          history.forEach(m => {
            if (m.sender === 'visitor') addMsg(m.message_original, 'visitor', m.created_at, m.id, m.read_at);
            else addMsg(m.message_original, 'ai', m.created_at);
          });
        } else {
              addMsg(t('firstMessage'), 'ai', Date.now());
        }
        scheduleVisitorMarkAgentRead();
      } catch (err) {}

      // 如果之前点过发送但被资料弹窗拦截，这里自动补发那条消息
      try {
        profile = profile || loadProfile();
        if (pendingText && profile && profile.name && profile.email) {
          const toSend = pendingText;
          const ts = pendingTs || Date.now();
          pendingText = null;
          pendingTs = null;
          try { inputEl.value = ''; } catch (e0) {}
          addMsg(toSend, 'visitor', ts);
          sendMessage(toSend).then(function (res) {
            // AIGC START
            if (res && res.visitor_message_id) setVisitorBubbleMid(res.visitor_message_id);
            // AIGC END
            if (!res || !res.ai_message) return;
            if (res.ai_message_id && displayedMsgIds.has(res.ai_message_id)) return;
            if (res.ai_message_id) {
              displayedMsgIds.add(res.ai_message_id);
              lastMsgId = Math.max(lastMsgId, res.ai_message_id);
            }
            addMsg(res.ai_message, 'ai', Date.now());
          });
        }
      } catch (e2) {}
    });

    // 页面加载时若已有会话，立即执行 register + reportBehavior + 轮询（保持通讯，无需先点按钮）
    profile = profile || loadProfile();
    const hasProfileForLoad = REQUIRE_GUEST_INFO ? (profile && profile.name && profile.email) : true;
    if (conversationId && hasProfileForLoad) {
      register().then(function () {
        reportBehavior();
        return fetchHistory();
      }).then(function (history) {
        if (history && history.length) {
          msgsEl.innerHTML = '';
          history.forEach(m => {
            if (m.sender === 'visitor') addMsg(m.message_original, 'visitor', m.created_at, m.id, m.read_at);
            else addMsg(m.message_original, 'ai', m.created_at);
          });
        } else {
          if (msgsEl) {
            msgsEl.innerHTML = '';
            addMsg(t('firstMessage'), 'ai', Date.now());
          }
        }
        connectWs(addMsg);
        scheduleVisitorMarkAgentRead();
      }).catch(function () {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadWidgetSettings().finally(renderWidget);
    });
  } else {
    loadWidgetSettings().finally(renderWidget);
  }
})();
