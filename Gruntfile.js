module.exports = function(grunt) {

	// Configuration object setup here
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),


		ngtemplates: {
			app: {
				src: 'js/partials/**.html',
				dest: 'dist/js/templates.js',
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
				files: [{
					expand: true,
					src: [
						'index.html', 
						'package.json', 
						'index.js', 
						'db.js', 
						'config.json', 
						'font/**',
						'data/**',
						'js/partials/**.html'
					],
					dest: 'dist'
				}]
			}
		},
		injector: {
			options: {
				transform: function(filePath) {
					filePath = filePath.replace('/dist/', '');
					return filePath.indexOf('.js') > 0 ? 
						'<script src="' + filePath + '"></script>' :
						'<link href="' + filePath +  '" rel="stylesheet"/>';
				}
			},
			localDependencies: {
				files: {
					'dist/index.html': ['dist/js/app.js', 'dist/css/style.css']
				}
			}
		},
		clean: ['js/partials/templates.js'],
		buildcontrol: {
			options: {
				dir: 'dist',
				commit: true,
				push: true,
				connectCommits: false,
				message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
			},
			openshift: {
				options: {
					remote: 'ssh://5508c0fb4382ec419d0000d1@cloud147-sweetweb.rhcloud.com/~/git/cloud147.git/',
					branch: 'master'
				}
			}
		}
	});

	// Import plugins

	// grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-injector');
	// grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-build-control');

	// Configure our tasks
	grunt.registerTask('default', [
		// 'ngtemplates', // Stupid templates won't compile! Optimisation is minimal anyway, so I give up.
		'concat', 
		'ngAnnotate', 
		'uglify', 
		'cssmin', 
		'copy', 
		'injector',
		// 'clean'
	]);

	grunt.registerTask('build', ['default']);
	grunt.registerTask('deploy', ['buildcontrol:openshift']);
};