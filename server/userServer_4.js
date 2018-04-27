console.log('starting userServer_4.js');
console.log(', working with ../db/mongoose.js');
console.log(', working with users_4.js');
console.log(', working with authenticate_3.js');
console.log('Goal : learining hashing password');

require('./server_configs/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { mongoose } = require('../db/mongoose');
const { Todoso } = require('./models/todoso');
const { Users } = require('./models/users_4');
const { authenticate } = require('./middleware/authenticate_3.js');

const app = express();

app.use(bodyParser.json());

// ================================= POST/Users, POST/Todoso ===================================================================

// [ Scenario ] : 
//  1) A user signs up for an ap in a particular device or browser here.
//            by sending "email" and "password".
//  2) The server receives the email and password,
//            , then creates token, and sends it to the user.
//            ***** Bear in mind that token does not show in "body".
//                  It is included in "header".
//  3) Then, the token sent to the user is stored in user's browser.
app.post('/users', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    const users = new Users(body);

    users.save().then(() => {

        // return "token"
        return users.generateAuthToken();

    }).then((token) => {

        // send to client...
        res.header('x-auth', token).send(users);

    }).catch((err) => res.status(400).send());

});

// Private route (authenticate)
// It should be broken out.

// [ Scenario ] : 
//  1) A user tries to log in again 
//  2) The server redirects the url to check out the token
//          which is included in the header, 'x-auth' of the user req.
//  3) If the token is available in the header,
//          the server tries to compare the user's token and database's token.
//          Then, if they are indentified, the server lets the user login.
//          And the server sends the logged-in user info to the user.
//  4) If the token is not available, 
//          the server redirects the url to '/users' from '/users/me'.
//          Then, for the new users, the server make them newly sign up
//          or for the existing users, just log in again by typing email and password.
app.get('/users/me', authenticate, (req, res) => {

    console.log('req.user :**************************8', req.user);
    // send user info to client
    res.send(req.user);

});

// [ Scenario ] : 
//  1) For the existing users, however, that use a different browser or device
//          which means that the user does not have token,
//          the server must let them login again.
//     Just bear in mind that the users here have the email and password.
//  2) The server identifies the password the uers types here
//          and then lets them log in here.
app.post('/users/login', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    // For finding and comparing the existing document....
    // No need to save this on the database.
    // The reason for using "Users" object, not instance
    //      is because to just take a look and find the document.
    // If it does, it will create another document.
    
    // Just send req and then send back res in the server.
    // body = "req.body"
    // res.send(body) = res including "body";
    // console.log("res.send(body): ", res.send(body));

    Users.findByCredentials(body.email, body.password).then((user) => {

       // create token and send to the user again here.
       // user.tokens =  users.generateAuthToken();
       //console.log('user of findByCredentials: ', user);
        
       // Reuse the existing token in the database
       // res.header('x-auth', user.tokens[0].token).send(user);

       // Create a new token and share with the user
       // It is more secure.
       // "return" : "promise chaining" inside of a function.
       return user.generateAuthToken().then((token) => {

            res.header('x-auth', token).send(user);

       });

       // res.send(user);

    }).catch((err) => res.status(400).send());

});

app.delete('/users/me/token', authenticate, (req, res) =>{

    // console.log(req);
    // console.log(req.user);

    // "req.user" from authenticate
    req.user.removeToken(req.token).then(() => {

        res.status(200).send();

    }, () => {

        res.status(400).send();

    });

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

// Need to turn it into the private route here.
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

if(!module.parent){ app.listen(PORT); };

console.log(`Started on port : ${PORT}`);

module.exports = { app };


