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
        const repostText = postElement.querySelector('[data-testid*="repostBy"]')?.textContent || '';
        if (isRepost) {
            const reposter = isRepost.textContent;
            // parts.push(`Reposted by ${reposter}`);
        }
        
        // Get timestamp
        const timestamp = postElement.querySelector('a[data-tooltip]');
        const timeText = timestamp?.textContent || '';
        // if (timestamp) {
        //     parts.push(`${timestamp.getAttribute('data-tooltip')}`);
        // }
        

        // Get author info
        const authorName = postElement.querySelector('div[dir="auto"] a[href^="/profile"] span[style*="font-weight: 600"]');
        const authorDisplayName = authorName?.textContent.trim() || '';

        // Get post content
        const content = postElement.querySelector('[data-testid="postText"]');
        const postText = content?.textContent.trim() || '';

        
        // const content = postElement.querySelector('[data-testid="postText"]');
        // if (content) {
        //     parts.push(`Post content: ${content.textContent}`);
        // }

        // Get engagement stats
        const replies = postElement.querySelector('[data-testid="replyBtn"] div')?.textContent || '0';
        const reposts = postElement.querySelector('[aria-label*="Repost"] + div')?.textContent || '0';
        const likes = postElement.querySelector('[data-testid="likeCount"]')?.textContent || '0';
        
        // Build engagement string
        const engagementParts = [];
        if (replies !== '0') engagementParts.push(`${replies} replies`);
        if (reposts !== '0') engagementParts.push(`${reposts} reposts`);
        if (likes !== '0') engagementParts.push(`${likes} likes`);

        const engagementText = engagementParts.length > 0 ? engagementParts.join(', ') : 'No engagement yet';

        // const stats = [];
        // if (replies) stats.push(`${replies.textContent} replies`);
        // if (likes) stats.push(`${likes.textContent} likes`);
        
        // if (stats.length > 0) {
        //     parts.push(`Engagement: ${stats.join(', ')}`);
        // }

        // Combine all parts
        return `${repostText} ${timeText} ${authorDisplayName} posted "${postText}". ${engagementText}`;

        // Check for media
        // const hasImage = postElement.querySelector('img[src*="feed_thumbnail"]');
        // if (hasImage) {
        //     parts.push('Contains image');
        // }

        // return parts.join('. ');
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