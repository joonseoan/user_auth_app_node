console.log("starting user_4.js");
console.log(
    "This is about mongoose middleware to run hashing and verifying password before / after the event!!!"
);
console.log(
    'Here, I am goint to update hashing and verification before the doc is saved. -- So "Pre" will be used.'
);

const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const usersSchema = new Schema ({
    
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Your {value} is not valid as an email."
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ],
    completedAt: {
        type: Number
    }
});

// JSON.stringfy() vs toJson : toJSON is a defined function anme 
usersSchema.methods.toJSON = function() {
    console.log("toJSON user: ", this);

    const user = this;

    const backToUser = user.toObject();

    return _.pick(backToUser, ["_id", "email"]);

};

usersSchema.methods.generateAuthToken = function() {
    
    // user => reusable
    // then mehods to manipulate data of the object
    const user = this;

    const access = "auth";

    const token = jwt

        // since process.env.JWT_SECRET assigns 'abcde'
        //.sign({ _id: user._id.toHexString(), access }, 'abcde')
        //
        .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
        .toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {

        return token;
    
    });
    
};

usersSchema.statics.findByToken = function(token) {
    console.log("this in findByToken: ", this);

    // Users => newly invoke the model.
    // then mehods to find data of the object mappped by the model
    const Users = this;

    let decoded;

    try {

        decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    } catch (e) {

        return Promise.reject();
    
    }

    return Users.findOne({
    
        _id: decoded._id,

        //***** when we call a property of property    
        "tokens.token": token,
        "tokens.access": "auth"
    
    });

};

usersSchema.statics.findByCredentials = function(email, password) {

    console.log('email: ', email);
    console.log('password: ', password);

    // "this" is null over here 
    //      because request does tnot come through the model "Users" of mongoose.
    //  The request just sent "email and password" the user typed
    const User = this; 

    return Users.findOne({ email }).then((user) => {

        if(!user) return Promise.reject();

        // "resolve" : callback.
        // It is defined in execution function in userServer_4.js
        //
        //  ".then((user) => {
        //  
        //      res.send(user); "
        
        return new Promise ((resolve, reject) => {
        
            bcrypt.compare(password, user.password, (err, res) => {

                if(res) {

                    // call the chaining function. 
                    // Chaining function itself callback function
                    // .then((user) => {
        
                    // res.send(user); "
                    resolve(user);
                    
                } else {

                    reject();

                }

            });

        });

    });
    
};

usersSchema.methods.removeToken = function(token) {

    const user = this;

    // About $pull mongoDB method
    // https://docs.mongodb.com/manual/reference/operator/update/pull/
    return user.update(

            // remove all the inside of defined property "tokens"
            /*
                {
                     _id: 1,
                    fruits: [ "apples", "pears", "oranges", "grapes", "bananas" ],
                    vegetables: [ "carrots", "celery", "squash", "carrots" ]
                }

                {
                    _id: 2,
                   fruits: [ "plums", "kiwis", "oranges", "bananas", "apples" ],
                   vegetables: [ "broccoli", "zucchini", "carrots", "onions" ]
                }

                db.stores.update(
                   { },
                   { $pull: { fruits: { $in: [ "apples", "oranges" ] }, vegetables: "carrots" } },
                   { multi: true }

               )

            **/

            { $pull : { tokens : { token } } }

        );

}
    
// This function will run before "save" promise event here.
usersSchema.pre("save", function(next) {

    const user = this;

    // if "password" property inside of this is modified
    // Also, it works even when the user is created.
    
    if (user.isModified("password")) {
    
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

const Users = mongoose.model("Users", usersSchema);

module.exports = { Users };