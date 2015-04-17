#!/usr/bin/env node
'use strict';
// Load system modules
var fs = require( 'fs' );
var util = require( 'util' );
var path = require( 'path' );


// Load modules
var chalk = require( 'chalk' );
var _ = require( 'lodash' );

// Load my modules
var Grid = require( '../grid' ).Grid;
var help = require( './help' );


// Constant declaration
var levels = {
  fatal: [ 60, chalk.bgRed.black ],
  error: [ 50, chalk.bgBlack.red ],
  warn: [ 40, chalk.bgBlack.yellow ],
  info: [ 30, chalk.bgBlack.cyan ],
  debug: [ 20, chalk.bgBlack.green ],
  trace: [ 10, chalk.bgBlack.gray ],
};

// Module variables declaration


// Module functions declaration
function log( level ) {
  var timeStyle = chalk.bgBlack.magenta;
  var levelStyle = levels[ level ][ 1 ];

  return function() {
    var timestamp = ( new Date() ).toISOString();
    var args = Array.prototype.slice.call( arguments );

    console.log(
      '%s [%s] - %s',
      timeStyle( timestamp ),
      levelStyle( level ),
      util.format.apply( util, args )
    );
  };
}
function parseArguments( argv ) {
  var cwd = process.cwd();
  // Check vebosity
  argv.level = argv.level || argv.lvl || argv.l;
  // Shhhh.. keep quiet
  if( argv.quiet )
    argv.level = 'fatal';
  // Default value
  if( argv.level==='' || !argv.level )
    argv.level = 'info';

  // Get interleaved option
  argv.interleaved = argv.interleaved || argv.i;

  // Get points
  argv.points = argv.points || argv.point || argv.p;

  // Get vertical distance
  argv.vertical = argv.vertical || argv.y;

  // Get horizontal distance
  argv.horizontal = argv.horizontal || argv.x;

  // Get input file name
  argv.input = argv._[ 0 ]; // || argv.input || argv.i;

  // Get output file name
  argv.output = argv._[ 1 ]; // || argv.output || argv.o;

  // Help
  argv.help = argv.help || argv.h;
  // Version
  argv.version = argv.version || argv.v;

  if( argv.version )
    return help.printVersion();

  if( argv.help )
    return help.printHelp();

  if( !argv.input ) {
    console.error( 'Missing input file\n\nUse -h to see options' );
    return process.exit( 1 );
  }

  if( !argv.output ) {
    console.error( 'Missing output file\n\nUse -h to see options' );
    return process.exit( 1 );
  }

  // Load input File
  var input = require( path.join( cwd, argv.input ) );

  var options = {
    interleaved: argv.interleaved==='true',
  };
  var grid = new Grid( options );
  // Enable listening to logs
  var level = levels[ argv.level ][ 0 ];
  _.each( levels, function( value, name ) {
    // Check if the level is correct
    if( level<=value[ 0 ] ) {
      grid.on( 'log.'+name, log( name ) );
    }
  } );

  // Handle errors
  grid.on( 'error', function( message ) {
    console.error( message );
    process.exit( 1 );
  } );


  grid.load( input );
  var data;

  if( argv.points ) {
    data = grid.createPointsGrid( argv.points );
  } else if( argv.vertical || argv.horizontal ) {
    data = grid.createDistanceGrid( argv.vertical, argv.horizontal );
  }

  var outputPath = path.join( cwd, argv.output );
  fs.writeFileSync( outputPath, JSON.stringify( data, null, 2 ) );
}

// Module exports
module.exports = parseArguments;

// Entry point

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78