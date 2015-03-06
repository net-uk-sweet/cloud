module.exports = function(grunt) {

	// Configuration object setup here
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),


		ngtemplates: {
			app: {
				src: 'js/partials/**.html',
				dest: 'js/partials/templates.js',
				options: {
					bootstrap: function(module, script) {
						return "angular.module('cloudApp').run(['$templateCache', function($templateCache) {\n"+script+"\n}]);\n";
					},
					htmlmin: { collapseWhitespace: true, collapseBooleanAttributes: true }
				}
			}
		},
		concat: {
			js: {
				src: ['js/**/*.js', 'js/partials/templates.js'],
				dest: 'dist/js/app.js'
			},
			css: {
				src: ['css/*.css'],
				dest: 'dist/css/style.css'
			}
		},
		ngAnnotate: {
			options: { singleQuotes: true },
			app: {
				files: {
					'dist/js/app.js': ['dist/js/app.js']
				}
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
		},
		copy: {
			main: {
				files: [
					{ expand: true, src: 'index.html', dest: 'dist/' },
					{ expand: true, src: 'font/**', dest: 'dist' }
				]
			}
		},
		injector: {
			options: {},
			localDependencies: {
				files: {
					'dist/index.html': ['dist/js/app.js', 'dist/css/style.css']
				}
			}
		},
		clean: ['js/partials/templates.js']
	});

	// Import plugins
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-injector');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Configure our tasks
	grunt.registerTask('default', [
		'ngtemplates',
		'concat', 
		'ngAnnotate', 
		'uglify', 
		'cssmin', 
		'copy', 
		'injector',
		'clean'
	]);
};