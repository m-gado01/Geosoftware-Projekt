//Execute the script after the html page is done loading
document.onload = main();

/**
 * Main method of the script. Enables the functionality for the application webpage.
 */
function main() {
    getRoutes();
};

/**
 * This function requests the user routes from the local MongoDB database and forwards the result to the next function.
 */
function getRoutes() {
    const xhr = new XMLHttpRequest(); //create new XHR-Object to send a request
    const url = 'http://localhost:3000/application/getRoutes'; //request url
    xhr.responseType = "json"; //data type for the request's response
    xhr.open("GET", url); //send the request to the server
    xhr.send();
    //if the result is available return the response
    xhr.onreadystatechange = (() => {
        if (xhr.readyState == 4) {
            getAnimalData(xhr.response); //forward the response to the next function to use it later on
        }
    });
};

/**
 * This function requests the necessary data about animals from movebank.org (Note: The API call does not work properly so we had to download the data manually).
 * @param {JSON} routes - The user routes we requested from the database.
 */
function getAnimalData(routes) {
    /* const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    const url = 'https://www.movebank.org/movebank/service/direct-read?entity_type=event&study_id=657674643&individual_id=662388728&attributes=all';
    await xhr.open("GET", url, true);
    await xhr.send();
    xhr.onreadystatechange = await (async (e) => {
        if (xhr.readyState == 4) {
            console.log(xhr.response);
        }
    }); */

    forwardData(routes, movebank); //forward the collected data to the next function
};

/**
 * This function takes the requested data and forwards it to further functions.
 * @param {JSON} routes - The user routes we requested from the database.
 * @param {JSON} animaldata - The data about animals from movebank.org.
 */
function forwardData(routes, animaldata) {
    initInterface(routes); //initalize the user interface
    var routes_linestrings = routesToLineStrings(routes); //convert the user routes to GeoJSON LineStrings
    var routes_layers = geoJSONsToLayers(routes_linestrings); //convert the linestrings to actual Leaflet layers
    activateInterface(routes_layers, prepareAnimalData(animaldata)); //activates the user interface to make it usable
};

/**
 * This function prepares the user interface accessible through the sidebar on the left.
 * It displays all necessary information about the user routes and adds several functionalities.
 * @param {JSON} routes 
 */
function initInterface(routes) {
    var sidebar = document.getElementById("sidebar"); //access the sidebar through the DOM
    var interface = document.getElementById("interface"); //access the interface through the DOM

    //Add an Event Listener to the sidebar to make the user interface visible when hovering over it.
    sidebar.addEventListener("mouseover", () => {
        interface.setAttribute("style", "visibility: visible");
    });

    //Hide the user interface when the mouse leaves the menu
    sidebar.addEventListener("mouseleave", () => {
        interface.setAttribute("style", "visibility: hidden");
    });

    //Setup and display all necessary information about the user routes and add some functionalities
    routes.forEach((route) => {
        var table = document.getElementById("table"); //access the table through the DOM
        var rowIndex = table.rows.length; //determines where to insert a new row into the table
        var row = table.insertRow(rowIndex); //insert a new row
        row.insertCell(0).innerHTML = route.user;
        //create new cells and fill them with information
        var date = route.timestamp.substring(0, 10);
        var time = route.timestamp.substring(11, 19);
        row.insertCell(1).innerHTML = date;
        row.insertCell(2).innerHTML = time;
        row.insertCell(3).innerHTML = route.type;
        //create buttons to interact with the routes
        row.insertCell(4).innerHTML = '<span title="set visibility of this layer" class="hidden"><i class="fa fa-eye-slash"></i></span>'; //button to enable/disable the visibility for this route
        row.insertCell(5).innerHTML = '<span title="zoom to layer" class="zoom"><i class="fa fa-crosshairs"></i></span>'; //button to zoom to this layer
    });
};

/**
 * This function implements all necessary functionalities to interact with the map.
 * @param {} routeLayer - Leaflet layers containing the user routes.
 * @param {JSON} animaldata - The data about animals from movebank.org.
 */
function activateInterface(routeLayer, animaldata) {
    //Access the interact buttons and the slider through the DOM
    var visibilityButtons = Array.from(document.getElementsByClassName("hidden"));
    var zoomButtons = Array.from(document.getElementsByClassName("zoom"));
    var slider = document.getElementById("slider");

    //Create Leaflet FeatureGroups to store the necessary layers
    var featureGroup_routes = L.featureGroup().addTo(map);
    var featureGroup_marker = L.featureGroup().addTo(map);
    var featureGroup_animals = L.featureGroup().addTo(map);

    //Add functionality to the 'Set visibility' buttons
    visibilityButtons.forEach((vbutton) => {
        vbutton.addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1; //get the index of the corresponding layer within the routeLayer-Array
            if (this.className == "hidden") {
                featureGroup_routes.addLayer(routeLayer[layerIndex]); //add the layer to the map
                this.innerHTML = '<i class="fas fa-eye"></i>'; //change the button's appearance
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: all; color: white"); //enable the 'Zoom to layer' button
                this.className = "visible"; //switch the classname of the button
            } else {
                featureGroup_routes.removeLayer(routeLayer[layerIndex]); //remove the layer from the map
                this.innerHTML = '<i class="fas fa-eye-slash"></i>'; //change the button's appearance
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: none; color: grey"); //disable the 'Zoom to layer' button
                this.className = "hidden"; //switch the classname of the button
                //clear all markers from the map when disabling a route
                featureGroup_marker.clearLayers();
                featureGroup_animals.clearLayers();
            };
        });
    });

    //Add functionality to the 'Zoom to layer' buttons
    zoomButtons.forEach((zbutton) => {
        zbutton.addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1; //get the index of the corresponding layer within the routeLayer-Array
            map.fitBounds(routeLayer[layerIndex].getBounds()); //zoom to the corresponding layer
        });
    });

    //Add functionality to the route layers
    featureGroup_routes.addEventListener("click", async function (e) {
        featureGroup_routes.eachLayer((feature) => {
            feature.setStyle(defaultStyle); //set all layers to default
        });

        //clear all layers
        featureGroup_marker.clearLayers();
        featureGroup_animals.clearLayers();

        //change the appearance of the clicked layer
        e.layer.setStyle(clickedStyle);

        //add a new circle marker to the clicked layer
        var marker = L.circleMarker(e.layer._latlngs[0], { color: e.layer.options.color, radius: 15 });
        featureGroup_marker.addLayer(marker);

        //set the slider maximum value to the number of points of the corresponding layer
        slider.setAttribute("max", e.layer._latlngs.length - 1);

        //move the marker around the route layer when moving the slider
        slider.addEventListener("mousemove", function () {
            marker.setLatLng(e.layer._latlngs[slider.value]);
        });

        //calculate the intersecting points between the clicked route and the trajectory of the goose
        var intersects = turf.lineIntersect(animaldata, e.layer.feature.geometry);

        //add a new marker for each intersection
        intersects.features.forEach((point) => {
            var latlng = switchCoordinates(point.geometry.coordinates); //switches latitude longitude pairs

            //custom goose icon
            var gooseIcon = L.icon({
                iconUrl: 'images/goose.png',
                iconSize: [40, 50],
            });

            var animalmarker = L.marker(latlng, { icon: gooseIcon }); //create marker
            //write information about the goose to the popup
            var gooseinfo = '<h3>Greater White-fronted Goose</h3><h4>(Anser Albifrons)</h4><img src="images/greater_white_fronted_goose.jpg" height="150px" width="200px"></img><br>Click <a href="https://www.allaboutbirds.org/guide/Greater_White-fronted_Goose/overview">here</a> for further information.';
            animalmarker.bindPopup(gooseinfo).openPopup(); //bind the popup to each marker
            featureGroup_animals.addLayer(animalmarker); //add the marker to the map
        });

        //Requests weather data from Airvisual API
        var loc = marker._latlng; //get the circle marker's current position
        const xhr = new XMLHttpRequest(); //create new XHR-Object to send a request
        const url = 'https://api.airvisual.com/v2/nearest_city?lat=' + loc.lat + '&lon=' + loc.lng + '&key=' + airvisual_key; //url with the location as a parameter
        xhr.responseType = "json"; //Reponse type should be JSON
        await xhr.open("GET", url); //send request
        await xhr.send();
        xhr.onreadystatechange = await (async (e) => {
            if (xhr.readyState == 4) {
                var data = xhr.response.data.current; //store the data from the response object

                var icon = data.weather.ic; //icon's name for the current weather condition
                var icon_link = 'images/airvisual/' + icon + '.png'; //load the icon

                //store the necessary information
                var timestamp = data.weather.ts; //Timestamp
                var date = timestamp.substring(0, 10); //Date
                var time = timestamp.substring(11, 19); //Time
                var temperature = data.weather.tp; //Temperature (°C)
                var humidity = data.weather.hu; //Humidity (%)
                var wind_speed = data.weather.ws; //Wind speed (m/s)
                var wind_direction = data.weather.wd; //Wind direction (°)
                var pressure = data.weather.pr; //Air pressure (hPa)

                //set the html contents for all necessary information
                var icon_html = '<img width="50px" height="50px" src=' + icon_link + '></img><br>';
                var date_html = '<text style="text-decoration: underline">Date:</text> ' + date + '<br>';
                var time_html = '<text style="text-decoration: underline">Time:</text> ' + time + '<br><br>';
                var weather_html = '<text style="text-decoration: underline">Weather:</text><br>';
                var temperature_html = 'Temperature: ' + temperature + ' °C <br>';
                var humidity_html = 'Humidity: ' + humidity + ' % <br>';
                var pressure_html = 'Pressure: ' + pressure + ' hPa <br>';
                var wind_speed_html = 'Wind speed: ' + wind_speed + ' m/s <br>';
                var wind_direction_html = 'Wind direction: ' + wind_direction + ' ° <br>';

                var infobox = document.getElementById("infobox"); //get the infobox through the DOM
                //link all information and insert it to the infobox
                infobox.innerHTML = date_html + time_html + weather_html + icon_html + temperature_html + humidity_html + pressure_html + wind_speed_html + wind_direction_html;;
            }
        });
    });
};

/**
 * This function converts the user routes from the database to GeoJSON LineStrings.
 * @param {Array} routes - Routes we requested from the database as an Array of JSON objects
 * @return {Array} - Array of LineStrings
 */
function routesToLineStrings(routes) {
    var result = [];
    routes.forEach((route) => {
        var linestring = {
            "type": "LineString",
            "coordinates": route.location.coordinates
        };
        result.push(linestring);
    });
    return result;
};

/**
 * This function takes an Array of any GeoJSON objects and converts it to Leaflet layers
 * @param {Array} geojsons 
 * @return - Array of leaflet layers
 */
function geoJSONsToLayers(geojsons) {
    var result = [];
    geojsons.forEach((geojson) => {
        //create new leaflet layer
        var layer = L.geoJSON(geojson, {
            style: defaultStyle
        });
        //set the style of the layer, generateColor() sets a random generated color for the layer
        layer.setStyle({ color: generateColor() });
        result.push(layer);
    });
    return result;
};

/**
 * This function prepares the movebank animal data by creating a single GeoJSON LineString out of all the points.
 * (In this context we have a trajectory of a goose).
 * @param {JSON} data 
 * @return - GeoJSON LineString
 */
function prepareAnimalData(data) {
    var lnglats = [];
    var locations = data.individuals[0].locations;
    locations.forEach((location) => {
        var point = [location.location_long, location.location_lat];
        lnglats.push(point);
    });
    return {
        "type": "LineString",
        "coordinates": lnglats
    };
};

/**
 * This function takes a pair of longitude/latitude coordinates and converts it to a pair of latitude/longitude coordinates.
 * @param {Array} coordinates 
 * @return - Array of latitude/longitude pair
 */
function switchCoordinates(coordinates) {
    var result = [];
    var lng = coordinates[0];
    var lat = coordinates[1];
    result.push(lat);
    result.push(lng);
    return result;
};

//Default style for the route layers
var defaultStyle = {
    weight: 4,
    opacity: 0.7
};

//Style for the route layers when clicked
var clickedStyle = {
    weight: 5,
    opacity: 1
};