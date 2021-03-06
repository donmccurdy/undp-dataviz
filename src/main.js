/**
 * UNDP DataViz Project
 *
 * World map, height-mapped by HDI and GDI factors.
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

(function (THREE, Stats, Sidebar) {

	/* Lodash config
	********************************/

	_.templateSettings = {
		evaluate:		/\{\{(.+?)\}\}/g,
		interpolate:	/\{\{=(.+?)\}\}/g,
		escape:			/\{\{-(.+?)\}\}/g
	};

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

	var COLORS = [0x588C7E, 0xF2E394, 0xF2AE72, 0xD96459, 0x8C4646, 0x8ADBC5, 0x5E2F2F],
		EXTRUDE_AMOUNT = 1,
		materials = COLORS.map(function (color) {
			return new THREE.MeshPhongMaterial({color: color, opacity: 1.0});
		});

	var sidebar = new Sidebar(document.querySelector('#sidebar'));

	window.fetch('assets/indicators-2013.json')
		.then(function (response) {
			return response.json();
		}).then(function (indicators) {
			sidebar.loadIndicators(indicators);
		}).catch(function (error) {
			console.log('Indicators could not be loaded.', error);
		});

	window.fetch('assets/countries.json')
		.then(function(response) {
			return response.json();
		}).then(function(countries) {
			return countries.map(loadCountry);
		}).then(function (countries) {
			sidebar.loadCountries(countries);
		}).catch(function (error) {
			console.log('Countries could not be loaded.', error);
		});

	function loadCountry (country) {
		var mesh, material,
			paths = THREE.transformSVGPath(country.feature);
		
		for (var i = 0; i < paths.length; i++) {
			paths[i] = paths[i].extrude({
				amount: EXTRUDE_AMOUNT,
				bevelEnabled: false
			});

			if (i > 0) paths[0].merge(paths[i]);
		}

		material = materials[country.data.mapcolor7 - 1];
		mesh = new THREE.Mesh(paths[0], material);
		mesh.name = country.data.name;
		mesh.metadata = country.data;
		mesh.rotateY(Math.PI);
		mesh.position.set(500, 50, 0);
		scene.add(mesh);
		return mesh;
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
		mouse = new THREE.Vector2(),
		dragging = false;

	var onMove = function () {
		dragging = true;
		renderer.domElement.removeEventListener('mousemove', onMove);
	};

	renderer.domElement.addEventListener('mousedown', function () {
		renderer.domElement.addEventListener('mousemove', onMove);
	});

	renderer.domElement.addEventListener('mousemove', _.throttle(function (event) {
		if (dragging) {
			dragging = false;
			return;
		}
		renderer.domElement.removeEventListener('mousemove', onMove);

		mouse.x = 2 * event.clientX / WIDTH - 1;
		mouse.y = -2 * event.clientY / HEIGHT + 1;
		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(scene.children),
			intersect = intersects[0];

		if (!intersect) return;

		sidebar.renderDetail(intersect.object.metadata.iso_a3);

	}, 100));

	/* Lights
	********************************/

	var LIGHT_COUNT = 5,
		LIGHT_INTENSITY = 0.18,
		LIGHT_SPREAD = 1000,
		LIGHT_HEIGHT = 2000;

	var lights = [];
	for (var i = 0; i < LIGHT_COUNT; i++) {
		lights.push(new THREE.PointLight(0xFFFFFF, LIGHT_INTENSITY));
		lights[i].position.z = i === 0 ? LIGHT_HEIGHT : LIGHT_HEIGHT / 3;
		scene.add(lights[i]);
	}

	lights[1].position.x = LIGHT_SPREAD;
	lights[2].position.x = -LIGHT_SPREAD;
	lights[3].position.y = LIGHT_SPREAD;
	lights[4].position.y = -LIGHT_SPREAD;

	scene.add(new THREE.AmbientLight(0x404040));

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

}(window.THREE, window.Stats, window.Sidebar));
