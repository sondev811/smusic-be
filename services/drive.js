const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURL = process.env.REDIRECT_URL;
const refreshToken = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(clientID, clientSecret, redirectURL);
oauth2Client.setCredentials({ refresh_token: refreshToken});
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

const uploadDrive = async (name) => {
    try {
        const filePath = path.join(__dirname, '../musics', `${name}.mp3`); 
        if (!fs.existsSync(filePath)) {
            const error = new Error('Not exist file')
            error.code = '404';
            throw error;
        }
        const uploadFile = await drive.files.create({
            requestBody: {
                name: `${name}.mp3`,
                mineType: 'audio/mpeg'
            },
            media: {
                mineType: 'audio/mpeg',
                body: fs.createReadStream(`musics/${name}.mp3`)
            }
        })
        return uploadFile.data;
    } catch (error) {
       console.log(error);
    }
};

const publicUrl = async (fileId) => {
    try {
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });
        console.log('Public link success');
        return {success: true};
    } catch (error) {
        return {success: false};
        console.log(error);
    }
}

module.exports = { uploadDrive, publicUrl };