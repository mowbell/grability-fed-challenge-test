module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration will be written here
        jshint: {
            //Se configura que archivos se les debe validar la sintaxis y errores de javascript
            all: ['Gruntfile.js', 'app/*.js', 'app/**/*.js'],
            dev: {
                files: {
                    src: ['Gruntfile.js', 'app/*.js', 'app/**/*.js', 'test/*.js']
                },
                options: {
                    debug: true,
                    undef: false,
                    strict:false,
                    node:true,
                    jasmine:true,
                    //multistr:true
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            //se configura que archivos se monitorean para ejecutar instantaneamente cambios
            dev: {
                files: ['Gruntfile.js', 'app/*.js', 'app/**/*.js', 'index.html', 'test/*.js', 'styles/style.css'],
                tasks: ['clear','jshint:dev', 'browserify:dev'],

                options: {
                    atBegin: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: 8083,
                    livereload: true
                }
            }
        },
        browserify: {//http://coenraets.org/blog/2014/01/browserify-sample-application-with-backbone-jquery-handlebars-and-cordova/
            dev: {
                src: ['app/**/*.js'],
                dest: 'dist/app.js',
                options: {
                    external: ['jquery'],
                    browserifyOptions: {
                         debug: true
                      }
                }
            }
        },

    });
    // Loading of tasks and registering tasks will be written here
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-clear');


    grunt.registerTask('dev', ['connect:server', 'watch:dev']);

};
