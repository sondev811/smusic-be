const youtubeService = require('../../services/youtube');

let ytAPIKey = 0;
const search = async(keySearch, pageToken) => {
    try {
        if (ytAPIKey > 3) {
            ytAPIKey = 0
            const err = new Error('Can not search');
            err.code = '403';
            throw err;
        }
        ytAPIKey += 1;
        const key = `YOUTUBE_API_KEY${ytAPIKey}`;
        const apiKey = process.env[key];
        const response = await youtubeService.search(keySearch, pageToken, apiKey);
        if(!response.success) {
            return await search(keySearch, pageToken);
        } 
        ytAPIKey = 0
        return response.data
    } catch (error) {
        const err = new Error('Can not search');
        err.code = '403';
        throw err;
    }
}

const getYoutubeTrending = async (pageToken) => {
    try {
        return await youtubeService.getYoutubeTrending(pageToken);
    } catch (error) {
        
    }
}

module.exports = {search, getYoutubeTrending};