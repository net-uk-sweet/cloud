angular.module('cloudApp', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', RouteConfig]);

/*
    TODO:
    	[ ] check in and merge down
    	[ ] still not centred
    	[ ] tidy up files - iconic.css, js/app.js
    	[ ] slider styling or zoom functionality
    	[ ] controller as syntax and this in controller ($scope as a special case for $on, $emit etc)
    	[ ] basic access control
        [ ] what's the difference between $observe and $watch?
        [ ] directive on github?
        [ ] should my service be a Provider w/ config handled in config phase?
        [ ] test package json work?
        [ ] mongodb in package.json? er. no also mongoose?
		[ ] for mobile?
		[ ] hosting
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