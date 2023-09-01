export class Feed {
    
    previousPost;
    currentPost;
    nextPost;

    constructor(postElements) {
        this.nextPost = postElements.children[0]
        console.log('Feed object constructed')
    }

    get previousPost() { return this.previousPost }
    set previousPost(post) { this.previousPost = post }

    get currentPost() { return this.currentPost }
    set currentPost(post) { this.currentPost = post }

    get nextPost() { return this.nextPost}
    set nextPost(post) { this.nextPost = post }

    likeToggleCurrentPost() {
        let like = this.currentPost.querySelector('[aria-label*="Like ("') ?? this.currentPost.querySelector('[aria-label*="Unlike ("')
        like.click()
    }

    moveToNextPost() {
        this.currentPost = this.nextPost
        this.previousPost = this.currentPost.previousSibling ?? this.currentPost
        this.nextPost = this.currentPost.nextSibling
        this.toggleCurrentPostHighlight()
        this.currentPost.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    }

    moveToPreviousPost() {
        if (!this.previousPost) return false

        this.currentPost = this.previousPost
        this.previousPost = this.currentPost.previousSibling ?? this.currentPost
        this.nextPost = this.currentPost.nextSibling
        this.toggleCurrentPostHighlight()
        this.currentPost.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    }

    /**
     * Open the selected post
     * 
     * The first instance of a url that matches the regex below should be the link for a given post
     * 
     * Todo: Replies that show up in a feed would need to be handled differently
     */
    openCurrentPost() {
        let links = this.currentPost.querySelectorAll('a[role="link"]')

        // here's a really bad regex that should probably be fixed
        const re = /^https:\/\/bsky.app\/profile\/.*\/post\/[a-zA-Z0-9]*$/
        links.forEach(element => {
            if (re.exec(element.href)) element.click()
        });
    }

    quoteCurrentPost() {}

    replyToCurrentPost() {
        let reply = this.currentPost.querySelector('[aria-label*="Reply ("')
        reply.click()
    }

    repostCurrentPost() {}

    toggleCurrentPostHighlight() {
        this.previousPost.style.removeProperty('border')
        this.nextPost.style.removeProperty('border')
        this.currentPost.style.border = '2px solid blue'
    }
}