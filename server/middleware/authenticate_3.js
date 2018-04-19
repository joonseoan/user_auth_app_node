const { Users } = require('../models/users_3');

// To make the function below the private, a midddleware is required.
// Actual route defined here is not going to be called
//      until it reaches out "next".
const authenticate = (req, res, next) => {

    const token = req.header('x-auth');
   
    Users.findByToken(token).then((user) => {

        if (!user) return Promise.reject();

        // Instead of using public "es.send(user);""
        // Let's implementPrivatization.
        
        //create private properties : "req.user and req.token" 
        req.user = user;
        req.token = token;

        // inorder to execute the following function
        next();

    }).catch( err => {

        // If we have an error, we will not go to app.get.
        res.status(401).send();

    });

};

module.exports = { authenticate };