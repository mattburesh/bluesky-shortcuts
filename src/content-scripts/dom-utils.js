export default class DOMUtils {
    static waitForElement(selector, timeout = 5000, signal) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkForElement = () => {
                if (signal?.aborted) {
                    reject('cancelled');
                    return;
                }

                const element = document.querySelector(selector);
                
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                } else {
                    requestAnimationFrame(checkForElement);
                }
            };

            checkForElement();
        });
    }

    /**
     * Todo: Add search results feed
     */
    static findVisiblePosts() {
        const feedItems = [
            // Main feed items
            ...document.querySelectorAll('div[data-testid*="feedItem-by-"]'),
            // Thread/reply items
            ...document.querySelectorAll('div[data-testid*="postThreadItem-by-"]')
        ].filter(el => el.offsetParent !== null);

        return feedItems;
    }

    static safelyScrollIntoView(element, options = {}) {
        if (element) {
            document.querySelectorAll('.bsky-highlighted-post').forEach(el => {
                el.classList.remove('bsky-highlighted-post');
                el.removeAttribute('aria-current');
                el.removeAttribute('aria-label');
            });

            element.classList.add('bsky-highlighted-post');
            element.setAttribute('aria-current', 'true');
            element.setAttribute('aria-label', 'Currently selected post');
            
            element.setAttribute('tabIndex', '-1');
            element.focus();

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
                ...options
            });
        }
    }
}