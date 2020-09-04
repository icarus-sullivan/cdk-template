const nodeExternals = require(`webpack-node-externals`);
const path = require('path');

module.exports = {
    entry: `./src/app.js`,
    target: `node`,
    mode: `development`,
    // externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: __dirname,
                // exclude: [/node_modules/],
                loader: `babel-loader`
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'docker', 'dist'),
        filename: 'app.js',
    }
};