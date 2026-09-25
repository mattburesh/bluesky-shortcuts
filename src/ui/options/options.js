import Settings from '../../utils/settings';
import Logger from '../../utils/logger';

class OptionsPage {
    constructor() {
        this.logger = new Logger();
        this.form = document.getElementById('settings');
        this.status = document.getElementById('status');
        this.initializeUI();
    }

    async initializeUI() {
        await Settings.load();

        const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
        for (const checkbox of checkboxes) {
            checkbox.checked = Settings.get(checkbox.name);
            checkbox.addEventListener('change', () => this.save(checkbox));
        }
    }

    async save(checkbox) {
        try {
            await Settings.set({ [checkbox.name]: checkbox.checked });
            this.showStatus('Saved');
        } catch (error) {
            this.logger.error('Failed to save settings:', error);
            checkbox.checked = Settings.get(checkbox.name);
            this.showStatus('Could not save settings');
        }
    }

    showStatus(message) {
        this.status.textContent = message;
        clearTimeout(this.statusTimeout);
        this.statusTimeout = setTimeout(() => {
            this.status.textContent = '';
        }, 2000);
    }
}

new OptionsPage();
