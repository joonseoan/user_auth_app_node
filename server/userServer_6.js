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

app.post('/users', async (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    const users = new Users(body);

    try {

        await users.save();

        const token = await users.generateAuthToken();
        await res.header('x-auth', token).send(users);


    } catch(e) {

        res.status(400).send();

    }


    // users.save().then(() => {

    //     return users.generateAuthToken(); // returns "token"

    // }).then((token) => {

    //     res.header('x-auth', token).send(users);

    // }).catch((err) => res.status(400).send());

});

app.get('/users/me', authenticate, (req, res) => {

    res.send(req.user);

});


app.post('/users/login', async (req, res) => {

    try {


        const body = _.pick(req.body, [ 'email', 'password' ]);

        const user = await Users.findByCredentials(body.email, body.password);

        console.log('user: ', user);
        const token = await user.generateAuthToken();

        res.header('x-auth', token).send(user);

    } catch (e) {

        res.status(400).send();

    }
    

    /*Users.findByCredentials(body.email, body.password).then((user) => {

       return user.generateAuthToken().then((token) => {

              res.header('x-auth', token).send(user);

        res.status(400).send())


    }).catch((err) => res.status(400).send());
*/
});

app.delete('/users/me/token', authenticate, async (req, res) =>{

    
    // We do not need to return
    try {

        await req.user.removeToken(req.token);

        res.status(200).send();

    } catch (e) {

        res.status(400).send();

    }
    
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

    const id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    try {

        const byID = Users.findById(id);

        if(!byID) return res.status(404).send();

        res.send({ byID });

    } catch (e) {

        res.status(400).send();

    }

    

//     Users.findById(id).then(byID => {

//         if (!byID) return res.status(404).send();

//         res.send({ byID });

//     }).catch( err => res.status(400).send());

// }, (err) => {

//     res.status(400).send(err);

});


// ====================================== Todoso ==================================

app.post('/todoso', authenticate, (req, res) => {
    
    const todoso = new Todoso ( {

        text: req.body.text,

        _user: req.user._id 

    });

    todoso.save().then((result) => {

        res.send(result);

    }, (err) => {

        res.status(400).send(err);

    });

});

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

app.delete('/todoso/:id', authenticate, async (req, res) => {

    const id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();
   
    try {
    
        const result = await Todoso.findOneAndRemove({

                  _id : id,
                  _user : req.user._id
        });

        if(!result) return res.status(404).send();

        res.send({result});    

    } catch(e) {

        res.status(400).send(e);

    }
    
    // Todoso.findOneAndRemove({

    //          _id : id,
    //          _user : req.user._id

    // }).then((result) => {

    //     if(!result) return res.status(404).send();

    //     res.send({result});

    // }).catch(err => res.status(400).send(err));

});

app.patch('/todoso/:id', authenticate, (req, res) => {

    const id = req.params.id;
   
    const body = _.pick(req.body, ['text', 'completed']);
    
    if (!ObjectID.isValid(id)) return res.status(404).send();

    if (_.isBoolean(body.completed) && body.completed) {

        body.completedAt = new Date().getTime();

    } else {

        body.completedAt = null;

    }   
    
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