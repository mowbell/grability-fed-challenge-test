'use strict';

var main2 = require('../app/main2');


describe('Testing Karma con Browserify y Jasmine', function() {

  var hello = main2('Julio');

  it('Llamado a main2(Mauricio) debe ser igual a "Hello Julio!"', function() {
    expect(hello).toEqual("Hello Julio!");
  });

});