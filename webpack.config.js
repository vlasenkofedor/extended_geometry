const HtmlWebPackPlugin = require('html-webpack-plugin'),
    webpack = require('webpack'),
    path = require('path')
module.exports = {
    context: __dirname,
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/index.js',
        publicPath: '/',
    },
    devServer: {
        historyApiFallback: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }, // for js or jsx files
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, // for css files
            {
                test: /\.(png|j?g|svg|gif)?$/,
                use: 'file-loader'
            }, // for images files
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                use: ['file-loader']
            }  // for fonts
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            filename: './index.html',
            favicon: "public/favicon.ico"
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};
