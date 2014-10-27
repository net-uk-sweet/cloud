/* globals angular, _ */
angular.module('cloudApp')
	.controller('AdminCtrl', AdminCtrl);

function AdminCtrl($scope, MediaService) {

	'use strict';

	// ------------------------------------
	// Bindable properties
	$scope.status = 'Last updated 1950';

	// -------------------------------------
	// Bindable methods
	$scope.update = update;

	function update() {
		$scope.status = 'Updating media';
		MediaService.updateMedia().then(successHandler, errorHandler);
	}

	function successHandler(response) {
		$scope.status = 'Success';
	}

	function errorHandler(response) {
		$scope.status = response;
	}
}