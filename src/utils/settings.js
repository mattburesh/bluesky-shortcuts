export default class SettingsManager {
    constructor() {
        this.storageKey = 'bsky-shortcuts-settings';
        this.defaultSettings = {
            experimental: {
                enabled: false,
                features: {
                    screenReaderAnnouncements: {
                        enabled: false
                    }
                }
            }
        };

        this.storage = (typeof browser !== 'undefined' ? browser : chrome).storage.sync;
    }

    async loadSettings() {
        try {
            const stored = await this.storage.get(this.storageKey);
            return stored[this.storageKey] || this.defaultSettings;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.defaultSettings;
        }
    }

    async saveSettings(settings) {
        try {
            await this.storage.set({
                [this.storageKey]: settings
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    async isFeatureEnabled(featureName) {
        const settings = await this.loadSettings();
        return (
            settings.experimental?.enabled &&
            settings.experimental?.features?.[featureName]?.enabled
        );
    }
}
