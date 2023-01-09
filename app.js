require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('morgan');
const url = require('url');
const querystring = require('querystring');
const app = express();
const Log = require('./models/Log');
let geoip = null;
try {
  geoip = require('geoip-lite');
} catch (error) {
  console.log(error);
}

if (!geoip) {
  console.log("Geo IP not supported");
}

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.set('json spaces', 2)

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.log('Error connecting to database');
    console.log(error)
  });

app.get('/', (request, respond) => {
  respond.status(200).json({
    message: 'Welcome to URL Analyzer API',
  });
});

app.post("/log", (request, respond) => {
  const ipAddress = request.headers["x-real-ip"] || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  const u = url.parse(request.body.url);
  const query = querystring.parse(u.query);

  const log = new Log({
    _id: new mongoose.Types.ObjectId(),
    pathname: u.pathname,
    query: query,
    agent: request.get('User-Agent'),
    ipAddress: ipAddress,
    address: request.body.address,
  });

  if (geoip) {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      log.address = {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        eu: geo.eu,
        timezone: geo.timezone,
        latitude: geo.ll[0],
        longitude: geo.ll[1],
        metro: geo.metro,
        area: geo.area,
      }
    }
  }
  if (!log.address) {
    console.log("Could not found address for IP: " + ipAddress);
  }
  console.log(`${new Date()} - New Log is created`);
  console.log(log)
  log.save();
  respond.status(200).json("OK!");
});

app.get("/list", (request, respond) => {
  if (request.query.key !== process.env.API_KEY) {
    respond.status(401).json({
      message: 'Unauthorized',
    });
    return;
  }
  Log.find({}).sort({createdAt: -1}).exec((error, logs) => {
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