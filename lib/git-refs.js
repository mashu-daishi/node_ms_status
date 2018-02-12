'use strict';

const fs        = require( 'fs' );
const glob      = require( 'glob' );
const ObjManage = require( 'object-manage' );
const path      = require( 'path' );

module.exports = function ( gitDirectory, callback ) {
	let defaults = {
		'heads'   : {},
		'remotes' : {}
	};

	let refs = new ObjManage( defaults );

	// Use the current .git folder if not passed in
	if ( typeof gitDirectory === 'function' ) {
		callback     = gitDirectory;
		gitDirectory = '.git';
	}

	let options = {
		'glob' : { 'nodir' : true },
		'read' : { 'encoding' : 'utf8' }
	};

	function getRefsFiles ( directory ) {
		// Find all the files in the refs folder
		let files = glob.sync( path.join( directory, 'refs', '**', '*' ), options.glob );

		files.forEach( function ( filePath ) {
			let currentRef   = filePath.replace( path.join( directory, 'refs' ) + path.sep, '' ).replace( /[\/]/g, '.' );
			let fileContents = fs.readFileSync( filePath, options.read ).replace( /\n/, '' );

			refs.$set( currentRef, fileContents );
		} );
	}

	function getRefsPacked ( directory ) {
		try {
			let packedFile = path.join( directory, 'packed-refs' );

			// See if the file exists before trying to read it
			fs.accessSync( packedFile, fs.F_OK );

			let file      = fs.readFileSync( packedFile, options.read );
			let fileLines = file.split( '\n' );

			fileLines.forEach( function ( line ) {
				line = line.split( ' ' );

				// Only parse commit lines
				// TODO: update to handle tags properly. It shows the tag commit hash instead of what it's point at.
				if ( line[ 0 ].length === 40 ) {
					line[ 1 ] = line[ 1 ].replace( 'refs' + path.sep, '' ).replace( /[\/]/g, '.' );
					refs.$set( line[ 1 ], line[ 0 ] );
				}
			} );
		} catch ( error ) {
			return;
		}
	}

	function getRefs ( directory ) {
		getRefsPacked( directory );
		getRefsFiles( directory );

		// Set the current head
		let current = fs.readFileSync( path.join( directory, 'HEAD' ), options.read ).replace( /\n/, '' );

		refs.$set( 'current.head', current );
		refs.$set( 'current.ref', null );

		// Find actual reference if it points to another location
		if ( current.match( 'ref' ) ) {
			let referencePath = current.split( /\s+/ )[ 1 ];

			refs.$set( 'current.ref', referencePath );
			// Get the key to find the reference
			let key = referencePath.replace( /refs[\/]/, '' ).split( /[\/]/ );

			refs.$set( 'current.head', refs.$get( key ) );
		}

		return refs;
	}

	try {
		fs.accessSync( gitDirectory, fs.F_OK );

		callback( null, getRefs( gitDirectory ) );
	} catch ( error ) {
		callback( error );
	}
};
