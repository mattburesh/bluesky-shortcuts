export class Feed {
    activeFeed
    feeds
    previousPost
    currentPost
    nextPost
    feedListButtons = []

    constructor(postElements) {
        this.getPinnedFeeds()
        this.checkFeedStatus()
        this.nextPost = postElements.children[0]
    }

    get previousPost() {
        return this.previousPost
    }
    set previousPost(post) {
        this.previousPost = post
    }

    get currentPost() {
        return this.currentPost
    }
    set currentPost(post) {
        this.currentPost = post
    }

    get nextPost() {
        return this.nextPost
    }
    set nextPost(post) {
        this.nextPost = post
    }

    checkFeedStatus() {
        this.feeds = document.querySelectorAll(
            '[data-testid*="-feed-flatlist"]'
        )
        console.log("Checking Feeds...")
        console.log(this.feeds)
    }

    cycleFeeds() {
        this.checkFeedStatus()
        let done = false

        for (let i = 0; i < this.feeds.length; i++) {
            // if (done === true) {

            // }

            if (i === this.feedListButtons.length - 1) {
                this.feedListButtons[0].click()
                this.setActiveFeed(this.feeds[i].children[0])
                // this.setActiveFeed(this.feeds[i].childNodes.item(0))
                break
            }

            if (this.feeds[i].offsetParent !== null) {
                this.feedListButtons[i + 1].click()
                this.setActiveFeed(this.feeds[i + 1].children[0])
                // this.setActiveFeed(this.feeds[i + 1].childNodes.item(0))
                break
            }
        }
    }

    getPinnedFeeds() {
        let feeds = document.querySelector(
            '[data-testid="homeScreenFeedTabs"] > div > div'
        ).children

        for (let item of feeds) {
            if (item.style.borderBottomColor === "rgb(0, 133, 255)") {
                item.activetab = true
            }
            this.feedListButtons.push(item)
        }
    }

    likeToggleCurrentPost() {
        let like =
            this.currentPost.querySelector('[aria-label*="Like ("') ??
            this.currentPost.querySelector('[aria-label*="Unlike ("')
        like.click()
    }

    loadNewPosts() {
        let loadPostsButton =
            document.querySelector('[aria-label*="Load new posts"') ?? null
        if (loadPostsButton) loadPostsButton.click()
    }

    moveToNextPost() {
        this.currentPost = this.nextPost
        this.previousPost = this.currentPost.previousSibling ?? this.currentPost
        this.nextPost = this.currentPost.nextSibling
        this.toggleCurrentPostHighlight()
        this.currentPost.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        })
    }

    moveToPreviousPost() {
        if (!this.previousPost) return false

        this.currentPost = this.previousPost
        this.previousPost = this.currentPost.previousSibling ?? this.currentPost
        this.nextPost = this.currentPost.nextSibling
        this.toggleCurrentPostHighlight()
        this.currentPost.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        })
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
        links.forEach((element) => {
            if (re.exec(element.href)) element.click()
        })
    }

    quoteCurrentPost() {}

    replyToCurrentPost() {
        let reply = this.currentPost.querySelector('[aria-label*="Reply ("')
        reply.click()
    }

    repostCurrentPost() {}

    setActiveFeed(postElements) {
        this.previousPost = null
        this.currentPost = null
        this.nextPost = postElements.children[0]
    }

    toggleCurrentPostHighlight() {
        if (this.previousPost) this.previousPost.style.removeProperty("border")
        if (this.nextPost) this.nextPost.style.removeProperty("border")
        if (this.currentPost) this.currentPost.style.border = "2px solid blue"
    }

    debugPostStatus() {
        console.log({
            previousPost: this.previousPost,
            currentPost: this.currentPost,
            nextPost: this.nextPost,
        })
    }
}
