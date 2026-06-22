export default class DOMUtils {
    static async waitForElement(selector, timeout = 5000, signal, retryOptions = { maxRetries: 3, retryDelay: 2000 }) {
        let retryCount = 0;

        const attempt = async () => {
            try {
                return await new Promise((resolve, reject) => {
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
            } catch (error) {
                if (error === 'cancelled' || retryCount >= retryOptions.maxRetries) {
                    throw error;
                }

                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryOptions.retryDelay));
                return attempt();
            }
        }

        return attempt();
    }

    static findVisiblePosts() {
        // Handle People/Feeds tabs on the search page
        if (window.location.pathname.startsWith('/search')) {
            const activeTabText = DOMUtils.getActiveTabText();
            if (activeTabText === 'People') {
                return [...document.querySelectorAll('a[role="link"][aria-label^="View "]')]
                    .filter(el => el.offsetParent !== null);
            }
            if (activeTabText === 'Feeds') {
                return [...document.querySelectorAll('a[role="link"][href*="/feed/"]')]
                    .filter(el => el.offsetParent !== null);
            }
        }

        var searchResults = []
        const feedPatterns = [
            /Hashtag — Bluesky$/,
            /Explore — Bluesky$/,
            /Saved Posts — Bluesky/
        ]
        if (feedPatterns.some(pattern => pattern.test(document.title))) {
            // This selector matches all posts in search lists, but can throw
            // false positives in other views like threads
            const searchQuery = 'div:not([style]) > div[role="link"][tabindex]:not([aria-label*="Reposted by"])'
            searchResults = document.querySelectorAll(searchQuery)
        }
        const feedItems = [
            // Main feed items
            ...document.querySelectorAll('div[data-testid*="feedItem-by-"]'),
            // Thread/reply items
            ...document.querySelectorAll('div[data-testid*="postThreadItem-by-"]'),
            // Search results
            ...searchResults
        ].filter(el => el.offsetParent !== null);

        return feedItems;
    }

    static getActiveTabText() {
        const tabs = DOMUtils.getFeedTabs();
        const activeTab = tabs.find(tab => DOMUtils.isFeedTabActive(tab));
        return activeTab?.textContent?.trim() || '';
    }

    static findClosestVisiblePost(visiblePosts, scrollY) {
        if (visiblePosts.length === 0) {
            return null
        }
        
        return visiblePosts.reduce((closest, post) => {
            const postTop = post.getBoundingClientRect().top + scrollY;
            const closestTop = closest.getBoundingClientRect().top + scrollY;
            return Math.abs(postTop - scrollY) < Math.abs(closestTop - scrollY) ? post : closest;
        });
    }

    /**
     * Safely scroll into view
     * @param {Element} element - The element to scroll into view
     * @param {Object} options - The options for the scroll
     * @param {boolean} options.skipScroll - Whether to skip the scroll
     * @param {"smooth"|"instant"|"auto"} options.behavior - The behavior of the scroll. See [here](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo#behavior) for more information.
     */
    static safelyScrollIntoView(element, options = {}) {
        if (!element) return;

        document.querySelectorAll('.bsky-highlighted-post').forEach(el => {
            el.classList.remove('bsky-highlighted-post');

            if (el.__bskyEnterHandler) {
                el.removeEventListener('keydown', el.__bskyEnterHandler);
                el.__bskyEnterHandler = null;
            }

            if (el.getAttribute('data-bsky-temp-tabindex') === 'true') {
                el.removeAttribute('tabindex');
                el.removeAttribute('data-bsky-temp-tabindex');
            }
        });

        element.classList.add('bsky-highlighted-post');
        if (element.getAttribute('tabindex') === null) {
            element.setAttribute('tabindex', '0');
            element.setAttribute('data-bsky-temp-tabindex', 'true');
        }

        element.__bskyEnterHandler = function(e) {
            if (e.key === 'Enter') {
                // Stop event propagation to prevent conflicts
                e.preventDefault();
                e.stopPropagation();

                // Find and execute the openPost action from our main keyboard handler
                const shortcutInstance = window.__bskyShortcuts;
                if (shortcutInstance) {
                    shortcutInstance.openPost();
                }

                return false;
            }
        };
        element.addEventListener('keydown', element.__bskyEnterHandler);
        element.focus({ preventScroll: true });

        if (options.skipScroll) {
            return;
        }

        element.style.scrollMarginTop = `${DOMUtils.getHeaderOffset()}px`;
        element.scrollIntoView({
            block: 'start',
            behavior: options.behavior || 'smooth'
        });
    }

    static getHeaderOffset() {
        const feedTabs = document.querySelector('[data-testid="homeScreenFeedTabs"]');
        if (feedTabs && feedTabs.offsetHeight > 0) {
            return feedTabs.offsetHeight + 12;
        }

        const main = document.querySelector('[role="main"]');
        if (main) {
            let bottom = 0;
            for (const el of main.querySelectorAll('div[style*="position: sticky"]')) {
                const style = getComputedStyle(el);
                if (style.position !== 'sticky' || parseInt(style.top, 10) !== 0) continue;

                const rect = el.getBoundingClientRect();
                if (rect.top <= 1 && rect.height > 0 && rect.height < 200 && rect.bottom > bottom) {
                    bottom = rect.bottom;
                }
            }
            if (bottom > 0) {
                return bottom + 12;
            }
        }

        return 60;
    }

    static findPostByCurrentPosition(visiblePosts, currentPost) {
        const currentRect = currentPost.getBoundingClientRect();
        return visiblePosts.reduce((closest, post) => {
            const postRect = post.getBoundingClientRect();
            const closestRect = closest.getBoundingClientRect();
            return Math.abs(postRect.top - currentRect.top) < Math.abs(closestRect.top - currentRect.top)
                ? post : closest;
        });
    }

    static isValidElement(element) {
        return element &&
               element.isConnected &&
               element.offsetParent != null
    }

    static getFeedTabSelector() {
        return window.location.pathname === '/'
            ? '[data-testid="homeScreenFeedTabs"] > div > div'
            : 'div[role="tablist"] div[role="tab"]';
    }

    static getFeedTabs() {
        if (window.location.pathname === '/') {
            const homeTabs = document.querySelector('[data-testid="homeScreenFeedTabs"] > div > div');
            return homeTabs ? [...homeTabs.children] : [];
        }

        const tablist = [...document.querySelectorAll('div[role="tablist"]')].find(list =>
            list.offsetParent !== null &&
            !list.closest('[data-testid="homeScreenFeedTabs"]')
        );
        return tablist ? [...tablist.querySelectorAll('div[role="tab"]')] : [];
    }

    static isFeedTabActive(tab) {
        return !!tab.querySelector('div[style*="background-color"]');
    }
}
