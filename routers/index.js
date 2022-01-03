const express = require('express');
const router = express.Router();
require('dotenv').config();
const musicService = require('../services/music');
const youtubeService = require('../services/youtube');
const userService = require('../services/user');
const queueService = require('../services/queue');
const stream = require('youtube-audio-stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

router.get('/getMusic', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.id) {
            const error = new Error('Missing id')
            error.code = '403';
            throw error;
        }
        console.log('Request getMusic');
        const youtubeId = req.query.id; 
        const token = req.headers.authorization;
        const data = await musicService.getMusic(youtubeId);
        const userID = await userService.getUserIdFromToken(token);
        if (data) {
            const queueList = await queueService.insertQueueList(data, userID);
            await queueService.updateCurrentMusic(userID, data);
            const response = {
                queueList,
                currentMusic: data
            }
            console.log('Response getMusic', response);
            res.status(200).json({success: true, result: response});
            return;
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
        const resTemplate = {
            queueList,
            currentMusic: newData
        }
        console.log('Response getMusic', resTemplate);
        res.status(200).json({success: true, result: resTemplate});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }     
    }
});

router.get('/stream', async(req, res) => {
    try {
        if (!req || !req.query || !req.query.id) {
            const error = new Error('Missing id');
            error.code = '403';
            throw error;
        }
        console.log('Streaming');
        const url = `https://www.youtube.com/watch?v=${req.query.id}`;
        for await (const chunk of stream(url)) {
            res.write(chunk);
        }
        res.end();
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }         
    }
});

router.get('/search', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.key) {
            const error = new Error('Missing key search')
            error.code = '403';
            throw error;
        }
        console.log('Request search');
        const pageToken = req.query.pageToken;
        const keySearch = req.query.key;
        const result = await youtubeService.search(keySearch, pageToken);
        console.log('Response search', result);
        res.status(200).json({success: true, result});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
    
});

router.get('/getYoutubeTrending', userService.isAuth, async (req, res) => {
    try {
        console.log('Request getYoutubeTrending');
        const pageToken = req.query.pageToken;
        const result = await youtubeService.getYoutubeTrending(pageToken);
        console.log('Response getYoutubeTrending', result);
        res.status(200).json({success: true, result});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
    
});

router.get('/getUserInfo', userService.isAuth, async (req, res) => {
    try {
        console.log('Request getUserInfo');
        const token = req.headers.authorization;
        const handleToken = token.replace('Bearer ','');
        const result = await userService.getUserInfo(handleToken);
        if (!result.status) {
            res.status(401).json({error: 'Not access'});
            return;
        }
        const response = {
            userInfo: result.userInfo,
            queue: result.queue.list,
            currentMusic: result.queue.currentMusic,
        }
        console.log('Response getUserInfo', response);
        res.status(200).json({success: true, result: response});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
    
});

router.get('/getQueueList', userService.isAuth, async (req, res) => {
    try {
        console.log('Request getQueueList');
        const token = req.headers.authorization;
        const userID = await userService.getUserIdFromToken(token);
        const result = await queueService.getQueueList(userID);
        const response = {
            queue: result
        }
        console.log('Response getQueueList', response);
        res.status(200).json({success: true, result: response});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
    
});

router.get('/updateCurrentMusic', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.youtubeId) {
            const error = new Error('Missing musicId')
            error.code = '403';
            throw error;
        }
        console.log('Request updateCurrentMusic');
        const token = req.headers.authorization;
        const youtubeId = req.query.youtubeId;
        const userID = await userService.getUserIdFromToken(token);
        const music = await musicService.getMusic(youtubeId);
        await queueService.updateCurrentMusic(userID, music);
        const response = {
            success: true
        }
        console.log('Response updateCurrentMusic', response);
        res.status(200).json({success: true, result: response});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
    
});

router.get('/removeItemQueue', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.musicId) {
            const error = new Error('Missing musicId')
            error.code = '403';
            throw error;
        }
        console.log('Request removeItemQueue');
        const token = req.headers.authorization;
        const musicId = req.query.musicId;
        const userID = await userService.getUserIdFromToken(token);
        const result = await queueService.removeItemQueue(userID, musicId);
        const response = {
            queue: result
        }
        console.log('Response removeItemQueue', response);
        res.status(200).json({success: true, result: response});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
    
});

router.post('/signup', async (req, res) => {
    try {
        if (!req || !req.body || !req.body.email || !req.body.password || !req.body.name) {
            const error = new Error('Wrong body');
            error.code = '403';
            throw error;
        }
        console.log('Request signup');
        const response = await userService.createUser(req.body);
        if (!response.status) {
            console.log('Response signup', response.error);
            res.status(200).json({success: false, error: response.error, statusCode: 404});
            return;
        }
        console.log('Response signup', response.result);
        res.status(200).json({success: true});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
});

router.post('/login', async (req, res) => {
    try {
        if (!req || !req.body || !req.body.email || !req.body.password) {
            const error = new Error('Wrong body');
            error.code = '403';
            throw error;
        }
        console.log('Request login');
        const response = await userService.login(req);
        if (!response.status) {
            res.status(200).json({success: false, error: response.error, statusCode: 404});
            return;
        }
        console.log('Response login', response.data);
        res.status(200).json({success: true, result: response.data});
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }    
    }
});

module.exports = router;