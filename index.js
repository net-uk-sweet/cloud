/*globals require*/
/*jshint node: true */

var config = require('./config'),
	data = require('./data'),
	express = require('express'),
	Flickr = require('flickrapi'), flickr,
	_ = require('underscore'),
	async = require('async'),
	port = process.env.port || config.port,
	app = express(),
	db = require('./db');

app.use(express.json());
app.use(express.static(__dirname));

app.param('format', function(req, res, next) {
	req.params.format = req.params.format || 'html';
	return next();
});

function getPhotoSizes(photo, callback) {
	flickr.photos.getSizes({ 'photo_id': photo.id }, function(err, result) {
	    callback(null, result.sizes);
	});
}

function getPhotoInfo(photo, callback) {
	flickr.photos.getInfo({ 'photo_id': photo.id }, function(err, result) {
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
	flickr.photosets.getPhotos({ 'photoset_id': config.photoset }, function(err, results) {
		async.map(results.photoset.photo, getPhotoData, function(err, result) {
			callback(result);
		});
	});
}

// REST services
app.get('/api', function (req, res) {
	res.send('cloud RESTful API is running');
});


// Can hit this in the browser to update DB
// Retrieve media and update local DB on POST
app.get('/api/photos', function(req, res) {

	Flickr.tokenOnly({ api_key: config.key, secret: config.secret }, function(error, _flickr) {

		// we can now use "flickr" as our API object,
		// but we can only call public methods and access public data
		flickr = _flickr;
		
		getPhotos(function(result) {
			// Delete everything in the db
			db.photos.remove({ });
			// And replace it with the results
			db.photos.insert(result); // TODO: is this asynch?? how do I know if it has failed?
			// And let the user know
			res.send('Updated database');
		});
	});
});

// Fetch media from local DB on GET
app.get('/api/photos', function(req, res) {
    db.photos.find().toArray(function (err, photos) {
        res.json(photos);
    });
});

// Launch server
app.listen(port);
console.log('Server listening on port %s.', port);