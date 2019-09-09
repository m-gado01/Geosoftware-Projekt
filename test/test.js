var assert = require('chai').assert;
var app = require('../public/javascripts/testfile');
var URL = "http://localhost:3000/application/getRoutes";


describe('application', function () {
  it('coordinates swape is successful', function () {

    var coordinates = [51.75, 7.87];
    var result = [7.87, 51.75];
    assert.deepEqual(app(coordinates), result);

  });
  it('xhr test is successful', function (done) {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    xhr = new XMLHttpRequest()
    xhr.open('GET', URL, true)
    xhr.onreadystatechange = function () {
      console.log("xhr " + JSON.stringify(xhr))
      if (xhr.readyState === 4)
        done();
    }
    xhr.send()
  });
});
