const userService = require('../../services/user');

const getUserInfo = async(handleToken) => {
    try {
        const result = await userService.getUserInfo(handleToken);
        if (!result.success) {
            return result;
        }
        return {
            success: true,
            data: {
                userInfo: result.userInfo,
                queue: result.queue.list,
                currentMusic: result.queue.currentMusic
            }
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

module.exports = {getUserInfo, signUp, login};