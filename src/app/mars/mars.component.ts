declare var require: any;
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Group, ObjectLoader, TextureLoader } from 'three';

const THREE = require('three');
const ColladaLoader = require('three-collada-loader');

import OBJLoader from 'three-obj-loader';
import MTLLoader from 'three-mtl-loader';

OBJLoader(THREE);
MTLLoader(THREE);
THREE.ColladaLoader = ColladaLoader;
@Component({
	selector: 'app-mars-component',
	templateUrl: 'mars.component.html',
	styleUrls: ['mars.component.styl']
})

export class MarsComponent implements OnInit {
	@ViewChild('container') elementRef: ElementRef;
	private container: HTMLElement;

	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private objLoader: THREE.OBJLoader;
	private mtlLoader: THREE.MTLLoader;
	private daeLoader: THREE.ColladaLoader;

	private ship;
	// private cube: THREE.Mesh;

	constructor() {
		console.log(THREE);
	}

	ngOnInit() {
		this.container = this.elementRef.nativeElement;
		this.objLoader = new THREE.OBJLoader();
		this.mtlLoader = new MTLLoader();
		this.daeLoader = new ColladaLoader();
		console.log(this.container);

		this.init();
	}

	init() {
		const context = this;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
		this.renderer = new THREE.WebGLRenderer();

		this.scene.add(this.camera);

		const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
		this.scene.add(ambientLight);
		const pointLight = new THREE.PointLight(0xffffff, 0.8);
		this.camera.add(pointLight);

		this.camera.position.set(10, 10, 10);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(this.renderer.domElement);

		this.loadMarsModel();

		this.render();
		setInterval(() => {
			this.animate();
		}, 30);
	}

	render() {
		const context: MarsComponent = this;

		(function render() {
			requestAnimationFrame(render);
			context.renderer.render(context.scene, context.camera);
		}());

	}
	setCamera() {
		/* 		this.camera.position.x = this.ship.position.x + Math.sin(this.ship.rotation.y) * 400;
				this.camera.position.y = 450;
				this.camera.position.z = this.ship.position.z + Math.cos(this.ship.rotation.y) * 400;
		 */
		this.camera.lookAt(this.ship.position);
	}
	animate() {
		if (this.ship) {
			// this.ship.rotateX(0.1);
			this.ship.rotateY(0.1);
			// this.ship.position.addScalar(0.5);
		}
	}
	loadMarsModel() {
		const context = this;
		this.daeLoader.load('./../../assets/models/ships/Seths_Spaceship_1.dae', function (collada) {
			context.ship = collada.scene;
			context.scene.add(context.ship);
		});
	}
}
