/*globals require*/
/*jshint node: true */

var config = require('./config'),
	express = require('express'),
	port = process.env.OPENSHIFT_NODEJS_PORT || config.port,
	ip = process.env.OPENSHIFT_NODEJS_IP || config.ip,
	app = express(),
	request = require('request');

app.use(express.json());
app.use(express.static(__dirname));

app.param('format', function(req, res, next) {
	req.params.format = req.params.format || 'html';
	return next();
});

// REST services
app.get('/api', function (req, res) {
	res.send('cloud RESTful API is running');
});

app.get('/api/proxy', function(req, res) {
	// res.send('hello' + req.query.url);
	request.get(req.query.url, function(response) {
		console.log('proxy error', response);
		res.send(response);
	}).pipe(res);
});

// // Launch server
app.listen(port, ip);
console.log('Server listening on %s:%s', ip, port);