import config from '../config/shortcuts.json';
import KeyboardShortcutManager from './keyboard-handler';
import DOMUtils from './dom-utils';
import Logger from '../utils/logger';
import * as css from "../assets/style.css";

class BlueSkyShortcuts {
    constructor() {
        this.currentFeedIndex = 0;
        this.feedTabs = [];
        this.currentPost = null

        this.logger = new Logger();
        this.initializeExtension();
    }

    async initializeExtension() {
        try {
            await this.waitForAppLoad();
            this.setupShortcuts();
            this.setupFeedTabs();
        } catch (error) {
            this.logger.error('Extension initialization failed', error);
        }
    }

    async waitForAppLoad() {
        await DOMUtils.waitForElement('div[data-testid="followingFeedPage-feed-flatlist"]');
    }

    setupFeedTabs() {
        try {
            const tabContainer = document.querySelector('[data-testid="homeScreenFeedTabs"] > div > div');
            this.feedTabs = [...tabContainer.children].map(tab => ({
                element: tab,
                isActive: tab.firstChild.style.getPropertyValue('border-bottom-color') ? true : false
            }));

            // Set initial active feed index
            this.currentFeedIndex = this.feedTabs.findIndex(tab => tab.isActive);
        } catch (error) {
            this.logger.error('Failed to initialize feed tabs', error);
        }
    }

    setupShortcuts() {
        const actionMap = {
            [config.shortcuts.nextPost]: this.moveToNextPost.bind(this),
            [config.shortcuts.previousPost]: this.moveToPreviousPost.bind(this),
            [config.shortcuts.likePost]: this.likePost.bind(this),
            [config.shortcuts.replyToPost]: this.replyToPost.bind(this),
            [config.shortcuts.cycleFeed]: this.cycleFeed.bind(this),
            // [config.shortcuts.newPost]: this.newPost,
            [config.shortcuts.openPost]: this.openPost.bind(this),
            // ... other shortcuts
        };

        new KeyboardShortcutManager(config, actionMap);
    }

    moveToNextPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();
        
        if (!this.currentPost) {
            // If no current post, select first visible post
            this.currentPost = visiblePosts[0];
        } else {
            // Find current post's index and move to next
            const currentIndex = visiblePosts.indexOf(this.currentPost);
            const nextIndex = Math.min(currentIndex + 1, visiblePosts.length - 1);
            this.currentPost = visiblePosts[nextIndex];
        }

        // Scroll and highlight
        DOMUtils.safelyScrollIntoView(this.currentPost);
    }

    moveToPreviousPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();
        
        if (!this.currentPost) {
            // If no current post, select last visible post
            this.currentPost = visiblePosts[visiblePosts.length - 1];
        } else {
            // Find current post's index and move to previous
            const currentIndex = visiblePosts.indexOf(this.currentPost);
            const previousIndex = Math.max(currentIndex - 1, 0);
            this.currentPost = visiblePosts[previousIndex];
        }

        // Scroll and highlight
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

    cycleFeed() {
        this.currentFeedIndex = (this.currentFeedIndex + 1) % this.feedTabs.length;
        this.feedTabs[this.currentFeedIndex].element.click();
        this.currentPost = null;
        this.waitForFeedLoad();
    }

    waitForFeedLoad() {
        const feedSelector = `[data-testid*="-feed-flatlist"]:nth-child(${this.currentFeedIndex + 1})`;
        
        DOMUtils.waitForElement(feedSelector)
            .then(feed => {
                // Prepare first post in new feed
                const firstPost = feed.querySelector('div[data-testid*="feedItem-by-"]');
                this.currentPost = firstPost;
            })
            .catch(error => {
                this.logger.error('Failed to load feed', error);
            });
    }

    newPost() {}
    
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
}

new BlueSkyShortcuts();