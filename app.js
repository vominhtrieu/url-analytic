require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('morgan');
const app = express();
const Log = require('./models/Log');
let geoip = null;
try {
    geoip = require('geoip-lite');
} catch (error) {}

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> {
    console.log('Database connected');
  })
  .catch((error)=> {
    console.log('Error connecting to database');
    console.log(error)
  });

app.get('/', (request, respond) => {
  respond.status(200).json({
    message: 'Welcome to URL Analyzer API',
  });
});

app.post("/log", (request, respond) => {
    const ipAddress = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    
    const log = new Log({
        _id: new mongoose.Types.ObjectId(),
        url: request.body.url,
        agent:  request.get('User-Agent'),
        ipAddress: ipAddress,
        address: request.body.address,
    });

    if (geoip) {
        const geo = geoip.lookup(ipAddress);
        log.address = JSON.stringify(geo);
    }
    console.log('info', log);
    log.save();
    respond.status(200).json({
        message: 'Log saved successfully',
        log: log,
    });
});

app.get("/list", (request, respond) => {
    Log.find({}, (error, logs) => {
        if (error) {
            respond.status(500).json({
                message: 'Error fetching logs',
                error: error,
            });
        } else {
            respond.status(200).json({
                message: 'Logs fetched successfully',
                logs: logs,
            });
        }
    });
});

app.listen(process.env.PORT, (request, respond) => {
  console.log(`Our server is live on ${process.env.PORT}. Yay!`);
});