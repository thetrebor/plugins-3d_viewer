var App = {

	loaderBar : null,
	init: function() {
		this.initRenderer();
		this.initScene();
		this.initCamera();
		this.loadModel();
		
		window.addEventListener('resize', this.onWindowResize.bind(this));

		this.clock = new THREE.Clock();
		this.animate();

		App.loaderBar = document.getElementById("loader-bar");
	},

	initRenderer: function() {
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.shadowMap.enabled = true;
		this.renderer.setClearColor(0xcccccc);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
	},

	initCamera: function() {
		this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 1, 10000);
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.screenSpacePanning = true;

		this.camera.add(new THREE.PointLight(0xffffff, 0.4));
		this.scene.add(this.camera);

		this.camera.position.set(0, 100, 250);
		this.controls.target.set(0, 100, 0);
	},

	initScene: function() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x303030);
		this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
	},

	render: function() {
		this.renderer.render(this.scene, this.camera);
		if (this.mixer) {
			this.mixer.update(this.clock.getDelta());
		}
	},

	animate: function() {
		window.requestAnimationFrame(App.animate);
		App.render();
	},

	onWindowResize: function() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	},

	onDownloadProgress: function(xhr) {
		if (xhr.lengthComputable) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log('model ' + Math.round(percentComplete) + '% downloaded');
			App.loaderBar.style.width = percentComplete + "%";
		}
	},

	onLoadError: function(er) {
		console.log(er);
		alert('failed to load model');
	},

	addObject: function(object) {
		
		App.scene.add(object);

		var box = new THREE.Box3().setFromObject(object);

		var _v = box.getSize(new THREE.Vector3());
		var size = Math.max( _v.x, _v.y, _v.z );
		var center = box.getCenter(this.controls.target);

		//opposite over base, gives you the field of view, convert to degrees, and zoom out by a tiny bit
		this.camera.fov = 1.1 * Math.tan( size / this.camera.position.z ) * 180/Math.PI;
		this.camera.updateProjectionMatrix();

		this.controls.maxDistance = this.camera.position.z * 3;
		this.controls.minDistance = this.camera.position.z / 2;
		this.controls.update();

		this.dLight = new THREE.DirectionalLight( 0x5555EE, 0.6 );
		this.scene.add( this.dLight );
		this.dLight.position.set( 0,0.3,0.8 );
		this.dLight.target = object;
		

		this.dLight.castShadow = true;
		object.castShadow = true;

	},

	loadModel: function() {
		
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onLoad = function() {
			//remove the loader when you're done;
			App.loaderBar.parentNode.removeChild(App.loaderBar);
			App.loaderBar = null;
		};

		if (this.vars.fileExtension == 'obj') {
			this.loadModelOBJ();
		} else if (this.vars.fileExtension == 'mtl') {
			this.loadModelMTL();
		} else if (this.vars.fileExtension == 'stl') {
			this.loadModelSTL();
		} else if (this.vars.fileExtension == 'fbx') {
			this.loadModelFBX();
		} else if (this.vars.fileExtension == 'dae') {
			this.loadModelDAE();
		} else if (this.vars.fileExtension == 'x') {
			this.loadModelX();
		} else if (this.vars.fileExtension == 'gltf' || this.vars.fileExtension == 'glb') {
			this.loadModelGLTF();
		}  else if (this.vars.fileExtension == '3ds') {
			this.loadModel3DS();
		} else {
			alert('This file format cannot be handled.');
		}
	},

	loadModelOBJ: function(opts) {
		var loader = new THREE.OBJLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		if (opts) {
			if (opts.url) {
				fileDownloadURL = opts.url
			}
			if (opts.materials) {
				loader.setMaterials(opts.materials);
			}
		}
		loader.load(
			fileDownloadURL,
			function(obj) {App.addObject(obj);},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelMTL: function() {
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		var loader = new THREE.MTLLoader(this.loadingManager);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath),
			(function (materials) {
				materials.preload();
				this.loadModelOBJ({
					url: this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePathOBJ),
					materials: materials
				})
			}).bind(this)
		);
	},

	loadModelSTL: function() {
		var loader = new THREE.STLLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.load(
			fileDownloadURL,
			function(geometry) {
				var materialProps = {color: 0xBDBDBD, specular: 0x111111, shininess: 100};
				if (geometry.hasColors ) {
					materialProps.opacity = geometry.alpha;
					materialProps.vertexColors = THREE.VertexColors;
				}
				var material = new THREE.MeshPhongMaterial(materialProps);
				var mesh = new THREE.Mesh(geometry, material);
				mesh.position.set( 0, - 0.25, 0.6 );
				mesh.rotation.set( 0, - Math.PI / 2, 0 );
				mesh.scale.set( 0.5, 0.5, 0.5 );
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				App.addObject(mesh);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelFBX: function() {
		var loader = new THREE.FBXLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.load(
			fileDownloadURL,
			function(obj) {
				if (obj.animations && obj.animations[0]) {
					App.mixer = new THREE.AnimationMixer(obj);
					App.mixer.clipAction(obj.animations[0]).play();
				}
				obj.traverse(function(child) {
					if (child.isMesh) {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
				App.addObject(obj);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelDAE: function() {
		var loader = new THREE.ColladaLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			fileDownloadURL,
			function(obj) {App.addObject(obj.scene);},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelX: function() {
		var loader = new THREE.XLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			[fileDownloadURL],
			function(object) {
				for (var i = 0; i < object.models.length; i++) {
					var model = object.models[i];
					model.scale.x *= -1;
					App.addObject(model);
				}
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelGLTF: function() {
		this.renderer.gammaOutput = true;
		this.renderer.gammaFactor = 2.2;
		var loader = new THREE.GLTFLoader(this.loadingManager);
		THREE.DRACOLoader.setDecoderPath(this.vars.pluginURL+'/three/libs/draco/');
		loader.setDRACOLoader(new THREE.DRACOLoader());
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			fileDownloadURL,
			function(obj) {App.addObject(obj.scene);},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModel3DS: function() {
		var loader = new THREE.TDSLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/textures/');
		loader.load(
			fileDownloadURL,
			function(obj) {App.addObject(obj);},
			this.onDownloadProgress,
			this.onLoadError
		);
	}

};