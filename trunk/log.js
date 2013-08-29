/**
 * JavaScript Document
 * log.js
 * Record the requests from mobile
 * 
 * Author: Andy
 * 
 */
 require('./lib/config.js')
var db = require("mongojs").connect(global.mongodburl, global.collections );

function insertSmwlog(data)
{
	db.tname.insert(data);	
}

insertSmwlog({idx:76,name:"BAIDU"});

//-- for find test
db.tname.find({idx: 76}, function(err, tname) {
  if( err || !tname) console.log("No female users found");
  else tname.forEach( function(femaleUser) {
    console.log(femaleUser);
  } );
});
