const mongoose = require('mongoose');
const validator = require('validator');

const Users = mongoose.model('User', {
 
    // The format below to build auth app.
    /*
        {
            email: 'john@gafemail.com,
            password: 'dffdfa',
            
            // tokens are an array format.
            tokens: [ {
                access : 'auth',
                token : 'dadfdassdfasfadf' // => http request
            }]
        }
    */

    // email validation library : please go to setup file.
    //  1) Have a format to validate email from mongoose
    //  2) Have a function to validate email from npm libraries
    
    // FYI, to correctly find the npm library, in google, 
    //      we should check the url then package/"name" must be matched
    //      with npm module we try to find.
    email : {

        type : String,
        required : true,
        trim : true,
        minlength : true,
        unique: true, // check up the same email in any other documents.
                     // Through "unique: true", we can strengthen the value.
        
        validate : {

            // 1)
            /*
            validator : (value) => { // => the email format validator from mongoose

                // action validator from npm libaries ()
                return validator.isEmail(value);
            */

            // 2)
            // The first validator is from mongoose
            // The second validator is from npm validator
            validator : validator.isEmail,
            message: 'Your {value} is not valid as an email.' 

        }

    },
    password : {

        type: String,
        require: true,
        minlength: 8

    },

    // "tokens" is a thing the user must have to login
    // It is created in the signup step 
    //      and the server grants the user the token.
    // Also, it is updated.
    tokens : [{

        access : {

            type: String,
            require: true

        },
        token: {

            type: String,
            require: true

        }

    }],

    completedAt : {

        type: Number

    }

});

module.exports = { Users };