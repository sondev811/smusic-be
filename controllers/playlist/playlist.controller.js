const userService = require('../../services/user');
const playlistService = require('../../services/playlist');

const getPlaylist = async (token) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const result = await playlistService.getPlaylist(userID);
        return {
            playlist: result
        }
    } catch (error) {
        
    }
}

const getPlaylistById = async (token, playlistId) => {
  try {
    const userID = await userService.getUserIdFromToken(token);
    return await playlistService.getPlaylistById(userID, playlistId)
  } catch (error) {
    console.log(error)
  }
}

const createPlaylist = async (token, playlistName) => {
  try {
      const userID = await userService.getUserIdFromToken(token);
      const result = await playlistService.createPlaylist(userID, playlistName);
      return result;
  } catch (error) {
      
  }
}

const removePlaylist = async (token, playlistId) => {
  try {
      const userID = await userService.getUserIdFromToken(token);
      const result = await playlistService.removePlaylist(userID, playlistId);
      return {
          playlist: result
      }
  } catch (error) {
      throw error;
  }
}

const getSongsPlaylist = async (token, playlistId) => {
  try {
      const userID = await userService.getUserIdFromToken(token);
      const result = await playlistService.getSongsPlaylist(userID, playlistId);
      return result;
  } catch (error) {
      
  }
}

const insertSongPlaylist = async (userID, playlistId, music) => {
  try {
      const result = await playlistService.insertSongPlaylist(userID, playlistId, music);
      return {
        playlist: result
      }
  } catch (error) {
      
  }
}

const updateCurrentMusic = async (token, music, playlistId) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const data = await playlistService.updateCurrentMusic(userID, music, playlistId);
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

const removeItemPlaylist = async (token, playlistId, musicId) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const result = await playlistService.removeItemPlaylist(userID, playlistId, musicId);
        return {
            queue: result
        }
    } catch (error) {
        
    }
}

const updateQueueList = async(token, body) => {
    try {
        const userID = await userService.getUserIdFromToken(token);
        const result = await playlistService.updateQueueList(userID, body);
        return {
            queue: result
        }
    } catch (err) {
       console.log(err);
    }
}

module.exports = { 
  createPlaylist, 
  getPlaylist, 
  removePlaylist, 
  getSongsPlaylist, 
  insertSongPlaylist, 
  removeItemPlaylist, 
  updateCurrentMusic, 
  updateQueueList, 
  getPlaylistById 
};