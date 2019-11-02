const bluebird = require('bluebird');
const redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const config = require('../../config');
const debug = require('debug')('app:redis');

const redisSub = redis.createClient(config.redis.url, {
    no_ready_check: true,
    auth_pass: config.redis.password
});

redisSub.ping((err, reply) => {
    if (err)
        debug(err);
    debug.extend('PING')(reply);
});

const redisPub = redisSub.duplicate();

module.exports = {
    redisSub,
    redisPub
};
