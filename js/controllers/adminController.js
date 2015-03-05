angular.module('app')
	.controller('AdminCtrl', AdminCtrl);

function AdminCtrl($scope, MediaService) {

	'use strict';

	// ------------------------------------
	// Bindable properties
	$scope.lastUpdated = '';
	$scope.currentCount = '';
	$scope.latestItem = '';

	// -------------------------------------
	// Bindable methods
	$scope.getTitle = getTitle;
	$scope.getImage = getImage;
	$scope.update = update;

	getStats();

	// Grab data to kick things off
	function getStats() {
		MediaService.getStats()
			.then(function(stats) {
				// Got data, set the bindable properties
				$scope.lastUpdated = stats.lastUpdated;
				$scope.currentCount = stats.currentCount;
				$scope.latestItem = stats.latestItem;
			}, 
			errorHandler);
	}

	function update() {
		$scope.lastUpdated = 'Updating ...';
		MediaService.updateMedia().then(getStats, errorHandler);
	}

	function getImage() {
		// Parse out the path to the large image from the available sizes
		return MediaService.getImage($scope.latestItem, 'Medium');
	}

	function getTitle() {
		return MediaService.getTitle($scope.latestItem);
	}

	function successHandler(response) {
		$scope.status = 'Success';
	}

	function errorHandler(response) {
		$scope.status = response;
	}
}