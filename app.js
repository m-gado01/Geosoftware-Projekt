const express = require('express');
const path = require('path');
//const mongodb = require('mongodb');
const mongoose = require('mongoose');
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');

const router = require('./routes/router.js');

const app = express();

//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/')));
app.use('/data', express.static(path.join(__dirname, '/data')))
app.use('/leaflet', express.static(path.join(__dirname, '/node_modules/leaflet/dist')));
app.use('/leaflet-routing-machine', express.static(path.join(__dirname, '/node_modules/leaflet-routing-machine/dist')));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
app.use('/randomcolor', express.static(path.join(__dirname, '/node_modules/randomcolor')));
app.use('/fontawesome', express.static(path.join(__dirname, '/node_modules/@fortawesome/fontawesome-free')));

app.use(router);

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
            timestamp: {
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

        let RouteModel = mongoose.model("Route", routeSchema);

        //await RouteModel.deleteMany({});

        const route_1 = {
            user: "Max Mustermann",
            timestamp: "2019-08-12",
            type: "tracked",
            location: {
                type: "LineString",
                coordinates: exampleRoutes.r1.features[0].geometry.coordinates
            }
        };

        const route_2 = {
            user: "Martina Mustermann",
            timestamp: "2019-08-12",
            type: "tracked",
            location: {
                type: "LineString",
                coordinates: exampleRoutes.r2.features[0].geometry.coordinates
            }
        };

        await RouteModel.findOne({ user: route_1.user, timestamp: route_1.timestamp, type: route_1.type }, (error, route) => {
            if (error) console.log(error);
            if (route) console.log("WARNING: Route already exists!");
            else RouteModel.create(route_1)
                .catch(error => console.log(error));
        });

        await RouteModel.findOne({ user: route_2.user, timestamp: route_2.timestamp, type: route_2.type }, (error, route) => {
            if (error) console.log(error);
            if (route) console.log("WARNING: Route already exists!");
            else RouteModel.create(route_2)
                .catch(error => console.log(error));
        });

        app.get('/application/getRoutes', async (request, response) => {
            try {
                var result = await RouteModel.find().exec();
                response.json(result);
            } catch (error) {
                console.log(error);
            }
        });
    });
};

module.exports = app;
