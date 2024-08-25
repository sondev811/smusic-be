const express = require('express');
const router = express.Router();
require('dotenv').config();
const userService = require('../services/user');
const { search, getYoutubeTrending, searchRecommend, getSearchHistory } = require('../controllers/youtube/youtube.controller');
const { getMusic } = require('../controllers/music/music.controller');
const { getUserInfo, signUp, login, updateCurrentPlaylist, resetPassword} = require('../controllers/user/user.controller');
const ytdl = require("ytdl-core");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { createPlaylist, getPlaylist, getSongsPlaylist, insertSongPlaylist, removeItemPlaylist, removePlaylist, updateCurrentMusic, updateQueueList, getPlaylistById, editPlaylistName } = require('../controllers/playlist/playlist.controller');
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const cookie = [
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "__Secure-1PAPISID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "swmataVgFfxwfhNx/A-jcIzQWplnm9kwj-",
    "id": 1
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-1PSID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "g.a000nQjxJCrLKoU5M4-WN7Sq9a3MSsIc08jdnAhDxIzol6GluTc_LljyVPCt-XK14Diz1zcsQAACgYKAToSARMSFQHGX2MiHmbs1oeCfO_Prx_uG4jZ8BoVAUF8yKpu1z_GDooOpM56lYkPMIZf0076",
    "id": 2
},
{
    "domain": ".youtube.com",
    "expirationDate": 1756152306.908353,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-1PSIDCC",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AKEyXzWgAJn-PZwlRpaEo72feTRGdxta91KO2_MiowcAUjAA-iJq3uT0e8O55y4noXlo_p8zAg",
    "id": 3
},
{
    "domain": ".youtube.com",
    "expirationDate": 1756152294.526806,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-1PSIDTS",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "sidts-CjEBUFGoh5Xo7CDfSg0RzGrut7r8IOa-cV-RUxlf72Kke5wkZdUcEJWomYh6dRyHBufgEAA",
    "id": 4
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "__Secure-3PAPISID",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "swmataVgFfxwfhNx/A-jcIzQWplnm9kwj-",
    "id": 5
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-3PSID",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "g.a000nQjxJCrLKoU5M4-WN7Sq9a3MSsIc08jdnAhDxIzol6GluTc_5jmNYSTvhLu8H6OIMiy5ugACgYKAQESARMSFQHGX2Mi3FVio3tpfqYLrd7afzvlBxoVAUF8yKqKquz9gjAxQTaq_yP2gzfA0076",
    "id": 6
},
{
    "domain": ".youtube.com",
    "expirationDate": 1756152306.908632,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-3PSIDCC",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AKEyXzVQ0HTF-n9Txd4lJyCcXQow8OpAiZBIjHs27RlhdIS4Cb1dOIqW8eYOmvTQyIBjTXKr",
    "id": 7
},
{
    "domain": ".youtube.com",
    "expirationDate": 1756152294.527166,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-3PSIDTS",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "sidts-CjEBUFGoh5Xo7CDfSg0RzGrut7r8IOa-cV-RUxlf72Kke5wkZdUcEJWomYh6dRyHBufgEAA",
    "id": 8
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "APISID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": true,
    "storeId": "0",
    "value": "PcjEH62CFtcFbAL4/ANlk8dgfMFeMdKr0m",
    "id": 9
},
{
    "domain": ".youtube.com",
    "expirationDate": 1724618002.838923,
    "hostOnly": false,
    "httpOnly": true,
    "name": "GPS",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "1",
    "id": 10
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": true,
    "name": "HSID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": true,
    "storeId": "0",
    "value": "ATghnHl5zQqKa-8Ig",
    "id": 11
},
{
    "domain": ".youtube.com",
    "expirationDate": 1759176294.634872,
    "hostOnly": false,
    "httpOnly": true,
    "name": "LOGIN_INFO",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AFmmF2swRAIgRE3T-JMgSR6C2Ed6PwQon_YhtO2oKJ1bBDkakA2G9FwCIE-USj00m7TtlH0SwXHUPlxSEAWRmpfBdOumWngQLzOK:QUQ3MjNmelRUS25EX012clo4RExKUzJFYWN2R0FidV93SFNwMlJ1bUIyWXJnbVhwSmVsZkVWazJJSk00NmdlSC01RWFjZUpvMmZoZ3dqRFJXMDRWd2tJSWlORkhyT1F0MWxxa04xYnVVRTc1blNaQ2lDTlVtZkVDX0gtdXY3NTlSUWdGSG1mQnFiX2xQQzJzQkFxTkJZeFRJSjNHdF9pVXVR",
    "id": 12
},
{
    "domain": ".youtube.com",
    "expirationDate": 1759176303.794721,
    "hostOnly": false,
    "httpOnly": false,
    "name": "PREF",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "f4=4000000&f6=40000000&tz=Asia.Bangkok",
    "id": 13
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "SAPISID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "swmataVgFfxwfhNx/A-jcIzQWplnm9kwj-",
    "id": 14
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "SID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": true,
    "storeId": "0",
    "value": "g.a000nQjxJCrLKoU5M4-WN7Sq9a3MSsIc08jdnAhDxIzol6GluTc_q42TlvJKdh11kXh1O3DxvAACgYKAeQSARMSFQHGX2MiSYA_cEw2eBsWMXRqrBjKzxoVAUF8yKp-WF72h0ROLuCMAjOZNH880076",
    "id": 15
},
{
    "domain": ".youtube.com",
    "expirationDate": 1756152306.907877,
    "hostOnly": false,
    "httpOnly": false,
    "name": "SIDCC",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "AKEyXzUv_wEmv1ZiTW4OV2QFZ8tCRTehWE2SGmDmjSxWQK_yx3ze23kEgbcRVQlSFIMv-x9tUQ",
    "id": 16
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": true,
    "name": "SSID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "API5boLLHon7MFn6L",
    "id": 17
},
{
    "domain": ".youtube.com",
    "expirationDate": 1724616309,
    "hostOnly": false,
    "httpOnly": false,
    "name": "ST-tladcw",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "session_logininfo=AFmmF2swRAIgRE3T-JMgSR6C2Ed6PwQon_YhtO2oKJ1bBDkakA2G9FwCIE-USj00m7TtlH0SwXHUPlxSEAWRmpfBdOumWngQLzOK%3AQUQ3MjNmelRUS25EX012clo4RExKUzJFYWN2R0FidV93SFNwMlJ1bUIyWXJnbVhwSmVsZkVWazJJSk00NmdlSC01RWFjZUpvMmZoZ3dqRFJXMDRWd2tJSWlORkhyT1F0MWxxa04xYnVVRTc1blNaQ2lDTlVtZkVDX0gtdXY3NTlSUWdGSG1mQnFiX2xQQzJzQkFxTkJZeFRJSjNHdF9pVXVR",
    "id": 18
},
{
    "domain": ".youtube.com",
    "expirationDate": 1724616310,
    "hostOnly": false,
    "httpOnly": false,
    "name": "ST-xuwub9",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "session_logininfo=AFmmF2swRAIgRE3T-JMgSR6C2Ed6PwQon_YhtO2oKJ1bBDkakA2G9FwCIE-USj00m7TtlH0SwXHUPlxSEAWRmpfBdOumWngQLzOK%3AQUQ3MjNmelRUS25EX012clo4RExKUzJFYWN2R0FidV93SFNwMlJ1bUIyWXJnbVhwSmVsZkVWazJJSk00NmdlSC01RWFjZUpvMmZoZ3dqRFJXMDRWd2tJSWlORkhyT1F0MWxxa04xYnVVRTc1blNaQ2lDTlVtZkVDX0gtdXY3NTlSUWdGSG1mQnFiX2xQQzJzQkFxTkJZeFRJSjNHdF9pVXVR",
    "id": 19
}
]
router.get('/stream', userService.isAuth, async(req, res) => {
  try {
    if (!req || !req.query || !req.query.id || !req.query.device) {
        const error = new Error('Missing id || device');
        error.code = '403';
        throw error;
    }
    console.log('Request stream');
    const videoId = req.query.id;
    const device = req.query.device;
    // const ytDlpPath = path.join(process.cwd(), "bin", "yt-dlp.exe");
    // const command = `${ytDlpPath} -g -f bestaudio https://www.youtube.com/watch?v=${videoId}`;
    const extractUrl = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
      format: 'bestaudio',
      getUrl: true
    });
    
    console.log(extractUrl, 'url');
    res.status(200).json({
      success: true, 
      result: {
       url: extractUrl
    }});
    return;
    const agent = ytdl.createAgent(cookie);
    const videoInfo = await ytdl.getInfo(videoId, { agent });
    if (!videoInfo || !videoInfo.formats) {
      res.status(200).json({success: false, error: 'not found', statusCode: 404});
    };
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, {
      filter: "audioonly",
      quality: "highestaudio"
    });
    if (device !== 'apple') {
      const result = { url: audioFormat.url, type: audioFormat.mimeType, quality: audioFormat.audioQuality };
      console.log('Response stream', result);
      res.status(200).json({ success: true, result });
      return;
    }
    const filterData = videoInfo.formats.filter(item => item?.mimeType.includes('audio/mp4') && (item?.audioQuality === 'AUDIO_QUALITY_MEDIUM' || 
    item?.audioQuality === 'AUDIO_QUALITY_HIGH'));
    const data = filterData && filterData[0] ? filterData[0] : audioFormat; 
    const result = { url: data.url, type: data.mimeType, quality: data.audioQuality };
    console.log('Response stream', result);
    res.status(200).json({success: true, result});
  } catch (err) {
    if (err?.code && err?.message) {
        res.status(err.code).json({error: err.message});           
    } else {
        res.status(500).json({error: err?.message || 'Server error'});         
    }   
  }
});

router.get('/searchRecommend', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.query || !req.query.key) {
      const error = new Error('Missing key search')
      error.code = '403';
        throw error;
    }
    console.log('Request search recommend.');
    const keySearch = req.query.key;
    const result = await searchRecommend(keySearch);
    console.log('Response search recommend', result);
    res.status(200).json({success: true, result});
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
            const error = new Error('Missing key search or pageToken')
            error.code = '403';
            throw error;
        }
        console.log('Request search');
        const keySearch = req.query.key;
        const pageToken = req.query.pageToken;
        const token = req.headers.authorization;
        const result = await search(token, keySearch, pageToken);
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

router.get('/updateCurrentPlaylist', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.query || !req.query.playlistId) {
        const error = new Error('Missing playlistId')
        error.code = '403';
        throw error;
    }
    console.log('Request updateCurrentPlaylist');
    const token = req.headers.authorization;
    const playlistId = req.query.playlistId;
    const response = await updateCurrentPlaylist(token, playlistId);
    console.log('Response updateCurrentPlaylist', response);
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

router.get('/getSearchHistory', userService.isAuth, async (req, res) => {
  try {
    console.log('Request getSearchHistory');
    const token = req.headers.authorization;
    const response = await getSearchHistory(token)
    res.status(200).json({success: true, result: response});
  } catch (err) {
    if (err.code) {
      res.status(err.code).json({error: err.message});           
    } else {
        res.status(500).json({error: err.message});         
    }    
  }
})

router.get('/updateCurrentMusic', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.youtubeId || !req.query.playlistId) {
            const error = new Error('Missing musicId || playlistId')
            error.code = '403';
            throw error;
        }
        console.log('Request updateCurrentMusic');
        const token = req.headers.authorization;
        const youtubeId = req.query.youtubeId;
        const playlistId = req.query.playlistId;
        const music = await getMusic(youtubeId);
        const response = await updateCurrentMusic(token, music, playlistId);
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

router.post('/createPlaylist', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.body || !req.body.playlistName) {
      const error = new Error('Missing playlistName')
      error.code = '403';
      throw error;
    }
      const token = req.headers.authorization;
      const response = await createPlaylist(token, req.body.playlistName);
      console.log('Response create playlist', response);
      res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
  
});

router.post('/editPlaylistName', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.body || !req.body.playlistName ||!req.body.playlistId) {
      const error = new Error('Missing playlistName || playlistId');
      error.code = '403';
      throw error;
    }
    console.log('Request editPlaylistName');
    const token = req.headers.authorization;
    const response = await editPlaylistName(token, req.body.playlistName, req.body.playlistId);
    console.log('Response editPlaylistName', response);
    res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
  
});

router.get('/getPlaylist', userService.isAuth, async (req, res) => {
  try {
      console.log('Request getPlaylist');
      const token = req.headers.authorization;
      const response = await getPlaylist(token);
      console.log('Response getPlaylist', response);
      res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
  
});

router.get('/getPlaylistById', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.query || !req.query.playlistId) {
      const error = new Error('Missing id')
      error.code = '403';
      throw error;
    }
    console.log('Request getPlaylistById');
    const token = req.headers.authorization;
    const response = await getPlaylistById(token, req.query.playlistId);
    console.log('Response getPlaylistById', response);
    res.status(200).json({success: true, result: response});
  } catch (err) {
    if (err.code) {
      res.status(err.code).json({error: err.message});           
    } else {
        res.status(500).json({error: err.message});         
    }   
  }
})

router.get('/removePlaylist', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.query || !req.query.playlistId) {
      const error = new Error('Missing id')
      error.code = '403';
      throw error;
    }
    console.log('Request removePlaylist');
    const token = req.headers.authorization;
    const response = await removePlaylist(token, req.query.playlistId);
    console.log('Response removePlaylist', response);
    res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
  
});

router.get('/getSongsPlaylist', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.query || !req.query.playlistId) {
      const error = new Error('Missing playlistId')
      error.code = '403';
      throw error;
    }
      console.log('Request getSongsPlaylist');
      const token = req.headers.authorization;
      const response = await getSongsPlaylist(token, req.query.playlistId);
      console.log('Response getSongsPlaylist', response);
      res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
  
});

router.get('/insertSongPlaylist', userService.isAuth, async (req, res) => {
  try {
    if (!req || !req.query || !req.query.id || !req.query.playlistId) {
      const error = new Error('Missing id')
      error.code = '403';
      throw error;
    }
    console.log('Request insertSongPlaylist');
    const youtubeId = req.query.id; 
    const playlistId = req.query.playlistId;
    const token = req.headers.authorization;
    const userID = await userService.getUserIdFromToken(token);
    const music = await getMusic(youtubeId);
    const response = await insertSongPlaylist(userID, playlistId, music);
    console.log('Response insertSongPlaylist', response);
    res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
  
});

router.get('/removeItemPlaylist', userService.isAuth, async (req, res) => {
    try {
        if (!req || !req.query || !req.query.musicId || !req.query.playlistId) {
            const error = new Error('Missing musicId || playlist')
            error.code = '403';
            throw error;
        }
        console.log('Request removeItemPlaylist');
        const token = req.headers.authorization;
        const musicId = req.query.musicId;
        const playlistId = req.query.playlistId;
        const response = await removeItemPlaylist(token, playlistId, musicId);
        console.log('Response removeItemPlaylist', response);
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

router.post('/resetPassword', async (req, res) => {
  try {
      if (!req || !req.body || !req.body.email) {
          const error = new Error('Wrong body');
          error.code = '403';
          throw error;
      }
      console.log('Request resetPassword');
      const response = await resetPassword(req.body.email);
      if (!response.success) {
          res.status(200).json({success: false, error: response.error, statusCode: 404});
          return;
      }
      console.log('Response resetPassword', response);
      res.status(200).json({success: true, result: response});
  } catch (err) {
      if (err.code) {
          res.status(err.code).json({error: err.message});           
      } else {
          res.status(500).json({error: err.message});         
      }    
  }
});

module.exports = router;