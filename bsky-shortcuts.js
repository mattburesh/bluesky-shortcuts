console.log('bsky shortcuts running...')

window.bskyfunctions = {
    moveDown: 'actionMoveDown',
    moveUp: 'actionMoveUp',
    likePost: 'actionLikePost',
}

const keycodes = {
    KeyJ: "actionMoveDown",
    KeyK: "actionMoveUp",
    KeyL: "actionLikePost",
}

let ready = false
let postFeed = null
let currentSelection = null

// wait for the feed to load
waitForElement('div[data-testid="followingFeedPage-feed-flatlist"').then((element) => {
    postFeed = buildPostFeed()
    ready = true
})

addEventListener("keydown", (event) => {
    if (ready === false) return false
    if (this === document.activeElement) return false // ignore if you're typing? probably needs elaboration

    currentSelection = getCurrentSelection()

    if (event.code === 'KeyJ') return actionMoveDown()
    if (event.code === 'KeyK') return actionMoveUp()
    if (event.code === 'KeyL') return actionLikePost()

    postFeed = buildPostFeed()
    console.log(postFeed)
})

function actionMoveDown () {
    let feed = getPostFeed()
    let currentSelection = getCurrentSelection()
    let newSelection = currentSelection + 1
    if (feed[newSelection]) {
        feed[currentSelection].style.border = '0px solid black'
        setCurrentSelection(newSelection)
        feed[newSelection].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest" })
        feed[newSelection].style.border = '2px solid blue'
    } else {
        return false
    }

    postFeed = buildPostFeed()

    return true
}

function actionMoveUp () {
    let feed = getPostFeed()
    let currentSelection = getCurrentSelection()
    let newSelection = currentSelection - 1
    if (feed[newSelection]) {
        feed[currentSelection].style.border = '0px solid black'
        setCurrentSelection(newSelection)
        feed[newSelection].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest" })
        feed[newSelection].style.border = '2px solid blue'
    } else {
        return false
    }

    postFeed = buildPostFeed()

    return true
}

function actionLikePost () {
    return true
}

function getCurrentSelection () {
    if (currentSelection) return currentSelection

    return 0
}

function setCurrentSelection (index) {
    currentSelection = index
}

function getPostFeed () {
    return postFeed
}

function highlightPost (postNode) {
    postNode.style.border = '2px solid blue';
}

function buildPostFeed () {
    return document.querySelectorAll("div[data-testid*='feedItem-by-']")
}

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
