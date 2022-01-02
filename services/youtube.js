require('dotenv').config();
const axios = require('axios');
class Youtube {

    getURL = (searchKey, pageToken) => {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://youtube.googleapis.com/youtube/v3/search?q=${searchKey}&key=${apiKey}&maxResult=25&part=snippet&pageToken=${pageToken}`;
        return encodeURI(url);
    }

    async search(searchKey, pageToken) {
        const url = this.getURL(searchKey, pageToken);
        return await axios.get(url)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            const err = new Error('Can not search');
            err.code = '403';
            throw err;
        });
    }

    async getYoutubeTrending(pageToken = '') {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&maxResult=50&part=snippet, contentDetails&type=video&playlistId=PLUadgMpPaifXLKV26KIqpFp6mpZiyF2l9&pageToken=${pageToken}`;
        return await axios.get(url)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            const err = new Error('Can not search');
            err.code = '403';
            throw err;
        });
    }
}

module.exports = new Youtube();