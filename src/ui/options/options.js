import SettingsManager from '../../utils/settings';

class OptionsPage {
    constructor() {
        this.settings = new SettingsManager();
        this.initializeUI();
    }

    async initializeUI() {
        const settings = await this.settings.loadSettings();
        
        const experimentalEnabled = document.getElementById('experimental-enabled');
        const screenReaderAnnouncements = document.getElementById('screen-reader-announcements');
        const experimentalFeatures = document.getElementById('experimental-features');

        experimentalEnabled.checked = settings.experimental?.enabled || false;
        screenReaderAnnouncements.checked = settings.experimental?.features?.screenReaderAnnouncements?.enabled || false;
        
        // Update UI state
        experimentalFeatures.style.display = experimentalEnabled.checked ? 'block' : 'none';
        screenReaderAnnouncements.disabled = !experimentalEnabled.checked;

        // Add event listeners
        experimentalEnabled.addEventListener('change', async (e) => {
            experimentalFeatures.style.display = e.target.checked ? 'block' : 'none';
            screenReaderAnnouncements.disabled = !e.target.checked;
            if (!e.target.checked) {
                screenReaderAnnouncements.checked = false;
            }
            await this.settings.saveSettings({
                ...settings,
                experimental: {
                    ...settings.experimental,
                    enabled: e.target.checked,
                    features: {
                        ...settings.experimental?.features,
                        screenReaderAnnouncements: {
                            enabled: e.target.checked && screenReaderAnnouncements.checked
                        }
                    }
                }
            });
        });

        screenReaderAnnouncements.addEventListener('change', async (e) => {
            await this.settings.saveSettings({
                ...settings,
                experimental: {
                    ...settings.experimental,
                    features: {
                        ...settings.experimental?.features,
                        screenReaderAnnouncements: {
                            enabled: experimentalEnabled.checked && e.target.checked
                        }
                    }
                }
            });
        });
    }
}

new OptionsPage();