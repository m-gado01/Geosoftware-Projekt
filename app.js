const express = require('express');
const path = require('path');
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');

const homeRouter = require('./routes/home_route');
const applicationRouter = require('./routes/application_route');
const impressumRouter = require('./routes/impressum_route');

const app = express();

//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/")));
app.use("/private", express.static(path.join(__dirname, "private/")))
app.use("/leaflet", express.static(path.join(__dirname, "/node_modules/leaflet/dist")));
app.use("/leaflet-routing-machine", express.static(path.join(__dirname, "/node_modules/leaflet-routing-machine/dist")));

app.use(homeRouter);
app.use(applicationRouter);
app.use(impressumRouter);

module.exports = app;
