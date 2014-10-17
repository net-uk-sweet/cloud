/* globals angular */
(function() {
	
	'use strict';

	angular.module('cloudApp')
		.directive('swRepeatComplete', swRepeatComplete);

	function swRepeatComplete($timeout) {

		return {
			restrict: 'A',
			link: function(scope, elem, attr) {

				// This is a pretty unsatisfactory way, it seems to me, 
				// to ensure that repeat elements are available in my 
				// cloud directive. However, it seems to work consistently
				// unlike the method of watching for changes in the other
				// directive and proceeding when the number of child 
				// elements matches the length of the model.
				
				if (scope.$last) {
					$timeout(function() {
						scope.$emit('repeatComplete');
					});
				}
			}
		};		
	}

})();