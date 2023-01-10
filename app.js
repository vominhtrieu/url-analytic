require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("morgan");
const url = require("url");
const querystring = require("querystring");
const app = express();
const Log = require("./models/Log");
const axios = require("axios");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.set("json spaces", 2);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Error connecting to database");
    console.log(error);
  });

app.get("/", (request, respond) => {
  respond.status(200).json({
    message: "Welcome to URL Analyzer API",
  });
});

app.post("/log", async (request, respond) => {
  try {
    const ipAddress =
      request.headers["x-real-ip"] ||
      request.headers["x-forwarded-for"] ||
      request.socket.remoteAddress;
    const u = url.parse(request.body.url);
    const query = querystring.parse(u.query);

    const log = new Log({
      _id: new mongoose.Types.ObjectId(),
      pathname: u.pathname,
      query: query,
      agent: request.get("User-Agent"),
      ipAddress: ipAddress,
      address: request.body.address,
    });

    const { data } = await axios.get("http://ip-api.com/json/" + ipAddress);

    if (data) {
      log.address = {
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        as: data.as,
      };
    }
    if (!log.address) {
      console.log("Could not found address for IP: " + ipAddress);
    }
    console.log(`${new Date()} - New Log is created`);
    console.log(log);
    log.save();
    respond.status(200).json("OK!");
  } catch (error) {
    console.log(error);
    respond.status(500).json({
      message: "Error saving log",
      error: error,
    });
  }
});

function formatInt(number, minimumCharacter) {
  if (number < 10) {
    return "0".repeat(minimumCharacter - 1) + number;
  }
  return number + "";
}

function formatDate(date) {
  return (
    date.getFullYear() +
    "-" +
    formatInt(date.getMonth() + 1, 2) +
    "-" +
    formatInt(date.getDate(), 2) +
    " " +
    formatInt(date.getHours(), 2) +
    ":" +
    formatInt(date.getMinutes(), 2) +
    ":" +
    formatInt(date.getSeconds(), 2)
  );
}

app.get("/list", (request, respond) => {
  try {
    if (request.query.key !== process.env.API_KEY) {
      respond.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    Log.find({})
      .sort({ createdAt: -1 })
      .exec((error, logs) => {
        if (error) {
          respond.status(500).json({
            message: "Error fetching logs",
            error: error,
          });
        } else {
          logs = logs.map((log) => log.toObject());
          respond.status(200).json({
            message: "Logs fetched successfully",
            logs: logs.map((log) => ({
              ...log,
              createdAt: formatDate(log.createdAt),
          })),
        });
        }
      });
  } catch (error) {
    console.log(error);
    respond.status(500).json({
      message: "Error fetching logs",
      error: error,
    });
  }
});

app.listen(process.env.PORT, (request, respond) => {
  console.log(`Our server is live on ${process.env.PORT}. Yay!`);
});
