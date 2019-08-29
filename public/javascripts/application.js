var sidebar = document.getElementById("sidebar");
var controls = document.getElementById("controls");

sidebar.addEventListener("mouseover", () => {
    controls.setAttribute("style", "visibility: visible");
});

sidebar.addEventListener("mouseleave", () => {
    controls.setAttribute("style", "visibility: hidden");
});

var databutton = document.getElementById("databutton");

databutton.addEventListener("click", () => {
    getRoutesFromDB();
});

var map = L.map("map").setView([51.96, 7.595], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/512/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    accessToken: mapbox_accessToken
}).addTo(map);

async function getRoutesFromDB() {
    const xhr = new XMLHttpRequest();
    const url = 'http://localhost:3000/application/getRoutes';
    xhr.responseType = "json";
    await xhr.open("GET", url);
    await xhr.send();
    xhr.onreadystatechange = await (async (e) => {
        if (xhr.readyState == 4) {
            await setup(xhr.response);
        }
    });
};

function setup(routes) {
    var allLayers = [];
    routes.forEach((route) => {
        var table = document.getElementById("routes");
        var rowIndex = table.rows.length;
        var row = table.insertRow(rowIndex);
        row.insertCell(0).innerHTML = route.user;
        row.insertCell(1).innerHTML = route.timestamp;
        row.insertCell(2).innerHTML = route.type;
        row.insertCell(3).innerHTML = '<span title="set visibility of this layer" class="unvisible"><i class="fa fa-eye-slash"></i></span>';
        row.insertCell(4).innerHTML = '<span title="zoom to layer" class="zoom"><i class="fa fa-crosshairs"></i></span>';

        var dataIndex = rowIndex - 1;

        var route_geojson = {
            "type": "Feature",
            "id": dataIndex,
            "geometry": {
                "type": "LineString",
                "coordinates": routes[dataIndex].location.coordinates
            },
            "properties": {
                "id": dataIndex
            }
        };

        var line = L.geoJSON(route_geojson, {
            style: {
                color: generateColor()
            }
        });

        allLayers[dataIndex] = line;
    });

    var visibleButtons = document.getElementsByClassName("unvisible");
    var zoomButtons = document.getElementsByClassName("zoom");
    var layerGroup = L.layerGroup();

    for (i = 0; i < visibleButtons.length; i++) {
        visibleButtons[i].addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1;
            if (this.className == "unvisible") {
                layerGroup.addLayer(allLayers[layerIndex]);
                this.innerHTML = '<i class="fas fa-eye"></i>';
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: all; color: white");
                this.className = "visible";
            } else {
                layerGroup.removeLayer(allLayers[layerIndex]);
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: none; color: grey");
                this.className = "unvisible";
            }
            layerGroup.addTo(map);
        });
        zoomButtons[i].addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1;
            map.fitBounds(allLayers[layerIndex].getBounds());
        });
    };
};
