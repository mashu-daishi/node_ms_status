A simple package to determine the status of a container. It provides the following type of data:

```javascript
{
	'commit'   : 'a208c3b11a89b89eb1018f37d37c22a725024b46',
	'uptime'   : 103.558,
	'hostname' : 'hostname',
	'totalmem' : 17179869184,
	'freemem'  : 225099776,
	'loadavg'  : [ 2.40087890625, 2.50927734375, 2.65625 ]
}
```

## Usage

```bash
npm install node_ms_status --save
```

### Example
```javascript
var Status = require( 'node_ms_status' );
var status = new Status();

console.log( "status:", status );

setTimeout(function () {
	console.log( "status:", status );
}, 2000);

```
