declare var require: any;
import { Injectable } from '@angular/core';
import { Subject, AsyncSubject } from 'rxjs';
const THREE = require('three');
const ColladaLoader = require('three-collada-loader');
const OrbitControls = require('three-orbit-controls')(THREE);
import { debounceTime, map, throttleTime } from 'rxjs/operators';
import { Vector3, Euler } from 'three';
import { AngularFireDatabase } from 'angularfire2/database';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
interface ShipData {
	position: Vector3;
	quaternion: Euler;
}
export interface PlayerData {
	key?: any;
	guest: any;
	position: any;
	quaternion: any;
	updated: any;
}
@Injectable()
export class ShipService {
	shipEnergyLevel: number;
	ship;
	body;
	speed: number;
	public playerkey;
	public posrot$ = new Subject();
	public rotateShip = {
		barrelleft: false,
		barrelright: false,
		left: false,
		right: false,
		pullup: false,
		pulldown: false,
		mainthruster: false
	};
	public clock: THREE.Clock;
	private lastPosition: Vector3 = new Vector3;
	constructor(private db: AngularFireDatabase) {
		const context = this;
		this.shipEnergyLevel = 10;
		this.clock = new THREE.Clock();
		this.posrot$
			.asObservable()
			.pipe(throttleTime(100))
			.subscribe(() => {
				context.calculateShipSpeed();
				context.updateFirebaseShipData();
			});
	}
	getEnergyLevel() {
		return this.shipEnergyLevel * .1;
	}
	initFirebaseShipData() {
		const afList = this.db.list<any>('/players/');
		afList.push(this.getShipData()).then((playerref) => {
			this.playerkey = playerref.key;
		});
	}
	calculateShipSpeed() {
		this.speed = (this.lastPosition.distanceToSquared(this.ship.position));
		this.lastPosition.copy(this.ship.position);
	}

	updateFirebaseShipData() {
		const afList = this.db.list<any>('/players/');
		if (!this.playerkey) {
		} else {
			afList.update(this.playerkey, this.getShipData());
		}
	}
	getShipData(): ShipData {
		const data: PlayerData = {
			// key: undefined,
			guest: true,
			position: this.ship.position,
			quaternion: this.ship.quaternion,
			updated: Date.now()
		};
		if (this.playerkey) {
			data.key = this.playerkey;
		}
		delete data.quaternion.onChangeCallback;
		return data;
	}
	getSpeed() {
		const delta = this.clock.getDelta(); // seconds.
		const moveDistance = (10 + (this.getEnergyLevel())) * delta;
		return moveDistance;
	}
}/*
const ref = afList.push(newDeck);

return new Promise((resolve, rej) => {
	ref.then((deckref) => {
		// console.log(deckref);
		// uh Lol?
		if (deckItems) {
			deckItems.forEach(item => {
				context.addDeckitemToDeck(item, deckref.key);
			});
		}
		context.db.object("users/" + this.A.uid + "/decks-data/names/" + deckref.key + "/key")
			.set(deckref.key)
			.then(() => { resolve(deckref); });
	});
});
*/
