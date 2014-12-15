angular.module('cloudApp')
	.controller('CloudCtrl', CloudCtrl);

function CloudCtrl($scope, $rootScope, MediaService) {

	'use strict';
	
	// ------------------------------------

	// Bindable properties
	$scope.debug = false;

	$scope.media = [];
	$scope.selected = null;
	$scope.date = ''; // The date readout on the UI

	// 1 / timeRatio is the number of seconds represented by a pixel
	$scope.timeRatio = 4100; 

	// Cloud state
	$scope.paused = false;
	$scope.animating = false;
	$scope.reversed = false; 

	// Media directive state
	$scope.loading = false;
	$scope.loaded = false;
	$scope.zoomed = false;

	// -------------------------------------

	// Bindable methods
	$scope.reverse = reverse;
	$scope.getTitle = getTitle;
	$scope.page = page;

	// Grab data to kick things off
	MediaService.getMedia()
		.then(function(media) {
			// Got data, set the media property
			$scope.media = media;
		}, function(error) {
			// No data, or bad data
			console.log(error);
		});
	
	function reverse() {
		$scope.reversed = !$scope.reversed;
	}

	function getTitle() {
		return MediaService.getTitle($scope.selected);
	}

	function page(delta) {
		// It's probably bad to use rootScope, but I couldn't come
		// up with a cleaner alternative :(
		$rootScope.$emit('page', delta);
	}
}