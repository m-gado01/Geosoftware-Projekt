window.onload(main());

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
};