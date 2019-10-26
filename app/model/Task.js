const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuid = require('uuid');

const TaskSchema = new Schema({
    uuid: { type: String, default: uuid.v4, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: ['OK', 'PAUSE', 'STOP'], default: 'OK' }
});

module.exports = mongoose.model('task', TaskSchema);
