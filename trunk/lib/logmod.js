/**
 * JavaScript Document
 * log.js
 * Record the requests from mobile
 * 
 * Author: Andy
 * 
 * Usage:
 *  var log = require ('./lib/logmod.js');
 *  log.insertSmwlog({idx:76,name:"a5"}); 
 *  log.insertSmwlog(data); 
 * 
 * 
 */
var db = require("mongojs").connect(global.mongodburl, global.collections );

exports.insertSmwlog = function (data)
{
	/*
	 * datas = 
	{ rt: 'android_app',
			  v: '4.1.6',
			  i: '192.168.1.104',
			  u: 'Mozilla/5.0 (Linux; U; Android 4.2.1; zh-cn; R815T Build/JOP40D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
			  u2: 'Mozilla/5.0 (Linux; U; Android 4.2.1; zh-cn; R815T Build/JOP40D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
			  s: '4f0e0dd406d55adb94f2af118ecd3028',
			  o: '869191011026777',
			  o2: 'null',
			  t: '0',
			  connection_type: 'WIFI',
			  listads: '',
			  latitude: '0.0',
			  longitude: '0.0',
			  phonenumber: '',
			  phonemac: '8c:0e:e3:bc:25:da',
			  providersName: '中国移动',
			  screenWidth: '800',
			  screenHeight: '480',
			  cpu: 'ARMv7 Processor rev 2 (v7l)',
			  density: '1.5',
			  densityDpi: '240',
			  phoneModel: 'R815T:R815T:OPPO89T_13009',
			  simType: 'GSM',
			  "c.mraid": '1',
			  sdk: 'banner',
			  u_wv: 'Mozilla/5.0 (Linux; U; Android 4.2.1; zh-cn; R815T Build/JOP40D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'};
	delete(datas.c.mraid);
	 * 
	 * 
	 * */
	
	db.requests.insert(data);
}

