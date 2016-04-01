var CommandsView = require('./views/CommandsView');
var Execution = require('./core/Execution');
//var CubeStorage = require('./storage/CubeStorage');
var Application = function() {
    var mainView = null;
    var that = this;
    this.start = function() {
        mainView = new CommandsView();
        mainView.on(CommandsView.EXECUTION_STARTED, _onExectionStarted);
    };

    var _onExectionStarted = function(commandsString) {
        execute(commandsString);
    };

    var execute = function(commandsString) {
        /*var populateCube=function(){CubeStorage.populateCube(4);};
        var resetCube=function(){CubeStorage.resetCube().then(populateCube);};
        var createTable=function(){CubeStorage.createTable().then(resetCube);};
        createTable();*/
        /*CubeStorage.createTable()
        .then(CubeStorage.resetCube)
        .then(function(){return CubeStorage.populateCube(4)});*/
        var execution=new Execution(commandsString);
        execution.getPromise().then(_onExecutionSuccess,_onExecutionError);

        //console.log(CubeStorage.createTable().then(CubeStorage.resetCube).then(function() { CubeStorage.populateCube(4);}));
    };

    var _onExecutionSuccess = function(executionResult) {
        console.log("resultado fue", executionResult);
        showResults(executionResult);
    };

    var _onExecutionError = function(executionError) {
        console.log("resultado con error fue", executionError);
        showError(executionError);
    };

    var showResults = function(executionResult) {
        var resultString = executionResult.getValue();
        var timeElapsed = executionResult.getTimeElapsed();
        mainView.displayResults(resultString, timeElapsed);
    };

    var showError = function(executionError) {
        mainView.displayError(executionError);
    };

};
module.exports = Application;
