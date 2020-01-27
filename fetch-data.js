var config = require('./config'),
    Flickr = require('flickrapi'), flickr,
    _ = require('underscore'),
    moment = require('moment'),
    async = require('async'),
    fs = require('fs');

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
		// console.log(err, results);
		async.map(results.photoset.photo, getPhotoData, function(err, result) {
			callback(err, result);
		});
	});
}

function init() {
	async.series([getFlickr, getPhotos], function(err, results) {
		if (!err) {
			const mappedResults = results[1].map(({ id, title, description, dates, size}) => {
				return {
                    id,
					title,
					description,
					dates: {
						taken: dates.taken
					},
					size: size.filter(photo => ['Original', 'Medium', 'Large'].includes(photo.label)).map(filteredPhoto => {
						return {
							...filteredPhoto,
							source: 'http://ian.sweet.uk.net/cloud/proxy-flickr/' + filteredPhoto.source.slice(30)
						}
					})
				}
			});
			fs.writeFileSync('data.json', JSON.stringify(mappedResults));
			process.exit(-1);

			// Replace everything in db with the results from the 2nd in the series 
			// of async calls and a lastModfied date which we can reflect to the admin
			// db.media.remove({ });

			// db.media.insert({ 
			// 	lastUpdated: new Date(),
			// 	photos: results[1] 
			// });

			// console.log(db.media);
			// console.log(db.media.find());

			// Let the user know
			// res.json('Updated database');
		} else {
			// res.send(err);
		}
	});
} 

init();

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