/* globals $, _, TweenLite, THREE, THREEx */
var scene = (function($, _, TweenLite, THREE, THREEx) {

    'use strict';

    /*
        TODO:
            [ ] handling errors on my service
            [ ] why does my API call fail sometimes?

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
    */

    // image opening
    // date
    // title

    // THREE actors
    var stats,
        scene,
        renderer,
        projector,
        camera;
    
    var stageWidth, stageHeight;
    var media, startDate;

    // Elements
    var $title = $('h1'),
        $date = $('h2'),
        $three = $('#three'),
        $loader = $('img'), // might want to support video at some stage
        $media = $('#media'),
        $controls = $('#controls'),
        $slider = $('#slider'),
        $reverse = $('#reverse');

    // THREE settings
    var fov = 35,
        near = 0, //500,
        far = 300000;

    // General settings
    var latency = 50, // on mousemove and scroll movement
        secondsPerPixel = 600, // number of seconds represented by a pixel
        scrollSpeed = 20,
        offset = 2500;

    // State
    var cameraPosition = { x: 0, y: 0, z: offset },
        todayDate,
        firstDate,
        paused,
        selected,
        animating,
        reversed,
        startz; // reset here if user stretches time

    function updateDate(date) {
        $date.text(date);
    }

    function mouseWheelHandler(event) {
        cameraPosition.z -= event.originalEvent.deltaY * scrollSpeed;
    }

    function mouseMoveHandler(event) {
        cameraPosition.x = stageWidth - event.clientX;
        cameraPosition.y = event.clientY;
    }

    function zoomToTag(item) {

        selected = item;
        paused = true;

        TweenLite.killTweensOf(camera.position);
        TweenLite.to(camera.position, 1, {
            z: selected.display.position.z + offset,
            x: selected.display.position.x,
            y: selected.display.position.y,
            onComplete: zoomCompleteHandler
        });
    }

    function mediaClickHandler() {
        showMedia(false, mediaHideHandler);
        setTitle('');
    }

    function showMedia(visible, callback) {
        TweenLite.to($media, 1, { css: { alpha: visible ? 1 : 0 },
            onComplete: callback });
    }

    function setTitle(text) {
        $title.text(text);
    }

    function zoomCompleteHandler() {

        var src = _.findWhere(selected.data.size, {  label: 'Large' }).source;
        loadMedia(src);

        selected.$el.addClass('selected');
    }

    function loadMedia(path) {

        $media.css('background-image', 'url(' + path + ')');

        if ($loader.attr('src') !== path) {
            $loader.attr('src', path);
        } else {
            mediaLoadHandler();
        }
    }

    function mediaShowHandler() {
        setTitle(selected.data.title._content);
    }

    function mediaHideHandler() {
        $media.toggleClass('inactive active');
        paused = false;
    }

    function mediaLoadHandler() {
        $media.toggleClass('active inactive');
        showMedia(true, mediaShowHandler);
    }

    function showAll(show, omit) {
        _.each(media, function(item) {
            if (item.display !== omit) {
                item.display.visible = show;
            }
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

    function sliderInputHandler(e) {
        
        var len = media.length, item;

        animating = true;
        //cameraPosition.z = startz;
        secondsPerPixel = $slider[0].value;

        // Update cached z position of all items
        for (var i = len - 1; i >= 0; i--) {
            item = media[i];
            item.position = getPosition(new Date(item.data.dates.taken));
        }
    }

    function reverseClickHandler(e) {

        var len = media.length, item;
        
        animating = true;
        reversed = !reversed;
        console.log(reversed);
        for (var i = len - 1; i >= 0; i--) {
            item = media[i];
            item.position = getPosition(new Date(item.data.dates.taken), reversed);
        }
    }

    function controlsMouseOverHandler(e) {
        cameraPosition.x = stageWidth / 2;
        cameraPosition.y = stageHeight / 2;
    }

    function tickHandler() {

        var dt = (camera.position.z - offset) * secondsPerPixel, 
            start, date, item, len = media.length;

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
                item = media[i];
                item.display.position.z += (item.position.z - item.display.position.z) / latency;
            }

            // if the last item is within range of its target, stop processing
            animating = ((item.position.z - item.display.position.z) / 50) << 1;
            console.log(animating);
        }

        updateDate(date.toFormat('DD-MMMM-YYYY'));

        // Render the scene
        renderer.render(scene, camera);

        // update stats
        stats.update();
    }

    function dataLoadedHandler(data) { 
        
        media = data;
        firstDate = new Date(media[0].dates.taken); //potentially sketchy

        initThree();
        initItems();

        $three.on('mousewheel DOMMouseScroll', mouseWheelHandler);
        $three.on('mousemove', mouseMoveHandler);
        //$three.on('mousedown', mouseDownHandler);

        $loader.on('load', mediaLoadHandler);
        $media.on('click', mediaClickHandler);

        $media.addClass('inactive').css('opacity', 0);

        // Kick off the render loop
        TweenLite.ticker.addEventListener('tick', tickHandler);
    }

    function initThree() {

        renderer = new THREE.CSS3DRenderer();

        stageWidth = window.innerWidth;
        stageHeight = window.innerHeight;

        // Can set today to be in the past to avoid scrolling to see older pictures
        todayDate = new Date('2014', '01', '28'); 
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('three').appendChild(renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        
        // create a scene
        scene = new THREE.Scene();

        // put a camera in the scene
        camera = new THREE.PerspectiveCamera(fov, stageWidth / stageHeight, near, far);
        camera.position.set(stageWidth / 2, stageHeight / 2, cameraPosition.z);
        scene.add(camera);

        projector = new THREE.Projector();

        startz = cameraPosition.z;

        // create a camera contol
        // transparently support window resize
        THREEx.WindowResize.bind(renderer, camera);
        // allow 'p' to make screenshot
        THREEx.Screenshot.bindKey(renderer);
        // allow 'f' to go fullscreen where this feature is supported
        if (THREEx.FullScreen.available()) {
            THREEx.FullScreen.bindKey();
        }
    }

    function initItems() {

        var el, object, data, position;

        var clickHelper = function(item) {
            return function(e) { zoomToTag(item); };
        };

        _.each(media, function(item, i) {

            position = getPosition(new Date(item.dates.taken));

            // Mostly want these as $ right
            el = document.createElement('div');
            el.className = 'tag';
            el.textContent = item.title._content;

            object = new THREE.CSS3DObject(el);
            object.position.x = position.x;
            object.position.y = position.y;
            object.position.z = position.z;

            data = { 
                display: object, 
                $el: $(el), 
                data: item, 
                position: {}
            };

            media[i] = data;

            el.onclick = clickHelper(data);

            scene.add(object);
        });
    }


    // Module's public API
    return {
        init: function() {
            // Load the application data
            $.getJSON('http://localhost:1337/api/photos', dataLoadedHandler);

            $slider.on('input', sliderInputHandler);
            $reverse.on('click', reverseClickHandler);
            $controls.mouseover(controlsMouseOverHandler);
        }
    };

}($, _, TweenLite, THREE, THREEx));

scene.init();


