export default class DOMUtils {
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkForElement = () => {
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

    static findVisiblePosts() {
        return [...document.querySelectorAll('div[data-testid*="feedItem-by-"]')]
            .filter(el => el.offsetParent !== null);
    }

    static safelyScrollIntoView(element, options = {}) {
        if (element) {
            document.querySelectorAll('.bsky-highlighted-post').forEach(el => {
                el.classList.remove('bsky-highlighted-post');
            });

            element.classList.add('bsky-highlighted-post');

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
                ...options
            });
        }
    }
}