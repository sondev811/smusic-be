const express = require('express');
const router = express.Router();
const fs = require('fs');
require('dotenv').config();
const ytdl = require('ytdl-core');
const {uploadDrive, publicUrl} = require('../services/drive');
const musicService = require('../services/music');
const youtubeService = require('../services/youtube');
const userService = require('../services/user');
const queueService = require('../services/queue');
const path = require('path');

router.get('/getMusic', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.id) {
            const error = new Error('Missing id')
            error.code = '403';
            throw error;
        }
        console.log('Request getMusic');
        const videoID = req.query.id; 
        const token = req.headers.authorization;
        const data = await musicService.getMusic(videoID);
        const userID = await userService.getUserIdFromToken(token);
        if (data && data.ggDriveId) {
            const queueList = await queueService.insertQueueList(data, userID);
            const response = {
                queueList,
                musicData: data
            }
            console.log('Response getMusic', response);
            res.status(200).json({success: true, result: response});
            return;
        }
        const { videoName, authorName, formatedVideoName, videoUrl } = await musicService.getMusicInfo(videoID);
        const body = {
            youtubeId: videoID,
            name: videoName,
            nameFormatted: formatedVideoName,
            ggDriveId: '',
            authorName,
            audioThumb: `https://img.youtube.com/vi/${videoID}/0.jpg`,
        }
        const newData = await musicService.addMusic(body);
        const queueList = await queueService.insertQueueList(newData, userID);
        const resTemplate = {
            queueList,
            musicData: newData
        }
        console.log('Response getMusic', resTemplate);
        res.status(200).json({success: true, result: resTemplate});
        const videoReadableStream = ytdl(videoUrl, { filter: 'audioonly'});
        console.log('downloading file');
        const videoWritableStream = fs.createWriteStream(`${formatedVideoName}.mp3`); 
        videoReadableStream.pipe(videoWritableStream);
        videoWritableStream.on('finish', async () => {
            console.log(`download ${formatedVideoName} done and uploading to drive`);
            const response = await uploadDrive(formatedVideoName);
            if (!response || !response.id) {
                res.status(200).json({success: false, error: 'Can not get link mp3', statusCode: 404});
                return;
            }
            const publicUrlRes = await publicUrl(response.id);
            if (!publicUrlRes.success) {
                res.status(200).json({success: false, error: 'Can not get link mp3', statusCode: 404});
                return;
            }
            const filePath = path.join(__dirname, '../musics', `${formatedVideoName}.mp3`); 
            fs.unlink(filePath, (err) => {
                if(err && err.code == 'ENOENT') {
                    console.log("File doesn't exist, won't remove it.");
                } else if (err) {
                    console.log("Error occurred while trying to remove file");
                } else {
                    console.log(`Removed file`);
                }
            });
            const ggDriveId = response.id;
            await musicService.updateMusic(videoID, {ggDriveId});
            await queueService.updateQueueList(newData.id, userID, ggDriveId);
        });
    } catch (err) {
        if (err.code) {
            res.status(err.code).json({error: err.message});           
        } else {
            res.status(500).json({error: err.message});         
        }     
    }
});

router.get('/stream', userService.isAuth, (req, res) => {
    try {
        if (!req || !req.query || !req.query.name) {
            const error = new Error('Missing music name')
            error.code = '403';
            throw error;
        }
        const name = req.query.name;
        console.log('start stream');
        const filePath = path.join(__dirname, '../musics', `${name}.mp3`); 
        const stat = fs.statSync(filePath);
        const total = stat.size;
        const range = req.headers.range;
        if (!range) {
            const error = new Error('Requires Range header')
            error.code = '403';
            throw error;
        }
        const parts = range.replace(/bytes=/, '').split('-');
        const partialStart = parts[0];
        const partialEnd = parts[1];
        const start = parseInt(partialStart, 10);
        const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
        const chunksize = (end - start) + 1;
        res.writeHead(200, 
            { 
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                'Content-Length': total, 
                'Content-Type': 'audio/mpeg' 
            });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
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