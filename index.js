const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routers = require('./routers');
const bodyParser = require('body-parser');
const connectDB = require('./DB/connection');
const app = express();

const PORT = process.env.PORT || 5000;

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
connectDB();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use('/api', routers);
// app.use('**', (req, res) => {
//     res.status(404).json({error: 'Not found'});
// });

app.listen(PORT, () => console.log(`Runing on port ${PORT}`))
