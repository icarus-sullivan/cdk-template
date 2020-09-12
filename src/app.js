const express = require('express');
const app = express();

app.get('/health', (req, res) => res.send('hello'));

app.get('*', (req, res) => {
    res.send('Connected!');
});

app.listen(3000, err => {
    if (err) {
        return console.error(err);
    }
});