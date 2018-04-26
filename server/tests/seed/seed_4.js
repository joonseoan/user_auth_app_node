console.log('starting seed.js');

const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todoso } = require('../../models/todoso');
const { Users } = require('../../models/users_4');

const firstUserID = new ObjectID();
const secondUserID = new ObjectID();

// The documents here does not use express.
// It directly connects to DB.
// Therefore, we need creating tokens here.
const users = [
    
    {
        _id : firstUserID,
        email: 'adrew@abc.com',
        password: 'abcd1234',
        tokens: [{
            // "generateAuthToken()" is not a preset middleware.
            // It is a customized function that is invoked by express of "userServer_4.js"
            // In this seed, we are not invoking "generateAuthToken();" 
            // Still not use express in "userServer_4.js"
            // Therefore, we need to define the function over here.
            access : 'auth',
            token : jwt.sign({ _id: firstUserID.toHexString(), access: 'auth'}, 'abcde').toString()

        }]
    
    },
    {

        _id : secondUserID,
        email: 'jen@abc.com',
        password: '1234abcd'

    }

];

const todoso = [
    
    { 
        
      _id : new ObjectID(), 
      text: 'First test todo'
    
    }, 
    { 

      _id : new ObjectID(),
      text: 'Second test todo',
      completed : true,
      completedAt : 333

    }

];

const populateTodoso = (done) => {
  
    Todoso.remove({}).then(() => {

        return Todoso.insertMany(todoso);

    }).then(() => done());
  
};

// Just for creating the document in MongoDB
//      and then comparing the data of the mocha test cases
//      which utilize "express"
const populateUsers = (done) => {

    Users.remove({}).then(() => {

        // "insertMany" is a MongoDB function.
        // Therefore, it insert data as they are 
        //      without mongoogse schema and model.
        // return Users.insertMany(users);
        
        // In order to use middleware of password
        //      before the plain password is stored in the database.
        // "password middleware" is a preset function defined by mongoose.
        const userOne = new Users(users[0]).save(); // it does not use express!!!
        const userTwo = new Users(users[1]).save(); // it does not use express!!!

        console.log('userOne: ', userOne);

        // In this case, it must wait until all Promise functions are finished and then "Resolved",
        //      then it can deliver two variables.
        return Promise.all([ userOne, userTwo ]);
        

    }).then(() => done());

};

module.exports = { todoso, populateTodoso, users, populateUsers };