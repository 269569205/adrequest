
exports.request=function(req, res,mysqlclient){
	this.MAD_INTERSTITIALS_EXACTMATCH=true;
	this.MAD_CLICK_ALWAYS_EXTERNAL=false;
	this.SERVER_URL=global.SERVER_URL;
	this.SITE_URL=global.SITE_URL;
	this.timestamp=parseInt((new Date).getTime()/1000);
	this.request_settings=[];
	this.zone_detail=[];
	this.res=res;
	this.req=req;
	this.client=mysqlclient;
	this.prepare_r_hash=function(){
		this.request_settings['request_hash']=md5(uniqid(new Date().getTime()));
	}
	this.print_error=function(type, message, sdk_type, e){
		this.prepare_response();
		switch (this.request_settings['response_type']){
			
		case 'html':
		
		if (type==0){
			
			this.res.write('<!-- No Ad Available -->');
		}
		else {
			this.res.write('<!-- '+message+' -->');
		}
		//console.log(message);
		break;
		
		case 'xml':
		
		if (type==0){
			this.res.write('<error>No Ad Available</error>');
		}
		else {
			this.res.write('<error>'+message+'</error>');
		}
		
		break;
		
		case 'json':
		// Do Nothing - Return Blank Page
		break;
			
			
		}
		
		if (e==1){
			this.res.end();
			//process.exit(1);
		}
	}
	this.prepare_response=function(){
		switch (this.request_settings['response_type']){
		
		case 'xml':
			//console.log(res.finished);
			this.res.setHeader('Content-Type',"text/xml");
			this.res.write("<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n");
		break;	
		
		}
	}
	this.check_input=function(data){
		this.prepare_ip(data);
		
		if (typeof(this.request_settings['ip_address'])=='undefined' || !is_valid_ip(this.request_settings['ip_address'])){
			this.errormessage='Invalid IP Address';
		return false;
		}
		
		if (typeof(data.s)=='undefined' || data.s=='' || !validate_md5(data.s)){
			this.errormessage='No valid Integration Placement ID supplied. (Variable "s")';
		return false;
		}
		
		this.request_settings['placement_hash']=data.s;
		
		this.prepare_ua(data);
		
		if (typeof(this.request_settings['user_agent'])=='undefined' || this.request_settings['user_agent']==''){
			this.errormessage='No User Agent supplied. (Variable "u")';
		return false;
		}
		
		return true;
	}
	this.prepare_ip=function(data){
		
		switch (this.request_settings['ip_origin']){
		case 'request':
		if (typeof(data.i)!='undefined'){
			this.request_settings['ip_address']=data['i'];
		}
		break;
		
		case 'fetch':
		
		var forwarded_ip = this.check_forwarded_ip(data);
		//console.log(data.i);
		if (forwarded_ip){
			this.request_settings['ip_address']=forwarded_ip;
		}
		else {
			this.request_settings['ip_address']=this.req.connection.remoteAddress;
		
		}
		}
		//console.log(global.request_settings['ip_address']);
	}
	this.check_forwarded_ip=function(data){
	
		if (isset(this.req.header('x-forwarded-for')) && this.req.header('x-forwarded-for')!=''){
		var res_array = this.req.header('x-forwarded-for').split(","); 
		return res_array[0];
		}
		
		/*if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
		$res_array = explode(",", $_SERVER['HTTP_X_FORWARDED_FOR']);
		return $res_array[0]; 
		}*/
		return false;
	}
	this.prepare_ua=function(data){
		//console.log(  this.req.header('User-Agent'));
		if (typeof(this.req.header('User-Agent'))!="undefined" && this.req.header('User-Agent')!=''){
			this.request_settings['user_agent']=this.req.header('User-Agent');
		}
		else if (typeof(data.u)!="undefined" && data.u!=''){
			
			this.request_settings['user_agent']=data.u;
		}
	
	
	}
	this.get_placement= function(data,request,callback){
	var query="SELECT entry_id,creator_id, publication_id, zone_type, zone_width, zone_height, zone_refresh, zone_channel, zone_lastrequest, mobfox_backfill_active, mobfox_min_cpc_active, min_cpc, min_cpm, backfill_alt_1, backfill_alt_2, backfill_alt_3 FROM md_zones WHERE zone_hash='"+this.request_settings['placement_hash']+"'";
			var results=this.client.query(query,function selectCb(err, results, fields) {  
		    if (err) {  
		    	//throw err;  
		    	global.mysqlclient=this.client=require('mysql').createConnection({'host':'localhost','port':3306,'user':global.mysqlroot,'password':global.mysqlpwd});
		    	this.get_placement(data,request,callback);
			  }    
			 if(!results || results.length==0){
				 request.errormessage='Placement not found. Please check your Placement Hash (Variable "s")';
				
				
			 }else{
				// console.log(this.parent)
			  request.zone_detail=results[0];
			 // console.log(  request.zone_detail);
			 // global.Cache.set($query,results[0]);
			 }
			 callback(); return;
			});
	
	
	}
	this.getchannel=function(callback){

		if (this.zone_detail.zone_channel!=''){
			this.request_settings['channel']=this.zone_detail.zone_channel;
			 callback();
		}
		else {
			this.get_publication_channel(this,this.zone_detail['publication_id'],callback);
		
		}
	
	}
	this.get_publication_channel=function(request,publication_id,callback){
		var query="SELECT inv_defaultchannel,creator_id FROM md_publications WHERE inv_id='"+publication_id+"'";

		this.client.query(query,function selectCb(err, results, fields) {  
		    if (err) {  
		    	throw err;  
			  }  
		    //console.log(results);
		    if(!results || results.length==0){
		    	request.request_settings['channel']=0;
				
				 
			 }else {
				 //console.log(results);
				 request.request_settings['channel']=results[0].inv_defaultchannel;
				 request.request_settings['creator_id']=results[0].creator_id;	   
				}
		     callback();return;
			  });


	}
	this.update_last_request=function(){

		
		var lastreq_dif=0;
		if (this.zone_detail.zone_lastrequest>0){
		 lastreq_dif=this.timestamp-this.zone_detail.zone_lastrequest;
		}
		//console.log(this.timestamp+ ' '+this.zone_detail.zone_lastrequest);
		//console.log(lastreq_dif);
		if (lastreq_dif>=600 || this.zone_detail.zone_lastrequest<1){
			this.client.query("UPDATE md_zones set zone_lastrequest='"+this.timestamp+"' where entry_id='"+this.zone_detail.entry_id+"'");
			this.client.query("UPDATE md_publications set md_lastrequest='"+this.timestamp+"' where inv_id='"+this.zone_detail.publication_id+"'");
			//global.client.query($query,function selectCb(err, results, fields) {  
			
	
		}
	

	}
	this.set_geo=function(callback){
		var geoip=require("geoip-lite-with-city-data/lib/geoip");
		var geo=geoip.lookup(this.request_settings['ip_address']);
		//geo.open({cache: true, filename: './GeoLiteCity.dat'});
		if(geo){
			this.request_settings['geo_country']=geo.country;
			this.request_settings['geo_region']=geo.region;
		}else{
			this.request_settings['geo_country']='';
			this.request_settings['geo_region']='';
		}
		callback();
	}
	this.set_device=function(){
		var user_agent=this.request_settings['user_agent'];
		var zone_detail=this.zone_detail;
		var ua 	 = require('mobile-agent/lib/mobile');
		var detect = ua(user_agent);
		var temp=[];
		//console.log(agent);
		if (detect.iPhone) {
			temp['device_os']=detect.iOS;
			temp['main_device']='IPHONE';
			}
				
			else if (detect.iPad) {
			temp['device_os']=detect.iOS;
			temp['main_device']='IPAD';
			}
	
			else if (detect.iPod) {
			temp['device_os']=detect.iOS;
			temp['main_device']='IPOD';
			}
	
			else if(detect.Android){
			temp['device_os']=detect.Android;
			temp['main_device']='ANDROID';
			}
	
			else if(detect.Mobile){
			temp['main_device']='OTHER';
			}
	
			else {
			temp['main_device']='NOMOBILE';
			this.print_error(1, 'This ad-server does not serve ads to non-mobile devices.', this.request_settings['sdk'], 1);
			return false;	
			}
		//console.log(temp);
		if (typeof(temp['device_os'])!='undefined' && temp['device_os']!=''){
			this.request_settings['device_os']=temp['device_os'];
		}
		this.request_settings['main_device']=temp['main_device'];
		return true;
	}
	
	this.check_cron_active=function(request,callback){
	var query="select var_value from md_configuration where var_name='last_limit_update'";
	this.client.query(query,function selectCb(err, results, fields) {  
    if (err) {  
    	throw err;  
	  }  
    //console.log(results);
    if(!results || results.length==0){
    	request.request_settings['cron_active']=false;
		
		 
	 }else {
		 var timestamp=this.timestamp;
		 if(results[0].var_value==null || results[0].var_value=='' || results[0].var_value<=0){
			 request.request_settings['cron_active']=false;
		 }else{
			 var d=timestamp-results[0].var_value;
			 //console.log(d);
			 if(d>87000){
				 request.request_settings['cron_active']=false;
			 }else{
				 request.request_settings['cron_active']=true;
			 }
		 }
		 
		 
	 }
		
    callback();return;
	});
	
	}
	this.build_query=function(){
	var request_settings=this.request_settings;
	var zone_detail=this.zone_detail;
	var query_part=[];
	if (typeof(request_settings['geo_country'])!='undefined' && request_settings['geo_country']!='' && typeof(request_settings['geo_region'])!='undefined' && request_settings['geo_region']!=''){
		query_part['geo']=" OR (c1.targeting_type='geo' AND (c1.targeting_code='"+request_settings['geo_country']+"' OR c1.targeting_code='"+request_settings['geo_country']+"_"+request_settings['geo_region']+"')))";	
		}
		else if (typeof(request_settings['geo_country'])!='undefined' && request_settings['geo_country']!=''){
		query_part['geo']=" OR (c1.targeting_type='geo' AND c1.targeting_code='"+request_settings['geo_country']+"'))";		
		}
		else {
		query_part['geo']=')';	
		}

		if (typeof(request_settings['channel'])!='undefined' && (request_settings['channel'])){
		query_part['channel']="AND (md_campaigns.channel_target=1 OR (c2.targeting_type='channel' AND c2.targeting_code='"+request_settings['channel']+"'))";
		}
		else {
		query_part['channel']='';
		}

		query_part['placement']="AND (md_campaigns.publication_target=1 OR (c3.targeting_type='placement' AND c3.targeting_code='"+zone_detail.entry_id+"'))";

		query_part['misc']="AND md_campaigns.campaign_status=1 AND md_campaigns.campaign_start<='"+date('Y-m-d')+"' AND md_campaigns.campaign_end>'"+date('Y-m-d')+"'";

		switch (request_settings['main_device']){
			
		case 'IPHONE':
		query_part['device']='AND (md_campaigns.device_target=1 OR md_campaigns.target_iphone=1)';
		break;

		case 'IPOD':
		query_part['device']='AND (md_campaigns.device_target=1 OR md_campaigns.target_ipod=1)';
		break;

		case 'IPAD':
		query_part['device']='AND (md_campaigns.device_target=1 OR md_campaigns.target_ipad=1)';
		break;

		case 'ANDROID':
		query_part['device']='AND (md_campaigns.device_target=1 OR md_campaigns.target_android=1)';
		break;

		default:
		query_part['device']='AND (md_campaigns.device_target=1 OR md_campaigns.target_other=1)';
		break;
		}

		if (request_settings['main_device']!='OTHER' && request_settings['main_device']!='NOMOBILE'){
		switch (request_settings['main_device']){

		case 'IPHONE':
		case 'IPOD':
		case 'IPAD':
		if (typeof(request_settings['device_os'])!='undefined' && (request_settings['device_os'])){
		query_part['osversion']="AND ((md_campaigns.ios_version_min<='"+request_settings['device_os']+"' OR md_campaigns.ios_version_min='') AND (md_campaigns.ios_version_max>='"+request_settings['device_os']+"' OR md_campaigns.ios_version_max=''))";
		}
		else {
		query_part['osversion']="AND (md_campaigns.ios_version_min='' AND md_campaigns.ios_version_max='')";	
		}
		break;

		case 'ANDROID':
		if (typeof(request_settings['device_os'])!='undefined' && (request_settings['device_os'])){
		query_part['osversion']="AND ((md_campaigns.android_version_min<='"+request_settings['device_os']+"' OR md_campaigns.android_version_min='') AND (md_campaigns.android_version_max>='"+request_settings['device_os']+"' OR md_campaigns.android_version_max=''))";
		}
		else {
		query_part['osversion']="AND (md_campaigns.android_version_min='' AND md_campaigns.android_version_max='')";	
		}
		break;

		}
		}
		else {
		query_part['osversion']="";
		}

		switch (zone_detail.zone_type){
		case 'banner':
		query_part['adunit']="AND (md_campaigns.campaign_type='network' OR (md_ad_units.adv_status=1 AND md_ad_units.adv_width<="+zone_detail.zone_width+" AND md_ad_units.adv_height<="+zone_detail.zone_height+"))";
		break;

		case 'interstitial':
		if (true){
		query_part['adunit']="AND (md_campaigns.campaign_type='network' OR (md_ad_units.adv_status=1 AND md_ad_units.adv_width=320 AND md_ad_units.adv_height=480))";
		} else {
		query_part['adunit']="AND (md_campaigns.campaign_type='network' OR (md_ad_units.adv_status=1 AND md_ad_units.adv_width<=320 AND md_ad_units.adv_height<=480))";
		}
		break;
		}

		query_part['limit']="AND (md_campaign_limit.total_amount_left='' OR md_campaign_limit.total_amount_left>=1)";
		
		if (!request_settings['cron_active']){
		query_part['limit']="AND ((md_campaign_limit.total_amount_left='' OR md_campaign_limit.total_amount_left>=1) OR (md_campaign_limit.cap_type=1))";
		}

		if(request_settings['adid']){
			query_part['code']="AND (co.adid='"+request_settings['adid']+"')";
		}else{
			query_part['code']='';
		}

		/*$request_settings['campaign_query']="select md_campaigns.campaign_id, md_campaigns.campaign_priority, md_campaigns.campaign_type, md_campaigns.campaign_networkid from md_campaigns LEFT JOIN md_campaign_targeting c1 ON md_campaigns.campaign_id = c1.campaign_id LEFT JOIN md_campaign_targeting c2 ON md_campaigns.campaign_id = c2.campaign_id LEFT JOIN md_campaign_targeting c3 ON md_campaigns.campaign_id = c3.campaign_id LEFT JOIN md_ad_units ON md_campaigns.campaign_id = md_ad_units.campaign_id LEFT JOIN md_campaign_limit ON md_campaigns.campaign_id = md_campaign_limit.campaign_id where (md_campaigns.country_target=1".$query_part['geo']." ".$query_part['channel']." ".$query_part['placement']." ".$query_part['misc']." ".$query_part['device']." ".$query_part['osversion']." ".$query_part['adunit']." ".$query_part['limit']." group by md_campaigns.campaign_id";*/
		this.request_settings['campaign_query']="select md_campaigns.campaign_id, md_campaign_limit.cost_type,money,md_campaign_limit.price,md_campaigns.campaign_priority, md_campaigns.campaign_type, md_campaigns.campaign_networkid from md_campaigns LEFT JOIN md_campaign_targeting c1 ON md_campaigns.campaign_id = c1.campaign_id LEFT JOIN md_campaign_targeting c2 ON md_campaigns.campaign_id = c2.campaign_id LEFT JOIN md_campaign_targeting c3 ON md_campaigns.campaign_id = c3.campaign_id LEFT JOIN md_ad_units ON md_campaigns.campaign_id = md_ad_units.campaign_id LEFT JOIN md_campaign_limit ON md_campaigns.campaign_id = md_campaign_limit.campaign_id left join md_campaign_code co on md_campaigns.campaign_id=co.campaign_id where (md_campaigns.country_target=1 and money>0"+query_part['geo']+" "+query_part['channel']+" "+query_part['placement']+" "+query_part['misc']+" "+query_part['device']+" "+query_part['osversion']+" "+query_part['adunit']+" "+query_part['limit']+" "+query_part['code']+" group by md_campaigns.campaign_id";


		return true;	
			
	}
	  this.launch_campaign_query=function(request,callback){
		 var campaignarray = [];
		 this.client.query(this.request_settings['campaign_query'],function selectCb(err, results, fields) {  
	    if (err) {  
	    	throw err;  
		  }  
	    //console.log(results);
	    if(!results || results.length==0){
	    	request.request_settings['final_ad']=null;
		 }else {
			 for(var i=0;i<results.length;i++){
			 var add=[];
			 add['campaign_id']=results[i].campaign_id;
			 add['priority']=results[i].campaign_priority;
			 add['type']=results[i].campaign_type;
			 add['network_id']=results[i].campaign_networkid;
			 add['cost_type']=results[i].cost_type;
			 add['money']=results[i].money;
			 add['price']=results[i].price;
			 campaignarray.push(add);
			 }
			/* var campaign_id=priority=type=network_id=[];
			 for(var i in campaignarray){
				 campaign_id[i]  = campaignarray[i]['campaign_id'];
				 priority[i] = campaignarray[i]['priority'];
				  type[i] = campaignarray[i]['type'];
				  network_id[i] = campaignarray[i]['network_id'];
			 }*/
			 campaignarray.sort(function(){return Math.random()>0.5?-1:1;});
			 campaignarray.sort(function(x,y){return y['priority']-x['priority'];});
			// var highest_priority=campaignarray[0]['priority'];
			request.request_settings['final_ad']=campaignarray[0];
		}
	    //console.log(global.request_settings['final_ad']);
	    callback();
		 });
	  }
	  this.build_ad=function ($type, $content){
		var $display_ad=this.display_ad=[],$valid_ad;
		var $zone_detail=this.zone_detail;
		if ($type==1){
		$display_ad['available']=1;
		$display_ad['ad_id']=$content['adv_id'];
		$display_ad['campaign_id']=$content['campaign_id'];
			
		switch ($zone_detail['zone_type']){
		case 'banner':
		$display_ad['main_type']='display';
		
		$display_ad['trackingpixel']=$content['adv_impression_tracking_url'];
		$display_ad['refresh']=$zone_detail['zone_refresh'];
		$display_ad['width']=$content['adv_width'];
		$display_ad['height']=$content['adv_height'];
		if (this.MAD_CLICK_ALWAYS_EXTERNAL || $content['adv_click_opentype']=='external'){
		$display_ad['clicktype']='safari';
		$display_ad['skipoverlay']=0;
		$display_ad['skippreflight']='yes';
		}
		else {
		$display_ad['clicktype']='inapp';
		$display_ad['skipoverlay']=0;
		$display_ad['skippreflight']='no';
		}
		//console.log($content['adv_type'])
		switch ($content['adv_type']){
		case 1:
		$display_ad['type']='hosted';
		$display_ad['click_url']=$content['adv_click_url'];
		//console.log($content['adv_type'])
		$display_ad['image_url']=this.get_creative_url($content);
		
		
		
		break;
		
		case 2:
		$display_ad['type']='image-url';
		$display_ad['image_url']=$content['adv_bannerurl'];
		$display_ad['click_url']=$content['adv_click_url'];
		break;
		
		case 3:
		$display_ad['html_markup']=$content['adv_chtml'];
		if ($content['adv_mraid']==1){
		$display_ad['type']='mraid-markup';
		$display_ad['skipoverlay']=1;
		} else {
		$display_ad['type']='markup';
		if ($display_ad['click_url']=extract_url($display_ad['html_markup'])){
		$display_ad['skipoverlay']=0;
		}
		else {
		$display_ad['skipoverlay']=1;
		$display_ad['click_url']='';
		}
		
		}
		break;
		}
		break;
		
		case 'interstitial':
		$display_ad['main_type']='interstitial';
		$display_ad['type']='interstitial';
		$display_ad['animation']='none';
		$display_ad['interstitial-orientation']='portrait';
		$display_ad['interstitial-preload']=0;
		$display_ad['interstitial-autoclose']=0;
		$display_ad['interstitial-type']='markup';
		$display_ad['interstitial-skipbutton-show']=1;
		$display_ad['interstitial-skipbutton-showafter']=0;
		$display_ad['interstitial-navigation-show']=0;
		$display_ad['interstitial-navigation-topbar-show']=0;
		$display_ad['interstitial-navigation-bottombar-show']=0;
		$display_ad['interstitial-navigation-topbar-custombg']='';
		$display_ad['interstitial-navigation-bottombar-custombg']='';
		$display_ad['interstitial-navigation-topbar-titletype']='fixed';
		$display_ad['interstitial-navigation-topbar-titlecontent']='';
		$display_ad['interstitial-navigation-bottombar-backbutton']=0;
		$display_ad['interstitial-navigation-bottombar-forwardbutton']=0;
		$display_ad['interstitial-navigation-bottombar-reloadbutton']=0;
		$display_ad['interstitial-navigation-bottombar-externalbutton']=0;
		$display_ad['interstitial-navigation-bottombar-timer']=0;
		
		if (!empty($content['adv_impression_tracking_url'])){
		var $tracking_pixel_html=generate_trackingpixel($content['adv_impression_tracking_url']);
		}
		else {
		var $tracking_pixel_html='';
		}
		
		switch ($content['adv_type']){
		case 1:
		$display_ad['interstitial-content']='<meta content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" name="viewport" /><meta name="viewport" content="width=device-width" /><div style="position:absolute;top:0;left:0;"><a href="mfox:external:'+$content['adv_click_url']+'"><img src="'+this.get_creative_url($content)+'"></a>' + $tracking_pixel_html + '</div>';
		break;
		
		case 2:
		$display_ad['interstitial-content']='<meta content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" name="viewport" /><meta name="viewport" content="width=device-width" /><div style="position:absolute;top:0;left:0;"><a href="mfox:external:'+$content['adv_click_url']+'"><img src="'+$content['adv_bannerurl']+'"></a>' + $tracking_pixel_html + '</div>';
		break;
		
		case 3:
		$display_ad['interstitial-content']=$content['adv_chtml'] + $tracking_pixel_html;
		break;
		
		}
		
		break;
		}
		this.display_ad=$display_ad;
		return true;
		}
		else if ($type==2){
		$valid_ad=0;
		$display_ad=$content;
		$display_ad['available']=1;
		
		switch ($display_ad['main_type']){
		case 'display':
		
		switch ($display_ad['type']){
		case 'markup':
		$valid_ad=1;
		if (typeof($display_ad['html_markup']=='undefined') || empty($display_ad['html_markup'])){global.display_ad=$display_ad;return false;}
		if (!isset($display_ad['click_url']) || empty($display_ad['click_url'])){if (!$display_ad['click_url']!=extract_url($display_ad['html_markup'])){this.display_ad=$display_ad;return false;} }
		if (!isset($display_ad['clicktype']) || empty($display_ad['clicktype'])){$display_ad['clicktype']='safari';}
		if (!isset($display_ad['refresh']) || empty($display_ad['refresh'])){$display_ad['refresh']=$zone_detail['zone_refresh'];}
		if (!isset($display_ad['skipoverlay']) || empty($display_ad['skipoverlay'])){$display_ad['skipoverlay']=0;}
		if (!isset($display_ad['skippreflight']) || empty($display_ad['skippreflight'])){$display_ad['skippreflight']='yes';}
		break;
		
		case 'mraid-markup':
		$valid_ad=1;
		if (!isset($display_ad['html_markup']) || empty($display_ad['html_markup'])){return false;}
		if (!isset($display_ad['clicktype']) || empty($display_ad['clicktype'])){$display_ad['clicktype']='safari';}
		if (!isset($display_ad['refresh']) || empty($display_ad['refresh'])){$display_ad['refresh']=$zone_detail['zone_refresh'];}
		if (!isset($display_ad['skipoverlay']) || empty($display_ad['skipoverlay'])){$display_ad['skipoverlay']=1;}
		if (!isset($display_ad['skippreflight']) || empty($display_ad['skippreflight'])){$display_ad['skippreflight']='yes';}
		break;
		
		case 'image-url':
		$valid_ad=1;
		if (!isset($display_ad['click_url']) || empty($display_ad['click_url'])){return false;}
		if (!isset($display_ad['image_url']) || empty($display_ad['image_url'])){return false;}
		if (!isset($display_ad['clicktype']) || empty($display_ad['clicktype'])){$display_ad['clicktype']='safari';}
		if (!isset($display_ad['refresh']) || empty($display_ad['refresh'])){$display_ad['refresh']=$zone_detail['zone_refresh'];}
		if (!isset($display_ad['skipoverlay']) || empty($display_ad['skipoverlay'])){$display_ad['skipoverlay']=0;}
		if (!isset($display_ad['skippreflight']) || empty($display_ad['skippreflight'])){$display_ad['skippreflight']='yes';}
		break;
			
		}
		
		break;
		
		case 'interstitial':
		 $valid_ad=1;
		
		/*switch ($display_ad['type']){
			We might add some validation for Interstitials later.
		}*/
		
		break;	
		}
		this.display_ad=$display_ad;
		if ($valid_ad!=1){return false;}
		
		return true;
		}
		else {
		return false;	
		}

	  }
	 this.get_creative_url=function(content){
			var imageurl=this.SITE_URL+'/data/creative/'+content.unit_hash+'.'+content.adv_creative_extension;
			return imageurl;
	}
	 this.select_ad_unit=function(request,callback){
		 this.select_adunit_query(request,callback);
	 }
	 this.select_adunit_query=function(request,callback){
		var query_part=[];
		switch (this.zone_detail.zone_type){
		case 'banner':
		query_part['size']="AND adv_width<="+this.zone_detail.zone_width+" AND adv_height<="+this.zone_detail.zone_height+"";
		break;
	
		case 'interstitial':
		if (this.MAD_INTERSTITIALS_EXACTMATCH){
		query_part['size']="AND adv_width=320 AND adv_height=480";
		} else {
		query_part['size']="AND adv_width<=320 AND adv_height<=480";
		}
		break;
		}
	
		var $query="SELECT * FROM md_ad_units WHERE campaign_id='"+this.request_settings['final_ad'].campaign_id+"' AND adv_status=1 "+query_part['size']+" ORDER BY adv_width DESC, adv_height DESC";
		this.client.query($query,function selectCb(err, results, fields) {  
	    if (err) {  
	    	throw err;  
		  }  
	    //console.log(results);
	    if(!results || results.length==0){
	    	request.request_settings['ad_unit']=null;
		 }else {
			 results.sort(function(){return Math.random()>0.5?-1:1;});
			 request.request_settings['ad_unit']=results[0];
		 }
	    callback();
		 });
	}
	 this.track_request=function($impression){
		var $request_settings=this.request_settings; 
		var $zone_detail=this.zone_detail;
		var $display_ad=this.display_ad;
		//console.log($request_settings['active_campaign_type']);
		if (!isset($request_settings['active_campaign_type'])){$request_settings['active_campaign_type']='';}
		
		switch ($request_settings['active_campaign_type']){
		case 'normal':
			this.reporting_db_update($zone_detail['publication_id'], $zone_detail['entry_id'], $display_ad['campaign_id'], $display_ad['ad_id'], '', 1, 0, $impression, 0);
		break;
		
		case 'network':
			this.reporting_db_update($zone_detail['publication_id'], $zone_detail['entry_id'], $request_settings['active_campaign'], '', $request_settings['network_id'], 1, 0, $impression, 0);
		break;
		
		case 'backfill':
		this.reporting_db_update($zone_detail['publication_id'], $zone_detail['entry_id'], '', '', $request_settings['network_id'], 1, 0, $impression, 0);
		break;
		
		default:
			//console.log($zone_detail);
		this.reporting_db_update($zone_detail['publication_id'], $zone_detail['entry_id'], '', '', '', 1, 0, $impression, 0);
		break;
		}
		
		if ($impression==1){
		/*Deduct Impression from Limit Card*/
		switch ($request_settings['active_campaign_type']){
			
		case 'normal':
			this.deduct_impression($display_ad['campaign_id']);
		break;
		
		case 'network':
			this.deduct_impression($request_settings['active_campaign']);
		break;
		
		}
		
		}
			
	}
	this.reporting_db_update=function($publication_id, $zone_id, $campaign_id, $creative_id, $network_id, $add_request, $add_request_sec, $add_impression, $add_click){
	
	var $current_date=date('Y-m-d')
	var $current_day=date('d')
	var $current_month=date('m')
	var $current_year=date('Y')
	var $current_timestamp=this.timestamp;
	var request=this;
	var $select_query="select entry_id from md_reporting where publication_id='"+$publication_id+"' AND zone_id='"+$zone_id+"' AND campaign_id='"+$campaign_id+"' AND creative_id='"+$creative_id+"' AND network_id='"+$network_id+"' AND date='"+$current_date+"' LIMIT 1";
	
	
	
	
	this.client.query($select_query,function selectCb(err, results, fields) {  
	    if (err) {  
	    	throw err;  
		  }  
	    //console.log(results);
	    if(!results || results.length==0){
	    	var $sql="INSERT INTO  md_reporting (type, date, day, month, year, publication_id, zone_id, campaign_id, creative_id, network_id, total_requests, total_requests_sec, total_impressions, total_clicks,time_stamp)VALUES ('1', '" +$current_date+"', '" + $current_day + "', '" +$current_month + "', '" + $current_year + "', '" + $publication_id + "', '"+ $zone_id + "', '" + $campaign_id+ "', '" + $creative_id + "', '" + $network_id + "', '" + $add_request + "', '" + $add_request_sec + "', '" + $add_impression + "', '" + $add_click  +"','"+$current_timestamp+"')";
	    	request.client.query($sql);
		 }else {
			 var $sql="UPDATE md_reporting set total_requests=total_requests+"+$add_request+", total_requests_sec=total_requests_sec+"+$add_request_sec+", total_impressions=total_impressions+"+$add_impression+", total_clicks=total_clicks+"+$add_click+" WHERE entry_id='"+results[0]['entry_id']+"'";
			request.client.query($sql);
			 
		 }
	    request.exchangebalance();//扣费 账户余额变动
		 
		 });
	}
	this.deduct_impression=function($campaign_id){
		var $query="UPDATE md_campaign_limit set total_amount_left=total_amount_left-1 WHERE campaign_id='"+$campaign_id+"' AND total_amount>0 and total_amount_left>0";	
		this.client.query($query);
	}
	this.display_ad_=function(){
		if (this.display_ad['main_type']=='interstitial'){
			this.request_settings['response_type']='xml';
		}
		
		this.prepare_ad();
		
		this.prepare_response();
		
		this.print_ad();
		
		//echo "Displaying ad..."; global $display_ad; print_r($display_ad); global $request_settings; print_r($request_settings); global $zone_detail; print_r($zone_detail);  exit;
		var d=new Date();
		var t=d.getMinutes().toString()+':'+ d.getSeconds().toString()+':'+d.getMilliseconds().toString();
		this.res.end();
	
	}
	this.prepare_ad=function(){
	this.prepare_ctr();
	
	this.prepare_markup();
	
	}
	this.prepare_ctr=function(){
		var $display_ad=this.display_ad;	
		var $request_settings=this.request_settings;
		var $zone_detail=this.zone_detail;
		//$base_ctr="".MAD_ADSERVING_PROTOCOL . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF'])."/".MAD_CLICK_HANDLER."?zone_id=".$zone_detail['entry_id']."&h=".$request_settings['request_hash']."";
		var $base_ctr=this.SERVER_URL+"/click?zone_id="+$zone_detail['entry_id']+"&h="+$request_settings['request_hash'];
		
		if ($display_ad['main_type']=='display'){
		
		switch ($request_settings['active_campaign_type']){
		case 'normal':
		$base_ctr=$base_ctr + "&type=normal&campaign_id="+$display_ad['campaign_id']+"&ad_id="+$display_ad['ad_id']+"";
		break;
		
		case 'network':
		$base_ctr=$base_ctr + "&type=network&campaign_id="+$request_settings['active_campaign']+"&network_id="+$request_settings['network_id']+"";
		break;
		
		case 'backfill':
		$base_ctr=$base_ctr + "&type=backfill&network_id="+$request_settings['network_id'];
		break;
		}
		
		$base_ctr=$base_ctr + "&c="+strtr(base64_encode(this.get_destination_url()), '+/=', '-_,');
		
		$display_ad['final_click_url']=$base_ctr;
		}
		this.display_ad=$display_ad;
	}
	this.get_destination_url=function(){
		var $display_ad=this.display_ad;
		if (isset($display_ad['click_url'])){
		return $display_ad['click_url'];
		} else {
		return '';	
		}
	}
	this.prepare_markup=function(){
		var $display_ad=this.display_ad;	
		var $request_settings=this.request_settings;
		//console.log(global.display_ad);
		if ($display_ad['main_type']=='display'){
			
			switch ($display_ad['type']){
			case 'hosted':
			case 'image-url':
			if ($request_settings['response_type']!='xml'){
			var $final_markup='<a id="mAdserveAdLink" href="'+$display_ad['final_click_url']+'" target="_self"><img id="mAdserveAdImage" src="'+$display_ad['image_url']+'" border="0"/></a><br>';
			}
			else {
			var $final_markup='<body style="text-align:center;margin:0;padding:0;"><div align="center"><a id="mAdserveAdLink" href="'+$display_ad['final_click_url']+'" target="_self"><img id="mAdserveAdImage" src="'+$display_ad['image_url']+'" border="0"/></a></div></body>';
			}
			break;	
		
		
			case 'markup':
			$final_markup=this.generate_final_markup();
			break;	
		
			case 'mraid-markup':
			$final_markup=$display_ad['html_markup'];
			break;	
			}
			
			if (isset($display_ad['trackingpixel']) && !empty($display_ad['trackingpixel']) && $display_ad['trackingpixel']!=''){
			$final_markup=$final_markup + generate_trackingpixel($display_ad['trackingpixel']);
			}
			
			$display_ad['final_markup']=$final_markup;
		
		}
		
	}
	this.generate_final_markup=function(){
		var $display_ad=this.display_ad;	
		var $request_settings=this.request_settings;
	
		if (isset($display_ad['click_url']) && !empty($display_ad['click_url'])){
		$markup=str_replace($display_ad['click_url'], $display_ad['final_click_url'], $display_ad['html_markup']);
		}
		else {
		$markup=$display_ad['html_markup'];
		}
		return $markup;
	}
	this.print_ad=function(){
		var $display_ad=this.display_ad;	
		var $request_settings=this.request_settings;
		var str='';
		//console.log($display_ad['main_type']);
		if ($display_ad['main_type']=='display'){
			
		switch ($request_settings['response_type']){
		
		case 'xml':
		if ($display_ad['type']!='mraid-markup'){
			str+= "<request type=\"textAd\">";
		} else {
			str+= "<request type=\"mraidAd\">";
		}
		str+= "<htmlString skipoverlaybutton=\""+$display_ad['skipoverlay']+"\"><![CDATA[";
		str+= $display_ad['final_markup'];
		str+= "]]></htmlString>";
		str+= "<clicktype>";
		str+= ""+$display_ad['clicktype']+"";
		str+= "</clicktype>";
		str+= "<clickurl><![CDATA[";
		str+= ""+$display_ad['final_click_url']+"";
		str+= "]]></clickurl>";
		str+= "<urltype>";
		str+= "link";
		str+= "</urltype>";
		str+= "<refresh>";
		str+= ""+$display_ad['refresh']+"";
		str+= "</refresh>";
		str+= "<scale>";
		str+= "no";
		str+= "</scale>";
		str+= "<skippreflight>";
		str+= ""+$display_ad['skippreflight']+"";
		str+= "</skippreflight>";
		str+= "</request>";
		break;
		
		case 'html':
		str+= $display_ad['final_markup'];
		break;
		
		case 'json':
			var jsvar;
		if (!isset(this.res.query.jsvar)){jsvar=1;}
		/*if ($display_ad['type']=='mraid-markup'){
		$display_ad['final_markup'] = str_replace("\n","",$display_ad['final_markup']);
		}*/
		str+= 'var '+jsvar+' = [{"url" : "'+$display_ad['final_click_url']+'","content" : "'+addslashes($display_ad['final_markup'])+'", "track" : ""}];';
		break;
			
			
		}
			
		}
		else if ($display_ad['main_type']=='interstitial'){
			str+= '<ad type="'+convert_interstitial_name($display_ad['type'])+'" animation="'+$display_ad['animation']+'">';
		
			if ($display_ad['type']=='interstitial' || $display_ad['type']=='video-interstitial' || $display_ad['type']=='interstitial-video'){
			if ($display_ad['interstitial-type']=='markup'){var $interstitial_urlcontent=''; } else {var $interstitial_urlcontent='url="'+htmlspecialchars($display_ad['interstitial-content'])+'"';}
			
		str+= '<interstitial preload="'+$display_ad['interstitial-preload']+'" autoclose="'+$display_ad['interstitial-autoclose']+'" type="'+$display_ad['interstitial-type']+'" '+$interstitial_urlcontent+' orientation="'+$display_ad['interstitial-orientation']+'">';
		if ($display_ad['interstitial-type']=='markup'){
			str+= '<markup><![CDATA['+$display_ad['interstitial-content']+']]></markup>';
		}
		str+= '<skipbutton show="'+$display_ad['interstitial-skipbutton-show']+'" showafter="'+$display_ad['interstitial-skipbutton-showafter']+'"></skipbutton>';
		str+= '<navigation show="'+$display_ad['interstitial-navigation-show']+'">';
		str+= '<topbar custombackgroundurl="'+$display_ad['interstitial-navigation-topbar-custombg']+'" show="'+$display_ad['interstitial-navigation-topbar-show']+'" title="'+$display_ad['interstitial-navigation-topbar-titletype']+'" titlecontent="'+$display_ad['interstitial-navigation-topbar-titlecontent']+'"></topbar>';
		str+= '<bottombar custombackgroundurl="'+$display_ad['interstitial-navigation-bottombar-custombg']+'" show="'+$display_ad['interstitial-navigation-bottombar-show']+'" backbutton="'+$display_ad['interstitial-navigation-bottombar-backbutton']+'" forwardbutton="'+$display_ad['interstitial-navigation-bottombar-forwardbutton']+'" reloadbutton="'+$display_ad['interstitial-navigation-bottombar-reloadbutton']+'" externalbutton="'+$display_ad['interstitial-navigation-bottombar-externalbutton']+'" timer="'+$display_ad['interstitial-navigation-bottombar-timer']+'">';
		str+= '</bottombar>';
		str+= '</navigation>';
		str+= '</interstitial>';	
			}
			
			if ($display_ad['type']=='video' || $display_ad['type']=='video-interstitial' || $display_ad['type']=='interstitial-video'){
			
			str+= '<video orientation="'+$display_ad['video-orientation']+'" expiration="'+$display_ad['video-expiration']+'">';
			str+= '<creative display="'+$display_ad['video-creative-display']+'" delivery="'+$display_ad['video-creative-delivery']+'" type="'+$display_ad['video-creative-type']+'" bitrate='+$display_ad['video-creative-bitrate']+'"" width="'+$display_ad['video-creative-width']+'" height="'+$display_ad['video-creative-height']+'"><![CDATA['+$display_ad['video-creative-url']+']]></creative>';
			str+= '<duration>'+$display_ad['video-duration']+'</duration>';
			str+= '<skipbutton show="'+$display_ad['video-skipbutton-show']+'" showafter="'+$display_ad['video-skipbutton-showafter']+'"></skipbutton>';
			str+= '<navigation show="'+$display_ad['video-navigation-show']+'" allowtap="'+$display_ad['video-navigation-allowtap']+'">';
			str+= '<topbar custombackgroundurl="'+$display_ad['video-navigation-topbar-custombg']+'" show="'+$display_ad['video-navigation-topbar-show']+'"></topbar>';
			str+= '<bottombar custombackgroundurl="'+$display_ad['video-navigation-bottombar-custombg']+'" show="'+$display_ad['video-navigation-bottombar-show']+'" pausebutton="'+$display_ad['video-navigation-bottombar-pausebutton']+'" replaybutton="'+$display_ad['video-navigation-bottombar-replaybutton']+'" timer="'+$display_ad['video-navigation-bottombar-timer']+'">';
			str+= '</bottombar>';
			str+= '</navigation>';
			str+= '<trackingevents>';
		for (var i in $display_ad['video-trackers'] ){
			str+= '<tracker type="'+$display_ad['video-trackers'][i][0]+'"><![CDATA['+$display_ad['video-trackers'][i]+']]></tracker>';
		}
		
		str+= '</trackingevents>';
		if ($display_ad['video-htmloverlay-show']==1){
		if ($display_ad['video-htmloverlay-type']=='markup'){var $htmloverlay_urlcontent=''; } else {var $htmloverlay_urlcontent='url="'+htmlspecialchars($display_ad['video-htmloverlay-content'])+'"';}
		str+= '<htmloverlay show="'+$display_ad['video-htmloverlay-show']+'" showafter="'+$display_ad['video-htmloverlay-showafter']+'" type="'+$display_ad['video-htmloverlay-type']+'" '+$htmloverlay_urlcontent+'>';
		if ($display_ad['video-htmloverlay-type']=='markup'){
			str+= '<![CDATA['+$display_ad['video-htmloverlay-content']+']]>';
		}
		
		str+= '</htmloverlay>';
		}
		str+= '</video>';
		
				
			}
			
			str+= "</ad>";
			
		}
			this.res.write(str);
			
		}
	this.exchangebalance=function(){
		//console.log(this.request_settings);
		var campaign_id=this.request_settings['final_ad']['campaign_id'];
		var publication_id=this.zone_detail['publication_id'];
		var zone_id=this.zone_detail['entry_id'];
		var creative_id=this.display_ad['ad_id'];
		if(this.request_settings['final_ad']['cost_type']==1){
			if(this.request_settings['final_ad']['money']>0){
				var e= this.request_settings['final_ad']['price']/1000;
				//console.log(e);
				var query="update md_campaign_limit set money=money-"+e+" where  campaign_id="+campaign_id+" and money>0";
				this.client.query(query);
				query="update md_zones set income=income+"+e+" where entry_id="+zone_id;
				this.client.query(query);
				query="update md_publications set income=income+"+e+" where inv_id="+publication_id;
				this.client.query(query);
				query="update md_reporting set money=money+"+e+" where  publication_id='"+publication_id+"' AND zone_id='"+zone_id+"' AND campaign_id='"+campaign_id+"' AND creative_id='"+creative_id+"' AND date='"+date('Y-m-d')+"'";
				this.client.query(query);
				query="update md_uaccounts set balance=balance+"+e+" where user_id="+this.zone_detail['creator_id'];
				this.client.query(query);
			}
		}else if(this.request_settings['final_ad']['cost_type']==2){
			
		}
	}

}
	  
		function extract_url(input){
			var regs=input.match("/href='([^']*)'/i");
		if (regs){
		return regs[0]; }
		var regsx=input.match('/href="([^"]*)"/i');
		if (regsx){
		return $regsx[0];	
		}

		return false;	
		}
		function generate_trackingpixel(url){
		return '<img style="display:none;" src="'+url+'"/>';	
		}
function validate_md5(hash){
	if(hash!='' && hash.match(/^[a-f0-9]{32}$/)){
	return true;	
	}
	else {
	return false;	
	}
	
}


function is_valid_ip(ip)
{
	var obj=ip
	var exp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
	var reg = obj.match(exp);
	if(reg==null)
	{
		return false;
	}
	else
	{
		return true;
	}
}
	function convert_interstitial_name($input){
		switch ($input){

		case 'interstitial':
		return 'interstitial';
		break;	

		case 'video':
		return 'video';
		break;

		case 'interstitial-video':
		return 'interstitial-to-video';
		break;

		case 'video-interstitial':
		return 'video-to-interstitial';
		break;	
			
		}
		}