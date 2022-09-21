const mongoose = require('mongoose');

const playlist = new mongoose.Schema({
    list: { 
      type : Array , 
      "default" : [], 
      required: true 
    },
    userID: {
      type: String,
      required: true
    },
    playlistName: {
      type: String,
      required: true
    },
    currentMusic: {
      type: Object
    }
});

module.exports = mongoose.model('playlist', playlist);