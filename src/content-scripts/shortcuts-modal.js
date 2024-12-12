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
        ];

        this.initialize();
    }

    initialize() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'bsky-shortcuts-modal';
        this.modalContainer.style.display = 'none';

        this.modalContainer.innerHTML = `
            <div class="bsky-shortcuts-overlay">
                <div class="bsky-shortcuts-content">
                    <div class="bsky-shortcuts-header">
                        <h2>Keyboard Shortcuts</h2>
                        <button class="bsky-shortcuts-close">×</button>
                    </div>
                    <div class="bsky-shortcuts-list">
                        ${this.shortcuts.map(shortcut => `
                            <div class="bsky-shortcut-item">
                                <div class="bsky-shortcut-keys">
                                    ${shortcut.modifier ? 
                                        `<span class="bsky-shortcut-key">${shortcut.modifier}</span>
                                         <span class="bsky-shortcut-plus">+</span>` 
                                        : ''
                                    }
                                    <span class="bsky-shortcut-key">${shortcut.key}</span>
                                </div>
                                <span class="bsky-shortcut-description">${shortcut.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modalContainer);

        this.modalContainer.querySelector('.bsky-shortcuts-close').addEventListener('click', () => this.hide());
        this.modalContainer.querySelector('.bsky-shortcuts-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hide();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
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