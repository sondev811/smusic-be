const playlistModel = require('../models/Playlist.model');
const userModel = require('../models/User.model');

class Playlist {

  async createPlaylist(userID, playlistName) {
    try {
      const playlist = new playlistModel({
        list: [],
        userID,
        playlistName,
        currentMusic: ''
      });
      await playlist.save();
      return playlist;
    } catch (error) {
        return {
            status: false,
            error: error.message
        }; 
    }
  }

  async getPlaylist(userID) {
    const query = {userID};
    const playlist = await playlistModel.find(query);
    return playlist;
  }

  async getPlaylistById(userID, _id) {
    try {
      const query = { userID, _id};
      const playlist = await playlistModel.findOne(query);
      return playlist;
    } catch (error) {
      console.log(error)    ;  
    }
  }

  async removePlaylist(userID, playlistId) {
    try {
      const query = {userID, _id: playlistId};
      const user = await userModel.findOne({_id: userID});
      if (!user) {
        const error = new Error();
        error.code = '401';
        throw error;
      }
      if (user.queueListId === playlistId) {
        const error = new Error('Can not remove playlist');
        error.code = '403';
        throw error;
      }
      const playlist = await playlistModel.findOneAndRemove(query);
      return playlist;
    } catch (error) {
      throw error;
    }
  }  

  async getSongsPlaylist(userID, playlistId) {
    const query = {_id: playlistId, userID};
    const playlist = await playlistModel.findOne(query);
    return playlist;
  }

  async insertSongPlaylist(userID, playlistId, music) {
      const query = {userID,_id: playlistId}
      const playlist = await playlistModel.findOne(query);
      console.log(userID, 'userId');
      console.log(playlistId, 'playlist');
      if (playlist.list && !playlist.list.length || 
          !playlist.list.find(item => item._id.equals(music._id))) {
          playlist.list.unshift(music);
          await playlistModel.findOneAndUpdate(query, {list : playlist.list}, { new: true });
      }
      return playlist;
  }

  async updateMusicPlaylist(userID, body, playlistId) {
    try {
      const query = {userID, _id: playlistId}
      const {sourceIndex, destinationIndex} = body;
      const queue = await playlistModel.findOne(query);
      if (!queue || !queue.list) {
          const error = new Error(err.message);
          error.code = '403';
          throw error;
      }
      const dragItemSource = queue.list[sourceIndex];
      let items = queue.list.filter(item => item !== dragItemSource);
      items.splice(destinationIndex, 0, dragItemSource);
      const newQueue = await playlistModel.findOneAndUpdate(query, {list: items}, { new: true });
      return newQueue.list;
    } catch (error) {
      console.log(error);
    }
  }

  async updateCurrentMusic(userID, music, playlistId) {
    const query = {userID, _id: playlistId};
    return await playlistModel.findOneAndUpdate(query, {currentMusic : music});
  }

  async removeItemPlaylist(userID, playlistId, musicId) {
      const query = {userID, _id: playlistId};
      const playlist = await playlistModel.findOne(query);
      const index = playlist.list.findIndex(item => item._id.equals(musicId));
      if (index > -1) {
          playlist.list.splice(index, 1);
      }
      const newPlaylist = await playlistModel.findOneAndUpdate(query, {list : playlist.list}, { new: true } );
      return newPlaylist;
  }

  async updateQueueList(userID, body) {
    try {
      const {sourceIndex, destinationIndex, playlistId} = body;
        const query = {_id: playlistId, userID};
        const queue = await playlistModel.findOne(query);
        if (!queue || !queue.list) {
            const error = new Error(err.message);
            error.code = '403';
            throw error;
        }
        const dragItemSource = queue.list[sourceIndex];
        let items = queue.list.filter(item => item !== dragItemSource);
        items.splice(destinationIndex, 0, dragItemSource);
        const newQueue = await playlistModel.findOneAndUpdate(query, {list: items});
        return newQueue.list;
    } catch (error) {
        console.log(error);
    }
}

}

module.exports = new Playlist();