# GeoGrid

Used to create a grid on the provided GeoJSON. The module can be used ad a CLI or
as a module.

# Install

To install and use it as module
```sh
npm install node-geojson-grid -g
```


## as CLI


```sh
node-grid -h
node-grid -v
node-grid -p 5000 milan.geo.json grid.geo.json
```


## as Module

```js
var grid = require( 'node-geojson-grid' );
var pointsGrid = grid.createPointsGrid( points, geoJson, options );
var distanceGrid = grid.createDistanceGrid( mpp, geoJson, options );
```


## API

Possible options are:
* `interleaved`: The grid rows will be interleaved

#### .createDistanceGrid( mpp, area, [options] )
Creates a grid on the provided area, each point will be offsetted by `mpp`  meters.

#### .createPointsGrid( points, area, [options] )
Creates a grid on the provided area with about `points`.

#### .json( config )

Creates a multilevel grid. The config objects is as follows:

```js
[
    {
        // One of those two properties
        mpp: 300, // Meters offset per Point
        points: 3000, // Total number of points
        
        options: {}, // Options
        
        area: GeoJSON // Valid GeoJSON
    },
    ...
]
```