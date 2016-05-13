var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({extended: false});
var hypercube = require('../lib/setCubeDims');
var worker = require('../lib/dowork');
var getdoc = require('../lib/getdocid');
var gethypercube = require('../lib/getmetricshypercube');
var winston = require('winston');
var config = require('../config/config');

//set up logging
var logger = new (winston.Logger)({
	level: config.logLevel,
	transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: config.logFile})
    ]
});



router.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

router.route('/')
	.get(function(request,response){
		logger.info('default route called', {module: 'popmasterlib'});
		var cube = hypercube.setCubeDefault();
		worker.doWork(cube,function(error,result){
			if(error)
			{
				logger.error('default route failure::' + error , {module: 'popmasterlib'});
				response.status(400).json("Bad Request");
			}
			else
			{
				//for my reference so I can see how to send responses.
				//response.status(200).json(result.connection.ws.url);
				logger.info('default route success', {module: 'popmasterlib'});
				response.status(200).json(result);
			}
		});
	})
	.post(parseUrlencoded, function(request,response){
		var result = worker.doWork(hypercube.setCubeDims(request.body));
		response.status(200).json(result);
	});

//for testing getDocId method
router.route('/getdocid')
	.get(function(request,response)
	{
		logger.info('GET getdocid for '+  config.appName, {module: 'popmasterlib'});
		worker.getDoc(config.appName)
		.then(function(result)
		{
			logger.info('GET getdocid success::' + result, {module: 'popmasterlib'});
			response.status(200).json(result);

		})
		.catch(function(error)
		{
			logger.error('GET getdocid route failure::' + error, {module: 'popmasterlib'});
			response.status(400).json(error);
		});
	})
	.post(function(request,response)
	{
		logger.info('POST getdocid for ' + request.body.appname, {module: 'popmasterlib'});
		worker.getDoc(request.body.appname)
		.then(function(result)
		{
			logger.info('POST getdocid success:: ' + result, {module: 'popmasterlib'});
			response.status(200).json(result);

		})
		.catch(function(error)
		{
			logger.error('POST getdocid failure:: ' + error, {module: 'popmasterlib'});
			response.status(400).json(error);
		});
	});

router.route('/add/all')
	.post(function(request, response)
	{
		logger.info('POST add/all', {module: 'popmasterlib'});
		worker.addAll()
		.then(function(result)
		{
			logger.info('POST add/all success::' + result.result, {module: 'popmasterlib'});
			response.status(200).json(result.result);
		})
		.catch(function(error)
		{
			logger.error('POST add/all failure::' + error, {module: 'popmasterlib'});
			response.status(400).json(error);
		});			
		
	});

router.route('/update/all')
	.post(function(request, response)
	{
		logger.info('POST update/all', {module: 'popmasterlib'});
		worker.updateAll()
		.then(function(result)
		{
			logger.info('POST update/all success::' + result.result, {module: 'popmasterlib'});
				response.status(200).json(result.result + '\n');
		})
		.catch(function(error)
		{
			logger.error('POST update/all failure::' + error, {module: 'popmasterlib'});
			response.status(400).json(error);
		});			
		
	});

router.route('/delete/all')
	.post(parseUrlencoded, function(request,response){
		logger.info('POST delete/all for ' + request.body.appname, {module: 'popmasterlib'});
		worker.deleteAll(request.body)
		.then(function(result)
		{
			logger.info('POST delete/all success::' + result.result, {module: 'popmasterlib'});
			response.status(200).json(result.result + '\n');
		});
	});

router.route('/reload')
	.post(function(request, response)
	{
		logger.info('POST reload', {module: 'popmasterlib'});
		worker.reloadMetricsApp()
		.then(function(result)
		{
			logger.info('POST reload success::' + result.result, {module: 'popmasterlib'});
			response.status(200).json(result.result);
		})
		.catch(function(error)
		{
			logger.error('POST reload failure::' + error, {module: 'popmasterlib'});
			response.status(400).json(error);
		});			
	});


function isEmpty(obj){
	for(var prop in obj){
		if(obj.hasOwnProperty(prop))
		{
			return false;
		}
	}
	return true;
};

module.exports = router;
