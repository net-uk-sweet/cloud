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
	$scope.steps = 100;
	$scope.maxZoom = 10000;
	$scope.minZoom = 200;

	// Cloud state
	$scope.paused = false;
	$scope.animating = false;
	$scope.reversed = false; 
	// $scope.mouseOver = true;

	// Media directive state
	$scope.loading = false;
	$scope.loaded = false;
	$scope.zoomed = false;

	// -------------------------------------

	// Bindable methods
	$scope.reverse = reverse;
	$scope.getTitle = getTitle;
	$scope.getDescription = getDescription;
	$scope.page = page;
	$scope.zoom = zoom;
	$scope.isUIDisabled = isUIDisabled;

	// Grab data to kick things off
	MediaService.getMedia()
		.then(function(media) {
			// Got data, set the media property
			$scope.media = media;
			// console.log($scope.media);
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

	function getDescription() {
		return MediaService.getDescription($scope.selected);
	}

	function page(delta) {
		// It's probably bad to use rootScope, but I couldn't come
		// up with a cleaner alternative :(
		$rootScope.$emit('page', delta);
	}

	function zoom(delta) {

		// TODO: parsing the int must be repeated a couple of times
		// min, max and steps are all duplicated in view code also
		var timeRatio = parseInt($scope.timeRatio, 10) + 
			(delta * $scope.steps);

		if (timeRatio < $scope.minZoom) {
			timeRatio = $scope.minZoom;
		}
		if (timeRatio > $scope.maxZoom) {
			timeRatio = $scope.maxZoom;
		}

		$scope.timeRatio = timeRatio;
	}

	function isUIDisabled() {
		return $scope.selected !== null;
	}
}