import {Feed} from './feed.js'

console.log('bsky shortcuts running...')

let ready = false
let postFeed = null

// wait for the feed to load
waitForElement('div[data-testid="followingFeedPage-feed-flatlist"] > div').then((element) => {
    postFeed = new Feed(element)
    ready = true
})

addEventListener("keydown", (event) => {
    if (ready === false) return false
    if (this === document.activeElement) return false // ignore if you're typing? probably needs elaboration

    if (event.code === 'KeyJ') postFeed.moveToNextPost()
    if (event.code === 'KeyK') postFeed.moveToPreviousPost()
    if (event.code === 'KeyL') postFeed.likeToggleCurrentPost()
    // if (event.code === 'KeyR') // reply
    // if (event.code === 'KeyT') // repost / quote repost
    // if (event.code === 'KeyN') // new post 
    // if (event.code === 'Slash' && event.shiftKey === true) // show shortcuts
    // if (event.code === 'Enter') // open post
})

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect()
                resolve(document.querySelector(selector))
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}

function querySelectorAllLive(element, selector) {
    let result = Array.prototype.slice.call(element.querySelectorAll(selector))
    console.log(result)

    let observer = new MutationObserver((mutations) => {
        console.log(mutations)
        mutations.forEach((mutation) => {
            [].forEach.call(mutation.addedNodes, (node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.matches(selector)) {
                    result.push(node)
                }
            })
        })
    })

    observer.disconnect()
}