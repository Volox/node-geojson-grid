'use strict';
// Load system modules


// Load modules
var turf = require( 'turf' );
var _ = require( 'lodash' );

// Load my modules
var log = require( '../utils/logger' );

// Constant declaration
var DEFAULT_MPP = 200;

// Module variables declaration


// Module functions declaration
function convertToDeg( meters ) {
  var  ratio = 1/111139.0237500;
  return meters * ratio;
}
function interleaveGrid( gridPoints, mpp ) {
  log.debug( 'Interleave points' );
  var interleavedPoints = _.cloneDeep( gridPoints );

  var coordinates = interleavedPoints.geometry.coordinates;
  coordinates = _.sortBy( coordinates, 1 );

  var delta = convertToDeg( mpp )/2;
  log.trace( 'Delta: %d', delta );

  var lastVal = coordinates[ 0 ][ 1 ];
  log.trace( 'Last value: %d', lastVal );

  var rowIdx = 0;
  _.each( coordinates, function( coords ) {
    var val = coords[ 1 ];
    if( val!==lastVal ) {
      rowIdx += 1;
      lastVal = val;
    }

    coords[ 0 ] += rowIdx%2===0 ? 0 : delta;
  } );

 interleavedPoints.geometry.coordinates = coordinates;


  return interleavedPoints;
}
function filterPoints( points, polygons ) {
  log.debug( 'Filtering points' );
  return turf.within( points, polygons );
}
function getBoundingBox( feature ) {
  log.debug( 'Get bounding box' );
  var bbox = turf.extent( feature );
  return bbox;
}
function calculateMppFromPoints( area, points ) {
  if( !points )
    return null;

  var bbox = getBoundingBox( area );
  var poly = turf.bboxPolygon( bbox );

  var polyArea = turf.area( area );
  var bboxArea = turf.area( poly );
  var ratio = bboxArea/polyArea;
  var adjustedPoints = Math.ceil( points*ratio );
  log.trace( 'polyArea: %d', polyArea );
  log.trace( 'bboxArea: %d', bboxArea );
  log.trace( 'ratio: %d', ratio );
  log.trace( 'adjustedPoints: %d', adjustedPoints );

  var mpp = Math.ceil( Math.sqrt( bboxArea/adjustedPoints ) );

  return mpp;
}
function createDistanceGrid( mpp, area, options ) {
  mpp = mpp || DEFAULT_MPP;
  log.debug( 'Generating distance grid with mpp: %d', mpp );

  var bbox = getBoundingBox( area );
  // var poly = turf.bboxPolygon( bbox );
  // log.debug( 'Bounding Box', poly );

  log.trace( 'Generate feature collection from input' );
  var fc = turf.featurecollection( [ area ] );


  log.debug( 'Creating grid' );
  var units = 'kilometers';
  var cellWidth = mpp*0.001; // Convert meters to kilometers
  var gridPoints = turf.pointGrid( bbox, cellWidth, units );
  log.trace( 'Generated %d points grid', gridPoints.features.length );

  // Filter points
  var filteredPoints = filterPoints( gridPoints, fc );
  log.trace( 'Filtered %d points', filteredPoints.features.length );

  log.trace( 'Combine to plain MultiPoints' );
  var pointListFeature = turf.combine( filteredPoints );


  // Interleave points
  if( options.interleaved ) {
    pointListFeature = interleaveGrid( pointListFeature, mpp );
  }

  log.debug( 'Done generating grid' );

  return pointListFeature;
}
function createPointsGrid( points, area, options ) {
  log.debug( 'Generating points grid with ~%d points', points );

  var mpp = calculateMppFromPoints( area, points );
  return createDistanceGrid( mpp, area, options );
}
function fromJsonConfig( configs ) {
  log.debug( 'Generating grid based on JSON configuration' );

  var levels = _.map( configs, function( config ) {
    var area = config.area;
    var options = config.options;
    var mpp = config.mpp;
    mpp = mpp || calculateMppFromPoints( area, config.points );
    mpp = mpp || DEFAULT_MPP;

    return {
      mpp: mpp,
      options: options,
      area: area,
    };
  } );
  log.trace( 'Mapped configuration levels', levels );


  // Sorting allows to create the grids from the higher granularity to the lower
  var sorted = _.sortBy( levels, 'mpp' );
  log.trace( 'Sorted', sorted );


  // Main area
  var areaToRemove;
  var grids = _.map( sorted, function( level, i ) {
    var mpp = level.mpp;
    var area = level.area;
    var options = level.options;

    // Remove from the area to analyse the already-analyed-areas
    if( areaToRemove ) {
      area = turf.erase( area, areaToRemove );
    } else {
      areaToRemove = area;
    }

    // Create grid for the current area level
    var grid = createDistanceGrid( mpp, area, options );

    // Merge the areas
    areaToRemove = turf.union( area, areaToRemove );

    log.debug( 'Generated grid for area %d', i );

    // Add the properties
    grid.properties = {
      mpp: mpp,
      options: options,
    };

    return grid;
  } );

  log.debug( 'Done generating grids', grids );
  return turf.featurecollection( grids );
}

// Module initialization (at first load)


// Module exports
module.exports.filterPoints = filterPoints;
module.exports.getBoundingBox = getBoundingBox;
module.exports.createPointsGrid = createPointsGrid;
module.exports.createDistanceGrid = createDistanceGrid;
module.exports.json = fromJsonConfig;
module.exports.log = log;

// Entry point


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78