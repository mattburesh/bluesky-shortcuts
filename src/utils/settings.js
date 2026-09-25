import Logger from './logger';

const DEFAULTS = {
    alignPostToTop: false,
};

const LOAD_TIMEOUT_MS = 1000;

const storage = globalThis.chrome?.storage;
const logger = new Logger();

export default class Settings {
    static values = { ...DEFAULTS };

    /**
     * Load settings from sync storage into the cache.
     * @returns {Promise<void>}
     */
    static load() {
        if (!storage?.sync) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const timeout = setTimeout(() => {
                logger.warn('Timed out loading settings, using defaults');
                resolve();
            }, LOAD_TIMEOUT_MS);
            const finish = error => {
                clearTimeout(timeout);
                if (error) {
                    logger.warn('Failed to load settings, using defaults', error);
                }
                resolve();
            };

            try {
                storage.sync.get(DEFAULTS, result => {
                    const error = chrome.runtime?.lastError;
                    if (!error) {
                        Settings.values = { ...DEFAULTS, ...result };
                    }
                    finish(error);
                });
            } catch (error) {
                finish(error);
            }
        });
    }

    static get(key) {
        return Settings.values[key] ?? DEFAULTS[key];
    }

    /**
     * Persist settings to sync storage
     * @param {Object} partial - The settings to update
     * @returns {Promise<void>}
     */
    static set(partial) {
        if (!storage?.sync) {
            Object.assign(Settings.values, partial);
            return Promise.resolve();
        }

        // only update the cache once the write succeeds
        return new Promise((resolve, reject) => {
            storage.sync.set(partial, () => {
                const error = chrome.runtime?.lastError;
                if (error) {
                    reject(error);
                    return;
                }
                Object.assign(Settings.values, partial);
                resolve();
            });
        });
    }
}

// keep the cache current when settings change in another context 
storage?.onChanged?.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (key in DEFAULTS) {
            Settings.values[key] = newValue;
        }
    }
});
