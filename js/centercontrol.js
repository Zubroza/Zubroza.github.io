class AppController {
    constructor() {
        this.nameGenerator = null;
        this.savedItemsManager = new SavedItemsManager();
        this.themeManager = new ThemeManager();

        this.form = document.getElementById('generator-form');
        this.resultContainer = document.getElementById('result-container');
        this.resultOutput = document.getElementById('result-output');
        this.copyButton = document.getElementById('copy-button');
        this.saveButton = document.getElementById('save-button');
        this.firstLetterInput = document.getElementById('first-letter-input');

        this.nicknameSettingsDiv = document.getElementById('nickname-settings');
        this.langFieldset = document.getElementById('lang-fieldset');

        this.apiInfoDiv = document.getElementById('api-info');

        this.savedListElement = document.getElementById('saved-list');
        this.noSavedMessage = document.getElementById('no-saved-message');
        this.clearAllButton = document.getElementById('clear-all-button');

        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            this.nameGenerator = new NameGenerator(data);

            this.setupEventListeners();

            if (window.location.pathname.includes('saved.html')) {
                this.renderSavedItems();
            }

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
            if (this.resultOutput) {
                this.showError('Ошибка загрузки данных или инициализации. Пожалуйста, обновите страницу.');
            }
        }
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        if (this.copyButton) {
            this.copyButton.addEventListener('click', () => this.copyToClipboard());
        }

        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => this.saveResult());
        }

        if (this.clearAllButton) {
            this.clearAllButton.addEventListener('click', () => this.clearAllSavedItems());
        }
    }

    async handleFormSubmit() {
        if (!this.nameGenerator) {
            this.showError('Генератор не инициализирован. Пожалуйста, попробуйте позже.');
            return;
        }

        try {
            const options = this.getFormOptions();
            let result;
            let genderInfo = null;

            if (options.type === 'nickname') {
                result = this.nameGenerator.generateNickname(options);
                if (this.apiInfoDiv) this.apiInfoDiv.classList.add('result-container--hidden');
            } else {
                result = this.nameGenerator.generateName(options);
                if (result && result !== "Не найдено подходящих имён") {
                    genderInfo = await this.nameGenerator.getGenderFromName(result);
                    if (this.apiInfoDiv && genderInfo && genderInfo.gender) {
                        this.apiInfoDiv.innerHTML = `
                            <h3 class="api-info__title">Информация о имени:</h3>
                            <p>Имя: ${genderInfo.name}</p>
                            <p>Пол: ${genderInfo.gender === 'male' ? 'Мужской' : 'Женский'} (Вероятность: ${(genderInfo.probability * 100).toFixed(2)}%)</p>
                            <p>Количество упоминаний: ${genderInfo.count}</p>
                        `;
                        this.apiInfoDiv.classList.remove('result-container--hidden');
                    } else if (this.apiInfoDiv) {
                        this.apiInfoDiv.innerHTML = `<p class="api-info__title">Информация о имени не доступна.</p>`;
                        this.apiInfoDiv.classList.remove('result-container--hidden');
                    }
                } else {
                    if (this.apiInfoDiv) this.apiInfoDiv.classList.add('result-container--hidden');
                }
            }

            this.displayResult(result);

        } catch (error) {
            console.error('Ошибка при генерации:', error);
            this.showError('Произошла ошибка при генерации. Пожалуйста, проверьте параметры.');
        }
    }

    getFormOptions() {
        const currentPath = window.location.pathname;
        let type;
        if (currentPath.includes('nicknamegen.html')) {
            type = 'nickname';
        } else if (currentPath.includes('namegen.html')) {
            type = 'name';
        } else {
            return { type: null };
        }

        const lengthMin = parseInt(document.getElementById('length-min')?.value) || 2;
        const lengthMax = parseInt(document.getElementById('length-max')?.value) || 8;
        const firstLetter = this.firstLetterInput ? this.firstLetterInput.value.trim() : undefined;

        if (type === 'nickname') {
            return {
                type,
                lengthMin,
                lengthMax,
                registerType: document.querySelector('input[name=register]:checked')?.value || 'lowercase',
                includeNumbers: document.getElementById('numbers')?.checked || false,
                includeSpecials: document.getElementById('specials')?.checked || false,
                includeSmiles: document.getElementById('smiles')?.checked || false,
                prefix: document.getElementById('prefix')?.value.trim() || '',
                suffix: document.getElementById('suffix')?.value.trim() || '',
                firstLetter: firstLetter || undefined,
                lang: 'eng'
            };
        } else if (type === 'name') {
            return {
                type,
                lengthMin,
                lengthMax,
                lang: document.querySelector('input[name=lang]:checked')?.value || 'eng',
                firstLetter: firstLetter || undefined
            };
        }
        return { type: null };
    }

    displayResult(result) {
        if (!this.resultOutput || !this.resultContainer) return;

        this.resultOutput.textContent = result;
        this.resultContainer.classList.remove('result-container--hidden');

        this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    copyToClipboard() {
        const text = this.resultOutput.textContent;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            if (this.copyButton) {
                const originalText = this.copyButton.textContent;
                this.copyButton.textContent = 'Скопировано!';
                setTimeout(() => {
                    this.copyButton.textContent = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            if (this.copyButton) {
                this.copyButton.textContent = 'Ошибка!';
                setTimeout(() => {
                    this.copyButton.textContent = 'Копировать';
                }, 2000);
            }
        });
    }

    saveResult() {
        const result = this.resultOutput.textContent;
        if (result && result !== "Не найдено подходящих имён" && result !== "" && !result.includes("Ошибка")) {
            console.log('Attempting to save result:', result);
            if (this.savedItemsManager.addItem(result)) {
                console.log('Result saved successfully.');
                if (this.saveButton) {
                    const originalText = this.saveButton.textContent;
                    this.saveButton.textContent = 'Сохранено!';
                    setTimeout(() => {
                        this.saveButton.textContent = originalText;
                    }, 2000);
                }
            } else {
                console.log('Result already exists or could not be saved.');
                if (this.saveButton) {
                    const originalText = this.saveButton.textContent;
                    this.saveButton.textContent = 'Уже сохранено!';
                    setTimeout(() => {
                        this.saveButton.textContent = originalText;
                    }, 2000);
                }
            }
        } else {
            console.warn('Нечего сохранять или результат некорректен.');
        }
    }

    showError(message) {
        if (!this.resultOutput || !this.resultContainer) return;
        this.resultOutput.textContent = message;
        this.resultContainer.classList.remove('result-container--hidden');
        if (this.apiInfoDiv) {
            this.apiInfoDiv.classList.add('result-container--hidden');
        }
    }

    updateSettingsVisibility() {
        console.log("updateSettingsVisibility called, but not actively used for static pages.");
    }

    renderSavedItems() {
        if (!this.savedListElement || !this.noSavedMessage) return;

        const items = this.savedItemsManager.getSavedItems();
        this.savedListElement.innerHTML = '';

        console.log('Saved items count for rendering:', items.length);

        if (items.length === 0) {
            this.noSavedMessage.classList.remove('hidden');
            console.log('No saved items, showing message.');
        } else {
            this.noSavedMessage.classList.add('hidden');
            console.log('Saved items found, hiding message and rendering items.');
            items.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('saved-item');
                itemElement.innerHTML = `
                    <span class="saved-item__text">${item}</span>
                    <button class="saved-item__remove-button" data-index="${index}">Удалить</button>
                `;
                this.savedListElement.appendChild(itemElement);
            });

            this.savedListElement.querySelectorAll('.saved-item__remove-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const indexToRemove = parseInt(event.target.dataset.index);
                    this.savedItemsManager.removeItem(indexToRemove);
                    this.renderSavedItems();
                });
            });
        }
    }

    clearAllSavedItems() {
        if (window.confirm('Вы уверены, что хотите удалить все сохраненные элементы?')) {
            this.savedItemsManager.clearAllItems();
            this.renderSavedItems();
            console.log('Все сохраненные элементы удалены.');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});