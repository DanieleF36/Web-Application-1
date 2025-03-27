'use strict';

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

const db = new sqlite.Database('db.sqlite', (err) => {
    if(err) throw err;
});

exports.listPages = () =>{
    return new Promise((resolve, reject) => {
        const sql = 'SELECT P.id, P.title, P.creationDate, P.publicationDate, U.username FROM pages P, users U WHERE P.userId = U.id AND P.publicationDate <= CURRENT_DATE';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((e) => ({ id: e.id, title: e.title, publicationDate: dayjs(e.publicationDate),  author: e.username }));
            resolve(pages);
        });
    });
};

exports.listAuthPages = () =>{
    return new Promise((resolve, reject) => {
        const sql = 'SELECT P.id, P.title, P.creationDate, P.publicationDate, U.username FROM pages P, users U WHERE P.userId = U.id';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map((e) => ({ id: e.id, title: e.title, creationDate: dayjs(e.creationDate), publicationDate: dayjs(e.publicationDate),  author: e.username }));
            resolve(pages);
        });
    });
};

exports.getParagraphs = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql2 = 'SELECT P.text, P.pos FROM paragraphs P WHERE P.pageId = ? ';
        db.all(sql2, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const paragraphs = rows.map((e) => ({pos: e.pos, text: e.text}));
            resolve(paragraphs);
        });
    });
};

exports.getImages = (pageId) => {
    return new Promise((resolve, reject) =>{
        const sql3 = 'SELECT I.id, I.url, L.pos FROM images I, linksImage L WHERE L.imageId = I.id AND L.pageId = ? '
        db.all(sql3, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const images = rows.map((e) => ({id: e.id, url: e.url, pos: e.pos}));
            resolve(images);
        });
    });
}

exports.getHeaders = (pageId) => {
    return new Promise((resolve, reject) =>{
        const sql3 = 'SELECT H.header, H.pos FROM headers H WHERE H.pageId = ?'
        db.all(sql3, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const headers = rows.map((e) => ({pos: e.pos, header: e.header}));
            resolve(headers);
        });
    });
}

exports.getPage = (id) => {
    return new Promise((resolve, reject) => {
        const sql1 = 'SELECT P.title, P.creationDate, P.publicationDate, U.username FROM pages P, users U WHERE P.userId = U.id AND P.id = ?';
        db.get(sql1, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                resolve({error: 'Question not found.'});
            }
            else {
                let page = {
                    id: id,
                    title: row.title,
                    creationDate: dayjs(row.creationDate),
                    publicationDate: dayjs(row.publicationDate),
                    author: row.username,
                    order: []
                }
                resolve(page);
            }
        });
    });
}

exports.addImage = (image, pageId) => {
    return new Promise((resolve, reject) => {
        const sql2 = 'INSERT INTO linksImage(imageId, pageId, pos) VALUES(?, ?, ?)';
        db.run(sql2, [image.id, pageId, image.pos], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

exports.addParagraph = (paragraph, pageId) => {
    return new Promise((resolve, reject) => {
        const sql1 = 'INSERT INTO paragraphs(text, pos, pageId) VALUES(?, ?, ?)';
        db.run(sql1, [paragraph.text, paragraph.pos, pageId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        })
    });
}

exports.addHeader = (header, pageId) => {
    return new Promise((resolve, reject) => {
        const sql1 = 'INSERT INTO headers(header, pos, pageId) VALUES(?, ?, ?)';
        db.run(sql1, [header.header, header.pos, pageId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        })
    });
}

exports.addPage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages(title, creationDate, publicationDate, userId) VALUES(?, DATE(?), DATE(?), ?)';
        db.run(sql, [page.title, page.creationDate, page.publicationDate, page.authorId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

exports.deleteParagraphs = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM paragraphs WHERE pageId = ?'
        db.run(sql, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    })
}

exports.deleteImages = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM linksImage WHERE pageId = ?'
        db.run(sql, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    })
}

exports.deleteHeaders = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM headers WHERE pageId = ?'
        db.run(sql, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    })
}

exports.deletePage = (id, userId, admin) => {
    return new Promise((resolve, reject) => {
        let sql;
        if(admin)
            sql = 'DELETE FROM pages WHERE id = ?';
        else
            sql = 'DELETE FROM pages WHERE id = ? AND userId = ?';
        let params = admin?[id]:[id, userId];
        db.run(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
}

exports.updatePage = (page, userId, admin) => {
    return new Promise((resolve, reject) => {
        let sql;
        if(admin)
            sql = 'UPDATE pages SET title=?, publicationDate=DATE(?), userId=? WHERE id=?';
        else
            sql = 'UPDATE pages SET title=?, publicationDate = DATE(?), WHERE id=? AND userId=?';
        const params = admin? [page.title, page.publicationDate, page.authorId, page.id]:[page.title, page.publicationDate, page.id, page.authorId]
        db.run(sql, params, (err)=>{
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        })
    });
}

exports.getAllImages = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, url FROM images';
        db.all(sql, [], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            let images = rows.map((el) => {
                return {
                    id: el.id,
                    url: el.url
                }
            });
            resolve(images);
        })
    });
}

exports.updateTitle = (title) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE informations SET title = ? WHERE id = ?';
        db.run(sql, [title, 1], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        })
    });
}

exports.getTitle = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT title FROM informations WHERE id = ?';
        db.get(sql, [1], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.title);
        })
    });
}