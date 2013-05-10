exports.click=function(req, res,mysqlclient){
	this.client=mysqlclient;
	this.res=res;
	this.req=req;
	this.getzone=function(data,click,callback){
		var click=this;
		var query="SELECT publication_id,creator_id FROM md_zones WHERE entry_id='"+data['zone_id']+"'";
		this.client.query(query,function selectCb(err, results, fields) {  
	    if (err) {  
	    	throw err;  
		  }    
		 if(!results || results.length==0){
			 click.zone_detail=null;
			
		 }else{
			 click.zone_detail=results[0];
		 }
		 	callback();
		 });
	}
	this.getcampaignlimit=function(data,callback){
		var click=this;
		var query="SELECT cost_type,money,price FROM md_campaign_limit WHERE campaign_id='"+data['campaign_id']+"'";
		this.client.query(query,function selectCb(err, results, fields) {  
		    if (err) {  
		    	throw err;  
			  }    
			 if(!results || results.length==0){
				 click.limit=null;
				
			 }else{
				 click.limit=results[0];
			 }
			 //console.log(click.limit);
		 	callback();
		 });
	}
	this.redirect=function(data){
		//header ("Location: "+prepare_click_url($data['c']));	
		//this.res.redirect(prepare_click_url(data['c']));
		console.log(prepare_click_url(data['c']));
		this.res.setHeader('Location', prepare_click_url(data['c']));
		this.res.writeHead(302);
		this.res.end();
	}
	this.exchangebalance=function(campaign_id,publication_id,zone_id,creative_id){
		//console.log(this.request_settings['final_ad']);
		//var campaign_id=this.request_settings['final_ad']['campaign_id'];
		//var publication_id=this.zone_detail['publication_id'];
		//var zone_id=this.zone_detail['entry_id'];
		//var creative_id=this.display_ad['ad_id'];
		if(this.limit['cost_type']==2){
			if(this.limit['money']>0){
				var e= this.limit['price'];
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
		}else if(this.request_settings['final_ad']['cost_type']==1){
			
		}
	}
	this.reporting_db_update=function($publication_id, $zone_id, $campaign_id, $creative_id, $network_id, $add_request, $add_request_sec, $add_impression, $add_click){
	
	var $current_date=date('Y-m-d')
	var $current_day=date('d')
	var $current_month=date('m')
	var $current_year=date('Y')
	var $current_timestamp=this.timestamp;
	var click=this;
	var $select_query="select entry_id from md_reporting where publication_id='"+$publication_id+"' AND zone_id='"+$zone_id+"' AND campaign_id='"+$campaign_id+"' AND creative_id='"+$creative_id+"' AND network_id='"+$network_id+"' AND date='"+$current_date+"' LIMIT 1";
	
	
	
	
	this.client.query($select_query,function selectCb(err, results, fields) {  
	    if (err) {  
	    	throw err;  
		  }  
	    //console.log(results);
	    if(!results || results.length==0){
	    	var $sql="INSERT INTO  md_reporting (type, date, day, month, year, publication_id, zone_id, campaign_id, creative_id, network_id, total_requests, total_requests_sec, total_impressions, total_clicks,time_stamp)VALUES ('1', '" +$current_date+"', '" + $current_day + "', '" +$current_month + "', '" + $current_year + "', '" + $publication_id + "', '"+ $zone_id + "', '" + $campaign_id+ "', '" + $creative_id + "', '" + $network_id + "', '" + $add_request + "', '" + $add_request_sec + "', '" + $add_impression + "', '" + $add_click  +"','"+$current_timestamp+"')";
	    	click.client.query($sql);
		 }else {
			 var $sql="UPDATE md_reporting set total_requests=total_requests+"+$add_request+", total_requests_sec=total_requests_sec+"+$add_request_sec+", total_impressions=total_impressions+"+$add_impression+", total_clicks=total_clicks+"+$add_click+" WHERE entry_id='"+results[0]['entry_id']+"'";
			 click.client.query($sql);
			 
		 }
	    click.exchangebalance($campaign_id,$publication_id,$zone_id,$creative_id);//扣费 账户余额变动
		 
		 });
	}
}
function prepare_click_url($input){
		var $output = base64_decode(strtr($input, '-_,', '+/='));
		return $output;	
	}