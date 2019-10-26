const Task = require('../model/Task');
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const HeavyProcess = require('../lib/heavyProcess');
const { redisPub } = require('../lib/taskEvents');

const debug = require('debug')('app:exportController');

exports.createExport = async (req, res) => {
    const start = moment(req.query.start, 'YYYY-MM-DD');

    if (!start.isValid() || start.isAfter(moment())) {
        return res.status(404).send({
            message: 'start is not valid'
        });
    }

    try {
        const uuid = uuidv4();
        const taskAdded = await Task.create({
            uuid: uuid,
            user_id: req.user.id,
            status: 'OK'
        });

        const iterStart = start.valueOf();

        // Assume that server takes 4 seconds to generate each record
        const heavyProcess = new HeavyProcess(uuid, iterStart, moment.now(), 4 * 1000);
        heavyProcess.startDataGeneration();

        return res.status(202).send({
            message: 'Task Accepted',
            task: taskAdded
        });
    } catch (err) {
        debug(err);
        return res.status(500).send(err.message);
    }
};

exports.pauseExport = async (req, res) => {
    try {
        const task = await Task.findOne({
            uuid: req.query.uuid
        });

        if (!task) {
            return res.status(404).send({
                message: 'no such task'
            });
        }
        
        debug(typeof task.user_id.toString(), typeof req.user.id);
        if (task.user_id.toString() !== req.user.id) {
            return res.status(403).send({
                message: 'Someone else initiated the task'
            });
        }

        if (task.status === 'PAUSE' ) {
            return res.status(400).send({
                message: 'Task already paused'
            });
        }

        if (task.status === 'STOP') {
            return res.status(400).send({
                message: 'Task already stopped'
            });
        }


        redisPub.emit(req.query.uuid, 'PAUSE');

        await Task.findOneAndUpdate({
            uuid: req.query.uuid
        }, {
            status: 'PAUSE'
        });

        return res.status(202).send({
            message: 'Export paused'
        });
    } catch (err) {
        debug(err);
        return res.status(500).send(err.message);
    }
};

exports.stopExport = async (req, res) => {
    try {
        const task = await Task.findOne({
            uuid: req.query.uuid
        });

        if (!task) {
            return res.status(404).send({
                message: 'no such task'
            });
        }

        if (task.user_id !== req.user.id) {
            return res.status(403).send({
                message: 'Someone else initiated the task'
            });
        }
        
        if (task.status === 'STOP') {
            return res.status(400).send({
                message: 'Task already stopped'
            });
        }
        
        redisPub.emit(req.query.uuid, 'STOP');

        await Task.findOneAndUpdate({
            uuid: req.query.uuid
        }, {
            status: 'STOP'
        });

        return res.status(202).send({
            message: 'Export stopped'
        });
    } catch (err) {
        debug(err);
        return res.status(500).send(err.message);
    }
};
