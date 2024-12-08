const path = require('path')
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const localConfig = require('./config.local.js');

function generateManifest(browser) {
    const baseManifest = require('./src/manifest.json');

    if (browser === 'firefox') {
        return {
            ...baseManifest,
            manifest_version: 2,
            browser_specific_settings: {
                gecko: {
                    id: localConfig.firefoxGuid
                }
            },
            options_ui: {
                page: "options.html",
                browser_style: true
            },
        }
    } else {
        return {
            ...baseManifest,
            manifest_version: 3,
            options_ui: {
                page: "options.html",
                open_in_tab: true
            }
        }
    }
}

module.exports = (env) => {
    const browser = env.browser || 'chrome';
    const isProduction = env.production === true;
    const outputDir = isProduction ? `dist/${browser}` : `build/${browser}`;

    const config = {
        entry: {
            main: './src/content-scripts/main.js',
            options: './src/ui/options/options.js'
        },
        output: {
            path: path.resolve(__dirname, outputDir),
            filename: '[name].js',
        },
        mode: isProduction ? 'production' : 'development',
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ]
        },
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
                    { from: "LICENSE" },
                    { from: "src/ui/options/options.html", to: "options.html" }
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
