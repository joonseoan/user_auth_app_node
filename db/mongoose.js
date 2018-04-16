console.log('starting mongoose.js');
console.log('This is mongoose configuration.');

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// We can remove 'mongodb://localhost:27017/TodoApp' as it set as test and development
//      in "server_10.js"
mongoose.connect(process.env.MONGODB_URI);

module.exports = {

    mongoose

};
