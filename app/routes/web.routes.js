const router = require('express').Router();
const UploadController = require('../controller/UploadController');

router.get('/', (req, res) => {
    res.redirect('/upload');
});

router.get('/upload', UploadController.sendUploadForm);
router.post('/upload', UploadController.upload);
router.get('/uploads/:filename', UploadController.getFile);

module.exports = router;
