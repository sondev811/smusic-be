const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routers = require('./routers');
const bodyParser = require('body-parser');
const connectDB = require('./DB/connection');
const app = express();

const PORT = process.env.PORT || 5000;

const corsOpts = {
  origin: '*',
  methods: [
    'GET',
    'POST',
  ],
  credentials:true,
   optionSuccessStatus:200,
};
app.use(cors(corsOpts));
app.use(bodyParser.json());
connectDB();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})
app.use('/api', routers);

app.listen(PORT, () => console.log(`Running on port ${PORT}`))
