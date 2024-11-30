export default class KeyboardShortcutManager {
    constructor(config, actionMap) {
        this.config = config;
        this.actionMap = actionMap;
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', this.handleKeyEvent.bind(this));
    }

    handleKeyEvent(event) {
        if (this.shouldPreventShortcut(event)) return;

        const action = this.getActionForKey(event.code);
        if (action) {
            event.preventDefault();
            action();
        }
    }

    shouldPreventShortcut(event) {
        const isInputFocused = 
            document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA' ||
            event.ctrlKey || 
            event.altKey || 
            event.shiftKey || 
            event.metaKey;

        return isInputFocused;
    }

    getActionForKey(keyCode) {
        return this.actionMap[keyCode];
    }
}