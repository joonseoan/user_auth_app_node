console.log('starting mongoose.js');
console.log('This is mongoose configuration.');

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI);

module.exports = {

    mongoose

};
