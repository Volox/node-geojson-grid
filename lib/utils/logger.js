'use strict';
// Load system modules
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;


// Load modules
var _ = require( 'lodash' );


// Load my modules


// Constant declaration


// Module variables declaration


// Module functions declaration
function Logger( options ) {
  EventEmitter.call( this );
  this.on( 'error', function() {} );

  options = options || {};

  this.trace = _.bind( this.log, this, 'trace' );
  this.info = _.bind( this.log, this, 'info' );
  this.debug = _.bind( this.log, this, 'debug' );
  this.warn = _.bind( this.log, this, 'warn' );
  this.error = _.bind( this.log, this, 'error' );
  this.fatal = _.bind( this.log, this, 'fatal' );
}
util.inherits( Logger, EventEmitter );

// Module initialization (at first load)
Logger.prototype.log = function() {
  var level = arguments[ 0 ];
  var message = arguments[ 1 ];
  var args = Array.prototype.slice.call( arguments, 2 );

  var eventName = 'log.'+level;
  var applyArgs = [ eventName, message ];
  if( args.length!==0 )
    applyArgs = applyArgs.concat( args );

  this.emit.apply( this, applyArgs );
};


// Module exports
module.exports = new Logger();
module.exports.Logger = Logger;

// Entry point


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78