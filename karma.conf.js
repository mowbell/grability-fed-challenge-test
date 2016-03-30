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
      debug: true
    }
  });
};