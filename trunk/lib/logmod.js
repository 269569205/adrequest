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
	db.tname.insert(data);	
}
