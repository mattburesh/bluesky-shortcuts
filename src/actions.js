export function newPost() {
    const newPostButton = document.querySelector('[aria-label*="Compose post"]')
    if (newPostButton) newPostButton.click()
}
