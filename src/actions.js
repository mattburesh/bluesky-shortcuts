import { waitForElement } from "./util"

export function newPost() {
    const newPostButton = document.querySelector('[aria-label*="New post"]')
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
