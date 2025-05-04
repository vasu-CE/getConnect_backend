const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : [true , 'Project name must be unique']
    },
    users :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    fileTree : {
        type : Object,
        default : {}
    }
},{ timestamps: true });

module.exports = mongoose.model('Project' , projectSchema);