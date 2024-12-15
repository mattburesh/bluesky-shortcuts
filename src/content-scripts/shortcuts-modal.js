class ShortcutsModal {
    constructor() {
        this.isVisible = false;
        this.shortcuts = [
            { key: 'j', description: 'Move to next post' },
            { key: 'k', description: 'Move to previous post' },
            { key: 'l', description: 'Like post' },
            { key: 'r', description: 'Reply to post' },
            // { key: 't', description: 'Repost / Quote post' },
            { key: 'o', description: 'Expand image' },
            { key: 'Enter', description: 'Open post' },
            { key: '/', description: 'Search' },
            { key: 'c', description: 'Next pinned feed' },
            { modifier: 'Shift', key: 'c', description: 'Previous pinned feed' },
            { key: '.', description: 'Load more posts' },
            { key: '?', description: 'Toggle shortcuts' },
            { key: 'g h', description: 'Go Home' },
            { key: 'g p', description: 'Go to Profile' },
            { key: 'g n', description: 'Go to Notifications' }
        ];

        this.initialize();
    }

    createShortcutItem(shortcut) {
        const item = document.createElement('div');
        item.className = 'bsky-shortcut-item';

        const keysContainer = document.createElement('div');
        keysContainer.className = 'bsky-shortcut-keys';

        if (shortcut.modifier) {
            const modKey = document.createElement('span');
            modKey.className = 'bsky-shortcut-key';
            modKey.textContent = shortcut.modifier;
            keysContainer.appendChild(modKey);

            const plus = document.createElement('span');
            plus.className = 'bsky-shortcut-plus';
            plus.textContent = '+';
            keysContainer.appendChild(plus);
        }

        const key = document.createElement('span');
        key.className = 'bsky-shortcut-key';
        key.textContent = shortcut.key;
        keysContainer.appendChild(key);

        const desc = document.createElement('span');
        desc.className = 'bsky-shortcut-description';
        desc.textContent = shortcut.description;

        item.appendChild(keysContainer);
        item.appendChild(desc);
        return item;
    }

    initialize() {
        const modal = document.createElement('div');
        modal.className = 'bsky-shortcuts-modal';
        modal.style.display = 'none';

        const overlay = document.createElement('div');
        overlay.className = 'bsky-shortcuts-overlay';

        const content = document.createElement('div');
        content.className = 'bsky-shortcuts-content';

        const header = document.createElement('div');
        header.className = 'bsky-shortcuts-header';

        const title = document.createElement('h2');
        title.textContent = 'Keyboard Shortcuts';

        const close = document.createElement('button');
        close.className = 'bsky-shortcuts-close';
        close.textContent = '×';
        close.addEventListener('click', () => this.hide());

        header.appendChild(title);
        header.appendChild(close);

        const list = document.createElement('div');
        list.className = 'bsky-shortcuts-list';

        this.shortcuts.forEach(shortcut => {
            list.appendChild(this.createShortcutItem(shortcut));
        });

        content.appendChild(header);
        content.appendChild(list);
        overlay.appendChild(content);
        modal.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hide();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        this.modalContainer = modal;
        document.body.appendChild(modal);
    }

    show() {
        this.isVisible = true;
        this.modalContainer.style.display = 'block';
    }

    hide() {
        this.isVisible = false;
        this.modalContainer.style.display = 'none';
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

export default ShortcutsModal;
