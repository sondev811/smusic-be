const mongoose = require('mongoose');

const queues = new mongoose.Schema({
    list: { 
        type : Array , 
        "default" : [], 
        required: true 
    },
    userID: {
        type: String,
        required: true
    },
    currentMusic: {
        type: Object
    }
});

module.exports = mongoose.model('queues', queues);