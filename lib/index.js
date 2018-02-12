'use strict';

const gitRefs = require( './git-refs.js' );
const os      = require( 'os' );
const path    = require( 'path' );

let Status = function () {
console.log('os:', os);	
	this.commit   = null;
	this.uptime   = process.uptime();
	this.hostname = os.hostname();
	this.totalmem = os.totalmem();
	this.freemem  = os.freemem();
	this.loadavg  = os.loadavg();

	let self = this;

	gitRefs( path.join( process.cwd(), '.git' ), function ( error, refs ) {
		if ( error ) {
			return;
		}

		self.commit = refs.current.head;
	} );
};

Status.prototype.update = function () {
	this.freemem = os.freemem();
	this.loadavg = os.loadavg();
	this.uptime  = process.uptime();
};

module.exports = Status;
