/* globals angular, _ */
angular.module('cloudApp')
	.controller('CloudCtrl', CloudCtrl);

function CloudCtrl($scope, MediaService) {

	'use strict';
	
	// ------------------------------------
	// Bindable properties
	$scope.media = [];
	$scope.selected = null;

	$scope.date = ''; // The date readout on the UI
	$scope.timeRatio = 600; // Effecively the number of seconds represented by a pixel

	// Cloud state
	$scope.paused = false;
	$scope.reversed = false; 

	// Media directive state
	$scope.loading = false;
	$scope.loaded = false;
	$scope.opened = false;

	// -------------------------------------
	// Bindable methods
	$scope.setSelected = setSelected;
	$scope.reverse = reverse;
	$scope.getTitle = getTitle;

	// Grab data to kick things off
	MediaService.getMedia()
		.then(function(media) {
			// Got data, set the media property
			$scope.media = media;
		}, function(error) {
			// No data, or bad data
			console.log(error);
		});
	
	$scope.boing = function() {
		console.log('boing');
	};

	function reverse() {
		$scope.reversed = !$scope.reversed;
	}

	function setDeltaZ(delta) {
		$scope.deltaz = delta;
	}

	function setSelected(item) {
		$scope.selected = item;
	}

	function getTitle() {
		return MediaService.getTitle($scope.selected);
	}
}