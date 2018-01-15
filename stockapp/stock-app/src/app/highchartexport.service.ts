import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

@Injectable()
export class HighChartExport{
    constructor(private http: HttpClient){};
    picurl:any;
    getpicurl(options:Object){
        var exportUrl = 'http://export.highcharts.com/';
        var optionsStr = JSON.stringify(options);
        var dataString = encodeURI('async=true&type=jpeg&width=400&options=' + optionsStr);
       
        return  this.http.post(exportUrl,dataString,{
            headers: new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded'),
            responseType:"text"
        })
    }
}