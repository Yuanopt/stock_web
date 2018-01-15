import {Injectable} from '@angular/core';
import {Stock} from './stock';
import {Indicator} from './indicator';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

@Injectable()
export class StockService {
    constructor(private http: HttpClient){};
    symbol:string;
    stock: Stock = {
        symbol: ' ',
        open: ' ',
        volume: ' ',
        change: ' ',
        pclose: ' ',
        dayrange: ' ',
        timestamp:' ',
        close:' ',
        timedata:[''],
        pricearr:[],
        volumearr:[]
      };
    url:string;
    indicator:string[]=[''];
    getstock(symbol:string):Promise<Stock>{
        this.url = "http://stocksearch222-env.us-east-1.elasticbeanstalk.com/detail?symbol="+symbol;
        this.symbol = symbol;
        this.http.get(this.url).subscribe(data => {
            if(data.hasOwnProperty('open')){
              this.stock.open = data['open'];
              this.stock.change = data['change'];
              this.stock.close = data['close'];
              this.stock.dayrange = data['dayrange'];
              this.stock.pclose = data['pclose'];
              this.stock.timestamp = data['timestamp'];
              this.stock.volume = data['volume'];
              this.stock.timedata = data['xdata'];
              this.stock.pricearr = data['ydataprice'];
              this.stock.volumearr = data['ydatavol'];
              this.stock.symbol = symbol;
            } else {
              console.error('api error, cannot get the stock info');
              this.stock.symbol = 'error';
            }     
        });

    console.log(Promise.resolve(this.stock));
    return Promise.resolve(this.stock);  
    }

    getindicator(func:string):Promise<any>{
        
        var url = "http://stocksearch222-env.us-east-1.elasticbeanstalk.com/detail?symbol="+this.symbol+"&ind=true&indi="+func;
        return this.http
        .get(url)
        .toPromise();
        // this.http.get(this.url).subscribe(data => {
        //     this.indicator = data[func];
        //     console.log("service call "+this.indicator[0]);
        //   });
        // console.log(Promise.resolve(this.indicator));
        // return Promise.resolve(this.indicator);
    }
    getnews(symbol:string){

        var url = "http://stocksearch222-env.us-east-1.elasticbeanstalk.com/detail?symbol="+this.symbol+"&news=true";
        return this.http
        .get(url)
    }
} 