class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.initTheme();
        this.setupEventListeners();
    }

    initTheme() {
        document.documentElement.classList.add(`theme--${this.currentTheme}`);
        this.updateButtonText();
    }

    setupEventListeners() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        document.documentElement.classList.remove(`theme--${this.currentTheme}`);
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.add(`theme--${this.currentTheme}`);
        localStorage.setItem('theme', this.currentTheme);
        this.updateButtonText();
    }

    updateButtonText() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.textContent = this.currentTheme === 'light' ? 'Темная тема' : 'Светлая тема';
        }
    }
}