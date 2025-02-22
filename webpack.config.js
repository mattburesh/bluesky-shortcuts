const path = require('path')
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

function generateManifest(browser) {
    const baseManifest = require('./src/manifest.json');

    if (browser === 'firefox') {
        return {
            ...baseManifest,
            content_security_policy: "script-src 'self'; object-src 'self'",
            manifest_version: 2,
        }
    } else {
        return {
            ...baseManifest,
            content_security_policy: {
                extension_pages: "script-src 'self'; object-src 'self'"
            },
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
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ], 
        },
        devtool: false,
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: "src/manifest.json",
                        transform: (content) => {
                            const manifest = generateManifest(browser);
                            manifest.version = require('./package.json').version;
                            return JSON.stringify(manifest, null, 2);
                        }
                    },
                    { from: "LICENSE" },
                    { from: "assets/icons", to: "icons" },
                ]
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
            }),
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
