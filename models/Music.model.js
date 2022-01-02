const mongoose = require('mongoose');

const musics = new mongoose.Schema({
    youtubeId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    nameFormatted: {
        type: String,
        required: true
    },
    ggDriveId: {
        type: String
    },
    authorName: {
        type: String,
        required: true
    },
    audioThumb: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('musics', musics);