class Announcer {
    constructor() {
        this.setupLiveRegion();
    }

    setupLiveRegion() {
        const existing = document.getElementById('bsky-shortcuts-announcer');
        if (existing) {
            existing.remove();
        }

        const liveRegion = document.createElement('div');
        liveRegion.id = 'bsky-shortcuts-announcer';
        liveRegion.setAttribute('role', 'alert');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.padding = '0';
        liveRegion.style.margin = '-1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clipPath = 'inset(50%)';
        liveRegion.style.border = '0';
        document.body.appendChild(liveRegion);

        setTimeout(() => {
            liveRegion.textContent = ' ';
        }, 100);
    }

    announce(message) {
        const liveRegion = document.getElementById('bsky-shortcuts-announcer');
        if (liveRegion) {
            liveRegion.textContent = '';
            
            // Use setTimeout to ensure the clear takes effect
            setTimeout(() => {
                liveRegion.textContent = message;
            }, 50);
        }
    }
}

export default new Announcer();