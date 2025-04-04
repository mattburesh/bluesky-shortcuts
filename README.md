# bluesky-shortcuts 

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
6. Click `Load unpacked` in the top left and select the `bsky-shortcuts/build/chrome` folder

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Shortcuts

| Key                             | Action                             |
|---------------------------------|------------------------------------|
| <kbd>j</kbd>                    | Move Down                          |
| <kbd>k</kbd>                    | Move Up                            |
| <kbd>.</kbd>                    | Load More Posts                    |
| <kbd>Enter</kbd>                | Open Post                          |
| <kbd>l</kbd>                    | Like Post                          |
| <kbd>r</kbd>                    | Reply                              |
| <kbd>t</kbd>                    | Repost (press again to undo)       |
| <kbd>Shift</kbd> + <kbd>t</kbd> | Quote Post                         |
| <kbd>o</kbd>                    | Expand Image                       |
| <kbd>c</kbd>                    | Cycle Forward Through Saved Feeds  |
| <kbd>Shift</kbd> + <kbd>c</kbd> | Cycle Backward Through Saved Feeds |
| <kbd>v</kbd>                    | Select next link in post           |
| <kbd>Shift</kbd> + <kbd>v</kbd> | Select next previous link in post  |
| <kbd>Alt</kbd> + <kbd>a</kbd>   | Switch to next account             |
| <kbd>/</kbd>                    | Focus Search                       |
| <kbd>g</kbd> <kbd>h</kbd>       | Go to Home                         |
| <kbd>g</kbd> <kbd>p</kbd>       | Go to Profile                      |
| <kbd>g</kbd> <kbd>u</kbd>       | Go to post author profile          |
| <kbd>g</kbd> <kbd>n</kbd>       | Go to Notifications                |
| <kbd>g</kbd> <kbd>c</kbd>       | Go to Chat                         |
| <kbd>g</kbd> <kbd>f</kbd>       | Go to Feeds                        |
| <kbd>g</kbd> <kbd>l</kbd>       | Go to Lists                        |
| <kbd>g</kbd> <kbd>s</kbd>       | Go to Settings                     |
| <kbd>?</kbd>                    | Show Shortcuts                     |

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete list of changes.
