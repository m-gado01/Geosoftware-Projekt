const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/home');
});

router.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

router.get('/application', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'application.html'));
});

router.get('/imprint', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'imprint.html'));
});

module.exports = router;