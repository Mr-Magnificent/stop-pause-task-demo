require('dotenv').config();
const convict = require('convict');
const debug = require('debug')('app:config');

const config = convict({
    env: {
        doc: 'The application environment',
        format: ['production', 'development', 'testing'],
        default: 'development',
        arg: 'nodeEnv',
        env: 'NODE_ENV'
    },
    port: {
        doc: 'The port to bind application',
        format: 'port',
        default: 3000,
        arg: 'port',
        env: 'PORT'
    },
    db: {
        doc: 'MongoDB database url',
        format: '*',
        default: 'mongodb://localhost:27017/db',
        env: 'DB_URL',
        arg: 'dbUrl'
    },
    redis: {
        url: {
            doc: 'Redis database url',
            format: '*',
            default: '',
            env: 'REDIS_URL',
            arg: 'redis'
        },
        password: {
            doc: 'Hosted redis password',
            format: '*',
            default: '',
            env: 'REDIS_PASSWORD',
            arg: 'redisPassword',
            sensitive: true
        }
    },
    bcryptSalt: {
        doc: 'Salt rounds for bcrypt',
        format: Number,
        default: 10,
        env: 'SALT_ROUNDS',
        arg: 'saltRounds'
    },
    secret: {
        doc: 'jwt secret token',
        format: '*',
        default: '',
        env: 'SECRET',
        arg: 'secret',
        sensitive: true
    }
});

const env = config.get('env');
config.loadFile(`./config/${env}.json`);

config.validate({ allowed: 'strict' });

debug(config.toString());

module.exports = config.getProperties();
