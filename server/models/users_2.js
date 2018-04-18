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

// In order to prevent to send back unecessary info for security reason,
//      we should filter out the secure data to be sent back.

// This is an overriding function pre-set to get back to the user!!!
usersSchema.methods.toJSON = function() {

    const user = this;
    // const backToUser = JSON.parse(user); => not working

    // "user" value is swtiched to an "backToUser Object"
    //      because "this" is a value, not an object.
    const backToUser = user.toObject();

    // Then it encloses only '_id' and 'email' properties.
    return _.pick(backToUser, [ '_id', 'email']);

};

// UsersSchema.methods = Object.
// Therefore, we can add any kinds of "instance" methods we like.
// "generateAuthToken" is able to access the individual document.
//  Then, based on info the generateAuthToken provides, we can create JWT.
usersSchema.methods.generateAuthToken = function() {

    // this = { generateAuthToken: [Function] }'s parent object
    // It could be userSchema above which has empty value 
    //      but by "methods", it refers to the return value from "generateAuthToken()"
    //      "userServer.js"
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
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

/* ==> this = {}
UsersSchema.methods.generateAuthToken = () => {

    // this = { }
    console.log(this);
    const user = this;
    const access = 'auth';

};*/

const Users = mongoose.model('Users', usersSchema); 

module.exports = { Users };