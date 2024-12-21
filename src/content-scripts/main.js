import config from '../config/shortcuts.json';
import KeyboardShortcutManager from './keyboard-handler';
import ShortcutsModal from './shortcuts-modal';
import DOMUtils from './dom-utils';
import Logger from '../utils/logger';
import * as css from "../../assets/style.css";

class BlueSkyShortcuts {
    constructor() {
        this.currentFeedIndex = 0;
        this.feedTabs = [];
        this.currentPost = null;
        this.currentController = null;

        this.logger = new Logger();
        this.initializeExtension();
        this.shortcutsModal = new ShortcutsModal();
    }

    async initializeExtension() {
        try {
            await this.waitForAppLoad();
            this.setupShortcuts();
            try {
                await this.initializeFeedTabs();
            } catch (e) {
                this.logger.debug('Feed tabs not found - likely on a page without a feed');
            }
        } catch (error) {
            this.logger.error('Extension initialization failed', error);
        }
    }

    async waitForAppLoad() {
        await DOMUtils.waitForElement('div.css-175oi2r.r-13awgt0.r-12vffkv');
    }

    async initializeFeedTabs() {
        try {
            const tabContainer = await DOMUtils.waitForElement('[data-testid="homeScreenFeedTabs"] > div > div');
            this.feedTabs = [...tabContainer.children].map(tab => ({
                element: tab,
                isActive: tab.firstChild.style.getPropertyValue('border-bottom-color') ? true : false
            }));

            this.currentFeedIndex = this.feedTabs.findIndex(tab => tab.isActive);
            if (this.currentFeedIndex === -1) {
                this.logger.debug('No active tab found, defaulting to first tab');
                this.currentFeedIndex = 0;
            }
        } catch (error) {
            this.logger.error('Failed to initialize feed tabs', error);
            throw error;
        }
    }

    setupShortcuts() {
        const actionMap = {
            [config.shortcuts.nextPost]: {
                action: this.moveToNextPost.bind(this)
            },
            [config.shortcuts.previousPost]: {
                action: this.moveToPreviousPost.bind(this)
            },
            [config.shortcuts.likePost]: {
                action: this.likePost.bind(this)
            },
            [config.shortcuts.replyToPost]: {
                action: this.replyToPost.bind(this)
            },
            [config.shortcuts.repostPost]: {
                action: this.repostPost.bind(this),
                allowedModifiers: ['shift']
            },
            [config.shortcuts.cycleFeed]: {
                action: this.cycleFeed.bind(this),
                allowedModifiers: ['shift']
            },
            [config.shortcuts.openPost]: {
                action: this.openPost.bind(this)
            },
            [config.shortcuts.focusSearch]: {
                action: this.focusSearch.bind(this)
            },
            [config.shortcuts.expandPhoto]: {
                action: this.expandPhoto.bind(this)
            },
            [config.shortcuts.loadMore]: {
                action: this.loadMore.bind(this)
            },
            [config.shortcuts.showShortcuts]: {
                action: () => this.shortcutsModal.toggle(),
                allowedModifiers: ['shift']
            },
            [config.shortcuts.goHome]: {
                action: () => window.location.href = 'https://bsky.app/'
            },
            [config.shortcuts.goProfile]: {
                action: this.goHome.bind(this)
            },
            [config.shortcuts.goNotifications]: {
                action: () => window.location.href = 'https://bsky.app/notifications'
            },
            [config.shortcuts.goChat]: {
                action: () => window.location.href = 'https://bsky.app/messages'
            },
            [config.shortcuts.goFeeds]: {
                action: () => window.location.href = 'https://bsky.app/feeds'
            },
            [config.shortcuts.goLists]: {
                action: () => window.location.href = 'https://bsky.app/lists'
            },
            [config.shortcuts.goSettings]: {
                action: () => window.location.href = 'https://bsky.app/settings'
            },
        };

        new KeyboardShortcutManager(actionMap);
    }

    moveToNextPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }

        if (!this.currentPost) {
            this.currentPost = visiblePosts[0];
        } else {
            const currentIndex = visiblePosts.indexOf(this.currentPost);
            const nextIndex = Math.min(currentIndex + 1, visiblePosts.length - 1);
            this.currentPost = visiblePosts[nextIndex];
        }

        DOMUtils.safelyScrollIntoView(this.currentPost);
    }

    moveToPreviousPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }

        if (!this.currentPost) {
            this.currentPost = visiblePosts[visiblePosts.length - 1];
        } else {
            const currentIndex = visiblePosts.indexOf(this.currentPost);
            const previousIndex = Math.max(currentIndex - 1, 0);
            this.currentPost = visiblePosts[previousIndex];
        }

        DOMUtils.safelyScrollIntoView(this.currentPost);
    }

    likePost() {
        let like =
            this.currentPost.querySelector('[aria-label*="Like ("]') ??
            this.currentPost.querySelector('[aria-label*="Unlike ("]')
        like.click()
    }

    replyToPost() {
        let reply = this.currentPost.querySelector('[aria-label*="Reply ("]')
        reply.click()
    }

    repostPost(event) {
        if (!this.currentPost) {
            this.logger.warn('No post selected for repost');
            return;
        }

        const repostButton = this.currentPost.querySelector('[aria-label="Repost or quote post"]');
        if (!repostButton) {
            this.logger.warn('Repost button not found');
            return;
        }

        repostButton.click();

        // Wait for the repost menu to appear
        DOMUtils.waitForElement('[role="menuitem"]', 2000)
            .then(() => {
                const menuArray = Array.from(document.querySelectorAll('[role="menuitem"]'));
                
                if (event.shiftKey) {
                    const quoteItem = menuArray.find(item => item.getAttribute('aria-label') === 'Quote post');
                    if (quoteItem) {
                        quoteItem.click();
                    }
                } else {
                    const repostItem = menuArray.find(item => 
                        item.getAttribute('aria-label') === 'Repost' || 
                        item.getAttribute('aria-label') === 'Undo repost'
                    );
                    if (repostItem) {
                        repostItem.click();
                    }
                }
            })
            .catch(error => {
                this.logger.error('Failed to find repost menu', error);
            });
    }

    cycleFeed(event) {
        if (this.currentController) {
            this.currentController.abort();
        }

        const direction = event.shiftKey ? -1 : 1;
        this.currentFeedIndex = (this.currentFeedIndex + direction + this.feedTabs.length) % this.feedTabs.length;
        this.feedTabs[this.currentFeedIndex].element.click();
        this.currentPost = null;
        this.waitForFeedLoad();
    }

    waitForFeedLoad() {
        const feedSelector = `[data-testid*="-feed-flatlist"]:nth-child(${this.currentFeedIndex + 1})`;

        this.currentController = new AbortController();

        DOMUtils.waitForElement(feedSelector, 5000, this.currentController.signal)
            .then(feed => {
                const firstPost = feed.querySelector('div[data-testid*="feedItem-by-"]');
                this.currentPost = firstPost;
            })
            .catch(error => {
                if (error !== 'cancelled') {
                    this.logger.error('Failed to load feed', error);
                }
            });
    }

    openPost() {
        const postLinks = [...this.currentPost.querySelectorAll('a[role="link"]')];

        const postLink = postLinks.find(link =>
            /^https:\/\/bsky\.app\/profile\/[^/]+\/post\/[a-zA-Z0-9]+$/.test(link.href)
        );

        if (postLink) {
            postLink.click();
        } else {
            this.logger.warn('No valid post link found');
        }
    }

    expandPhoto() {
        const photoLink = this.currentPost.querySelector('img[src*="feed_thumbnail"]:not(a img)');

        if (photoLink) {
            photoLink.click();
        } else {
            this.logger.warn('No valid photo link found');
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('input[aria-label="Search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select(); // Optional: select all text for easy replacement
            return;
        }

        const searchAnchor = document.querySelector('a[aria-label="Search"]');
        if (searchAnchor) {
            searchAnchor.click();

            DOMUtils.waitForElement('input[aria-label="Search"]')
                .then(element => {
                    element.focus();
                    element.select();
                })
                .catch(error => {
                    this.logger.error('Failed to find search input', error);
                });
        }
    }

    async loadMore() {
        const loadPostsButton = document.querySelector('[aria-label*="Load new posts"]') ?? null;

        if (loadPostsButton) {
            loadPostsButton.click();
            this.currentPost = null;

            try {
                if (this.currentController) {
                    this.currentController.abort();
                }
                this.currentController = new AbortController();
                await DOMUtils.waitForElement('[data-testid*="-feed-flatlist"]', 5000, this.currentController.signal);
                await new Promise(resolve => setTimeout(resolve, 100));

                const visiblePosts = DOMUtils.findVisiblePosts();
                if (visiblePosts.length > 0) {
                    this.currentPost = visiblePosts[0];
                    DOMUtils.safelyScrollIntoView(this.currentPost);
                }
            } catch (error) {
                if (error !== 'cancelled') {
                    this.logger.error('Failed to load new posts', error);
                }
            }
        }
    }

    goHome() {
        const profileLink = document.querySelector('[aria-label="Profile"][role="link"]');
        if (profileLink) {
            profileLink.click();
        }
    }
}

new BlueSkyShortcuts();
