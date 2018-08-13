declare var require: any;
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Group, ObjectLoader, TextureLoader, Vector3 } from 'three';
import { ShipService, PlayerData } from './ship.service';



/* Physijs.scripts.worker = 'physijs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
 */
const THREE = require('three');
const TWEEN = require('@tweenjs/tween.js');
const CANNON = require('cannon');

const ColladaLoader = require('three-collada-loader');
const OrbitControls = require('three-orbit-controls')(THREE);
import OBJLoader from 'three-obj-loader';
import MTLLoader from 'three-mtl-loader';
import GLTFLoader from 'three-gltf-loader';
import { AngularFireDatabase } from 'angularfire2/database';
import { throttleTime } from 'rxjs/operators';

MTLLoader(THREE);
OBJLoader(THREE);
GLTFLoader(THREE);

// const Physijs = require('./physijs/physi.js')(THREE);

@Component({
	selector: 'app-main-component',
	templateUrl: 'main.component.html',
	styleUrls: ['main.component.styl']
})

export class MainComponent implements OnInit {
	@ViewChild('container') elementRef: ElementRef;
	private world;
	private timeStep = 1 / 60;
	private container: HTMLElement;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private objLoader: OBJLoader;
	private mtlLoader: MTLLoader;
	private gltfLoader: GLTFLoader;
	private jsonLoader: THREE.JSONLoader;
	private daeLoader: THREE.ColladaLoader;
	private controls: THREE.OrbitControls;
	private bottle;
	private tempGltf;
	private players = {

	};
	private mixer;
	// private cube: THREE.Mesh;
	private envMap;
	private objects = [];
	constructor(private Ship: ShipService, private db: AngularFireDatabase) {
		console.log(THREE);
	}

	ngOnInit() {
		this.mtlLoader = new MTLLoader();
		this.objLoader = new THREE.OBJLoader();
		this.gltfLoader = new GLTFLoader();
		/* 		// Optional: Provide a DRACOLoader instance to decode compressed mesh data
				THREE.DRACOLoader.setDecoderPath('/examples/js/libs/draco');
				this.gltfLoader.setDRACOLoader(new THREE.DRACOLoader()); */
		this.daeLoader = new ColladaLoader();
		this.jsonLoader = new THREE.JSONLoader();
		this.initThree();
		this.initCannon();
		this.render();

	}

	initThree() {
		this.container = this.elementRef.nativeElement;
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.gammaOutput = true;

		this.scene = new THREE.Scene();
		this.addEnvMap();

		this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
		// this.scene.add(this.camera);
		this.controls = new OrbitControls(this.camera);
		// this.camera.position.set(0, 20, 100);
		this.controls.update(); // controls.update() must be called after any manual changes to the camera's transform

		this.addLighting();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(this.renderer.domElement);

		// this.loadMindFirstModel();
		// this.loadAsteroidModelGLTF();
		this.loadPlayer();
		this.loadAllPlayers();
		this.loadModelGLTF();

		this.addGrid();
	}
	initCannon() {
		this.world = new CANNON.World();
		this.world.gravity.set(0, 0, 0);
		this.world.broadphase = new CANNON.NaiveBroadphase();
		this.world.solver.iterations = 10;
	}
	render() {
		const context: MainComponent = this;
		(function render() {
			requestAnimationFrame(render);
			TWEEN.update();
			context.update();
			context.renderer.render(context.scene, context.camera);
		}());
	}
	addLighting() {
		const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
		const pointLight = new THREE.PointLight(0xffffff, 0.8);
		const hemiLight = new THREE.HemisphereLight(0xbbbbff, 0x444422);
		hemiLight.position.set(0, 1, 0);
		this.camera.add(pointLight);
		this.scene.add(ambientLight);
		this.scene.add(hemiLight);
	}
	setCamera(obj) {
		const relativeCameraOffset = new THREE.Vector3(0, 0, -6);
		const cameraOffset = relativeCameraOffset.applyMatrix4(obj.matrixWorld);
		this.camera.position.x = cameraOffset.x;
		this.camera.position.y = cameraOffset.y;
		this.camera.position.z = cameraOffset.z;
		// this.camera.lookAt(obj.position);
		this.camera.lookAt(obj.position);
	}
	addGrid() {
		const size = 1000;
		const divisions = 100;

		const gridHelper = new THREE.GridHelper(size, divisions);
		this.scene.add(gridHelper);
	}
	update() {
		// Step the physics world
		this.world.step(this.timeStep);
		this.objects.forEach(obj => {
			// Copy coordinates from Cannon.js to Three.js
			obj.mesh.position.copy(obj.body.position);
			obj.mesh.quaternion.copy(obj.body.quaternion);
		});
		if (this.Ship.ship) {
			this.Ship.ship.position.copy(this.Ship.body.position);
			this.Ship.ship.quaternion.copy(this.Ship.body.quaternion);
			// this.ship.rotateX(0.1);
			// this.ship.rotateY(0.1);
			// this.ship.position.addScalar(0.5);
			const delta = this.Ship.clock.getDelta(); // seconds.
			const speed = (10 + (this.Ship.getEnergyLevel())) * delta;
			const rotateAngle = Math.PI / 2 * delta;  // pi/2 radians (90 degrees) per second
			// Move forward
			// this.Ship.ship.translateZ(speed);
			if (this.mixer != null) {
				this.mixer.update(delta);
			}
			// const rotation_matrix = new THREE.Matrix4().identity();
			if (this.Ship.rotateShip.left) { // a
				const relativeCameraOffset = new THREE.Vector3(1.1, 1.1, 0);
				const cameraOffset = relativeCameraOffset.applyMatrix4(this.Ship.ship.matrixWorld);
				const worldPoint = new CANNON.Vec3(1.1, 1.1, 0);
				const impulse = new CANNON.Vec3(.1, 0, 0);
				// this.Ship.body.applyLocalForce(impulse, worldPoint);
				this.Ship.body.applyLocalForce(impulse, worldPoint);

				// this.Ship.ship.rotateOnAxis(new THREE.Vector3(0, 0, 1), -rotateAngle);
			}
			if (this.Ship.rotateShip.right) {
				const relativeCameraOffset = new THREE.Vector3(-1.1, 1.1, 0);
				const cameraOffset = relativeCameraOffset.applyMatrix4(this.Ship.ship.matrixWorld);
				const worldPoint = new CANNON.Vec3(-1.1, 1.1, 0);
				const impulse = new CANNON.Vec3(-.1, 0, 0);
				this.Ship.body.applyLocalForce(impulse, worldPoint);
				// this.Ship.ship.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotateAngle);
			}
			// w
			if (this.Ship.rotateShip.pullup) {
				const relativeCameraOffset = new THREE.Vector3(0, 0, 1.1);
				const cameraOffset = relativeCameraOffset.applyMatrix4(this.Ship.ship.matrixWorld);
				const worldPoint = new CANNON.Vec3(0, 0, 1.1);
// 				const worldPoint = new CANNON.Vec3(cameraOffset.x, cameraOffset.y, cameraOffset.z);
				const impulse = new CANNON.Vec3(0, 0, .1);
				this.Ship.body.applyLocalImpulse(impulse, worldPoint);

				// this.Ship.ship.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
			} // d
			if (this.Ship.rotateShip.pulldown) {
				const relativeCameraOffset = new THREE.Vector3(0, -1.1, 0);
				const cameraOffset = relativeCameraOffset.applyMatrix4(this.Ship.ship.matrixWorld);
				const worldPoint = new CANNON.Vec3(0, -1.1, 0);
				const impulse = new CANNON.Vec3(0, 0, .1);
				this.Ship.body.applyLocalForce(impulse, worldPoint);

				// this.Ship.ship.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);
			}
			// ssssssssssssthis.setCamera();
			// console.log(this.Ship.ship.position); // Vector3
			// console.log('sending update'); // Euler {_x: 0, _y: 0, _z: 0, _order: "XYZ", onChangeCallback: ƒ}
			this.Ship.posrot$.next();
		}
	}

	loadPlayer() {
		const context = this;
		this.loadShipModel().then(gltf => {
			context.Ship.ship = gltf.scene;
			// context.Ship.ship.add();
			const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
			context.Ship.body = new CANNON.Body({
				mass: 1
			});
			context.Ship.body.addShape(shape);
			context.Ship.body.angularVelocity.set(0, 0, 0);
			context.Ship.body.angularDamping = .2;
			context.world.addBody(context.Ship.body);

			gltf.scene.add(context.camera);
			context.scene.add(context.Ship.ship);

			context.mixer = new THREE.AnimationMixer(context.Ship.ship);
			context.mixer.clipAction(gltf.animations[0]).play();
			context.setCamera(context.Ship.ship);
			console.log('LOADEd THIS PLAYER', context.Ship.ship);
			context.Ship.initFirebaseShipData();
			// context.fireAllAnimations(gltf, context.Ship.ship);
		});
	}
	loadAllPlayers() {
		const context = this;
		this.db.list('/players', ref => ref.orderByChild('updated').startAt(Date.now()))
			.valueChanges()
			.pipe(throttleTime(100))
			.subscribe((data: PlayerData[]) => {
				console.log(data);
				if (data && data.length) {
					data.forEach((player: PlayerData) => {
						if (player.key && player.key !== context.Ship.playerkey) {
							loadModel(player);
							updatePosRot(player);
						}
					});
				}
			});
		function loadModel(player) {
			if (!context.players[player.key]) {
				context.loadShipModel().then(gltf => {
					context.players[player.key] = player;
					context.players[player.key].object = gltf.scene;
					context.scene.add(context.players[player.key].object);
					console.log('Player Loaded', player.key);
				});
			}
		}
		function updatePosRot(player) {
			if (context.players[player.key] &&
				context.players[player.key].object &&
				context.players[player.key].object.position &&
				player.rotation) {
				const speed = (10 + (context.Ship.getEnergyLevel()));
				const currentPoint = context.players[player.key].object.position;  // we will re-use it
				const destinationPoint = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
				const distance = currentPoint.distanceTo(destinationPoint);
				const duration = (Date.now() - player.updated) + 10;
				new TWEEN.Tween(context.players[player.key].object.position)
					.to(destinationPoint, duration) // destinationPoint is the object of destination
					.start();
				context.players[player.key].object.rotation.x = player.rotation._x;
				context.players[player.key].object.rotation.y = player.rotation._y;
				context.players[player.key].object.rotation.z = player.rotation._z;
				// context.players[player.key].object.position.set();

				/*
				for (const axis of player.position) {
					context.players[player.key].object[axis] = player.position[axis];
				}
				*/
			}
		}
	}
	loadShipModel(): Promise<any> {
		const context = this;
		const path = './../../assets/models/seth_ship1/';
		return new Promise((resolve, reject) => {
			context.gltfLoader.load(path + 'Spaceship_shooting_animation.gltf', function (gltf) {
				gltf.scene.traverse(function (node) {
					if (node.isMesh || node.isLight) { node.castShadow = true; }
				});
				gltf.scene.traverse(function (node) {
					if (node.material && (node.material.isMeshStandardMaterial ||
						(node.material.isShaderMaterial && node.material.envMap !== undefined))) {
						node.material.envMap = context.envMap;
						node.material.needsUpdate = true;
					}
				});
				resolve(gltf);
			});
		});
	}
	loadModelGLTF() {
		const context = this;
		// const path = './../../assets/examples/models/gltf/BoomBox/glTF/';
		// context.gltfLoader.load(path + 'BoomBox.gltf', function (gltf) {
		const path = './../../assets/models/asteroid/';
		context.gltfLoader.load(path + 'Astroid3rd.gltf', function (gltf) {
			const object = gltf.scene;
			console.log(object);
			object.scale.set(10, 10, 10);
			object.position.set(50, 10, 10);

			object.traverse(function (node) {
				if (node.material && (node.material.isMeshStandardMaterial ||
					(node.material.isShaderMaterial && node.material.envMap !== undefined))) {
					node.material.envMap = context.envMap;
					node.material.needsUpdate = true;
				}
			});
			context.scene.add(object);
			// context.camera.lookAt(object);
			// context.controls.update();
		});
	}

	fireAllAnimations(gltf, object) {
		const animations = gltf.animations;
		if (animations && animations.length) {
			const mixer = new THREE.AnimationMixer(object);
			for (let i = 0; i < animations.length; i++) {
				const animation = animations[i];
				// There's .3333 seconds junk at the tail of the Monster animation that
				// keeps it from looping cleanly. Clip it at 3 seconds
				/* 					if (sceneInfo.animationTime) {
									animation.duration = sceneInfo.animationTime;
								} */
				// animation.duration = 3;
				const action = mixer.clipAction(animation);
				console.log(animation, action);
				action.play();
			}
		}
	}
	addEnvMap() {
		if (!this.envMap) { this.envMap = this.getEnvMap(); }

		this.scene.background = this.envMap;
	}
	getEnvMap() {
		const path = 'assets/textures/cube/MilkyWay/';
		const format = '.jpg';
		const urls = [
			path + 'posx' + format, path + 'negx' + format,
			path + 'posy' + format, path + 'negy' + format,
			path + 'posz' + format, path + 'negz' + format
		];
		this.envMap = new THREE.CubeTextureLoader().load(urls);
		this.envMap.format = THREE.RGBFormat;
		return this.envMap;
	}

}
