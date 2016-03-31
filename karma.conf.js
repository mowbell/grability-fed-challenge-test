'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      'test/**/*Spec.js'
    ],

    reporters: [ 'spec' ], //'dots'

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify' ]
    },

    //browsers: [ 'Chrome','Firefox','PhantomJS'],
    browsers: ['PhantomJS'],

    logLevel: 'ERROR',

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true,
      insertGlobalVars: { //http://stackoverflow.com/questions/23480336/defining-global-variable-for-browserify
        Backbone: function(file, dir) {
          return 'require("backbone")';
        },
        $: function(file, dir) {
          return 'require("jquery")';
        },
        _: function(file, dir) {
          return 'require("underscore")';
        }
      }
      /*shim: {//http://benclinkinbeard.com/posts/external-bundles-for-faster-browserify-builds/
        jquery: {
          path: './libs/jquery.js',
          exports: '$'
        },
        angular: {
          path: './libs/angular.js',
          exports: 'angular',
          depends: {
            jquery: '$'
          }
        }
      }*/
    }
  });
};