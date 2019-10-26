/* eslint-disable no-undef */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config');
const debug = require('debug')('test:seed');

const user = {
    username: 'userOne',
    password: 'password1'
};

const userOneId = mongoose.Types.ObjectId();

const populateUser = async () => {
    await User.deleteMany({});
    const hashedPwd = await bcrypt.hash(
        user.password,
        parseInt(config.bcryptSalt)
    );
    const userOne = new User({
        _id: userOneId,
        username: user.username,
        password: hashedPwd
    });

    await userOne.save();
};

const token = () => {
    return jwt.sign(userOneId.toString(), config.secret);
};

module.exports = {
    populateUser,
    userOneId,
    token
};
