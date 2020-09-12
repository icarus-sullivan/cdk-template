const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require(`webpack-node-externals`);
const path = require('path');

module.exports = {
    entry: `./src/app.js`,
    target: `node`,
    mode: `development`,
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: __dirname,
                exclude: [/node_modules/],
                loader: `babel-loader`
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'package.json', to: 'package.json' },
                { from: 'yarn.lock', to: 'yarn.lock' },
            ],
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'docker', 'dist'),
        filename: 'app.js',
    }
};