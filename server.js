var request = require("request");
var express = require("express");
var app = express();
var parser = require('xml2json');
var cors = require('cors');
var moment = require('moment-timezone');

app.use(cors());//处理跨域


var totalDays = 121;
var historyDays = 1000;


// --------------------------------------

function getnews(symbol, callback) {
	var resnews = new Object();
	var news = new Array();
	var newsurl = "https://seekingalpha.com/api/sa/combined/"+symbol+".xml";
	request.get(newsurl, (error, res, body) => {
		console.log('error:', error);
		console.log('statusCode:',res && res.statusCode);
		console.log(typeof(body));
		console.log("-----------------------");
		json = JSON.parse(parser.toJson(body));	 // toJson之后是string, Json.parse之后是Object	
		var title = new Array();
		var link = new Array();
		var author = new Array();
		var pubDate = new Array();
		var i = 0;
		var k = 0;
		while (k < json["rss"]["channel"]["item"].length) {
			var checklink = json["rss"]["channel"]["item"][k]["link"];
			var index = checklink.indexOf("article"); // indexOf 判断article
			if ( index > 0) { 
				title[i] = json["rss"]["channel"]["item"][k]["title"];
				link[i] =  json["rss"]["channel"]["item"][k]["link"];
				author[i] = "Author:" + json["rss"]["channel"]["item"][k]["sa:author_name"];
				if(json["rss"]["channel"]["item"][k]["pubDate"].split('-')[1][2]==4){
					pubDate[i] = "Date:" + json["rss"]["channel"]["item"][k]["pubDate"].substring(0, 25)+" EDT";

				}else {
					pubDate[i] = "Date:" + json["rss"]["channel"]["item"][k]["pubDate"].substring(0, 25) + " EST";
				}
				news[i] = title[i]+"|"+link[i] + "|"+author[i]+"|"+pubDate[i];
				i++;
			}
			// if(i >=5 ) {
			// 	break;
			// }
			k++;
		}
		console.log("finished newsdata of "+symbol);
		resnews.news = news;
		callback(resnews);
	});
};
//------------------------------------------------

// get information table 

function getdatainfo(symbol,callback){
	console.log("let's get tableinfo");
	var stockurl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+symbol+"&outputsize=full&apikey=3NIC8IVGE6DD5ILQ";
	request.get(stockurl, (error, res, body) => {
		console.log('error:', error);
		console.log('statusCode:',res && res.statusCode);
		console.log("-----------------------");
		var tableinfo = new Object();
		// for the information table
		var json;
		if(res.statusCode!=200){
			callback(json);
		}else{
			json = JSON.parse(body);
			if(!json.hasOwnProperty('Meta Data')){
				callback(json);
			} else {
			console.log(Object.keys(json));
			var pclose;
			var close;
			var dayrange;
			var high;
			var low;
			var volume;
			var timestamp;
			var timestamptotal;
			var change;
			var open;
			timestamp = json['Meta Data']['3. Last Refreshed'].substring(0,10);
			if(json['Meta Data']['3. Last Refreshed'].length < 11){
				timestamptotal = json['Meta Data']['3. Last Refreshed']+" 16:00:00 EST"
				// outisde the trading our is 16:00:00
			} else {
				timestamptotal = json['Meta Data']['3. Last Refreshed'] + "EST";
			}
		    close = json['Time Series (Daily)'][timestamp]['4. close'];
			open = json['Time Series (Daily)'][timestamp]['1. open'];
			low = json['Time Series (Daily)'][timestamp]['3. low'];
			high = json['Time Series (Daily)'][timestamp]['2. high'];
			volume = json['Time Series (Daily)'][timestamp]['5. volume'];
			var i = 0;
			for(var k in json['Time Series (Daily)']){
				pclose = json['Time Series (Daily)'][k]['4. close'];
				i++;
				if( i >1){
					break;
				}
			}
			change = 100 * (close - pclose)/pclose;
			tableinfo.open = parseFloat(open).toFixed(2);
			tableinfo.close = parseFloat(close).toFixed(2);
			tableinfo.volume = parseFloat(volume).toLocaleString();
			tableinfo.change = (close - pclose).toFixed(2) + "(" + change.toFixed(2)+"%)";
			tableinfo.pclose = parseFloat(pclose).toFixed(2);
			tableinfo.dayrange = parseFloat(low).toFixed(2)+"-"+parseFloat(high).toFixed(2);
			tableinfo.timestamp = timestamptotal;
			// for the highchart price
			var ydata_price = new Array();
			var ydata_vol = new Array();
			var xdata = new Array();
			i = 0;
			for(var k in json['Time Series (Daily)']) {
				ydata_vol[totalDays-i-1] = parseFloat(json['Time Series (Daily)'][k]['5. volume']);
				i++ ;
				if(i >= totalDays){
					break;
				}
			}
			i = 0;
			for(var k in json['Time Series (Daily)'] ) {
				ydata_price[historyDays-i-1] = parseFloat(json['Time Series (Daily)'][k]['4. close']);
				xdata[i] = k;
				i++;
				if(i >= historyDays){
					break;
				}
			}

			tableinfo.xdata = xdata;
			tableinfo.ydatavol = ydata_vol;
			tableinfo.ydataprice = ydata_price;
			console.log("finished getdatainfo of "+symbol);
			callback(tableinfo);
	    }
	   }
 	});
}


//----------------------------------
// get indicator 
app.get("/detail",function(req,res) {
	if(req.query.symbol != '' && req.query.ind == 'true')
	{   
		console.log("调用indicator"+req.query.indi);
		if(req.query.indi ==='STOCH'){
			setTimeout(function(){
				getdataindicatorII(req.query.symbol, req.query.indi, function(resindicator){
				res.send(resindicator);
				})},1000);
		} else if(req.query.indi ==='MACD' || req.query.indi === 'BBANDS'){
			setTimeout(function(){
				getdataindicatorIII(req.query.symbol, req.query.indi, function(resindicator){
					res.send(resindicator);
				})},1000);
		} else{
			setTimeout(function(){
				getdataindicatorI(req.query.symbol, req.query.indi, function(resindicator){
					res.send(resindicator);
				})},1000);
		}
	} else if(req.query.news === 'true') {
		console.log("调用news");
		setTimeout(function(){
			getnews(req.query.symbol, function(resnews){
				res.send(resnews);
			})
		},1000);

	} else {
		console.log("调用info");
		setTimeout(function(){
			getdatainfo(req.query.symbol,function(tableinfo){
			res.send(tableinfo);
			})},1000);	
	}
});

// get the indicator data for single line
function getdataindicatorI(symbol, func, callback) { 
	var resindicator = new Object();
	var indicatorurl = "https://www.alphavantage.co/query?function="+func+"&symbol=" + symbol + 
	"&interval=daily&time_period=10&series_type=close&apikey=3NIC8IVGE6DD5ILQ";
	request.get(indicatorurl, (error, res, body) => {
		console.log('error:', error);
		console.log('statusCode:',res && res.statusCode);
		console.log("-----------------------");
		var ydataindicator = new Array();
		if(res.statusCode!=200){
			resindicator[func] = ydataindicator;
			callback(resindicator);
		} else {
			var json = JSON.parse(body);
			var name = "Technical Analysis: " + func ;
			var i = 0;
			console.log(symbol+" should have the " + func + Object.keys(json));
			
			for(var k in json[name]){
				ydataindicator[i] = json[name][k][func];
				i++;
				if( i >= totalDays){
					break;
				}
			}
			console.log("finished download " + func);
			console.log("the first data is " + ydataindicator[0]);
			resindicator[func] = ydataindicator;
			callback(resindicator);
		}
	});
}
// get the indicator data for double line 
function getdataindicatorII(symbol,func,callback) { 
	var resindicator = new Object();
	var indicatorurl = "https://www.alphavantage.co/query?function="+func+"&symbol=" + symbol + 
	"&interval=daily&time_period=10&series_type=close&apikey=3NIC8IVGE6DD5ILQ";
	request.get(indicatorurl, (error, res, body) => {
		console.log('error:', error);
		console.log('statusCode:',res && res.statusCode);
		console.log("-----------------------");
		var ydataindicator = new Array();
		if(res.statusCode!=200){
			resindicator[func] = ydataindicator;
			callback(resindicator);
		} else {
			var json = JSON.parse(body);
			var name = "Technical Analysis: " + func ;
			
			var i = 0;
			for(var k in json[name]) {
				ydataindicator[i] = json[name][k]['SlowD']+" "+json[name][k]['SlowK'];
				i++;
				if(i >= totalDays){
					break;
				}
			}
			console.log("finished download " + func);
			console.log("the first data is " + ydataindicator[0]);
			resindicator[func] = ydataindicator;
		 	callback(resindicator);
		 }
	 });
}

// get the indicator data for triple line
function getdataindicatorIII(symbol, func, callback) {
	var resindicator = new Object();
	var indicatorurl = "https://www.alphavantage.co/query?function="+func+"&symbol=" + symbol + 
	"&interval=daily&time_period=10&series_type=close&apikey=3NIC8IVGE6DD5ILQ";
	request.get(indicatorurl, (error, res, body) => {
		console.log('error:', error);
		console.log('statusCode:',res && res.statusCode);
		console.log("-----------------------");
		var ydataindicator = new Array();
		if(res.statusCode !=200){
			resindicator[func]=ydataindicator;
			callback(resindicator);
		}else{
			var json = JSON.parse(body);
			var name = "Technical Analysis: " + func ;
			
			var i = 0; 
			var line = new Array();
			if(func === "BBANDS"){
				line[0] = "Real Lower Band";
				line[1] = "Real Upper Band";
				line[2] = "Real Middle Band";
			} else {
				line[0] = "MACD_Signal";
				line[1] = "MACD_Hist";
				line[2] = "MACD";
			}
			for(var k in json[name]) {
				ydataindicator[i] = json[name][k][line[0]] + " " + json[name][k][line[1]] + " "
				+ json[name][k][line[2]];
				i++;
				if(i >= totalDays){
					break;
				}
			}
			console.log("finished download " + func);
			console.log("the first data is " + ydataindicator[0]);
		    resindicator[func] = ydataindicator;
		    callback(resindicator);
		}
	});
}

// data for autocomplete 

function getdataauto(symbol,callback) {
	var res_search = new Object();
	var url =
  	"http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input="+symbol;
	request.get(url, (error, response, body) => { // 箭头函数
		console.log('error:', error);
		console.log('statusCode:',response && response.statusCode);
		console.log("-----------------------");
		var searchresult = new Array();
		if(response.statusCode!=200){
			res_search.searchresult = searchresult;
			callback(res_search);
		}else{
		var json = JSON.parse(body);
		
		var k = 0;
		while(k < json.length){
		  	searchresult[k] = json[k].Symbol + "-" + json[k].Name + " " + "(" +
			json[k].Exchange + ")";
			k++;
		}
		res_search.searchresult = searchresult;
		console.log("finished download company name " + symbol);
		callback(res_search);
	}
	});	
}

app.get("/index",function(req,res){
	// console.log(req.hostname + " request for " + req.query.symbol);
	getdataauto(req.query.symbol, function(res_search){ // 用一个回调函数
		res.send(res_search);
	});
});

// data for refreshtable
function getfavorite(symbol, callback){
	var stockinfo = new Object()
	var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+symbol+"&apikey=3NIC8IVGE6DD5ILQ";
	request.get(url, (err,res,body) => {
		if(res.statusCode != 200){
			callback(stockinfo);
		}else{

		var json = JSON.parse(body);
		if(!json.hasOwnProperty('Meta Data')){
			callback(stockinfo)
		} else {
			console.log(Object.keys(json));
			console.log(url);
			var close;
			var change;
			var volume;
			var pclose;
			var timestamp;
			timestamp = json['Meta Data']['3. Last Refreshed'].substring(0,10);
			close = json['Time Series (Daily)'][timestamp]['4. close'];
			volume = json['Time Series (Daily)'][timestamp]['5. volume'];
			volume = parseFloat(volume).toLocaleString();
			var i = 0;
			for(var k in json['Time Series (Daily)']){
				pclose = json['Time Series (Daily)'][k]['4. close'];
				i++;
				if( i >1){
					break;
				}
			}
			change = 100 * (close - pclose)/pclose;
			change = (close - pclose).toFixed(2) + "(" + change.toFixed(2)+"%)";
			close = parseFloat(close).toFixed(2);
			
			stockinfo.stock = symbol + "|" + close + "|" + change + "|" + volume;
			console.log("download favorite stock of  "+ symbol);
			callback(stockinfo);
		}
	}
	});
		
}
app.get("/favorite",function(req,res){
	getfavorite(req.query.symbol, function(stockinfo){
		res.send(stockinfo);
	});
});

app.listen(4201);