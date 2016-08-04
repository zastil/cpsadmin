var fs = require('fs');

var mysql = require('../models/mysql.js');
var schema = require('../../config/schema.js');

var js2xml = require("js2xmlparser");

module.exports = function(router, passport) {

	router.use(passport.authenticate('bearer', {
		session: false
	}));
	router.use(function(req, res, next) {
		fs.appendFile('logs.txt', req.path + " token: " + req.query.access_token + "\n",
			function(err) {
				if (err) throw err;
				next();
			});
	});

	router.get('/getJson', function(req, res) {
		var user = req.user;
		mysql.getPropertiesJson(user, function(strJson) {
			res.set('Content-Type', 'application/json');
			res.send(strJson);

		});

	});
	
	router.get('/getXml', function(req, res) {
		var user = req.user;
		mysql.getPropertiesJson(user, function(strJson) {
			res.set('Content-Type', 'text/xml');
			res.send(js2xml("properties", strJson));

		});

	});
	
	router.get('/setJson', function(req, res) {
	   res.set('Content-Type', 'application/json');
	   res.send(schema.jsonSchema); 
	});
	
	router.post('/postJson', function(req, res){
		var user = req.user;
		var jsonUpload = req.body;
		mysql.setPropertiesJson(user, jsonUpload, schema.jsonSchema, function(err, result){
			if (err) {
				res.send(err);
			} else {
				res.send(result);
			}
		});
	});

}