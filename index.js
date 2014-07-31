'use strict';

var config = require('./config'),
	data = require('./data'),
	express = require('express'),
	Flickr = require('node-flickr'),
	_ = require('underscore'),
	async = require('async'),
	port = process.env.port || config.port,
	app = express(),
	flickr = new Flickr({ 'api_key': config.key }),
	db = require('./db');

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

// TODO: have the same API end point and use POST / GET to distinguish
// POST to retrieve the data from flickr and add to the db
// GET to get it from the db
// Could alias a shell command to call update API
app.get('/api/data', function(req, res) {

	getPhotos(function(result) {
		// Delete everything in the db
		db.photos.remove({ });
		// And replace it with the results
		db.photos.insert(result); // TODO: is this asynch?? how do I know if it has failed?
		// And let the user know
		res.send('Updated database');
	});
});

app.get('/api/photos', function(req, res) {
    db.photos.find().toArray(function (err, photos) {
        res.json(photos);
    });
});

// Launch server
app.listen(port);
console.log('Server listening on port %s.', port);