module.exports = function(grunt) {

	"use strict";

	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-watch");

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
			
			js: {
				files: ["src/js/**/*.js"],
				tasks: ["uglify:dev"]
			},

			scss: {
				files: ["src/scss/**/*.scss"],
				tasks: ["sass:dev"]
			}
		}
	});

	grunt.registerTask("breeze", ["sass:dev", "uglify:dev", "connect:server", "watch"]);
};