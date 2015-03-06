angular.module('cloudApp')
	.directive('swAutoFire', swAutoFire);

function swAutoFire($timeout) {

	'use strict';

	return {
		restrict: 'A',
		scope: {},

		link: function(scope, elem, attr) {

			// Grab attributes 
			var event = attr.event || 'click',
				minSpeed = scope.$eval(attr.minSpeed) || 1,
				maxSpeed = scope.$eval(attr.maxSpeed) || 10,
				steps = scope.$eval(attr.steps) || 10;

			// State
			var frameDuration,
				timeout,
				step = 0, 
				dspeed = maxSpeed - minSpeed;
				
			function startTimer() {

				timeout = $timeout(function() {
					
					elem.triggerHandler(event);

					step = (step == steps) ? steps : step + 1;
				
					frameDuration = 1000 / (maxSpeed - 
						(Math.cos((step / steps) * 
						(Math.PI / 2)) * dspeed));

					startTimer();

				}, step ? frameDuration : 0);
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