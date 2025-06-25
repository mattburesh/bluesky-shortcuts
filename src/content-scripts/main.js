import config from '../config/shortcuts.json';
import KeyboardShortcutManager from './keyboard-handler';
import ShortcutsModal from './shortcuts-modal';
import DOMUtils from './dom-utils';
import Logger from '../utils/logger';
import AppState from './state-management';
import * as css from "../../assets/style.css";

class BlueSkyShortcuts {
    constructor() {
        this.logger = new Logger({
            debugMode: process.env.NODE_ENV !== 'production',
            prefix: '[BlueSky Shortcuts]',
            logLevel: process.env.NODE_ENV !== 'production' ? 'debug' : 'warn'
        });

        window.__bskyShortcuts = this;

        this.appState = new AppState();
        this.initialize().catch(error => {
            this.logger.error('Failed to initialize extension: ', error);
        })
    }

    async initialize() {
        try {
            await this.waitForAppLoad();
            this.logger.debug('App loaded, starting initialization');

            await this.initializeComponents();

            this.setupEventListeners();

            if (window.location.pathname === '/') {
                await this.initializeFeedTabs();
            }

            this.logger.debug('Extension initialization complete');
        } catch (error) {
            this.logger.debug('Extension initialization failed', error);
            throw error;
        }
    }

    async initializeComponents() {
        this.shortcutsModal = new ShortcutsModal();

        this.keyboardShortcutManager = new KeyboardShortcutManager(this.createActionMap());

        this.appState.subscribe(this.handleStateChange.bind(this));
    }

    setupEventListeners() {
        this.boundCleanup = () => this.cleanup();
        this.boundHandleNavigation = () => this.handleNavigation(window.location.pathname);

        window.addEventListener('unload', this.boundCleanup);
        window.addEventListener('popstate', this.boundHandleNavigation);
    }

    async waitForAppLoad() {
        await DOMUtils.waitForElement('div#root > div:not(#splash)');
    }

    async initializeFeedTabs(forceUpdate = false) {
        if (this._initializeTimeout) {
            clearTimeout(this._initializeTimeout);
        }

        if (this._initializing) {
            return;
        }
        this._initializing = true;

        try {
            const tabContainer = await DOMUtils.waitForElement('[data-testid="homeScreenFeedTabs"] > div > div');
            const feedTabs = [...tabContainer.children].map((tab, index) => {
                if (!tab._hasClickListener) {
                    tab.addEventListener('click', () => {
                        this.handleFeedTabClick(index);
                    });
                    tab._hasClickListener = true;
                }

                return {
                    element: tab,
                    isActive: !!tab.firstChild.querySelector('div[style*="background-color"]')
                };
            });
            // Only update the state if it hasn't been initialized yet
            if (!this.appState.state.feedTabs?.length || forceUpdate) {
                const currentFeedIndex = feedTabs.findIndex(tab => tab.isActive);
                this.appState.updateState({
                    feedTabs,
                    currentFeedIndex: currentFeedIndex === -1 ? 0 : currentFeedIndex
                });
            }
        } catch (error) {
            this.logger.error('Failed to initialize feed tabs', error);
            throw error;
        } finally {
            this._initializing = false;
        }
    }

    createActionMap() {
        return {
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
            [config.shortcuts.cycleLink]: {
                action: this.cycleLink.bind(this),
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
            [config.shortcuts.accountSwitcher]: {
                action: this.switchAccount.bind(this),
                requiredModifiers: ['alt']
            },
            [config.shortcuts.showShortcuts]: {
                action: () => this.shortcutsModal.toggle(),
                allowedModifiers: ['shift']
            },
            [config.shortcuts.goHome]: {
                action: () => this.navigateTo('/')
            },
            [config.shortcuts.goProfile]: {
                action: this.goProfile.bind(this)
            },
            [config.shortcuts.goUserProfile]: {
                action: this.goUserProfile.bind(this)
            },
            [config.shortcuts.goNotifications]: {
                action: () => this.navigateTo('/notifications')
            },
            [config.shortcuts.goChat]: {
                action: () => this.navigateTo('/messages')
            },
            [config.shortcuts.goFeeds]: {
                action: () => this.navigateTo('/feeds')
            },
            [config.shortcuts.goLists]: {
                action: () => this.navigateTo('/lists')
            },
            [config.shortcuts.goSettings]: {
                action: () => this.navigateTo('/settings')
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
            }
        };
    }

    navigateTo(path) {
        try {
            const currentPath = window.location.pathname;
            if (currentPath === path) {
                this.logger.debug('Already on path:', path);
                return;
            }

            this.logger.debug('Navigating to:', path);
            
            window.location.href = `https://bsky.app${path}`;

            this.handleNavigation(path);
        } catch (error) {
            this.logger.error('Navigation failed: ', error);
        }
    }

    async handleStateChange(state) {
        this.logger.debug('State changed:', state);
    }

    handleNavigation(newPath, forceUpdate = false) {
        this.logger.debug('Navigation occurred to:', newPath);

        if (this.appState.state.currentController) {
            this.appState.state.currentController.abort();
        }

        const isFeedView = newPath === '/' || newPath.startsWith('/profile/');
        this.appState.updateState({ 
            location: newPath,
            currentController: null,
            ...(isFeedView ? {} : { currentPost: null, currentLinkIndex: -1 })
        });

        if (newPath === '/') {
            this.initializeFeedTabs(forceUpdate).catch(error => {
                this.logger.error('Failed to initialize feed tabs after navigation', error);
            });
        }

        setTimeout(() => {
            this.selectNearestVisiblePost().catch(error => {
                    this.logger.error('Failed to select nearest post', error);
                });
        }, 50);
    }

    moveToNextPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }

        const { currentPost } = this.appState.state;
        let nextPost;

        if (!currentPost || !DOMUtils.isValidElement(currentPost)) {
            nextPost = visiblePosts[0]
        } else {
            const currentIndex = visiblePosts.indexOf(currentPost);
            if (currentIndex === -1) {
                nextPost = DOMUtils.findPostByCurrentPosition(visiblePosts, currentPost);
            } else {
                const nextIndex = Math.min(currentIndex + 1, visiblePosts.length - 1);
                nextPost = visiblePosts[nextIndex];
            }
        }

        this.resetFocus();
        this.appState.updateState({ currentPost: nextPost, currentLinkIndex: -1 });
        DOMUtils.safelyScrollIntoView(nextPost, { behavior: 'instant' });

        if (nextPost) {
            nextPost.tabIndex = 0;
            nextPost.focus({ preventScroll: true });
        }
    }

    moveToPreviousPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }

        const { currentPost } = this.appState.state;
        let prevPost;

        if (!currentPost || !DOMUtils.isValidElement(currentPost)) {
            prevPost = visiblePosts[0]
        } else {
            const currentIndex = visiblePosts.indexOf(currentPost);
            if (currentIndex === -1) {
                prevPost = DOMUtils.findPostByCurrentPosition(visiblePosts, currentPost);
            } else {
                const previousIndex = Math.max(currentIndex - 1, 0);
                prevPost = visiblePosts[previousIndex];
            }
        }

        this.resetFocus();
        this.appState.updateState({ currentPost: prevPost, currentLinkIndex: -1 });
        DOMUtils.safelyScrollIntoView(prevPost, { behavior: 'instant' });

        if (prevPost) {
            prevPost.tabIndex = 0;
            prevPost.focus({ preventScroll: true });
        }
    }

    async selectNearestVisiblePost() {
        try {
            const visiblePosts = DOMUtils.findVisiblePosts();
            if (!visiblePosts.length) {
                this.logger.warn('No visible posts found');
                return null
            }

            // Get viewport dimensions
            const viewportHeight = window.innerHeight;
            const scrollTop = window.scrollY;
            const viewportCenter = scrollTop + (viewportHeight / 2);
            
            // Find post closest to the center of the viewport
            let targetPost = visiblePosts.reduce((closest, post) => {
                const rect = post.getBoundingClientRect();
                const postCenter = rect.top + (rect.height / 2) + window.scrollY;
                
                if (!closest) return post;
                
                const closestCenter = closest.getBoundingClientRect().top + 
                                    (closest.getBoundingClientRect().height / 2) + 
                                    window.scrollY;
                
                // Use distance to viewport center as the metric
                return Math.abs(postCenter - viewportCenter) < 
                    Math.abs(closestCenter - viewportCenter) ? post : closest;
            }, null);

            if (targetPost) {
                this.resetFocus();
                this.appState.updateState({
                    currentPost: targetPost,
                    currentLinkIndex: -1
                });

                DOMUtils.safelyScrollIntoView(targetPost, { skipScroll: true });
                return targetPost;
            }
        } catch (error) {
            this.logger.error('Failed to select first visible post', error);
        }

        return null;
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

        this.appState.updateState({
            currentFeedIndex: newIndex,
            currentPost: null,
            feedTabs: feedTabs.map((tab, i) => ({
                ...tab,
                isActive: i === newIndex
            }))
        });

        const loadPromise = this.waitForFeedLoad();

        targetTab.element.click();

        return loadPromise;
    }

    cycleLink(event) {
        const { currentPost, currentLinkIndex } = this.appState.state;
        if (!currentPost) return;

        this.logger.debug('Cylcling links');

        document.querySelectorAll('.bsky-highlighted-link').forEach(el => {
            el.classList.remove('bsky-highlighted-link');
        });

        const contentSelectors = [
            '[data-testid*="postText"]',
            '[data-testid*="postThreadItem-by-"] > div:last-child > div:last-child > div:nth-child(2)'
        ]

        /**
        * Find all links within a post's content area.
        * Uses contentSelectors to target both feed posts and thread posts.
        * Returns first non-empty array of links found, or an empty array if none exist.
        */
        const links = contentSelectors
            .reduce((foundLinks, selector) => {
                if (foundLinks.length) return foundLinks;
                const content = currentPost.querySelector(selector);
                return content ? [...content.querySelectorAll('a[role="link"][href]')] : [];
            }, []);

        if (!links.length) {
            this.logger.debug('No links found in post.');
            return;
        }

        const direction = event.shiftKey ? -1 : 1;
        let newIndex = currentLinkIndex + direction;

        if (newIndex >= links.length) newIndex = -1;
        if (newIndex < -1) newIndex = links.length -1;

        if (newIndex === -1) {
            this.appState.updateState({ currentLinkIndex: -1 });
            currentPost.focus();
        } else {
            const targetLink = links[newIndex];
            if (targetLink) {
                targetLink.classList.add('bsky-highlighted-link');
                targetLink.focus();
                this.appState.updateState({ currentLinkIndex: newIndex });
            }
        }
    }

    handleFeedTabClick(index) {
        const { feedTabs } = this.appState.state;
        if (index === this.appState.state.currentFeedIndex) {
            return;
        }

        this.appState.updateState({
            currentFeedIndex: index,
            currentPost: null,
            feedTabs: feedTabs.map((tab, i) => ({
                ...tab,
                isActive: i === index
            }))
        });

        return this.waitForFeedLoad();
    }

    waitForFeedLoad() {
        const feedSelector = '[data-testid*="-feed-flatlist"]';

        if (this.appState.state.currentController) {
            this.appState.state.currentController.abort();
        }

        const controller = new AbortController();
        this.appState.updateState({ currentController: controller });

        return new Promise((resolve, reject) => {
            DOMUtils.waitForElement(feedSelector, 5000, controller.signal)
            .then(feed => {
                return new Promise(r => setTimeout(r, 100))
                    .then(() => feed);
            })
            .then(feed => {
                const firstPost = feed.querySelector('div[data-testid*="feedItem-by-"]');
                if (firstPost) {
                    this.appState.updateState({ currentPost: firstPost });
                    resolve(firstPost);
                } else {
                    reject(new Error('No posts found after feed load'));
                }
            })
            .catch(error => {
                if (error !== 'cancelled') {
                    this.logger.error('Failed to load feed', error);
                    reject(error);
                }
            });
        }); 
    }

    openPost() {
        const { currentPost } = this.appState.state;
        if (this.handleHighlightedLink()) {
            return;
        }

        const focusedPost = document.activeElement.matches('[data-testid*="feedItem-by-"], [data-testid*="postThreadItem-by-"]') 
            ? document.activeElement 
            : this.appState.state.currentPost;
        
        if (!focusedPost || !DOMUtils.isValidElement(focusedPost)) {
            this.logger.debug('No valid focused post, attempting to select first visible post');
            return this.selectNearestVisiblePost();
        }

        const postLinks = [...currentPost.querySelectorAll('a[role="link"]')];

        const postLink = postLinks.find(link =>
            /^https:\/\/bsky\.app\/profile\/[^/]+\/post\/[a-zA-Z0-9]+$/.test(link.href)
        );

        if (postLink) {
            document.querySelectorAll('.bsky-highlighted-post').forEach(el => {
                el.classList.remove('bsky-highlighted-post');
            });
            postLink.click();
            this.handleNavigation(postLink.pathname);
        } else {
            this.logger.warn('No valid post link found');
        }
    }

    handleHighlightedLink() {
        const { currentPost, currentLinkIndex } = this.appState.state;
        
        // If a link is focused via cycle links, click it
        if (currentLinkIndex !== -1 && currentPost) {
            const postContent = currentPost.querySelector('[data-testid*="postText"]');
            if (postContent) {
                const links = [...postContent.querySelectorAll('a[role="link"]')];
                const targetLink = links[currentLinkIndex];
                if (targetLink) {
                    targetLink.click();
                    targetLink.classList.remove('bsky-highlighted-link');
                    this.appState.updateState({ currentLinkIndex: -1 });
                    return true;
                }
            }
        }
    
        // Check for highlighted link class
        const highlightedLink = document.querySelector('.bsky-highlighted-link');
        if (highlightedLink) {
            this.resetFocus();
            highlightedLink.click();
            highlightedLink.classList.remove('bsky-highlighted-link');
            return true;
        }
        
        return false;
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
            searchInput.select();
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
        const loadPostsButton = document.querySelector( 'div[data-testid="loadLatestBtn"] button') ?? null;

        if (loadPostsButton) {
            this.appState.updateState({ currentPost: null });
            
            const { currentController } = this.appState.state;
            if (currentController) {
                currentController.abort();
            }
    
            const newController = new AbortController();
            this.appState.updateState({ currentController: newController });

            loadPostsButton.click();
    
            try {
                await DOMUtils.waitForElement('[data-testid*="-feed-flatlist"]', 5000, newController.signal);
                await new Promise(resolve => setTimeout(resolve, 300));
                const visiblePosts = DOMUtils.findVisiblePosts();
                
                if (visiblePosts.length > 0) {
                    const firstPost = visiblePosts[0];
                    this.logger.debug('Selecting first post after loading new posts:', firstPost);
                    this.appState.updateState({ currentPost: firstPost });
                    DOMUtils.safelyScrollIntoView(firstPost);
                }
            } catch (error) {
                if (error !== 'cancelled') {
                    this.logger.error('Failed to load new posts', error);
                }
            }
        }
    }

    switchAccount() {
        const { lastAccount, knownAccounts } = this.appState.state;
        try {
            const profileButton = document.querySelector('button[aria-label="Switch accounts"]')
            if (!profileButton) {
                this.logger.warn('Can\'t switch accounts, profile button not found');
                return;
            }
            profileButton.click();

            DOMUtils.waitForElement('[role="menuitem"][aria-label^="Switch to"]', 50, null, { maxRetries: 0, retryDelay: 0 })
                .then(element => {
                    const accountOptions = Array.from(document.querySelectorAll('[role="menuitem"][aria-label^="Switch to"]'))

                    if (accountOptions.length === 0) {
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                        this.logger.info('No other accounts to switch to');
                        return;
                    }

                    const dropdownUsernames = accountOptions.map(opt => {
                        const label = opt.getAttribute('aria-label') || '';
                        const handle = label.substring(label.indexOf('@'));
                        return handle;
                    }).filter(Boolean);

                    // add accounts to state if they are missing
                    dropdownUsernames.forEach(username => {
                        if (!knownAccounts.includes(username)) {
                            knownAccounts.push(username);
                        }
                    });
                    knownAccounts.sort();

                    const currentIndex = knownAccounts.indexOf(lastAccount) || 0;
                    const nextIndex = (currentIndex + 1) % knownAccounts.length;
                    const nextUsername = knownAccounts[nextIndex];
                    const targetAccount = accountOptions.find(opt => {
                        const label = opt.getAttribute('aria-label') || '';
                        return label.includes(nextUsername)
                    });

                    this.appState.updateState({
                        knownAccounts: knownAccounts,
                        lastAccount: nextUsername
                    })

                    if (targetAccount) {
                        targetAccount.click();

                        this.logger.debug("switchAccount has just been called");

                        this.appState.updateState({
                            feedTabs: [],
                            currentFeedIndex: 0,
                            currentPost: null,
                            currentLinkIndex: -1,
                            currentController: null
                        });

                        setTimeout(async () => {
                            if (window.location.pathname === '/') {
                                try {
                                    // Remove the feed tab click listener 
                                    const originalHandleFeedTabClick = this.handleFeedTabClick;
                                    this.handleFeedTabClick = () => {}; 
                                    
                                    const tabContainer = await DOMUtils.waitForElement('[data-testid="homeScreenFeedTabs"] > div > div', 2000);
                                    
                                    const tabElements = [...tabContainer.children];
                                    if (tabElements.length > 0) {
                                        tabElements[0].click();
                                        
                                        await new Promise(resolve => setTimeout(resolve, 100));
                                        await this.initializeFeedTabs(true);
                                        
                                        this.appState.updateState({
                                            currentFeedIndex: 0,
                                            feedTabs: this.appState.state.feedTabs.map((tab, i) => ({
                                                ...tab,
                                                isActive: i === 0
                                            }))
                                        });
                                    }
                                    
                                    // Restore the original handler
                                    this.handleFeedTabClick = originalHandleFeedTabClick;
                                } catch (error) {
                                    this.logger.error('Failed to initialize feed tabs after count switch', error);
                                }
                            }

                            this.handleNavigation(window.location.pathname, true);

                            setTimeout(() => {
                                this.selectNearestVisiblePost().catch(error => {
                                    this.logger.error('Failed to select post after account switch', error);
                                });
                            }, 150);
                        }, 250);
                    } else {
                        this.logger.error('Target account not in dropdown, using first available');
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                    }
                })
                .catch(error => {
                    this.logger.error('Failed to find account menu items', error);
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                });
        } catch (error) {
            this.logger.error('Error in switch account', error);
        }
    }

    goProfile() {
        const profileLink = document.querySelector('[aria-label="Profile"][role="link"]');
        if (profileLink) {
            profileLink.click();
        }
    }

    goUserProfile() {
        const { currentPost } = this.appState.state;
        console.log('go to profile');

        try {
            if (currentPost) {
                const isRepost = currentPost.querySelector('[aria-label*="Reposted by"]') !== null;
                const profileLinks = currentPost.querySelectorAll('a[href*="/profile/"]');
                const authorLink = isRepost ? profileLinks[1] : profileLinks[0];

                if (authorLink) {
                    this.logger.debug('Found author profile link:', authorLink.href);
                    authorLink.click();
                    return;
                }
                this.logger.debug('No author profile link found in current post');
            }

            this.logger.debug('No author profile link found in current post');
        } catch (error) {
            this.logger.error('Error opening user profile', error);
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

    resetFocus() {
        document.querySelectorAll('.bsky-highlighted-link').forEach(element => {
            element.classList.remove('bsky-highlighted-link');
            element.blur();
        })

        document.querySelectorAll('[data-testid*="feedItem-by-"], [data-testid*="postThreadItem-by-"]').forEach(post => {
            post.blur();
        });
    }

    cleanup() {
        this.logger.debug('Starting cleanup');

        this.appState.cleanup();
        this.keyboardShortcutManager?.cleanup();
        this.shortcutsModal?.cleanup();

        window.removeEventListener('unload', this.boundCleanup);
        window.removeEventListener('popstate', this.boundHandleNavigation);

        this.logger.debug('Cleanup complete');
    }
}

new BlueSkyShortcuts();
