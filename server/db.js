'use strict';

const sqlite = require('sqlite3');

const db = new sqlite.Database('films.db', (err) => {
    if (err) throw err;
});

module.exports = db;