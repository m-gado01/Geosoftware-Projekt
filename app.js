const express = require('express');
const path = require('path');
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');

const homeRouter = require('./routes/home');
const page2Router = require('./routes/page2');

const app = express();

//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(homeRouter);
app.use(page2Router);

module.exports = app;
