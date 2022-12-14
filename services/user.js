const userModel = require('../models/User.model');
const playlistModel = require('../models/Playlist.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PlaylistModel = require('../models/Playlist.model');
const nodemailer = require('nodemailer')

require('dotenv').config();
class User {
    constructor() {
        this.maxAge = 30 * 24 * 60 * 60;
    }
   
    async createUser(body) {
        try {
            const { email, password, name } = body;
            const checkExistUser = await userModel.findOne({email});
            if (checkExistUser) {
                return {
                    status: false,
                    error: 'Tên đăng nhập hoặc email đã tồn tại'
                };
            }
            const hashPassword = await bcrypt.hash(password, 12);
            const user = new userModel({
                email,
                password: hashPassword,
                name,
                currentPlaylist: '',
                queueListId: ''
            });
            await user.save();
            const playlist = new PlaylistModel({
              list: [],
              userID: user._id,
              playlistName: 'Hàng chờ',
              currentMusic: ''
            });
            await playlist.save();
            const query = {email: user.email}
            await userModel.findOneAndUpdate(query, {queueListId: playlist._id, currentPlaylist: playlist._id});
            const response = {
                status: true,
                error: null,
                result: user
            };
            return response;
        } catch (error) {
            return {
                status: false,
                error: error.message
            }; 
        }
    }

    generateAccessToken(body) {
        return jwt.sign(body, process.env.JWT_SECRET_KEY, {
            expiresIn: this.maxAge
        });
    }

    isAuth(req, res, next) {
        const jwtToken = req.headers.authorization;
        if (!jwtToken) {
            res.status(401).json({error: 'Not access'});
            return;
        }
        const handleToken = jwtToken.replace('Bearer ','');
        jwt.verify(handleToken, process.env.JWT_SECRET_KEY, (err, data) => {
            if(err) {
                res.status(401).json({error: 'Not access'});
                return;
            } 
            next();
        })
    }

    async verifyAccessToken(jwtToken) {
        return await jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, (err, data) => {
            if(err) {
                res.status(401).json({error: 'Not access'});
                return;
            } 
            return data;
        })
    }

    async getUserIdFromToken(token) {
        const handleToken = token.replace('Bearer ','');
        const decoded = await this.verifyAccessToken(handleToken);
        return decoded.id;
    }

    async login(req) {
        const { email, password } = req.body;
        const user = await userModel.findOne({email});
        if (!user) {
            return {
                status: false,
                error: 'Sai tên đăng nhập hoặc mật khẩu'
            };
        }
        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            return {
                status: false,
                error: 'Sai tên đăng nhập hoặc mật khẩu'
            };
        }
        const accessToken = this.generateAccessToken({id: user.id});
        user.password = null;
        const data = {
            accessToken,
            userInfo: user
        }
        return {
            status: true,
            data,
        };
    }

    async getUserInfo(token) { 
        const decoded = await this.verifyAccessToken(token);
        const user = await userModel.findOne({_id: decoded.id});
        const queue = await playlistModel.findOne({userID: decoded.id, _id: user.currentPlaylist});
        if (!user) {
            return {
                success: false,
                error: 'Not exist email'
            };
        }
        user.password = null;
        return {
            success: true,
            userInfo: user,
            queue
        };
    }

    async updateCurrentPlaylist(_id, playlistId) {
      const query = { _id }
      await userModel.findOneAndUpdate(query, {currentPlaylist : playlistId});
      const user = await userModel.findOne({_id});
      console.log(user.currentPlaylist);
      console.log(playlistId);
      const queryPlaylist = {_id: playlistId, userID: _id};
      const queue = await playlistModel.findOne(queryPlaylist);
      console.log(queue);
      if (!user) {
        return {
            success: false,
            error: 'Not exist email'
        };
      }
      user.password = null;
      return {
          success: true,
          userInfo: user,
          queue
      };
    }

    async resetPassword(email) {
      try {
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashPassword = await bcrypt.hash(randomPassword, 12);
        const user = await userModel.findOneAndUpdate({email}, {password: hashPassword});
        if (!user) {
          throw Error("Can not change password")
        }
        await this.sendEmail(email, user, randomPassword);
        return {
          success: true,
          email
        }
      } catch (error) {
        console.log(error, 'error');
        throw Error(error.message);
      }
    }

    async sendEmail(recipient, user, password) {
      try {
        const client = nodemailer.createTransport({
          service: "Gmail",
          auth: {
              user: "sondev811@gmail.com",
              pass: process.env.APP_PASSWORD
          }
        });
      
        client.sendMail(
            {
                from: "sondev811@gmail.com",
                to: recipient,
                subject: "Smusic - Request change password",
                text: `Hello ${user.name}, This is new password: ${password}`
            }
        )
      } catch (error) {
        console.log("Can not send email")        
      }
    }

}

module.exports = new User();