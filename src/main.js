import { Feed } from "./feed.js"
import { newPost, focusSearch } from "./actions"
import { waitForElement } from "./util"

console.log("bsky shortcuts running...")

let ready = false
let postFeed = null

// wait for the feed to load
waitForElement(
    'div[data-testid="followingFeedPage-feed-flatlist"] > div:nth-child(2)'
).then((element) => {
    postFeed = new Feed(element)
    ready = true
})

addEventListener("keydown", (event) => {
    // ignore shortcuts if the feed hasn't loaded yet
    if (ready === false) return false

    // ignore shortcuts if the reply/post window is open
    if (document.getElementsByClassName("ProseMirror-focused").length > 0)
        return false

    // ignore shortcuts if a modifier key is being held down
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
        return false

    if (event.code === "KeyJ") postFeed.moveToNextPost()
    if (event.code === "KeyK") postFeed.moveToPreviousPost()

    if (event.code === "KeyL") postFeed.likeToggleCurrentPost()
    if (event.code === "KeyR") postFeed.replyToCurrentPost()
    if (event.code === "KeyC") postFeed.cycleFeeds()
    // if (event.code === 'KeyT') // repost / quote repost
    if (event.code === "KeyN") newPost()
    if (event.code === "Slash") focusSearch(event)
    if (event.code === "Enter") postFeed.openCurrentPost()
    if (event.code === "Period") postFeed.loadNewPosts()
})
