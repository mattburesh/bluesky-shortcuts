export default class KeyboardShortcutManager {
    constructor(actionMap) {
        this.actionMap = actionMap;
        this.prefixKey = null;
        this.prefixTimeout = null;

        console.log('Enter key mapped as:', Object.keys(actionMap).find(key => 
            actionMap[key] && actionMap[key].action && 
            actionMap[key].action.name === 'bound openPost'));

        this.setupListeners();
    }

    setupListeners() {
        this.boundHandleKeyEvent = this.handleKeyEvent.bind(this);
        document.addEventListener('keydown', this.boundHandleKeyEvent);

        this.boundHandleEnterKey = this.handleEnterKey.bind(this);
        document.addEventListener('keydown', this.boundHandleEnterKey);
    }

    handleEnterKey(event) {
        // Only handle Enter key
        if (event.key !== 'Enter') return;
        
        console.log('Enter key pressed on:', document.activeElement.tagName, 
                    'data-testid:', document.activeElement.getAttribute('data-testid'));
        
        // Check if we're focused on a post
        const isPostElement = document.activeElement &&
            document.activeElement.getAttribute && 
            (document.activeElement.getAttribute('data-testid')?.includes('feedItem-by-') || 
             document.activeElement.getAttribute('data-testid')?.includes('postThreadItem-by-'));
        
        if (isPostElement) {
            console.log('Post element has focus, executing openPost action');
            event.preventDefault();
            
            // Get the openPost action from the actionMap
            const openPostKey = Object.keys(this.actionMap).find(key => 
                this.actionMap[key].action.name === 'bound openPost');
            
            if (openPostKey && this.actionMap[openPostKey]) {
                this.actionMap[openPostKey].action(event);
            } else {
                console.error('Could not find openPost action in action map');
            }
        }
    }

    handleKeyEvent(event) {
        if (event.key === 'Enter') return;
        // make sure keys like Enter aren't converted to lower case
        const key = event.key;
        let normalizedKey = /^[a-zA-Z]$/.test(key) ? key.toLowerCase() : key;

        if (normalizedKey === 'Enter') {
            const isPostElement = document.activeElement.matches && 
            document.activeElement.matches('[data-testid*="feedItem-by-"], [data-testid*="postThreadItem-by-"]');
            console.log('pressing the normalized key Enter');
            if (isPostElement) {
                event.preventDefault();
                this.actionMap['Enter'].action(event);
                return;
            }
        }

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

        if (this.shouldPreventShortcut(event, mapping.allowedModifiers)) return;

        event.preventDefault();
        mapping.action(event);
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
