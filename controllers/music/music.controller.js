const musicService = require('../../services/music');

const getMusic = async (youtubeId) => {
    try {
        const data = await musicService.getMusic(youtubeId);
        if (data) return data;
        const { videoName, authorName, videoLength } = await musicService.getMusicInfo(youtubeId);
        const body = {
            youtubeId,
            name: videoName,
            authorName,
            audioThumb: `https://img.youtube.com/vi/${youtubeId}/0.jpg`,
            videoLength
        }
        const newData = await musicService.addMusic(body);
        return newData;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getMusic };