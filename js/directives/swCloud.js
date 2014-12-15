// Style guide suggests using functional rather than owner prefixes
// for directive naming. 

angular.module('cloudApp')
	.directive('swCloud', swCloud);

function swCloud($rootScope, $timeout) {

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
			'debug': '=',
			'media': '=',
			'selected': '=',
			'date': '=',
			'loading': '=',
			'loaded': '=',
			'zoomed': '=',
			'paused': '=',
			'animating': '=',
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
						$scope.date = _date.format('DD-MMMM-YYYY');
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
			    	$scope.selected = item;
				});
			};

			$scope.isLoading = function(item) {
				return $scope.loading && isSelected(item);
			};

			$scope.isLoaded = function(item) {
				return $scope.loaded && isSelected(item);
			};

			function isSelected(item) {
				return $scope.selected === item;
			}
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
		    var latency = 50, 
		    	scrollSpeed = 3000, 
		    	offsetz = 2500, 
		    	offsety = 76; // height of the controls at the bottom

		    // Local state 
		    var cameraPosition, targetPosition, 
		    	todayDate, startDate, 
		    	firstDate, endDate,
		    	timeRatio; 

		    // Width and height on controller?
			var stageWidth, stageHeight;

			var media;

			// Directive starting point
		    function init() {

		    	// console.log("Init");

		    	initScene();
		    	initItems();
		    	animate();

		    	// Remember elem is already jqLite wrapped
		    	angular.element(document).on('mousemove', mouseMoveHandler);
		    	angular.element(document).on('mousewheel DOMMouseScroll', mouseWheelHandler);
		    }

		    // Initialise three scene
		    function initScene() {

		        stageWidth = elem[0].offsetWidth;
		        stageHeight = elem[0].offsetHeight;

		        // todayDate to firstDate is our range of time which remains constant
		        // startDate and endDate toggle between these values when the range is reversed
		        startDate = todayDate = moment();
		        // potentially sketchy if order changes
    			endDate = firstDate = moment(scope.media[0].dates.taken); 

		        targetPosition = { 
		        	x: stageWidth / 2, 
		        	y: (stageHeight + offsety) / 2,
		        	z: offsetz
		        };

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
					date = moment(item.dates.taken);
					position = getPosition(date);

					display = new THREE.CSS3DObject(el);
					display.position.x = position.x;
					display.position.y = position.y;
					display.position.z = position.z;

					item.display = display;
					item.position = position; 
					item.date = date;

					el.id = item.id;
					el.className = 'tag';
					el.textContent = scope.debug ? item.dates.taken : item.title._content;
					el.setAttribute('data-content', el.textContent);

					el.addEventListener('click', function(item) {
						return function() { 
							scope.tagClickHandler(item); 
						};
					}(item));
    
					scene.add(display);
				});
		    }

			function getPosition(date) {

			    var dt = getSecondsBetween(date, startDate);
			    // console.log(dt * timeRatio);

			    return {
			    	x: Math.random() * stageWidth,
			    	y: Math.random() * stageHeight,
			    	z: dt * timeRatio
			    };
			}

			// TODO: Can add these to the moment prototype with moment.fn.whatever
			function getSecondsBetween(date_1, date_2) {
				return ((date_1.clone().valueOf() - date_2.clone().valueOf()) / 1000) | 0;
			}

			function addSeconds(date, seconds) {
				return date.clone().seconds(date.seconds() + seconds);
			}

		    function animate() {
		    	requestAnimationFrame(animate);
		    	render();
		    }

		    function render() {

				var delta, item, z, len, home;

		        if (!scope.paused) {
		            cameraPosition.x += (targetPosition.x - cameraPosition.x) / latency;
		            cameraPosition.y += (targetPosition.y - cameraPosition.y) / latency;
		            cameraPosition.z += (targetPosition.z - cameraPosition.z) / latency;
		        }

		        if (scope.animating && !scope.paused) {

		         	len = scope.media.length;
		            home = true;

		            for (var i = len - 1; i >= 0; i --) {

		                item = scope.media[i];
		            	z = (item.position.z - item.display.position.z) / latency;
		                item.display.position.z += z;

		                // If any item is more than a pixel away from its target, 
		                // we're not finished animating yet.
		                if ((Math.abs((item.position.z - item.display.position.z)) << 1)) {
		                	home = false;
						}
		            }

		            scope.animating = !home;
		        } 

		        // if (!(scope.animating || scope.paused)) {
		        if (!scope.animating) {
			        // // Update the current date read out
			        // Don't want this happening when we're animating or it goes crazy
		        	delta = (cameraPosition.z - offsetz) / timeRatio; 
		        	if (scope.reversed) delta *= -1;
			        scope.updateDate(addSeconds(startDate, delta));
		        }

		        // Render the scene
		        renderer.render(scene, camera);
		    }

			function zoomTo(item) {

			    scope.paused = true;

			    TweenLite.killTweensOf(cameraPosition);
			    TweenLite.to(camera.position, 1, {
			        z: item.display.position.z + offsetz,
			        x: item.display.position.x,
			        y: item.display.position.y,
			        onComplete: zoomCompleteHandler
			    });
			}

			function startAnimating() {

				scope.animating = true;

				scope.paused = false;
				scope.selected = null;
			}

			function reversePositions() {

				// The total range in seconds adjusted by our ratio
				var dt = getSecondsBetween(todayDate, firstDate) * Math.abs(timeRatio) * -1;

				startAnimating();

				angular.forEach(scope.media, function(item) {
					item.position.z = dt - item.position.z;
				});
			}

			function updatePositions(oldTimeRatio) {

				startAnimating();

				angular.forEach(scope.media, function(item) {
					item.position.z = (item.position.z / oldTimeRatio) * timeRatio;
				});
			}

		    function updateCameraZ(delta) {

		    	targetPosition.z -= delta * scrollSpeed;
		    }

			function addClass(_class) {

				var selected = getSelected();

				if (selected) {
					selected.addClass(_class);
				}
			}

			function removeClass(_class) {

				var selected = getSelected();

				if (selected) {
					selected.removeClass(_class);
				}
			}

			function fadeIn() {
				getAll().removeClass('fade disabled');
			}

			function fadeOut() {
				
				getAll().addClass('fade disabled');
		    	
		    	if (scope.selected) {
		    		getSelected().removeClass('fade disabled');
		    	}
			}

			// jqLite wrapped versions of elements we need
			function getSelected() {
				return angular.element(document.getElementById(scope.selected.id));
			}

			function getAll() {
				return angular.element(document.querySelectorAll('.tag'));
			}

			// -----------------------------------------------------------------
		    // Watches and listeners
			// -----------------------------------------------------------------

			// We only need this one the once, so we can unbind it on execution
			var unbindMediaWatch = scope.$watch('media', function() {
				if (scope.media.length) { 
					init();
					unbindMediaWatch();
				}
			});

			scope.$watch('selected', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					addClass('selected');
					zoomTo(newValue);
				}
			});

			scope.$watch('loading', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					// console.log('Adding class loading to:', getSelected());
					addClass('loading');
				}
			});

			scope.$watch('paused', function(newValue, oldValue) {
				if (!newValue && newValue !== oldValue) {
					fadeIn();
				}
			});

			scope.$watch('reversed', function(newValue, oldValue) {
				
				if (newValue !== oldValue) {

					// Flip the start and end dates for the read out
					startDate = scope.reversed ? firstDate : todayDate;
					endDate = scope.reversed ? todayDate : firstDate;

					// And invert the z position of each item
					reversePositions();
				}
			});

			// Switch classes on selected when zoomed is false ..
			// Naming ain't fantastic, but that's the point at which image window is closed
			scope.$watch('zoomed', function(newValue, oldValue) {

				if (!newValue && newValue !== oldValue) {
					removeClass('selected');
					removeClass('loading');
					addClass('visited');
				}
			});

			scope.$watch('timeRatio', function(newValue, oldValue) {

				var oldTimeRatio = timeRatio;

				// Convert from a manageable whole number ie. 600
				// To a usable float, ie. 0.0016666666666666668
				timeRatio = 1 / newValue;

				// console.log(timeRatio);

				if (newValue !== oldValue) {
					// convert existing target camera position z according to new value
					targetPosition.z = offsetz + ((targetPosition.z - offsetz) / oldTimeRatio) * timeRatio;
					updatePositions(oldTimeRatio);
				}
			});

			$rootScope.$on('page', function(e, delta) {
				updateCameraZ(delta);
			});


			// -----------------------------------------------------------------
		    // Handlers
			// -----------------------------------------------------------------

			function mouseMoveHandler(e) {

				var y = e.clientY,
					inBounds = y < (stageHeight - offsety);
			    
			    targetPosition.x = inBounds ? stageWidth - e.clientX : stageWidth / 2;
			    targetPosition.y = inBounds ? y : stageHeight / 2;
			}

		    function mouseWheelHandler(e) {

				var d = e.detail, w = e.wheelDelta,
				    n = 225, n1 = n-1, delta;

				// Normalize delta
				// http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
				d = d ? w && (f = w/d) ? d/f : -d/1.35 : w/120;
				// Quadratic scale if |d| > 1
				d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
				// Delta *should* not be greater than 2...
				delta = Math.min(Math.max(d / 2, -1), 1);	

				scope.$apply(function() { 
					updateCameraZ(delta);
				});	  	
		    }

		    function zoomCompleteHandler() {

		   		var date = moment(scope.selected.dates.taken);
		   		scope.updateDate(date);

		   		fadeOut();

		   		$timeout(function() {
		   			scope.zoomed = true; 
		   		}, 2000);
		    }
		}
	};    	
}