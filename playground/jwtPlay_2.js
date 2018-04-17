console.log('starting jwtPlay_2.js');

const jwt = require('jsonwebtoken');

// Two methods
// jwt.sing: create the signature which is secret.
// jwt.verify: compare two hash codes from the user and in the system.

const data = {

    id: 10

};

// This is a data created when the user signs up
//      and granted to the user.
// The user delivers this token whenever they access the server/app.
// "token" = "encoded" 
const token = jwt.sign(data, 'secretSignature');
console.log(token);

// Visit jwt.io then verify the hash data.

// Verify "token" => plain data
const decoded = jwt.verify(token, 'secretSignature');
console.log('decoded', decoded); //=> { id: 10, iat: 1523985789 }
