# bsky-shortcuts 

A browser extension for adding shortcuts to bsky.app.

## Install

[![Available from FireFox Add-ons](assets/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/bluesky-shortcuts/)
[![Available in the Chrome Web Store](assets/chrome.png)](https://chrome.google.com/webstore/detail/bsky-shortcuts/cimigenihbmedhakgecdgbjgmplfjkjj/1)

## Development

### Firefox

1. Make sure your `Node.js` version is >= 16
2. Run `npm install`
3. Run `npx webpack --config webpack.config.js`
4. Visit the [firefox addon debugging page](about:debugging#/runtime/this-firefox)
    1. (or enter `about:debugging#/runtime/this-firefox` in the address bar)
5. Click `Load Temporary Add-on`, and select `bsky-shortcuts/build`

### Chrome

1. Make sure your `Node.js` version is >= 16
2. run 'npm install'
3. run `npx webpack --config webpack.config.js`
4. Visit the [chrome extensions page](chrome://extensions/)
    1. (or enter `chrome://extensions/` in the Chrome address bar)
5. Enable `Developer mode` in the top right
6. Click `Load unpacked` in the top left and select the `bsky-shortcuts/build` folder

## Shortcuts 

## Shortcuts

| Key | Action |
|-----|---------|
| j   | Move Down |
| k   | Move Up |
| .   | Load More Posts |
| Enter | Open Post |
| l   | Like Post |
| r   | Reply |
| t   | Repost (press again to undo) |
| Shift + t | Quote Post |
| o   | Expand Image |
| c   | Cycle Forward Through Saved Feeds |
| Shift + c | Cycle Backward Through Saved Feeds |
| /   | Focus Search |
| g h | Go to Home |
| g p | Go to Profile |
| g n | Go to Notifications |
| g c | Go to Chat |
| g f | Go to Feeds |
| g l | Go to Lists |
| g s | Go to Settings |
| ?   | Show Shortcuts |
