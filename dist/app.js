(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./core/Execution":4,"./views/CommandsView":14}],2:[function(require,module,exports){
var Config={
	MIN_TESTS_CASES:1,
	MAX_TESTS_CASES:50,
	MIN_CUBE_SIZE:1,
	MAX_CUBE_SIZE:100,
	MIN_TEST_CASES_OPERATIONS:1,
	MAX_TEST_CASES_OPERATIONS:1000,
	MIN_CUBE_CELL_UPDATE_VALUE:-Math.pow(10,9),
	MAX_CUBE_CELL_UPDATE_VALUE:Math.pow(10,9),
};

module.exports=Config;
},{}],3:[function(require,module,exports){
var Config=require('./Config');
var ErrorMessage={
	NO_COMMANDS						:"No hay comandos para ejecutar",
	EMPTY_COMMAND					:"Comando esta vacio",
	TEST_PLAN_COMMAND_SINTAX		:"Error de Sintaxis, el comando debe contener un número",
	TEST_PLAN_COMMAND_WRONG_VALUES	:"Error de Valores, el comando debe contener un número (test cases) entre "+Config.MIN_TESTS_CASES+" y "+Config.MAX_TESTS_CASES,
	TEST_CASE_COMMAND_SINTAX		:"Error de Sintaxis, el comando  debe contener dos números separados por un espacio",
	TEST_CASE_WRONG_CUBE_SIZE		:"Error de Valores, el comando  debe contener el primer numero (tamaño del cubo) entre "+Config.MIN_CUBE_SIZE+" y "+Config.MAX_CUBE_SIZE,
	TEST_CASE_WRONG_NUM_OPERATIONS	:"Error de Valores, el comando  debe contener el segundo numero (operaciones) entre "+Config.MIN_TEST_CASES_OPERATIONS+" y "+Config.MAX_TEST_CASES_OPERATIONS,
	OPERATION_UNKNOWN				:"Operación desconocida",
	UPDATE_COMMAND_SINTAX			:'Error de Sintaxis, el comando  debe ser similar a "UPDATE 2 2 2 4" (Revisar espacios)',
	UPDATE_WRONG_CUBE_CELLS		    :'Error de Valores, las cordenadas de la celda del cubo son invalidas',
	UPDATE_WRONG_VALUE_TO_UPDATE	:"Error de Valores, el valor a actualizar entre "+Config.MIN_CUBE_CELL_UPDATE_VALUE+" y "+Config.MAX_CUBE_CELL_UPDATE_VALUE,
	QUERY_COMMAND_SINTAX			:'Error de Sintaxis, el comando  debe ser similar a "QUERY 1 1 1 3 3 3" (Revisar espacios)',
	QUERY_WRONG_CUBE_CELLS		    :'Error de Valores, las cordenadas de las celdas del cubo son invalidas',
	EXECUTION_ERROR		    		:'Error en la ejecución',
};
module.exports=ErrorMessage;
},{"./Config":2}],4:[function(require,module,exports){
var ErrorMessage=require('../config/ErrorMessage');
var Command=require('../core/command/base/Command');
var TestPlanCommand=require('../core/command/TestPlanCommand');
var TestCaseCommand=require('../core/command/TestCaseCommand');
var OperationCommand=require('../core/command/OperationCommand');
var Execution = function(commandsString) {
    var execDeferred = jQuery.Deferred();
    var executionErrorDispathed=false;
    createCommands(commandsString);
    function extractLines(commandsString){
    	if(!commandsString || commandsString===''){
    		dispatchError('', ErrorMessage.NO_COMMANDS,0);
    		return;
    	}
    	return commandsString.split('\n');
    }

    function createCommands(commandsString){
    	
    	var lines=extractLines(commandsString);
    	var numLines=lines && lines.length;
    	if(!lines ||!numLines)
    		return;
    	
    	//var commands=[];
    	

    	var curLineNumber=0;
    	
    	function getNextLine(){
    		if(curLineNumber+1<=numLines)
    			curLineNumber++;
    		return lines[curLineNumber-1];
    	}


    	//make TestPlan command
    	var testPlanCommand=new TestPlanCommand(getNextLine());
    	var validationTestPlan=testPlanCommand.validate();
    	if(validationTestPlan.isValid()){

    		//commands.push(testPlanCommand);
    		var numTestCases=testPlanCommand.getNumTestCases();

    		creationTestCases:{
	    		for(var i=1;i<=numTestCases;i++){
	    			var testCaseCommand=new TestCaseCommand(getNextLine());
	    			var validationTestCase=testCaseCommand.validate();
	    			if(validationTestCase.isValid()){
	    				
	    				testPlanCommand.addTestCaseCommand(testCaseCommand);
	    				var numOperations=testCaseCommand.getNumOperations();
	    				var cubeSize=testCaseCommand.getCubeSize();
	    				creationOperations:{
		    				for(var j=1;j<=numOperations;j++){
		    					var operationCommand=new OperationCommand(getNextLine(), cubeSize);	
		    					var validationOperation=operationCommand.validate();
		    					if(validationOperation.isValid()){
		    						testCaseCommand.addOperationCommand(operationCommand);
		    					}
		    					else{
		    						dispatchValidationError(validationOperation,curLineNumber);
		    						break creationTestCases;
		    						
		    					}
		    				}
                            
	    				}
	    			}
	    			else{
	    				dispatchValidationError(validationTestCase,curLineNumber);
	    				break creationTestCases;
	    			}
	    		}
    		}
            
    	}
    	else{
    		dispatchValidationError(validationTestPlan,curLineNumber);
    	}

        if(!executionErrorDispathed)
            executeCommands(testPlanCommand);



	    /*_.each(lines, function(line, index){
	    	console.log(index, line);
	    });*/
    }


    function executeCommands(testPlanCommand){
        debugger;
        var timeStart=new Date().getTime();
        testPlanCommand.execute().getPromise().done(function(resultString){
            var timeEnd=new Date().getTime();
            var timeElapsed=timeEnd-timeStart;
            console.log("Ejecucion completada", timeElapsed);
            debugger;
            dispatchSuccess(resultString, timeElapsed);
        }).fail(function(){
            dispatchError('', ErrorMessage.EXECUTION_ERROR,0);
        });
    }

    function dispatchValidationError(validation, line ){
        executionErrorDispathed=true;
    	dispatchError(
    		validation.getCommandString(), 
    		validation.getErrorMessage(), 
    		line 
    	);
    }
    function dispatchError(commandStr, errorMsg, line ){
    	var error=new Execution.Error(
    		commandStr, 
    		errorMsg, 
    		line 
    	);
    	execDeferred.reject(error);	
    }

    function dispatchSuccess(resultString, timeElapsed ){
        debugger;
        var result=new Execution.Result(
            resultString, 
            timeElapsed
        );
        execDeferred.resolve(result); 
    }

    this.getPromise=function(){
    	return execDeferred.promise();
    };
    
};
Execution.Result = function(value, timeElapsed) {
    var mValue = value;
    var mTimeElapsed = timeElapsed;
    this.getValue= function() {
            return mValue;
    };
    this.getTimeElapsed= function() {
            return mTimeElapsed;
    };
};
Execution.Error = function(commandString, errorMessage, commandLine) {
	var mCommandString = commandString;
    var mErrorMessage = errorMessage;
    var mCommandLine = commandLine;
    this.getCommandString= function() {
            return mCommandString;
    };
    this.getErrorMessage= function() {
            return mErrorMessage;
    };	
    this.getCommandLine= function() {
            return mCommandLine;
    };	
};
module.exports = Execution;

},{"../config/ErrorMessage":3,"../core/command/OperationCommand":5,"../core/command/TestCaseCommand":7,"../core/command/TestPlanCommand":8,"../core/command/base/Command":10}],5:[function(require,module,exports){
var Command=require("./base/Command");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");
var QueryCommand=require("./QueryCommand");
var UpdateCommand=require("./UpdateCommand");

var OperationCommand=function(commandString, cubeSize){
	if(/^QUERY/.test(commandString)){
		return new QueryCommand(commandString,cubeSize);
	}
	else if(/^UPDATE/.test(commandString)){
		return new UpdateCommand(commandString,cubeSize);
	}
	
	Command.call(this,commandString);
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		if(cmd!==""){
			validation.fail(ErrorMessage.OPERATION_UNKNOWN);
		}
		else{
			validation.fail(ErrorMessage.EMPTY_COMMAND);
		}
			
		return validation;
	};

};
module.exports=OperationCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./QueryCommand":6,"./UpdateCommand":9,"./base/Command":10}],6:[function(require,module,exports){
var Command=require("./base/Command");
var TestCaseCommand=require("./TestCaseCommand");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");
var QueryCommand=function(commandString, _cubeSize){
	Command.call(this,commandString);
	var cubeSize=_cubeSize;
	var cellX1=0,cellX2=0,cellY1=0,cellY2=0,cellZ1=0,cellZ2=0;
	var setCubeCells=function(X1,X2,Y1,Y2,Z1,Z2){
		cellX1=X1;
		cellX2=X2;
		cellY1=Y1;
		cellY2=Y2;
		cellZ1=Z1;
		cellZ2=Z2;
	};
	this.getCubeSize=function(){
		return cubeSize;
	};
	var that=this;
	var validateCell=function(cellCoord){
		return cellCoord>=Config.MIN_CUBE_SIZE && cellCoord<=that.getCubeSize();
	};
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		var regex=/^QUERY\s{1}\d+\s{1}\d+\s{1}\d+\s{1}\d+\s{1}\d+\s{1}\d+$/;
		if(cmd!==""){
			if(regex.test(cmd)){
				var values=cmd.match(/-?\d+/g);

				var cellX1=parseInt(values[0]);
				var cellY1=parseInt(values[1]);
				var cellZ1=parseInt(values[2]);
				var cellX2=parseInt(values[3]);
				var cellY2=parseInt(values[4]);
				var cellZ2=parseInt(values[5]);
				
				
				if(
					validateCell(cellX1) && validateCell(cellY1) && validateCell(cellZ1) &&
					validateCell(cellX2) && validateCell(cellY2) && validateCell(cellZ2) &&
					cellX1<=cellX2 && cellY1<=cellY2 && cellZ1<=cellZ2
					){

					setCubeCells(cellX1,cellX2,cellY1,cellY2,cellZ1,cellZ2);
					validation.success();
				}
				else{
					validation.fail(ErrorMessage.QUERY_WRONG_CUBE_CELLS);	
				}
			}
			else{
				validation.fail(ErrorMessage.QUERY_COMMAND_SINTAX);
			}
		}
		else{
			validation.fail(ErrorMessage.EMPTY_COMMAND);
		}
		return validation;

	};

	this.execute=function(cube){
		debugger;
		cube.summateCells(cellX1,cellY1,cellZ1, cellX2, cellY2, cellZ2)
		.then(that.dispatchSuccess,that.dispatchError);
		return that;
	};
};
QueryCommand=Command.extends(QueryCommand);


module.exports=QueryCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./TestCaseCommand":7,"./base/Command":10}],7:[function(require,module,exports){
var Command=require("./base/Command");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");
var Cube=require("./../cube/Cube");
var TestCaseCommand=function(commandString){
	Command.call(this,commandString);
	var cubeSize=0;
	var numOperations=0;
	var operations=[];
	var that=this;
	var cube=null;
	var setCubeSize=function(num){
		cubeSize=num;
	};
	var setNumOperations=function(num){
		numOperations=num;
	};
	this.getCubeSize=function(){
		return cubeSize;
	};
	this.getNumOperations=function(){
		return numOperations;
	};
	function createCube(){
		cube=new Cube(that.getCubeSize());
		return cube;
	}
	function getCube(){
		return cube;
	}
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		var regex=/^\d+\s{1}\d+$/;
		if(cmd!==""){
			if(regex.test(cmd)){
				var values=cmd.match(/\d+/g);
				var cubeSize=parseInt(values[0]);
				var numOperations=parseInt(values[1]);
				
				if(cubeSize>=Config.MIN_CUBE_SIZE && cubeSize<=Config.MAX_CUBE_SIZE){
					if(numOperations>=Config.MIN_TEST_CASES_OPERATIONS && numOperations<=Config.MAX_TEST_CASES_OPERATIONS){
						setCubeSize(cubeSize);
						setNumOperations(numOperations);
						validation.success();
					}
					else{
						validation.fail(ErrorMessage.TEST_CASE_WRONG_NUM_OPERATIONS);	
					}
				}
				else{
					validation.fail(ErrorMessage.TEST_CASE_WRONG_CUBE_SIZE);	
				}
			}
			else{
				validation.fail(ErrorMessage.TEST_CASE_COMMAND_SINTAX);
			}
		}
		else{
			validation.fail(ErrorMessage.EMPTY_COMMAND);
		}
		return validation;
	};
	this.addOperationCommand=function(operationCommand){
		operations.push(operationCommand);
	};

	this.execute=function(){
		debugger;
		createCube();
		
		var countOperationsExecuted=0;
		var resultsString="";
		var results=[];
		
		var successCallback=function(){
			debugger;
			resultsString=results.join('\n');
			console.log("Test Case executed\n\n"+resultsString);
			that.dispatchSuccess(resultsString);
		};
		var errorCallback=function(){
			debugger;
			that.dispatchError(arguments);
			console.warn("Error en la ejecución del test case");
		};
		function operationExecuted(result){
			debugger;
			if(result!==null && _.isNumber(result)){
				results.push(result);
			}
			executeNextOperation();
		}
		function executeNextOperation(){
			debugger;
			if(countOperationsExecuted<that.getNumOperations()){
				var nextOperation=operations[countOperationsExecuted++];
				nextOperation.getPromise().then(operationExecuted, errorCallback);
				nextOperation.execute(getCube());
			}
			else{
				successCallback();
			}
		}
		debugger;
		getCube().load().then(executeNextOperation, errorCallback);
		
		return that;
	};

};

TestCaseCommand=Command.extends(TestCaseCommand);
module.exports=TestCaseCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./../cube/Cube":11,"./base/Command":10}],8:[function(require,module,exports){
var Command=require("./base/Command");
var TestCaseCommand=require("./TestCaseCommand");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");
var TestPlanCommand=function(commandString){
	Command.call(this,commandString);
	var numTestCases=0;
	var testCases=[];
	var that=this;
	var setNumTestCases=function(num){
		numTestCases=num;
	};
	this.getNumTestCases=function(){
		return numTestCases;
	};
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		var regex=/^\d+$/;
		if(cmd!==""){
			if(regex.test(cmd)){
				var num=parseInt(cmd);
				if(num>=Config.MIN_TESTS_CASES && num<=Config.MAX_TESTS_CASES){
					setNumTestCases(num);
					validation.success();
				}
				else{
					validation.fail(ErrorMessage.TEST_PLAN_COMMAND_WRONG_VALUES);	
				}
			}
			else{
				validation.fail(ErrorMessage.TEST_PLAN_COMMAND_SINTAX);
			}
		}
		else{
			validation.fail(ErrorMessage.EMPTY_COMMAND);
		}
		return validation;

	};
	this.addTestCaseCommand=function(testCaseCommand){
		testCases.push(testCaseCommand);
	};

	this.execute=function(){
		debugger;
		var countTestCasesExecuted=0;
		var resultsString="";
		var results=[];
		var successCallback=function(){
			debugger;
			resultsString=results.join('\n');
			console.log("Test Plan executed\n\n"+resultsString);
			that.dispatchSuccess(resultsString);
		};
		var errorCallback=function(){
			debugger;
			that.dispatchError(arguments);
			console.warn("Error en la ejecución del test plan");
		};
		function testCaseExecuted(result){
			debugger;
			results.push(result);
			executeNextTestCase();
		}
		function executeNextTestCase(){
			
			if(countTestCasesExecuted<that.getNumTestCases()){
				var nextTestCase=testCases[countTestCasesExecuted++];
				nextTestCase.execute().getPromise().then(testCaseExecuted, errorCallback);
			}
			else{
				successCallback();
			}
		}
		executeNextTestCase();

		
		return that;
	};
};
TestPlanCommand=Command.extends(TestPlanCommand);


module.exports=TestPlanCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./TestCaseCommand":7,"./base/Command":10}],9:[function(require,module,exports){
var Command=require("./base/Command");
var TestCaseCommand=require("./TestCaseCommand");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");
var UpdateCommand=function(commandString, _cubeSize){
	Command.call(this,commandString);
	var cubeSize=_cubeSize;
	var cellX=0;
	var cellY=0;
	var cellZ=0;
	var valueToUpdate=0;
	var setCubeCells=function(X,Y,Z){
		cellX=X;
		cellY=Y;
		cellZ=Z;
	};
	function getCellX(){
		return cellX;
	}
	function getCellY(){
		return cellY;
	}
	function getCellZ(){
		return cellZ;
	}
	function getValueToTupdate(){
		return valueToUpdate;
	}
	var setValueToTupdate=function(num){
		valueToUpdate=num;
	};
	this.getCubeSize=function(){
		return cubeSize;
	};
	
	var that=this;
	var validateCell=function(cellCoord){
		return cellCoord>=Config.MIN_CUBE_SIZE && cellCoord<=that.getCubeSize();
	};
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		var regex=/^UPDATE\s{1}\d+\s{1}\d+\s{1}\d+\s{1}-?\d+$/;
		if(cmd!==""){
			if(regex.test(cmd)){
				var values=cmd.match(/-?\d+/g);

				var cellX=parseInt(values[0]);
				var cellY=parseInt(values[1]);
				var cellZ=parseInt(values[2]);
				var valueToUpdate=parseInt(values[3]);
				
				if(
					validateCell(cellX) && validateCell(cellY) && validateCell(cellZ)

					){

					setCubeCells(cellX,cellY,cellZ);

					if(valueToUpdate>=Config.MIN_CUBE_CELL_UPDATE_VALUE && valueToUpdate<=Config.MAX_CUBE_CELL_UPDATE_VALUE){
						setValueToTupdate(valueToUpdate);
						validation.success();
					}
					else{
						validation.fail(ErrorMessage.UPDATE_WRONG_VALUE_TO_UPDATE);	
					}
				}
				else{
					validation.fail(ErrorMessage.UPDATE_WRONG_CUBE_CELLS);	
				}
			}
			else{
				validation.fail(ErrorMessage.UPDATE_COMMAND_SINTAX);
			}
		}
		else{
			validation.fail(ErrorMessage.EMPTY_COMMAND);
		}
		return validation;

	};

	this.execute=function(cube){
		debugger;
		cube.updateCell(getCellX(), getCellY(), getCellZ(), getValueToTupdate())
		.then(that.dispatchSuccess,that.dispatchError);
		return that;
	};
};
UpdateCommand=Command.extends(UpdateCommand);


module.exports=UpdateCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./TestCaseCommand":7,"./base/Command":10}],10:[function(require,module,exports){
var Command=function(command){
	var commandString=command;
	var deferred=jQuery.Deferred();
	var that=this;
	this.getCommandString=function(){
		return commandString.trim();
	};
	this.getPromise=function(){
		return deferred.promise();
	};
	this.dispatchSuccess=function(result){
		deferred.resolve(result);
	};
	this.dispatchError=function(error){
		deferred.reject(error);
	};
	this.validate=function(command){
		return true;
	};
	this.execute=function(){

	};

};
Command.extends=function(Child){
	//http://julien.richard-foy.fr/blog/2011/10/30/functional-inheritance-vs-prototypal-inheritance/
	function F() {}
	F.prototype = Command.prototype;
	Child.prototype=new F();
	_.extend(Child.prototype,Command.prototype);
	return Child;
};
Command.Validation=function(command){
	var commandString=command;
	var errorMsg="";
	var isValid=false;
	this.fail=function(errorMessage){
		errorMsg=errorMessage;
		isValid=false;
	};
	this.success=function(){
		errorMsg="";
		isValid=true;
	};
	this.getCommandString=function(){
		return commandString;
	};
	this.getErrorMessage=function(){
		return errorMsg;
	};
	this.isValid=function(){
		return isValid;
	};
};
/*Command.Type={
	TEST_PLAN:'TEST_PLAN',
	TEST_CASE:'TEST_CASE',
	QUERY:'QUERY',
	UPDATE:'UPDATE',
};*/
module.exports=Command;
},{}],11:[function(require,module,exports){
var CubeStorage = require('../../storage/CubeStorage');
var Cube=function(size){
	var cubeSize=size;
	this.load=function(){
		debugger;
		return CubeStorage.createTable()
			.then(CubeStorage.resetCube)
			.then(function() { CubeStorage.populateCube(cubeSize);});
	};
	this.updateCell=function(x,y,z,value){
		debugger;
		return CubeStorage.updateCell(x,y,z,value).then(function(result){
			debugger;
			return null;
		});
	};
	this.summateCells=function(x1, y1, z1, x2, y2, z2){
		debugger;
		return CubeStorage.summateCells(x1, y1, z1, x2, y2, z2).then(function(resultSet){
			debugger;
			return resultSet.rows[0].sum;
		});
	};
};
module.exports=Cube;
},{"../../storage/CubeStorage":13}],12:[function(require,module,exports){
var Application=require('./Application');

$(function(){
	var app=new Application();
	app.start();
});

},{"./Application":1}],13:[function(require,module,exports){
var CubeStorage = {};
CubeStorage.CUBE_DB = "cube_db";
CubeStorage.CUBE_CELL_TABLE = "cube_cell";
CubeStorage.CUBE_CELL_X = "x";
CubeStorage.CUBE_CELL_Y = "y";
CubeStorage.CUBE_CELL_Z = "z";
CubeStorage.CUBE_CELL_VALUE = "cell_value";
CubeStorage.CUBE_CELL_SUM = "sum";

var DB;
try {
    DB = openDatabase(CubeStorage.CUBE_DB, '1.0', 'Cube DB', 5 * 1024 * 1024);
} catch (e) {

}

function execQuery(query, params) {
	debugger;
    var deferred = jQuery.Deferred();
    if (DB !== null) {
        DB.transaction(function(tx) {
            tx.executeSql(query, params, function(tx, results) {
                deferred.resolve(results);
            }, function(tx, error) {
                console.log('error', error);
                deferred.reject(error);
            });
        });
    } else {
        deferred.reject(arguments);
    }
    return deferred.promise();
}


CubeStorage.createTable = function() {
    var sql = 'CREATE TABLE IF NOT EXISTS  ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += '(' + CubeStorage.CUBE_CELL_X + ' NUMERIC, ';
    sql += CubeStorage.CUBE_CELL_Y + ' NUMERIC, ';
    sql += CubeStorage.CUBE_CELL_Z + ' NUMERIC, ';
    sql += CubeStorage.CUBE_CELL_VALUE + ' NUMERIC, ';
    sql += "PRIMARY KEY (" + CubeStorage.CUBE_CELL_X + ',' + CubeStorage.CUBE_CELL_Y + ',' + CubeStorage.CUBE_CELL_Z + ') );';
    console.log(sql);
    debugger;

    return execQuery(sql, []);
};

CubeStorage.resetCube = function(size) {
	var sql = 'DELETE FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    console.log(sql);
    debugger;
    return execQuery(sql, []);
};


CubeStorage.populateCube = function(size) {
	var sql = 'INSERT INTO ' + CubeStorage.CUBE_CELL_TABLE + ' VALUES ';
    var cells = [];
    for (x = 1; x <= size; x++) {
        for (y = 1; y <= size; y++) {
            for (z = 1; z <= size; z++) {
                cells.push('('+[x,y,z,0].join(',')+')');
            }
        }
    }

    sql+=cells.join(', ');
    console.log(sql);
    debugger;
    return execQuery(sql, []);
};


CubeStorage.updateCell = function(x, y, z, value) {
    
    var sql = 'UPDATE ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'SET ' + CubeStorage.CUBE_CELL_VALUE + '=' + value + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' = ' + x + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' = ' + y + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' = ' + z + ' ';

    console.log(sql);
    debugger;
    return execQuery(sql, []);
    
};

CubeStorage.getCell = function(x, y, z) {
    var sql = 'SELECT * FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' = ' + x + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' = ' + y + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' = ' + z + ' ';
    console.log(sql);
    debugger;
    return execQuery(sql, []);
};

CubeStorage.summateCells = function(x1, y1, z1, x2, y2, z2) {
    var sql = 'SELECT SUM('+CubeStorage.CUBE_CELL_VALUE+') AS '+CubeStorage.CUBE_CELL_SUM+' FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' >= ' + x1 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_X + ' <= ' + x2 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' >= ' + y1 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' <= ' + y2 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' >= ' + z1 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' <= ' + z2 + ' ';
    console.log(sql);
    debugger;
    return execQuery(sql, []);
};

module.exports = CubeStorage;

},{}],14:[function(require,module,exports){
var CommandsView = Backbone.View.extend({
  el: '#main-view',
  commandsInput:null,
  executionOutput:null,
  events:{
  	'click #execute-button':'_onExecuteBtnClick'
  },
  initialize:function(){
  	this.commandsInput=this.$('#commands-text');
    

    var dummyCommands=  "2";
    dummyCommands +=    "\n4 5";
    dummyCommands +=    "\nUPDATE 2 2 2 4";
    dummyCommands +=    "\nQUERY 1 1 1 3 3 3";
    dummyCommands +=    "\nUPDATE 1 1 1 23";
    dummyCommands +=    "\nQUERY 2 2 2 4 4 4";
    dummyCommands +=    "\nQUERY 1 1 1 3 3 3";
    dummyCommands +=    "\n2 4";
    dummyCommands +=    "\nUPDATE 2 2 2 1";
    dummyCommands +=    "\nQUERY 1 1 1 1 1 1";
    dummyCommands +=    "\nQUERY 1 1 1 2 2 2";
    dummyCommands +=    "\nQUERY 2 2 2 2 2 2";


    this.commandsInput.val(dummyCommands);
  	this.executionOutput=this.$('#execution-result-text');
  },
  _onExecuteBtnClick:function(e){
  	this._dispatchExecute();

  },
  _dispatchExecute:function(){
  	var commands=this.commandsInput.val();
  	this.trigger(CommandsView.EXECUTION_STARTED, commands);
  },
  displayResults:function(resultString, timeElapsed){
  	this._showResults(resultString);
  },
  _showResults:function(resultString){
  	this.executionOutput.val(resultString);
  },
  displayError:function(executionError){
    this.executionOutput.val(executionError.getErrorMessage());
  }
},{
	EXECUTION_STARTED:'execution-started'

});
module.exports=CommandsView;
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvY29yZS9jdWJlL0N1YmUuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zdG9yYWdlL0N1YmVTdG9yYWdlLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29tbWFuZHNWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9Db21tYW5kc1ZpZXcnKTtcclxudmFyIEV4ZWN1dGlvbiA9IHJlcXVpcmUoJy4vY29yZS9FeGVjdXRpb24nKTtcclxuLy92YXIgQ3ViZVN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UvQ3ViZVN0b3JhZ2UnKTtcclxudmFyIEFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblZpZXcgPSBudWxsO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIG1haW5WaWV3ID0gbmV3IENvbW1hbmRzVmlldygpO1xyXG4gICAgICAgIG1haW5WaWV3Lm9uKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgX29uRXhlY3Rpb25TdGFydGVkKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIF9vbkV4ZWN0aW9uU3RhcnRlZCA9IGZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKSB7XHJcbiAgICAgICAgZXhlY3V0ZShjb21tYW5kc1N0cmluZyk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBleGVjdXRlID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgICAgICAvKnZhciBwb3B1bGF0ZUN1YmU9ZnVuY3Rpb24oKXtDdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUoNCk7fTtcclxuICAgICAgICB2YXIgcmVzZXRDdWJlPWZ1bmN0aW9uKCl7Q3ViZVN0b3JhZ2UucmVzZXRDdWJlKCkudGhlbihwb3B1bGF0ZUN1YmUpO307XHJcbiAgICAgICAgdmFyIGNyZWF0ZVRhYmxlPWZ1bmN0aW9uKCl7Q3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUoKS50aGVuKHJlc2V0Q3ViZSk7fTtcclxuICAgICAgICBjcmVhdGVUYWJsZSgpOyovXHJcbiAgICAgICAgLypDdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSgpXHJcbiAgICAgICAgLnRoZW4oQ3ViZVN0b3JhZ2UucmVzZXRDdWJlKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7cmV0dXJuIEN1YmVTdG9yYWdlLnBvcHVsYXRlQ3ViZSg0KX0pOyovXHJcbiAgICAgICAgdmFyIGV4ZWN1dGlvbj1uZXcgRXhlY3V0aW9uKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgICAgICBleGVjdXRpb24uZ2V0UHJvbWlzZSgpLnRoZW4oX29uRXhlY3V0aW9uU3VjY2Vzcyxfb25FeGVjdXRpb25FcnJvcik7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coQ3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUoKS50aGVuKEN1YmVTdG9yYWdlLnJlc2V0Q3ViZSkudGhlbihmdW5jdGlvbigpIHsgQ3ViZVN0b3JhZ2UucG9wdWxhdGVDdWJlKDQpO30pKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIF9vbkV4ZWN1dGlvblN1Y2Nlc3MgPSBmdW5jdGlvbihleGVjdXRpb25SZXN1bHQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdGFkbyBmdWVcIiwgZXhlY3V0aW9uUmVzdWx0KTtcclxuICAgICAgICBzaG93UmVzdWx0cyhleGVjdXRpb25SZXN1bHQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3V0aW9uRXJyb3IgPSBmdW5jdGlvbihleGVjdXRpb25FcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGNvbiBlcnJvciBmdWVcIiwgZXhlY3V0aW9uRXJyb3IpO1xyXG4gICAgICAgIHNob3dFcnJvcihleGVjdXRpb25FcnJvcik7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBzaG93UmVzdWx0cyA9IGZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCkge1xyXG4gICAgICAgIHZhciByZXN1bHRTdHJpbmcgPSBleGVjdXRpb25SZXN1bHQuZ2V0VmFsdWUoKTtcclxuICAgICAgICB2YXIgdGltZUVsYXBzZWQgPSBleGVjdXRpb25SZXN1bHQuZ2V0VGltZUVsYXBzZWQoKTtcclxuICAgICAgICBtYWluVmlldy5kaXNwbGF5UmVzdWx0cyhyZXN1bHRTdHJpbmcsIHRpbWVFbGFwc2VkKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHNob3dFcnJvciA9IGZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKSB7XHJcbiAgICAgICAgbWFpblZpZXcuZGlzcGxheUVycm9yKGV4ZWN1dGlvbkVycm9yKTtcclxuICAgIH07XHJcblxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uO1xyXG4iLCJ2YXIgQ29uZmlnPXtcclxuXHRNSU5fVEVTVFNfQ0FTRVM6MSxcclxuXHRNQVhfVEVTVFNfQ0FTRVM6NTAsXHJcblx0TUlOX0NVQkVfU0laRToxLFxyXG5cdE1BWF9DVUJFX1NJWkU6MTAwLFxyXG5cdE1JTl9URVNUX0NBU0VTX09QRVJBVElPTlM6MSxcclxuXHRNQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TOjEwMDAsXHJcblx0TUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6LU1hdGgucG93KDEwLDkpLFxyXG5cdE1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFOk1hdGgucG93KDEwLDkpLFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHM9Q29uZmlnOyIsInZhciBDb25maWc9cmVxdWlyZSgnLi9Db25maWcnKTtcclxudmFyIEVycm9yTWVzc2FnZT17XHJcblx0Tk9fQ09NTUFORFNcdFx0XHRcdFx0XHQ6XCJObyBoYXkgY29tYW5kb3MgcGFyYSBlamVjdXRhclwiLFxyXG5cdEVNUFRZX0NPTU1BTkRcdFx0XHRcdFx0OlwiQ29tYW5kbyBlc3RhIHZhY2lvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVyb1wiLFxyXG5cdFRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFU1x0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyBkZWJlIGNvbnRlbmVyIHVuIG7Dum1lcm8gKHRlc3QgY2FzZXMpIGVudHJlIFwiK0NvbmZpZy5NSU5fVEVTVFNfQ0FTRVMrXCIgeSBcIitDb25maWcuTUFYX1RFU1RTX0NBU0VTLFxyXG5cdFRFU1RfQ0FTRV9DT01NQU5EX1NJTlRBWFx0XHQ6XCJFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBkb3MgbsO6bWVyb3Mgc2VwYXJhZG9zIHBvciB1biBlc3BhY2lvXCIsXHJcblx0VEVTVF9DQVNFX1dST05HX0NVQkVfU0laRVx0XHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGVsIHByaW1lciBudW1lcm8gKHRhbWHDsW8gZGVsIGN1Ym8pIGVudHJlIFwiK0NvbmZpZy5NSU5fQ1VCRV9TSVpFK1wiIHkgXCIrQ29uZmlnLk1BWF9DVUJFX1NJWkUsXHJcblx0VEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGVsIHNlZ3VuZG8gbnVtZXJvIChvcGVyYWNpb25lcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUX0NBU0VTX09QRVJBVElPTlMrXCIgeSBcIitDb25maWcuTUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyxcclxuXHRPUEVSQVRJT05fVU5LTk9XTlx0XHRcdFx0OlwiT3BlcmFjacOzbiBkZXNjb25vY2lkYVwiLFxyXG5cdFVQREFURV9DT01NQU5EX1NJTlRBWFx0XHRcdDonRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgc2VyIHNpbWlsYXIgYSBcIlVQREFURSAyIDIgMiA0XCIgKFJldmlzYXIgZXNwYWNpb3MpJyxcclxuXHRVUERBVEVfV1JPTkdfQ1VCRV9DRUxMU1x0XHQgICAgOidFcnJvciBkZSBWYWxvcmVzLCBsYXMgY29yZGVuYWRhcyBkZSBsYSBjZWxkYSBkZWwgY3VibyBzb24gaW52YWxpZGFzJyxcclxuXHRVUERBVEVfV1JPTkdfVkFMVUVfVE9fVVBEQVRFXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCB2YWxvciBhIGFjdHVhbGl6YXIgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFK1wiIHkgXCIrQ29uZmlnLk1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFLFxyXG5cdFFVRVJZX0NPTU1BTkRfU0lOVEFYXHRcdFx0OidFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBzZXIgc2ltaWxhciBhIFwiUVVFUlkgMSAxIDEgMyAzIDNcIiAoUmV2aXNhciBlc3BhY2lvcyknLFxyXG5cdFFVRVJZX1dST05HX0NVQkVfQ0VMTFNcdFx0ICAgIDonRXJyb3IgZGUgVmFsb3JlcywgbGFzIGNvcmRlbmFkYXMgZGUgbGFzIGNlbGRhcyBkZWwgY3VibyBzb24gaW52YWxpZGFzJyxcclxuXHRFWEVDVVRJT05fRVJST1JcdFx0ICAgIFx0XHQ6J0Vycm9yIGVuIGxhIGVqZWN1Y2nDs24nLFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1FcnJvck1lc3NhZ2U7IiwidmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKCcuLi9jb25maWcvRXJyb3JNZXNzYWdlJyk7XHJcbnZhciBDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQnKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kJyk7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZCcpO1xyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvT3BlcmF0aW9uQ29tbWFuZCcpO1xyXG52YXIgRXhlY3V0aW9uID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgIHZhciBleGVjRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgIHZhciBleGVjdXRpb25FcnJvckRpc3BhdGhlZD1mYWxzZTtcclxuICAgIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIGZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyl7XHJcbiAgICBcdGlmKCFjb21tYW5kc1N0cmluZyB8fCBjb21tYW5kc1N0cmluZz09PScnKXtcclxuICAgIFx0XHRkaXNwYXRjaEVycm9yKCcnLCBFcnJvck1lc3NhZ2UuTk9fQ09NTUFORFMsMCk7XHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHR9XHJcbiAgICBcdHJldHVybiBjb21tYW5kc1N0cmluZy5zcGxpdCgnXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZHMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRcclxuICAgIFx0dmFyIGxpbmVzPWV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBcdHZhciBudW1MaW5lcz1saW5lcyAmJiBsaW5lcy5sZW5ndGg7XHJcbiAgICBcdGlmKCFsaW5lcyB8fCFudW1MaW5lcylcclxuICAgIFx0XHRyZXR1cm47XHJcbiAgICBcdFxyXG4gICAgXHQvL3ZhciBjb21tYW5kcz1bXTtcclxuICAgIFx0XHJcblxyXG4gICAgXHR2YXIgY3VyTGluZU51bWJlcj0wO1xyXG4gICAgXHRcclxuICAgIFx0ZnVuY3Rpb24gZ2V0TmV4dExpbmUoKXtcclxuICAgIFx0XHRpZihjdXJMaW5lTnVtYmVyKzE8PW51bUxpbmVzKVxyXG4gICAgXHRcdFx0Y3VyTGluZU51bWJlcisrO1xyXG4gICAgXHRcdHJldHVybiBsaW5lc1tjdXJMaW5lTnVtYmVyLTFdO1xyXG4gICAgXHR9XHJcblxyXG5cclxuICAgIFx0Ly9tYWtlIFRlc3RQbGFuIGNvbW1hbmRcclxuICAgIFx0dmFyIHRlc3RQbGFuQ29tbWFuZD1uZXcgVGVzdFBsYW5Db21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG4gICAgXHR2YXIgdmFsaWRhdGlvblRlc3RQbGFuPXRlc3RQbGFuQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG4gICAgXHRpZih2YWxpZGF0aW9uVGVzdFBsYW4uaXNWYWxpZCgpKXtcclxuXHJcbiAgICBcdFx0Ly9jb21tYW5kcy5wdXNoKHRlc3RQbGFuQ29tbWFuZCk7XHJcbiAgICBcdFx0dmFyIG51bVRlc3RDYXNlcz10ZXN0UGxhbkNvbW1hbmQuZ2V0TnVtVGVzdENhc2VzKCk7XHJcblxyXG4gICAgXHRcdGNyZWF0aW9uVGVzdENhc2VzOntcclxuXHQgICAgXHRcdGZvcih2YXIgaT0xO2k8PW51bVRlc3RDYXNlcztpKyspe1xyXG5cdCAgICBcdFx0XHR2YXIgdGVzdENhc2VDb21tYW5kPW5ldyBUZXN0Q2FzZUNvbW1hbmQoZ2V0TmV4dExpbmUoKSk7XHJcblx0ICAgIFx0XHRcdHZhciB2YWxpZGF0aW9uVGVzdENhc2U9dGVzdENhc2VDb21tYW5kLnZhbGlkYXRlKCk7XHJcblx0ICAgIFx0XHRcdGlmKHZhbGlkYXRpb25UZXN0Q2FzZS5pc1ZhbGlkKCkpe1xyXG5cdCAgICBcdFx0XHRcdFxyXG5cdCAgICBcdFx0XHRcdHRlc3RQbGFuQ29tbWFuZC5hZGRUZXN0Q2FzZUNvbW1hbmQodGVzdENhc2VDb21tYW5kKTtcclxuXHQgICAgXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz10ZXN0Q2FzZUNvbW1hbmQuZ2V0TnVtT3BlcmF0aW9ucygpO1xyXG5cdCAgICBcdFx0XHRcdHZhciBjdWJlU2l6ZT10ZXN0Q2FzZUNvbW1hbmQuZ2V0Q3ViZVNpemUoKTtcclxuXHQgICAgXHRcdFx0XHRjcmVhdGlvbk9wZXJhdGlvbnM6e1xyXG5cdFx0ICAgIFx0XHRcdFx0Zm9yKHZhciBqPTE7ajw9bnVtT3BlcmF0aW9ucztqKyspe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHR2YXIgb3BlcmF0aW9uQ29tbWFuZD1uZXcgT3BlcmF0aW9uQ29tbWFuZChnZXROZXh0TGluZSgpLCBjdWJlU2l6ZSk7XHRcclxuXHRcdCAgICBcdFx0XHRcdFx0dmFyIHZhbGlkYXRpb25PcGVyYXRpb249b3BlcmF0aW9uQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRpZih2YWxpZGF0aW9uT3BlcmF0aW9uLmlzVmFsaWQoKSl7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0dGVzdENhc2VDb21tYW5kLmFkZE9wZXJhdGlvbkNvbW1hbmQob3BlcmF0aW9uQ29tbWFuZCk7XHJcblx0XHQgICAgXHRcdFx0XHRcdH1cclxuXHRcdCAgICBcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uT3BlcmF0aW9uLGN1ckxpbmVOdW1iZXIpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdFxyXG5cdFx0ICAgIFx0XHRcdFx0XHR9XHJcblx0XHQgICAgXHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgXHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdFx0ZWxzZXtcclxuXHQgICAgXHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uVGVzdENhc2UsY3VyTGluZU51bWJlcik7XHJcblx0ICAgIFx0XHRcdFx0YnJlYWsgY3JlYXRpb25UZXN0Q2FzZXM7XHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdH1cclxuICAgIFx0XHR9XHJcbiAgICAgICAgICAgIFxyXG4gICAgXHR9XHJcbiAgICBcdGVsc2V7XHJcbiAgICBcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RQbGFuLGN1ckxpbmVOdW1iZXIpO1xyXG4gICAgXHR9XHJcblxyXG4gICAgICAgIGlmKCFleGVjdXRpb25FcnJvckRpc3BhdGhlZClcclxuICAgICAgICAgICAgZXhlY3V0ZUNvbW1hbmRzKHRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxuXHJcblx0ICAgIC8qXy5lYWNoKGxpbmVzLCBmdW5jdGlvbihsaW5lLCBpbmRleCl7XHJcblx0ICAgIFx0Y29uc29sZS5sb2coaW5kZXgsIGxpbmUpO1xyXG5cdCAgICB9KTsqL1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBleGVjdXRlQ29tbWFuZHModGVzdFBsYW5Db21tYW5kKXtcclxuICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB2YXIgdGltZVN0YXJ0PW5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHRlc3RQbGFuQ29tbWFuZC5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24ocmVzdWx0U3RyaW5nKXtcclxuICAgICAgICAgICAgdmFyIHRpbWVFbmQ9bmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHZhciB0aW1lRWxhcHNlZD10aW1lRW5kLXRpbWVTdGFydDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFamVjdWNpb24gY29tcGxldGFkYVwiLCB0aW1lRWxhcHNlZCk7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICBkaXNwYXRjaFN1Y2Nlc3MocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCk7XHJcbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBkaXNwYXRjaEVycm9yKCcnLCBFcnJvck1lc3NhZ2UuRVhFQ1VUSU9OX0VSUk9SLDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb24sIGxpbmUgKXtcclxuICAgICAgICBleGVjdXRpb25FcnJvckRpc3BhdGhlZD10cnVlO1xyXG4gICAgXHRkaXNwYXRjaEVycm9yKFxyXG4gICAgXHRcdHZhbGlkYXRpb24uZ2V0Q29tbWFuZFN0cmluZygpLCBcclxuICAgIFx0XHR2YWxpZGF0aW9uLmdldEVycm9yTWVzc2FnZSgpLCBcclxuICAgIFx0XHRsaW5lIFxyXG4gICAgXHQpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hFcnJvcihjb21tYW5kU3RyLCBlcnJvck1zZywgbGluZSApe1xyXG4gICAgXHR2YXIgZXJyb3I9bmV3IEV4ZWN1dGlvbi5FcnJvcihcclxuICAgIFx0XHRjb21tYW5kU3RyLCBcclxuICAgIFx0XHRlcnJvck1zZywgXHJcbiAgICBcdFx0bGluZSBcclxuICAgIFx0KTtcclxuICAgIFx0ZXhlY0RlZmVycmVkLnJlamVjdChlcnJvcik7XHRcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaFN1Y2Nlc3MocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCApe1xyXG4gICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIHZhciByZXN1bHQ9bmV3IEV4ZWN1dGlvbi5SZXN1bHQoXHJcbiAgICAgICAgICAgIHJlc3VsdFN0cmluZywgXHJcbiAgICAgICAgICAgIHRpbWVFbGFwc2VkXHJcbiAgICAgICAgKTtcclxuICAgICAgICBleGVjRGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpOyBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdldFByb21pc2U9ZnVuY3Rpb24oKXtcclxuICAgIFx0cmV0dXJuIGV4ZWNEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9O1xyXG4gICAgXHJcbn07XHJcbkV4ZWN1dGlvbi5SZXN1bHQgPSBmdW5jdGlvbih2YWx1ZSwgdGltZUVsYXBzZWQpIHtcclxuICAgIHZhciBtVmFsdWUgPSB2YWx1ZTtcclxuICAgIHZhciBtVGltZUVsYXBzZWQgPSB0aW1lRWxhcHNlZDtcclxuICAgIHRoaXMuZ2V0VmFsdWU9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbVZhbHVlO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2V0VGltZUVsYXBzZWQ9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbVRpbWVFbGFwc2VkO1xyXG4gICAgfTtcclxufTtcclxuRXhlY3V0aW9uLkVycm9yID0gZnVuY3Rpb24oY29tbWFuZFN0cmluZywgZXJyb3JNZXNzYWdlLCBjb21tYW5kTGluZSkge1xyXG5cdHZhciBtQ29tbWFuZFN0cmluZyA9IGNvbW1hbmRTdHJpbmc7XHJcbiAgICB2YXIgbUVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcclxuICAgIHZhciBtQ29tbWFuZExpbmUgPSBjb21tYW5kTGluZTtcclxuICAgIHRoaXMuZ2V0Q29tbWFuZFN0cmluZz0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtQ29tbWFuZFN0cmluZztcclxuICAgIH07XHJcbiAgICB0aGlzLmdldEVycm9yTWVzc2FnZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtRXJyb3JNZXNzYWdlO1xyXG4gICAgfTtcdFxyXG4gICAgdGhpcy5nZXRDb21tYW5kTGluZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtQ29tbWFuZExpbmU7XHJcbiAgICB9O1x0XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gRXhlY3V0aW9uO1xyXG4iLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgUXVlcnlDb21tYW5kPXJlcXVpcmUoXCIuL1F1ZXJ5Q29tbWFuZFwiKTtcclxudmFyIFVwZGF0ZUNvbW1hbmQ9cmVxdWlyZShcIi4vVXBkYXRlQ29tbWFuZFwiKTtcclxuXHJcbnZhciBPcGVyYXRpb25Db21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIGN1YmVTaXplKXtcclxuXHRpZigvXlFVRVJZLy50ZXN0KGNvbW1hbmRTdHJpbmcpKXtcclxuXHRcdHJldHVybiBuZXcgUXVlcnlDb21tYW5kKGNvbW1hbmRTdHJpbmcsY3ViZVNpemUpO1xyXG5cdH1cclxuXHRlbHNlIGlmKC9eVVBEQVRFLy50ZXN0KGNvbW1hbmRTdHJpbmcpKXtcclxuXHRcdHJldHVybiBuZXcgVXBkYXRlQ29tbWFuZChjb21tYW5kU3RyaW5nLGN1YmVTaXplKTtcclxuXHR9XHJcblx0XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLk9QRVJBVElPTl9VTktOT1dOKTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRcdFxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblx0fTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPU9wZXJhdGlvbkNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBRdWVyeUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgX2N1YmVTaXplKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9X2N1YmVTaXplO1xyXG5cdHZhciBjZWxsWDE9MCxjZWxsWDI9MCxjZWxsWTE9MCxjZWxsWTI9MCxjZWxsWjE9MCxjZWxsWjI9MDtcclxuXHR2YXIgc2V0Q3ViZUNlbGxzPWZ1bmN0aW9uKFgxLFgyLFkxLFkyLFoxLFoyKXtcclxuXHRcdGNlbGxYMT1YMTtcclxuXHRcdGNlbGxYMj1YMjtcclxuXHRcdGNlbGxZMT1ZMTtcclxuXHRcdGNlbGxZMj1ZMjtcclxuXHRcdGNlbGxaMT1aMTtcclxuXHRcdGNlbGxaMj1aMjtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHZhbGlkYXRlQ2VsbD1mdW5jdGlvbihjZWxsQ29vcmQpe1xyXG5cdFx0cmV0dXJuIGNlbGxDb29yZD49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY2VsbENvb3JkPD10aGF0LmdldEN1YmVTaXplKCk7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eUVVFUllcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZXM9Y21kLm1hdGNoKC8tP1xcZCsvZyk7XHJcblxyXG5cdFx0XHRcdHZhciBjZWxsWDE9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFkxPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxaMT1wYXJzZUludCh2YWx1ZXNbMl0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWDI9cGFyc2VJbnQodmFsdWVzWzNdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFkyPXBhcnNlSW50KHZhbHVlc1s0XSk7XHJcblx0XHRcdFx0dmFyIGNlbGxaMj1wYXJzZUludCh2YWx1ZXNbNV0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYMSkgJiYgdmFsaWRhdGVDZWxsKGNlbGxZMSkgJiYgdmFsaWRhdGVDZWxsKGNlbGxaMSkgJiZcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWDIpICYmIHZhbGlkYXRlQ2VsbChjZWxsWTIpICYmIHZhbGlkYXRlQ2VsbChjZWxsWjIpICYmXHJcblx0XHRcdFx0XHRjZWxsWDE8PWNlbGxYMiAmJiBjZWxsWTE8PWNlbGxZMiAmJiBjZWxsWjE8PWNlbGxaMlxyXG5cdFx0XHRcdFx0KXtcclxuXHJcblx0XHRcdFx0XHRzZXRDdWJlQ2VsbHMoY2VsbFgxLGNlbGxYMixjZWxsWTEsY2VsbFkyLGNlbGxaMSxjZWxsWjIpO1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlFVRVJZX1dST05HX0NVQkVfQ0VMTFMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5RVUVSWV9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKGN1YmUpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRjdWJlLnN1bW1hdGVDZWxscyhjZWxsWDEsY2VsbFkxLGNlbGxaMSwgY2VsbFgyLCBjZWxsWTIsIGNlbGxaMilcclxuXHRcdC50aGVuKHRoYXQuZGlzcGF0Y2hTdWNjZXNzLHRoYXQuZGlzcGF0Y2hFcnJvcik7XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5RdWVyeUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFF1ZXJ5Q29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9UXVlcnlDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBDdWJlPXJlcXVpcmUoXCIuLy4uL2N1YmUvQ3ViZVwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9MDtcclxuXHR2YXIgbnVtT3BlcmF0aW9ucz0wO1xyXG5cdHZhciBvcGVyYXRpb25zPVtdO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIGN1YmU9bnVsbDtcclxuXHR2YXIgc2V0Q3ViZVNpemU9ZnVuY3Rpb24obnVtKXtcclxuXHRcdGN1YmVTaXplPW51bTtcclxuXHR9O1xyXG5cdHZhciBzZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRudW1PcGVyYXRpb25zPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtT3BlcmF0aW9ucz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bU9wZXJhdGlvbnM7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBjcmVhdGVDdWJlKCl7XHJcblx0XHRjdWJlPW5ldyBDdWJlKHRoYXQuZ2V0Q3ViZVNpemUoKSk7XHJcblx0XHRyZXR1cm4gY3ViZTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZ2V0Q3ViZSgpe1xyXG5cdFx0cmV0dXJuIGN1YmU7XHJcblx0fVxyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goL1xcZCsvZyk7XHJcblx0XHRcdFx0dmFyIGN1YmVTaXplPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIG51bU9wZXJhdGlvbnM9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihjdWJlU2l6ZT49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY3ViZVNpemU8PUNvbmZpZy5NQVhfQ1VCRV9TSVpFKXtcclxuXHRcdFx0XHRcdGlmKG51bU9wZXJhdGlvbnM+PUNvbmZpZy5NSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TICYmIG51bU9wZXJhdGlvbnM8PUNvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TKXtcclxuXHRcdFx0XHRcdFx0c2V0Q3ViZVNpemUoY3ViZVNpemUpO1xyXG5cdFx0XHRcdFx0XHRzZXROdW1PcGVyYXRpb25zKG51bU9wZXJhdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TKTtcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cdH07XHJcblx0dGhpcy5hZGRPcGVyYXRpb25Db21tYW5kPWZ1bmN0aW9uKG9wZXJhdGlvbkNvbW1hbmQpe1xyXG5cdFx0b3BlcmF0aW9ucy5wdXNoKG9wZXJhdGlvbkNvbW1hbmQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRjcmVhdGVDdWJlKCk7XHJcblx0XHRcclxuXHRcdHZhciBjb3VudE9wZXJhdGlvbnNFeGVjdXRlZD0wO1xyXG5cdFx0dmFyIHJlc3VsdHNTdHJpbmc9XCJcIjtcclxuXHRcdHZhciByZXN1bHRzPVtdO1xyXG5cdFx0XHJcblx0XHR2YXIgc3VjY2Vzc0NhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRyZXN1bHRzU3RyaW5nPXJlc3VsdHMuam9pbignXFxuJyk7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiVGVzdCBDYXNlIGV4ZWN1dGVkXFxuXFxuXCIrcmVzdWx0c1N0cmluZyk7XHJcblx0XHRcdHRoYXQuZGlzcGF0Y2hTdWNjZXNzKHJlc3VsdHNTdHJpbmcpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBlcnJvckNhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoRXJyb3IoYXJndW1lbnRzKTtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiRXJyb3IgZW4gbGEgZWplY3VjacOzbiBkZWwgdGVzdCBjYXNlXCIpO1xyXG5cdFx0fTtcclxuXHRcdGZ1bmN0aW9uIG9wZXJhdGlvbkV4ZWN1dGVkKHJlc3VsdCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRpZihyZXN1bHQhPT1udWxsICYmIF8uaXNOdW1iZXIocmVzdWx0KSl7XHJcblx0XHRcdFx0cmVzdWx0cy5wdXNoKHJlc3VsdCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZXhlY3V0ZU5leHRPcGVyYXRpb24oKTtcclxuXHRcdH1cclxuXHRcdGZ1bmN0aW9uIGV4ZWN1dGVOZXh0T3BlcmF0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRpZihjb3VudE9wZXJhdGlvbnNFeGVjdXRlZDx0aGF0LmdldE51bU9wZXJhdGlvbnMoKSl7XHJcblx0XHRcdFx0dmFyIG5leHRPcGVyYXRpb249b3BlcmF0aW9uc1tjb3VudE9wZXJhdGlvbnNFeGVjdXRlZCsrXTtcclxuXHRcdFx0XHRuZXh0T3BlcmF0aW9uLmdldFByb21pc2UoKS50aGVuKG9wZXJhdGlvbkV4ZWN1dGVkLCBlcnJvckNhbGxiYWNrKTtcclxuXHRcdFx0XHRuZXh0T3BlcmF0aW9uLmV4ZWN1dGUoZ2V0Q3ViZSgpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGdldEN1YmUoKS5sb2FkKCkudGhlbihleGVjdXRlTmV4dE9wZXJhdGlvbiwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcblxyXG59O1xyXG5cclxuVGVzdENhc2VDb21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0Q2FzZUNvbW1hbmQpO1xyXG5tb2R1bGUuZXhwb3J0cz1UZXN0Q2FzZUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBUZXN0UGxhbkNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZyl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIG51bVRlc3RDYXNlcz0wO1xyXG5cdHZhciB0ZXN0Q2FzZXM9W107XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgc2V0TnVtVGVzdENhc2VzPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRudW1UZXN0Q2FzZXM9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXROdW1UZXN0Q2FzZXM9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBudW1UZXN0Q2FzZXM7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eXFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIG51bT1wYXJzZUludChjbWQpO1xyXG5cdFx0XHRcdGlmKG51bT49Q29uZmlnLk1JTl9URVNUU19DQVNFUyAmJiBudW08PUNvbmZpZy5NQVhfVEVTVFNfQ0FTRVMpe1xyXG5cdFx0XHRcdFx0c2V0TnVtVGVzdENhc2VzKG51bSk7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9QTEFOX0NPTU1BTkRfV1JPTkdfVkFMVUVTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9QTEFOX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cdHRoaXMuYWRkVGVzdENhc2VDb21tYW5kPWZ1bmN0aW9uKHRlc3RDYXNlQ29tbWFuZCl7XHJcblx0XHR0ZXN0Q2FzZXMucHVzaCh0ZXN0Q2FzZUNvbW1hbmQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHR2YXIgY291bnRUZXN0Q2FzZXNFeGVjdXRlZD0wO1xyXG5cdFx0dmFyIHJlc3VsdHNTdHJpbmc9XCJcIjtcclxuXHRcdHZhciByZXN1bHRzPVtdO1xyXG5cdFx0dmFyIHN1Y2Nlc3NDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0cmVzdWx0c1N0cmluZz1yZXN1bHRzLmpvaW4oJ1xcbicpO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIlRlc3QgUGxhbiBleGVjdXRlZFxcblxcblwiK3Jlc3VsdHNTdHJpbmcpO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcyhyZXN1bHRzU3RyaW5nKTtcclxuXHRcdH07XHJcblx0XHR2YXIgZXJyb3JDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaEVycm9yKGFyZ3VtZW50cyk7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIkVycm9yIGVuIGxhIGVqZWN1Y2nDs24gZGVsIHRlc3QgcGxhblwiKTtcclxuXHRcdH07XHJcblx0XHRmdW5jdGlvbiB0ZXN0Q2FzZUV4ZWN1dGVkKHJlc3VsdCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRyZXN1bHRzLnB1c2gocmVzdWx0KTtcclxuXHRcdFx0ZXhlY3V0ZU5leHRUZXN0Q2FzZSgpO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gZXhlY3V0ZU5leHRUZXN0Q2FzZSgpe1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoY291bnRUZXN0Q2FzZXNFeGVjdXRlZDx0aGF0LmdldE51bVRlc3RDYXNlcygpKXtcclxuXHRcdFx0XHR2YXIgbmV4dFRlc3RDYXNlPXRlc3RDYXNlc1tjb3VudFRlc3RDYXNlc0V4ZWN1dGVkKytdO1xyXG5cdFx0XHRcdG5leHRUZXN0Q2FzZS5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLnRoZW4odGVzdENhc2VFeGVjdXRlZCwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZXhlY3V0ZU5leHRUZXN0Q2FzZSgpO1xyXG5cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuVGVzdFBsYW5Db21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVRlc3RQbGFuQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFVwZGF0ZUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgX2N1YmVTaXplKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9X2N1YmVTaXplO1xyXG5cdHZhciBjZWxsWD0wO1xyXG5cdHZhciBjZWxsWT0wO1xyXG5cdHZhciBjZWxsWj0wO1xyXG5cdHZhciB2YWx1ZVRvVXBkYXRlPTA7XHJcblx0dmFyIHNldEN1YmVDZWxscz1mdW5jdGlvbihYLFksWil7XHJcblx0XHRjZWxsWD1YO1xyXG5cdFx0Y2VsbFk9WTtcclxuXHRcdGNlbGxaPVo7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBnZXRDZWxsWCgpe1xyXG5cdFx0cmV0dXJuIGNlbGxYO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDZWxsWSgpe1xyXG5cdFx0cmV0dXJuIGNlbGxZO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDZWxsWigpe1xyXG5cdFx0cmV0dXJuIGNlbGxaO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRWYWx1ZVRvVHVwZGF0ZSgpe1xyXG5cdFx0cmV0dXJuIHZhbHVlVG9VcGRhdGU7XHJcblx0fVxyXG5cdHZhciBzZXRWYWx1ZVRvVHVwZGF0ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0dmFsdWVUb1VwZGF0ZT1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciB2YWxpZGF0ZUNlbGw9ZnVuY3Rpb24oY2VsbENvb3JkKXtcclxuXHRcdHJldHVybiBjZWxsQ29vcmQ+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGNlbGxDb29yZDw9dGhhdC5nZXRDdWJlU2l6ZSgpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlVQREFURVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfS0/XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxaPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIHZhbHVlVG9VcGRhdGU9cGFyc2VJbnQodmFsdWVzWzNdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWCkgJiYgdmFsaWRhdGVDZWxsKGNlbGxZKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFopXHJcblxyXG5cdFx0XHRcdFx0KXtcclxuXHJcblx0XHRcdFx0XHRzZXRDdWJlQ2VsbHMoY2VsbFgsY2VsbFksY2VsbFopO1xyXG5cclxuXHRcdFx0XHRcdGlmKHZhbHVlVG9VcGRhdGU+PUNvbmZpZy5NSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRSAmJiB2YWx1ZVRvVXBkYXRlPD1Db25maWcuTUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUpe1xyXG5cdFx0XHRcdFx0XHRzZXRWYWx1ZVRvVHVwZGF0ZSh2YWx1ZVRvVXBkYXRlKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9XUk9OR19WQUxVRV9UT19VUERBVEUpO1x0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9XUk9OR19DVUJFX0NFTExTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oY3ViZSl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGN1YmUudXBkYXRlQ2VsbChnZXRDZWxsWCgpLCBnZXRDZWxsWSgpLCBnZXRDZWxsWigpLCBnZXRWYWx1ZVRvVHVwZGF0ZSgpKVxyXG5cdFx0LnRoZW4odGhhdC5kaXNwYXRjaFN1Y2Nlc3MsdGhhdC5kaXNwYXRjaEVycm9yKTtcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblVwZGF0ZUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFVwZGF0ZUNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVVwZGF0ZUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0dmFyIGNvbW1hbmRTdHJpbmc9Y29tbWFuZDtcclxuXHR2YXIgZGVmZXJyZWQ9alF1ZXJ5LkRlZmVycmVkKCk7XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR0aGlzLmdldENvbW1hbmRTdHJpbmc9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjb21tYW5kU3RyaW5nLnRyaW0oKTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0UHJvbWlzZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hTdWNjZXNzPWZ1bmN0aW9uKHJlc3VsdCl7XHJcblx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0fTtcclxuXHR0aGlzLmRpc3BhdGNoRXJyb3I9ZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cclxuXHR9O1xyXG5cclxufTtcclxuQ29tbWFuZC5leHRlbmRzPWZ1bmN0aW9uKENoaWxkKXtcclxuXHQvL2h0dHA6Ly9qdWxpZW4ucmljaGFyZC1mb3kuZnIvYmxvZy8yMDExLzEwLzMwL2Z1bmN0aW9uYWwtaW5oZXJpdGFuY2UtdnMtcHJvdG90eXBhbC1pbmhlcml0YW5jZS9cclxuXHRmdW5jdGlvbiBGKCkge31cclxuXHRGLnByb3RvdHlwZSA9IENvbW1hbmQucHJvdG90eXBlO1xyXG5cdENoaWxkLnByb3RvdHlwZT1uZXcgRigpO1xyXG5cdF8uZXh0ZW5kKENoaWxkLnByb3RvdHlwZSxDb21tYW5kLnByb3RvdHlwZSk7XHJcblx0cmV0dXJuIENoaWxkO1xyXG59O1xyXG5Db21tYW5kLlZhbGlkYXRpb249ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0dmFyIGNvbW1hbmRTdHJpbmc9Y29tbWFuZDtcclxuXHR2YXIgZXJyb3JNc2c9XCJcIjtcclxuXHR2YXIgaXNWYWxpZD1mYWxzZTtcclxuXHR0aGlzLmZhaWw9ZnVuY3Rpb24oZXJyb3JNZXNzYWdlKXtcclxuXHRcdGVycm9yTXNnPWVycm9yTWVzc2FnZTtcclxuXHRcdGlzVmFsaWQ9ZmFsc2U7XHJcblx0fTtcclxuXHR0aGlzLnN1Y2Nlc3M9ZnVuY3Rpb24oKXtcclxuXHRcdGVycm9yTXNnPVwiXCI7XHJcblx0XHRpc1ZhbGlkPXRydWU7XHJcblx0fTtcclxuXHR0aGlzLmdldENvbW1hbmRTdHJpbmc9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjb21tYW5kU3RyaW5nO1xyXG5cdH07XHJcblx0dGhpcy5nZXRFcnJvck1lc3NhZ2U9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBlcnJvck1zZztcclxuXHR9O1xyXG5cdHRoaXMuaXNWYWxpZD1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblx0fTtcclxufTtcclxuLypDb21tYW5kLlR5cGU9e1xyXG5cdFRFU1RfUExBTjonVEVTVF9QTEFOJyxcclxuXHRURVNUX0NBU0U6J1RFU1RfQ0FTRScsXHJcblx0UVVFUlk6J1FVRVJZJyxcclxuXHRVUERBVEU6J1VQREFURScsXHJcbn07Ki9cclxubW9kdWxlLmV4cG9ydHM9Q29tbWFuZDsiLCJ2YXIgQ3ViZVN0b3JhZ2UgPSByZXF1aXJlKCcuLi8uLi9zdG9yYWdlL0N1YmVTdG9yYWdlJyk7XHJcbnZhciBDdWJlPWZ1bmN0aW9uKHNpemUpe1xyXG5cdHZhciBjdWJlU2l6ZT1zaXplO1xyXG5cdHRoaXMubG9hZD1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRyZXR1cm4gQ3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUoKVxyXG5cdFx0XHQudGhlbihDdWJlU3RvcmFnZS5yZXNldEN1YmUpXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkgeyBDdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUoY3ViZVNpemUpO30pO1xyXG5cdH07XHJcblx0dGhpcy51cGRhdGVDZWxsPWZ1bmN0aW9uKHgseSx6LHZhbHVlKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0cmV0dXJuIEN1YmVTdG9yYWdlLnVwZGF0ZUNlbGwoeCx5LHosdmFsdWUpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHR0aGlzLnN1bW1hdGVDZWxscz1mdW5jdGlvbih4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0cmV0dXJuIEN1YmVTdG9yYWdlLnN1bW1hdGVDZWxscyh4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKS50aGVuKGZ1bmN0aW9uKHJlc3VsdFNldCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0U2V0LnJvd3NbMF0uc3VtO1xyXG5cdFx0fSk7XHJcblx0fTtcclxufTtcclxubW9kdWxlLmV4cG9ydHM9Q3ViZTsiLCJ2YXIgQXBwbGljYXRpb249cmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdHZhciBhcHA9bmV3IEFwcGxpY2F0aW9uKCk7XHJcblx0YXBwLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgQ3ViZVN0b3JhZ2UgPSB7fTtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9EQiA9IFwiY3ViZV9kYlwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgPSBcImN1YmVfY2VsbFwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWCA9IFwieFwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWSA9IFwieVwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWiA9IFwielwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgPSBcImNlbGxfdmFsdWVcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1NVTSA9IFwic3VtXCI7XHJcblxyXG52YXIgREI7XHJcbnRyeSB7XHJcbiAgICBEQiA9IG9wZW5EYXRhYmFzZShDdWJlU3RvcmFnZS5DVUJFX0RCLCAnMS4wJywgJ0N1YmUgREInLCA1ICogMTAyNCAqIDEwMjQpO1xyXG59IGNhdGNoIChlKSB7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBleGVjUXVlcnkocXVlcnksIHBhcmFtcykge1xyXG5cdGRlYnVnZ2VyO1xyXG4gICAgdmFyIGRlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICBpZiAoREIgIT09IG51bGwpIHtcclxuICAgICAgICBEQi50cmFuc2FjdGlvbihmdW5jdGlvbih0eCkge1xyXG4gICAgICAgICAgICB0eC5leGVjdXRlU3FsKHF1ZXJ5LCBwYXJhbXMsIGZ1bmN0aW9uKHR4LCByZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbih0eCwgZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbn1cclxuXHJcblxyXG5DdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNxbCA9ICdDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnKCcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gXCJQUklNQVJZIEtFWSAoXCIgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcsJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJywnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnKSApOyc7XHJcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgZGVidWdnZXI7XHJcblxyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcbkN1YmVTdG9yYWdlLnJlc2V0Q3ViZSA9IGZ1bmN0aW9uKHNpemUpIHtcclxuXHR2YXIgc3FsID0gJ0RFTEVURSBGUk9NICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgZGVidWdnZXI7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxuXHJcbkN1YmVTdG9yYWdlLnBvcHVsYXRlQ3ViZSA9IGZ1bmN0aW9uKHNpemUpIHtcclxuXHR2YXIgc3FsID0gJ0lOU0VSVCBJTlRPICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnIFZBTFVFUyAnO1xyXG4gICAgdmFyIGNlbGxzID0gW107XHJcbiAgICBmb3IgKHggPSAxOyB4IDw9IHNpemU7IHgrKykge1xyXG4gICAgICAgIGZvciAoeSA9IDE7IHkgPD0gc2l6ZTsgeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAoeiA9IDE7IHogPD0gc2l6ZTsgeisrKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKCcoJytbeCx5LHosMF0uam9pbignLCcpKycpJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3FsKz1jZWxscy5qb2luKCcsICcpO1xyXG4gICAgY29uc29sZS5sb2coc3FsKTtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcblxyXG5DdWJlU3RvcmFnZS51cGRhdGVDZWxsID0gZnVuY3Rpb24oeCwgeSwgeiwgdmFsdWUpIHtcclxuICAgIFxyXG4gICAgdmFyIHNxbCA9ICdVUERBVEUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnU0VUICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgKyAnPScgKyB2YWx1ZSArICcgJztcclxuICAgIHNxbCArPSAnV0hFUkUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA9ICcgKyB4ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA9ICcgKyB5ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA9ICcgKyB6ICsgJyAnO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHNxbCk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbiAgICBcclxufTtcclxuXHJcbkN1YmVTdG9yYWdlLmdldENlbGwgPSBmdW5jdGlvbih4LCB5LCB6KSB7XHJcbiAgICB2YXIgc3FsID0gJ1NFTEVDVCAqIEZST00gJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnV0hFUkUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA9ICcgKyB4ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA9ICcgKyB5ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA9ICcgKyB6ICsgJyAnO1xyXG4gICAgY29uc29sZS5sb2coc3FsKTtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcbkN1YmVTdG9yYWdlLnN1bW1hdGVDZWxscyA9IGZ1bmN0aW9uKHgxLCB5MSwgejEsIHgyLCB5MiwgejIpIHtcclxuICAgIHZhciBzcWwgPSAnU0VMRUNUIFNVTSgnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9WQUxVRSsnKSBBUyAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9TVU0rJyBGUk9NICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1dIRVJFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPj0gJyArIHgxICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA8PSAnICsgeDIgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnID49ICcgKyB5MSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPD0gJyArIHkyICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA+PSAnICsgejEgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnIDw9ICcgKyB6MiArICcgJztcclxuICAgIGNvbnNvbGUubG9nKHNxbCk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEN1YmVTdG9yYWdlO1xyXG4iLCJ2YXIgQ29tbWFuZHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gIGVsOiAnI21haW4tdmlldycsXHJcbiAgY29tbWFuZHNJbnB1dDpudWxsLFxyXG4gIGV4ZWN1dGlvbk91dHB1dDpudWxsLFxyXG4gIGV2ZW50czp7XHJcbiAgXHQnY2xpY2sgI2V4ZWN1dGUtYnV0dG9uJzonX29uRXhlY3V0ZUJ0bkNsaWNrJ1xyXG4gIH0sXHJcbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xyXG4gIFx0dGhpcy5jb21tYW5kc0lucHV0PXRoaXMuJCgnI2NvbW1hbmRzLXRleHQnKTtcclxuICAgIFxyXG5cclxuICAgIHZhciBkdW1teUNvbW1hbmRzPSAgXCIyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuNCA1XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAxIDEgMSAyM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDQgNCA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG4yIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDEgMSAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMiAyIDJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiAyIDIgMlwiO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQudmFsKGR1bW15Q29tbWFuZHMpO1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQ9dGhpcy4kKCcjZXhlY3V0aW9uLXJlc3VsdC10ZXh0Jyk7XHJcbiAgfSxcclxuICBfb25FeGVjdXRlQnRuQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgXHR0aGlzLl9kaXNwYXRjaEV4ZWN1dGUoKTtcclxuXHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCl7XHJcbiAgXHR0aGlzLl9zaG93UmVzdWx0cyhyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgX3Nob3dSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZyl7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwocmVzdWx0U3RyaW5nKTtcclxuICB9LFxyXG4gIGRpc3BsYXlFcnJvcjpmdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoZXhlY3V0aW9uRXJyb3IuZ2V0RXJyb3JNZXNzYWdlKCkpO1xyXG4gIH1cclxufSx7XHJcblx0RVhFQ1VUSU9OX1NUQVJURUQ6J2V4ZWN1dGlvbi1zdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
