require('./server_configs/config');

console.log('starting userServer_1.js working with ../db/mongoose.js');
console.log('lodash added here');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('../db/mongoose');
const { Users } = require('./models/users');

const app = express();

app.use(bodyParser.json());

// ================================= POST/Users ===================================================================


///------------

app.post('/users', (req, res) => {

    const body = _.pick(req.body, [ 'email', 'password' ]);

    const users = new Users(body);

    users.save().then((result) => {

        res.send(result);

    }).catch((err) => res.status(400).send())

});

/* mine
app.post('/users', (req, res) => {
    
    const users = new Users ( {

        email : req.body.email,
        password : req.body.password
        

    });

    users.save().then((result) => {

        res.send(result);

    }, (err) => {

            res.status(400).send(err);

    });

});
*/
// ================================== GET/Users ================================================================

app.get('/users', (req, res) => {

    Users.find({}).then((users)=> {

        //an array
        res.send({ 
            
            users
        
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

// ================================== DELETE/Users/:ID ========================================================================

app.delete('/users/:id', (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(404).send();

    Users.findByIdAndRemove(id).then((result) => {

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






// Current "process.env.PORT" can be a production environment
// "3000;" can be a test or development environment.

// We can remove "3000" as we set up in "express" environment
// 1) const PORT = process.env.PORT || 3000;

// 2) It is production.
const PORT = process.env.PORT;

app.listen(PORT, () => {

    console.log(`Started on port : ${PORT}`);

});


module.exports = { app };


