console.log('starting seed_5.js');

const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todoso } = require('../../models/todoso_5');
const { Users } = require('../../models/users_4');

const firstUserID = new ObjectID();
const secondUserID = new ObjectID();

const users = [
    
    {
        _id : firstUserID,
        email: 'adrew@abc.com',
        password: 'abcd1234',
        tokens: [{

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
      text: 'First test todo',

      // Just for the test later on.
      // "_user" is required in SchemaTypes
      _user: firstUserID
    
    }, 
    { 

      _id : new ObjectID(),
      text: 'Second test todo',
      completed : true,
      completedAt : 333,

      // Just for the test later on.
      // "_user" is required in SchemaTypes
      _user: secondUserID

    }

];

const populateTodoso = (done) => {
  
    Todoso.remove({}).then(() => {

        return Todoso.insertMany(todoso);

    }).then(() => done());
  
};

const populateUsers = (done) => {

    Users.remove({}).then(() => {

        const userOne = new Users(users[0]).save(); // it does not use express!!!
        const userTwo = new Users(users[1]).save(); // it does not use express!!!

        console.log('userOne: ', userOne);

        return Promise.all([ userOne, userTwo ]);
        

    }).then(() => done());

};

module.exports = { todoso, populateTodoso, users, populateUsers };