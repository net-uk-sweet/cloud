angular.module('cloudApp', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', RouteConfig]);

function RouteConfig($routeProvider) {

	'use strict';

	$routeProvider.
		when('/cloud', {
			templateUrl: 'js/partials/cloud.html',
			controller: 'CloudCtrl'
		}).
		when('/admin', {
			templateUrl: 'js/partials/admin.html',
			controller: 'AdminCtrl'
		}).
		otherwise({
			redirectTo: '/cloud'
		});
}