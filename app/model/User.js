const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, index: true, unique: true, required: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('user', UserSchema);
