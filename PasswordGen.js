// Enhanced Password Generator Class

class PasswordGenerator{
  constructor(options = {}){
    this.length = options.length || 12;
    this.includeUppercase = options.includeUppercase !== false;
    this.includeLowercase = options.includeLowercase !== false;
    this.includeNumbers = options.includeNumbers !== false;
    this.includeSymbols = options.includeSymbols !== false;

    this.lowercase = "abcdefghijklmnopqrstuvwxyz";
    this.uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.numbers = "0123456789";
    this.symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }

  updateOptions(options){
    Object.assign(this, options);
  }

  getCharacterSet(){
    let charset = "";
    if(this.includeLowercase){
      charset += this.lowercase;
    }

    if(this.includeUppercase){
      charset += this.uppercase;
    }

    if(this.includeNumbers){
      charset += this.numbers;
    }

    if(this.includeSymbols){
      charset += this.symbols
    }

    return charset;
  }

  generate(){
    const charset = this.getCharacterSet();

    if(!charset){
      throw new Error("At least one character type must be selected");
    }

    let password ="";

    // Ensure at least one character from each selected type 

    if(this.includeLowercase && this.length >0){
      password += this.getRandomChar(this.lowercase);
    }

    if(this.includeUppercase && this.length >1){
      password += this.getRandomChar(this.uppercase);
    }

    if(this.includeNumbers && this.length >2){
      password += this.getRandomChar(this.numbers);
    }

    if(this.includeSymbols && this.length >3){
      password += this.getRandomChar(this.symbols);
    }

    // Fill remaining length with ramdom characters from full charset 
    while(password.length < this.length){
      password += this.getRandomChar(charset);
    }

    // Shuffle the password for better randomness

    return this.shuffleString(password);
  }

  getRandomChar(str){
    return str[Math.floor(Math.random() * str.length)];
  }

  shuffleString(str){
    return str.split('').sort(()=> Math.random() - 0.5).join('');
  }

  calculateStrength(password){
    let scores = 0;
    let feedback = "";

    // Length scoring

    if(password.length >= 12){
      scores += 25;
    } else if(password.length >= 8){
      scores += 15;
    } else if(password.length >= 6){
      scores += 10;
    }
    else{
      scores += 5;
    }

    // Character variety scoring

    if(/[a-z]/.test(password)){
      scores += 15;
    }
    if(/[A-Z]/.test(password)){
      scores += 15;
    }
    if(/[0-9]/.test(password)){
      scores += 20;
    }
    if(/[^A-Za-z0-9]/.test(password)){
      scores += 20;
    }

    // Bonus fore length 

    if(password.length >=16){
      scores += 10;
    }

    // Determine strength level
    if(scores >= 80){
      feedback = "Very Strong";
      return {
        scores,
        feedback, 
        label: "very-strong",
        color: "#10b981"
      };
    } else if(scores >=60){
      feedback = "Strong";
      return {
        scores,
        feedback,
        label: "strong",
        color: "#3b82f6"
      }
    } else if(scores >=40){
      feedback = "Medium";
      return {
        scores,
        feedback,
        label: "medium",
        color: "#f59e0b"
      }
    } else if(scores >=20){
      feedback = "Weak";
      return {
        scores,
        feedback,
        label: "weak",
        color: "#ef4444"
      }
    } else{
      feedback = "Very Weak";
      return {
        scores,
        feedback,
        label: "very-weak",
        color: "#dc2626"
      };
    }
  }
}

// Toast Notification System 

class ToastManager{
  constructor(){
    this.container = this.createContainer();
    this.toasts = new Map();
    this.toastId = 0;
  }

  createContainer(){
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', options = {}){
    const id = ++this.toastId;
    const toast = this.createToast(message, type, id, options);

    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Trigger animation 
    requestAnimationFrame(()=>{
      toast.classList.add('show');
    });

    // Auto remove after duration 

    const duration = options.duration || 4000;
    if(duration > 0){
      const progressBar = toast.querySelector('.toast-progress');
      if(progressBar){
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = `${duration}ms`;
      }
      setTimeout(()=>{
        progressBar.style.width = '0%';
      }, 100);

      setTimeout(()=>{
        this.hide(id);
      }, duration);
    }

    return id;
  }

  createToast(message, type, options = {}, id){
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.toastId = id;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${options.title || titles[type] || titles.info}</div>
        <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="toastManager.hide(${id})">×</button>
      <div class="toast-progress"></div>
    `;

    // Click to dismiss 

    toast.addEventListener('click', (e)=>{
      if(!e.target.classList.contains('toast-close')){
        this.hide(id);
      }
    });

    return toast;
  }

  hide(id){
    const toast = this.toasts.get(id);
    if(!toast){
      return;
    }

    toast.classList.add('hide');

    setTimeout(()=>{
      if(toast.parentNode){
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 300);
  }

  success(message, options ={}){
    return this.show(message, 'success', options);
  }

  error(message, options = {}){
    return this.show(message, 'error', options);
  }

  warning(message, options = {}){
    return this.show(message, 'warning', options);
  }

  info(message, options = {}){
    return this.show(message, 'info', options);
  }
}

// UI Contoller Class 

class PasswordGeneratorUI{
  constructor(){
    this.generator = new PasswordGenerator();
    this.toastManager = new ToastManager();
    this.initializeElements();
    this.bindEvents();
    this.updateLengthDisplay();

    // Show welcome toast

    setTimeout(()=>{
      this.toastManager.info('Welcome! click Generate Password to create your first secure password.',{
        title: 'Password Generator Ready',
        duration: 3000
      });
    }, 1000);
  }

  initializeElements(){
    // Input elements 

    this.lengthSlider = document.getElementById('lengthSlider');
    this.lengthValue = document.getElementById('lengthValue');
    this.uppercaseCheckbox = document.getElementById('uppercase');
    this.lowercaseCheckbox = document.getElementById('lowercase');
    this.numbersCheckbox = document.getElementById('numbers');
    this.symbolsCheckbox = document.getElementById('symbols');

    // Output elements 

    this.passwordField = document.getElementById('password');
    this.strengthFill = document.getElementById('strengthFill');
    this.strengthText = document.getElementById('strengthText');

    // Action elements 

    this.generateBtn = document.getElementById('generateBtn');
    this.copyBtn = document.getElementById('copyBtn');
    this.copyIcon = this.copyBtn.querySelector('.copy-icon');
  }

  bindEvents(){
    // Length Slider 

    this.lengthSlider.addEventListener('input', ()=>{
      this.updateLengthDisplay();
      this.updateGeneratorOptions();
    });

    // Checkboxes 

    [this.uppercaseCheckbox, this.lowercaseCheckbox, this.numbersCheckbox, this.symbolsCheckbox]
    .forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateGeneratorOptions();
        this.validateCheckboxes();
      });
    });

    // Generate button 

    this.generateBtn.addEventListener('click', ()=>{
      this.generatePassword();
    });

    // Copy button 
    this.copyBtn.addEventListener('click', ()=>{
      this.copyToClipboard();
    });

    // Password field click (for mobile)

    this.passwordField.addEventListener('click', ()=>{
      if(this.passwordField.value.trim() !== ""){
        this.copyToClipboard();
      }
    });

    // Keyboard shortcuts

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ''){
        if(e.target === this.generateBtn){
          this.generatePassword();
        }
      }

      if(e.ctrlKey && e.key === 'g'){
        e.preventDefault();
        this.generatePassword();
      }
    });
  }

  updateLengthDisplay(){
    const length = this.lengthSlider.value;
    this.lengthValue.textContent = length;

    // Update Slider background

    const percentage = ((length - this.lengthSlider.min)/ (this.lengthSlider.max - this.lengthSlider.min)) * 100;
    this.lengthSlider.style.background = `
    linear-gradient(to right, #4facfe 0%, #00f2fe ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`;
  }

  updateGeneratorOptions(){
    this.generator.updateOptions({
      length: parseInt(this.lengthSlider.value),
      includeUppercase: this.uppercaseCheckbox.checked,
      includeLowercase: this.lowercaseCheckbox.checked,
      includeNumbers: this.numbersCheckbox.checked,
      includeSymbols: this.symbolsCheckbox.checked
    });
  }

  validateCheckboxes(){
    const checkboxes = [this.uppercaseCheckbox, this.lowercaseCheckbox, this.numbersCheckbox, this.symbolsCheckbox];
    const checkedCount = checkboxes.filter(cb =>cb.checked).length;

    if(checkedCount === 0){
      // Re-check lowercase if all are unchecked

      this.lowercaseCheckbox.checked = true;
      this.updateGeneratorOptions();
      this.toastManager.warning('At least one character type must be selected. Lowercase letters have been enabled.',{
        title: 'Selection Required',
        duration: 3000
      });
    }
  }

  generatePassword(){
    try {
      this.updateGeneratorOptions();
      const password = this.generator.generate();

      // Animate the generation 
      this.animateGeneration(() =>{
        this.passwordField.value = password;
        this.updateStrengthIndicator(password);

        // Show success toast 

        const strength = this.generator.calculateStrength(password);
        this.toastManager.success(`🎉 New ${(strength.feedback || "secure").toLowerCase()} password generated! (${password.length} characters)`,{
          title: 'Password Generated',
          duration: 2000
        });
      });
    } catch (error) {
      console.error('Error generating password:', error);
      this.passwordField.value = '';
      this.strengthText.textContent = 'Error';
      this.strengthFill.style.width = '0%';
      this.toastManager.error('❌ Failed to generate password. Please check your settings.',{
        title: 'Generation Failed',
        duration: 3000
      });      
    }
  }

  animateGeneration(callback){
    const btn = this.generateBtn;
    const originalText = btn.querySelector('.btn-text').textContent;

    btn.querySelector('.btn-text').textContent = 'Generating...';
    btn.style.transform = 'scale(0.95)';

    // Simulate generation time 

    setTimeout(()=>{
      callback();
      btn.querySelector('.btn-text').textContent = originalText;
      btn.style.transform = 'scale(1)';
    }, 300);
  }

  updateStrengthIndicator(password){
    const strength = this.generator.calculateStrength(password);

    // Animate strength bar

    this.strengthFill.style.width = '0%';
    this.strengthFill.style.background = strength.color;
    
    setTimeout(()=>{
      this.strengthFill.style.width = `${strength.scores}%`;
      this.strengthText.style.textContent = strength.feedback;;
      this.strengthText.style.color = strength.color;
    }, 100);
  }

  async copyToClipboard(){
    const password = this.passwordField.value.trim();

    if(!password){
      this.toastManager.error('❌ No password to copy! Generate a password first.', {
        title: 'Nothing to Copy',
        duration: 2000
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      this.showCopyFeedback('✅', 'Copied!');
      this.toastManager.success('📋 Password copied to clipboard successfully!', {
        title: 'Copied',
        duration: 2000
      });
    } catch (error) {
      // Fallback for older browsers 
      this.fallbackCopy(password);       
    }
  }

  fallbackCopy(text){
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showCopyFeedback('✅', 'copied!');
      this.toastManager.success('📋 Password copied to clipboard successfully!', {
        title: 'Copied',
        duration: 2000
      });
    } catch (error) {
      this.showCopyFeedback('❌', 'Copy failed');
      this.toastManager.error('❌ Failed to copy password. Please select and copy manually.', {
        title: 'Copy Failed',
        duration: 3000
      });      
    }

    document.body.removeChild(textArea);
  }

  showCopyFeedback(icon, text){
    // Store original image source 

    const originalSrc = this.copyImage.src;
    const originalAlt = this.copyImage.alt;

    // Hide image and show text feedback 

    this.copyImage.style.display ='none';
    this.copyIcon.innerHTML = icon;
    this.copyBtn.title = text;

    // Add Animation

    this.copyBtn.style.transform = 'scale(1.1)';

    setTimeout(()=>{
      // Restore original image 

      this.copyImage.style.display = 'block';
      this.copyIcon.innerHTML = `<img scr="${originalSrc}" alt="${originalAlt}" id="copyImage">`;

      // Re-reference the image element after innerHTML change 

      this.copyImage = document.getElementById('copyImage');
      this.copyBtn.title = 'Copy to clipboard';
      this.copyBtn.style.transform = 'scale(1)';
    }, 1500);
  }
}

// Global toast manager instance 

let toastManager;

// Initial the application when DOM is loaded

document.addEventListener('DOMContentLoaded', ()=>{
  const app = new PasswordGeneratorUI();
  toastManager = app.toastManager;  // Make it globally accessible

  // Do Not Genearte initial password - user must click the button

  console.log('🔐 Advanced Password Generator with Toast Notifications loaded successfully!');
});

// Service Worker registration for PWA capabilities (optional)

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/sw.js')
    .then((registration) =>{
      console.log('SW registered: ', registration);
    })
    .catch((registrationError) =>{
      console.log('SW registration failed: ', registrationError);
    });
  });
}