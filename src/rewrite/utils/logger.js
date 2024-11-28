class Logger {
    constructor(options = {}) {
        this.debugMode = options.debugMode || false;
        this.logLevel = options.logLevel || 'info';
        this.prefix = options.prefix || '[BlueSky Shortcuts]';
    }

    _log(level, ...args) {
        const levels = ['error', 'warn', 'info', 'debug'];
        if (levels.indexOf(level) <= levels.indexOf(this.logLevel)) {
            console[level](`${this.prefix} [${level.toUpperCase()}]`, ...args);
        }
    }

    debug(...args) {
        if (this.debugMode) {
            this._log('debug', ...args);
        }
    }

    info(...args) {
        this._log('info', ...args);
    }

    warn(...args) {
        this._log('warn', ...args);
    }

    error(...args) {
        this._log('error', ...args);
        
        // Optional: Send error to background script for reporting
        this._reportError(...args);
    }

    _reportError(...args) {
        try {
            // If using browser extension messaging
            chrome.runtime.sendMessage({
                type: 'error_log',
                payload: {
                    timestamp: new Date().toISOString(),
                    message: args.map(arg => String(arg)).join(' ')
                }
            });
        } catch (e) {
            console.error('Failed to report error', e);
        }
    }
}

export default Logger;