/*
X -> Longitude
Y -> Latitude
*/


'use strict';
// Load system modules
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;


// Load modules
var gju = require( 'geojson-utils' );
var _ = require( 'lodash' );

// Load my modules


// Constant declaration
var LONGITUDE = 0;
var LATITUDE = 1;
// var ALTITUDE = 2;

// Module variables declaration


// Module functions declaration
function Grid( options ) {
  EventEmitter.call( this );
  this.on( 'error', function() {} );

  options = options || {};
  this.interleaved = options.interleaved;
}
util.inherits( Grid, EventEmitter );
Grid.prototype.load = function( input ) {
  this.emit( 'log.trace', 'Setting the input data to', input );
  this.input = input;
};
Grid.prototype.toPoint = function( coords ) {
  return {
    type: 'Point',
    coordinates: coords,
  };
};
Grid.prototype.getBoundingBox = function( coordinates ) {
  var minX = +Infinity;
  var maxX = -Infinity;
  var minY = +Infinity;
  var maxY = -Infinity;
  this.emit( 'log.trace', 'Iterating on %d elements', coordinates[0].length );
  _.each( coordinates[0], function( coord ) {
    var x = coord[ LONGITUDE ];
    var y = coord[ LATITUDE ];

    if( x<minX ) minX = x;
    if( x>maxX ) maxX = x;
    if( y<minY ) minY = y;
    if( y>maxY ) maxY = y;
  } );
  this.emit( 'log.trace', 'X max: %d', maxX );
  this.emit( 'log.trace', 'X min: %d', minX );
  this.emit( 'log.trace', 'Y max: %d', maxY );
  this.emit( 'log.trace', 'Y min: %d', minY );

  var polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [ minX, minY ], // TL
        [ maxX, minY ], // TR
        [ maxX, maxY ], // BR
        [ minX, maxY ], // BL
        [ minX, minY ], // TL: Close the polygon
      ]
    ],
  };

  return {
    height: maxY - minY,
    width: maxX - minX,
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    polygon: polygon,
  };
};
Grid.prototype.getGeometry = function( geoJson ) {
  if( geoJson.type==='FeatureCollection' ) {
    throw new Error( 'Cannot get coordinates of a FeatureCollection' );
  } else if( geoJson.type==='GeometryCollection' ) {
    throw new Error( 'Cannot get coordinates of a GeometryCollection' );
  } else if( geoJson.type==='Feature' ) {
    return geoJson.geometry;
  } else {
    return geoJson;
  }
};
Grid.prototype.getCoordinates = function( geoJson ) {
  var geometry = this.getGeometry( geoJson );
  if( geometry.type==='MultiPolygon' ) {
    return geometry.coordinates[ 0 ];
  } else {
    return geometry.coordinates;
  }
};
Grid.prototype.filterGridPoints = function( points ) {
  var inputArea = this.getGeometry( this.input );

  this.emit( 'log.trace', 'Filtering %d points', points.length );
  var filteredPoints = _.filter( points, function( pointCoords ) {
    var geoPoint = this.toPoint( pointCoords );
    return gju.pointInPolygon( geoPoint, inputArea );
  }, this );
  this.emit( 'log.trace', '%d points in the input area', filteredPoints.length );

  return filteredPoints;
};
Grid.prototype.toLatitudeOffset = function( meters ) {
  // 1° = 111139.0237500m
  var  ratio = 1/111139.0237500;
  return meters * ratio;
};
Grid.prototype.toLongitudeOffset = function( meters ) {
  // 1° = 78076.4557000m
  var  ratio = 1/78076.4557000;
  return meters*ratio;
};
Grid.prototype.createDistanceGrid = function( vDistance, hDistance ) {
  vDistance = vDistance || 50;
  hDistance = hDistance || vDistance;
  this.emit( 'log.debug', 'Generating grid every %dx%d meters', vDistance, hDistance );
  this.emit( 'log.debug', 'The grid is interleaved: %j', this.interleaved );

  this.emit( 'log.trace', 'Generating BoundingBox' );
  var coordinates = this.getCoordinates( this.input );
  var bb = this.getBoundingBox( coordinates );
  this.emit( 'log.trace', 'Bounding Box', bb );

  var yOffset = this.toLatitudeOffset( vDistance );
  var xOffset = this.toLongitudeOffset( hDistance );
  this.emit( 'log.trace', 'Y offset: %d', yOffset );
  this.emit( 'log.trace', 'X offset: %d', xOffset );

  var startY = bb.minY;
  var startX = bb.minX;
  var endY = bb.maxY;
  var endX = bb.maxX;

  var pointList = [];
  var i = 0;
  for( var y=startY; y<endY; y+=yOffset ) {
    var delta = ( this.interleaved && i%2===0 ) ? 0 : xOffset/2;
    for( var x=startX; x<endX; x += xOffset ) {
      pointList.push( [
        x + delta,
        y,
      ] );
    }
    i += 1;
  }
  this.emit( 'log.debug', 'Total points: %d', pointList.length );

  var filteredPoints = this.filterGridPoints( pointList );

  return {
    type: 'MultiPoint',
    coordinates: filteredPoints,
  };
};
Grid.prototype.createPointsGrid = function( points ) {
  this.emit( 'log.debug', 'Generating grid width ~%d points', points );
  this.emit( 'log.debug', 'The grid is interleaved: %j', this.interleaved );
  if( !this.input )
    throw new Error( 'Missing input data' );

  this.emit( 'log.trace', 'Generating BoundingBox' );
  var coordinates = this.getCoordinates( this.input );
  var bb = this.getBoundingBox( coordinates );
  this.emit( 'log.trace', 'Bounding Box', bb );


  var height = Math.abs( bb.height );
  var width = Math.abs( bb.width );
  var ratio = width/height;
  this.emit( 'log.trace', 'Points: %d', points );
  this.emit( 'log.trace', 'Height: %d', height );
  this.emit( 'log.trace', 'Width: %d', width );
  this.emit( 'log.trace', 'Ratio: %d', ratio );

  var numVerticalPoints = Math.ceil( Math.sqrt( points/ratio ) );
  var numHorizontalPoints = Math.floor( numVerticalPoints*ratio );
  var totalPoints = numVerticalPoints*numHorizontalPoints;
  this.emit( 'log.trace', 'V points: %d', numVerticalPoints );
  this.emit( 'log.trace', 'H points: %d', numHorizontalPoints );
  this.emit( 'log.debug', 'Total points: %d', totalPoints );

  var yOffset = height/numVerticalPoints;
  var xOffset = width/numHorizontalPoints;

  var pointList = [];
  var startY = bb.minY;
  var startX = bb.minX;

  for( var y=0; y<numVerticalPoints; y++ ) {

    var delta = ( this.interleaved && y%2===0 ) ? 0 : xOffset/2;

    for( var x=0; x<numHorizontalPoints; x++ ) {
      pointList.push( [
        startX + x*xOffset + delta,
        startY + y*yOffset,
      ] );
    }
  }

  var filteredPoints = this.filterGridPoints( pointList );

  return {
    type: 'MultiPoint',
    coordinates: filteredPoints,
  };
};

// Module initialization (at first load)


// Module exports
module.exports.Grid = Grid;
// module.exports = new Grid();

// Entry point


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78