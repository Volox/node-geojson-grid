# GeoGrid

Used to create a grid on the provided GeoJSON Polygon. The module can be used ad a CLI or as a module.

# Install

To install and use it as module
```sh
npm install node-geojson-grid -g
```


## as CLI


```sh
node-geojson-grid -h
node-geojson-grid -v
node-geojson-grid -p 5000 milan.geo.json grid.geo.json
```


## as Module

```js
var Grid = require( 'node-geojson-grid' );
var grid = new Grid();
// Load GeoJSON Feature
grid.load( GeoJSON );

var pointsGrid = grid.createPointsGrid( points );
var distanceGrid = grid.createDistanceGrid( vDistance, hDistance );
```


## API

### Grid


Possible options are:
* `interleaved`: The grid rows will be interleaved

#### .load( GeoJSON )
#### .getBoundingBox( coordinates )
#### .getCoordinates( GeoJSON )
#### .filterGridPoints( points )
#### .createDistanceGrid( vDistance, hDistance )
#### .createPointsGrid( points )

#### Internal methods
##### .toPoint( coordinates )
##### .toLatitudeOffset( meters )
##### .toLongitudeOffset( meters )
