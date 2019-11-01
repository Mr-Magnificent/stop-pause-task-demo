const mongoose = require('mongoose');
const GridFS = require('gridfs-stream');
const config = require('../../config');
const debug = require('debug')('app:model');
GridFS.mongo = mongoose.mongo;

mongoose.connect(config.db,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            debug.extend('error')(err);
        }
        debug.extend('connection')('mongo connected');
    });

let conn = mongoose.connection;

const Task = require('./Task');
const User = require('./User');

module.exports = {
    Task,
    User,
    GridFS,
    conn
};
