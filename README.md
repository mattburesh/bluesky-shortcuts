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

### Post Navigation
| Key                             | Action                             |
|---------------------------------|------------------------------------|
| <kbd>j</kbd>                    | Move to next post                  |
| <kbd>k</kbd>                    | Move to previous post              |
| <kbd>v</kbd>                    | Select next link in post           |
| <kbd>Shift</kbd> + <kbd>v</kbd> | Select previous link in post       |
| <kbd>.</kbd>                    | Load more posts                    |

### Post Actions
| Key                             | Action                             |
|---------------------------------|------------------------------------|
| <kbd>Enter</kbd>                | Open selected post/link            |
| <kbd>l</kbd>                    | Like post                          |
| <kbd>r</kbd>                    | Reply to selected post             |
| <kbd>t</kbd>                    | Repost (press again to undo)       |
| <kbd>Shift</kbd> + <kbd>t</kbd> | Quote post                         |
| <kbd>o</kbd>                    | Expand image                       |
| <kbd>h</kbd>                    | Hide post                          |
| <kbd>b</kbd>                    | Block account                      |
| <kbd>m</kbd>                    | Mute account                       |
| <kbd>x</kbd>                    | Report post                        |
| <kbd>y</kbd>                    | Copy post text                     |

### Application
| Key                             | Action                             |
|---------------------------------|------------------------------------|
| <kbd>c</kbd>                    | Cycle forward through saved feeds  |
| <kbd>Shift</kbd> + <kbd>c</kbd> | Cycle backward through saved feeds |
| <kbd>/</kbd>                    | Focus Search                       |
| <kbd>Alt</kbd> + <kbd>a</kbd>   | Switch to next account             |
| <kbd>?</kbd>                    | Show shortcuts                     |

### Go To
| Key                             | Action                             |
|---------------------------------|------------------------------------|
| <kbd>g</kbd> <kbd>h</kbd>       | Go to home                         |
| <kbd>g</kbd> <kbd>p</kbd>       | Go to profile                      |
| <kbd>g</kbd> <kbd>u</kbd>       | Go to post author profile          |
| <kbd>g</kbd> <kbd>n</kbd>       | Go to notifications                |
| <kbd>g</kbd> <kbd>c</kbd>       | Go to chat                         |
| <kbd>g</kbd> <kbd>f</kbd>       | Go to feeds                        |
| <kbd>g</kbd> <kbd>l</kbd>       | Go to lists                        |
| <kbd>g</kbd> <kbd>s</kbd>       | Go to settings                     |



## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete list of changes.
