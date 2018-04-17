require('./server_configs/config');

console.log('starting userServer_1.js working with ../db/mongoose.js');
console.log('lodash added here');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('../db/mongoose');
const { Todoso } = require('./models/todoso');
const { Users } = require('./models/users');

const app = express();

app.use(bodyParser.json());

// ================================= POST/Users, POST/Todoso ===================================================================


//------------------------------------------------------------------

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

app.post('/todoso', (req, res) => {
    
    const todoso = new Todoso ( {

        text : req.body.text

    });

    // todoso.text : object and field format

    todoso.save().then((result) => {

        // object and document format
        res.send(result);

    }, (err) => {

            res.status(400).send(err);

    });

});



// ================================== GET/Users, GET Todoso ================================================================

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


