var path = require('path'),
    webpack = require("webpack"),
    extractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: ['whatwg-fetch', 'babel-polyfill', './src/main/webapp/scss/main.scss','./src/main/webapp/js/index.js'],
    output: {
        filename: 'index.js',
        path: path.resolve('./src/main/webapp', 'js-wp')
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                loader: extractTextPlugin.extract('css-loader!sass-loader')
            },
            {
                test: /\.(jpe?g|png|gif|svg|eot|woff|woff2)$/i,
                loaders: [
                    'file-loader?hash=sha512&digest=hex&name=../img-wp/img-[hash:6].[ext]',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 4,
                            },
                            pngquant: {
                                quality: '75-90',
                                speed: 3,
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new extractTextPlugin({filename: '../css/main_scss.css', allChunks: true})/* ,
        new webpack.optimize.UglifyJsPlugin({minimize: true}) */
    ],
    devtool: 'cheap-module-source-map',
    watch: true
};
