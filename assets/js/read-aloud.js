/**
 * Zero-Dependency In-Browser Read-Aloud Engine
 * Uses native window.speechSynthesis API to vocalise content using local OS speech voices.
 * Zero external audio network requests. WCAG 2.2 AA compliant.
 */

class ReadAloudEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.voices = [];
    this.targetSelector = '.carbon-prose';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.selectedVoice = null;
    
    this.init();
  }

  init() {
    if (!('speechSynthesis' in window)) {
      document.querySelectorAll('.carbon-read-aloud').forEach(el => {
        el.style.display = 'none';
      });
      return;
    }

    this.populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.populateVoices();
    }

    this.bindDOM();
  }

  populateVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    const voiceSelects = document.querySelectorAll('.carbon-read-aloud__voice-select');
    
    voiceSelects.forEach(select => {
      select.innerHTML = '';
      this.voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — Default' : ''}`;
        option.value = index;
        if (voice.default) option.selected = true;
        select.appendChild(option);
      });
    });
  }

  bindDOM() {
    document.querySelectorAll('.carbon-read-aloud').forEach(container => {
      const playBtn = container.querySelector('.carbon-read-aloud__play-btn');
      const stopBtn = container.querySelector('.carbon-read-aloud__stop-btn');
      const rateInput = container.querySelector('.carbon-read-aloud__rate-input');
      const rateLabel = container.querySelector('.carbon-read-aloud__rate-label');
      const voiceSelect = container.querySelector('.carbon-read-aloud__voice-select');
      const statusTag = container.querySelector('.carbon-read-aloud__status');

      if (playBtn) {
        playBtn.addEventListener('click', () => {
          if (!this.isPlaying) {
            this.startSpeaking(container, statusTag, playBtn);
          } else if (this.isPaused) {
            this.resumeSpeaking(statusTag, playBtn);
          } else {
            this.pauseSpeaking(statusTag, playBtn);
          }
        });
      }

      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          this.stopSpeaking(statusTag, playBtn);
        });
      }

      if (rateInput) {
        rateInput.addEventListener('input', (e) => {
          this.rate = parseFloat(e.target.value);
          if (rateLabel) rateLabel.textContent = `${this.rate.toFixed(2)}x`;
          if (this.isPlaying && !this.isPaused) {
            // Restart with new rate
            this.synth.cancel();
            this.startSpeaking(container, statusTag, playBtn);
          }
        });
      }

      if (voiceSelect) {
        voiceSelect.addEventListener('change', (e) => {
          this.selectedVoice = this.voices[parseInt(e.target.value, 10)] || null;
        });
      }
    });
  }

  getArticleText(container) {
    const customTarget = container.getAttribute('data-target');
    const targetEl = customTarget ? document.querySelector(customTarget) : document.querySelector(this.targetSelector);
    if (!targetEl) return '';
    return targetEl.innerText || targetEl.textContent || '';
  }

  startSpeaking(container, statusTag, playBtn) {
    const text = this.getArticleText(container);
    if (!text.trim()) return;

    this.synth.cancel(); // Stop any pending utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = this.rate;
    this.utterance.pitch = this.pitch;
    
    if (this.selectedVoice) {
      this.utterance.voice = this.selectedVoice;
    }

    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (statusTag) {
        statusTag.textContent = 'Speaking...';
        statusTag.className = 'cds--tag cds--tag--green carbon-read-aloud__status';
      }
      if (playBtn) {
        playBtn.setAttribute('aria-label', 'Pause audio reading');
        const icon = playBtn.querySelector('.carbon-read-aloud__btn-icon');
        if (icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
        const textSpan = playBtn.querySelector('.carbon-read-aloud__btn-text');
        if (textSpan) textSpan.textContent = 'Pause';
      }
    };

    this.utterance.onend = () => {
      this.resetState(statusTag, playBtn);
    };

    this.utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.resetState(statusTag, playBtn);
    };

    this.synth.speak(this.utterance);
  }

  pauseSpeaking(statusTag, playBtn) {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPaused = true;
      if (statusTag) {
        statusTag.textContent = 'Paused';
        statusTag.className = 'cds--tag cds--tag--purple carbon-read-aloud__status';
      }
      if (playBtn) {
        playBtn.setAttribute('aria-label', 'Resume audio reading');
        const icon = playBtn.querySelector('.carbon-read-aloud__btn-icon');
        if (icon) icon.innerHTML = '<path d="M7 4v16l13-8z" fill="currentColor"/>';
        const textSpan = playBtn.querySelector('.carbon-read-aloud__btn-text');
        if (textSpan) textSpan.textContent = 'Resume';
      }
    }
  }

  resumeSpeaking(statusTag, playBtn) {
    if (this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
      if (statusTag) {
        statusTag.textContent = 'Speaking...';
        statusTag.className = 'cds--tag cds--tag--green carbon-read-aloud__status';
      }
      if (playBtn) {
        playBtn.setAttribute('aria-label', 'Pause audio reading');
        const icon = playBtn.querySelector('.carbon-read-aloud__btn-icon');
        if (icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
        const textSpan = playBtn.querySelector('.carbon-read-aloud__btn-text');
        if (textSpan) textSpan.textContent = 'Pause';
      }
    }
  }

  stopSpeaking(statusTag, playBtn) {
    this.synth.cancel();
    this.resetState(statusTag, playBtn);
  }

  resetState(statusTag, playBtn) {
    this.isPlaying = false;
    this.isPaused = false;
    if (statusTag) {
      statusTag.textContent = 'Ready';
      statusTag.className = 'cds--tag cds--tag--blue carbon-read-aloud__status';
    }
    if (playBtn) {
      playBtn.setAttribute('aria-label', 'Read article aloud');
      const icon = playBtn.querySelector('.carbon-read-aloud__btn-icon');
      if (icon) icon.innerHTML = '<path d="M7 4v16l13-8z" fill="currentColor"/>';
      const textSpan = playBtn.querySelector('.carbon-read-aloud__btn-text');
      if (textSpan) textSpan.textContent = 'Read Aloud';
    }
  }
}

export function initReadAloud() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ReadAloudEngine());
  } else {
    new ReadAloudEngine();
  }
}
