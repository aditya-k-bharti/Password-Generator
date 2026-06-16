// ============================================
//  PassNova — PasswordGen.js
//  Phase A+B+C+D — Full Updated Script
// ============================================

// ── Wordlist for Passphrase Generator (Phase C) ──
const WORDLIST = [
  "apple","brave","cloud","dance","eagle","flame","grace","happy","ivory","joker",
  "karma","lemon","maple","noble","ocean","pearl","quick","river","stone","tiger",
  "ultra","vivid","witch","xenon","yacht","zebra","amber","blaze","coral","delta",
  "ember","frost","globe","haven","image","jewel","knack","lunar","magic","nexus",
  "olive","pilot","quest","raven","solar","tower","unity","valor","water","extra",
  "yield","zonal","acorn","birch","cedar","daisy","elder","finch","grain","hazel",
  "indie","jumbo","kitty","lilac","mango","ninja","orbit","panic","quill","razor",
  "sugar","thorn","umbra","viola","waltz","xenix","yukon","zippy","agile","bloom",
  "crisp","drift","elite","forge","glade","honey","index","jolly","kings","lance",
  "marsh","night","oasis","prism","quake","ridge","storm","trace","upset","voice",
  "windy","exact","young","zesty","atlas","brush","candy","dingo","epoch","field",
  "gamma","hertz","input","judge","kneel","layer","minor","north","optic","plaza",
  "query","relay","spike","trout","ultra","venom","wheat","xenon","yards","zones"
];

// ── Password Generator Class ──
class PasswordGenerator {
  constructor(options = {}) {
    this.length            = options.length            || 12;
    this.includeUppercase  = options.includeUppercase  !== false;
    this.includeLowercase  = options.includeLowercase  !== false;
    this.includeNumbers    = options.includeNumbers    !== false;
    this.includeSymbols    = options.includeSymbols    !== false;

    this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
    this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.numbers   = '0123456789';
    this.symbols   = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  updateOptions(options) {
    Object.assign(this, options);
  }

  getCharacterSet() {
    let charset = '';
    if (this.includeLowercase) charset += this.lowercase;
    if (this.includeUppercase) charset += this.uppercase;
    if (this.includeNumbers)   charset += this.numbers;
    if (this.includeSymbols)   charset += this.symbols;
    return charset;
  }

  generate() {
    const charset = this.getCharacterSet();
    if (!charset) throw new Error('At least one character type must be selected');

    let password = '';

    // Guarantee at least one char from each enabled type
    if (this.includeLowercase) password += this.getRandomChar(this.lowercase);
    if (this.includeUppercase) password += this.getRandomChar(this.uppercase);
    if (this.includeNumbers)   password += this.getRandomChar(this.numbers);
    if (this.includeSymbols)   password += this.getRandomChar(this.symbols);

    // Fill remaining length
    while (password.length < this.length) {
      password += this.getRandomChar(charset);
    }

    return this.shuffleString(password);
  }

  // Phase B: crypto.getRandomValues() — cryptographically secure
  getRandomChar(str) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return str[buf[0] % str.length];
  }

  // Phase B: Fisher-Yates shuffle with crypto.getRandomValues()
  shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      const j = buf[0] % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  // ── Strength Calculator ──
  calculateStrength(password) {
    let score = 0;

    if      (password.length >= 16) score += 30;
    else if (password.length >= 12) score += 22;
    else if (password.length >= 8)  score += 14;
    else if (password.length >= 6)  score += 8;
    else                             score += 4;

    if (/[a-z]/.test(password))      score += 15;
    if (/[A-Z]/.test(password))      score += 15;
    if (/[0-9]/.test(password))      score += 18;
    if (/[^A-Za-z0-9]/.test(password)) score += 22;

    score = Math.min(score, 100);

    if      (score >= 80) return { score, feedback: 'Very Strong', label: 'very-strong', color: '#10b981' };
    else if (score >= 60) return { score, feedback: 'Strong',      label: 'strong',      color: '#3b82f6' };
    else if (score >= 40) return { score, feedback: 'Medium',      label: 'medium',      color: '#f59e0b' };
    else if (score >= 20) return { score, feedback: 'Weak',        label: 'weak',        color: '#ef4444' };
    else                  return { score, feedback: 'Very Weak',   label: 'very-weak',   color: '#dc2626' };
  }

  // ── Phase C: Entropy & Crack Time ──
  calculateEntropy(password) {
    let charsetSize = 0;
    if (/[a-z]/.test(password))          charsetSize += 26;
    if (/[A-Z]/.test(password))          charsetSize += 26;
    if (/[0-9]/.test(password))          charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password))   charsetSize += 32;

    if (charsetSize === 0) return { bits: 0, crackTime: 'N/A', charsetSize: 0 };

    const bits = Math.floor(password.length * Math.log2(charsetSize));

    // Estimate crack time at 10 billion guesses/second (modern GPU)
    const guessesPerSecond = 1e10;
    const combinations = Math.pow(charsetSize, password.length);
    const seconds = combinations / guessesPerSecond;

    return {
      bits,
      crackTime: this.formatCrackTime(seconds),
      charsetSize
    };
  }

  formatCrackTime(seconds) {
    if      (seconds < 1)           return '< 1 sec';
    else if (seconds < 60)          return `${Math.round(seconds)} secs`;
    else if (seconds < 3600)        return `${Math.round(seconds / 60)} mins`;
    else if (seconds < 86400)       return `${Math.round(seconds / 3600)} hrs`;
    else if (seconds < 2592000)     return `${Math.round(seconds / 86400)} days`;
    else if (seconds < 31536000)    return `${Math.round(seconds / 2592000)} months`;
    else if (seconds < 3.15e9)      return `${Math.round(seconds / 31536000)} years`;
    else if (seconds < 3.15e12)     return `${(seconds / 3.15e9).toFixed(1)}K years`;
    else if (seconds < 3.15e15)     return `${(seconds / 3.15e12).toFixed(1)}M years`;
    else                            return '∞ (centuries)';
  }
}

// ── Toast Manager (Phase B: no innerHTML) ──
class ToastManager {
  constructor() {
    this.container = this._createContainer();
    this.toasts    = new Map();
    this.toastId   = 0;
  }

  _createContainer() {
    const el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
  }

  show(message, type = 'info', options = {}) {
    const id    = ++this.toastId;
    const toast = this._createToast(message, type, id, options);

    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    const duration = options.duration || 3500;
    if (duration > 0) {
      const bar = toast.querySelector('.toast-progress');
      if (bar) {
        bar.style.animationDuration = `${duration}ms`;
      }
      setTimeout(() => this.hide(id), duration);
    }

    return id;
  }

  _createToast(message, type, id, options = {}) {
    const icons  = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

    // All DOM creation — no innerHTML (XSS safe, Phase B)
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.toastId = id;

    const iconEl = document.createElement('div');
    iconEl.className = 'toast-icon';
    iconEl.textContent = icons[type] || icons.info;

    const contentEl = document.createElement('div');
    contentEl.className = 'toast-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = options.title || titles[type] || 'Info';

    const msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;

    contentEl.appendChild(titleEl);
    contentEl.appendChild(msgEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.hide(id); });

    const bar = document.createElement('div');
    bar.className = 'toast-progress';

    toast.appendChild(iconEl);
    toast.appendChild(contentEl);
    toast.appendChild(closeBtn);
    toast.appendChild(bar);

    toast.addEventListener('click', () => this.hide(id));

    return toast;
  }

  hide(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;
    toast.classList.add('hide');
    setTimeout(() => {
      toast.parentNode?.removeChild(toast);
      this.toasts.delete(id);
    }, 300);
  }

  success(msg, opts = {}) { return this.show(msg, 'success', opts); }
  error(msg, opts = {})   { return this.show(msg, 'error',   opts); }
  warning(msg, opts = {}) { return this.show(msg, 'warning', opts); }
  info(msg, opts = {})    { return this.show(msg, 'info',    opts); }
}

// ── Password History Manager (Phase C) ──
class HistoryManager {
  constructor(maxItems = 8) {
    this.maxItems = maxItems;
    this.items    = []; // sessionStorage only — clears on tab close (safer)
    this._load();
  }

  _load() {
    try {
      const raw = sessionStorage.getItem('passnova_history');
      this.items = raw ? JSON.parse(raw) : [];
    } catch {
      this.items = [];
    }
  }

  _save() {
    try { sessionStorage.setItem('passnova_history', JSON.stringify(this.items)); } catch {}
  }

  add(password, type = 'password') {
    this.items.unshift({ pw: password, type, time: Date.now() });
    if (this.items.length > this.maxItems) this.items.pop();
    this._save();
  }

  clear() {
    this.items = [];
    sessionStorage.removeItem('passnova_history');
  }

  getAll() { return [...this.items]; }
}

// ── Presets Config (Phase C) ──
const PRESETS = {
  banking: {
    label: 'Banking',
    length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
    expiry: '60 days'
  },
  social: {
    label: 'Social Media',
    length: 14, uppercase: true, lowercase: true, numbers: true, symbols: false,
    expiry: '90 days'
  },
  gaming: {
    label: 'Gaming',
    length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false,
    expiry: '180 days'
  },
  developer: {
    label: 'Developer',
    length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true,
    expiry: '90 days'
  },
  pin: {
    label: 'PIN',
    length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false,
    expiry: '30 days'
  },
  secure: {
    label: 'High Security',
    length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true,
    expiry: '60 days'
  }
};

// ── Main UI Controller ──
class PasswordGeneratorUI {
  constructor() {
    this.generator   = new PasswordGenerator();
    this.toastMgr    = new ToastManager();
    this.historyMgr  = new HistoryManager();
    this.activePreset = null;
    this.isVisible    = false;
    this.currentTab   = 'password';

    this._initElements();
    this._bindEvents();
    this._updateLengthDisplay();
    this._renderHistory();
    this._applyTheme(this._getSavedTheme());

    setTimeout(() => {
      this.toastMgr.info('Click Generate Password to get started.', {
        title: '🔐 PassNova Ready',
        duration: 3000
      });
    }, 800);
  }

  // ── Element References ──
  _initElements() {
    // Password panel
    this.passwordField   = document.getElementById('password');
    this.strengthFill    = document.getElementById('strengthFill');
    this.strengthText    = document.getElementById('strengthText');
    this.entropyValue    = document.getElementById('entropyValue');
    this.crackTime       = document.getElementById('crackTime');
    this.charsetSizeEl   = document.getElementById('charsetSize');
    this.lengthSlider    = document.getElementById('lengthSlider');
    this.lengthValue     = document.getElementById('lengthValue');
    this.uppercaseCb     = document.getElementById('uppercase');
    this.lowercaseCb     = document.getElementById('lowercase');
    this.numbersCb       = document.getElementById('numbers');
    this.symbolsCb       = document.getElementById('symbols');
    this.generateBtn     = document.getElementById('generateBtn');
    this.copyBtn         = document.getElementById('copyBtn');
    this.copyIcon        = this.copyBtn.querySelector('.copy-icon');
    this.copyImage       = document.getElementById('copyImage');
    this.visibilityBtn   = document.getElementById('visibilityBtn');
    this.visibilityIcon  = document.getElementById('visibilityIcon');

    // Shared
    this.themeToggle    = document.getElementById('themeToggle');
    this.themeIcon      = document.getElementById('themeIcon');
    this.historyList    = document.getElementById('historyList');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.tabPassword    = document.getElementById('tabPassword');
    this.panelPassword  = document.getElementById('panelPassword');

    // Mobile bar
    this.mobileGenerateBtn = document.getElementById('mobileGenerateBtn');
    this.mobileCopyBtn     = document.getElementById('mobileCopyBtn');
    this.mobileThemeBtn    = document.getElementById('mobileThemeBtn');
  }

  // ── Event Bindings ──
  _bindEvents() {
    // Length slider
    this.lengthSlider.addEventListener('input', () => {
      this._updateLengthDisplay();
      this._updateGeneratorOptions();
      this.activePreset = null;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    });

    // Checkboxes
    [this.uppercaseCb, this.lowercaseCb, this.numbersCb, this.symbolsCb].forEach(cb => {
      cb.addEventListener('change', () => {
        this._updateGeneratorOptions();
        this._validateCheckboxes();
        this.activePreset = null;
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      });
    });

    // Generate button
    this.generateBtn.addEventListener('click', () => this._generatePassword());

    // Copy button
    this.copyBtn.addEventListener('click', () => this._copyToClipboard(this.passwordField));

    // Visibility toggle (Phase D)
    this.visibilityBtn.addEventListener('click', () => this._toggleVisibility());

    // Password field click on mobile
    this.passwordField.addEventListener('click', () => {
      if (this.passwordField.value.trim()) this._copyToClipboard(this.passwordField);
    });

    // Presets (Phase C)
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => this._applyPreset(btn.dataset.preset));
    });

    // History clear
    this.clearHistoryBtn.addEventListener('click', () => {
      this.historyMgr.clear();
      this._renderHistory();
      this.toastMgr.info('History cleared.', { title: 'Cleared', duration: 2000 });
    });

    // Theme toggle (Phase D)
    this.themeToggle.addEventListener('click', () => this._toggleTheme());

    // Mobile bar (Phase D)
    this.mobileGenerateBtn.addEventListener('click', () => {
      if (this.currentTab === 'password') this._generatePassword();
      else this._generatePassphrase();
    });
    this.mobileCopyBtn.addEventListener('click', () => {
      const field = this.currentTab === 'password' ? this.passwordField : this.passphraseField;
      this._copyToClipboard(field);
    });
    this.mobileThemeBtn.addEventListener('click', () => this._toggleTheme());

    // Keyboard shortcuts (Phase D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        if (this.currentTab === 'password') this._generatePassword();
        else this._generatePassphrase();
      }
      if (e.ctrlKey && e.key === 'c' && document.activeElement !== this.passwordField) {
        const field = this.currentTab === 'password' ? this.passwordField : this.passphraseField;
        if (field.value.trim()) {
          e.preventDefault();
          this._copyToClipboard(field);
        }
      }
    });
  }

  // ── Length Display ──
  _updateLengthDisplay() {
    const val = this.lengthSlider.value;
    this.lengthValue.textContent = val;
    const pct = ((val - this.lengthSlider.min) / (this.lengthSlider.max - this.lengthSlider.min)) * 100;
    this.lengthSlider.style.background =
      `linear-gradient(to right, #4facfe 0%, #00f2fe ${pct}%, rgba(255,255,255,0.2) ${pct}%, rgba(255,255,255,0.2) 100%)`;
  }

  // ── Generator Options ──
  _updateGeneratorOptions() {
    this.generator.updateOptions({
      length:           parseInt(this.lengthSlider.value),
      includeUppercase: this.uppercaseCb.checked,
      includeLowercase: this.lowercaseCb.checked,
      includeNumbers:   this.numbersCb.checked,
      includeSymbols:   this.symbolsCb.checked
    });
  }

  _validateCheckboxes() {
    const cbs = [this.uppercaseCb, this.lowercaseCb, this.numbersCb, this.symbolsCb];
    if (cbs.every(cb => !cb.checked)) {
      this.lowercaseCb.checked = true;
      this._updateGeneratorOptions();
      this.toastMgr.warning('At least one character type must be selected. Lowercase re-enabled.', {
        title: 'Selection Required', duration: 3000
      });
    }
  }

  // ── Apply Preset (Phase C) ──
  _applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    this.activePreset = presetKey;

    // Update slider and checkboxes
    this.lengthSlider.value  = preset.length;
    this.uppercaseCb.checked = preset.uppercase;
    this.lowercaseCb.checked = preset.lowercase;
    this.numbersCb.checked   = preset.numbers;
    this.symbolsCb.checked   = preset.symbols;

    this._updateLengthDisplay();
    this._updateGeneratorOptions();

    // Highlight active preset button
    document.querySelectorAll('.preset-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.preset === presetKey);
    });

    this.toastMgr.info(
      `${preset.label} preset applied. Recommended change every ${preset.expiry}.`,
      { title: `Preset: ${preset.label}`, duration: 3000 }
    );

    // Auto-generate with preset
    this._generatePassword();
  }

  // ── Generate Password ──
  _generatePassword() {
    try {
      this._updateGeneratorOptions();
      const password = this.generator.generate();

      this._animateBtn(this.generateBtn, 'Generating...', () => {
        this.passwordField.setAttribute('type', 'text');
        this.isVisible = true;
        this._updateVisibilityIcon();
        this.passwordField.value = password;
        this._updateStrengthIndicator(password, this.strengthFill, this.strengthText);
        this._updateEntropyDisplay(password);
        this.historyMgr.add(password, 'password');
        this._renderHistory();

        const strength = this.generator.calculateStrength(password);
        this.toastMgr.success(
          `${strength.feedback} password generated! (${password.length} chars)`,
          { title: '🎉 Password Ready', duration: 2000 }
        );
      });
    } catch (err) {
      this.passwordField.value = '';
      this.strengthText.textContent = 'Error';
      this.strengthFill.style.width = '0%';
      this.toastMgr.error('Failed to generate password. Check your settings.', {
        title: 'Error', duration: 3000
      });
    }
  }

  // ── Strength Indicator ──
  _updateStrengthIndicator(password, fillEl, textEl) {
    const strength = this.generator.calculateStrength(password);
    fillEl.style.width      = '0%';
    fillEl.style.background = strength.color;
    setTimeout(() => {
      fillEl.style.width    = `${strength.score}%`;
      textEl.textContent    = strength.feedback;
      textEl.style.color    = strength.color;
    }, 80);
  }

  // ── Password Visibility Toggle (Phase D) ──
  _toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.passwordField.setAttribute('type', this.isVisible ? 'text' : 'password');
    this._updateVisibilityIcon();
  }

  _updateVisibilityIcon() {
    this.visibilityIcon.className = this.isVisible ? 'bi bi-eye-slash' : 'bi bi-eye';
    this.visibilityBtn.title = this.isVisible ? 'Hide password' : 'Show password';
  }

  // ── Copy to Clipboard ──
  async _copyToClipboard(inputEl) {
    const value = inputEl.value.trim();
    if (!value) {
      this.toastMgr.error('Nothing to copy. Generate a password first.', {
        title: 'Nothing to Copy', duration: 2000
      });
      return;
    }

    // Determine which copy button to animate
    const btnEl = inputEl === this.passwordField ? this.copyBtn : this.copyPassphraseBtn;

    try {
      await navigator.clipboard.writeText(value);
      this._showCopySuccess(btnEl, inputEl === this.passwordField ? this.copyIcon : btnEl.querySelector('.copy-icon'));
      this.toastMgr.success('Password copied to clipboard!', { title: '📋 Copied', duration: 2000 });
    } catch {
      this._fallbackCopy(value, btnEl, inputEl === this.passwordField ? this.copyIcon : btnEl.querySelector('.copy-icon'));
    }
  }

  // Phase D: copy animation — checkmark pulse
  _showCopySuccess(btn, iconSpan) {
    const imgEl = iconSpan.querySelector('img');
    const origSrc = imgEl ? imgEl.src : '';
    const origAlt = imgEl ? imgEl.alt : '';

    btn.classList.add('copied');
    iconSpan.textContent = '✅';
    btn.title = 'Copied!';

    setTimeout(() => {
      btn.classList.remove('copied');
      iconSpan.textContent = '';
      const newImg = document.createElement('img');
      newImg.src = origSrc;
      newImg.alt = origAlt;
      if (btn === this.copyBtn) newImg.id = 'copyImage';
      else newImg.id = 'copyImagePassphrase';
      iconSpan.appendChild(newImg);

      // Re-reference
      this.copyImage = document.getElementById('copyImage');
      this.copyImagePassphrase = document.getElementById('copyImagePassphrase');
      btn.title = 'Copy to clipboard';
    }, 1600);
  }

  _fallbackCopy(text, btn, iconSpan) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-99999px;top:-99999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      this._showCopySuccess(btn, iconSpan);
      this.toastMgr.success('Password copied!', { title: '📋 Copied', duration: 2000 });
    } catch {
      this.toastMgr.error('Copy failed. Please select and copy manually.', {
        title: 'Copy Failed', duration: 3000
      });
    }
    document.body.removeChild(ta);
  }

  // ── Button Animation ──
  _animateBtn(btn, loadingText, callback) {
    const textEl = btn.querySelector('.btn-text');
    const orig   = textEl.textContent;
    textEl.textContent = loadingText;
    btn.style.transform = 'scale(0.97)';
    btn.disabled = true;
    setTimeout(() => {
      callback();
      textEl.textContent  = orig;
      btn.style.transform = 'scale(1)';
      btn.disabled = false;
    }, 280);
  }

  // ── History Render (Phase C) ──
  _renderHistory() {
    const items = this.historyMgr.getAll();
    this.historyList.textContent = '';

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'history-empty';
      empty.textContent = 'No passwords generated yet.';
      this.historyList.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';

      const pwEl = document.createElement('span');
      pwEl.className = 'history-pw';
      pwEl.textContent = item.pw;
      pwEl.title = item.pw;

      const metaEl = document.createElement('span');
      metaEl.className = 'history-meta';
      const mins = Math.floor((Date.now() - item.time) / 60000);
      metaEl.textContent = mins < 1 ? 'just now' : `${mins}m ago`;

      const copyEl = document.createElement('button');
      copyEl.className = 'history-copy-btn';
      copyEl.title = 'Copy this password';
      copyEl.setAttribute('aria-label', `Copy password: ${item.pw}`);
      const icon = document.createElement('i');
      icon.className = 'bi bi-clipboard';
      copyEl.appendChild(icon);
      copyEl.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(item.pw);
          icon.className = 'bi bi-clipboard-check';
          this.toastMgr.success('Copied from history!', { title: '📋 Copied', duration: 1500 });
          setTimeout(() => { icon.className = 'bi bi-clipboard'; }, 1500);
        } catch {
          this.toastMgr.error('Copy failed.', { duration: 2000 });
        }
      });

      row.appendChild(pwEl);
      row.appendChild(metaEl);
      row.appendChild(copyEl);
      this.historyList.appendChild(row);
    });
  }

  // ── Theme (Phase D) ──
  _getSavedTheme() {
    return localStorage.getItem('passnova_theme') || 'dark';
  }

  _applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.themeIcon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    this.themeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    localStorage.setItem('passnova_theme', theme);
  }

  _toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    this._applyTheme(next);
    this.toastMgr.info(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated.`, {
      title: 'Theme Changed', duration: 2000
    });
  }
}

// ── PWA: Service Worker + Install Prompt (Phase E) ──
class PWAManager {
  constructor(toastMgr) {
    this.toastMgr     = toastMgr;
    this.deferredPrompt = null;
    this._registerSW();
    this._listenInstallPrompt();
    this._handleShortcuts();
  }

  _registerSW() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported in this browser.');
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered. Scope:', registration.scope);

          // Listen for a new SW waiting to activate (update available)
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              // New SW installed and an old one is active = update available
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available.');
                this._showUpdateToast(registration);
              }
            });
          });
        })
        .catch(err => console.warn('[PWA] SW registration failed:', err));

      // Detect when SW has taken control (first install)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker now controlling the page.');
      });
    });
  }

  _listenInstallPrompt() {
    // Capture the browser's install prompt — show it ourselves at right moment
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[PWA] Install prompt captured.');
      this._showInstallToast();
    });

    // App successfully installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      console.log('[PWA] PassNova installed as PWA!');
      this.toastMgr.success(
        'PassNova installed! Open it from your home screen anytime.',
        { title: '🎉 App Installed', duration: 4000 }
      );
    });
  }

  _showInstallToast() {
    // Small delay so user sees the app first
    setTimeout(() => {
      // Create a custom install banner instead of auto-prompting
      const banner = document.createElement('div');
      banner.id = 'installBanner';
      banner.setAttribute('role', 'banner');
      banner.setAttribute('aria-label', 'Install PassNova app');

      const text = document.createElement('span');
      text.className = 'install-banner-text';
      text.textContent = '📲 Install PassNova as an app for offline access!';

      const installBtn = document.createElement('button');
      installBtn.className = 'install-banner-btn';
      installBtn.textContent = 'Install';
      installBtn.addEventListener('click', () => this.promptInstall());

      const dismissBtn = document.createElement('button');
      dismissBtn.className = 'install-banner-dismiss';
      dismissBtn.textContent = '✕';
      dismissBtn.setAttribute('aria-label', 'Dismiss install prompt');
      dismissBtn.addEventListener('click', () => this._dismissBanner());

      banner.appendChild(text);
      banner.appendChild(installBtn);
      banner.appendChild(dismissBtn);
      document.body.appendChild(banner);

      // Animate in
      requestAnimationFrame(() => banner.classList.add('show'));
    }, 3000);
  }

  async promptInstall() {
    if (!this.deferredPrompt) return;
    this._dismissBanner();
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log('[PWA] Install prompt outcome:', outcome);
    if (outcome === 'accepted') {
      this.toastMgr.success('Installing PassNova...', { title: 'Installing', duration: 2000 });
    } else {
      this.toastMgr.info('You can install PassNova anytime from your browser menu.', {
        title: 'Install Later', duration: 3000
      });
    }
    this.deferredPrompt = null;
  }

  _dismissBanner() {
    const banner = document.getElementById('installBanner');
    if (!banner) return;
    banner.classList.remove('show');
    setTimeout(() => banner.parentNode?.removeChild(banner), 400);
  }

  _showUpdateToast(registration) {
    // Show a persistent toast with a "Reload" button
    const id = this.toastMgr.info(
      'A new version of PassNova is ready.',
      { title: '🔄 Update Available', duration: 0 } // duration: 0 = no auto-dismiss
    );

    // Find the toast and inject a reload button
    setTimeout(() => {
      const toastEl = document.querySelector(`.toast[data-toast-id="${id}"]`);
      if (!toastEl) return;

      const reloadBtn = document.createElement('button');
      reloadBtn.className = 'toast-reload-btn';
      reloadBtn.textContent = 'Reload';
      reloadBtn.addEventListener('click', () => {
        // Tell waiting SW to activate
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });

      const contentEl = toastEl.querySelector('.toast-content');
      if (contentEl) contentEl.appendChild(reloadBtn);
    }, 100);
  }

  // ── Handle URL shortcuts from manifest (Phase E) ──
  _handleShortcuts() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (!action) return;

    // Wait for app to initialise, then trigger shortcut action
    setTimeout(() => {
      if (action === 'generate' && window.app) {
        window.app._generatePassword();
      } else if (action === 'passphrase' && window.app) {
        window.app._switchTab('passphrase');
        window.app._generatePassphrase();
      }
    }, 600);
  }
}

// ── Bootstrap App ──
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PasswordGeneratorUI();
  window.pwa = new PWAManager(window.app.toastMgr);
  console.log('🔐 PassNova loaded — Phase A+B+C+D+E');
});