const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/application', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'application.html'));
});

module.exports = router;