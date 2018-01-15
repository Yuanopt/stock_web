import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule} from '@angular/material';
import {MatTabsModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartModule} from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { AppComponent } from './app.component';
import { Autocomplete } from './autocomplete.component';
import { Detail } from './detail.component';
import { FacebookModule } from 'ngx-facebook';
import { StockService } from './stock.service';
import { HighChartExport } from './highchartexport.service';



declare var require: any;
export function highchartsFactory() {
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  const ex = require('highcharts/modules/exporting');
  const st = require('highcharts/modules/stock');
  dd(hc);
  ex(hc);
  st(hc);
  return hc;
}

@NgModule({
  declarations: [
    AppComponent,
    Autocomplete,
    Detail,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartModule,
    NgbModule.forRoot(),
    FacebookModule.forRoot(),
  ],
  providers: [{provide: HighchartsStatic, useFactory: highchartsFactory},StockService,HighChartExport],
  bootstrap: [AppComponent]
})
export class AppModule { }
