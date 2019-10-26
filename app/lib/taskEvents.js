const bluebird = require('bluebird');
const redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const config = require('../../config');
const debug = require('debug')('app:redis');

const redisSub = redis.createClient(config.redis.url);

redisSub.AUTH(config.redis.password, (err) => {
    if (err)
        debug.extend('error')(err);
    debug.extend('authenticatedSub')(redisSub.connected);
});

const redisPub = redisSub.duplicate();


module.exports = {
    redisSub,
    redisPub
};
