const mongoose = require('mongoose');

const searchHistory = new mongoose.Schema({
    list: { 
        type : Array , 
        "default" : [], 
        required: true 
    },
    userID: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('search-histories', searchHistory);