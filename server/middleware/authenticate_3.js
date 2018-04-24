const { Users } = require('../models/users_4');

// To make the function below the private, a midddleware is required.
// Actual route defined here is not going to be called
//      until it reaches out "next".
const authenticate = (req, res, next) => {

    const token = req.header('x-auth');

    console.log('token in authencate', token);
   
    Users.findByToken(token).then((user) => {

        if (!user) return Promise.reject();

        // Instead of using public "res.send(user);""
        // Let's implement Privatization.
        
        //create private properties : "req.user and req.token" 
        console.log('user in middlware: ', user);

        req.user = user;
        // req.token = token; //?

        // in order to execute the following function 
        //      which has an "authenticate" args
        next();

    }).catch( err => {

        // If we have an error, we will not go to "app.get".
        res.status(401).send();

    });

};

module.exports = { authenticate };