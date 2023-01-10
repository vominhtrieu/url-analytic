const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const addressSchema = new mongoose.Schema({
    country: {
        type: String,
        required: false,
    },
    countryCode: {
        type: String,
        required: false,
    },
    region: {
        type: String,
        required: false,
    },
    regionName: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    eu: {
        type: String,
        required: false,
    },
    timezone: {
        type: String,
        required: false,
    },
    lat: {
        type: Number,
        required: false,
    },
    lon: {
        type: Number,
        required: false,
    },
    isp: {
        type: String,
        required: false,
    },
    org: {
        type: String,
        required: false,
    },
    as: {
        type: String,
        required: false,
    },
});

const logSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    pathname: {
        type: String,
        required: true,
    },
    query: {
        type: Object,
        required: false,
    },
    agent: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    address: {
        type: addressSchema,
        required: false,
    },
});

module.exports = mongoose.model('Log', logSchema);