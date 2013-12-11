'use strict';

var config = require('./config'),
	data = require('./data'),
	express = require('express'),
	Flickr = require('node-flickr'),
	_ = require('underscore'),
	async = require('async'),
	port = process.env.port || config.port,
	app = express(),
	flickr = new Flickr({ 'api_key': config.key });

app.use(express.json());
app.use(express.static(__dirname));

app.param('format', function(req, res, next) {
	req.params.format = req.params.format || 'html';
	return next();
});

function getPhotoSizes(photo, callback) {
	flickr.get('photos.getSizes', { 'photo_id': photo.id }, function(result) {
	    callback(null, result.sizes);
	});
}

function getPhotoInfo(photo, callback) {
	flickr.get('photos.getInfo', { 'photo_id': photo.id }, function(result) {
	    callback(null, result.photo);
	});
}

function getPhotoData(photo, _callback) {
	async.parallel([
		function(callback) { getPhotoInfo(photo, callback); },
		function(callback) { getPhotoSizes(photo, callback); }
	],
	function(err, result) {
		_callback(null, _.extend(photo, result[0], result[1]));
	});
}

function getPhotos(callback) {
	flickr.get('photosets.getPhotos', { 'photoset_id': config.photoset }, function(results) {
		async.map(results.photoset.photo, getPhotoData, function(err, result) {
			callback(result);
		});
	});
}

// REST services
app.get('/api', function (req, res) {
	res.send('cloud RESTful API is running');
});

app.get('/api/media', function(req, res) {
	// res.send(data);
	getPhotos(function(result) {
		res.send(result);
	});
});

// Launch server
app.listen(port);
console.log('Server listening on port %s.', port);