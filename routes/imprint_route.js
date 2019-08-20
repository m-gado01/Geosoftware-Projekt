const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/imprint', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'imprint.html'));
});

module.exports = router;