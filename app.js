const express = require('express');
const path = require('path');
//const mongodb = require('mongodb');
const mongoose = require('mongoose');
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
app.use("/data", express.static(path.join(__dirname, "/data")))
app.use("/leaflet", express.static(path.join(__dirname, "/node_modules/leaflet/dist")));
app.use("/leaflet-routing-machine", express.static(path.join(__dirname, "/node_modules/leaflet-routing-machine/dist")));

app.use(homeRouter);
app.use(applicationRouter);
app.use(impressumRouter);

connectDatabase();
initializeDatabase();

async function connectDatabase() {
    mongoose.connection.on("connecting", () => {
        console.log("Connecting MongoDB database ...");
    });

    mongoose.connection.on("connected", () => {
        console.log("MongoDB database connected!");
    });

    mongoose.connection.on("disconnected", () => {
        console.log("MongoDB database disconnected!");
    });

    mongoose.connection.on("error", (error) => {
        console.log("MongoDB connection error!", error);
    });

    mongoose.connect('mongodb://localhost:27017/routedb', { useNewUrlParser: true })
        .catch(error => console.log(error));
};

async function initializeDatabase() {
    const exampleRoutes = require('./data/exampleRoutes.js');

    mongoose.connection.once("open", async (error) => {
        if (error) console.log(error);

        const linestringSchema = new mongoose.Schema({
            type: {
                type: String,
                enum: ["LineString"],
                required: true
            },
            coordinates: {
                type: [[Number]],
                required: true
            }
        });

        const routeSchema = new mongoose.Schema({
            user: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            type: {
                type: String,
                enum: ["tracked", "planned"],
                required: true
            },
            location: linestringSchema
        });

        var Route = mongoose.model("Route", routeSchema);

        //await Route.deleteMany({});

        const route_1 = {
            user: "Max Mustermann",
            date: "2019-08-12",
            type: "tracked",
            location: {
                type: "LineString",
                coordinates: exampleRoutes.r1.features[0].geometry.coordinates
            }
        };

        const route_2 = {
            user: "Martina Mustermann",
            date: "2019-08-12",
            type: "tracked",
            location: {
                type: "LineString",
                coordinates: exampleRoutes.r2.features[0].geometry.coordinates
            }
        };

        await Route.findOne({ user: route_1.user, date: route_1.date, type: route_1.type }, (error, route) => {
            if (error) console.log(error);
            if (route) console.log("WARNING: Route already exists!");
            else Route.create(route_1)
                .catch(error => console.log(error));
        });

        await Route.findOne({ user: route_2.user, date: route_2.date, type: route_2.type }, (error, route) => {
            if (error) console.log(error);
            if (route) console.log("WARNING: Route already exists!");
            else Route.create(route_2)
                .catch(error => console.log(error));
        });

        Route.find({}).exec((error, routes) => {
            if (error) console.log(error);
            else routes.forEach((route) => {
                console.log(route.user);
                console.log(route.date);
                console.log(route.type);
            });
        });
    });
};

module.exports = app;
