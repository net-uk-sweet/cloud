/* globals $, _, TweenLite, THREE, THREEx */
var scene = (function($, _, TweenLite, THREE, THREEx) {

    'use strict';

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
        $media = $('#media');

    // THREE settings
    var fov = 35,
        near = 500,
        far = 300000;

    // General settings
    var latency = 50, // on mousemove and scroll movement
        secondsPerPixel = 200, //-.000005; // number of seconds represented by a pixel
        scrollSpeed = 20,
        offset = 2500;

    // Canvas text settings
    var fontSize = 100,
        fontFamily = 'Arial',
        fontColor = 'white';

    // State
    var position = { x: 0, y: 0, z: offset },
        todayDate,
        mousex,
        mousey,
        paused,
        selected;


    function updateDate(date) {
        $date.text(date);
    }

    function mouseWheelHandler(event) {
        position.z -= event.originalEvent.deltaY * scrollSpeed;
    }

    function mouseMoveHandler(event) {

        mousex = (event.clientX / window.innerWidth) * 2 - 1;
        mousey = (event.clientY / window.innerHeight) * 2 + 1;

        position.x = (1 - (event.clientX / stageWidth)) * stageWidth;
        position.x -= stageWidth / 2;
        position.y = (event.clientY / stageHeight) * stageHeight;
    }

    function mouseDownHandler(event) {

        event.preventDefault();

        var vector = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            (event.clientY / window.innerHeight) * -2 + 1,
            0.5
        );

        projector.unprojectVector(vector, camera);

        var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
        var intersects = ray.intersectObjects(_.pluck(media, 'display'));
        var cameraPosition = camera.position;

        if (intersects.length) {

            _.each(intersects, function(intersect) {
                intersect = intersect.object;
                // Wee hack to prevent selection of elements in front of the 
                // camera but not rendered due as they're outside near threshold
                if ((cameraPosition.z - intersect.position.z) >= offset) {
                    selected = _.findWhere(media, { display: intersect });
                }
            });

            paused = true;

            TweenLite.killTweensOf(cameraPosition);
            TweenLite.to(cameraPosition, 1, {
                z: selected.display.position.z + offset,
                x: selected.display.position.x,
                y: selected.display.position.y /*- (stageHeight / 2) - 100*/,
                onComplete: zoomCompleteHandler
            });
        }
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

        var src = _.findWhere(selected.data.size,
            { label: 'Large' }).source;
        
        loadMedia(src);
/*
        $media.removeClass('rotate-0 rotate-90 rotate-270')
            .addClass('rotate-' + selected.data.rotation);
*/
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
    function getPosition(date) {

        var dt = todayDate.getSecondsBetween(date);

        return {
            x: (Math.random() * stageWidth) - (stageWidth / 2),
            y: (Math.random() * stageHeight),
            z: dt * (1 / secondsPerPixel)
        };
    }

    function getCanvas(text) {

        var fontStyle = fontSize + 'pt ' + fontFamily;
        var canvas = document.createElement('canvas');

        // supposedly this value should be the same as the font points 
        // value but in reality it seems to require approx 50% more
        canvas.height = fontSize * 1.5;
        canvas.width = getCanvasWidth(text, fontStyle);

        var context = canvas.getContext('2d');
        context.textBaseline = 'top';
        context.font = fontSize + 'pt ' + fontFamily;
        context.fillStyle = fontColor;
        context.fillText(text, 0, 0);

        return canvas;
    }

    // This seems a pretty ugly way to return the width of the canvas
    // dynamically based on the size of the text it is filled with
    function getCanvasWidth(text, fontStyle) {

        var canvas = document.createElement('canvas');

        var context = canvas.getContext('2d');
        context.font = fontStyle;

        return context.measureText(text).width;
    }

    function tickHandler() {

        var dt = (camera.position.z - offset) * secondsPerPixel,
            today = todayDate.clone(),
            date = today.addSeconds(dt);

        if (!paused) {
            camera.position.x += (position.x - camera.position.x) / latency;
            camera.position.y += (position.y - camera.position.y) / latency;
            camera.position.z += (position.z - camera.position.z) / latency;
        }

        updateDate(date.toFormat('DD-MM-YYYY'));

        // Render the scene
        renderer.render(scene, camera);

        // update stats
        stats.update();
    }

    function dataLoadedHandler(data) {
        
        media = data;

        initThree();
        initItems();

        $three.on('mousewheel DOMMouseScroll', mouseWheelHandler);
        $three.on('mousemove', mouseMoveHandler);
        $three.on('mousedown', mouseDownHandler);

        $loader.on('load', mediaLoadHandler);
        $media.on('click', mediaClickHandler);

        $media.addClass('inactive').css('opacity', 0);

        // Kick off the render loop
        TweenLite.ticker.addEventListener('tick', tickHandler);
    }

    function initThree() {

        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                // to get smoother output
                preserveDrawingBuffer: true // to allow screenshot
            });
            //ßrenderer.setClearColorHex(0xBBBBBB, 1);
            // uncomment if webgl is required
            //}else{
            //   Detector.addGetWebGLMessage();
            //   return true;
        } else {
            renderer = new THREE.CanvasRenderer();
        }

        stageWidth = window.innerWidth;
        stageHeight = window.innerHeight;

        todayDate = new Date(); // new Date('2009', '10', '15').getTime(); // Setting today's date in the past for now as result set is old
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('three').appendChild(renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        document.body.appendChild(stats.domElement);

        // create a scene
        scene = new THREE.Scene();

        // put a camera in the scene
        camera = new THREE.PerspectiveCamera(fov, stageWidth / stageHeight, near, far);
        camera.position.set(0, stageHeight / 2, position.z);
        scene.add(camera);

        projector = new THREE.Projector();

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

        _.each(media, function(item, i) {

            var canvas = getCanvas(item.title._content);
            // var canvas = getCanvas(item.dates.taken);
            var position = getPosition(new Date(item.dates.taken));

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            var plane = new THREE.Mesh(
                new THREE.PlaneGeometry(canvas.width, canvas.height),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 1
                })
            );

            plane.geometry.dynamic = true;

            plane.position.x = position.x;
            plane.position.y = position.y;
            plane.position.z = position.z;

            media[i] = ({ display: plane, data: item });
            scene.add(plane);
        });
    }


    // Module's public API
    return {
        init: function() {
            // Load the application data
            $.getJSON('http://localhost:1337/api/media', dataLoadedHandler);
        }
    };

}($, _, TweenLite, THREE, THREEx));

scene.init();



/*
function createLabels() {

    for (var i = 0; i < photos.length; i ++) {

        var photo = photos[i];
        var text3d = new THREE.TextGeometry(photo.title._content, {

            size: 80,
            height: 20,
            curveSegments: 2,
            font: "helvetiker",
            bevelThickness: 3, bevelSize: 3, bevelEnabled: true
        });

        text3d.computeBoundingBox();
        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

        var textMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw: true } );
        var text = new THREE.Mesh( text3d, textMaterial );

        var position = getPosition(photo.dates.taken);

        text.position.x = position.x;
        text.position.y = position.y;
        text.position.z = position.z;

        text.rotation.x = 0;
        text.rotation.y = Math.PI * 2;

        group = new THREE.Object3D();
        group.add( text );

        scene.add( group );
    }
}*/

    // Returns the date of the earliest photo
    //            function getStartDate() {
    //                var start = new Date().getTime();
    //                var photo;
    //                var date;
    //                for (var i = 0; i < photos.length; i ++) {
    //                    photo = photos[i];
    //                    date = new Date(photo.date).getTime();
    //                    if (date < start) start = date;
    //                }
    //                return start;
    //            }
    // Returns a canvas filled with supplied text


