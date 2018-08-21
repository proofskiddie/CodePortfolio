/* global self */
'use strict'

const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

// data base
let db;

//---THREEJS---//
var camera, scene, renderer, controls;
var intersectcaster, selected;
var mouse = new THREE.Vector2(), INTERSECTED;
var objects = new Map();

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

document.addEventListener('click', addObject, false);
document.addEventListener('mousemove', onMouseMove, false);

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
	var element = document.body;
	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controlsEnabled = true;
			controls.enabled = true;
			blocker.style.display = 'none';

		} else { 
                        //document.removeEventListener("mousemove", onMouseMove , false);		        
		}
	};
	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	};
	var exitpointerlock = function (event) {
                if (document.exitPointerLock) {
                    document.exitPointerLock();
		}
	};


	// Hook pointer lock state change events
	document.addEventListener('pointerlockchange', pointerlockchange, false );
	document.addEventListener('mozpointerlockchange', pointerlockchange, false );
	document.addEventListener('webkitpointerlockchange', pointerlockchange, false );
        document.addEventListener('click', exitpointerlock, false);

	document.addEventListener('pointerlockerror', pointerlockerror, false );
	document.addEventListener('mozpointerlockerror', pointerlockerror, false );
	document.addEventListener('webkitpointerlockerror', pointerlockerror, false );

	window.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';
		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		element.requestPointerLock();

	}, false );

} else {

	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

// this dosen't work as expected because of pointer lock
// need the mouse to be reset to the center (or even slightly above)
// so that intersectcaster behaves as if there was a ray going from the
// players eyes
function onMouseMove(event) {
//	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

	var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
	light.position.set( 0.5, 1, 0.75 );
	scene.add( light );

	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;
		}
	};

	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	// floor
	// grab from ipfs
	var floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	floorGeometry.rotateX( - Math.PI / 2 );
	for ( var i = 0, l = floorGeometry.vertices.length; i < l; i ++ ) {
		var vertex = floorGeometry.vertices[ i ];
		vertex.x += Math.random() * 20 - 10;
		vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;
	}
	for ( var i = 0, l = floorGeometry.faces.length; i < l; i ++ ) {

		var face = floorGeometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

	}

	var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

	var floor = new THREE.Mesh( floorGeometry, floorMaterial );
	scene.add( floor );
	

	// objects
        /*
	var boxGeometry = new THREE.BoxGeometry( 20, 20, 20 );

	for ( var i = 0, l = boxGeometry.faces.length; i < l; i ++ ) {

		var face = boxGeometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

	}

	for ( var i = 0; i < 500; i ++ ) {

		var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
		boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

		var box = new THREE.Mesh( boxGeometry, boxMaterial );
		box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
		box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
		box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

		scene.add( box );
		objects.push( box );

	}*/

        intersectcaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );


	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


// multiplayer function 
// use orbit-db here eventually
function updatePlayerPos(msg, id) {
  if (msg.from !== id) {
     var data = JSON.parse(msg.data.toString());
     var obj = objects.get(msg.from);
     if (!obj) {return;}
     obj.position.x = data.x;
     obj.position.y = data.y;
     obj.position.z = data.z;
  }
}

function addPlayer(peer) {
	var boxGeometry = new THREE.BoxGeometry( 2, 2, 2 );
	var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
	var box = new THREE.Mesh( boxGeometry, boxMaterial );

	scene.add( box );

	// add object to db
	objects.set(peer, box);

}

function removePlayer(peer) {
        objects.delete(peer);
}

function animate() {

	requestAnimationFrame( animate );

	if ( controlsEnabled === true ) {

		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		var intersections = raycaster.intersectObjects(Array.from(objects.values()));
                var onObject = intersections > 0;
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveLeft ) - Number( moveRight );
		direction.normalize(); // this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

		if ( onObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}

		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );

			if ( controls.getObject().position.y < 10 ) {

				velocity.y = 0;
				controls.getObject().position.y = 10;

				canJump = true;

			}

			prevTime = time;
		
		intersectcaster.setFromCamera( mouse, camera );
		intersectcaster.ray.origin.copy( controls.getObject().position );
		intersectcaster.ray.origin.z += 10;
                
                var pos = controls.getObject().position;
		// broadcast player locations
		if (room) {
		    room.broadcast(JSON.stringify({ "x": pos.x, "y": pos.y, "z": pos.z }));
		} else if (node) {
		    room = Room(node, 'playerLocations');
                    room.on('message', (msg) => updatePlayerPos(msg, id));
		    room.on('peer joined', (peer) => addPlayer(peer));
		    room.on('peer left', (peer) => removePlayer(peer));
		    index = room.getPeers().length()
		}
	}
	renderer.render(scene, camera);
}

var objectLoader = new THREE.ObjectLoader();
function addObject() {
	var mesh;
	if (document.getElementById('currentJSON')) {
        	var objStr = document.getElementById('currentJSON').innerText
		var obj = JSON.parse(objStr)
		mesh = objectLoader.parse(obj);
		scene.add(mesh);
		mesh.position.set(0, 20, 0);
        }
}



//---ENDTHREEJS---//


//---GUI---//
const DAT = require('dat.gui');
var gui = new DAT.GUI({
    height : 5 * 32 - 1
});

var IPFSOpts = function() {
    this.startNode = start;
    this.stopNode = stop;
    this.hash = 'QmS5CdFDSvpPt3kChcE9MFi8FNa1ewvL6couX4kk8FT483';
    this.getFile = () => getFile(this.hash);
};

var $body = document.querySelector('body')
const startApplication = () => {
    const opts = new IPFSOpts();
    gui.add(opts, 'startNode');
    gui.add(opts, 'stopNode');
    gui.add(opts, 'getFile');
    gui.add(opts, 'hash');
}

startApplication()
//---ENDGUI---//


//---IPFS---//
let node
let id
let index
let room
let info
let Buffer

/*
 * Start and stop the IPFS node
 */

function start () {
    if (!node) {
        const options = {
            repo: 'ipfs-' + Math.random() + Date.now().toString(),
            config: {
                Addresses: {
                    Swarm: [
                        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                    ]
                }
            },
	    EXPERIMENTAL : {
                pubsub: true
	    }
        };


        node = new IPFS(options)
       
        Buffer = node.types.Buffer

        node.once('start', () => node.id( async (err, info) => {
		if (err) { return console.error(err.message) }
		id = info.id;
                console.log('IPFS node ready with address ' + id);

		addRpcStoragePeer()
		//---ORBITDB---//

		// global data base
		const OrbitDB = require('orbit-db')

		const orbitdb = new OrbitDB(node);
    	        db = await orbitdb.docs('world');
	        console.log(db)
		//---ENDORBITDB---//

    }))
    }
}

const rpcStorageAddr = '/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmPtmptAoLzTzaMFzVsix1HeRRh5qT5KMudm7NFkzRFcN7';
function addRpcStoragePeer(event) {
    node.swarm.connect(rpcStorageAddr, (err) => {
        if (err) { return console.log(err.message) }
    })
}

function stop () {
    window.location.href = window.location.href // refresh page
}
/*
function appendFile (name, hash, size, data) {
    const file = new window.Blob([data], { type: 'application/octet-binary' })
    const url = window.URL.createObjectURL(file)
    const row = document.createElement('tr')

    const nameCell = document.createElement('td')
    nameCell.innerHTML = name

    const hashCell = document.createElement('td')
    const link = document.createElement('a')
    link.innerHTML = hash
    link.setAttribute('href', url)
    link.setAttribute('download', name)
    hashCell.appendChild(link)

    const sizeCell = document.createElement('td')
    sizeCell.innerText = size

    row.appendChild(nameCell)
    row.appendChild(hashCell)
    row.appendChild(sizeCell)

}*/

/*function getFile () {
    const cid = $multihashInput.value

    $multihashInput.value = ''

    if (!cid) { return console.log('no multihash was inserted') }

    node.files.get(cid, (err, files) => {
        if (err) { return onError(err) }

        files.forEach((file) => {
        if (file.content) {
    }
})
})
}*/
function getFile (cid) {
    if (!cid) { return console.log('no multihash was inserted') }

    node.files.get(cid, (err, files) => {
        if (err) { return console.error(err.message) }

        files.forEach((file) => {
            if (file) {
	        var cj = document.getElementById("currentJSON")
		if (cj === null) {
			var div = document.createElement("div")
			div.innerText = file.content.toString()
			div.setAttribute("id", "currentJSON")
			div.setAttribute("data-internal", "JSON")
			div.setAttribute("style", "display: none;")
			document.body.appendChild(div);
		} else {
			cj.innerText = file.content.toString()
		}
            }
        })
    })
}
/*
 * Drag and drop
 */
 /*
function onDrop (event) {
    onDragExit()
    event.preventDefault()

    if (!node) {
        return
    }
    const dt = event.dataTransfer
    const filesDropped = dt.files

    function readFileContents (file) {
        return new Promise((resolve) => {
            const reader = new window.FileReader()
            reader.onload = (event) => resolve(event.target.result)
        reader.readAsArrayBuffer(file)
    })
    }

    const files = []
    for (let i = 0; i < filesDropped.length; i++) {
        files.push(filesDropped[i])
    }

    files.forEach((file) => {
        readFileContents(file)
        .then((buffer) => {
        node.files.add({
        path: file.name,
        content: Buffer.from(buffer)
    }, { wrap: true }, (err, filesAdded) => {
        if (err) { return console.log(err.message) }
    })
})
.catch()
})
}


// Get peers from IPFS and display them
function connectToPeer (event) {
    event.target.disabled = true
    node.swarm.connect($connectPeer.value, (err) => {
        if (err) { return onError(err) }

        $connectPeer.value = ''

    setTimeout(() => {
        event.target.disabled = false
}, 500)
})
}*/

//---ENDIPFS---//



