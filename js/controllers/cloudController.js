/* globals angular, _ */
angular.module('cloudApp')
	.controller('CloudCtrl', CloudCtrl);

function CloudCtrl($scope, MediaService) {

	'use strict';
	
	// ------------------------------------
	// Bindable properties
	$scope.media = [];
	$scope.selected = null;
	$scope.index = -1; // index starts offset so we can page to first item

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
	$scope.setIndex = setIndex;
	$scope.reverse = reverse;
	$scope.isPrevDisabled = isPrevDisabled;
	$scope.isNextDisabled = isNextDisabled;
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
	
	function reverse() {
		$scope.reversed = !$scope.reversed;
	}

	function setIndex(index) {
		
		$scope.index = index;

		if (!$scope.reversed) {
			index = $scope.media.length - ($scope.index + 1);
		}

		setSelected($scope.media[index]);
	}

	function setSelected(item) {
		$scope.selected = item;
	}

	function getTitle() {
		return MediaService.getTitle($scope.selected);
	}

	function isPrevDisabled() {
		return $scope.index <= 0;
	}

	function isNextDisabled() {
		return $scope.index === $scope.media.length - 1;
	}
}