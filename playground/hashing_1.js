console.log('It is just for understanding a basic concept of JWT.');
console.log('This is hardly used. Using JWT library is used a lot.');

/**
 * 
 * JWT (Json Web Token)
 *  - Structure : Header - Payload - HMAC(Signature)
 *  - It can be delivered over url or http header.
 * 
 * It is used for the user authentication process.
 * It encrypted the user info, urser's right, user's property 
 *      including password, age, company and so on... stored as API.
 * FYI, at this point, it is diferent from access-code based auth framwork. 
 * 
 * In the auth process, the user entered plain string password and all profile info
 *      , and auth process changes it into the hash code
 *      and matches a hash string stored earlier when the user signed up.
 * 
 * It is also used for token.
 *
 */


// Encrypting with 256bit
const { SHA256 } = require('crypto-js');

const msg = "I am user number 3";

const hash = SHA256(msg).toString();

// Hash value is not changed if string does not change
console.log(hash); // => 9da4d19e100809d42da806c2b7df5cf37e72623d42f1669eb112e23f5c9d45a3

// plain user data
const userData = {

    id: 4

};

const token = {

    userData,

    // change data to JSON to store in api database
    // 1)
    // hash : SHA256(JSON.stringify(data)).toString()

    // Sorting hash
    // "token" data created above can be taken and swtiched by the unauthorized user.
    // For instance, "password" normally or "userData" above can be changed.
    // In order to prevent this trick, we need to use Sorting hash
    //      which adds the signature to the payload, userData itself.
    // Signature is not directly exposed to any users 
    //      and therefore the user is not able to access the signature.
    // In result, if the combination of the payload + signature is different 
    //      from user's manipulated data which is a switched payload,
    //      the server denies the user to access the app/service's management.
    
    // 2)
    hash : SHA256(JSON.stringify(userData) + 'someSecretData').toString()

};

console.log('[In case when the data is not changed] ============================================');
const resultHash = SHA256(JSON.stringify(userData) + 'someSecretData').toString();

resultHash === token.hash ? console.log('userData.data is not hacked.')
    : console.log('userData.data is hacked, unfotunately.');

console.log('[In case when the data is hacked by the con-artist] ============================================');

token.userData.id = 5;

// Without the signature.
// Without the signature, the manipulated "userData" just above "token.userData.id = 5;",
//      will not be denied because the change will be stored in the orginal "userData".
token.hash = SHA256(JSON.stringify(token.userData)).toString();

resultHash === token.hash ? console.log('userData.data is not hacked.')
    : console.log('userData.data is hacked, unfotunately.');









