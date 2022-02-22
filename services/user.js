const userModel = require('../models/User.model');
const queueModel = require('../models/Queue.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
                name
            });
            await user.save();
            const queue = new queueModel({
                list: [],
                userID: user._id,
                currentMusic: ''
            });
            await queue.save();
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
        const queue = await queueModel.findOne({userID: decoded.id});
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

}

module.exports = new User();