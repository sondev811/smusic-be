const queueModel = require('../models/Queue.model');
const userService = require('../services/user');

class Queue {

    async getQueue(youtubeId) {
        return await musicModel.find({ youtubeId });
    }

    async getQueueList(userID) {
        const queueList = await queueModel.findOne({userID});
        return queueList.list;
    }

    async insertQueueList(music, userID) {
        const query = {userID}
        const queue = await queueModel.findOne(query);
        if (queue.list && !queue.list.length || 
            !queue.list.find(item => item._id.equals(music._id))) {
            queue.list.push(music);
            await queueModel.findOneAndUpdate(query, {list : queue.list}, { new: true });
        }
        return queue.list;
    }

    async updateQueueList(musicId, userID, ggDriveId) {
        const query = {userID};
        const queue = await queueModel.findOne(query);
        if (queue && queue.list && queue.list.length) {
            queue.list.forEach(element => {
                if (element._id.equals(musicId)) {
                    element.ggDriveId = ggDriveId;
                }
            });
            await queueModel.findOneAndUpdate(query, {list : queue.list}, { new: true } );
        }
    }

    async updateCurrentMusic(userID, music) {
        const query = {userID};
        await queueModel.findOneAndUpdate(query, {currentMusic : music}, { new: true } );
    }

    async removeItemQueue(userID, musicId) {
        const query = {userID};
        const queue = await queueModel.findOne(query);
        const index = queue.list.findIndex(item => item._id.equals(musicId));
        if (index > -1) {
            queue.list.splice(index, 1);
        }
        const newQueue = await queueModel.findOneAndUpdate(query, {list : queue.list}, { new: true } );
        return newQueue.list;
    }

}

module.exports = new Queue();