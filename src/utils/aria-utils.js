export default class AccessibilityUtils {
    constructor() {
        this.liveRegion = this.createLiveRegion();
    }

    createLiveRegion() {
        const region = document.createElement('div');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.setAttribute('class', 'sr-only');
        region.style.position = 'absolute';
        region.style.width = '1px';
        region.style.height = '1px';
        region.style.padding = '0';
        region.style.margin = '-1px';
        region.style.overflow = 'hidden';
        region.style.clip = 'rect(0, 0, 0, 0)';
        region.style.whiteSpace = 'nowrap';
        region.style.border = '0';
        document.body.appendChild(region);
        return region;
    }

    announcePostDetails(postElement) {
        console.log('announcing post details');
        if (!postElement) return;

        const announcement = this.buildPostAnnouncement(postElement);
        console.log(announcement);
        this.announce(announcement);
    }

    buildPostAnnouncement(postElement) {
        const parts = [];

        // Check if it's a repost
        const isRepost = postElement.querySelector('[data-testid*="repostBy"]');
        if (isRepost) {
            const reposter = isRepost.textContent;
            parts.push(`Reposted by ${reposter}`);
        }

        // Get author info
        const author = postElement.querySelector('a[aria-label*="avatar"] span');
        const handle = postElement.querySelector('span[class*="css"]').textContent;
        if (author) {
            parts.push(`Posted by ${author.textContent} ${handle}`);
        }

        // Get timestamp
        const timestamp = postElement.querySelector('a[data-tooltip]');
        if (timestamp) {
            parts.push(`${timestamp.getAttribute('data-tooltip')}`);
        }

        // Get post content
        const content = postElement.querySelector('[data-testid="postText"]');
        if (content) {
            parts.push(`Post content: ${content.textContent}`);
        }

        // Get engagement stats
        const replies = postElement.querySelector('[data-testid="replyBtn"]');
        const likes = postElement.querySelector('[data-testid="likeCount"]');
        
        const stats = [];
        if (replies) stats.push(`${replies.textContent} replies`);
        if (likes) stats.push(`${likes.textContent} likes`);
        
        if (stats.length > 0) {
            parts.push(`Engagement: ${stats.join(', ')}`);
        }

        // Check for media
        const hasImage = postElement.querySelector('img[src*="feed_thumbnail"]');
        if (hasImage) {
            parts.push('Contains image');
        }

        return parts.join('. ');
    }

    announce(message) {
        // Clear previous announcement
        this.liveRegion.textContent = '';
        
        // Trigger reflow
        void this.liveRegion.offsetWidth;
        
        // Set new announcement
        this.liveRegion.textContent = message;
    }

    addPostLabels(postElement) {
        if (!postElement) return;

        // Add proper ARIA labels to interactive elements
        const likeButton = postElement.querySelector('[data-testid="likeBtn"]');
        const replyButton = postElement.querySelector('[data-testid="replyBtn"]');
        const repostButton = postElement.querySelector('[aria-label*="Repost"]');

        if (likeButton) {
            const likeCount = likeButton.querySelector('[data-testid="likeCount"]');
            const count = likeCount ? likeCount.textContent : '0';
            likeButton.setAttribute('aria-label', `Like post, currently ${count} likes`);
        }

        if (replyButton) {
            const replyCount = replyButton.querySelector('div');
            const count = replyCount ? replyCount.textContent : '0';
            replyButton.setAttribute('aria-label', `Reply to post, currently ${count} replies`);
        }

        if (repostButton) {
            repostButton.setAttribute('aria-label', 'Repost or quote this post');
        }
    }
}