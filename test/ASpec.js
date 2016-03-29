'use strict';

var main2 = require('../app/main2');


describe('Testing Karma con Browserify y Jasmine', function() {

  var hello = main2('Mauricio');

  it('Llamado a main2(Mauricio) debe ser igual a "Hello Mauricio!"', function() {
    expect(hello).toEqual("Hello Mauricio!");
  });

});