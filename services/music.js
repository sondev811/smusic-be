const musicModel = require('../models/Music.model');
require('dotenv').config();
const ytdl = require('ytdl-core');

class Music {

    async getMusic(youtubeId) {
        return await musicModel.findOne({ youtubeId });
    }

    async addMusic(item) {
        let music = new musicModel(item);
        music.save((error, item) => {
            if (error) {
                console.log('Save fail', error);
            }
            console.log(`Save success`);
        });
        return music;
    }

    async updateMusic(youtubeId, update) {
        const query = { youtubeId };
        musicModel.findOneAndUpdate(query, update, { new: true }, (error, item) => {
            if (error) console.log('update fail', error);
            console.log(`update success`);
        });
        return await musicModel.findOne(query);
    }

    async getMusicInfo(videoID) {
        try {
            const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
            const videoInfo = await ytdl.getInfo(videoUrl);
            if (!videoInfo) {
                const error = new Error('Can not find info video')
                error.code = '403';
                throw error;
            }
            console.log(videoInfo);
            const videoName = videoInfo && videoInfo.videoDetails && videoInfo.videoDetails.title ?
            videoInfo.videoDetails.title : 'unknow';
            const videoLength = videoInfo && videoInfo.videoDetails && videoInfo.videoDetails.lengthSeconds ?
            videoInfo.videoDetails.lengthSeconds : 0;
            const authorName = videoInfo && videoInfo.videoDetails && videoInfo.videoDetails && videoInfo.videoDetails.author ? 
            videoInfo.videoDetails.author.name : '';
            return { videoName, authorName, videoLength };
        } catch (error) {
            const err = new Error('Can not find info video')
            err.code = '403';
            throw err;
        }
    }
}

module.exports = new Music();