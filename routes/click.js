
exports.index = function(req, res){

	var $data=req.query;
	if (!isset($data['c']) || empty($data['c']) || !isset($data['type'])){
		res.end();	return;
	}
	//var request=new F(req, res,global.mysqlclient);
	var click=new C(req, res,global.mysqlclient);
	var as= require('async');
	as.auto({
		getzone:function(callback){
			click.getzone($data,click,callback)
		},
		getcampaignlimit:['getzone',function(callback){
			click.getcampaignlimit($data,callback);
		}],
		reporting_db_update:['getcampaignlimit',function(callback){
			if (!click.zone_detail||!click.limit){
				click.redirect($data);
				return;
			}
			var $zone_detail=click.zone_detail;
			switch($data['type']){

				case 'normal':
					click.reporting_db_update($zone_detail['publication_id'], $data['zone_id'], $data['campaign_id'], $data['ad_id'], '', 0, 0, 0, 1);
				break;
				
				case 'network':
					click.reporting_db_update($zone_detail['publication_id'], $data['zone_id'], $data['campaign_id'], '', $data['network_id'], 0, 0, 0, 1);
				break;
				
				case 'backfill':
					click.reporting_db_update($zone_detail['publication_id'], $data['zone_id'], '', '', $data['network_id'], 0, 0, 0, 1);
				break;
			
			}
			click.redirect($data);
			callback();
		}]
	});
}