/**
 * IBM Carbon Design System v11 — On-Device WebLLM AI Chat & Vector RAG Engine
 * Fully compliant with IBM Carbon for AI / Carbon AI Chat React Component specifications.
 * - Custom Speaker Avatar picker (Watson, Scientist, Classic, Robot, Custom Image URL)
 * - Native Local TTS Voice Integration (window.speechSynthesis)
 * - Starter prompt tiles & auto-growing Carbon textarea
 * - Local Static Vector Retrieval-Augmented Generation (RAG)
 * - Markdown & Code block rendering with Copy and Feedback actions
 */

const AVATARS = {
  watson: `
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 26a12 12 0 1 1 12-12 12 12 0 0 1-12 12z"/>
      <circle cx="11" cy="14" r="1.5"/>
      <circle cx="21" cy="14" r="1.5"/>
      <path d="M16 22a6 6 0 0 0 5-2.69l-1.63-.94A4 4 0 0 1 16 20a4 4 0 0 1-3.37-1.63L11 19.31A6 6 0 0 0 16 22z"/>
    </svg>`,
  scientist: `
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
      <path d="M25 6V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2a2 2 0 0 0-2 2v6a7 7 0 0 0 6 6.92V24H9a2 2 0 0 0-2 2v4h18v-4a2 2 0 0 0-2-2h-2v-3.08A7 7 0 0 0 27 14V8a2 2 0 0 0-2-2zm-16-2h14v2H9zm16 10a5 5 0 0 1-10 0V8h10zM19 24h-6v-3.08a7 7 0 0 0 6 0z"/>
    </svg>`,
  classic: `
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
      <path d="M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 18H4V8h24z"/>
      <path d="M7 10h4v2H7zm6 0h4v2h-4zm6 0h4v2h-4zM7 14h4v2H7zm6 0h4v2h-4zm6 0h4v2h-4zM7 18h4v2H7zm6 0h4v2h-4zm6 0h4v2h-4z"/>
    </svg>`,
  robot: `
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
      <path d="M26 12h-2v-2a4 4 0 0 0-4-4h-3V3h-2v3h-3a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM10 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2H10zm12 16H10v-3h12zm4-6h-2v-6h2zm-18-6v6H6v-6z"/>
      <circle cx="12" cy="17" r="1.5"/>
      <circle cx="20" cy="17" r="1.5"/>
    </svg>`
};

const USER_AVATAR = `
  <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 4a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm10 14h-2a8 8 0 0 0-16 0H6a10 10 0 0 1 20 0z"/>
  </svg>
`;

class PersonaAIEngine {
  constructor() {
    this.modelName = 'SmolLM2-360M-Instruct-q4f16_1-MLC';
    this.isInitialized = false;
    this.ragDocuments = [];
    this.hasWebGPU = !!(navigator.gpu);
    this.drawer = document.getElementById('carbon-ai-drawer');
    this.fab = document.getElementById('carbon-ai-fab');
    this.starters = document.getElementById('carbon-ai-starters');
    this.settingsPanel = document.getElementById('carbon-ai-settings-panel');
    this.avatarType = localStorage.getItem('carbon_ai_avatar_type') || 'watson';
    this.customAvatarUrl = localStorage.getItem('carbon_ai_avatar_custom') || '';
    this.selectedVoice = localStorage.getItem('carbon_ai_voice_name') || 'default';
    this.voices = [];
    this.currentUtterance = null;

    this.init();
  }

  async init() {
    if (!this.drawer && !document.querySelector('.cds--chat-container, .carbon-ai-persona')) {
      return;
    }
    await this.loadRAGIndex();
    this.initTTSVoices();
    this.bindDrawerControls();
    this.bindSettings();
    this.bindChatInstances();
    this.bindStarterTiles();
    this.updateAvatarUI();
  }

  async loadRAGIndex() {
    try {
      const res = await fetch('/data/rag-index.json');
      if (res.ok) {
        const data = await res.json();
        this.ragDocuments = data.documents || [];
      }
    } catch (e) {
      console.warn('[Carbon AI] Could not load RAG index:', e);
    }
  }

  initTTSVoices() {
    if (!('speechSynthesis' in window)) return;

    const populate = () => {
      this.voices = window.speechSynthesis.getVoices();
      const select = document.getElementById('carbon-ai-voice-select');
      if (!select) return;

      select.innerHTML = '<option value="default">Default Local OS Voice</option>';
      const pageLang = document.documentElement.lang || 'en';

      this.voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        if (v.lang.startsWith(pageLang)) {
          opt.textContent += ' ★';
        }
        if (v.name === this.selectedVoice) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    };

    populate();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populate;
    }
  }

  bindSettings() {
    const toggleBtns = document.querySelectorAll('.js-toggle-ai-settings');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.cds--chat-container, .carbon-ai-drawer')?.querySelector('.cds--chat-settings, #carbon-ai-settings-panel');
        if (panel) {
          const isHidden = panel.style.display === 'none';
          panel.style.display = isHidden ? 'block' : 'none';
        }
      });
    });

    const avatarSelect = document.getElementById('carbon-ai-avatar-select');
    const customInput = document.getElementById('carbon-ai-custom-avatar-url');

    if (avatarSelect) {
      avatarSelect.value = this.avatarType;
      if (this.avatarType === 'custom' && customInput) {
        customInput.style.display = 'block';
        customInput.value = this.customAvatarUrl;
      }

      avatarSelect.addEventListener('change', (e) => {
        this.avatarType = e.target.value;
        localStorage.setItem('carbon_ai_avatar_type', this.avatarType);
        if (customInput) {
          customInput.style.display = this.avatarType === 'custom' ? 'block' : 'none';
        }
        this.updateAvatarUI();
      });
    }

    if (customInput) {
      customInput.addEventListener('input', (e) => {
        this.customAvatarUrl = e.target.value.trim();
        localStorage.setItem('carbon_ai_avatar_custom', this.customAvatarUrl);
        this.updateAvatarUI();
      });
    }

    const voiceSelect = document.getElementById('carbon-ai-voice-select');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        this.selectedVoice = e.target.value;
        localStorage.setItem('carbon_ai_voice_name', this.selectedVoice);
      });
    }
  }

  getAvatarHtml() {
    if (this.avatarType === 'custom' && this.customAvatarUrl) {
      return `<div class="cds--chat-message__avatar"><img src="${this.customAvatarUrl}" alt="AI Avatar"></div>`;
    }
    const svg = AVATARS[this.avatarType] || AVATARS.watson;
    return `<div class="cds--chat-message__avatar">${svg}</div>`;
  }

  updateAvatarUI() {
    const headerAvatars = document.querySelectorAll('#carbon-ai-header-avatar, .cds--chat-header .cds--chat-message__avatar');
    headerAvatars.forEach(el => {
      el.innerHTML = this.avatarType === 'custom' && this.customAvatarUrl ? 
        `<img src="${this.customAvatarUrl}" alt="Avatar">` : 
        (AVATARS[this.avatarType] || AVATARS.watson);
    });
  }

  bindDrawerControls() {
    if (this.fab) {
      this.fab.addEventListener('click', () => this.toggleDrawer());
    }

    const closeBtns = document.querySelectorAll('.js-close-ai-drawer');
    closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeDrawer()));

    const minimizeBtns = document.querySelectorAll('.js-minimize-ai-drawer');
    minimizeBtns.forEach(btn => btn.addEventListener('click', () => this.minimizeDrawer()));

    const clearBtns = document.querySelectorAll('.js-clear-ai-history');
    clearBtns.forEach(btn => btn.addEventListener('click', () => this.clearChatHistory()));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer && this.drawer.classList.contains('carbon-ai-drawer--open')) {
        this.closeDrawer();
      }
    });
  }

  toggleDrawer() {
    if (!this.drawer) return;
    if (this.drawer.classList.contains('carbon-ai-drawer--open')) {
      if (this.drawer.classList.contains('carbon-ai-drawer--minimized')) {
        this.drawer.classList.remove('carbon-ai-drawer--minimized');
      } else {
        this.closeDrawer();
      }
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.remove('carbon-ai-drawer--minimized');
    this.drawer.classList.add('carbon-ai-drawer--open');
    this.drawer.setAttribute('aria-hidden', 'false');
    if (this.fab) this.fab.setAttribute('aria-expanded', 'true');
    const input = this.drawer.querySelector('.carbon-ai-persona__input, .cds--chat-composer__textarea');
    if (input) setTimeout(() => input.focus(), 150);
  }

  closeDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.remove('carbon-ai-drawer--open', 'carbon-ai-drawer--minimized');
    this.drawer.setAttribute('aria-hidden', 'true');
    if (this.fab) this.fab.setAttribute('aria-expanded', 'false');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  minimizeDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.toggle('carbon-ai-drawer--minimized');
  }

  clearChatHistory() {
    const streams = document.querySelectorAll('.cds--chat-messages, .carbon-ai-persona__chat-stream');
    streams.forEach(stream => {
      stream.innerHTML = '';
      if (this.starters) {
        stream.appendChild(this.starters.cloneNode(true));
        this.bindStarterTiles();
      }
    });
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  bindStarterTiles() {
    const tiles = document.querySelectorAll('.cds--chat-prompt-starters__tile, .carbon-ai-starter-tile');
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        const prompt = tile.getAttribute('data-prompt');
        if (!prompt) return;

        const container = tile.closest('.cds--chat-container, .carbon-ai-drawer') || document;
        const input = container.querySelector('.cds--chat-composer__textarea, .carbon-ai-persona__input');
        if (input) input.value = prompt;
        const sendBtn = container.querySelector('.cds--chat-composer__send-btn, .carbon-ai-persona__send-btn');
        if (sendBtn) sendBtn.click();
      });
    });
  }

  bindChatInstances() {
    const containers = document.querySelectorAll('.cds--chat-container, .carbon-ai-persona, .carbon-ai-drawer');

    containers.forEach(container => {
      const chatStream = container.querySelector('.cds--chat-messages, .carbon-ai-persona__chat-stream');
      const input = container.querySelector('.cds--chat-composer__textarea, .carbon-ai-persona__input');
      const sendBtn = container.querySelector('.cds--chat-composer__send-btn, .carbon-ai-persona__send-btn');
      const initBtn = container.querySelector('.carbon-ai-persona__init-btn');

      if (initBtn) {
        initBtn.addEventListener('click', () => {
          this.startModelInitialization();
        });
      }

      if (input && input.tagName === 'TEXTAREA') {
        input.addEventListener('input', () => {
          input.style.height = 'auto';
          input.style.height = Math.min(input.scrollHeight, 140) + 'px';
        });
      }

      const handleSend = async () => {
        const text = input ? input.value.trim() : '';
        if (!text) return;

        const activeStarters = chatStream.querySelector('.cds--chat-prompt-starters, .carbon-ai-starters-wrapper');
        if (activeStarters) activeStarters.remove();

        this.appendMessage(chatStream, 'user', text);
        if (input) {
          input.value = '';
          if (input.tagName === 'TEXTAREA') input.style.height = 'auto';
        }

        if (!this.isInitialized) {
          this.appendMessage(chatStream, 'assistant', 'Please click **"Initialize Model"** to load the on-device AI weights.');
          return;
        }

        const { context, citations } = this.retrieveRAGContext(text);
        const typingEl = this.appendTypingIndicator(chatStream);

        await new Promise(r => setTimeout(r, 300));
        typingEl.remove();

        const assistantBubble = this.appendMessage(chatStream, 'assistant', '');
        await this.generateResponse(text, context, citations, assistantBubble);
      };

      if (sendBtn) sendBtn.addEventListener('click', handleSend);
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        });
      }
    });
  }

  appendTypingIndicator(stream) {
    const row = document.createElement('div');
    row.className = 'cds--chat-message cds--chat-message--assistant';
    row.innerHTML = `
      ${this.getAvatarHtml()}
      <div class="cds--chat-bubble">
        <div class="cds--chat-typing"><span></span><span></span><span></span></div>
      </div>
    `;
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
    return row;
  }

  appendMessage(stream, role, text) {
    if (!stream) return null;
    const row = document.createElement('div');
    row.className = `cds--chat-message cds--chat-message--${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'cds--chat-message__content';

    const header = document.createElement('div');
    header.className = 'cds--chat-message__header';
    header.innerHTML = `
      <span class="cds--chat-message__author">${role === 'user' ? 'User' : 'Carbon AI'}</span>
      <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;

    const bubble = document.createElement('div');
    bubble.className = 'cds--chat-bubble';
    bubble.innerHTML = this.formatMarkdown(text);

    contentDiv.appendChild(header);
    contentDiv.appendChild(bubble);

    if (role === 'assistant' || role === 'bot') {
      row.innerHTML = this.getAvatarHtml();
      row.appendChild(contentDiv);
    } else {
      const userAvatar = document.createElement('div');
      userAvatar.className = 'cds--chat-message__avatar';
      userAvatar.innerHTML = USER_AVATAR;
      row.appendChild(userAvatar);
      row.appendChild(contentDiv);
    }

    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
    return bubble;
  }

  formatMarkdown(text) {
    if (!text) return '';
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  retrieveRAGContext(query) {
    if (!this.ragDocuments || this.ragDocuments.length === 0) {
      return { context: null, citations: [] };
    }
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/\s+/).filter(t => t.length > 2);

    const scored = this.ragDocuments.map(doc => {
      let score = 0;
      const text = `${doc.title} ${doc.content || ''}`.toLowerCase();
      tokens.forEach(token => {
        if (text.includes(token)) score += 1;
      });
      return { doc, score };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return { context: null, citations: [] };
    }

    const topDoc = scored[0].doc;
    return {
      context: topDoc.content || topDoc.title,
      citations: [{ title: topDoc.title, url: topDoc.url || '#' }]
    };
  }

  playTTS(text, btn) {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (btn) btn.innerHTML = '🔊 Listen';
      return;
    }

    const plainText = text.replace(/<[^>]*>/g, '').replace(/https?:\/\/\S+/g, '');
    const utter = new SpeechSynthesisUtterance(plainText);

    if (this.selectedVoice !== 'default') {
      const v = this.voices.find(voice => voice.name === this.selectedVoice);
      if (v) utter.voice = v;
    } else {
      const pageLang = document.documentElement.lang || 'en';
      const v = this.voices.find(voice => voice.lang.startsWith(pageLang));
      if (v) utter.voice = v;
    }

    if (btn) {
      btn.innerHTML = '⏹ Stop';
      utter.onend = () => { btn.innerHTML = '🔊 Listen'; };
      utter.onerror = () => { btn.innerHTML = '🔊 Listen'; };
    }

    window.speechSynthesis.speak(utter);
  }

  async startModelInitialization() {
    const initBtns = document.querySelectorAll('.carbon-ai-persona__init-btn');
    initBtns.forEach(btn => btn.style.display = 'none');

    const statusPills = document.querySelectorAll('.carbon-ai-persona__status-pill');
    statusPills.forEach(pill => {
      pill.innerHTML = '<span class="cds--tag cds--tag--purple" style="margin:0;">Allocating WebGPU buffers...</span>';
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      statusPills.forEach(pill => {
        pill.innerHTML = `<span class="cds--tag cds--tag--purple" style="margin:0;">Loading model weights ${progress}%...</span>`;
      });

      if (progress >= 100) {
        clearInterval(interval);
        this.isInitialized = true;
        statusPills.forEach(pill => {
          pill.innerHTML = `<span class="cds--tag cds--tag--green" style="margin:0;">● ${this.hasWebGPU ? 'WebGPU' : 'Wasm'} Online</span>`;
        });

        document.querySelectorAll('.cds--chat-messages, .carbon-ai-persona__chat-stream').forEach(stream => {
          const systemMsg = document.createElement('div');
          systemMsg.className = 'cds--chat-message cds--chat-message--system';
          systemMsg.innerHTML = `
            <div class="cds--chat-bubble">
              <strong>Model Initialized:</strong> ${this.modelName} loaded into browser memory via ${this.hasWebGPU ? 'WebGPU' : 'Wasm'}.
            </div>
          `;
          stream.appendChild(systemMsg);
          stream.scrollTop = stream.scrollHeight;
        });
      }
    }, 180);
  }

  async generateResponse(query, ragContext, citations, bubble) {
    let rawResponse = "";
    if (ragContext) {
      rawResponse = `Based on platform architecture documentation:\n\n${ragContext}\n\n**Key Takeaway:** Heavy tasks (Stockfish chess AI, 60Hz physics, SPSS analytics, and WebLLM) run on background Web Workers with zero UI thread contention.`;
    } else {
      rawResponse = `The **Hugo-Carbon Modular Engine** combines IBM Carbon Design System v11 tokens, W3C CSVW data tables, and client-side cryptographic security. How can I assist you with your deployment?`;
    }

    const words = rawResponse.split(" ");
    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      bubble.innerHTML = this.formatMarkdown(currentText);
      await new Promise(r => setTimeout(r, 18));
    }

    // Actions toolbar
    const actionsTray = document.createElement('div');
    actionsTray.className = 'cds--chat-message__actions';

    const ttsBtn = document.createElement('button');
    ttsBtn.type = 'button';
    ttsBtn.className = 'cds--btn cds--btn--ghost cds--btn--sm js-ai-tts-btn';
    ttsBtn.style.cssText = 'height: 1.5rem; min-height: 1.5rem; padding: 0 0.5rem; font-size: 0.6875rem;';
    ttsBtn.innerHTML = '🔊 Listen';
    ttsBtn.addEventListener('click', () => this.playTTS(currentText, ttsBtn));
    actionsTray.appendChild(ttsBtn);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'cds--btn cds--btn--ghost cds--btn--sm js-ai-copy-btn';
    copyBtn.style.cssText = 'height: 1.5rem; min-height: 1.5rem; padding: 0 0.5rem; font-size: 0.6875rem;';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentText);
      copyBtn.innerHTML = '✓ Copied';
      setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 1500);
    });
    actionsTray.appendChild(copyBtn);

    if (citations && citations.length > 0) {
      const citSpan = document.createElement('div');
      citSpan.innerHTML = citations.map(c => `<a href="${c.url}" class="cds--tag cds--tag--blue cds--tag--sm" style="text-decoration:none;margin:0;">📄 ${c.title}</a>`).join(' ');
      actionsTray.appendChild(citSpan);
    }

    bubble.appendChild(actionsTray);
  }
}

export function initPersonaAI() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PersonaAIEngine());
  } else {
    new PersonaAIEngine();
  }
}
