export default class KeyboardShortcutManager {
    constructor(actionMap) {
        this.actionMap = actionMap;
        this.prefixKey = null;
        this.prefixTimeout = null;
        this.setupListeners();
    }

    setupListeners() {
        this.boundHandleKeyEvent = this.handleKeyEvent.bind(this);
        document.addEventListener('keydown', this.boundHandleKeyEvent);
    }

    handleKeyEvent(event) {
        // make sure keys like Enter aren't converted to lower case
        const key = event.key;
        let normalizedKey = /^[a-zA-Z]$/.test(key) ? key.toLowerCase() : key;

        if (normalizedKey === 'g' && !this.prefixKey) {
            if (!this.shouldPreventShortcut(event)) {
                event.preventDefault();
                this.prefixKey = 'g';

                this.prefixTimeout = setTimeout(() => {
                    this.prefixKey = null;
                }, 500);
                return;
            }
        } 

        if (this.prefixKey === 'g') {
            clearTimeout(this.prefixTimeout);
            normalizedKey = `g${normalizedKey}`;
            this.prefixKey = null;
        }

        const mapping = this.actionMap[normalizedKey];
        if (!mapping) return;

        // check for required modifiers
        if (mapping.requiredModifiers && !this.checkRequiredModifiers(event, mapping.requiredModifiers)) {
            return;
        }

        if (this.shouldPreventShortcut(event, mapping.allowedModifiers)) return;

        event.preventDefault();
        mapping.action(event);
    }

    checkRequiredModifiers(event, requiredModifiers) {
        if (requiredModifiers.includes('alt') && !event.altKey) return false;
        if (requiredModifiers.includes('ctrl') && !event.ctrlKey) return false;
        if (requiredModifiers.includes('shift') && !event.shiftKey) return false;
        if (requiredModifiers.includes('meta') && !event.metaKey) return false;
        return true;
    }

    shouldPreventShortcut(event, allowedModifiers = []) {
        const isInputElement = document.activeElement?.tagName === 'INPUT' || 
      document.activeElement?.tagName === 'TEXTAREA' ||
      document.activeElement?.getAttribute('role') === 'textbox' ||
      document.activeElement?.contentEditable === 'true' || 
      document.activeElement?.isContentEditable;

        if (isInputElement) {
            return true;
        }

        const mapping = this.actionMap[event.key.toLowerCase()];
        if (mapping && mapping.requiredModifiers) {
            if (mapping.requiredModifiers.includes('alt') && event.altKey) return false;
            if (mapping.requiredModifiers.includes('ctrl') && event.ctrlKey) return false;
            if (mapping.requiredModifiers.includes('shift') && event.shiftKey) return false;
            if (mapping.requiredModifiers.includes('meta') && event.metaKey) return false;
        }

        return (event.ctrlKey && !allowedModifiers.includes('ctrl')) ||
         (event.altKey && !allowedModifiers.includes('alt')) ||
         (event.shiftKey && !allowedModifiers.includes('shift')) ||
         (event.metaKey && !allowedModifiers.includes('meta'));
    }

    getActionForKey(keyCode) {
        return this.actionMap[keyCode];
    }

    cleanup() {
        document.removeEventListener('keydown', this.boundHandleKeyEvent);
        if (this.prefixTimeout) {
            clearTimeout(this.prefixTimeout);
            this.prefixTimeout = null;
        }
    }
}
