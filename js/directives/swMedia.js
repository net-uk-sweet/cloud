angular.module('cloudApp')
	.directive('swMedia', swMedia);

function swMedia($timeout, MediaService, ImageService) {

	'use strict';

	return {
		restrict: 'E',
		scope: {
			selected: '=',
			loading: '=',
			loaded: '=',
			zoomed: '=',
			paused: '='
		},

		controller: function($scope) {

			$scope.getSelectedImage = function(item) {

				// Parse out the path to the large image from the available sizes
				return MediaService.getImage($scope.selected, 'Large');
			};
		},

		link: function(scope, elem, attr) {

			var transitionEvents = [
				'transitionend',
				'webkitTransitionEnd', 
				'oTransitionEnd', 
				'MSTransitionEnd'
			].join(' ');

			var loadingSelector = '.tag.loading:before',
				image = new Image(),
				src;

			scope.$watch('zoomed', function(newValue, oldValue) {

				if (newValue && newValue !== oldValue) {
					
					src = scope.getSelectedImage(/*newValue*/);

					// scope.loaded = false;
					scope.loading = true;

					// Clear up all the rules jss has created
					jss.remove();

					ImageService.load(src, imageProgressHandler).then(imageLoadedHandler);
				}
			}); 

			function setProgress(percent) {
				jss.set(loadingSelector, { 'width': percent + '%', opacity: '1' });	
			}

			function imageProgressHandler(progress) {

				console.log('swMedia.imageProgressHandler(): ', progress);

				setProgress(progress * 100);
			}

			function imageLoadedHandler(e) {

				$timeout(function() {

					scope.loaded = true;
					scope.loading = false;

					image.src = e;
					elem.css('background-image', 'url(' + image.src + ')');

				}, 1000);
			}

			function clickHandler(e) {
				scope.$apply(function() {
					scope.zoomed = false;
					scope.loaded = false;
				});
			}

			function transitionCompleteHandler(e) {

				// Faded out on close
				if (!scope.zoomed) {
					scope.$apply(function() {
						scope.paused = false;
						scope.selected = null;
					});
				}
			}

			// image.addEventListener('load', imageLoadedHandler);
			// image.addEventListener('error', imageLoadedHandler);

			elem.on('click', clickHandler);
			elem.on(transitionEvents, transitionCompleteHandler);
		}
	};		
}