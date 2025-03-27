'use strict';

const sqlite = require('sqlite3');
const crypto = require('crypto');

const db = new sqlite.Database('db.sqlite', (err) => {
    if(err) throw err;
});

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id.id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve({error: 'User not found.'});
            else {
                // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
                const user = {id: row.id, username: row.username, administrator: row.administrator}
                resolve(user);
            }
        });
    });
};

exports.getUser = (identifier, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ? OR username = ?';
        db.get(sql, [identifier, identifier], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row === undefined) { resolve(false); }
            else {
                const user = {id: row.id, username: row.username, administrator: row.administrator};

                const salt = row.salt;
                crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
                    if (err) reject(err);

                    const passwordHex = Buffer.from(row.password, 'hex');
                    if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
                        resolve(false);
                    else resolve(user);
                });
            }
        });
    });
};

exports.getIdByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined) {
                resolve({error: 'User not found.'});
            } else {
                const user = {id: row.id, username: row.username, administrator: row.administrator}
                resolve(user);
            }
        });
    });
};