console.log('starting todoso.js');

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

    },
    _user : {

        // "just defines type"
        // Then go to "seed_5.js"
        // console.log(mongoose.Types.ObjectId, 'objectId????????????????')
        // It must be lower case "d" of "ObjectId"
        // "ObjectId" is a function or type that "ObjectID" created 
        //  in "Schema.Types" which defines "type"

        // "ObjectID" is an object to create new ID.
        type : mongoose.Schema.Types.ObjectId,
        required : true

    }

});

module.exports = { Todoso };