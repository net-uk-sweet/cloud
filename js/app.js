angular.module('cloudApp', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', RouteConfig]);

/*
    TODO:
        [ ] livereload on the go and other build tools
    	[ ] could avoid repetition on client and server by going through api for updated stats
    	[ ] touch
    	[ ] firefox webdeveloper plugin
    	[ ] then fix firefox
    	[ ] find a nice spinner icon and matching open icon
        [ ] what's the difference between $observe and $watch?
        [ ] should my service be a Provider w/ config handled in config phase?
        [ ] does package json work?
        [ ] mongodb in package.json? er. no also mongoose?
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