(function () {
  var NAV = [
    {
      label: "常见问题",
      children: [
        { id: "faq-link-whatsapp", href: "link-whatsapp.html", label: "关联 WhatsApp" },
        { id: "faq-sync-chats", href: "sync-chats.html", label: "同步聊天记录" },
        { id: "faq-change-lang", href: "change-customer-lang.html", label: "修改客户语言" },
        { id: "faq-change-engine", href: "change-translate-engine.html", label: "更换翻译接口" },
        { id: "faq-default-lang", href: "default-customer-lang.html", label: "为所有客户设置默认语言" },
        { id: "faq-check-before-send", href: "check-before-send.html", label: "在发送前检查翻译结果" },
        { id: "faq-not-translate", href: "message-not-translate.html", label: "消息不翻译" },
        { id: "faq-ban-risk", href: "ban-risk.html", label: "会封号吗" },
        {
          label: "翻译服务 API 申请",
          children: [
            { id: "api-deepl", href: "api-deepl.html", label: "DeepL" },
            { id: "api-deepseek", href: "api-deepseek.html", label: "DeepSeek" },
            { id: "api-openai", href: "api-openai.html", label: "OpenAI" },
          ],
        },
      ],
    },
    {
      label: "功能特性",
      children: [
        { id: "feat-text", href: "text-translate.html", label: "文字消息翻译" },
        { id: "feat-voice-msg", href: "voice-message.html", label: "语音消息翻译" },
        { id: "feat-call", href: "call-translate.html", label: "语音视频通话翻译" },
        { id: "feat-ai-staff", href: "ai-staff.html", label: "AI 员工" },
        { id: "feat-quick-reply", href: "quick-reply.html", label: "快捷回复" },
      ],
    },
  ];

  var pageId = document.body.getAttribute("data-help-id") || "faq-link-whatsapp";
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function linkClass(id) {
    return "help-nav-link" + (id === pageId ? " is-active" : "");
  }

  function renderItems(items, depth) {
    var html = "";
    items.forEach(function (item) {
      if (item.top) {
        html +=
          '<a href="' +
          item.href +
          '" class="help-nav-top ' +
          linkClass(item.id) +
          '" data-help-id="' +
          item.id +
          '">' +
          item.label +
          "</a>";
        return;
      }
      if (item.children) {
        var cls = depth > 0 ? "help-nav-sub" : "help-nav-group";
        html += '<details class="' + cls + '" open>';
        html += "<summary>" + item.label + "</summary><ul>";
        item.children.forEach(function (child) {
          if (child.children) {
            html += "<li>" + renderItems([child], depth + 1) + "</li>";
          } else {
            html +=
              '<li><a href="' +
              child.href +
              '" class="' +
              linkClass(child.id) +
              '" data-help-id="' +
              child.id +
              '">' +
              child.label +
              "</a></li>";
          }
        });
        html += "</ul></details>";
        return;
      }
      html +=
        '<a href="' +
        item.href +
        '" class="' +
        linkClass(item.id) +
        '" data-help-id="' +
        item.id +
        '">' +
        item.label +
        "</a>";
    });
    return html;
  }

  var navHost = document.getElementById("helpNav");
  if (navHost) navHost.innerHTML = renderItems(NAV, 0);

  function findLabel(items, id) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.id === id) return item.label;
      if (item.children) {
        var found = findLabel(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  var bcCurrent = document.getElementById("helpBcCurrent");
  if (bcCurrent) bcCurrent.textContent = findLabel(NAV, pageId) || pageId;

  var page = document.body;
  var backdrop = document.getElementById("helpSidebarBackdrop");
  var menuBtn = document.getElementById("helpMenuBtn");
  var closeBtn = document.getElementById("helpSidebarClose");

  function openSidebar() {
    page.classList.add("is-sidebar-open");
    if (backdrop) backdrop.hidden = false;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    page.classList.remove("is-sidebar-open");
    if (backdrop) backdrop.hidden = true;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn) menuBtn.addEventListener("click", openSidebar);
  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
  if (backdrop) backdrop.addEventListener("click", closeSidebar);

  var contactBtn = document.getElementById("helpContactBtn");
  var modal = document.getElementById("contactModal");
  if (contactBtn && modal) {
    contactBtn.addEventListener("click", function () {
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("is-open");
    });
  }
})();
