const fakeCSVGenerate = require('csv-generate');
const fs = require('fs');
const appRoot = require('app-root-path');
const { redisSub } = require('./taskEvents');

const debug = require('debug')('app:heavyProc');

function* makeRangeIterator(start, end) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}

class MimicHeavyProcess {
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

    redisSubscribeCB(channel, status) {
        debug.extend('redis')(channel, status);
        debug.extend('redis')(this.uuid);
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
            fs.unlink(this.path, (err) => {
                debug(err);
            });
            this.stream.close();
            redisSub.unsubscribe(this.uuid);
        }
    }

    startDataGeneration() {
        // debug(typeof this.intrDur);
        this.interval = setInterval(
            this.generateFakeCSV,
            this.intrDur
        );
    }

    generateFakeCSV() {
        let batches = this.it.next();
        debug(batches);
        fakeCSVGenerate({
            length: 1,
            columns: 3
        })
            .on('data', (chunk) => {
                this.stream.write(`${chunk}\n`);
                if (batches.done) {
                    redisSub.unsubscribe(this.uuid);
                    clearInterval(this.interval);
                    this.stream.close();
                }
            });
    }
}

module.exports = MimicHeavyProcess;
