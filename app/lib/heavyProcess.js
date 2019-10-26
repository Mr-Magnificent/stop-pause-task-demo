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

// const generateFakeCSV = (uuid, it, stream, interval) => {
//     let batches = it.next();
//     fakeCSVGenerate({
//         length: 1,
//         columns: 3
//     })
//         .on('data', (chunk) => {
//             stream.write(`${chunk}\n`);
//             if (batches.done) {
//                 redisSub.unsubscribe(uuid);
//                 clearInterval(interval);
//                 stream.close();
//             }
//         });
// };

// const mimicHeavyProcess = (uuid, start, end, intrDur) => {
//     let stream;
//     const path = `${appRoot}/download/${uuid}`;
//     try {
//         stream = fs.createWriteStream(path, {
//             flags: 'w'
//         });
//     } catch (err) {
//         debug.extend('openFile')(err);
//     }

//     const it = makeRangeIterator(start, end);
//     let interval;
//     interval = setInterval(
//         generateFakeCSV.bind(this, uuid, it, stream, interval),
//         intrDur
//     );

//     redisSub.subscribe(uuid);

//     redisSub.on('message', function (channel, status) {
//         if (channel !== uuid) {
//             return;
//         }

//         if (status === 'PAUSE') {
//             clearInterval(interval);
//         } else if (status === 'OK') {
//             setInterval(
//                 generateFakeCSV.bind(this, uuid, it, stream, interval),
//                 intrDur
//             );
//         } else if (status === 'STOP') {
//             clearInterval(interval);
//             fs.unlink(path, (err) => {
//                 debug(err);
//             });
//             stream.close();
//             redisSub.unsubscribe(uuid);
//         }
//     });
// };

class MimicHeavyProcess {
    constructor(uuid, start, end, intrDur) {
        this.uuid = uuid;
        debug(end);
        start = parseInt(start);
        end = parseInt(end);
        debug(start + ' ' +  end);
        this.it = makeRangeIterator(start, end);
        this.intrDur = intrDur;

        this.path = `${appRoot}/download/${uuid}`;
        this.stream = fs.createWriteStream(this.path, {
            flags: 'w'
        });
        redisSub.subscribe(uuid);
        redisSub.on('message', this.redisSubscribeCB);

        this.interval  = undefined;
        this.startDataGeneration = this.startDataGeneration.bind(this);
        this.redisSubscribeCB = this.redisSubscribeCB.bind(this);
        this.generateFakeCSV = this.generateFakeCSV.bind(this);
    }

    redisSubscribeCB(channel, status) {
        debug.extend('redis')(channel, status);
        if (channel !== this.uuid) {
            return;
        }

        if (status === 'PAUSE') {
            clearInterval(this.interval);
        } else if (status === 'OK') {
            setInterval(
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
