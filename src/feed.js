export class Feed {
    activeFeed
    feeds
    previousPost
    currentPost
    nextPost
    feedListButtons = []

    constructor(postElements) {
        this.getPinnedFeeds()
        this.feeds = document.querySelectorAll(
            '[data-testid*="-feed-flatlist"]'
        )
        this.nextPost = postElements.children[0]
        console.log(this.nextPost)
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
    }

    cycleFeeds() {
        let done = false

        for (let i = 0; i < this.feeds.length; i++) {
            // if (done === true) {

            // }

            if (i === this.feedListButtons.length - 1) {
                this.feedListButtons[0].click()
                // this.setActiveFeed(this.feeds[i].children[0])
                console.log(this.feeds[i].childNodes[0].childNodes[0])
                this.setActiveFeed(this.feeds[i].childNodes.item(0))
                break
            }

            if (this.feeds[i].offsetParent !== null) {
                this.feedListButtons[i + 1].click()
                // this.setActiveFeed(this.feeds[i + 1].children[0])
                console.log(this.feeds[i + 1].childNodes[0].childNodes[0])
                this.setActiveFeed(this.feeds[i + 1].childNodes.item(0))
                break
            }
        }

        // for (let i = 0; i < this.feedList.length; i++) {
        //     if (done === true) {
        //         this.feedList[i].activetab = true
        //         this.feedList[i].click()
        //         // this.rebuildActiveFeed(this.feedList[i])
        //         break
        //     }

        //     if (this.feedList[i].activetab === true) {
        //         this.feedList[i].activetab = false
        //         done = true
        //     }

        //     if (i === this.feedList.length - 1) {
        //         this.feedList[i].activetab = false
        //         this.feedList[0].activetab = true
        //         this.feedList[0].click()
        //         this.rebuildActiveFeed(this.feedList[0])
        //         break
        //     }
        // }
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

    rebuildActiveFeed(feed) {
        let test = document.querySelectorAll('[data-testid*="-feed-flatlist"]')
    }

    replyToCurrentPost() {
        let reply = this.currentPost.querySelector('[aria-label*="Reply ("')
        reply.click()
    }

    repostCurrentPost() {}

    setActiveFeed(feed) {
        this.previousPost = null
        this.currentPost = null
        this.nextPost = feed.childNodes.item(0)

        // this.debugPostStatus()
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
