# Geosoftware I - Final Project

This is our final project for the course 'Geosoftware I'. We developed an interactive web application for displaying user routes and encounters with animals. 

## Installation & Setup

To install the app just download the complete repository. 

Next you need to enter a valid Mapbox API token and a Airvisual API token in order to allow the app to make calls to APIs into the following file:
```
../Geosoftware-Projekt-master/data/tokens.js
```

To start the app you will need to have atleast Docker 19.03.2 installed. Run 
```
docker-compose up
```
to start the app. Afterwards open your browser and navigate to
```
localhost:3000
```
## How To Use
To use the main application please navigate to 'Application' and move your mouse to the sidebar on the left side. A menu should come up when you hover over the sidebar. 

Now you can see a table with the user routes from the database. Click the little red icons on the right to display a route on the map. The button with the crosshair symbol lets you automatically zoom to the specific route. 

If you move your mouse pointer back to the map you can directly click on each layer to display data about the current weather and about animals crossing the specific route. You can now click on the animal icons on the map, which should show you additional information about the animal.

(Note: There is also a slider on top of the map which lets you drive along a route you have clicked on. Our goal was to display live data along each route but this led to too many API calls. So we decided to only show data about a whole route instead of each individual point of a route.)

## Running the tests

To start the tests simply run
```
npm i
```
and
```
npm test
```

in your Terminal/Command Prompt.

## Built With

* [Node](https://nodejs.org/en/)
* [Express](https://expressjs.com/de/) 
* [MongoDB](https://www.mongodb.com)
* [Leaflet](https://leafletjs.com)
...

## Authors

* **Christin Bösch** 
* **Max Gadomski**
* **Constantin Rulle** 

## Github Repository
[github](https://github.com/m-gado01/Geosoftware-Projekt/)



