const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// In order to hash the code by using "bscript"
//      we have to use two methods:
//  1. gen (generate) and salt (salt)
//  2. hash moth to process the hash. 

const pwd = '123abc!';

// 1. genSalt
// For instance pwd = 123 => hashing vale 'ddmm'
// 'ddmm' is going to be mixed up with other hash code
//      but the letter of "123" is not going to be changed.
//  So when the code comples, the hacker is able to find the pwd.
// In order to prevent this unchanged pwd hackable, genSalt is required.


// including async functin arg and callback function arg

// "10" is a number of rounds to generate salt
//      we can set the number but it takes longer time.
// Actully, the higer number, the better for the security.

// Just bear in mind that "getSalt and hash" should run 
//      before database stores them.
bcrypt.genSalt(10, (err, salt) => {

    console.log('1.salt: ', salt);

    bcrypt.hash(pwd, salt, (err, hash) => {

        console.log('2.hash:', hash);

    });

});


// ===== back to readable pwd (veification) ======

var hashedPWD = "$2a$10$5/.fLuTd15N2brk6YcMg8OfzsQ2YF4xca.TvpGslvQb7W.4dGrmkm";

// "compare"returns "true" / "false"
bcrypt.compare('dfd', hashedPWD, (err, res) => {

    console.log(res); // => false


});








