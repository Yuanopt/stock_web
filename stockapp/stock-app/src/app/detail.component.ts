import {Component, EventEmitter,Input,OnInit,Output} from '@angular/core';
import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import {FacebookService, InitParams, LoginResponse, UIParams,UIResponse } from 'ngx-facebook';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import {StockService} from './stock.service';
import {Stock} from './stock';
import {Indicator} from './indicator';
import {HighChartExport} from './highchartexport.service';

export class News{
    author: string;
    link: string;
    pubDate: string;
    title:string;
}
declare const $: any;
@Component({
    selector: 'stock-detail',
    templateUrl: 'detail.component.html',
    styleUrls:['detail.component.css'],
    animations:[
        trigger('enterright',[
            state('in',style({transform:'translateX(0)'})),
            transition('void => *',[style({transform: 'translateX(-100%)'}),
            animate(500)]),
        ]),
        trigger('enterleft',[
            state('active',style({transform:'translateX(0)'})),
            transition('void => active',[style({transform: 'translateX(100%)'}),
            animate(500)]),
        ])
    ]
})

export class Detail implements OnInit{
    constructor(private http: HttpClient, private fb:FacebookService, private stockservice:StockService, private picurlservice:HighChartExport) {
        console.log('Initializing Facebook');
        const params: InitParams = {
            appId:'786827191500766',
            xfbml:true,
            version:'v2.11'
        };
        fb.init(params);
    }; 
   
    @Input() 
    stock:Stock={
        symbol: '',
        open: ' ',
        volume: ' ',
        change: ' ',
        pclose: ' ',
        dayrange: ' ',
        timestamp:' ',
        close:' ',
        timedata:[''],
        pricearr:[],
        volumearr:[],
    };
    @Input()
        SMA:string[]=[''];
    @Input()
        EMA:string[]=[''];
    @Input()
        STOCH:string[]=[''];
    @Input()
        ADX:string[]=[''];
    @Input()
        BBANDS:string[]=[''];
    @Input()
        RSI:string[]=[''];
    @Input()
        CCI:string[]=[''];
    @Input()
        MACD:string[]=[''];

    @Input()
    news:string[]=[''];

    @Input()
    showdetails:number = 1;

    @Input()
    promisesymbol:string = ' ';
    @Input()
    research:number = 0;
    @Output() searchagain = new EventEmitter<string>();
    // ------- 
    indicator:Indicator={
        SMA:[''],
        EMA:[''],
        STOCH:[''],
        RSI:[''],
        ADX:[''],
        CCI:[''],
        BBANDS:[''],
        MACD:['']
    }
    totalnews: Array<News>=[];
    options: Object;
    options1: Object;
    options2: Object;
    options3: Object;
    history: Object;
    change:number;
    infavorite = 0;
    favoritelist: string[]=[''];
    defaultFavoritelist: string[] = [''];
    state = 'inactive'; // 滑动动画
    
    //Select
    sortOptions=['Default','Symbol','Price','Change','Change Percent','Volume']
    selectedValue = 'Default';
    sortOrders = ['Ascending','Descending'];
    selectedOrder = 'Ascending';
    //histroy
    historycount:number = 0;
    // autorefresh 
    autofresh:number = 0;
    public timerInterval:any; 
    // export pic 
    selected:string[]=[''];
    picurl = '';
    tabname = 'Price';
    //gofavorite
    gofavorite = 0;
    ngOnInit(){
        //favoritelist 顺序问题
        console.log("it should be null" + localStorage.getItem('order'));
        if(localStorage.getItem('order')==null){
            localStorage.setItem('order','');
        }else{
            var orderstring = localStorage.getItem('order');
            var orderstock = new Array();
            orderstock = orderstring.split('&');
            for(var i=0; i < localStorage.length-1; i++){
                this.favoritelist[i]=(localStorage.getItem(orderstock[i]));
            }
            console.log("GOGOGO"+this.favoritelist);
        }
        this.showdetails=1;
    }
    fbFunction(){
        console.log("start fb function");
        // this.fb.login()
        // .then((response: LoginResponse) => console.log(response))
        // .catch((error:any) => console.log(error));

        var options: UIParams = {
            method: 'feed',
            picture: 'https://export.highcharts.com/'+this.picurl,
          };
        
        this.fb.ui(options)
            .then((res: UIResponse) => {
              console.log('Got the users profile', res);
            })
            .catch(this.handleError);
    }
    private handleError(error) {
        console.error('Error processing action', error);
      }
   //------
    clickfavorite(symbol:string){
            this.showdetails = 0;
            console.log('click方法被调用');
            this.searchagain.emit(symbol);
      }
   //-----

    goFavorite(){ // 切换到favorite界面
        this.showdetails = 1;
        // var favoritelist = new Array() ;
        // if(this.favoritelist.length == 1){
        //     for(var i = 0 ; i < localStorage.length; i++ ){
        //         if(localStorage.key(i)=='order'){
        //             console.log('because this is order');
        //         }else{
        //             favoritelist.push(localStorage.getItem(localStorage.key(i)));
        //         }
        //     }
        //     this.favoritelist = favoritelist;
        // }
        this.gofavorite = 1;
        if(localStorage.length == 1){
            this.favoritelist = [''];
        } 
        console.log(this.favoritelist)
        this.state = 'active'; // 滑动状态
    } 

    toggletest(){
        $('#toggle-one').bootstrapToggle();
    }
    goDetails(){ // 切换到details 界面
        this.showdetails = 0;
        this.gofavorite = 0;
    }

    // favorite 星号button
    favorite() {
        if(this.infavorite == 0){
            this.infavorite = 1;
            var stockinfo;
            stockinfo = this.stock.symbol + "|" + this.stock.close + "|" +this.stock.change
            +"|"+this.stock.volume;
            localStorage.setItem(this.stock.symbol,stockinfo);
            
            // // 没有收藏的list的时候，点击favorite可以替换掉初始的‘’
            // if(this.favoritelist[0]=''){
            //     this.favoritelist[0]=stockinfo;
            // }else{
            //     this.favoritelist.push(stockinfo);
            // }
            // this.defaultFavoritelist.push(stockinfo);
            var order = new Array();
            // 用一个order的key 记录存放的顺序
            var orderstring = localStorage.getItem('order');
            orderstring = orderstring  + this.stock.symbol + "&";
            localStorage.setItem('order',orderstring);
            if(this.favoritelist[0]==''){
                this.favoritelist[0]=stockinfo;
            }else{
                this.favoritelist.push(stockinfo);
            }
            console.log(orderstring);
            console.log(localStorage.length + "should be 2");
            console.log("favoritelist should be"+this.favoritelist.length+"the value should be"+ this.favoritelist+"!");
            
        } else {
            this.infavorite = 0;
            localStorage.removeItem(this.stock.symbol);
            console.log("favoritelist before splice"+this.favoritelist.length+"the value should be"+ this.favoritelist+"!");            
            console.log("this should be stock symbol" + this.favoritelist[0].split('|')[0]);
            for(var i = 0; i < this.favoritelist.length; i++){
                if(this.favoritelist[i].split('|')[0] == this.stock.symbol){
                    console.log("doing the splice");
                    this.favoritelist.splice(i,1);
                }
            }
            console.log("favoritelist should be"+this.favoritelist.length+"the value should be"+ this.favoritelist+"!");            
            // 用一个order记录
            var orderstring = localStorage.getItem('order');
            var target = this.stock.symbol+"&";
            console.log(target);
            orderstring = orderstring.replace(target,'');
            localStorage.setItem('order',orderstring);
            console.log(orderstring);      
        }
 
    }
    // remove 垃圾箱button
    Remove(stockname:string){
        localStorage.removeItem(stockname);
        
        // for(var i = 0 ; i < localStorage.length; i++ ){
        //     favoritelist.push(localStorage.getItem(localStorage.key(i)));
        // }
        for(var i = 0; i <this.favoritelist.length; i++){
            if(this.favoritelist[i].split('|')[0] == stockname){
                this.favoritelist.splice(i,1);
                i=i-1;
            }
        }   
        console.log(this.favoritelist)
        if(stockname == this.stock.symbol){
            this.infavorite = 0;
        }
        // 用一个order记录
        var orderstring = localStorage.getItem('order');
        var target = stockname+"&";
        orderstring = orderstring.replace(target,'');
        localStorage.setItem('order',orderstring);
        console.log(orderstring);     
    }
    // sort 排序
    Sort(){
        switch(this.selectedValue){
            case 'Symbol':
            this.sortByName();
            break;
            case 'Price':
            this.sortByPrice();
            break;
            case 'Change':
            this.sortByChange();
            break;
            case 'Change Percent':
            this.sortByChangePercent();
            break;
            case 'Volume':
            this.sortByVolume();
            break;
            case 'Default':
            this.sortByDefault();
        }
    }

    sortByDefault(){
        // var favoritelist = new Array();
        // for(var i = 0; i < localStorage.length; i++ ){
        //     favoritelist.push(localStorage.getItem(localStorage.key(i)));
        // }
        var orderstring = localStorage.getItem('order');
        var orderstock = new Array();
        orderstock = orderstring.split('&');
        for(var i=0; i < localStorage.length-1; i++){
            this.favoritelist[i]=(localStorage.getItem(orderstock[i]));
        }
    }
    sortByName(){
        var names = new Array();
        var j = 0;
        for(var i = 0 ; i < localStorage.length; i++){
            
            if(localStorage.key(i)!='order'){
                names[j] = localStorage.getItem(localStorage.key(i));
                names[j] = names[j].split("|")[0];
                j++;
            }
        }
        names.sort();
        if(this.selectedOrder === 'Descending'){
            names.reverse();
        }
        var favoritelist = new Array();
        for(var i = 0 ; i < localStorage.length-1; i++ ){
            favoritelist[i]=(localStorage.getItem(names[i]));
        }
        console.log(favoritelist);
        this.favoritelist = favoritelist;
        
    }
    sortByPrice(){
        var stockinfo = new Array();
        var j = 0;
        for(var i = 0 ; i < localStorage.length; i++){
            if(localStorage.key(i)!='order'){
                stockinfo[j] = localStorage.getItem(localStorage.key(i));
                j++;
            }
        }
        stockinfo.sort(function(a,b){
            return parseFloat(a.split('|')[1])-parseFloat(b.split('|')[1]);
        });
        console.log(stockinfo);
        if(this.selectedOrder === 'Descending'){
            stockinfo.reverse();
        }
        var favoritelist = new Array();
        for(var i = 0 ; i < localStorage.length-1; i++ ){
            favoritelist[i]=(localStorage.getItem(stockinfo[i].split('|')[0]));
        }
        console.log(favoritelist);
        this.favoritelist = favoritelist;

    }
    sortByChange(){
        var stockinfo = new Array();
        var j = 0;
        for(var i = 0 ; i < localStorage.length; i++){
            if(localStorage.key(i)!='order'){
                stockinfo[j] = localStorage.getItem(localStorage.key(i));
                j++;
            }
        }
        stockinfo.sort(function(a,b){
            return parseFloat(a.split('|')[2].split('(')[0])-parseFloat(b.split('|')[2].split('(')[0]);
        });
        console.log(stockinfo);
        if(this.selectedOrder === 'Descending'){
            stockinfo.reverse();
        }
        var favoritelist = new Array();
        for(var i = 0 ; i < localStorage.length-1; i++ ){
            favoritelist[i]=(localStorage.getItem(stockinfo[i].split('|')[0]));
        }
        console.log(favoritelist);
        this.favoritelist = favoritelist;
    }
    sortByChangePercent(){
        var stockinfo = new Array();
        var j = 0;
        for(var i = 0 ; i < localStorage.length; i++){
            if(localStorage.key(i)!='order'){
                stockinfo[j] = localStorage.getItem(localStorage.key(i));
                j++;
            }
        }
        stockinfo.sort(function(a,b){
            return parseFloat(a.split('|')[2].split('(')[1])-parseFloat(b.split('|')[2].split('(')[1]);
        });
        console.log(stockinfo);
        if(this.selectedOrder === 'Descending'){
            stockinfo.reverse();
        }
        var favoritelist = new Array();
        for(var i = 0 ; i < localStorage.length-1; i++ ){
            favoritelist[i]=(localStorage.getItem(stockinfo[i].split('|')[0]));
        }
        console.log(favoritelist);
        this.favoritelist = favoritelist;
    }
    sortByVolume(){
        var stockinfo = new Array();
        var j = 0;
        for(var i = 0 ; i < localStorage.length; i++){
            if(localStorage.key(i)!='order'){
                stockinfo[j] = localStorage.getItem(localStorage.key(i));
                j++;
            }
        }
        stockinfo.sort(function(a,b){
            return parseFloat(a.split('|')[3].replace(/,/g, ''))-parseFloat(b.split('|')[3].replace(/,/g, ''));
        });
        console.log(stockinfo);
        if(this.selectedOrder === 'Descending'){
            stockinfo.reverse();
        }
        var favoritelist = new Array();
        for(var i = 0 ; i < localStorage.length-1; i++ ){
            favoritelist[i]=(localStorage.getItem(stockinfo[i].split('|')[0]));
        }
        console.log(favoritelist);
        this.favoritelist = favoritelist;
    }
    // ------------------------------------------------
    // getDetails(symbol: string){
    //     this.stock.symbol = '';
    //     this.stock.open = '';
    //     this.stock.close = '';
    //     this.stock.dayrange ='';
    //     this.stock.pclose ='';
    //     this.stock.pricearr=[];
    //     this.stock.timedata=[''];
    //     this.stock.volume='';
    //     this.stock.volumearr=[];
    //     this.stock.timestamp='';
    //     this.stock.change='';

    //     this.showdetails = 0;
    //     this.promisesymbol = symbol;
    //     this.SMA=[''];
    //     this.ADX=[''];
    //     this.BBANDS=[''];
    //     this.CCI = [''];
    //     this.EMA = [''];
    //     this.MACD = [''];
    //     this.RSI = [''];
    //     this.STOCH = [''];
    //     this.research = 0;
    //     this.stockservice.getstock(symbol).then(stock => {this.stock = stock; console.log("test"+stock.open);console.log("debug"+symbol)});
    //     this.stockservice.getindicator('SMA').then(indicator => {this.SMA = indicator['SMA'];if(this.SMA.length == 0){this.SMA = ['error']}});
    //     this.stockservice.getindicator('EMA').then(indicator => {this.EMA = indicator['EMA'];if(this.EMA.length == 0){this.EMA = ['error']}});
    //     this.stockservice.getindicator('BBANDS').then(indicator => {this.BBANDS = indicator['BBANDS'];if(this.BBANDS.length == 0){this.BBANDS =['error']}});
    //     this.stockservice.getindicator('MACD').then(indicator => {this.MACD = indicator['MACD'];if(this.MACD.length == 0){this.MACD =['error']}});
    //     this.stockservice.getindicator('RSI').then(indicator => {this.RSI = indicator['RSI'];if(this.RSI.length == 0){this.RSI =['error']}});
    //     this.stockservice.getindicator('STOCH').then(indicator => {this.STOCH = indicator['STOCH'];if(this.STOCH.length == 0){this.STOCH=['error']}});
    //     this.stockservice.getindicator('ADX').then(indicator => {this.ADX =indicator['ADX'];if(this.ADX.length == 0){this.ADX =['error']}});
    //     this.stockservice.getindicator('CCI').then(indicator => {this.CCI = indicator['CCI'];if(this.CCI.length == 0){this.CCI =['error']}});
    //     this.stockservice.getnews(symbol).subscribe(news =>{this.news = news['news']; if(this.news.length == 0){this.news=['error']}});
        
    // }
    // ------------------------------------------------
    //facebook imge check
    fbimg(){
        if(this.tabname=='other' && this.selected.length < 10){
            return true;
        }
        if(this.tabname=='Price' && this.stock.symbol != this.promisesymbol){
            return true;
        }
    }

    // 手动刷新
    refresh(){
        var names = new Array();
        var favoritelist = new Array();
        var j = 0;
        for(var i = 0 ; i < localStorage.length; i++){
            if(localStorage.key(i)!='order'){
                names[j] = localStorage.getItem(localStorage.key(i));
                names[j] = names[j].split("|")[0];
                j++;
            }
        }
        for(var i = 0; i < localStorage.length-1; i++){
            var url = "http://stocksearch222-env.us-east-1.elasticbeanstalk.com/favorite?symbol="+names[i];
            this.http.get(url).subscribe(data => {
                    if(data.hasOwnProperty('stock')){
                        favoritelist.push(data['stock']);
                        console.log(favoritelist);
                        if(favoritelist.length === localStorage.length-1){
                            for(var i = 0; i < favoritelist.length; i++){
                                var stocksymbol = favoritelist[i].split('|')[0];
                                var newprice = favoritelist[i].split('|')[1];
                                var newChange = favoritelist[i].split('|')[2];
                                var oldvolmue = localStorage.getItem(favoritelist[i].split('|')[0]).split('|')[3];
                                var newstockinfo = stocksymbol + '|' + newprice + '|' + newChange + '|' + oldvolmue;
                                localStorage.setItem(stocksymbol,newstockinfo);
                            }
                            // 
                            for(var i = 0 ; i < favoritelist.length; i++ ){
                                favoritelist[i] = localStorage.getItem(this.favoritelist[i].split('|')[0]);
                            }
                            this.favoritelist = favoritelist;
                        }
                    } else {
                        console.error("api error: cannot renew stock " + name[i]);
                    }
                });
            } 
    }
    // 自动刷新
    // toggleevent(){
    //     if($('#toggle-one').prop('checked') == true){
    //         console.log("clicked");
    //     }
    // }

    autoRefresh(){
        //test
        console.log("this is been clicked");
        //
        if(this.autofresh === 0){
            this.autofresh = 1;
        } else {
            this.autofresh = 0;
        }
        if(this.autofresh === 0){
            clearInterval(this.timerInterval); // 清除 interval
            console.log("clear the timer Interval");
        }
        if(this.autofresh === 1){
        console.log(this.autofresh);
        this.timerInterval=setInterval(()=>{
            var names = new Array();
            var favoritelist = new Array();
            var j = 0;
            for(var i = 0 ; i < localStorage.length; i++){
                if(localStorage.key(i)!='order'){
                    names[j] = localStorage.getItem(localStorage.key(i));
                    names[j] = names[j].split("|")[0];
                    j++;
                }
            }
            for(var i = 0; i < localStorage.length-1; i++){
                var url = "http://stocksearch222-env.us-east-1.elasticbeanstalk.com/favorite?symbol="+names[i];
                this.http.get(url).subscribe(data => {
                    if(data.hasOwnProperty('stock')){
                        favoritelist.push(data['stock']);
                        console.log(favoritelist);
                        if(favoritelist.length === localStorage.length-1){
                            for(var i = 0; i < favoritelist.length; i++){
                                var stocksymbol = favoritelist[i].split('|')[0];
                                var newprice = favoritelist[i].split('|')[1];
                                var newChange = favoritelist[i].split('|')[2];
                                var volmue = favoritelist[i].split('|')[3];
                                var newstockinfo = stocksymbol + '|' + newprice + '|' + newChange + '|' + volmue;
                                localStorage.setItem(stocksymbol,newstockinfo);
                            }
                            // 
                            for(var i = 0 ; i < this.favoritelist.length; i++ ){
                                this.favoritelist[i] = localStorage.getItem(this.favoritelist[i].split('|')[0]);
                            }

                        }
                    }else {
                        console.error("api error: cannot renew stock " + name[i]);
                    }
                    });
                } 
        },5000);
    }
}


    subtitle = '<a href="https://www.alphavantage.co"> Source: Alpha Vantage </a>';
    
    public beforeChange($event: NgbTabChangeEvent){
        var func;
        var title;
        if($event.nextId ==='Price'){
            this.tabname = 'Price';
            this.picurlservice.getpicurl(this.options).subscribe(data=>this.picurl=data);            
        } else {
            this.tabname = 'other';
        if($event.nextId === 'SMA'){
            func = 'SMA';
            title = 'Simple Moving Average(SMA)';
            this.selected= this.SMA;
        } else if ($event.nextId === 'EMA'){
            func = 'EMA';
            title = 'Exponential Moving Average(EMA)';
            this.selected = this.EMA;
        } else if($event.nextId ==='ADX') {
            func = 'ADX';
            title = 'Average Directional movement Index (ADX)';
            this.selected = this.ADX;
        } else if($event.nextId === 'CCI') {
            func = 'CCI';
            title = 'Commodity Channel Index (CCI)';
            this.selected = this.CCI;
        } else if($event.nextId === 'RSI') {
            func = 'RSI';
            title = 'Relative Strength Index (RSI)'
            this.selected = this.RSI;
        } else if ($event.nextId === 'STOCH'){
            func = 'STOCH';
            title = 'Stochastic Oscillator (STOCH)';
            this.selected = this.STOCH;
        } else if ($event.nextId === 'BBANDS'){
            func = 'BBANDS';
            title = 'Bollinger Bands (BBANDS)';
            this.selected = this.BBANDS;
        } else {
            func = 'MACD';
            title = 'Moving Average Convergence/Divergence(MACD)';
            this.selected = this.MACD;
        }

        if(func!=='STOCH' && func !== 'MACD' && func !== 'BBANDS'){
            var ydata = new Array();
            for(var i = 0; i < this.indicator[func].length; i++){
                ydata[i] = parseFloat(this.indicator[func][i]);
            }
            this.options1 = {
            chart:{
                zoomType: 'x',
            },
            title: {
                text: title,
            },

            subtitle: {
                text: this.subtitle,
                useHTML:true,
            },

            xAxis: {
                tickInterval: 5,
                categories: this.stock.timedata.slice(0,121).reverse(),
            },

            yAxis: {
                title: {
                    text: func,
                },
            },
            plotOptions: {
                series: {
                        marker: {
                        radius: 2,
                    },
                    lineWidth: 1,
                },
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: 0,
                y: 200,
                float: true,
            },

            series: [{
                type: 'spline',
                color: 'red',
                name: this.promisesymbol,
                data: ydata.reverse(),
            }]
            }
            this.picurlservice.getpicurl(this.options1).subscribe(data=>this.picurl=data);
        }else if (func ==='STOCH'){
            var ydata1 = new Array();
            var ydata2 = new Array();
            for(var i = 0; i < this.indicator[func].length; i++){
                [ydata1[i],ydata2[i]]=this.indicator[func][i].split(" ");
                ydata1[i] = parseFloat(ydata1[i]);
                ydata2[i] = parseFloat(ydata2[i]);
            }
            this.options2 = {
                chart:{
                    zoomType: 'x',
                },
             title: {
                 text: title,
             },
 
             subtitle: {
                 text: this.subtitle,
                 useHTML: true,
             },
 
             xAxis: {
                 tickInterval: 5,
                 categories: this.stock.timedata.slice(0,121).reverse(),
             },
 
             yAxis: {
                 title: {
                     text: func,
                 },
             },
             plotOptions: {
                 series: {
                        marker: {
                         radius: 2,
                     },
                     lineWidth: 1,
                 },
             },
             legend: {
                 layout: 'vertical',
                 align: 'right',
                 verticalAlign: 'top',
                 x: 0,
                 y: 200,
                 float: true,
             },
 
             series: [{
                 type: 'spline',
                 color: 'red',
                 name:  this.promisesymbol + ' slowK',
                 data: ydata1.reverse(),
             },{
                 type: 'spline',
                 color: 'blue',
                 name: this.promisesymbol + ' slowD',
                 data: ydata2.reverse(),
 
             }]
            }
        this.picurlservice.getpicurl(this.options2).subscribe(data=>this.picurl=data);            
        } else {
            var ydata1 = new Array();
            var ydata2 = new Array();
            var ydata3 = new Array();
            var name1;
            var name2;
            var name3;
            if(func === 'BBANDS'){
                name1 = 'MACD_Signal';
                name2 = 'MACD_Hist';
                name3 = 'MACD';
            } else {
                name1 = 'Real Lower Band';
                name2 = 'Real Upper Band';
                name3 = 'Real Middle Band';
            }
            for(var i = 0; i < this.indicator[func].length; i++ ){
                [ydata1[i] , ydata2[i], ydata3[i]] = this.indicator[func][i].split(" ");
                ydata1[i] = parseFloat(ydata1[i]);
                ydata2[i] = parseFloat(ydata2[i]);
                ydata3[i] = parseFloat(ydata3[i]);
            }  
            this.options3 = {
                chart:{
                    zoomType: 'x',
                },
                title: {
                    text: title,
                },
    
                subtitle: {
                    text: this.subtitle,
                    useHTML: true,
                },
    
                xAxis: {
                    tickInterval: 5,
                    categories: this.stock.timedata.slice(0,121).reverse(),
                },
    
                yAxis: {
                    title: {
                        text: func,
                    },
                },
                plotOptions: {
                    series: {
                           marker: {
                            radius: 2,
                        },
                        lineWidth: 1,
                    },
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: 0,
                    y: 200,
                    float: true,
                },
    
                series: [{
                    type: 'spline',
                    color: 'red',
                    name: name1,
                    data: ydata1.reverse(),
                },{
                    type: 'spline',
                    color: 'blue',
                    name: name2,
                    data: ydata2.reverse(),
    
                },{
                    type: 'spline',
                    color: 'black',
                    name: name3,
                    data: ydata3.reverse(),
                }]
            }
            this.picurlservice.getpicurl(this.options3).subscribe(data=>this.picurl=data);
        }
    }
}
    count = 0;
    count2 = 0
    ngOnChanges(){
        this.historycount = 0;
        console.log(this.historycount);
        this.tabname = 'Price';
        this.count2++;
        console.log("research should be "+ this.research);
        if(this.research == 1){
            
            this.SMA = [''];
            this.EMA=[''];
            this.STOCH=[''];
            this.RSI=[''];
            this.ADX=[''];
            this.CCI=[''];
            this.BBANDS=[''];
            this.MACD=[''];
            this.research = 0;
        }
        // 更新数据之后星号的变化
        console.log(this.promisesymbol+" " + this.stock.symbol);
        if(this.promisesymbol !== this.stock.symbol){
            this.infavorite  = 0;
            this.count = 0;
        }
        // 判断是否是收藏过的数据
        if(localStorage.getItem(this.promisesymbol)){
            this.infavorite = 1;
        }
        if(this.count2>=1 && this.gofavorite == 0){
            this.showdetails=0;
        }
        // 显示favoritelist
        // this.showdetails = 0;
        this.indicator.SMA = this.SMA;
    
        this.indicator.EMA = this.EMA;

        this.indicator.STOCH = this.STOCH;

        this.indicator.ADX =this.ADX;
  
        this.indicator.MACD = this.MACD;

        this.indicator.RSI = this.RSI;
 
        this.indicator.BBANDS = this.BBANDS;
        this.indicator.CCI = this.CCI;

        console.log(this.indicator);
        console.log(this.news);
        //
        if(this.count == 0 && (this.promisesymbol == this.stock.symbol)){
            this.count = 1;
            this.count2 = 0;
            this.research = 0;
            this.change = parseFloat(this.stock.close)-parseFloat(this.stock.pclose);
            this.options = {
                chart:{
                    zoomType: 'x',
                },
                title: {text:this.stock.symbol + ' Stock Price and Volume'},
                subtitle : {
                    text: this.subtitle,
                    useHTML: true,
                },
                xAxis: {
                    tickPixelInterval: 50,
                    tickInterval: 5,
                    categories: this.stock.timedata.slice(0,121).reverse(),
                },
                yAxis: [{
                    title: {
                        text: 'Volume',
                    },
                    opposite: true
                },{ 
                    title:{
                        text: 'Stock Price',
                    },
                }],
                plotOptions: {
                    series:{
                        marker: {
                            enabled: false,
                        },
                    lineColor: 'red',
                },
                area: {
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                }
                },
                tooltip: {
                    valueDecimals: 2,
                },
                legend: {
                    layout: 'vertical',
                    align: 'center',
                    x: 0,
                    y: 0,
                    float: true,
                },
                series: [{
                    type: 'area',
                    color: 'rgb(244,149,145)',
                    name: this.stock.symbol,
                    data: this.stock.pricearr.slice(879,1000),
                    yAxis:1,
                },{
                    type:'column',
                    color: 'blue',
                    name: this.stock.symbol + '.volume',
                    data: this.stock.volumearr,
                }]
            };            
        }
    }

//    drawchart(func){
//         var title;
//         if(func === 'SMA'){
//             func = 'SMA';
//             title = 'Simple Moving Average(SMA)';
            
//         } else if (func === 'EMA'){
//             func = 'EMA';
//             title = 'Exponential Moving Average(EMA)';
            
//         } else if(func ==='ADX') {
//             func = 'ADX';
//             title = 'Average Directional movement Index (ADX)';
            
//         } else if(func === 'CCI') {
//             func  = 'CCI';
//             title = 'Commodity Channel Index (CCI)';
//         } else {
//             func = 'RSI';
//             title = 'Relative Strength Index (RSI)';
//         }
//         var ydata = new Array();
//         for(var i = 0; i < this.indicator[func].length; i++){
//             ydata[i] = parseFloat(this.indicator[func][i]);
//         }
//         this.options1[func] = {
//         chart:{
//             zoomType: 'x',
//         },
//         title: {
//             text: title,
//         },

//         subtitle: {
//             text: this.subtitle,
//             useHTML:true,
//         },

//         xAxis: {
//             tickInterval: 5,
//             categories: this.stock.timedata.slice(0,121).reverse(),
//         },

//         yAxis: {
//             title: {
//                 text: func,
//             },
//         },
//         plotOptions: {
//             series: {
//                     marker: {
//                     radius: 2,
//                 },
//                 lineWidth: 1,
//             },
//         },
//         legend: {
//             layout: 'vertical',
//             align: 'right',
//             verticalAlign: 'top',
//             x: 0,
//             y: 200,
//             float: true,
//         },

//         series: [{
//             type: 'spline',
//             color: 'red',
//             name: this.stock.symbol,
//             data: ydata.reverse(),
//         }]
//         }
        
//     }
   
    public beforeChange1($event: NgbTabChangeEvent){
        console.log('you have clicked the button'+this.news.length);
        if($event.nextId === "News"){
            for(var i = 0; i < this.news.length; i++){
                var article = new Array();
                var curnews = new News();
                [article[0], article[1], article[2],article[3]] = this.news[i].split("|");
                curnews.author = article[2];
                curnews.title = article[0];
                curnews.pubDate = article[3];
                curnews.link = article[1];
                this.totalnews[i]= curnews;
                console.log(this.totalnews[i]);
            }
        }
        if($event.nextId === 'History' && this.historycount == 0){
            this.historycount = 1;
            var data = new Array();
            var timestamp = this.stock.timedata.reverse();
            var price = this.stock.pricearr;
            
            for(var i = 0; i < this.stock.timedata.length;i++){
                var times = new Date(timestamp[i]);
                data[i] = [times.valueOf(),price[i]];
            }
            console.log(data);
            this.history = {
                title: {
                    text: this.stock.symbol+' Stock Price'
                },
                subtitle:{
                    text: this.subtitle,
                    useHTML: true,
                },
                rangeSelector:{
                    buttons: [{
                        type:'day',
                        count:7,
                        text:'1w'
                    },
                    {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
                },
                series: [{
                    name: this.stock.symbol+' Stock Price',
                    data: data,
                    type: 'area',
                    // threshold: null,
                    tooltip: {
                        valueDecimals: 2
                    },
                    }
                ],
            }
        }
    }
}