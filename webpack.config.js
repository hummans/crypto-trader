const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { SourceMapDevToolPlugin } = require('webpack');

const projectRoot = process.cwd();

module.exports = {
    "mode": "development",
    "devtool": false,
    "resolve": {
        "extensions": [
            ".ts",
            ".js"
        ],
        "symlinks": true,
        "modules": [
            "./src",
            "./node_modules"
        ],
        "mainFields": [
            "browser",
            "module",
            "main"
        ]
    },
    "resolveLoader": {
        "modules": [
            "./node_modules"
        ]
    },
    "entry": {
        "main": [
            "./src/main.ts"
        ],
        "polyfills": [
            "./src/polyfills.ts"
        ]
    },
    "output": {
        "path": path.join(process.cwd(), "dist"),
        "filename": "[name].js",
        "crossOriginLoading": false
    },
    "performance": {
        "hints": false
    },
    "module": {
        "rules": [
            {
                "test": /\.html$/,
                "loader": "raw-loader"
            },
            {
                "test": /\.(eot|svg|cur)$/,
                "loader": "file-loader",
                "options": {
                    "name": "[name].[hash:20].[ext]",
                    "limit": 10000
                }
            },
            {
                "test": /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                "loader": "url-loader",
                "options": {
                    "name": "[name].[hash:20].[ext]",
                    "limit": 10000
                }
            },
            {
                "test": /\.js$/
            },
            {
                "test": /\.ts$/,
                "loader": "ts-loader"
            }
        ]
    },
    "optimization": {
        "noEmitOnErrors": true,
        "runtimeChunk": "single",
        "splitChunks": {
            "chunks": "all",
            "cacheGroups": {
                "vendors": false,
                "vendor": {
                    "name": "vendor",
                    "chunks": "initial"
                }
            }
        }
    },
    "plugins": [
        new CopyWebpackPlugin([
            {
                "context": "src",
                "to": "",
                "from": {
                    "glob": "assets/**/*",
                    "dot": true
                }
            }, {
                'from': 'index.html',
                'to': "index.html",
            }
        ], {
            'ignore': [
                ".gitkeep",
                "**/.DS_Store",
                "**/Thumbs.db"
            ],
            "debug": "warning"
        }),
        new ProgressPlugin(),
        new CircularDependencyPlugin({
            "exclude": /[\\\/]node_modules[\\\/]/,
            "failOnError": false,
            "onDetected": false,
            "cwd": projectRoot
        }),
        new HtmlWebpackPlugin({
            template: 'index.html',
            chunksSortMode: (a, b) => {
                const order = ["polyfills", "vendor", "main"];
                return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
            }
        }),
        new SourceMapDevToolPlugin({
            "filename": "[file].map[query]",
            "moduleFilenameTemplate": "[resource-path]",
            "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
            "sourceRoot": "webpack:///"
        })
    ],
    "node": false,
    "devServer": {
        "historyApiFallback": true
    }
};
