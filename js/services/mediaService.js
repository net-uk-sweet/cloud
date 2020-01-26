angular.module('cloudApp')
	.service('MediaService', MediaService);

function MediaService($http, $q) {

	'use strict';

	// return public API
	return {
		getMedia: getMedia,
		getStats: getStats,
		updateMedia: updateMedia,
		getImage: getImage,
		getTitle: getTitle,
		getDescription: getDescription
	};

	function getMedia() {
		var request = $http({
			method: 'get',
			url: 'data.json'
		}); 
		return request.then(handleSuccess, handleError);
	}

	function getStats() {
		var request = $http({
			method: 'get',
			url: 'api/stats'
		});
		return request.then(handleSuccess, handleError);
	}

	function updateMedia() {
		var request = $http({
			method: 'post',
			url: 'api/media'
		});
		return request.then(handleSuccess, handleError);
	}

	// A utility function to avoid repeating the retrieval of images across controllers
	function getImage(item, size) {
		var proxy = 'api/proxy/?url=';
		return item && proxy + 
			(_.findWhere(item.size, { label: size }) 
				|| _.findWhere(item.size, { label: 'Original' })).source;
	}

	// A utility function to avoid repeating the retrieval of the title across controllers
	function getTitle(item) {
		return item && item.title._content || '';		
	}

	function getDescription(item) {
		return item && item.description._content || '';
	}

	function handleError(response) {
		return $q.reject(response.data);
	}

	function handleSuccess(response) {
		return response.data;
	}		
}