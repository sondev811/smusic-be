const mongoose = require('mongoose');
require('dotenv/config');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB success!!!');
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectDB;
