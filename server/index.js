'use strict';
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');
const dayjs = require("dayjs");
const app = express();

passport.use(new LocalStrategy(
    function(username, password, done) {
        userDao.getUser(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Incorrect username and/or password.' });
            return done(null, user);
        })
    }
));

passport.serializeUser((user, done) => {
    done(null, {id: user.id});
});

passport.deserializeUser((id, done) => {
    userDao.getUserById(id)
        .then(user => {
            done(null, user);
        }).catch(err => {
        done(err, null);
    });
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'))

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'Not authenticated'});
}
const answerDelay = 300;

app.use(session({
    secret:'anjndaljjahuiq8989',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/pages', async (req, res)=>{
    try {
        const answers = await dao.listPages();
        res.status(200).json(answers);
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
})

app.get('/api/auth/pages', isLoggedIn, async (req, res)=>{
    try {
        const answers = await dao.listAuthPages();
        res.status(200).json(answers);
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get('/api/pages/:id', [
    check('id').isInt(),
], async (req, res)=>{
    try {
        let result = await dao.getPage(req.params.id);
        let paragraph = await dao.getParagraphs(req.params.id);
        let images = await dao.getImages(req.params.id);
        let headers = await dao.getHeaders(req.params.id);
        let block = paragraph.concat(images);
        block = block.concat(headers);
        result.order= block.sort((a, b) => a.pos - b.pos );
        if(result.error)
            res.status(404).json(result);
        else
            res.status(200).json(result);
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

app.post('/api/auth/pages', isLoggedIn, [
    check('title').isLength({min:1}),
    check('creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
    check('order').isArray({min: 2})
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        const page = req.body;
        let h=0, b=0;
        const p = {
            title:page.title,
            author: page.author,
            authorId: req.user.id,
            creationDate: page.creationDate,
            publicationDate: page.publicationDate,
            ord: page.order.map((e)=>{
                if(e.text){
                    b++;
                    return {
                        text: e.text,
                        pos: e.pos
                    }
                }
                else if(e.header) {
                    h++
                    return {
                        header: e.header,
                        pos: e.pos
                    }
                }else{
                    b++;
                    return {
                        id: e.id,
                        pos: e.pos
                    }
                }
            })
        }
        try {
            if( h<1 || b<1) {
                throw {err: "Number of block non right"};
            }
            if(req.user.username != p.author && req.user.administrator){
                const aut = await userDao.getIdByUsername(p.author)
                if(!aut.id)
                    throw {error: "non-existent author"}
                p.authorId = aut.id;
            }
            const id = await dao.addPage(p);
            p.ord.map(async (e) => {
                if (e.text) {
                    await dao.addParagraph(e, id);
                } else if(e.header){
                    await dao.addHeader(e, id);
                } else{
                    await dao.addImage(e, id);
                }
            });
            setTimeout(()=>res.status(200).json(id), answerDelay);
        } catch(err) {
            console.log(err);
            if(err.error && err.error != "Number of block non right" && err.error != "non-existent author")
                res.status(503).json({err: "Database error during the creation of page"});
            res.status(422).json(err);
        }
});

app.put('/api/auth/pages/:id', isLoggedIn, [
    check('id').isInt(),
    check('title').isLength({min:1}),
    check('creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
    check('order').isArray({min: 2}),
    ],
    async (req, res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        const page = req.body;
        let h=0, b=0;
        const p = {
            id:req.params.id,
            title:page.title,
            author: page.author,
            authorId: req.user.id,
            creationDate: page.creationDate,
            publicationDate: page.publicationDate,
            ord: page.order.map((e)=>{
                if(e.text){
                    b++;
                    return {
                        text: e.text,
                        pos: e.pos
                    }
                }
                else if(e.header) {
                    h++
                    return {
                        header: e.header,
                        pos: e.pos
                    }
                }else{
                    b++;
                    return {
                        id: e.id,
                        pos: e.pos
                    }
                }
            })
        }
        try {
            if( h<1 || b<1) {
                throw {err: "Number of block non right"};
            }
            if(req.user.username != p.author && req.user.administrator){
                const aut = await userDao.getIdByUsername(p.author)
                if(!aut.id)
                    throw {error: "non-existent author"}
                p.authorId = aut.id;
            }
            await dao.updatePage(p, req.params.id, req.user.administrator);
            await dao.deleteImages(req.params.id);
            await dao.deleteParagraphs(req.params.id);
            await dao.deleteHeaders(req.params.id);
            p.ord.forEach(async (e) => {
                if (e.text) {
                    await dao.addParagraph(e, req.params.id);
                } else if(e.header){
                    await dao.addHeader(e, req.params.id)
                } else{
                    await dao.addImage(e, req.params.id);
                }
            });


            setTimeout(()=>res.status(200).json(req.params.id), answerDelay);
        } catch(err) {
            console.log(err);
            if(err.error && err.error != "Number of block non right" && err.error != "non-existent author")
                res.status(503).json({err: "Database error during the update of page "+req.params.id});
            res.status(422).json(err);
        }
});

app.delete('/api/auth/pages/:id', isLoggedIn,[
    check('id').isInt(),
    ], async (req, res)=>{
    try {
        const ret = await dao.deletePage(req.params.id, req.user.id, req.user.administrator);
        await dao.deleteImages(req.params.id);
        await dao.deleteHeaders(req.params.id);
        await dao.deleteParagraphs(req.params.id);
        setTimeout(()=>res.status(200).json(ret), answerDelay);
    } catch(err) {
        console.log(err);
        res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.`});
    }
});

app.get('/api/auth/images', isLoggedIn, async (req, res) => {
    try{
       const ret = await dao.getAllImages();
       setTimeout(()=>res.status(200).json(ret), answerDelay);
   } catch (err) {
       console.log(err);
       res.status(500).json({ error: `Database error during the loading of images`});
   }
});

app.put("/api/auth/title", isLoggedIn,[
    check('title').isLength({min:1}),
    ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const title = req.body.title;
   try{
       if(!req.user.administrator)
           return  res.status(401).json({error: "Request made by a non-administrator"});
       const ret = await dao.updateTitle(title);
       setTimeout(()=>res.status(200).json(ret), answerDelay);
   } catch (err) {
       res.status(503).json(err);
   }
});

app.get('/api/title', async (req, res) => {
    try{
        const title = await dao.getTitle();
        res.status(200).json(title);
    }catch (err) {
        res.status(500).json({ error: `Database error during the deletion of answer ${req.params.id}.`});
    }
})

/** ******************************************************************************************************************************************* **/

app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).json(info);
        }
        req.login(user, (err) => {
            if (err)
                return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

app.delete('/api/sessions/current', (req, res) => {
    req.logout( ()=> { res.end(); } );
});


const PORT = 3001;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));