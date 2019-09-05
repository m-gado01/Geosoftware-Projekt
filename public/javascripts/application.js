main();

async function main() {
    await getRoutes();
};

async function getRoutes() {
    const xhr = new XMLHttpRequest();
    const url = 'http://localhost:3000/application/getRoutes';
    xhr.responseType = "json";
    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = (() => {
        if (xhr.readyState == 4) {
            getAnimalData(xhr.response);
        }
    });
};

async function getAnimalData(routes) {
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

    testfunction(routes, movebank);
};

async function testfunction(routes, animaldata) {
    initInterface(routes);
    var routes_linestrings = routesToLineStrings(routes);
    var routes_layers = geoJSONsToLayers(routes_linestrings);
    activateInterface(routes_layers, prepareAnimalData(animaldata));
};

async function initInterface(routes) {
    var sidebar = document.getElementById("sidebar");
    var interface = document.getElementById("interface");

    sidebar.addEventListener("mouseover", () => {
        interface.setAttribute("style", "visibility: visible");
    });

    sidebar.addEventListener("mouseleave", () => {
        interface.setAttribute("style", "visibility: hidden");
    });

    routes.forEach((route) => {
        var table = document.getElementById("table");
        var rowIndex = table.rows.length;
        var row = table.insertRow(rowIndex);
        row.insertCell(0).innerHTML = route.user;
        var date = route.timestamp.substring(0, 10);
        var time = route.timestamp.substring(11, 19);
        row.insertCell(1).innerHTML = date;
        row.insertCell(2).innerHTML = time;
        row.insertCell(3).innerHTML = route.type;
        row.insertCell(4).innerHTML = '<span title="set visibility of this layer" class="hidden"><i class="fa fa-eye-slash"></i></span>';
        row.insertCell(5).innerHTML = '<span title="zoom to layer" class="zoom"><i class="fa fa-crosshairs"></i></span>';
    });
};

function activateInterface(routeLayer, animaldata) {
    var visibilityButtons = Array.from(document.getElementsByClassName("hidden"));
    var zoomButtons = Array.from(document.getElementsByClassName("zoom"));
    var slider = document.getElementById("slider");
    var featureGroup_routes = L.featureGroup().addTo(map);
    var featureGroup_marker = L.featureGroup().addTo(map);
    var featureGroup_animals = L.featureGroup().addTo(map);

    visibilityButtons.forEach((vbutton) => {
        vbutton.addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1;
            if (this.className == "hidden") {
                featureGroup_routes.addLayer(routeLayer[layerIndex]);
                this.innerHTML = '<i class="fas fa-eye"></i>';
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: all; color: white");
                this.className = "visible";
            } else {
                featureGroup_routes.removeLayer(routeLayer[layerIndex]);
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: none; color: grey");
                this.className = "hidden";
                featureGroup_marker.clearLayers();
            };
        });
    });

    zoomButtons.forEach((zbutton) => {
        zbutton.addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1;
            map.fitBounds(routeLayer[layerIndex].getBounds());
        });
    });

    featureGroup_routes.addEventListener("click", async function (e) {
        featureGroup_routes.eachLayer((feature) => {
            feature.setStyle(defaultStyle);
        });

        featureGroup_marker.clearLayers();

        e.layer.setStyle(clickedStyle);

        console.log(e.layer);

        var marker = L.circleMarker(e.layer._latlngs[0], { color: e.layer.options.color, radius: 15 });
        featureGroup_marker.addLayer(marker);

        slider.setAttribute("max", e.layer._latlngs.length - 1);

        slider.addEventListener("mousemove", function () {
            marker.setLatLng(e.layer._latlngs[slider.value]);
        });

        /* var intersects = await lineStringsIntersect(animaldata, e.layer.feature.geometry);

        intersects.features.forEach((point) => {
            var latlng = switchCoordinates(point.geometry.coordinates);

            var gooseIcon = L.icon({
                iconUrl: 'images/goose.png',
                iconSize: [40, 50],
            });

            featureGroup_animals.addLayer(L.marker(latlng));
        }); */
    });
};
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

function geoJSONsToLayers(geojsons) {
    var result = [];
    geojsons.forEach((geojson) => {
        var layer = L.geoJSON(geojson, {
            style: defaultStyle
        });
        layer.setStyle({ color: generateColor() });
        result.push(layer);
    });
    return result;
};

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

function switchCoordinates(coordinates) {
    var result = [];
    var lng = coordinates[0];
    var lat = coordinates[1];
    result.push(lat);
    result.push(lng);
    return result;
};

async function lineStringsIntersect(l1, l2) {
    var intersects = [];
    for (var i = 0; i <= l1.coordinates.length - 2; ++i) {
        for (var j = 0; j <= l2.coordinates.length - 2; ++j) {
            var a1Latlon = L.latLng(l1.coordinates[i][1], l1.coordinates[i][0]),
                a2Latlon = L.latLng(l1.coordinates[i + 1][1], l1.coordinates[i + 1][0]),
                b1Latlon = L.latLng(l2.coordinates[j][1], l2.coordinates[j][0]),
                b2Latlon = L.latLng(l2.coordinates[j + 1][1], l2.coordinates[j + 1][0]),
                a1 = L.Projection.SphericalMercator.project(a1Latlon),
                a2 = L.Projection.SphericalMercator.project(a2Latlon),
                b1 = L.Projection.SphericalMercator.project(b1Latlon),
                b2 = L.Projection.SphericalMercator.project(b2Latlon),
                ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
                ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
                u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
            if (u_b != 0) {
                var ua = ua_t / u_b,
                    ub = ub_t / u_b;
                if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                    var pt_x = a1.x + ua * (a2.x - a1.x),
                        pt_y = a1.y + ua * (a2.y - a1.y),
                        pt_xy = { "x": pt_x, "y": pt_y },
                        pt_latlon = L.Projection.SphericalMercator.unproject(pt_xy);
                    intersects.push({
                        'type': 'Point',
                        'coordinates': [pt_latlon.lng, pt_latlon.lat]
                    });
                }
            }
        }
    }
    if (intersects.length == 0) intersects = false;
    return intersects;
};

/* async function getWeatherData(routes, animaldata) {
    var latlng = { lat: 51.95626, lng: 7.59265 };
    const xhr = new XMLHttpRequest();
    const url = 'https://api.airvisual.com/v2/nearest_city?lat=' + latlng.lat + '&lon=' + latlng.lng + '&key=b18b2fad-3505-4b05-b8b6-522f94e7b0f6';
    xhr.responseType = "json";
    await xhr.open("GET", url);
    await xhr.send();
    xhr.onreadystatechange = await (async (e) => {
        if (xhr.readyState == 4) {
            console.log(xhr.response);
        }
    });
}; */

var defaultStyle = {
    weight: 4,
    opacity: 0.7
};

var clickedStyle = {
    weight: 5,
    opacity: 1
};