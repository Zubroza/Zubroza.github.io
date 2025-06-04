class AppController {
  constructor() {
    this.generator = null;
    this.init();
  }

  async init() {
    try {
      // Загрузка данных
      const response = await fetch('data/data.json');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      this.generator = new NameGenerator(data);
      this.setupEventListeners();
      
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Ошибка загрузки данных. Пожалуйста, обновите страницу.');
    }
  }

  setupEventListeners() {
    const form = document.getElementById('generator-form');
    const copyButton = document.getElementById('copy-button');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
    
    copyButton.addEventListener('click', () => this.copyToClipboard());
  }

  handleFormSubmit() {
    try {
      const options = this.getFormOptions();
      const result = options.type === 'nikname' 
        ? this.generator.generateNickname(options)
        : this.generator.generateName(options);
      
      this.displayResult(result);
    } catch (error) {
      console.error('Generation error:', error);
      this.showError('Ошибка генерации. Проверьте введенные данные.');
    }
  }

  getFormOptions() {
    const type = document.querySelector('input[name=tname]:checked').value;
    const lengthMin = parseInt(document.getElementById('length-min').value) || 2;
    const lengthMax = parseInt(document.getElementById('length-max').value) || 8;
    const lang = document.querySelector('input[name=lang]:checked').value;
    const firstLetter = document.getElementById('first-letter-input').value.trim();
    
    if (type === 'nikname') {
      return {
        type,
        lengthMin,
        lengthMax,
        registerType: document.querySelector("input[name=register]:checked").value,
        includeNumbers: document.getElementById('numbers').checked,
        includeSpecials: document.getElementById('specials').checked,
        includeSmiles: document.getElementById('smiles').checked,
        prefix: document.getElementById('prefix').value.trim(),
        suffix: document.getElementById('suffix').value.trim(),
        firstLetter: firstLetter || undefined
      };
    } else {
      return {
        type,
        lengthMin,
        lengthMax,
        lang,
        firstLetter: firstLetter || undefined
      };
    }
  }

  displayResult(result) {
    const output = document.getElementById('result-output');
    const container = document.getElementById('result-container');
    
    output.textContent = result;
    container.classList.remove('hidden');
    
    
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  copyToClipboard() {
    const text = document.getElementById('result-output').textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const copyButton = document.getElementById('copy-button');
      copyButton.textContent = 'Скопировано!';
      setTimeout(() => {
        copyButton.textContent = 'Копировать';
      }, 2000);
    }).catch(err => {
      console.error('Copy error:', err);
      alert('Не удалось скопировать текст');
    });
  }

  showError(message) {
    const output = document.getElementById('result-output');
    const container = document.getElementById('result-container');
    
    output.textContent = message;
    container.classList.remove('hidden');
  }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new AppController();
});