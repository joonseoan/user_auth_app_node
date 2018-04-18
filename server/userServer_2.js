require('./server_configs/config');

console.log('starting userServer_2.js working with ../db/mongoose.js');
console.log('starting userServer_2.js working with users_2.js')

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('../db/mongoose');
const { Todoso } = require('./models/todoso');
const { Users } = require('./models/users_2');

const app = express();

app.use(bodyParser.json());

// ================================= POST/Users, POST/Todoso ===================================================================


//------------------------------------------------------------------

app.post('/users', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    const users = new Users(body);

    /*
    users.save().then((result) => {

        res.send(result);

    }).catch((err) => res.status(400).send())
    */

    // [ Reguired methods for Authentication ]
    
    // By using model instance
    // Model instance, "Users()" is not for individual document.
    // "findByToken" is a customized method.
    // It lstens to the user's toke, tries to find the token
    //      , and then getback to the user with fields.
    // Users.findByToken

    // By using "users" instance methdo
    // "generateAuthToken" is responsible 
    //      for adding tokens on individual users' document
    //      saving that into the server.
    // users.generateAuthToken

    // 1)
    // users.save().then((result) => {

    // 2) It is the first ave only with email and password
    //      The second save is realized with "tokens" in users_2.js
    users.save().then(() => {

        // 1)
        // As we setup token in users_2.js
        // res.send(result);
        
        // "users" : is a instance of "new Users(body)"
        // We do not need to a singe document value here like "result"
        //      because it has the same value of instance, "users"
        console.log('users are in the first saving step: ', users);

        // Therefore, it can call "generateAuthToken()"
        return users.generateAuthToken();

        // "token" is a returned value from "users.generateAuthToken();"
    }).then((token) => {

        // since users.generateAuthToken(); was invoked, 
        //      users have the "tokens"' values, "access" and "token"
        console.log('users: ', users);
        console.log('token:',  token);

        // 'x-auth' is a customized header instead of http header
        // At 'x-auth', enter "token" and then tack on the "users" as a particular header.
        res.header('x-auth', token).send(users);

    }).catch((err) => res.status(400).send());

});

app.post('/todoso', (req, res) => {
    
    const todoso = new Todoso ( {

        text : req.body.text

    });

    todoso.save().then((result) => {

        res.send(result);

    }, (err) => {

            res.status(400).send(err);

    });

});



// ================================== GET/Users, GET Todoso ================================================================

app.get('/users', (req, res) => {

    Users.find({}).then((users)=> {

        res.send({ 
            
            users
        
        });
    
    }, (err) => {

        res.status(400).send(err);

    });    

});


app.get('/todoso', (req, res) => {

    Todoso.find({}).then((todoso)=> {

        //an array
        res.send({ 
            
            todoso
        
        });
    
    }, (err) => {

        res.status(400).send(err);

    });    

});

// ================================== GET/Users/:ID ================================================================


app.get('/users/:id', (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    Users.findById(id).then(byID => {

        if (!byID) return res.status(404).send();

        res.send({ byID });

    }).catch( err => res.status(400).send());

}, (err) => {

    res.status(400).send(err);

});


app.get('/todoso/:id', (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    Todoso.findById(id).then(byID => {

        if (!byID) return res.status(404).send();

        res.send({ byID });

    }).catch( err => res.status(400).send());

}, (err) => {

    res.status(400).send(err);

});

// ================================== DELETE/Users/:ID ========================================================================

app.delete('/users/:id', (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    Users.findByIdAndRemove(id).then((result) => {

        if(!result) return res.status(404).send();

        res.send({result});

    }).catch(err => res.status(400).send(err));

});


app.delete('/todoso/:id', (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    Todoso.findByIdAndRemove(id).then((result) => {

        if(!result) return res.status(404).send();

        res.send({result});

    }).catch(err => res.status(400).send(err));

});


// ================================= PATCH/TODOSO/:ID ===================================================================

// It is really set in stone!!!
app.patch('/users/:id', (req, res) => {

    const id = req.params.id;
   
    //************************* 
    const body = _.pick(req.body, ['email', 'password']);
    
    console.log('req.body:', req.body); //=> req.body: { completed: true }
    console.log('body:', body); // => body: { completed: true }

    //Validation
    if (!ObjectID.isValid(id)) return res.status(404).send();

    if (body.email && body.password) {

        body.completedAt = new Date().getTime();

    } else {

        // body.completed = false;
        body.completedAt = null;

    }   
    
    Users.findByIdAndUpdate(id, { $set : body }, { new : true }).then( updated => {

        if(!updated) return res.status(404).send();

        res.send({updated});

    }).catch( err => res.status(400).send());


});


app.patch('/todoso/:id', (req, res) => {

    const id = req.params.id;
   
    //************************* 
    const body = _.pick(req.body, ['text', 'completed']);
    
    console.log('req.body:', req.body); //=> req.body: { completed: true }
    console.log('body:', body); // => body: { completed: true }

    //Validation
    if (!ObjectID.isValid(id)) return res.status(404).send();

    if (_.isBoolean(body.completed) && body.completed) {

        body.completedAt = new Date().getTime();

    } else {

        // body.completed = false;
        body.completedAt = null;

    }   
    
    Todoso.findByIdAndUpdate(id, { $set : body }, { new : true }).then( updated => {

        if(!updated) return res.status(404).send();

        res.send({updated});

    }).catch( err => res.status(400).send());


});






const PORT = process.env.PORT;

app.listen(PORT, () => {

    console.log(`Started on port : ${PORT}`);

});


module.exports = { app };


