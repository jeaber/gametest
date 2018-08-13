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
	}
	@HostListener('window:keydown', ['$event'])
	onKeydown(event: any) {
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
	}
}
