const youtubeService = require('../../services/youtube');
const userService = require('../../services/user');

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

const searchRecommend = (keySearch) => {
  try {
    return youtubeService.searchRecommend(keySearch);
  } catch (error) {
      const err = new Error('Can not search');
      err.code = '403';
      throw err;
  }
}

const saveSearchHistory = async (token, body) => {
  try {
    const userID = await userService.getUserIdFromToken(token);
    return youtubeService.saveSearchHistory(userID, body);
  } catch (error) {
    const err = new Error('Can not save history.');
    err.code = '404';
    throw err;
  }
}

const getYoutubeTrending = (pageToken) => {
    try {
        return youtubeService.getYoutubeTrending(pageToken);
    } catch (error) {
      const err = new Error('Can not get youtube trending.');
      err.code = '404';
      throw err;
    }
}

const getSearchHistory = async (token) => {
  try {
    const userID = await userService.getUserIdFromToken(token);
    return youtubeService.getSearchHistory(userID);
  } catch (error) {
    const err = new Error('Can not get search history.');
    err.code = '404';
    throw err;
  }
}

module.exports = {search, getYoutubeTrending, searchRecommend, saveSearchHistory, getSearchHistory};