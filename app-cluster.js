var cluster = require("cluster");
var numCPUs = require('os').cpus().length;

cluster.setupMaster({
  exec : "app.js",
  args : ["--use", "http"],
  silent : true
});

  if (cluster.isMaster) {
  console.log('I am master');
  for (var i = 0; i < numCPUs; i++) {
    var worker = cluster.fork();
  }

  
 
   cluster.on('exit', function(worker, code, signal) {
     console.log('worker ' + worker.process.pid + ' died');
	 cluster.fork();
   });
   cluster.on('error', function(worker, code, signal) {
	   worker.kill();
	    // console.log('worker ' + worker.process.pid + ' died');
		// cluster.fork();
	   });
} else if (cluster.isWorker) {
	console.log('I am worker #' + cluster.worker.id);
  	process.on('message', function(msg) {
    process.send(msg);
  });

}

cluster.on('listening', function(worker, address) {
  console.log("A worker "+worker.id+" is now connected to " + address.address + ":" + address.port);
	worker.process.stdout.on('data', function (data)
    {
        console.log('process #'+worker.id+' '+data.toString());
    });
	
});

/*for (var id in cluster.workers) {
    cluster.workers[id].process.stdout.on('data', function (data)
    {
        console.log('process #'+id+' '+data.toString());
    });
  }*/