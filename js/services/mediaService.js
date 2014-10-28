/* globals angular */
angular.module('cloudApp')
	.service('MediaService', MediaService);

function MediaService($http, $q) {

	'use strict';

	// return public API
	return {
		getMedia: getMedia,
		updateMedia: updateMedia
	};

	function getMedia() {
		var request = $http({
			method: 'get',
			url: 'api/photos'
		}); 
		return request.then(handleSuccess, handleError);
	}

	function updateMedia() {
		var request = $http({
			method: 'post',
			url: 'api/photos'
		});
		return request.then(handleSuccess, handleError);
	}

	function handleError(response) {
		return $q.reject(response.data);
	}

	function handleSuccess(response) {
		// Even on success, server might have returned a load of rubbish
		return typeof response.data === 'object' ? 
			response.data : handleError(response);
	}		
}