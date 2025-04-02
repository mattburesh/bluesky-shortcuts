import Logger from '../utils/logger';

class AppState {
    constructor(logger) {
        this.state = {
            feedTabs: [],
            currentFeedIndex: 0,
            currentPost: null,
            currentLinkIndex: -1, // -1 = open selected post, n = open nth link in post
            currentController: null,
            location: window.location.pathname,
            lastSwitchedAccount: null
        };
        this.subscribers = new Set();
        this.logger = logger ?? new Logger();
        this.observer = this.setupLocationObserver();
    }

    cleanup() {
        this.observer?.disconnect();
        this.subscribers.clear();
    }

    /**
     * Sets up a MutationObserver to watch for URL changes in the application
     * Updates state. Location when navigation occurs
     * @private
     */
    setupLocationObserver() {
        let lastPathname = window.location.pathname;
        let lastUpdate = Date.now();
        const THROTTLE_MS = 100;

        const observer = new MutationObserver(() => {
            const now = Date.now();
            if (now - lastUpdate < THROTTLE_MS) {
                return;
            }

            const currentPathname = window.location.pathname;
            if (currentPathname !== lastPathname) {
                lastPathname = currentPathname;
                lastUpdate = now;
                this.updateState(prevState => ({
                    ...prevState,
                    location: currentPathname
                }));
            }
        });

        const urlContainer = document.querySelector('[role="main"]') || document.body;
        observer.observe(urlContainer, {
            childList: true,
            subtree: true,
            characterData: false,
            attributes: false
        });

        return observer;
    }

    /**
     * Registers a callback to be notified of state changes
     * @param {Function} callback - Function to be called when state changes
     * @returns {Function} Unsubscribe function to remove the callback
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Updates the application state and notifies all subscribers
     * @param {Object} newState - Partial state object to merge with current state
     */
    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifySubscribers();
    }

    /**
     * Notifies all subscribers of state changes by calling their callbacks
     * @private
     */
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.state);
            } catch(error) {
                this.logger.error('Error in subscriber callback:', error);
            }
        });
    }
}

export default AppState;
