const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/impressum', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'impressum.html'));
});

module.exports = router;