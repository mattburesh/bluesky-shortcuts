export function newPost() {
    const newPostButton = document.querySelector('[aria-label*="Compose post"]')
    if (newPostButton) newPostButton.click()
}

export function focusSearch(event) {
    event.preventDefault()
    const searchInput = document.querySelector('input[aria-label="Search"]')
    if (searchInput) {
        searchInput.focus()
    } else {
        const searchAnchor = document.querySelector('a[aria-label="Search"]')
        if (searchAnchor) {
            searchAnchor.click()
            waitForElement('input[aria-label="Search"]').then((element) => {
                element.focus()
            })
        }
    }
}

function waitForElement(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect()
                resolve(document.querySelector(selector))
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })
    })
}
