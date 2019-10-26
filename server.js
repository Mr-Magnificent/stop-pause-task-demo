const express = require('express');
const app = express();
const compression = require('compression');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const debug = require('debug')('app:');
const router = require('./app/routes');
const config = require('./config');

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api', router);

const PORT = config.port || 3000;

app.listen(PORT, () => {
    debug(`Server listening on PORT ${config.port}`);
});

module.exports = app;
