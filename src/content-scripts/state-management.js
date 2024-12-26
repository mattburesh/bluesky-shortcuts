class AppState {
    constructor() {
        this.state = {
            feedTabs: [],
            currentFeedIndex: 0,
            currentPost: null,
            currentController: null,
            location: window.location.pathname
        };
        this.subscribers = new Set();
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
        const observer = new MutationObserver(() => {
            requestAnimationFrame(() => {
                if (window.location.pathname !== lastPathname) {
                    lastPathname = window.location.pathname;
                    this.updateState({ location: lastPathname });
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: false
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
        this.subscribers.forEach(callback => callback(this.state));
    }
}

export default AppState;
