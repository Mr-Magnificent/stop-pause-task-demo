const { Task } = require('../model');
const uuidv4 = require('uuid/v4');
const HeavyProcess = require('../lib/heavyProcess');
const { redisSub, redisPub } = require('../lib/redisTaskEvents');

const debug = require('debug')('app:teamController');

/**
 * Generate random number between [0, max)
 * @param {number} max generate random number from [0, max)
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

exports.createTeam = async (req, res) => {

    try {
        const uuid = uuidv4();
        const taskAdded = await Task.create({
            uuid: uuid,
            user_id: req.user.id,
            status: 'OK'
        });

        redisSub.subscribe(uuid);
        // Assume that server takes 7 seconds to generate each team
        const heavyProcess = new HeavyProcess(uuid, 0, getRandomInt(1000), 7 * 1000);
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

        if (task.user_id.toString() !== req.user.id) {
            return res.status(403).send({
                message: 'Someone else initiated the task'
            });
        }

        if (task.status === 'PAUSE') {
            return res.status(400).send({
                message: 'Task already paused'
            });
        }

        if (task.status === 'STOP') {
            return res.status(400).send({
                message: 'Task already stopped'
            });
        }

        debug(req.query.uuid);
        redisPub.publish(req.query.uuid, 'PAUSE');

        await Task.findOneAndUpdate({
            uuid: req.query.uuid
        }, {
            status: 'PAUSE'
        });

        return res.status(202).send({
            message: 'Team creation paused'
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

        if (task.user_id.toString() !== req.user.id) {
            return res.status(403).send({
                message: 'Someone else initiated the task'
            });
        }

        if (task.status === 'STOP') {
            return res.status(400).send({
                message: 'Task already stopped'
            });
        }

        redisPub.publish(req.query.uuid, 'STOP');

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

exports.restart = async (req, res) => {
    try {
        const task = await Task.findOne({
            uuid: req.query.uuid
        });

        if (!task) {
            return res.status(404).send({
                message: 'no such task'
            });
        }

        if (task.user_id.toString() !== req.user.id) {
            return res.status(403).send({
                message: 'Someone else initiated the task'
            });
        }

        if (task.status === 'OK') {
            return res.status(400).send({
                message: 'Task already running'
            });
        }

        if (task.status === 'STOP') {
            return res.status(400).send({
                message: 'Task already stopped'
            });
        }

        redisPub.publish(req.query.uuid, 'OK');

        await Task.findOneAndUpdate({
            uuid: req.query.uuid
        }, {
            status: 'OK'
        });

        return res.status(202).send({
            message: 'Team creation restarted'
        });
    } catch (err) {
        debug(err);
        return res.status(500).send(err.message);
    }
};
