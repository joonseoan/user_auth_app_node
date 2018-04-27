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
        require: true,
        minlength: 8
    },
    tokens: [
        {
            access: {
                type: String,
                require: true
            },
            token: {
                type: String,
                require: true
            }
        }
    ],
    completedAt: {
        type: Number
    }
});

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
        .sign({ _id: user._id.toHexString(), access }, "abcde")
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
        decoded = jwt.verify(token, "abcde");
    } catch (e) {
        console.log("Got some error");

        return Promise.reject();
    }

    return Users.findOne({
        _id: decoded._id,
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
                    const res = resolve(user)
                    console.log('resolve(user): ', res)

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

            {$pull : { tokens : { token } } }

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
