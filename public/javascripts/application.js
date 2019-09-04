
main();
/* weather(); */

async function main() {
    await initSidebar();
    await getData();
};

function initSidebar() {
    var sidebar = document.getElementById("sidebar");
    var interface = document.getElementById("interface");

    sidebar.addEventListener("mouseover", () => {
        interface.setAttribute("style", "visibility: visible");
    });

    sidebar.addEventListener("mouseleave", () => {
        interface.setAttribute("style", "visibility: hidden");
    });
};

async function getData() {
    const xhr = new XMLHttpRequest();
    const url = 'http://localhost:3000/application/getRoutes';
    xhr.responseType = "json";
    await xhr.open("GET", url);
    await xhr.send();
    xhr.onreadystatechange = await (async (e) => {
        if (xhr.readyState == 4) {
            await initInterface(xhr.response);
        }
    });
};

async function initInterface(routes) {
    var allLayers = [];
    var allMarkers = [];
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

        var dataIndex = rowIndex - 1;
        var lnglat = routes[dataIndex].location.coordinates;

        var route_geojson = {
            "type": "Feature",
            "id": dataIndex,
            "geometry": {
                "type": "LineString",
                "coordinates": lnglat
            },
            "properties": {
                "id": dataIndex
            }
        };

        var line = L.geoJSON(route_geojson, {
            style: {
                color: generateColor(),
                weight: 4,
                opacity: 0.7
            }
        });

        allLayers[dataIndex] = line;
    });

    var visibleButtons = document.getElementsByClassName("hidden");
    var zoomButtons = document.getElementsByClassName("zoom");
    var layerGroup = L.layerGroup();

    for (i = 0; i < visibleButtons.length; i++) {
        visibleButtons[i].addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1;
            if (this.className == "hidden") {
                layerGroup.addLayer(allLayers[layerIndex]);
                this.innerHTML = '<i class="fas fa-eye"></i>';
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: all; color: white");
                this.className = "visible";
            } else {
                layerGroup.removeLayer(allLayers[layerIndex]);
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                zoomButtons[layerIndex].setAttribute("style", "pointer-events: none; color: grey");
                this.className = "hidden";
            }
            layerGroup.addTo(map);
        });
        zoomButtons[i].addEventListener("click", function () {
            var layerIndex = this.parentElement.parentElement.rowIndex - 1;
            map.fitBounds(allLayers[layerIndex].getBounds());
        });
    };

    for (var j = 0; j < allLayers.length; j++) {
        allLayers[j].addEventListener("click", function (e) {
            layerGroup.eachLayer(function (layer) {
                layer.setStyle({ weight: 4, opacity: 0.7 });
            });

            var t = e.target;

            layerGroup.getLayer(t._leaflet_id).setStyle({ weight: 5, opacity: 1 });

            var latlng = t._layers[t._leaflet_id - 1]._latlngs;

            var marker = L.circleMarker(latlng[0], { color: t.options.style.color, radius: 15 });
            layerGroup.addLayer(marker);

            var slider = document.getElementById("slider");
            slider.setAttribute("max", latlng.length - 1);

            slider.addEventListener("mousemove", function () {
                marker.setLatLng(latlng[slider.value]);
            });

            console.log(latlng[0]);
        });
    };
};

/* async function movebank() {
    const xhr = new XMLHttpRequest();
    const url = 'http://movebank.org/movebank/service/public/json?&study_id=458996285';
    xhr.responseType = "json";
    await xhr.open("GET", url);
    await xhr.send();
    xhr.onreadystatechange = await (async (e) => {
        if (xhr.readyState == 4) {
            console.log(xhr.response);
        }
    });
}; */

/* async function weather() {
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

/* function convertCoordinates(coordinates) {
    var result = [];
    coordinates.forEach((coordinate) => {
        var lng = coordinate[0];
        var lat = coordinate[1];
        var array = [];
        array.push(lat);
        array.push(lng);
        result.push(array);
    });
    return result;
}; */