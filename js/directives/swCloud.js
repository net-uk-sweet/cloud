/* globals angular, TweenLite */
(function() {

	'use strict';

    /*
        TODO:
        	[ ] find a nice spinner icon and matchin open icon
            [ ] what's the difference between $observe and $watch?
            [ ] should my service be a Provider w/ config handled in config phase?
            [x] need more images
            [x] distinguish between POST and GET for a single API endpoint
            [x] jsLint on the go
            [ ] livereload on the go
            [ ] update flickr library (project won't build from package.json)
            [ ] mongodb in package.json? er. no also mongoose?
            [x] cache image data references in mongodb
            [ ] occasional fail in API call
            [ ] image load indicator
            [x] rendering @ middle distance (CSSRenderer)
            [x] update to use local dependencies
            [x] plugin the clicks again
            [?] bin off jquery
            [ ] flip it
            [ ] doesn't work in firefox
    */

    // image opening
    // date
    // title

    angular.module('cloudApp')
    	.directive('swCloud', swCloud);

    function swCloud() {
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
				'loading': '=',
				'loaded': '=',
				'opened': '=',
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

				// $scope.selectedItem = null;
				// $scope.initialised = false;

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

					if (item === $scope.selected && $scope.loaded) {
						$scope.opened = true;
					} else {
			    		$scope.setSelected()(item);
					}
				};

				$scope.isLoading = function(item) {
					return $scope.loading && $scope.selected === item;
				};

				$scope.isLoaded = function(item) {
					return $scope.loaded && $scope.selected === item;
				};
			},
			
			template: [
				'<p class="tag" id="{{item.id}}" ng-repeat="item in media" ',
					'ng-class="{loading: isLoading(item), loaded: isLoaded(item)}" ',
					'sw-repeat-complete ng-click="tagClickHandler(item)">',
				'{{::item.title._content}}</p>'
			].join(''),

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
		    	var stats, scene, renderer, camera;

			    // THREE settings
			    var fov = 35,
			        near = 500,
			        far = 300000;

			    // General settings
			    var latency = 50, // on mousemove and scroll movement
			    	// TODO: shit name
			        secondsPerPixel = 600, // number of seconds represented by a pixel
			        scrollSpeed = 20,
			        offset = 2500;

			    // State - may very well want some of this in our controller
			    var cameraPosition, todayDate, firstDate, 
			    	paused, selected, animating, reversed; 

			    // Width and height on controller?
				var stageWidth, stageHeight;
				var media, startDate;

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

			    	// console.log('Initialising three scene');

			    	// Need jQuery for this - what's the jqLite equivalent?
			        stageWidth = elem[0].offsetWidth;
			        stageHeight = elem[0].offsetHeight;

			        // Can set today to be in the past to avoid scrolling to see older pictures
			        todayDate = new Date('2014', '01', '28'); 

			        cameraPosition = { x: stageWidth / 2, y: stageWidth / 2, z: offset };

			      	renderer = new THREE.CSS3DRenderer();
			        renderer.setSize(stageWidth, stageHeight);
			        elem.append(renderer.domElement);
			        
			        // create a scene
			        scene = new THREE.Scene();

			        // put a camera in the scene
			        camera = new THREE.PerspectiveCamera(fov, stageWidth / stageHeight, near, far);
			        camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
			        scene.add(camera);

			        // Mr. Doob's stats
			        stats = new Stats();
			        stats.domElement.style.position = 'absolute';
			        stats.domElement.style.top = '0px';
			        elem.append(stats.domElement);

			        // transparently support window resize
			        THREEx.WindowResize.bind(renderer, camera);
			    }

			    // Initialise three items
			    function initItems() {
					// console.log('init items', scope.media.length);
					var el, date, display, data, position;

					angular.forEach(scope.media, function(item) {

						el = document.getElementById(item.id);
						date = new Date(item.dates.taken);

						position = getPosition(date); // TODO: lot of new dates created

						display = new THREE.CSS3DObject(el);
						display.position.x = position.x;
						display.position.y = position.y;
						display.position.z = position.z;

						// Store the 
						item.display = display;
						item.position = {}; 
						item.date = date;

						// console.log(display);
						scene.add(display);
					});
			    }

				// Gets the position of an item in 3D space
				function getPosition(date, reverse) {
				    
				    var dt = reverse ? 
				    	date.getSecondsBetween(firstDate) :
				    	todayDate.getSecondsBetween(date);

				    return {
				        x: (Math.random() * stageWidth),
				        y: (Math.random() * stageHeight),
				        z: dt * (1 / secondsPerPixel)
				    };
				}

			    function animate() {
			    	requestAnimationFrame(animate);
			    	render();
			    }

			    function render() {
			    	// return;
			    	// console.log('Rendering');

					var dt = (camera.position.z - offset) * secondsPerPixel, 
			            start, date, item, len = scope.media.length;

			        // Could possibly switch the start date in the reverse function
			        // on time stretch we want to go to the set starting date aussi
			        if (reversed) {
			            dt *= -1;
			            start = firstDate;
			        } else {
			            start = todayDate;
			        }

			        date = start.clone().addSeconds(dt);

			        // var dt = (camera.position.z - offset) * secondsPerPixel,
			        //     today = todayDate.clone(),
			        //     date = today.addSeconds(dt),
			        //     len = media.length, item;

			        if (!paused) {
			            camera.position.x += (cameraPosition.x - camera.position.x) / latency;
			            camera.position.y += (cameraPosition.y - camera.position.y) / latency;
			            camera.position.z += (cameraPosition.z - camera.position.z) / latency;
			        }

			        if (animating) {
			         
			            for (var i = len - 1; i >= 0; i --) {
			                item = scope.media[i];
			                item.display.position.z += (item.position.z - item.display.position.z) / latency;
			            }

			            // if the last item is within range of its target, stop processing
			            animating = ((item.position.z - item.display.position.z) / 50) << 1;
			        }

			        // updateDate(date.toFormat('DD-MMMM-YYYY'));

			        // Render the scene
			        renderer.render(scene, camera);

			        // update stats
			        stats.update();
			    }

				function zoomTo(item) {

				    paused = true;

				    TweenLite.killTweensOf(camera.position);
				    TweenLite.to(camera.position, 1, {
				        z: item.display.position.z + offset,
				        x: item.display.position.x,
				        y: item.display.position.y,
				        onComplete: zoomCompleteHandler
				    });
				}

			    // Watches and listeners

			    // We can init when we have an ng-repeat element for each 
			    // of our media items. 
			    // I like this, but bloke on internet says I should avoid 
			    // events and watch for changes ot view state on the controller
			    scope.$on('repeatComplete', init);

			    // Watch returns a function which can be used to unbind the watch
			    // var unbindWatch = scope.$watch(function() {
			    // 	if (elem.children().length === scope.media.length) {
			    // 		$timeout(init);
			    // 		unbindWatch();
			    // 	}
			    // });
				
				// We would use $observe to watch the value of an interpolated
				// DOM attribute eg. my-attr="{{model.name}}". It's only ever used
				// within a directive.

				// Here we watch for changes to the local scope item property and 
				// zoom to the position of the item when it changes
				scope.$watch('selected', function(newValue, oldValue) {
					if (newValue && newValue != oldValue) {
						zoomTo(newValue);
					}
				});

				scope.$watch('opened', function(newValue, oldValue) {
					if (newValue != oldValue) {
						paused = newValue;
					}
				});

			    // Public API

			    // Think these are probably going to be watches too
			    scope.reverse = function() {
			    	console.log('reversing');
			    };

			    scope.manipulateTime = function() {
			    	console.log('manipulating time');
			    };

			    // Handlers

			    function zoomCompleteHandler(e) {
			    	// Set off load on ngMedia directive
			    	// Nice animation on load and then change visual state of tag
			    	// On further click, launch media
			    }

				function mouseMoveHandler(e) {
				    cameraPosition.x = stageWidth - e.clientX;
				    cameraPosition.y = e.clientY;
				}

			    function mouseWheelHandler(e) {
			    	cameraPosition.z -= e.deltaY * scrollSpeed;
			    }
			}
		};    	
    }
})();