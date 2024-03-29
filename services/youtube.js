require('dotenv').config();
const axios = require('axios');
const youtubeModel = require('../models/Youtube.model');
class Youtube {

    getURL = (searchKey, pageToken, apiKey) => {
        const url = `https://youtube.googleapis.com/youtube/v3/search?q=${searchKey}&key=${apiKey}&maxResults=10&part=snippet&regionCode=VN&pageToken=${pageToken}&type=video`;
        return encodeURI(url);
    }

    async search(searchKey, pageToken, apiKey) {
        const url = this.getURL(searchKey, pageToken, apiKey);
        return await axios.get(url)
        .then(response => {
            return {
                success : true,
                data: response.data
            };
        })
        .catch(error => {
           return { success: false}
        });
    }

    async getYoutubeTrending(pageToken = '') {
        const apiKey = process.env.YOUTUBE_API_KEY1;
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&maxResults=10&part=snippet, contentDetails&type=video&playlistId=PLUadgMpPaifXLKV26KIqpFp6mpZiyF2l9&pageToken=${pageToken}`;
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

    async searchRecommend(searchKey) {
      try {
        const url = `http://suggestqueries.google.com/complete/search?hl=vn&ds=yt&client=youtube&hjson=t&cp=1&gl=vn&alt=json&q=${searchKey}`;
        const res = await axios.get(url);
        if (!res || !res.data || !res.data.length) throw Error('Can not search with this key!!!');
        const data = res.data[1].map(element => element[0]);
        return data;
      } catch (error) {
        throw Error(error)        
      }
    }

    async saveSearchHistory(userID, keySearch) {
      try {
        const filter = { userID };
        const history = await youtubeModel.findOne(filter);
        if (!history) {
          const newHistory = new youtubeModel({
            list: [],
            userID
          });
          newHistory.list.push(keySearch);
          return await newHistory.save();
        }
        const index = history.list.indexOf(keySearch);
        if (index !== -1) {
          history.list.splice(index, 1);
        }
        history.list.unshift(keySearch);
        if (history.list.length > 10) history.list.pop();
        const update = { list: history.list };
        return await youtubeModel.findOneAndUpdate(filter, update);
      } catch (error) {
        throw Error(error);
      }
    }

    getSearchHistory = async (userID) => {
      try {
        return youtubeModel.findOne({userID})
      } catch (error) {
        throw Error(error);        
      }
    }
}

module.exports = new Youtube();