declare var require: any;
import { Component, OnInit, HostListener } from '@angular/core';
import { ShipService } from '../ship.service';
const THREE = require('three');
const ColladaLoader = require('three-collada-loader');
const OrbitControls = require('three-orbit-controls')(THREE);

@Component({
	selector: 'app-user-interface',
	templateUrl: 'user-interface.component.html',
	styleUrls: ['user-interface.component.styl']
})

export class UserInterfaceComponent implements OnInit {

	constructor(private Ship: ShipService) { }

	ngOnInit() {

	}

	@HostListener('window:keyup', ['$event'])
	onKeyup(event: any) {
		console.log('keyup..', event.key);
		// rotate left/right/up/down
		if (event.key === 'Q' || event.key === 'q') {
			this.Ship.rotateShip.barrelleft = false;
		}
		if (event.key === 'E' || event.key === 'e') {
			this.Ship.rotateShip.barrelright = false;
		}
		if (event.key === 'A' || event.key === 'a') {
			this.Ship.rotateShip.left = false;
		}
		if (event.key === 'D' || event.key === 'd') {
			this.Ship.rotateShip.right = false;
		}
		if (event.key === 'W' || event.key === 'w') {
			this.Ship.rotateShip.pullup = false;
		}
		if (event.key === 'S' || event.key === 's') {
			this.Ship.rotateShip.pulldown = false;
		}
		if (event.key === ' ') {
			this.Ship.rotateShip.mainthruster = false;
		}
	}
	@HostListener('window:keydown', ['$event'])
	onKeydown(event: any) {
		if (event.key === 'Q' || event.key === 'q') {
			this.Ship.rotateShip.barrelleft = true;
		}
		if (event.key === 'E' || event.key === 'e') {
			this.Ship.rotateShip.barrelright = true;
		}
		if (event.key === 'A' || event.key === 'a') {
			this.Ship.rotateShip.left = true;
		}
		if (event.key === 'D' || event.key === 'd') {
			this.Ship.rotateShip.right = true;
		}
		if (event.key === 'W' || event.key === 'w') {
			this.Ship.rotateShip.pullup = true;
		}
		if (event.key === 'S' || event.key === 's') {
			this.Ship.rotateShip.pulldown = true;
		}
		if (event.key === ' ') {
			this.Ship.rotateShip.mainthruster = true;
		}
	}
	getSpeed() {
		if (this.Ship.body) {
			// return this.Ship.speed;
			return this.Ship.body.previousPosition.distanceTo(this.Ship.body.position) * this.Ship.clock.getDelta() * 60 * 1000;
		} else { return 0; }
	}
}
