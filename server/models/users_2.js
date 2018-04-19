console.log('starting user_2.js');

const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ =require('lodash');

// It is a schema for a single user
const usersSchema = new Schema({

    email : {

        type : String,
        required : true,
        trim : true,
        minlength : true,
        unique: true,
        validate : {

            validator : validator.isEmail,
            message: 'Your {value} is not valid as an email.' 

        }

    },
    password : {

        type: String,
        require: true,
        minlength: 8

    },
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

// In order to prevent to send back unecessary but confidential info 
//      for security reason, we should filter out the auth related data
//      to be sent back to the user.

// This is an overriding function preset to Schema to get back to the user!!!
usersSchema.methods.toJSON = function() {

    /*
    this in toJSON:  { _id: 5ad8ada7f2b5793420d83992,
        email: 'jamesleekimchoian@example.com',
        password: '1234567890',
        tokens:
         [ { _id: 5ad8ada7f2b5793,
             access: 'auth',
             token: 'token value' } ],
        __v: 1 }
    */
    console.log('this in toJSON: ', this);

    const user = this;

    // FYI, "const backToUser = JSON.parse(user);" => not working

    // "user" value is swtiched to an "backToUser Object"
    //      because "this" is a value, not an object.
    const backToUser = user.toObject();

    // Then it houses '_id' and 'email' properties only 
    //      for the serrver to send this object to the user.
    return _.pick(backToUser, [ '_id', 'email']);

};

// UsersSchema.methods = Object's methods (but physically working like a single unified object )
//      for us to create any kinds of customized functions.
// "generateAuthToken" is able to access the individual document.
// Then, based on info the generateAuthToken() accesses to, we can create JWT.
usersSchema.methods.generateAuthToken = function() {

    // this = { generateAuthToken: [Function] }
    // It is called by "users", an instance of "userServer_2.js".
    // It refers to the return value from "generateAuthToken()"
    //      "userServer.js"
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this

    /*
    this { _id: 5ad8ada7f2b579342,
        email: 'jamesleekimchoian@example.com',
        password: '1234567890',
        tokens: [],
        __v: 0 }
    */
    console.log('this', this);
    
    const user = this;

    const access = 'auth';

    // "access" any property at any position can be accessed without the pararent assignment?
    const token = jwt.sign({ _id: user._id.toHexString(), access}, 'abcde').toString();

    // It can add the new tokens [ {access, token}]
    // It can also created the "_id" for the token because it is an array??/
    user.tokens = user.tokens.concat([{ access, token }]);

    //save
    // Then saved the document which filled "tokens" value 
    // Then, finally "return token"
    return user.save().then(() => {

        // When the user signs up or when the user logge in
        //      the server delivered the token updated the user.
        // Then the user stored the token and then use it
        //      the next time the user logs in again.
        return token;

    });
   
};

/* When arrow function : this = {} empty object 
//      because it receives the Usershema object which is 
        currently empty due to the lexical rule.
// It other word, it does not denpends on the call

UsersSchema.methods.generateAuthToken = () => {

    // this = { }
    console.log(this);
    const user = this;
    const access = 'auth';

};*/

const Users = mongoose.model('Users', usersSchema); 

module.exports = { Users };