
exports.index = function(req, res){
  //res.render('index', { title: 'Express' });//使用views/index.ejs作为模板
	//global.fun.clientConnectionReady(global.client);
	
	//var mysqlclient=global.mysqlclient;
	var request=new F(req, res,global.mysqlclient);
	request.prepare_r_hash();
	var data=req.query;
	//console.log(global.request_settings["request_hash"]);
	
	//console.log(req.connection.remoteAddress);
	console.log(data);
	//console.log(typeof(req.query.j)=='undefined');
	//res.end(JSON.stringify({testkey:"这是一个Value诶"}));
	//console.log(req);
	if(typeof(data.rt)=='undefined'){
		data.rt='';
	}
	if(typeof(data.p)=='undefined'){
		request.request_settings['referer']='';
	}else{
		request.request_settings['referer']=data.p;
	}
	if(typeof(data.longitude)=='undefined'){
		request.request_settings['longitude']='';
	}else{
		request.request_settings['longitude']=data.longitude;
	}
	if(typeof(data.latitude)=='undefined'){
		request.request_settings['latitude']='';
	}else{
		request.request_settings['latitude']=data.latitude;
	}
	if(typeof(data.iphone_osversion)!='undefined'){
		request.request_settings['iphone_osversion']=data.iphone_osversion;
	}
	if(typeof(data.sdk)=='undefined' || (data.sdk!='banner'&& data.sdk!='vad')){
		request.request_settings['sdk']='banner';
	}else{
		request.request_settings['sdk']=data.sdk;	
	}
	if(typeof(data.screenWidth)!='undefined'&&data.screenWidth!=''){
		request.request_settings['screenWidth']=data.screenWidth;
	}else{
		request.request_settings['screenWidth']=1000;
	}
	if(typeof(data.screenHeight)!='undefined'&&data.screenWidth!=''){
		request.request_settings['screenHeight']=data.screenHeight;
	}else{
		request.request_settings['screenHeight']=2000;
	}
	if(typeof(data.showanimation)!='undefined'){
		request.request_settings['showanimation']=data.showanimation;
	}else{
		request.request_settings['showanimation']=0;
	}
	switch(data.rt){
	case 'javascript':
		request.request_settings['response_type']='json';
		request.request_settings['ip_origin']='fetch';
	break;

	case 'json':
		request.request_settings['response_type']='json';
		request.request_settings['ip_origin']='fetch';
	break;

	case 'iphone_app':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='fetch';
	break;

	case 'android_app':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='fetch';
	break;

	case 'ios_app':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='fetch';
	break;

	case 'ipad_app':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='fetch';
	break;

	case 'xml':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='request';
	break;

	case 'api':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='request';
	break;

	case 'api-fetchip':
		request.request_settings['response_type']='xml';
		request.request_settings['ip_origin']='fetch';
	break;

	default:
		request.request_settings['response_type']='html';
		request.request_settings['ip_origin']='request';
	break;
	}
	
	if(typeof(data.adid)!='undefined'){//音频识别
		request.request_settings['adid']=data.adid;
	}else{
		request.request_settings['adid']='';
	}
	if(!request.check_input(data)){
		
		request.print_error(1, request.errormessage, request.request_settings['sdk'], 1);
		return false;
	}
	//global.zone_detail=global.get_placement(data);
	var as= require('async');
	//global.as = Async();
	var d=new Date();
	console.log(d.getHours()+':'+d.getMinutes()+':'+d.getSeconds());
	//console.log(request.request_settings);
	as.auto({
		checkmysqlconnect:function(callback){
		
		global.clientConnectionReady(global.mysqlclient,callback);
		
		},
		getplacement:['checkmysqlconnect',function(callback){
			
			request.get_placement(data,request,callback);
			
		 /*setTimeout(function(){
			 global.get_placement(data,callback);
            // callback();
         }, 5000);*/
		}],
		getchannel:['getplacement',function(callback){
			if(request.zone_detail.length==0){
				request.print_error(1, request.errormessage, request.request_settings['sdk'], 1);
				return false;
			}
				//console.log(request.zone_detail);
				request.getchannel(callback);
				//console.log(global.request_settings['channel']);
				//callback();
	        }],
		update_last_request:['getchannel',function(callback){
			//console.log(request.zone_detail);
			//console.log(request.request_settings);
			
			request.request_settings['adspace_width']=request.zone_detail.zone_width;
			request.request_settings['adspace_height']=request.zone_detail.zone_height;
			request.update_last_request();
			callback();
			//console.log(request.request_settings);
        }],
		set_geo:['update_last_request',function(callback){
			request.set_geo(callback);
		}],
		set_device:['set_geo',function(callback){
			//console.log(global.request_settings['user_agent']);
			if(!request.set_device()){
				return;
			}
			//console.log(request.request_settings);
			callback();
		}],
		check_cron_active:['set_device',function(callback){
			request.check_cron_active(request,callback);
			//console.log(request.request_settings);
		}],
		build_query:['check_cron_active',function(callback){
			//console.log(request.request_settings);
			request.build_query();
			//console.log(request.request_settings);
			/*var fs = require('fs');
			 var b1 = new Buffer(global.request_settings['campaign_query']);
			fs.writeFile('d:/resut.txt',b1,function(err){
				 if(err) throw err;
			        console.log('has finished');
			});*/
			
			callback();
		}],
		launch_campaign_query:['build_query',function(callback){
			
			request.launch_campaign_query(request,callback);
			//console.log(global.request_settings['final_ad']);
		}],
		select_adunit_query:['launch_campaign_query',function(callback){
			//console.log(request.request_settings['final_ad']);
			if(!request.request_settings['final_ad']){
				request.print_error(1, 'no found campaign', request.request_settings['sdk'], 1);
				return false;
			}
			request.select_adunit_query(request,callback);
		}],
		build_ad:['select_adunit_query',function(callback){
			//console.log(request.request_settings['ad_unit']);
			if(!request.request_settings['ad_unit']){
				//launch_backfill();
				request.print_error(1, 'no found adunit', request.request_settings['sdk'], 1);
				return false;
			}
			//var obj={'a':2,'b':1};
			//console.log(global.request_settings['ad_unit']['adv_id']);
			//console.log(obj.a);
			request.request_settings['ad_unit']['adv_type']=parseInt(request.request_settings['ad_unit']['adv_type']);
			if(!request.build_ad(1,request.request_settings['ad_unit'])){
				//launch_backfill();
			}
			//console.log(request.display_ad);

			request.request_settings['active_campaign_type']='normal';
			request.request_settings['active_campaign']=request.request_settings['ad_unit']['campaign_id'];
			callback();
		}],
		display_ad:['build_ad',function(callback){
			//console.log(request.display_ad);
				if (typeof(request.display_ad['available'])!='undefined' && request.display_ad['available']==1){
					request.track_request(1);
					request.display_ad_();
				}
				else {
					request.track_request(0);
					request.print_error(0, '', request.request_settings['sdk'], 1);
				}
				//callback();
				//client.end(); 
				//number:23
				//console.log(number);
		}],
		disconnectmysql:['display_ad',function(callback){
			//delete(global.req);
			//client.end(); 
			return;
		}]
		}
	);

	
	//global.request_settings['channel']=global.getchannel();
};