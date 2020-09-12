const path = require(`path`);
const fs = require(`fs`);
const CONFIG_TEMPLATE = `
const LEADING_ARRAY = /\\[/g;
const TRAILING_ARRAY = /^\\[|\\]/g;
function dot(path) {
    return path.replace(TRAILING_ARRAY, '').replace(LEADING_ARRAY, '.').split('.');
}
// Allows the config to still use the 'get' call instead of using it as plain json
module.exports = Object.assign(__CONFIG__, {
    get: function(settings) {
        try {
            return dot(settings).reduce((a, b) => a[b], this);
        } catch (e) {
            return undefined;
        }
    }
});
`;
module.exports = ({ env }) => {
    process.env.NODE_CONFIG_ENV = env;
    const config = require(`config`);
    const output = CONFIG_TEMPLATE.replace(`__CONFIG__`, JSON.stringify(config));
    // Ensure we have a directory to write our config to
    if (!fs.existsSync(path.resolve('dist'))) {
        fs.mkdirSync('dist');
    }
    // Why do we need this? To work with `config`:
    // https://github.com/lorenwest/node-config/wiki/Webpack-Usage
    const configFilePath = path.resolve(__dirname, `./dist/config.js`);
    fs.writeFileSync(configFilePath, output);
    return configFilePath;
};