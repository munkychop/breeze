module.exports = function(grunt) {

	"use strict";

	// grunt.loadNpmTasks("grunt-contrib-sass");
	// grunt.loadNpmTasks("grunt-contrib-uglify");
	// grunt.loadNpmTasks("grunt-contrib-connect");
	// grunt.loadNpmTasks("grunt-contrib-watch");
	// grunt.loadNpmTasks("grunt-contrib-copy");

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		sass: {

			dev: {
				options: {
					style: "compressed",
					sourcemap : true
				},

				files : {
					"dist/css/app.min.css": "src/scss/app.scss"
				}
			}
		},

		uglify: {

			dev: {
				options: {
					compress: true,
					mangle: true,
					preserveComments: false
				},

				files: {
					"dist/js/app.min.js" : ["src/js/libs/atomic.js", "src/js/app/app.js"]
				}
			}
		},

		connect: {

			server : {
				options: {
					open: true
				}
			}
		},

		watch: {

			options: {
				livereload: true,
			},

			html: {
				files: ["index.html"],
				options: {
					livereload: true
				}
			},
			
			js: {
				files: ["src/js/**/*.js"],
				tasks: ["uglify:dev"]
			},

			scss: {
				files: ["src/scss/**/*.scss"],
				tasks: ["sass:dev"]
			},

			img: {
				files: ["src/img/**/*.*"],
				tasks: ["copy:img"]
			}
		},

		copy: {
			img: {
				expand: true,
				cwd: "src/img/",
				src: "**/*.*",
				dest: "dist/img/"
			}
		}
	});

	grunt.registerTask("breeze", ["sass:dev", "uglify:dev", "copy:img", "connect:server", "watch"]);
};