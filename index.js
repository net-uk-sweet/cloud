/*globals require*/
/*jshint node: true */

var config = require('./config'),
	express = require('express'),
	Flickr = require('flickrapi'), flickr,
	_ = require('underscore'),
	moment = require('moment'),
	async = require('async'),
	port = process.env.OPENSHIFT_NODEJS_PORT || config.port,
	ip = process.env.OPENSHIFT_NODEJS_IP || config.ip,
	app = express(),
	db = require('./db'),
	request = require('request');

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
	flickr.photosets.getPhotos({ 'photoset_id': config.photoset, 'user_id': config.user }, function(err, results) {
		// console.log('Got photos');
		async.map(results.photoset.photo, getPhotoData, function(err, result) {
			callback(err, result);
		});
	});
}

function getFlickr(callback) {
	
	var flickrConfig = { 
		api_key: config.key, 
		secret: config.secret 
	};

	Flickr.tokenOnly(flickrConfig, function(err, _flickr) {

		console.log('Connected to flickr API');

		// we can now use "flickr" as our API object,
		// but we can only call public methods and access public data
		flickr = _flickr;

		// We don't need any data from this one
		callback(err, null);
	});
}

function formatDate(isoDate) {
	return moment(isoDate).format('LLLL');
}

// REST services
app.get('/api', function (req, res) {
	res.send('cloud RESTful API is running');
});

// Retrieve media and write to local DB on POST.
// Media rather than photos in case we want to support video in the future.
app.post('/api/media', function(req, res) {

	// Need to authenticate with flickr and then get the photos
	// TODO: we could have better error handling in this sequence
	async.series([getFlickr, getPhotos], function(err, results) {
		if (!err) {

			// Replace everything in db with the results from the 2nd in the series 
			// of async calls and a lastModfied date which we can reflect to the admin
			db.media.remove({ });

			db.media.insert({ 
				lastUpdated: new Date(),
				photos: results[1] 
			});

			// console.log(db.media);
			// console.log(db.media.find());

			// Let the user know
			res.json('Updated database');
		} else {
			res.send(err);
		}
	});
});

app.get('/api/proxy', function(req, res) {
	// res.send('hello' + req.query.url);
	request.get(req.query.url, function(response) {
		console.log('proxy error', response);
		res.send(response);
	}).pipe(res);
});

// Fetch media from local DB on GET
app.get('/api/media', function(req, res) {
    db.media.findOne(function(err, media) {
        res.json(media.photos);
    });
});

// Fetch data for admin section from local DB
app.get('/api/stats', function(req, res) {

	db.media.findOne(function(err, media) {

		if (!media.photos) {
			return;
		}

		var photos = media.photos,
			lastUpdated = media.lastUpdated,
			count = photos.length;

		// TODO: bit of repetition in POST /api/media
		res.json({
			lastUpdated: formatDate(media.lastUpdated),
			currentCount: count,
			latestItem: photos[count - 1]
		});
	});
});

// Launch server
app.listen(port, ip);
console.log('Server listening on %s:%s', ip, port);