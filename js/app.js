angular.module('cloudApp', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', RouteConfig]);

/*
    TODO:
    	[ ] revisit back and forward
    	[ ] build up speed on scroll 
    	[ ] find a nice spinner icon and matching open icon
        [ ] what's the difference between $observe and $watch?
        [ ] should my service be a Provider w/ config handled in config phase?
        [ ] test package json work?
        [ ] mongodb in package.json? er. no also mongoose?
		[ ] for mobile?
*/

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