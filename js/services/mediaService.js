/* globals angular */
(function() {

	'use strict';

	angular.module('cloudApp')
		.service('MediaService', MediaService);

	function MediaService($http) {

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

		function updateDatabase() {

		}

		function handleError(response) {
			return $q.reject(response.data.message);
		}

		function handleSuccess(response) {
			return response.data;
		}		
	}

})();