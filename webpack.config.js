const { verify } = require('crypto')
const { VERSION } = require('ejs')
const { version } = require('os')
const path = require('path')
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production'
let buildPath = isProduction ? 'dist/' : 'build/'

const stylesHandler = 'style-loader'

const config = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
        new CopyPlugin({
            patterns: [
                { from: "src/manifest.json" }
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
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production'
        config.output = {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist')
        }
        
    } else {
        config.mode = 'development'
        config.output = {
            filename: 'main.js',
            path: path.resolve(__dirname, 'build')
        }
        config.watch = true
        config.watchOptions = {
            ignored: '**/node_modules'
        }
    }

    return config;
};
