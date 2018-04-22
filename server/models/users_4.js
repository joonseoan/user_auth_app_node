console.log('starting user_4.js');
console.log('This is about mongoose middleware to run hashing and verifying password before / after the event!!!');
console.log('Here, I am goint to update hashing and verification before the doc is saved. -- So "Pre" will be used.');

const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ =require('lodash');
const bcrypt = require('bcryptjs');

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

usersSchema.methods.toJSON = function() {

    console.log('toJSON user: ', this);

    const user = this;

    const backToUser = user.toObject();

    return _.pick(backToUser, [ '_id', 'email']);

};

usersSchema.methods.generateAuthToken = function() {
    
    const user = this;

    const access = 'auth';

    const token = jwt.sign({ _id: user._id.toHexString(), access}, 'abcde').toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {

        return token;

    });
   
};

usersSchema.statics.findByToken = function (token) {

    console.log('this in findByToken: ', this);

    const User = this;

    let decoded; 

    try {

        decoded = jwt.verify(token, 'abcde');

    } catch(e) {

        console.log('Got some error');

        return Promise.reject(); 

    }

    return Users.findOne({
        
        _id : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    
    });

};

// This function will run before "save" promise event here.
usersSchema.pre('save', function (next) {

    const user = this;

    // if "password" property inside of this is modified
    // Also, it works even when the user is created.
    if (user.isModified('password')) {

        bcrypt.genSalt(10, (err, salt) => {

            // "current value of user.password"
            bcrypt.hash(user.password, salt, (err, hash) => {

                // changing the current password to "hash"
                user.password = hash;

                next();

            });

        });

    } else {

        next();

        Promise.reject();

    }


}); 

const Users = mongoose.model('Users', usersSchema); 

module.exports = { Users };