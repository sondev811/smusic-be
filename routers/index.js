const express = require('express');
const router = express.Router();
require('dotenv').config();
const userService = require('../services/user');
const { search, getYoutubeTrending } = require('../controllers/youtube/youtube.controller');
const { getMusic, getQueueList, updateCurrentMusic, removeItemQueue, updateQueueList } = require('../controllers/music/music.controller');
const { getUserInfo, signUp, login} = require('../controllers/user/user.controller');
const ytdl = require('ytdl-core');
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
        const result = await getMusic(youtubeId, token);
        console.log('Response getMusic', result);
        res.status(200).json({success: true, result});
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
        console.log('Request stream');
        const videoId = req.query.id;
        const videoInfo = await ytdl.getInfo(videoId);
        if (!videoInfo || !videoInfo.formats) return;
        let audioFormat = ytdl.chooseFormat(videoInfo.formats, {
            filter: "audioonly",
            quality: "highestaudio"
        });

        const { itag, container, contentLength } = audioFormat

        const rangeHeader = req.headers.range || null;
        const rangePosition = (rangeHeader) ? rangeHeader.replace(/bytes=/, "").split("-") : null;
        const startRange = rangePosition ? parseInt(rangePosition[0], 10) : 0;
        const endRange = rangePosition && rangePosition[1].length > 0 ? parseInt(rangePosition[1], 10) : contentLength - 1;
        const chunksize = (endRange - startRange) + 1;
        
        res.writeHead(206, {
            'Content-Type': `audio/${container}`,
            'Content-Length': chunksize,
            "Content-Range": "bytes " + startRange + "-" + endRange + "/" + contentLength,
            "Accept-Ranges": "bytes",
        })

        const range = { start: startRange, end: endRange };
        const audioStream = ytdl(videoId, { filter: format => format.itag === itag, range });
        audioStream.pipe(res);
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
        const keySearch = req.query.key;
        const pageToken = req.query.pageToken;
        const result = await search(keySearch, pageToken);
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
        const result = await getYoutubeTrending(pageToken);
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
        const response = await getUserInfo(handleToken);
        if (!response.success) {
            res.status(401).json({error: 'Not access'});
            return;
        }
        console.log('Response getUserInfo', response.data);
        res.status(200).json({success: true, result: response.data});
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
        const response = await getQueueList(token);
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

router.get('/getQueueList', userService.isAuth, async (req, res) => {
    try {
        console.log('Request getQueueList');
        const token = req.headers.authorization;
        const response = await getQueueList(token);
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

router.post('/updateQueueList', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.body) {
            const error = new Error('Wrong body');
            error.code = '403';
            throw error;
        }
        console.log('Request updateQueueList');
        const token = req.headers.authorization;
        const response = await updateQueueList(token, req.body);
        console.log('Response updateQueueList', response);
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
        const response = await updateCurrentMusic(token, youtubeId);
        console.log('Response updateCurrentMusic', response);
        if (!response || !response.success) {
            res.status(401).json({error: 'Not access'});
        }
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
        const response = await removeItemQueue(token, musicId);
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
        const response = await signUp(req.body);
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
        const response = await login(req);
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