const fakeCSVGenerate = require('csv-generate');
const fs = require('fs');
const appRoot = require('app-root-path');
const { redisSub } = require('./redisTaskEvents');

const debug = require('debug')('app:heavyProc');

function* makeRangeIterator(start, end) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}


class MimicHeavyProcess {
    /**
     * Mimics the generation of resource intensive csv record
     * @param {String} uuid Random uuid which will identify this task in future
     * @param {Number} start epoch time in ms denoting start of export
     * @param {Number} end epoch time in ms denoting the end of export
     * @param {Number} intrDur interval duration between each value of start
     * and end, effects how fast each record is generated within stored file
     */
    constructor(uuid, start, end, intrDur) {
        this.uuid = uuid;
        start = parseInt(start);
        end = parseInt(end);
        debug(start + ' ' +  end);
        this.it = makeRangeIterator(start, end);
        this.intrDur = intrDur;

        this.path = `${appRoot}/files/${uuid}`;
        this.stream = fs.createWriteStream(this.path, {
            flags: 'w'
        });

        this.interval  = undefined;
        this.startDataGeneration = this.startDataGeneration.bind(this);
        this.redisSubscribeCB = this.redisSubscribeCB.bind(this);
        this.generateFakeCSV = this.generateFakeCSV.bind(this);
        redisSub.on('message', this.redisSubscribeCB);
    }

    /**
     * 
     * @param {String} channel each generation task is identified by uuid
     * on which it is also listening for events for pause, stop, resume
     * @param {['OK', 'PAUSE', 'STOP']} status each generation task listens
     * for the resume (OK), pause (PAUSE), terminate (STOP) events created 
     * by user
     */
    redisSubscribeCB(channel, status) {
        debug.extend('redis:channel')(channel, status);
        debug.extend('uuid')(this.uuid);
        if (channel !== this.uuid) {
            return;
        }

        if (status === 'PAUSE') {
            clearInterval(this.interval);
        } else if (status === 'OK') {
            this.interval = setInterval(
                this.generateFakeCSV,
                this.intrDur
            );
        } else if (status === 'STOP') {
            clearInterval(this.interval);
            debug.extend('path')(this.path);
            fs.unlink(this.path, (err) => {
                debug(err);
            });
            this.stream.close();
            redisSub.unsubscribe(this.uuid);
        }
    }

    /**
     * Starts the writing of data within the file stored in appRoot/files
     */
    startDataGeneration() {

        this.interval = setInterval(
            this.generateFakeCSV,
            this.intrDur
        );
    }

    /**
     * Generated a fake CSV record for each value between start, end
     */
    generateFakeCSV() {
        let batches = this.it.next();
        debug(batches);
        fakeCSVGenerate({
            length: 1,
            columns: 3
        })
            .on('data', (chunk) => {
                this.stream.write(`${chunk}\n`);

                // All data generated and written
                if (batches.done) {
                    redisSub.unsubscribe(this.uuid);
                    clearInterval(this.interval);
                    this.stream.close();
                }
            });
    }
}

module.exports = MimicHeavyProcess;
