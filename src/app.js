const express = require('express');
const util = require('util');
const app = express();

app.get('/specific', (req, res) => {
    res.send('Goodbye!');
});

app.get('*', (req, res) => {
    res.send('Hello world!');
});

app.listen(3000, err => {
    if (err) {
        return console.error(err);
    }
});