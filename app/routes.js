// const express = require('express');
const router = require('express').Router();
const debug = require('debug')('app:routes');

const LoginController = require('./controller/LoginController');
const UploadController = require('./controller/UploadController');
const ExportController = require('./controller/ExportController');

const authenticationMiddleware = require('./middleware/loginMiddleware');

router.post('/register', LoginController.register);
router.post('/login', LoginController.login);

router.use(authenticationMiddleware);

router.post('/upload', UploadController.upload);

router.get('/create-export', ExportController.createExport);
router.get('/pause-export', ExportController.pauseExport);
router.get('/stop-export', ExportController.stopExport);


module.exports = router;
