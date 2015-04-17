#!/usr/bin/env node
'use strict';
// Load system modules
var fs = require( 'fs' );
var path = require( 'path' );

// Load modules
var pkg = require( '../../package.json' );
var _ = require( 'lodash' );

// Load my modules


// Constant declaration
var HELP_FILE = 'help.txt';

// Module variables declaration


// Module functions declaration
function printVersion( /*argv*/ ) {
  console.log( '\n%s version %s\n', pkg.name, pkg.version );
}
function printHelp( /*argv*/ ) {
  var basePath = path.join( __dirname, '..', '..', 'doc', 'cli' );
  var helpFilePath = path.join( basePath, HELP_FILE );

  var help = fs.readFileSync( helpFilePath, 'utf8' );
  help = _.template( help )( pkg );

  console.log( '\n%s\n', help );
}

// Module exports
module.exports.printHelp = printHelp;
module.exports.printVersion = printVersion;

// Entry point

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78