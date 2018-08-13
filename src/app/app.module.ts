import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { UserInterfaceComponent } from './main/user-interface/user-interface.component';
import { ShipService } from './main/ship.service';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFireDatabaseModule } from 'angularfire2/database';
@NgModule({
	declarations: [
		AppComponent,
		MainComponent,
		UserInterfaceComponent
	],
	imports: [
		BrowserModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireDatabaseModule
	],
	providers: [ShipService],
	bootstrap: [AppComponent]
})
export class AppModule { }
