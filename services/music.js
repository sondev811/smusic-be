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
            const videoName = videoInfo && videoInfo.videoDetails && videoInfo.videoDetails.title ?
            videoInfo.videoDetails.title : 'unknow';
            const authorName = videoInfo && videoInfo.videoDetails && videoInfo.videoDetails && videoInfo.videoDetails.author ? 
            videoInfo.videoDetails.author.name : '';
            const formatVideoName = videoName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').toString('utf8').split(' ');
            let formatedVideoName = '';
            formatVideoName.map((item, index) => {
                if (item.length > 0) {
                    formatedVideoName += item;
                    if (index < formatVideoName.length - 1) {
                        formatedVideoName += '_';
                    }
                }
            });
            return { videoName, authorName, formatedVideoName, videoUrl };
        } catch (error) {
            const err = new Error('Can not find info video')
            err.code = '403';
            throw err;
        }
    }

}

module.exports = new Music();