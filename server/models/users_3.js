console.log('starting user_3.js');

const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ =require('lodash');

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

// [ methods vs statics ]
// http://mongoosejs.com/docs/2.7.x/docs/methods-statics.html

// methods: create and have "model" then create and run a function.
usersSchema.methods.toJSON = function() {

    const user = this;

    const backToUser = user.toObject();

    return _.pick(backToUser, [ '_id', 'email']);

};

usersSchema.methods.generateAuthToken = function() {
    
    // Small letter "user" stands for the instance method
    //      to get the individual document.
    const user = this;

    const access = 'auth';

    const token = jwt.sign({ _id: user._id.toHexString(), access}, 'abcde').toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {

        return token;

    });
   
};

// statics : Statics are pretty much the same as methods 
//      but allow for defining functions that exist directly on your Model.

// Based on "token" delivered parameters from 'x-auth header',
//      it verifies and find the user document.
usersSchema.statics.findByToken = function (token) {

    // "this" : header of 'x-auth'

    /**
     * 
      function model(doc, fields, skipId) {
      if (!(this instanceof model)) {
        return new model(doc, fields, skipId);
      }
      Model.call(this, doc, fields, skipId);
    }

    */
    console.log('this in findByToken: ', this);

    // Upper letter "User" stands for a model
    //      to bind it.
    const User = this;

    let decoded; // it will convert the hash code into readable info.
                // Then, based on the decoded, we can find the user document.
    
    // In order to prevent to stop working?
    //      when the token payload is manipulated.
    try {

        decoded = jwt.verify(token, 'abcde');

    } catch(e) {

        console.log('Got some error');

        // 1)
        // return new Promise((resolve, reject) => {

            // generate reject() function only.
        //     reject();

        // });

        // 2)
        return Promise.reject(); // "e" will be injected into ()

    }

    // To be chaining from "findByToken()" like "then"
    //      to get to "userServer_3.js" 
    return Users.findOne({
        
        _id : decoded._id,

        // When we try to find object's property
        //      user '', a single quote 
        //      outside the property name.
        'tokens.token' : token,
        'tokens.access' : 'auth'
    
    });

};

const Users = mongoose.model('Users', usersSchema); 

module.exports = { Users };