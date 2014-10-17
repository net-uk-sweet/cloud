/* globals angular */
(function() {

	'use strict';

	angular.module('cloudApp')
		.directive('swMedia', swMedia);

	function swMedia() {

		return {
			restrict: 'E',
			scope: {
				selected: '=',
				loading: '=',
				loaded: '=',
				opened: '='
			},

			controller: function($scope) {

				$scope.getSelectedImage = function(item) {

					// Parse out the path to the large image from the available sizes
					return _.findWhere(item.size, 
						{ label: 'Large' }).source;
				};
			},

			link: function(scope, elem, attr) {

				var image = new Image();
				var src;

				scope.$watch('selected', function(newValue, oldValue) {
					if (newValue && newValue !== oldValue) {
						src = scope.getSelectedImage(newValue);
						if (src !== image.src) {
							scope.loaded = false;
							scope.loading = true;
							image.src = scope.getSelectedImage(newValue); 
						} else {
							scope.loaded = true;
						}
					}
				}); 

				var imageLoadedHandler = function(e) {
					// Need to use apply, otherwise ng doesn't know this happened
					scope.$apply(function() {
						scope.loaded = true;
						scope.loading = false;
					});
					elem.css('background-image', 'url(' + image.src + ')');
				};

				var clickHandler = function(e) {
					scope.$apply(function() {
						scope.opened = false;
						scope.selected = null;
					});
				};

				image.addEventListener('load', imageLoadedHandler);
				image.addEventListener('error', imageLoadedHandler);

				elem.on('click', clickHandler);
			}
		};		
	}

})();