export class Feed {
    
    previousPost;
    currentPost;
    nextPost;
    feedList = []

    constructor(postElements) {
        this.getPinnedFeeds()
        this.nextPost = postElements.children[0]
    }

    get previousPost() { return this.previousPost }
    set previousPost(post) { this.previousPost = post }

    get currentPost() { return this.currentPost }
    set currentPost(post) { this.currentPost = post }

    get nextPost() { return this.nextPost}
    set nextPost(post) { this.nextPost = post }

    cycleFeeds() {
        let done = false 
        for (let i = 0; i < this.feedList.length; i++) {
            if (done === true) {
                this.feedList[i].activetab = true
                this.feedList[i].click()
                break
            }

            if (this.feedList[i].activetab === true) {
                this.feedList[i].activetab = false
                done = true
            }

            if (i === this.feedList.length - 1) {
                this.feedList[i].activetab = false
                this.feedList[0].activetab = true
                this.feedList[0].click()
                break
            }
        }
    }

    getPinnedFeeds() {
        let feeds = document.querySelector('[data-testid="homeScreenFeedTabs"] > div > div').children

        for (let item of feeds) {
            if (item.style.borderBottomColor === "rgb(0, 133, 255)") {
                item.activetab = true
            } 
            this.feedList.push(item)
        }
    }

    likeToggleCurrentPost() {
        let like = this.currentPost.querySelector('[aria-label*="Like ("') ?? this.currentPost.querySelector('[aria-label*="Unlike ("')
        like.click()
    }

    loadNewPosts() {
        let loadPostsButton = document.querySelector('[aria-label*="Load new posts"') ?? null
        if (loadPostsButton) loadPostsButton.click()
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

    reloadFeed() {}

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