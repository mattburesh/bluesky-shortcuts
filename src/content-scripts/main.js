import config from '../config/shortcuts.json';
import KeyboardShortcutManager from './keyboard-handler';
import ShortcutsModal from './shortcuts-modal';
import DOMUtils from './dom-utils';
import Logger from '../utils/logger';
import AppState from './state-management';
import * as css from "../../assets/style.css";

class BlueSkyShortcuts {
    constructor() {
        this.appState = new AppState();
        this.logger = new Logger();
        this.shortcutsModal = new ShortcutsModal();

        this.appState.subscribe(this.handleStateChange.bind(this));
        this.initializeExtension();
        this.logger.debug('Extension initialized');

        window.addEventListener('unload', () => {
            this.appState.cleanup();
        });
    }

    async handleStateChange(state) {
        this.logger.debug('State changed:', state);
        if (state.location === '/') {
            await this.initializeFeedTabs();
        }
    }

    async initializeExtension() {
        try {
            await this.waitForAppLoad();
            this.setupShortcuts();
            this.shortcutsModal = new ShortcutsModal();
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
        if (this._initializeTimeout) {
            clearTimeout(this._initializeTimeout);
        }

        this._initializeTimeout = setTimeout(async () => {
            try {
                const tabContainer = await DOMUtils.waitForElement('[data-testid="homeScreenFeedTabs"] > div > div');
                const feedTabs = [...tabContainer.children].map(tab => ({
                    element: tab,
                    isActive: !!tab.firstChild.querySelector('div[style*="background-color"]')
                }));

                const currentFeedIndex = feedTabs.findIndex(tab => tab.isActive);
                this.appState.updateState({
                    feedTabs,
                    currentFeedIndex: currentFeedIndex === -1 ? 0 : currentFeedIndex
                });
            } catch (error) {
                this.logger.error('Failed to initialize feed tabs', error);
                throw error;
            }
        }, 100);
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
            [config.shortcuts.hidePost]: {
                action: () => this.handleOptionsAction('hide post', 'postDropdownHideBtn')
            },
            [config.shortcuts.blockAccount]: {
                action: () => this.handleOptionsAction('block account', 'postDropdownBlockBtn')
            },
            [config.shortcuts.reportPost]: {
                action: () => this.handleOptionsAction('report post', 'postDropdownReportBtn')
            },
            [config.shortcuts.copyPostText]: {
                action: () => this.handleOptionsAction('copy post text', 'postDropdownCopyTextBtn')
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

        const { currentPost } = this.appState.state;
        let nextPost;

        if (!currentPost) {
            nextPost = visiblePosts[0];
        } else {
            const currentIndex = visiblePosts.indexOf(currentPost);
            const nextIndex = Math.min(currentIndex + 1, visiblePosts.length - 1);
            nextPost = visiblePosts[nextIndex];
        }

        this.appState.updateState({ currentPost: nextPost });
        DOMUtils.safelyScrollIntoView(nextPost);
    }

    moveToPreviousPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }

        const { currentPost } = this.appState.state;
        let prevPost;

        if (!currentPost) {
            prevPost = visiblePosts[visiblePosts.length - 1];
        } else {
            const currentIndex = visiblePosts.indexOf(currentPost);
            const previousIndex = Math.max(currentIndex - 1, 0);
            prevPost = visiblePosts[previousIndex];
        }

        this.appState.updateState({ currentPost: prevPost });
        DOMUtils.safelyScrollIntoView(prevPost);
    }

    likePost() {
        const { currentPost } = this.appState.state;
        if (!currentPost) return;

        let like =
            currentPost.querySelector('[aria-label*="Like ("]') ??
            currentPost.querySelector('[aria-label*="Unlike ("]')
        like?.click()
    }

    replyToPost() {
        const { currentPost } = this.appState.state;
        if (!currentPost) return;

        let reply = currentPost.querySelector('[aria-label*="Reply ("]')
        reply?.click()
    }

    repostPost(event) {
        const { currentPost } = this.appState.state;
        if (!currentPost) return;

        const repostButton = currentPost.querySelector('[aria-label="Repost or quote post"]');
        if (!repostButton) {
            this.logger.warn('Repost button not found');
            return;
        }

        repostButton?.click();

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

                    repostItem?.click();
                }
            })
            .catch(error => {
                this.logger.error('Failed to find repost menu', error);
            });
    }

    cycleFeed(event) {
        const { feedTabs, currentFeedIndex } = this.appState.state;

        if (!feedTabs.length) {
            this.logger.warn('No feed tabs available');
            return;
        }

        const direction = event.shiftKey ? -1 : 1;
        const newIndex = (currentFeedIndex + direction + feedTabs.length) % feedTabs.length;
        const targetTab = feedTabs[newIndex];
        if (!targetTab?.element) {
            this.logger.error('Invalid feed tab');
            return;
        }

        targetTab.element.click();
        this.appState.updateState({
            currentFeedIndex: newIndex,
            currentPost: null,
            feedTabs: feedTabs.map((tab, i) => ({
                ...tab,
                isActive: i === newIndex
            }))
        });

        this.waitForFeedLoad();
    }

    waitForFeedLoad() {
        const feedSelector = '[data-testid*="-feed-flatlist"]';

        if (this.appState.state.currentController) {
            this.appState.state.currentController.abort();
        }

        const controller = new AbortController();
        this.appState.updateState({ currentController: controller });

        DOMUtils.waitForElement(feedSelector, 5000, controller.signal)
            .then(feed => {
                const firstPost = feed.querySelector('div[data-testid*="feedItem-by-"]');
                this.appState.updateState({ currentPost: firstPost });
            })
            .catch(error => {
                if (error !== 'cancelled') {
                    this.logger.error('Failed to load feed', error);
                }
            });
    }

    openPost() {
        const { currentPost } = this.appState.state;
        if (!currentPost) return;

        const postLinks = [...currentPost.querySelectorAll('a[role="link"]')];

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
        const { currentPost } = this.appState.state;
        if (!currentPost) return;

        const photoLink = currentPost.querySelector('img[src*="feed_thumbnail"]:not(a img)');

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

            const { currentPost } = this.appState.state;
            this.appState.updateState({ currentPost: null });

            try {
                if (this.currentController) {
                    this.currentController.abort();
                }
                this.currentController = new AbortController();
                await DOMUtils.waitForElement('[data-testid*="-feed-flatlist"]', 5000, this.currentController.signal);
                await new Promise(resolve => setTimeout(resolve, 100));

                const visiblePosts = DOMUtils.findVisiblePosts();
                if (visiblePosts.length > 0) {
                    this.appState.updateState({ currentPost: visiblePosts[0] });
                    DOMUtils.safelyScrollIntoView(currentPost);
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

    async handleOptionsAction(actionType, testId) {
        const { currentPost } = this.appState.state;

        if (!currentPost) {
            this.logger.error('No current post');
            return;
        }

        if (!this.clickPostOptionsButton()) {
            this.logger.error('No more button');
            return;
        }

        try {
            await DOMUtils.waitForElement('[role="menuitem"]', 2000);
            const menuArray = Array.from(document.querySelectorAll('[role="menuitem"]'));
            const actionBtn = menuArray.find(item => item.getAttribute('data-testid') === testId);
            actionBtn?.click();
        } catch (error) {
            this.logger.error(`Failed to ${actionType}`, error);
        }
    }

    clickPostOptionsButton() {
        const { currentPost } = this.appState.state;
        if (!currentPost) return;

        const optionsButton = currentPost.querySelector('[aria-label="Open post options menu"]');
        if (!optionsButton) {
            return false;
        }

        optionsButton.click();
        return true;
    }
}

new BlueSkyShortcuts();
