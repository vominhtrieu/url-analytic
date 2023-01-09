require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('morgan');
const app = express();
const Log = require('./models/Log');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

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
    console.log(ipAddress)
    const log = new Log({
        _id: new mongoose.Types.ObjectId(),
        url: request.body.url,
        agent: request.body.agent,
        ipAddress: request.body.ipAddress,
        address: request.body.address,
    });
});

app.listen(process.env.PORT, (request, respond) => {
  console.log(`Our server is live on ${process.env.PORT}. Yay!`);
});