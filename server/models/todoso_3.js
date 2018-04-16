console.log('starting todoso_3.js');

const mongoose = require('mongoose');

const Todoso = mongoose.model('Todoso', {

    text : {
        
        type : String,
        required : true, 
        minlength : 1,
        trim : true
    
    },
    completed : {

        type : Boolean,
        default : false

    },
    completedAt : {

        type : Number,
        default : false
        

    }

});

module.exports = { Todoso };