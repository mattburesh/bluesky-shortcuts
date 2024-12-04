const path = require('path')
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');

function generateManifest(browser) {
    const baseManifest = require('./src/manifest.json');

    if (browser === 'firefox') {
        return {
            ...baseManifest,
            manifest_version: 2,
        }
    } else {
        return {
            ...baseManifest,
            manifest_version: 3,
        }
    }
}

module.exports = (env) => {
    const browser = env.browser || 'chrome';
    const isProduction = env.production === true;
    const outputDir = isProduction ? `dist/${browser}` : `build/${browser}`;

    const config = {
        entry: './src/content-scripts/main.js',
        output: {
            path: path.resolve(__dirname, outputDir),
            filename: 'main.js',
        },
        mode: isProduction ? 'production' : 'development',
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: "src/manifest.json",
                        transform: (content) => {
                            const manifest = generateManifest(browser);
                            return JSON.stringify(manifest, null, 2);
                        }
                    },
                    {
                        from: "LICENSE",
                        to: "LICENSE",
                        toType: 'file'
                    }
                ]
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/i,
                    loader: 'babel-loader',
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader','css-loader'],
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                    type: 'asset',
                },
            ],
        }
    }

    if (isProduction) {
        config.plugins.push(
            new ZipPlugin({
                path: '../',
                filename: `bsky-shortcuts-${browser}-${require('./package.json').version}.zip`
            })
        );
    }

    return config;
};
