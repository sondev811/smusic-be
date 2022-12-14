const userService = require('../../services/user');

const getUserInfo = async (handleToken) => {
    try {
        const result = await userService.getUserInfo(handleToken);
        if (!result.success) {
            return result;
        }
        return {
            success: true,
            data: {
                userInfo: result.userInfo,
                queue: result.queue,
            }
        }
    } catch (error) {
        
    }
}

const updateCurrentPlaylist = async (token, playlistID) => {
  try {
    const userID = await userService.getUserIdFromToken(token);
    const result = await userService.updateCurrentPlaylist(userID, playlistID);
    if (!result.success) {
        return result;
    }
    return {
        success: true,
        userInfo: result.userInfo,
        queue: result.queue
    }
  } catch (error) {
      
  }
}

const signUp = async (body) => {
    return await userService.createUser(body);
}

const login = async (req) => {
    return await userService.login(req);
}

const resetPassword = async (email) => {
  return await userService.resetPassword(email);
}

module.exports = {getUserInfo, signUp, login, updateCurrentPlaylist, resetPassword};