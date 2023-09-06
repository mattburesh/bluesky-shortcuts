# bsky-shortcuts 

A Firefox extension for adding shortcuts to bsky.app.

## Install

[![Available from FireFox Add-ons](assets/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/bsky-shortcuts/)
[![Available in the Chrome Web Store](assets/chrome.png)](https://chrome.google.com/webstore/detail/bsky-shortcuts/cimigenihbmedhakgecdgbjgmplfjkjj/1)

## Development

1. Make sure your `Node.js` version is >= 16
2. Run `npm install`
3. Run `npx webpack --config webpack.config.js`
4. Visit the firefox addon debuggin page
    1. or enter `about:debugging#/runtime/this-firefox` in the address bar
5. Click `Load Temporary Add-on`, and select `bsky-shortcuts/build`

## Shortcuts 

| Key | Action | Status|
|-----|--------|-------|
| J   | Move Down | Complete |
| K   | Move Up | Complete |
| L   | Like Post | Complete |
| R   | Reply  | Complete |
| T   | Repost / Quote | In Progress |
| N   | New Post | In Progress |
| Enter | Open Post | Broken[^1] |
| ?   | Show Shortcuts | In Progress |
| C   | Cycle Saved Feeds | Complete |

[^1]: https://github.com/mattburesh/bsky-shortcuts/issues/1
