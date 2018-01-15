import {Component} from '@angular/core';
import {FormControl,Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import {Stock} from './stock';
import {Indicator} from './indicator';
import {StockService} from './stock.service'



/**
 * @title Simple autocomplete
 */
@Component({
  selector: 'app-autocomplete',
  templateUrl: 'autocomplete.component.html',
  styleUrls:['autocomplete.component.css'],
  providers:[StockService],
})
export class Autocomplete {
  constructor(private http: HttpClient, private stockService:StockService) {}; 
  symbol:string='';
  promisesymbol:string='';
  options=[''];
  url ='';
  news:string[];
  showdetails = 1;
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
  SMA:string[]=[''];
  EMA=[''];
  STOCH=[''];
  RSI=[''];
  ADX=[''];
  CCI=[''];
  BBANDS=[''];
  MACD=[''];
  research:number=1;
  focused:number=0;
  // indicator: Indicator = {
  //   SMA:[''],
  //   EMA:[''],
  //   STOCH:[''],
  //   RSI:[''],
  //   ADX:[''],
  //   CCI:[''],
  //   BBANDS:[''],
  //   MACD:['']
  // }
  // ngOnChanges() {
  //   this.options=[''];
  //   this.url = '';
  //   this.symbol = '';
  // }
  clearsymbol(){
    this.symbol = '';
  }
  checkSymbol(){
    if(this.symbol===''){
      return true;
    } else if(this.symbol.trim().length === 0){
      return true;
    } else {
      return false;
    }
  }
  colorcheck(){
    if(this.symbol.trim().length == 0){
      return true;
    }
    return false;
  }
  focusevent(){
    this.focused = 1;
  }
  onKeyUp() {
    // this.symbol = value;
    this.url = "http://stocksearch222-env.us-east-1.elasticbeanstalk.com/index?symbol="+this.symbol;
    this.http.get(this.url).subscribe(data => {
      this.options = data['searchresult'];
    });
  }
 // 显示和选项不一样
getDisplayFn() {
  return (val) => this.displayFn(val);
}
displayFn(val) {
  // console.log(val.split("-")[0]);
  return val.split("-")[0];
}

searchagain(symbol: string){
  console.log('收到子组件请求');
  this.symbol = symbol;
  this.onClick();
}

onClick(){
  this.stock.symbol = '';
  this.stock.open = '';
  this.stock.close = '';
  this.stock.dayrange ='';
  this.stock.pclose ='';
  this.stock.pricearr=[];
  this.stock.timedata=[''];
  this.stock.volume='';
  this.stock.volumearr=[];
  this.stock.timestamp='';
  this.stock.change='';
  this.SMA=[''];
  this.ADX=[''];
  this.BBANDS=[''];
  this.CCI = [''];
  this.EMA = [''];
  this.MACD = [''];
  this.RSI = [''];
  this.STOCH = [''];
  this.research = 1;

      this.showdetails = 0; // 控制页面切换
      this.symbol = this.symbol.split("-")[0];
      this.promisesymbol = this.symbol; // 预期传入的symbol


      // this.url = "http://localhost:4201/detail?symbol="+this.symbol;
      // console.log(this.url);
      this.stockService.getstock(this.symbol).then(stock => {this.stock = stock; console.log("test"+stock.open);console.log("debug"+this.stock.symbol)});
      // this.http.get(this.url).subscribe(data => {
      //   if(data.hasOwnProperty('open')){
      //     this.stock.open = data['open'];
      //     this.stock.change = data['change'];
      //     this.stock.close = data['close'];
      //     this.stock.dayrange = data['dayrange'];
      //     this.stock.pclose = data['pclose'];
      //     this.stock.timestamp = data['timestamp'];
      //     this.stock.volume = data['volume'];
      //     this.stock.timedata = data['xdata'];
      //     this.stock.pricearr = data['ydataprice'];
      //     this.stock.volumearr = data['ydatavol'];
      //     this.stock.symbol = this.symbol;
      //   } else {
      //     console.error('api error, cannot get the stock info');
      //   }
      //   // 测试时间戳
      //   // console.log(this.stock.pricearr.length);
      //   // var times = new Date(this.stock.timestamp[0]);
      //   // console.log(times.valueOf());
      // });

      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=SMA";
      this.stockService.getindicator('SMA').then(indicator => {this.SMA = indicator['SMA'];if(this.SMA.length == 0){this.SMA = ['error']}});
      this.stockService.getindicator('EMA').then(indicator => {this.EMA = indicator['EMA'];if(this.EMA.length == 0){this.EMA = ['error']}});
      this.stockService.getindicator('BBANDS').then(indicator => {this.BBANDS = indicator['BBANDS'];if(this.BBANDS.length == 0){this.BBANDS =['error']}});
      this.stockService.getindicator('MACD').then(indicator => {this.MACD = indicator['MACD'];if(this.MACD.length == 0){this.MACD =['error']}});
      this.stockService.getindicator('RSI').then(indicator => {this.RSI = indicator['RSI'];if(this.RSI.length == 0){this.RSI =['error']}});
      this.stockService.getindicator('STOCH').then(indicator => {this.STOCH = indicator['STOCH'];if(this.STOCH.length == 0){this.STOCH=['error']}});
      this.stockService.getindicator('ADX').then(indicator => {this.ADX =indicator['ADX'];if(this.ADX.length == 0){this.ADX =['error']}});
      this.stockService.getindicator('CCI').then(indicator => {this.CCI = indicator['CCI'];if(this.CCI.length == 0){this.CCI =['error']}});

      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.SMA = data['SMA'];
      //   console.log(this.indicator.SMA[0]);
      // });
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=BBANDS";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.BBANDS = data['BBANDS'];
      //   console.log(this.indicator.BBANDS[0]);
      // });
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=EMA";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.EMA = data['EMA'];
      //   console.log(this.indicator.EMA[0]);
      // });
      
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=MACD";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.MACD = data['MACD'];
      //   console.log(this.indicator.MACD[0]);
      // });
      
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=RSI";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.RSI = data['RSI'];
      //   console.log(this.indicator.RSI[0]);
      // });
      
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=STOCH";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.STOCH = data['STOCH'];
      //   console.log(this.indicator.STOCH[0]);
      // });
      
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=ADX";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.ADX = data['ADX'];
      //   console.log(this.indicator.ADX[0]);
      // });
      this.stockService.getnews(this.symbol).subscribe(news =>{this.news = news['news']; if(this.news.length == 0){this.news=['error']}});
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&news=true";
      // console.log(this.url);
      // this.http.get(this.url).subscribe(data => {
      //   this.news = data['news'];
      //   console.log(this.news);
      // });
      
      // this.url = "http://localhost:4201/detail?symbol="+this.symbol+"&ind=true&indi=CCI";
      // this.http.get(this.url).subscribe(data => {
      //   this.indicator.CCI = data['CCI'];
      //   console.log(this.indicator.CCI[0]);
      // });
      
     
    }

  myControl: FormControl = new FormControl('');
 
}