exports.index = function(req, res){
	var data=req.query;
	if(typeof(data.id)=='undefined'){
		var animation_id=0;
	}else{
		var animation_id=data.id;
	}
	var as= require('async');
	var items=[];
	as.auto({
		checkmysqlconnect:function(callback){
			global.clientConnectionReady(global.mysqlclient,callback);
		},
		getitem:['checkmysqlconnect',function(callback){
			//click.getzone($data,click,callback)
			var $query="select * from md_animation_item where animation_id='"+animation_id+"' order by index asc";
			global.mysqlclient.query($query,function(error, results){
				if (error) {  
		    	throw error;  
			  }  
		    //console.log(results);
		    if(!results || results.length==0){
			 }else {
				 items=results;
			}
		   // console.log(data);
		     callback();return;
			  
			});
		}],
		readerimagefile:['getitem',function(callback){
			click.getzone($data,click,callback)
		}]
		});
}