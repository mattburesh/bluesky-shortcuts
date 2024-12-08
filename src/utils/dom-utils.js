import AccessibilityUtils from "./aria-utils";
import SettingsManager from './settings';

export default class DOMUtils {
    static settingsManager = new SettingsManager();
    static accessibilityUtils = new AccessibilityUtils();

    static async initializeAccessibility() {
        const isEnabled = await this.settingsManager.isFeatureEnabled('screenReaderAnnouncements');
        if (isEnabled) {
            this.accessibilityUtils = new AccessibilityUtils();
        }
    }

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

        feedItems.forEach(post => {
            if (!post.hasAttribute('role')) {
                post.setAttribute('role', 'article');
                post.setAttribute('tabindex', '0');
                this.accessibilityUtils.addPostLabels(post);
            }
        })

        return feedItems;
    }

    static safelyScrollIntoView(element, options = {}) {
        if (element) {
            document.querySelectorAll('.bsky-highlighted-post').forEach(el => {
                el.classList.remove('bsky-highlighted-post');
                el.removeAttribute('aria-current');
                el.removeAttribute('aria-selected');
                el.removeAttribute('aria-label');
            });
            element.classList.add('bsky-highlighted-post');
            
            // element.setAttribute('aria-label', 'Currently selected post');
            
            // element.setAttribute('tabIndex', '-1');
            // element.focus();

            if (this.accessibilityUtils) {
                element.setAttribute('aria-current', 'true');
                element.setAttribute('aria-selected', 'true');
                this.accessibilityUtils.announcePostDetails(element);
            }

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
                ...options
            });
        }
    }
}