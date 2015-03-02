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
		// TODO: this one doesn't minify!
		inline_angular_templates: {
	        dist: {
	            options: {
					selector: 'body',      
	                method: 'prepend',     
	                unescape: {            
	                    '&lt;': '<',
	                    '&gt;': '>',
	                    '&apos;': '\'',
	                    '&amp;': '&'
	                }
	            },
	            files: {
	                'dist/index.html': ['js/partials/*.html']
	            }
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
	// grunt.loadNpmTasks('grunt-ng-template');
	grunt.loadNpmTasks('grunt-inline-angular-templates');
	grunt.loadNpmTasks('grunt-injector');

	// Configure our tasks
	grunt.registerTask('default', [
		'concat', 
		'ngAnnotate', 
		'uglify', 
		'cssmin', 
		'copy', 
		// 'ng_template',
		'inline_angular_templates',
		'injector'
	]);
};