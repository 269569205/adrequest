function pad(num, n) {  
  return Array(n>num?(n-(''+num).length+1):0).join('0')+num;  
}

function toHex(aColor){//rgb的三个值转换成16进制颜色(获得三个值通过正则表达式或者其他方式吧)
      var hR = aColor[0].toString(16);
      var hG = aColor[1].toString(16);
      var hB = aColor[2].toString(16);
		var hd = aColor[3].toString(16);
     return this.colorValue = "" + (hR < 10 ? ("0" + hR) : hR) + (hG < 10 ? ("0" + hG) : hG) + (hB < 10 ? ("0" + hB) : hB)+ (hd < 10 ? ("0" + hd) : hd);
}
//console.log(toHex([1,86,20,122]));
function switchto16(key,value){
if(key=="bitcode"){
	return toHex(value);
}else{
	return value;
}
}
exports.index = function(req, res){
	var as= require('async');
	var data=[];
	as.auto({
		checkmysqlconnect:function(callback){
		
			global.clientConnectionReady(global.mysqlclient,callback);
		
		},
		getadcode:['checkmysqlconnect',function(callback){
			var $query="select * from md_campaign_code";
			global.mysqlclient.query($query,function(error, results){
				if (error) {  
		    	throw error;  
			  }  
		    //console.log(results);
		    if(!results || results.length==0){
				data=[];
			 }else {
				 data=results;
			}
		   // console.log(data);
		     callback();return;
			  
			});
		}],
		end:['getadcode',function(callback){
			var arrs=new Array(data.length);
			for(var i=0;i<data.length;i++){
				//console.log(data[i]['id']);
				var arr={};
				var buffer=new Buffer(32);
				arr.id=data[i]['id'];
				arr.campaign_id=data[i]['campaign_id'];
				arr.adid=data[i]['adid'];
				arr.bitcode=data[i]['code'];
				arr.codelength=data[i]['codelength'];
				//buffer=
				// console.log(data[i]['bitcode']);
				// arrs[i]=arr;
				//console.log(''+data[i]['bitcode'][0]+data[i]['bitcode'][1]+data[i]['bitcode'][2]+data[i]['bitcode'][3]+'');
				//console.log(arr);
				arrs[i]=arr;
			}
			console.log(arrs);
			 res.send("{\"data\":"+JSON.stringify(arrs)+"}");
			//res.send('sdfsdf');
			 res.end();
			callback();
		}]
	});
}