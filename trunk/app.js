/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
 // var NodeCache = require( "node-cache" );
//  global.Cache = new NodeCache();
 require('./lib/config.js')
var phpfunction = require('./lib/phpfunction');
global.mysqlclient = require('mysql').createConnection({'host':global.mysqlhost,'port':3306,'user':global.mysqlroot,'password':global.mysqlpwd});
global.clientConnectionReady(mysqlclient,function(){});
global.F = require('./lib/request').request;
global.C = require('./lib/click').click;
var app = express();
 

// all environments
app.set('port', process.env.PORT || 8081);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//app.get('/', routes.index);
//app.get('/users', user.list);
var request=require('./routes/request');
var click=require('./routes/click');
var getadcode=require('./routes/getadcode');
//var animation=require('./routes/animation');
app.get('/request', request.index);
app.get('/click', click.index);
app.get('/getadcode', getadcode.index);
//app.get('/animation', animation.index);
var server=http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


