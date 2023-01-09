const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const addressSchema = new mongoose.Schema({
    country: {
        type: String,
        required: false,
    },
    region: {
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
    latitude: {
        type: Number,
        required: false,
    },
    longitude: {
        type: Number,
        required: false,
    },
    metro: {
        type: Number,
        required: false,
    },
    area: {
        type: Number,
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