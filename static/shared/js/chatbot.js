/**
 * MirrAI Admin Chatbot Service
 * Handles UI interactions and API communication for the hair styling guide.
 */
(function () {
  'use strict';

  const QUICK_PROMPTS = [
    { label: 'C\uceec \uc2dc\uc220 \uc21c\uc11c', message: 'C\uceec \uc2dc\uc220 \uc21c\uc11c\ub97c \uc54c\ub824\uc918' },
    { label: '\uc5fc\uc0c9 \uc804 \uc8fc\uc758\uc0ac\ud56d', message: '\uc5fc\uc0c9 \uc804 \uc8fc\uc758\uc0ac\ud56d\uc744 \uc54c\ub824\uc918' },
    { label: '\ub808\uc774\uc5b4\ub4dc \ucef7 \uac00\uc774\ub4dc', message: '\ub808\uc774\uc5b4\ub4dc \ucef7 \uac00\uc774\ub4dc\ub97c \uc54c\ub824\uc918' },
  ];

  function getElements() {
    return {
      chatbotPanel: document.getElementById('chatbotPanel'),
      chatbotTrigger: document.getElementById('chatbotTrigger'),
      chatMessages: document.getElementById('chatMessages'),
      chatForm: document.getElementById('chatForm'),
      chatInput: document.getElementById('chatInput'),
      typingIndicator: document.getElementById('typingIndicator'),
      chatStartTime: document.getElementById('chatStartTime'),
      chatbotQuickPrompts: document.getElementById('chatbotQuickPrompts'),
    };
  }

  function init() {
    const {
      chatbotPanel,
      chatbotTrigger,
      chatForm,
      chatStartTime,
      chatMessages,
    } = getElements();

    if (!chatbotPanel || !chatbotTrigger || !chatForm || !chatMessages) {
      return;
    }

    ensureQuickPrompts();

    if (chatbotTrigger.dataset.chatbotBound === 'true') {
      return;
    }

    chatbotTrigger.addEventListener('click', window.toggleChatbot);
    chatForm.addEventListener('submit', handleChatSubmit);
    chatbotTrigger.dataset.chatbotBound = 'true';

    if (chatStartTime && !chatStartTime.textContent) {
      chatStartTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  window.initMirraiChatbot = init;

  window.toggleChatbot = function () {
    const { chatbotPanel, chatInput } = getElements();
    if (!chatbotPanel) {
      return;
    }

    chatbotPanel.classList.toggle('active');
    if (chatbotPanel.classList.contains('active') && chatInput) {
      chatInput.focus();
      scrollToBottom();
    }
  };

  window.openMirraiChatbot = function () {
    const { chatbotPanel, chatInput } = getElements();
    if (!chatbotPanel) {
      return;
    }

    chatbotPanel.classList.add('active');
    if (chatInput) {
      chatInput.focus();
    }
    scrollToBottom();
  };

  window.sendQuickMessage = function (text) {
    const { chatInput } = getElements();
    if (!chatInput) {
      return;
    }

    chatInput.value = text;
    handleChatSubmit(new Event('submit'));
  };

  function applyQuickPromptStyles(button) {
    if (!button) {
      return;
    }

    Object.assign(button.style, {
      appearance: 'none',
      WebkitAppearance: 'none',
      border: '1px solid rgba(245, 209, 13, 0.26)',
      background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.98) 0%, rgba(17, 17, 17, 0.92) 100%)',
      color: 'rgba(255, 255, 255, 0.94)',
      borderRadius: '999px',
      padding: '11px 18px',
      minHeight: '44px',
      fontSize: '13px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
      boxShadow: '0 10px 22px rgba(17, 17, 17, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      cursor: 'pointer',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease',
      whiteSpace: 'nowrap',
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px) scale(1.01)';
      button.style.borderColor = 'rgba(245, 209, 13, 0.58)';
      button.style.color = '#f5d10d';
      button.style.background = 'linear-gradient(180deg, rgba(31, 31, 31, 0.98) 0%, rgba(15, 15, 15, 0.94) 100%)';
      button.style.boxShadow = '0 14px 28px rgba(17, 17, 17, 0.22), 0 0 0 1px rgba(245, 209, 13, 0.08)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.borderColor = 'rgba(245, 209, 13, 0.26)';
      button.style.color = 'rgba(255, 255, 255, 0.94)';
      button.style.background = 'linear-gradient(180deg, rgba(26, 26, 26, 0.98) 0%, rgba(17, 17, 17, 0.92) 100%)';
      button.style.boxShadow = '0 10px 22px rgba(17, 17, 17, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
    });

    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(0) scale(0.99)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-2px) scale(1.01)';
    });
  }

  function ensureQuickPrompts() {
    const { chatMessages, chatbotQuickPrompts } = getElements();
    if (!chatMessages) {
      return;
    }

    let container = chatbotQuickPrompts;
    if (!container) {
      container = document.createElement('div');
      container.id = 'chatbotQuickPrompts';
      container.dataset.chatbotQuickPrompts = 'true';
      container.className = 'chatbot-quick-prompts';
      chatMessages.appendChild(container);
    }

    container.innerHTML = '';
    QUICK_PROMPTS.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chatbot-quick-prompt';
      button.textContent = item.label;
      applyQuickPromptStyles(button);
      button.addEventListener('click', () => {
        window.sendQuickMessage(item.message);
      });
      container.appendChild(button);
    });
  }

  async function handleChatSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    const { chatInput } = getElements();
    if (!chatInput) {
      return;
    }

    const message = chatInput.value.trim();
    if (!message) {
      return;
    }

    const conversationHistory = collectConversationHistory();
    addMessage(message, 'user');
    chatInput.value = '';
    showTyping(true);
    scrollToBottom();

    try {
      const response = await fetch('/api/v1/admin/chatbot/ask/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ message, conversation_history: conversationHistory }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('\ucc57\ubd07 API\uac00 \uc544\uc9c1 \uc900\ube44\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4. \ubc31\uc5d4\ub4dc \uc0c1\ud0dc\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694.');
        }
        throw new Error('\uc11c\ubc84 \uc751\ub2f5 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.');
      }

      const data = await response.json();
      const payload = normalizeChatbotResponse(data);
      showTyping(false);
      addMessage(payload.reply || payload.message, 'bot');
    } catch (error) {
      console.error('Chatbot Error:', error);
      showTyping(false);
      addMessage(error.message || '\uc8c4\uc1a1\ud569\ub2c8\ub2e4. \ud1b5\uc2e0 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.', 'bot');
    }

    scrollToBottom();
  }

  function addMessage(text, side) {
    const { chatMessages } = getElements();
    if (!chatMessages) {
      return;
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${side}`;
    const rawText = String(text || '').trim();
    const formattedText = rawText.replace(/\n/g, '<br>');
    msgDiv.dataset.role = side === 'user' ? 'user' : 'bot';
    msgDiv.dataset.messageText = rawText;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'message-body';
    bodyDiv.innerHTML = formattedText;
    msgDiv.appendChild(bodyDiv);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgDiv.appendChild(timeSpan);
    chatMessages.appendChild(msgDiv);
  }

  function normalizeChatbotResponse(data) {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const nestedPayload = data.data || data.payload || data.result || null;
    if (nestedPayload && typeof nestedPayload === 'object') {
      return nestedPayload;
    }
    return data;
  }

  function collectConversationHistory() {
    const { chatMessages } = getElements();
    if (!chatMessages) {
      return [];
    }

    return Array.from(chatMessages.querySelectorAll('.message'))
      .map((node) => {
        const content = String(node.dataset.messageText || '').trim();
        if (!content) {
          return null;
        }
        const role = node.dataset.role === 'user' ? 'user' : 'bot';
        return { role, content };
      })
      .filter(Boolean)
      .slice(-8);
  }

  function showTyping(show) {
    const { typingIndicator } = getElements();
    if (!typingIndicator) {
      return;
    }

    typingIndicator.classList.toggle('is-hidden', !show);
  }

  function scrollToBottom() {
    const { chatMessages } = getElements();
    if (!chatMessages) {
      return;
    }

    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  function getCookie(name) {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
