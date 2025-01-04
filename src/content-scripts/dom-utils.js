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
                el.removeAttribute('tabindex');
            });

            element.classList.add('bsky-highlighted-post');
            element.setAttribute('tabindex', '0');
            element.setAttribute('aria-label', 'Current post');

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
                ...options
            });

            if (!element.contains(document.activeElement)) {
                element.focus({ preventScroll: true });
            }
        }
    }

    static findClosestVisiblePost(visiblePosts, currentPost, scrollY) {
        return visiblePosts.reduce((closest, post) => {
            const postTop = post.getBoundingClientRect().top + scrollY;
            const closestTop = closest.getBoundingClientRect().top + scrollY;
            return Math.abs(postTop - scrollY) < Math.abs(closestTop - scrollY) ? post : closest;
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
}