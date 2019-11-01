const Busboy = require('busboy');
const appRoot = require('app-root-path');
const MultiStream = require('multistream');
const { conn, GridFS } = require('../model');
const debug = require('debug')('app:upload');

let gridFs;
conn.once('open', () => {
    gridFs = GridFS(conn.db);
});

exports.sendUploadForm = async (req, res) => {
    res.sendFile(appRoot.path + '/public/upload.html');
};

exports.upload = async (req, res) => {
    if (req.headers.stop && JSON.parse(req.headers.stop)) {
        gridFs.files.find({ filename: req.headers.file })
            .toArray((err, chunks) => {
                if (err)
                    debug(err);
                chunks.forEach(chunk => {
                    gridFs.remove({
                        _id: chunk._id
                    }, (err) => debug(err));
                });
            });
        return res.status(200).send('Files deleted');
    }

    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        debug(fieldname, filename, encoding, mimetype);
        file.pipe(gridFs.createWriteStream({
            filename: filename,
            mode: 'w+' //append mode
        }));
    });
    busboy.on('finish', () => {
        res.writeHead(303, { Connection: 'close', Location: '/upload' });
        res.end();
    });
    req.pipe(busboy);
};

exports.getFile = async (req, res) => {
    if (!req.params.filename) {
        return res.status(402).send('filename not present');
    }

    gridFs.files.find({ filename: req.params.filename })
        .toArray((err, chunks) => {
            if (err)
                debug(err);
            let chunkStreams = chunks.map((chunk) => {
                return gridFs.createReadStream({
                    _id: chunk._id
                });
            });
            new MultiStream(chunkStreams).pipe(res);
        });
};
