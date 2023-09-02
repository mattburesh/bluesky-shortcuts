fs = require('fs')
path = require('path')

let fileName = path.dirname(__dirname) + '/src/manifest.json'
const __VERSION__ = process.env.npm_package_version

let manifestJSON = JSON.parse(fs.readFileSync(fileName, 'utf8'))
if (manifestJSON.version != __VERSION__) {
    console.log("Change in versions, updating manifest file...")
    manifestJSON.version = __VERSION__
}

