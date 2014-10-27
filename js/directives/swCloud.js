/* globals angular, TweenLite */

/*
    TODO:
    	[ ] touch
    	[ ] firefox
    	[ ] find a nice spinner icon and matching open icon
        [ ] what's the difference between $observe and $watch?
        [ ] should my service be a Provider w/ config handled in config phase?
        [ ] livereload on the go
        [ ] update flickr library (project won't build from package.json)
        [ ] mongodb in package.json? er. no also mongoose?
        [ ] occasional fail in API call
        [ ] image load indicator
*/

// Style guide suggests using functional rather than owner prefixes
// for directive naming. 

angular.module('cloudApp')
	.directive('swCloud', swCloud);

function swCloud() {

	'use strict';

	// === InjectingFunction === //
	// Injecting function - executed once if directive is used.
	// Useful for bootstrap and global configuration.

	return {

		// === CompilingFunction === //
		// Compiling function (mine isn't a function?)
		// Logic is executed once (1) for every instance of directive in your original 
		// UNRENDERED template.
		// Scope is UNAVAILABLE as the templates are only being cached.
		// You CAN examine the DOM and cache information about what variables
		// or expressions will be used, but you cannot yet figure out their values.
		// Angular is caching the templates, now is a good time to inject new angular 
		// templates as children or future siblings to automatically run..
		
		// Not required. No access to scope. Shoud return a link function.
		// Essentially akin to a static, ie. ng-repeat directive gets cloned multiple times, 
		// but the compile fn is only executed once.

		restrict: 'E', // AEC - attribute, element, comment
		scope: { // This gives us an isolate scope
			'media': '=',
			'selected': '=',
			'date': '=',
			'loading': '=',
			'loaded': '=',
			'opened': '=',
			'paused': '=',
			'reversed': '=',
			'timeRatio': '=',
			'setSelected': '&' // Pattern for using the same / similar name which avoids shadowing? 
		},

		// Possible scopes are :-
		// 1. default		- we get the parent scope (the default)
		// 2. scope: true 	- child scope (prototypally inherit parent scope)
		// 3. scope: {}		- Isolate scope
		//		* @ 	- One-way text (string only) binding
		//		* = 	- Two-way binding for all data types
		// 		* &		- To call a function in parent scope 

		// We use a directive controller for directive specific business logic and / 
		// or for setting up a Directive to Directive API to allow communication.
		controller: function($scope) {

			// Cache the date so we only update model on change
			var _date = null;

			$scope.updateDate = function(date) {
				if (date !== _date) {
					_date = date;
					$scope.$evalAsync(function() {
						$scope.date = _date.toFormat('DD-MMMM-YYYY');
					});
				}
			};

			$scope.tagClickHandler = function(item) {

				// Not sure why we need to do this, but param needs to be 
				// passed as a property of an object literal which matches
				// the name defined when we assign the function in our 
				// directive's HTML.
				// $scope.set({ item: item });

				// Or, if we don't use parenthesis in the directive statement
				// in the HTML, we can pass the param to the controller function
				// as follows. (Advantage is that we don't need to keep the param
				// name in the HTML matched to the param name we use here).
				// $scope.itemSelected()(item);

				$scope.$apply(function() {
					if (item === $scope.selected && $scope.loaded) {
						$scope.opened = true;
					} else {
			    		$scope.setSelected()(item);
					}
				});
			};

			$scope.isLoading = function(item) {
				return $scope.loading && $scope.selected === item;
			};

			$scope.isLoaded = function(item) {
				return $scope.loaded && $scope.selected === item;
			};
		},
		
		link: function(scope, elem, attr) {

			// === LinkingFunction === //
	        // Logic is executed once (1) for every RENDERED instance.
	        // Once for each row in an ng-repeat when the row is created.
	        // Note that ng-if or ng-switch may also affect if this is executed.
	        // Scope IS available because controller logic has finished executing.
	        // All variables and expression values can finally be determined.
	        // Angular is rendering cached templates. It's too late to add templates 
	        // for angular to automatically run. If you MUST inject new templates, you 
	        // must $compile them manually.

			// three.js actors
	    	var scene, renderer, camera;

		    // THREE settings
		    var fov = 30, near = 1, far = 1000;

		    // General settings - should probably be in a JSON config
		    var latency = 50, scrollSpeed = 20, offset = 2500;

		    // Local state 
		    var cameraPosition, targetPosition, 
		    	todayDate, startDate, 
		    	firstDate, endDate,
		    	animating; 

		    // Width and height on controller?
			var stageWidth, stageHeight;
			var media;

			// Directive starting point
		    function init() {

		    	initScene();
		    	initItems();
		    	animate();

		    	// Remember elem is already jqLite wrapped
		    	elem.on('mousemove', mouseMoveHandler);
		    	elem.on('mousewheel DOMMouseScroll', mouseWheelHandler);
		    }

		    // Initialise three scene
		    function initScene() {

		        stageWidth = elem[0].offsetWidth;
		        stageHeight = elem[0].offsetHeight;

		        // todayDate to firstDate is our range of time which remains constant
		        // startDate and endDate toggle between these values when the range is reversed
		        startDate = todayDate = new Date('2014', '01', '28'); // TODO: this should probably be set higher up
    			endDate = firstDate = new Date(scope.media[0].dates.taken); // potentially sketchy if order changes

		        targetPosition = { x: stageWidth / 2, y: stageWidth / 2, z: offset };

		      	renderer = new THREE.CSS3DRenderer();
		        renderer.setSize(stageWidth, stageHeight);
		        elem.append(renderer.domElement);
		        
		        // create a scene
		        scene = new THREE.Scene();

		        // put a camera in the scene
		        camera = new THREE.PerspectiveCamera(fov, stageWidth / stageHeight, near, far);
		        camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
		        scene.add(camera);

		        // Referring to this quite a lot, so can save a look up each time
		        cameraPosition = camera.position;

		        // transparently support window resize
		        THREEx.WindowResize.bind(renderer, camera);
		    }

		    // Initialise three items
		    function initItems() {
				// console.log('init items', scope.media.length);
				var el, date, display, data, position;

				angular.forEach(scope.media, function(item) {

					// Using ng-repeat on these was terrible for performance
					el = document.createElement('div');

					// TODO: this would be more efficient if we used the same date object
					date = new Date(item.dates.taken);
					position = getPosition(date); 

					display = new THREE.CSS3DObject(el);
					display.position.x = position.x;
					display.position.y = position.y;
					display.position.z = position.z;

					item.display = display;
					item.position = {}; 
					item.date = date;

					el.id = item.id;
					el.className = 'tag';
					el.textContent = item.title._content;

					el.addEventListener('click', function(item) {
						return function() { 
							scope.tagClickHandler(item); 
						};
					}(item));
    
					scene.add(display);
				});
		    }

			// Gets the position of an item in 3D space
			function getPosition(date) {
			    
			    var dt = startDate.getSecondsBetween(date);

			    return {
			        x: (Math.random() * stageWidth),
			        y: (Math.random() * stageHeight),
			        z: dt * (1 / scope.timeRatio)
			    };
			}

		    function animate() {
		    	requestAnimationFrame(animate);
		    	render();
		    }

		    function render() {

				var delta = (cameraPosition.z - offset) * scope.timeRatio, 
					item, z, len;

		        if (!scope.paused) {
		            cameraPosition.x += (targetPosition.x - cameraPosition.x) / latency;
		            cameraPosition.y += (targetPosition.y - cameraPosition.y) / latency;
		            cameraPosition.z += (targetPosition.z - cameraPosition.z) / latency;
		        }

		        if (animating) {

		         	len = scope.media.length;
		            
		            for (var i = len - 1; i >= 0; i --) {
		                item = scope.media[i];
		            	z = (item.position.z - item.display.position.z) / latency;
		                item.display.position.z += z;
		            }

		            // if the last item is within range of its target, stop processing
		            animating = ((item.position.z - item.display.position.z) / 50) << 1;
		        }

		        // Update the current date read out 
		      	// TODO: this is probably costly in terms of performance
		        scope.updateDate(startDate.clone().addSeconds(delta));

		        // Render the scene
		        renderer.render(scene, camera);
		    }

			function zoomTo(item) {

			    scope.paused = true;

			    TweenLite.killTweensOf(cameraPosition);
			    TweenLite.to(camera.position, 1, {
			        z: item.display.position.z + offset,
			        x: item.display.position.x,
			        y: item.display.position.y,
			        onComplete: zoomCompleteHandler
			    });
			}

			function reverse() {

				startDate = scope.reversed ? firstDate : todayDate;
				endDate = scope.reversed ? todayDate : firstDate;

				scope.timeRatio *= -1;

				updatePositions();
			}

			function updatePositions() {

				animating = true;

				angular.forEach(scope.media, function(item) {
					item.position = getPosition(new Date(item.dates.taken));
				});
			}

			function addClass(_class) {
				angular.element(document.getElementById(scope.selected.id))
					.addClass(_class);
			}

		    // Watches and listeners

			// We only need this one the once, so we can unbind it on execution
			var unbindMediaWatch = scope.$watch('media', function() {
				if (scope.media.length) {
					init();
					unbindMediaWatch();
				}
			});

			scope.$watch('selected', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					zoomTo(newValue);
				}
			});

			scope.$watch('loading', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					addClass('loading');
				}
			});

			scope.$watch('loaded', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					addClass('loaded');
				}
			});

			scope.$watch('reversed', function(newValue, oldValue) {
				if (newValue !== oldValue) {
					reverse(newValue);
				}
			});

			scope.$watch('timeRatio', function(newValue, oldValue) {
				if (Math.abs(newValue) !== Math.abs(oldValue)) {
					updatePositions();
				}
			});

		    // Handlers

		    function zoomCompleteHandler(e) {
		    	// Set off load on ngMedia directive
		    	// Nice animation on load and then change visual state of tag
		    	// On further click, launch media
		    }

			function mouseMoveHandler(e) {
			    targetPosition.x = stageWidth - e.clientX;
			    targetPosition.y = e.clientY;
			}

		    function mouseWheelHandler(e) {
		    	targetPosition.z -= e.deltaY * scrollSpeed;
		    }
		}
	};    	
}