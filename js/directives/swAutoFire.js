/* globals angular, _ */
angular.module('cloudApp')
	.directive('swAutoFire', swAutoFire);

function swAutoFire($rootScope, $timeout) {

	'use strict';

	// TODO: setting defaults in directive?
	return {
		restrict: 'A',
		scope: {},

		// TODO: this is okay for my purposes, but it might be possible to generalise it
		// 		and turn it into something useful and reusable. 
		link: function(scope, elem, attr) {

			// Settings
			var delta = parseInt(attr.delta, 10),
				minSpeed = 10, // start speed in events per second
				maxSpeed = 20, // maximum speed in events per second
				steps = 20; // the number of steps to reach the maximum speed

			// State
			var frameDuration,
				timeout,
				step = 0, 
				dspeed = maxSpeed - minSpeed;
				
			function startTimer() {

				timeout = $timeout(function() {
					
					if (step) {
						// Using rootScope is probably bad, but couldn't 
						// find a better way of doing this.
						$rootScope.$emit('page', delta);
						// elem.triggerHandler('click');
					} 
					
					step = (step == steps) ? steps : step + 1;
					
					frameDuration = 1000 / (maxSpeed - (Math.cos((step / steps) * 
						(Math.PI / 2)) * dspeed));

					startTimer();

				}, step ? frameDuration : 0); // Make sure event fires initially
			}

			function stopTimer() {
				step = 0;
				$timeout.cancel(timeout);
			}

			function mouseDownHandler() {
				startTimer();
			}

			function mouseUpHandler() {
				stopTimer();
			}

			elem.on('mousedown', mouseDownHandler);
			elem.on('mouseup mouseout', mouseUpHandler);
		}
	};		
}