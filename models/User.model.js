const mongoose = require('mongoose');

const users = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    currentPlaylist: {
        type: String,
    },
    queueListId: {
      type: String
    }
});

module.exports = mongoose.model('users', users);