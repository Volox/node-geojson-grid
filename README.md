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
{
  props: { // Can contain either
    mpp: 500, // Meters offset per Point
    points: 5000, // Total number of points
  },
  levels: FeatureCollection<Level>, // A FeatureCollection containing the levels of the map with corresponding properties to use.
  options: { // The options to pass to the internal methods. OPTIONAL
  },
  area: GeoJson, // The input area in GeoJSON format
}
```

Each level is a GeoJSON Feature, the `properties` field must contain the properties
for the grid to create in the same format as the `props` field (`mpp` XOR `points`).