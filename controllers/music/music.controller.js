const musicService = require('../../services/music');
const queueService = require('../../services/queue');
const userService = require('../../services/user');

const getMusic = async (youtubeId, token) => {
    try {
        const data = await musicService.getMusic(youtubeId);
        const userID = await userService.getUserIdFromToken(token);
        if (data) {
            const queueList = await queueService.insertQueueList(data, userID);
            await queueService.updateCurrentMusic(userID, data);
            return {
                queueList,
                currentMusic: data
            };
        }
        const { videoName, authorName, videoLength } = await musicService.getMusicInfo(youtubeId);
        const body = {
            youtubeId,
            name: videoName,
            authorName,
            audioThumb: `https://img.youtube.com/vi/${youtubeId}/0.jpg`,
            videoLength
        }
        const newData = await musicService.addMusic(body);
        const queueList = await queueService.insertQueueList(newData, userID);
        await queueService.updateCurrentMusic(userID, newData);
        return {
            queueList,
            currentMusic: newData
        }
    } catch (error) {
        console.log(error);
    }
}

const getQueueList = async (token) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const result = await queueService.getQueueList(userID);
        return {
            queue: result
        }
    } catch (error) {
        
    }
}

const updateCurrentMusic = async (token, youtubeId) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const music = await musicService.getMusic(youtubeId);
        const data = await queueService.updateCurrentMusic(userID, music);
        if (!data) {
            return {
                success: false
            }
        }
        return {
            success: true
        }
    } catch (error) {
        
    }
}

const removeItemQueue = async (token, musicId) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const result = await queueService.removeItemQueue(userID, musicId);
        return {
            queue: result
        }
    } catch (error) {
        
    }
}

const updateQueueList = async(token, body) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const result = await queueService.updateQueueList(userID, body);
        return {
            queue: result
        }
    } catch (err) {
       console.log(err);
    }
}

module.exports = {getMusic, getQueueList, updateCurrentMusic, removeItemQueue, updateQueueList};