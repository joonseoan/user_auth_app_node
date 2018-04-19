console.log('starting userServer_3.js');
console.log(', working with ../db/mongoose.js');
console.log(', working with users_3.js');
console.log(', working with authenticate_3.js');
console.log('Goal : learining private routes');

/**
 * private routes :
 * 
 * By using 'auth-x' : token,
 * 1. Validate the token
 * 2. Find the user associated with the token
 * 3. Then run the route code to grant user's auth on the app
 * 
 */

require('./server_configs/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('../db/mongoose');
const { Todoso } = require('./models/todoso');
const { Users } = require('./models/users_3');
const { authenticate } = require('./middleware/authenticate_3.js');

const app = express();

app.use(bodyParser.json());

// ================================= POST/Users, POST/Todoso ===================================================================

// It does not need to turn it into private route
//      because no one will post with the private route.
app.post('/users', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    const users = new Users(body);

    users.save().then(() => {

        return users.generateAuthToken();

    }).then((token) => {

        res.header('x-auth', token).send(users);

    }).catch((err) => res.status(400).send());

});

/* 1) public route
// request from the user : "token" in "x-auth" of the header
// response to the user : "id and email" bu using "toJSON" function
//      defined in "users" model 

// In order to get the token, middleware is required.
// When the user accesses "/users/me",
//      it requires a header name defined and a token data only. 
app.get('/users/me', authenticate, (req, res) => {

    // Grapping the token
    // "header()" is similar with res.header() 
    //      which encoses a particular 'x-auth' header
    // Here, we just grap the value of 'x-auth'
    const token = req.header('x-auth');
    
    // It is the second methods to find the user 
    //      out of the documment list, an array of the database
    Users.findByToken(token).then((user) => {

        // 1)
        // if(!user) return res.status(401).send();

        // 2)
        if (!user) return Promise.reject();

        res.send(user);

    }).catch( err => {

        // "401" : authentication is required.
        res.status(401).send();

    });

});
*/


// 2) Private route (authenticate)
// It should be broken out.

app.get('/users/me', authenticate, (req, res) => {

    // can use req.user 
    //      because authenticate is an callback argument 
    res.send(req.user);

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

app.listen(PORT, () => {

    console.log(`Started on port : ${PORT}`);

});

module.exports = { app };


