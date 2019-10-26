const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const debug = require('debug')('app:loginController');
const config = require('../../config');
const { User } = require('../model');

exports.register = async (req, res) => {
    try {
        const userExists = await User.findOne({
            username: req.body.username
        });
        
        debug.extend('user')(userExists);
        if (userExists) {
            return res.status(400).json({
                message: 'User already registered'
            });
        }

        const hashedPwd = await bcrypt.hash(
            req.body.password,
            parseInt(config.bcryptSalt)
        );

        const userCreated = await User.create({
            username: req.body.username,
            password: hashedPwd,
        });

        return res.status(200).json({
            message: 'User Created',
            user: userCreated
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        debug(process.env.SECRET);        
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ message: 'User doesn\'t exist' });
        }

        const pwdEqual = await bcrypt.compare(req.body.password, user.password);
        if (!pwdEqual) {
            return res.status(401).json({ message: 'password mismatch' });
        }

        const token = await jwt.sign(user.id, process.env.SECRET);
        res.cookie('token', token, { httpOnly: true });
        return res.json({ message: 'Successfully logged in', token: token });

    } catch (err) {
        debug.extend('error login')(err);
        return res.status(500).json({ message: err.message });
    }
};
