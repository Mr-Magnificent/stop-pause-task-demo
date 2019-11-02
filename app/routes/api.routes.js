// const express = require('express');
const router = require('express').Router();

const LoginController = require('../controller/LoginController');
const ExportController = require('../controller/ExportController');
const TeamController = require('../controller/TeamController');

const authenticationMiddleware = require('../middleware/loginMiddleware');

const validateBody = require('../middleware/validateBody');
const validateQuery = require('../middleware/validateParams');
const validateSchemas = require('../validation/validationSchema');

router.post('/register', validateBody(validateSchemas.register), LoginController.register);
router.post('/login', validateBody(validateSchemas.login), LoginController.login);

router.use(authenticationMiddleware);

router.get('/create-export', validateQuery(validateSchemas.createExport), ExportController.createExport);
router.get('/create-team', TeamController.createTeam);

router.use(validateQuery(validateSchemas.uuid));

router.get('/restart-export', ExportController.restart);
router.get('/pause-export', ExportController.pauseExport);
router.get('/stop-export', ExportController.stopExport);

router.get('/restart-team', TeamController.restart);
router.get('/pause-team', TeamController.pauseExport);
router.get('/stop-team', TeamController.stopExport);

// router.get('/export-team', TeamController);
module.exports = router;
