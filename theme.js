// Dark/Light Mode Theme Manager
const ThemeManager = {
  init() {
    // Check if user has a theme preference saved
    const saved = localStorage.getItem('theme') || 'dark';
    this.setTheme(saved);
    this.attachToggle();
  },

  setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
    this.updateToggleButton(theme);
  },

  toggleTheme() {
    const html = document.documentElement;
    const isDark = !html.classList.contains('light-mode');
    this.setTheme(isDark ? 'light' : 'dark');
  },

  attachToggle() {
    let toggle = document.querySelector('.theme-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'theme-toggle';
      toggle.setAttribute('title', 'Dark/Light Mode');
      document.body.appendChild(toggle);
    }
    toggle.addEventListener('click', () => this.toggleTheme());
    this.updateToggleButton(localStorage.getItem('theme') || 'dark');
  },

  updateToggleButton(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
};

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}
