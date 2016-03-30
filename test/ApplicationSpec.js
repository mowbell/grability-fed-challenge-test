'use strict';
/*var $ = require('jquery')(window);
var Backbone = require('backbone');
Backbone.$ = $;*/
var Application = require('../app/Application');
var MainView = require('../app/views/MainView');
describe('Application class especificaciones', function() {

    var app;
    beforeEach(function() {
        app = new Application();

    });

    it('Debe tener un metodo start para inicializacion', function() {
        expect(app.start).not.toBeUndefined();
        spyOn(app, 'start');
        app.start();
        expect(app.start).toHaveBeenCalled();
    });

    it('Debe tener un getter del mainView', function() {
        app.start();
        expect(app.getView).not.toBeUndefined();
        var view = app.getView();
        expect(view).not.toBeNull();
    });

    /*it('Debe tener un metodo para ejecutar los comandos (param String) y devuelva un promise ');


    it('El promise success de la ejecucion total devuelve un {result:String, timeElapsed:String} ');

    it('El promise error de la ejecucion total devuelve un {message:String, command:String, line:int} ');

    */

});
