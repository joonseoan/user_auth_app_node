console.log('starting userServer_5.js');
console.log(', working with ../db/mongoose.js');
console.log(', working with users_4.js');
console.log(', working with authenticate_3.js');
console.log('Goal : learining hashing password');

require('./server_configs/config_5');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { mongoose } = require('../db/mongoose');
const { Todoso } = require('./models/todoso_5');
const { Users } = require('./models/users_4');
const { authenticate } = require('./middleware/authenticate_3.js');

const app = express();

app.use(bodyParser.json());

// let currentUser;

app.post('/users', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    const users = new Users(body);

    users.save().then(() => {

        return users.generateAuthToken();

    }).then((token) => {

        res.header('x-auth', token).send(users);

    }).catch((err) => res.status(400).send());

});

app.get('/users/me', authenticate, (req, res) => {

    // "current login" user with a verified "token"
    // currentUser = req.user;
    res.send(req.user);

});

app.post('/users/login', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    Users.findByCredentials(body.email, body.password).then((user) => {

       return user.generateAuthToken().then((token) => {

              res.header('x-auth', token).send(user);

       });

    }).catch((err) => res.status(400).send());

});

app.delete('/users/me/token', authenticate, (req, res) =>{

    req.user.removeToken(req.token).then(() => {

        res.status(200).send();

    }, () => {

        res.status(400).send();

    });

});

app.get('/users', (req, res) => {

    Users.find({}).then((users)=> {

        res.send({ 
            
            users
        
        });
    
    }, (err) => {

        res.status(400).send(err);

    });    

});

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



// ====================================== Todoso ==================================

// In postman, sending a token which is switching to user's _id
app.post('/todoso', authenticate, (req, res) => {
    
    const todoso = new Todoso ( {

        text: req.body.text,

        // From authenticate
        _user: req.user._id 

    });

    todoso.save().then((result) => {

        res.send(result);

    }, (err) => {

        res.status(400).send(err);

    });

});

// In postman, sending a token which is switching to user's _id
app.get('/todoso', authenticate, (req, res) => {

    Todoso.find({ _user : req.user._id })
        .then((todoso)=> {

            //an array
            res.send({ 
                
                todoso
            
            });
        
        }, (err) => {

            res.status(400).send(err);

        });    

});

app.get('/todoso/:id', authenticate, (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    // By using 'authenticate' m/w
    // It must have both identified _id and _user 
    //      to successfully get back to the user.
    Todoso.findOne({ 

        _user : req.user._id,
        _id : id

        }).then((byID) => {
    
    // Todoso.findById(id).then(byID => {

        if (!byID) return res.status(404).send();

        res.send({ byID });

    }).catch( err => res.status(400).send());

}, (err) => {

    res.status(400).send(err);

});

app.delete('/todoso/:id', authenticate, (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    // 1)
    // Todoso.findByIdAndRemove(id).then((result) => {

    // findOneAndRemove can put more than one conditions!!!! 
    //      but it just finds one doc. 
    Todoso.findOneAndRemove({

             _id : id,
             _user : req.user._id

    }).then((result) => {

        if(!result) return res.status(404).send();

        res.send({result});

    }).catch(err => res.status(400).send(err));

});

app.patch('/todoso/:id', authenticate, (req, res) => {

    const id = req.params.id;
   
    const body = _.pick(req.body, ['text', 'completed']);
    
    // console.log('req.body:', req.body); //=> req.body: { completed: true }
    // console.log('body:', body); // => body: { completed: true }

    if (!ObjectID.isValid(id)) return res.status(404).send();

    if (_.isBoolean(body.completed) && body.completed) {

        body.completedAt = new Date().getTime();

    } else {

        body.completedAt = null;

    }   
    
    // 1)
    // Todoso.findOneAndUpdate(id, { $set : body }, { new : true }).then( updated => {

    // 2)
    // With 'authenticate'
    // Must use the object!!! NOT Variable here.
    Todoso.findOneAndUpdate({ 

            _id: id,
            _user: req.user._id

        }, { $set: body }, { new: true }).then(updated => {

            if(!updated) return res.status(404).send();

            res.send({updated});

    }).catch( err => res.status(400).send());

});

const PORT = process.env.PORT;

if(!module.parent){ app.listen(PORT); };

console.log(`Started on port : ${PORT}`);

module.exports = { app };