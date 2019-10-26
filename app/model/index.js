const mongoose = require('mongoose');
const config = require('../../config');
const debug = require('debug')('app:model');

mongoose.connect(config.db,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            debug.extend('error')(err);
        }
        debug.extend('connection')('mongo connected');
    });

const Task = require('./Task');
const User = require('./User');

module.exports = {
    Task,
    User
};
