// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Dynamic year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear().toString();
}

// Image lightbox for gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImage');

if (lightbox && lightboxImg) {
  const openLightbox = (src) => {
    lightboxImg.src = src;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  };

  document.querySelectorAll('.device-frame[data-full-image]').forEach((frame) => {
    frame.addEventListener('click', () => {
      const src = frame.getAttribute('data-full-image');
      if (!src) return;
      openLightbox(src);
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  const closeBtn = lightbox.querySelector('.lightbox-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeLightbox());
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

// Simulate send translated message in hero preview
const heroChatBody = document.getElementById('heroChatMessages');
const heroSendBtn = document.querySelector('.chat-input-send');
const heroInputPreview = document.querySelector('.chat-input-preview');

if (heroChatBody && heroSendBtn && heroInputPreview) {
  // 对话列表：包含客户消息和回复
  const conversations = [
    {
      customer: {
        cn: '我需要订购1000台设备是多少钱？交货时间是多久？',
        translated: 'Necesito pedir 1000 unidades del dispositivo, ¿cuánto sería en total? ¿Y cuál es el tiempo de entrega?'
      },
      reply: {
        cn: '1000台设备每台是269美元，交货时间是15天。',
        translated: 'El precio por 1000 unidades es de 269 USD por unidad y el tiempo de entrega es de 15 días.'
      }
    },
    {
      customer: {
        cn: '价格包含关税吗？',
        translated: '¿El precio incluye los aranceles aduaneros?'
      },
      reply: {
        cn: '您好，我提供的报价不包含关税。',
        translated: 'Hola, el precio que te he ofrecido no incluye los aranceles aduaneros.'
      }
    },
    {
      customer: {
        cn: '关税是多少钱呢？',
        translated: '¿Cuánto son los aranceles?'
      },
      reply: {
        cn: '通常是30%，不过我可以帮您降低申报价值，帮您减少关税。',
        translated: 'Normalmente es del 30%, pero puedo ayudarte a bajar el valor declarado para reducir los aranceles.'
      }
    },
    {
      customer: {
        cn: '听起来不错，但有风险吗？',
        translated: 'Suena bien, pero ¿hay algún riesgo?'
      },
      reply: {
        cn: '我们经常帮助客户这样做，非常安全。',
        translated: 'A menudo ayudamos a los clientes de esta manera, es muy seguro.'
      }
    },
    {
      customer: {
        cn: '怎么付款？',
        translated: '¿Cómo se paga?'
      },
      reply: {
        cn: '直接付款到我们银行账号或使用西联汇款，我们还接受Paypal。',
        translated: 'Pago directo a nuestra cuenta bancaria o usando Western Union, también aceptamos PayPal.'
      }
    },
    {
      customer: {
        cn: '使用什么快递？',
        translated: '¿Qué servicio de mensajería se utiliza?'
      },
      reply: {
        cn: '我会使用DHL，5-15天您就能收到包裹。',
        translated: 'Usaré DHL, recibirás el paquete en 5-15 días.'
      }
    },
    {
      customer: {
        cn: '很好，钱我已经转到您的银行账户了，请尽快发货，并给我跟踪号码。',
        translated: 'Muy bien, ya he transferido el dinero a su cuenta bancaria, por favor envíe lo antes posible y dame el número de seguimiento.'
      },
      reply: {
        cn: '感谢您的信任，我现在就安排发货。',
        translated: 'Gracias por su confianza, ahora mismo voy a organizar el envío.'
      }
    }
  ];

  // 初始化时滚动到底部，显示最新消息
  const scrollToBottom = () => {
    heroChatBody.scrollTop = heroChatBody.scrollHeight;
  };
  
  // 页面加载完成后滚动到底部
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToBottom);
  } else {
    scrollToBottom();
  }
  
  // 延迟一下再滚动，确保内容已渲染
  setTimeout(scrollToBottom, 100);

  // 显示客户消息（直接显示，不需要输入）
  const showCustomerMessage = (cnText, translatedText) => {
    const row = document.createElement('div');
    row.className = 'chat-row chat-row-in';
    row.innerHTML = [
      '<div class="msg msg-in">',
      `<span class="msg-main">${translatedText}</span>`,
      `<span class="msg-translation">${cnText}</span>`,
      '</div>',
    ].join('');

    heroChatBody.appendChild(row);
    scrollToBottom();
  };

  // 模拟逐字输入
  const typeMessage = (text, callback) => {
    heroInputPreview.textContent = '';
    let index = 0;
    
    const typeChar = () => {
      if (index < text.length) {
        heroInputPreview.textContent = text.substring(0, index + 1);
        index++;
        // 随机延迟 50-150ms，模拟真实打字速度
        setTimeout(typeChar, 50 + Math.random() * 100);
      } else {
        // 输入完成，等待一小段时间后发送
        setTimeout(() => {
          if (callback) callback();
        }, 300);
      }
    };
    
    typeChar();
  };

  // 发送回复消息
  const sendReply = (cnText, translatedText) => {
    // 添加按下效果
    heroSendBtn.classList.add('pressed');
    
    // 短暂延迟后移除按下效果，模拟按下和释放
    setTimeout(() => {
      heroSendBtn.classList.remove('pressed');
    }, 200);
    
    const row = document.createElement('div');
    row.className = 'chat-row chat-row-out';
    row.innerHTML = [
      '<div class="msg msg-out">',
      `<span class="msg-main">${translatedText}</span>`,
      `<span class="msg-translation">${cnText}</span>`,
      '</div>',
    ].join('');

    heroChatBody.appendChild(row);
    scrollToBottom();
    heroInputPreview.textContent = '';
  };

  // 自动演示对话
  let currentConversationIndex = 0;
  
  const startConversation = () => {
    if (currentConversationIndex >= conversations.length) {
      // 对话结束，重新开始
      currentConversationIndex = 0;
      heroChatBody.innerHTML = ''; // 清空聊天记录
      setTimeout(startConversation, 2000);
      return;
    }

    const conversation = conversations[currentConversationIndex];
    
    // 显示客户消息
    showCustomerMessage(conversation.customer.cn, conversation.customer.translated);
    
    // 等待1.5秒后开始输入回复
    setTimeout(() => {
      typeMessage(conversation.reply.cn, () => {
        sendReply(conversation.reply.cn, conversation.reply.translated);
        
        // 发送完成后，等待2秒后开始下一条对话
        setTimeout(() => {
          currentConversationIndex++;
          startConversation();
        }, 2000);
      });
    }, 1500);
  };

  // 页面加载完成后立即开始自动演示
  startConversation();
}

// Copy link functionality
document.querySelectorAll('.copy-link').forEach((link) => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const textToCopy = link.getAttribute('data-copy');
    if (!textToCopy) return;
    const originalText = link.textContent;

    const showCopiedState = () => {
      link.textContent = '已复制！';
      link.classList.add('is-copied');
      setTimeout(() => {
        link.textContent = originalText;
        link.classList.remove('is-copied');
      }, 1500);
    };

    try {
      await navigator.clipboard.writeText(textToCopy);
      showCopiedState();
    } catch (err) {
      // 如果 clipboard API 不可用，使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showCopiedState();
      } catch (err) {
        alert('复制失败，请手动复制：' + textToCopy);
      }
      document.body.removeChild(textArea);
    }
  });
});

// iOS install helpers
const iosCopyIpaBtn = document.getElementById('iosCopyIpaLinkBtn');
if (iosCopyIpaBtn) {
  iosCopyIpaBtn.addEventListener('click', async () => {
    const textToCopy = iosCopyIpaBtn.getAttribute('data-copy');
    if (!textToCopy) return;

    const setCopiedUi = () => {
      iosCopyIpaBtn.textContent = '已复制IPA链接';
      iosCopyIpaBtn.classList.add('is-copied');
    };

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedUi();
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedUi();
      } catch (err) {
        alert('复制失败，请手动复制：' + textToCopy);
      }
      document.body.removeChild(textArea);
    }
  });
}

// Platform tabs（浏览器 / 安卓 / 苹果）— 用事件委托，避免部分手机浏览器上子元素点击异常
const platformsSection = document.getElementById('platforms');

function activatePlatformTab(target) {
  if (!target) return;
  const platformTabs = document.querySelectorAll('[data-platform-tab]');
  const platformPanels = document.querySelectorAll('[data-platform-panel]');
  if (!platformTabs.length || !platformPanels.length) return;

  platformTabs.forEach((t) => {
    const isActive = t.getAttribute('data-platform-tab') === target;
    t.classList.toggle('is-active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  platformPanels.forEach((panel) => {
    const isMatch = panel.getAttribute('data-platform-panel') === target;
    panel.classList.toggle('is-active', isMatch);
    panel.hidden = !isMatch;
  });
}

if (platformsSection) {
  platformsSection.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-platform-tab]');
    if (!tab || !platformsSection.contains(tab)) return;
    const target = tab.getAttribute('data-platform-tab');
    activatePlatformTab(target);
  });
}

// Contact modal (联系客服)
const contactBtn = document.getElementById('contactBtn');
const contactModal = document.getElementById('contactModal');

if (contactBtn && contactModal) {
  const closeBtn = contactModal.querySelector('.modal-close');

  const openContactModal = () => {
    contactModal.classList.add('is-open');
    contactModal.setAttribute('aria-hidden', 'false');
  };

  const closeContactModal = () => {
    contactModal.classList.remove('is-open');
    contactModal.setAttribute('aria-hidden', 'true');
  };

  contactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });

  // Pricing cards "立即购买" - 同一个弹窗
  document.querySelectorAll('[data-open-contact]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeContactModal();
    });
  }

  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      closeContactModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('is-open')) {
      closeContactModal();
    }
  });
}


