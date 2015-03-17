/**
 * UNDP DataViz Project
 *
 * World map, height-mapped by HDI and GDI factors.
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

(function (THREE, Stats) {

	/* Scene
	********************************/

	var	container = document.querySelector('#container'),
		WIDTH = container.clientWidth,
		HEIGHT = container.clientHeight,
		ASPECT = WIDTH / HEIGHT,
		VIEW_ANGLE = 45,
		NEAR = 0.1,
		FAR = 10000;

	var controls,
		scene = new THREE.Scene(),
		renderer = new THREE.WebGLRenderer(),
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	camera.position.z = 200;
	camera.up.set(0, -1, 0);
	scene.add(camera);

	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0xF0F0F0);
	container.appendChild(renderer.domElement);

	controls = new THREE.MapControls(camera, renderer.domElement);	

	/* Countries
	********************************/

	var COLORS = [0x588C7E, 0xF2E394, 0xF2AE72, 0xD96459, 0x8C4646],
		EXTRUDE_AMOUNT = 1;

	window.fetch('assets/countries.json')
		.then(function(response) {
			return response.json();
		}).then(function(countries) {
			countries.forEach(loadCountry);
		}).catch(function(ex) {
			console.log('Countries could not be loaded.', ex);
		});

	function loadCountry (country) {
		var mesh, color, material,
			paths = THREE.transformSVGPath(country.feature);
		
		for (var i = 0; i < paths.length; i++) {
			paths[i] = paths[i].extrude({
				amount: EXTRUDE_AMOUNT,
				bevelEnabled: false
			});

			if (i > 0) paths[0].merge(paths[i]);
		}

		color = COLORS[Math.floor((Math.random() * COLORS.length))];
		material = new THREE.MeshPhongMaterial({color: color, opacity: 1.0});

		mesh = new THREE.Mesh(paths[0], material);
		mesh.name = country.data.name;
		mesh.rotateY(Math.PI);
		mesh.position.set(500, 50, 0);
		scene.add(mesh);
	}

	/* Stats
	********************************/

	var stats = new Stats();

	// align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild(stats.domElement);

	/* Responsive layout
	********************************/

	window.addEventListener('resize', function () {
		WIDTH = container.clientWidth;
		HEIGHT = container.clientHeight;
		ASPECT = WIDTH / HEIGHT;

		camera.aspect = ASPECT;
		camera.updateProjectionMatrix();
		renderer.setSize(WIDTH, HEIGHT);
	}, false);

	/* Click events
	********************************/

	var raycaster = new THREE.Raycaster(),
		mouse = new THREE.Vector2();

	renderer.domElement.addEventListener('click', function (event) {
		mouse.x = 2 * event.clientX / WIDTH - 1;
		mouse.y = -2 * event.clientY / HEIGHT + 1;
		raycaster.setFromCamera(mouse, camera);

		raycaster
			.intersectObjects(scene.children)
			.forEach(function (intersect) {
				console.log('  --> %s', intersect.object.name);
				var scale = 10;
				if (!intersect.object.extent) {
					intersect.object.extent = scale;
					intersect.object.scale.set(1, 1, scale);
					intersect.object.position.setZ(scale - 1);
				} else {
					intersect.object.scale.set(1, 1, 1);
					intersect.object.position.setZ(0);
					delete intersect.object.extent;
				}
			});
	});

	/* Lights
	********************************/

	var pointLight2 = new THREE.PointLight(0xFFFFFF, 0.8);
	pointLight2.position.z = 2000;
	scene.add(pointLight2);

	/* Animation
	********************************/

	function update () {
		stats.begin();
		controls.update();
		renderer.render(scene, camera);
		stats.end();
		window.requestAnimationFrame(update);
	}
	window.requestAnimationFrame(update);

}(window.THREE, window.Stats));
