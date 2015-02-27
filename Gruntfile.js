module.exports = function(grunt) {

	// Configuration object setup here
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// Specific configs for our tasks 
		concat: {
			js: {
				src: ['js/**/*.js'],
				dest: 'dist/js/app.js'
			},
			css: {
				src: ['css/*.css'],
				dest: 'dist/css/style.css'
			}
		},
		uglify: {
			build: {
				src: 'dist/js/app.js',
				dest: 'dist/js/app.js'
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'dist/css',
					src: ['style.css'],
					dest: 'dist/css'
				}]
			}
		}
	});

	// Import plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// Configure our tasks
	grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};