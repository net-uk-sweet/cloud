/* globals angular, _ */
(function() {

	'use strict';

	angular.module('cloudApp')
		.controller('CloudCtrl', CloudCtrl);

	function CloudCtrl($scope, MediaService) {

		$scope.media = [];
		$scope.selected = null;

		$scope.loading = false;
		$scope.loaded = false;
		$scope.opened = false;

		// Service returns a promise?
		MediaService.getMedia().then(function(media) {
			$scope.media = media;
		});
		
		/*
		MediaService.updateMedia().then(function(result) {
			console.log(result);
		});
		*/

		$scope.setSelected = function(item) {
			console.log('item selected', item);
			$scope.selected = item;
		};	
	}

})();