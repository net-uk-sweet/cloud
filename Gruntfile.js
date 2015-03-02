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
					{ expand: true, src: 'font', dest: 'dist/' }
				]
			}
		},
		ng_template: {
			files: ['js/partials'],
			options: {
				appDir: 'dist',
				indexFile: 'index.html',
				concat: true
			}
		},
		injector: {
			options: {},
			localDependencies: {
				files: {
					'dist/index.html': ['dist/js/app.js', 'dist/css/style.css']
				}
			}
		}
	});

	// Import plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-ng-template');
	grunt.loadNpmTasks('grunt-injector');

	// Configure our tasks
	grunt.registerTask('default', [
		'concat', 
		'ngAnnotate', 
		'uglify', 
		'cssmin', 
		'copy', 
		'ng_template',
		'injector'
	]);
};