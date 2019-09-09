//Initialize the Leaflet Map and set it's bounds and zoom level
var map = L.map("map").setView([51.9525, 7.61], 15);

//Add a tile layer to the map
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/512/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    accessToken: mapbox_accessToken
}).addTo(map);