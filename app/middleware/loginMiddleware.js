const jwt = require('jsonwebtoken');
const debug = require('debug')('app:loginMiddleware');
const User = require('../model/User');

module.exports = async (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        return res.status(401).send({ message: 'Token not present' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        debug.extend('auth')(decoded);
        const user = await User.findById(decoded);

        if (!user) {
            return res.status(404).send('No such user');
        }
        // eslint-disable-next-line require-atomic-updates
        req.user = user;

        next();
    } catch (err) {
        res.status(401).send({ message: err.message });
    }
};
