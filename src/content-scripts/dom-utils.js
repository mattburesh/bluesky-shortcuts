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
                console.log('retry ' + retryCount );
                await new Promise(resolve => setTimeout(resolve, retryOptions.retryDelay));
                return attempt();
            }
        }

        return attempt();
    }

    static findVisiblePosts() {
        var searchResults = []
        if (document.title === "Hashtag — Bluesky" || document.title === "Explore — Bluesky") {
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

    static findClosestVisiblePost(visiblePosts, scrollY) {
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

        const header = document.querySelector('[data-testid="homeScreenFeedTabs"]');
        const headerOffset = header ? header.offsetHeight + 12 : 60;
        
        // try to center the post if there is enough space to do so
        const elementRect = element.getBoundingClientRect();
        const elementHeight = elementRect.height;
        const viewportHeight = window.innerHeight;
        
        const availableHeight = viewportHeight - headerOffset;

        let scrollPosition;

        if (elementHeight > availableHeight) {
            scrollPosition = window.pageYOffset + elementRect.top - headerOffset;
        } else {
            scrollPosition = window.pageYOffset + elementRect.top - headerOffset - (availableHeight / 2 - elementHeight / 2);
        }
        window.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: options.behavior || 'smooth'
        });
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
}