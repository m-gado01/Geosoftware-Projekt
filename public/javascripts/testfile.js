module.exports = function switchCoordinates(coordinates) {
    var result = [];
    var lng = coordinates[0];
    var lat = coordinates[1];
    result.push(lat);
    result.push(lng);
    return result;
};