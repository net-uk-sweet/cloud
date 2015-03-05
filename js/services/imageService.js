angular.module('app')
	.service('ImageService', ImageService);

function ImageService($http, $q) {

	'use strict';

	// return public API
	return {
		load: load
	};

	// http://stackoverflow.com/questions/14218607/javascript-loading-progress-of-an-image
	function load(url, progressCallback) {

		var deferred = $q.defer();
		var loadProgress = 0;

		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('GET', url, true);
		xmlHttp.responseType = 'arraybuffer';
		
		xmlHttp.onload = function(e) {
			var blob = new Blob([this.response]);
			deferred.resolve(window.URL.createObjectURL(blob));
		};

		xmlHttp.onprogress = function(e) {

			// console.log('ImageService.onprogress(): ', e.loaded / e.total);
			loadProgress = e.loaded / e.total;

			progressCallback(loadProgress);
		};

		xmlHttp.onError = function(e) {
			deferred.reject(e);
		};

		xmlHttp.send();

		return deferred.promise;
	}
}