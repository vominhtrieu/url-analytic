const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const logSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    url: {
        type: String,
        required: true,
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
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Log', logSchema);