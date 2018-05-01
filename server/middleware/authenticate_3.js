const { Users } = require('../models/users_4');

// To make the function below the private, a midddleware is required.
// Actual route defined here is not going to be called
//      until it reaches out "next".
const authenticate = (req, res, next) => {

    const token = req.header('x-auth');

    console.log('token in authencate', token);
   
    Users.findByToken(token).then((user) => {

        if (!user) return Promise.reject();

        // ****** Instead of using public "res.send(user);""
        // Let's implement Privatization.
        
        // Create private properties : "req.user and req.token" 

        /**
         * user in middlware:  { tokens:
            [ { _id: 5ade1ec05798379cd0b21788,
                access: 'auth',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWRlMWVjMDU3OTgzNzljZDBiMjE3ODciLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTI0NTA2MzA0fQ.J9QK0Y3iYJcXUZwWfpj86IRUL3f4h74BeieVYk3t9js' } ],
            _id: 5ade1ec05798379cd0b21787,
            email: 'jo@json.com',
            password: '$2a$10$wFLKwS8LdsEtMzzr6Oh/vuKSGIeJRhpQJJzjeDB2aA9Hx.iYh2gvK',
            __v: 1 }
         */
        // console.log('user in middlware: ', user);

        // create new properties to send to "res" of express server.
        //      because req does not include "user" document here.
        
        //
        // 1) When the express does not specify "res.send()"
        //      it gets back to the server with req.user which is a new property 
        req.user = user; 

        // 2) It directly gets back to the user in m/w
        //res.send(user);

        req.token = token;
        // req.token = token; // for what?

        // in order to execute the following function 
        //      which has an "authenticate" args
        next();

    }).catch( err => {

        // If we have an error, we will not go to "app.get".
        res.status(401).send();

    });

};

module.exports = { authenticate };
