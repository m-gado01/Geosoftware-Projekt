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
    xhr.onreadystatechange = await ((e) => {
        if (xhr.readyState == 4) {
            console.log(xhr.response);
            const routes = xhr.response;
            var allLayers = [];
            routes.forEach((route) => {
                var table = document.getElementById("routes");
                var rowIndex = table.rows.length;
                var row = table.insertRow(rowIndex);
                row.insertCell(0).innerHTML = route.user;
                row.insertCell(1).innerHTML = route.timestamp;
                row.insertCell(2).innerHTML = route.type;
                row.insertCell(3).innerHTML = '<input type="checkbox" class="draw"></input>';

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

                var checkboxes = document.getElementsByClassName("draw");
                var layerGroup = L.layerGroup();

                for (i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].addEventListener("click", function () {
                        var layerIndex = this.parentElement.parentElement.rowIndex - 1;
                        if (this.checked) {
                            layerGroup.addLayer(allLayers[layerIndex]);
                        } else {
                            layerGroup.removeLayer(allLayers[layerIndex]);
                        }
                        layerGroup.addTo(map);
                    });
                };
            });
        };
    });
};