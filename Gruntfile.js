module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration will be written here
        jshint: {
            //Se configura que archivos se les debe validar la sintaxis y errores de javascript
            all: ['Gruntfile.js', 'app/*.js', 'app/**/*.js'],
            dev: {
                files:{
                    src:['Gruntfile.js', 'app/*.js', 'app/**/*.js']
                },
                options:{
                    debug:true,
                    undef:false
                }
            }
        },
        concat: {
            //Concatenador de todos los archivos js
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/*.js'],
                dest: 'dist/app.js'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            //se configura que archivos se monitorean para ejecutar instantaneamente cambios
            dev: {
                files: ['Gruntfile.js', 'app/*.js', 'index.html'],
                tasks: ['jshint:dev', 'concat:dist'],

                options: {
                    atBegin: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: 8080,
                    livereload: true
                }
            }
        },
        
    });
    // Loading of tasks and registering tasks will be written here
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    

    grunt.registerTask('dev', ['connect:server', 'watch:dev']);

};
