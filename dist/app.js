(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommandsView = require('./views/CommandsView');
var Execution = require('./core/Execution');
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
        var execution = new Execution(commandsString);
        execution.getPromise().then(_onExecutionSuccess, _onExecutionError);
    };

    var _onExecutionSuccess = function(executionResult) {
        debugger;
        console.log("resultado fue", executionResult);
        showResults(executionResult);
    };

    var _onExecutionError = function(executionError) {
        debugger;
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
		createCube();
		
		var countOperationsExecuted=0;
		var resultsString="";
		var results=[];
		
		var successCallback=function(){
			resultsString=results.join('\n');
			//console.log("Test Case executed\n\n"+resultsString);
			that.dispatchSuccess(resultsString);
		};
		var errorCallback=function(){
			that.dispatchError(arguments);
			//console.warn("Error en la ejecución del test case");
		};
		function operationExecuted(result){
			if(result!==null && _.isNumber(result)){
				results.push(result);
			}
			executeNextOperation();
		}
		function executeNextOperation(){
			if(countOperationsExecuted<that.getNumOperations()){
				var nextOperation=operations[countOperationsExecuted++];
				nextOperation.getPromise().then(operationExecuted, errorCallback);
				nextOperation.execute(getCube());
			}
			else{
				successCallback();
			}
		}
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
		var countTestCasesExecuted=0;
		var resultsString="";
		var results=[];
		var successCallback=function(){
			resultsString=results.join('\n');
			//console.log("Test Plan executed\n\n"+resultsString);
			that.dispatchSuccess(resultsString);
		};
		var errorCallback=function(){
			that.dispatchError(arguments);
			//console.warn("Error en la ejecución del test plan");
		};
		function testCaseExecuted(result){
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
		return CubeStorage.createTable()
			.then(CubeStorage.resetCube)
			.then(function() { CubeStorage.populateCube(cubeSize);});
	};
	this.updateCell=function(x,y,z,value){
		return CubeStorage.updateCell(x,y,z,value).then(function(result){
			return null;
		});
	};
	this.summateCells=function(x1, y1, z1, x2, y2, z2){
		return CubeStorage.summateCells(x1, y1, z1, x2, y2, z2).then(function(resultSet){
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
    var deferred = jQuery.Deferred();
    if (DB !== null) {
        DB.transaction(function(tx) {
            tx.executeSql(query, params, function(tx, results) {
                deferred.resolve(results);
            }, function(tx, error) {
                //console.log('error', error);
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
    //console.log(sql);

    return execQuery(sql, []);
};

CubeStorage.resetCube = function(size) {
	var sql = 'DELETE FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    //console.log(sql);
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
    //console.log(sql);
    return execQuery(sql, []);
};


CubeStorage.updateCell = function(x, y, z, value) {
    
    var sql = 'UPDATE ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'SET ' + CubeStorage.CUBE_CELL_VALUE + '=' + value + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' = ' + x + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' = ' + y + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' = ' + z + ' ';

    //console.log(sql);
    return execQuery(sql, []);
    
};

CubeStorage.getCell = function(x, y, z) {
    var sql = 'SELECT * FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' = ' + x + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' = ' + y + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' = ' + z + ' ';
    //console.log(sql);
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
    //console.log(sql);
    return execQuery(sql, []);
};

module.exports = CubeStorage;

},{}],14:[function(require,module,exports){
var CommandsView = Backbone.View.extend({
  el: '#main-view',
  commandsInput:null,
  executionButton:null,
  executionOutput:null,
  errorMessage:null,
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
    this.executionButton=this.$('#execute-button');
  	this.executionOutput=this.$('#execution-result-text');
    this.errorMessage=this.$('#execution-error-message');
    this.errorMessage.hide();
  },
  _onExecuteBtnClick:function(e){
  	this._dispatchExecute();

  },
  _dispatchExecute:function(){
  	var commands=this.commandsInput.val();
  	this.trigger(CommandsView.EXECUTION_STARTED, commands);
    this.executionButton.addClass('disabled').addClass('loading');
  },
  displayResults:function(resultString, timeElapsed){
    this.errorMessage.hide();
  	this.executionOutput.val("Tiempo ejecución: "+timeElapsed+" ms\n"+resultString);
    this.executionButton.removeClass('disabled').removeClass('loading');
  },
  displayError:function(executionError){
    this.errorMessage.show();
    var errorTitle="Error";
    if(executionError.getCommandLine() && executionError.getCommandString())
      errorTitle="Error en la línea "+executionError.getCommandLine()+' <br/> ["'+executionError.getCommandString()+ '"]';
    this.errorMessage.find('code').html(errorTitle);
    this.errorMessage.find('p').text(executionError.getErrorMessage());
    this.executionOutput.val("");
  }
},{
	EXECUTION_STARTED:'execution-started'

});
module.exports=CommandsView;
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvY29yZS9jdWJlL0N1YmUuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zdG9yYWdlL0N1YmVTdG9yYWdlLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb21tYW5kc1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0NvbW1hbmRzVmlldycpO1xyXG52YXIgRXhlY3V0aW9uID0gcmVxdWlyZSgnLi9jb3JlL0V4ZWN1dGlvbicpO1xyXG52YXIgQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWluVmlldyA9IG51bGw7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbWFpblZpZXcgPSBuZXcgQ29tbWFuZHNWaWV3KCk7XHJcbiAgICAgICAgbWFpblZpZXcub24oQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBfb25FeGVjdGlvblN0YXJ0ZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3Rpb25TdGFydGVkID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgICAgICBleGVjdXRlKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGV4ZWN1dGUgPSBmdW5jdGlvbihjb21tYW5kc1N0cmluZykge1xyXG4gICAgICAgIHZhciBleGVjdXRpb24gPSBuZXcgRXhlY3V0aW9uKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgICAgICBleGVjdXRpb24uZ2V0UHJvbWlzZSgpLnRoZW4oX29uRXhlY3V0aW9uU3VjY2VzcywgX29uRXhlY3V0aW9uRXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3V0aW9uU3VjY2VzcyA9IGZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCkge1xyXG4gICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGZ1ZVwiLCBleGVjdXRpb25SZXN1bHQpO1xyXG4gICAgICAgIHNob3dSZXN1bHRzKGV4ZWN1dGlvblJlc3VsdCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBfb25FeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKSB7XHJcbiAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN1bHRhZG8gY29uIGVycm9yIGZ1ZVwiLCBleGVjdXRpb25FcnJvcik7XHJcbiAgICAgICAgc2hvd0Vycm9yKGV4ZWN1dGlvbkVycm9yKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHNob3dSZXN1bHRzID0gZnVuY3Rpb24oZXhlY3V0aW9uUmVzdWx0KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdFN0cmluZyA9IGV4ZWN1dGlvblJlc3VsdC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIHZhciB0aW1lRWxhcHNlZCA9IGV4ZWN1dGlvblJlc3VsdC5nZXRUaW1lRWxhcHNlZCgpO1xyXG4gICAgICAgIG1haW5WaWV3LmRpc3BsYXlSZXN1bHRzKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgc2hvd0Vycm9yID0gZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3IpIHtcclxuICAgICAgICBtYWluVmlldy5kaXNwbGF5RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb247XHJcbiIsInZhciBDb25maWc9e1xyXG5cdE1JTl9URVNUU19DQVNFUzoxLFxyXG5cdE1BWF9URVNUU19DQVNFUzo1MCxcclxuXHRNSU5fQ1VCRV9TSVpFOjEsXHJcblx0TUFYX0NVQkVfU0laRToxMDAsXHJcblx0TUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxLFxyXG5cdE1BWF9URVNUX0NBU0VTX09QRVJBVElPTlM6MTAwMCxcclxuXHRNSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRTotTWF0aC5wb3coMTAsOSksXHJcblx0TUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6TWF0aC5wb3coMTAsOSksXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cz1Db25maWc7IiwidmFyIENvbmZpZz1yZXF1aXJlKCcuL0NvbmZpZycpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXtcclxuXHROT19DT01NQU5EU1x0XHRcdFx0XHRcdDpcIk5vIGhheSBjb21hbmRvcyBwYXJhIGVqZWN1dGFyXCIsXHJcblx0RU1QVFlfQ09NTUFORFx0XHRcdFx0XHQ6XCJDb21hbmRvIGVzdGEgdmFjaW9cIixcclxuXHRURVNUX1BMQU5fQ09NTUFORF9TSU5UQVhcdFx0OlwiRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gZGViZSBjb250ZW5lciB1biBuw7ptZXJvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfV1JPTkdfVkFMVUVTXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVybyAodGVzdCBjYXNlcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUU19DQVNFUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVFNfQ0FTRVMsXHJcblx0VEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGRvcyBuw7ptZXJvcyBzZXBhcmFkb3MgcG9yIHVuIGVzcGFjaW9cIixcclxuXHRURVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFXHRcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgcHJpbWVyIG51bWVybyAodGFtYcOxbyBkZWwgY3VibykgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX1NJWkUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfU0laRSxcclxuXHRURVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlNcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgc2VndW5kbyBudW1lcm8gKG9wZXJhY2lvbmVzKSBlbnRyZSBcIitDb25maWcuTUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TLFxyXG5cdE9QRVJBVElPTl9VTktOT1dOXHRcdFx0XHQ6XCJPcGVyYWNpw7NuIGRlc2Nvbm9jaWRhXCIsXHJcblx0VVBEQVRFX0NPTU1BTkRfU0lOVEFYXHRcdFx0OidFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBzZXIgc2ltaWxhciBhIFwiVVBEQVRFIDIgMiAyIDRcIiAoUmV2aXNhciBlc3BhY2lvcyknLFxyXG5cdFVQREFURV9XUk9OR19DVUJFX0NFTExTXHRcdCAgICA6J0Vycm9yIGRlIFZhbG9yZXMsIGxhcyBjb3JkZW5hZGFzIGRlIGxhIGNlbGRhIGRlbCBjdWJvIHNvbiBpbnZhbGlkYXMnLFxyXG5cdFVQREFURV9XUk9OR19WQUxVRV9UT19VUERBVEVcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIHZhbG9yIGEgYWN0dWFsaXphciBlbnRyZSBcIitDb25maWcuTUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUsXHJcblx0UVVFUllfQ09NTUFORF9TSU5UQVhcdFx0XHQ6J0Vycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIHNlciBzaW1pbGFyIGEgXCJRVUVSWSAxIDEgMSAzIDMgM1wiIChSZXZpc2FyIGVzcGFjaW9zKScsXHJcblx0UVVFUllfV1JPTkdfQ1VCRV9DRUxMU1x0XHQgICAgOidFcnJvciBkZSBWYWxvcmVzLCBsYXMgY29yZGVuYWRhcyBkZSBsYXMgY2VsZGFzIGRlbCBjdWJvIHNvbiBpbnZhbGlkYXMnLFxyXG5cdEVYRUNVVElPTl9FUlJPUlx0XHQgICAgXHRcdDonRXJyb3IgZW4gbGEgZWplY3VjacOzbicsXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPUVycm9yTWVzc2FnZTsiLCJ2YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoJy4uL2NvbmZpZy9FcnJvck1lc3NhZ2UnKTtcclxudmFyIENvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL2Jhc2UvQ29tbWFuZCcpO1xyXG52YXIgVGVzdFBsYW5Db21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9UZXN0UGxhbkNvbW1hbmQnKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvVGVzdENhc2VDb21tYW5kJyk7XHJcbnZhciBPcGVyYXRpb25Db21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kJyk7XHJcbnZhciBFeGVjdXRpb24gPSBmdW5jdGlvbihjb21tYW5kc1N0cmluZykge1xyXG4gICAgdmFyIGV4ZWNEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xyXG4gICAgdmFyIGV4ZWN1dGlvbkVycm9yRGlzcGF0aGVkPWZhbHNlO1xyXG4gICAgY3JlYXRlQ29tbWFuZHMoY29tbWFuZHNTdHJpbmcpO1xyXG4gICAgZnVuY3Rpb24gZXh0cmFjdExpbmVzKGNvbW1hbmRzU3RyaW5nKXtcclxuICAgIFx0aWYoIWNvbW1hbmRzU3RyaW5nIHx8IGNvbW1hbmRzU3RyaW5nPT09Jycpe1xyXG4gICAgXHRcdGRpc3BhdGNoRXJyb3IoJycsIEVycm9yTWVzc2FnZS5OT19DT01NQU5EUywwKTtcclxuICAgIFx0XHRyZXR1cm47XHJcbiAgICBcdH1cclxuICAgIFx0cmV0dXJuIGNvbW1hbmRzU3RyaW5nLnNwbGl0KCdcXG4nKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVDb21tYW5kcyhjb21tYW5kc1N0cmluZyl7XHJcbiAgICBcdFxyXG4gICAgXHR2YXIgbGluZXM9ZXh0cmFjdExpbmVzKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIFx0dmFyIG51bUxpbmVzPWxpbmVzICYmIGxpbmVzLmxlbmd0aDtcclxuICAgIFx0aWYoIWxpbmVzIHx8IW51bUxpbmVzKVxyXG4gICAgXHRcdHJldHVybjtcclxuICAgIFx0XHJcbiAgICBcdC8vdmFyIGNvbW1hbmRzPVtdO1xyXG4gICAgXHRcclxuXHJcbiAgICBcdHZhciBjdXJMaW5lTnVtYmVyPTA7XHJcbiAgICBcdFxyXG4gICAgXHRmdW5jdGlvbiBnZXROZXh0TGluZSgpe1xyXG4gICAgXHRcdGlmKGN1ckxpbmVOdW1iZXIrMTw9bnVtTGluZXMpXHJcbiAgICBcdFx0XHRjdXJMaW5lTnVtYmVyKys7XHJcbiAgICBcdFx0cmV0dXJuIGxpbmVzW2N1ckxpbmVOdW1iZXItMV07XHJcbiAgICBcdH1cclxuXHJcblxyXG4gICAgXHQvL21ha2UgVGVzdFBsYW4gY29tbWFuZFxyXG4gICAgXHR2YXIgdGVzdFBsYW5Db21tYW5kPW5ldyBUZXN0UGxhbkNvbW1hbmQoZ2V0TmV4dExpbmUoKSk7XHJcbiAgICBcdHZhciB2YWxpZGF0aW9uVGVzdFBsYW49dGVzdFBsYW5Db21tYW5kLnZhbGlkYXRlKCk7XHJcbiAgICBcdGlmKHZhbGlkYXRpb25UZXN0UGxhbi5pc1ZhbGlkKCkpe1xyXG5cclxuICAgIFx0XHQvL2NvbW1hbmRzLnB1c2godGVzdFBsYW5Db21tYW5kKTtcclxuICAgIFx0XHR2YXIgbnVtVGVzdENhc2VzPXRlc3RQbGFuQ29tbWFuZC5nZXROdW1UZXN0Q2FzZXMoKTtcclxuXHJcbiAgICBcdFx0Y3JlYXRpb25UZXN0Q2FzZXM6e1xyXG5cdCAgICBcdFx0Zm9yKHZhciBpPTE7aTw9bnVtVGVzdENhc2VzO2krKyl7XHJcblx0ICAgIFx0XHRcdHZhciB0ZXN0Q2FzZUNvbW1hbmQ9bmV3IFRlc3RDYXNlQ29tbWFuZChnZXROZXh0TGluZSgpKTtcclxuXHQgICAgXHRcdFx0dmFyIHZhbGlkYXRpb25UZXN0Q2FzZT10ZXN0Q2FzZUNvbW1hbmQudmFsaWRhdGUoKTtcclxuXHQgICAgXHRcdFx0aWYodmFsaWRhdGlvblRlc3RDYXNlLmlzVmFsaWQoKSl7XHJcblx0ICAgIFx0XHRcdFx0XHJcblx0ICAgIFx0XHRcdFx0dGVzdFBsYW5Db21tYW5kLmFkZFRlc3RDYXNlQ29tbWFuZCh0ZXN0Q2FzZUNvbW1hbmQpO1xyXG5cdCAgICBcdFx0XHRcdHZhciBudW1PcGVyYXRpb25zPXRlc3RDYXNlQ29tbWFuZC5nZXROdW1PcGVyYXRpb25zKCk7XHJcblx0ICAgIFx0XHRcdFx0dmFyIGN1YmVTaXplPXRlc3RDYXNlQ29tbWFuZC5nZXRDdWJlU2l6ZSgpO1xyXG5cdCAgICBcdFx0XHRcdGNyZWF0aW9uT3BlcmF0aW9uczp7XHJcblx0XHQgICAgXHRcdFx0XHRmb3IodmFyIGo9MTtqPD1udW1PcGVyYXRpb25zO2orKyl7XHJcblx0XHQgICAgXHRcdFx0XHRcdHZhciBvcGVyYXRpb25Db21tYW5kPW5ldyBPcGVyYXRpb25Db21tYW5kKGdldE5leHRMaW5lKCksIGN1YmVTaXplKTtcdFxyXG5cdFx0ICAgIFx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbk9wZXJhdGlvbj1vcGVyYXRpb25Db21tYW5kLnZhbGlkYXRlKCk7XHJcblx0XHQgICAgXHRcdFx0XHRcdGlmKHZhbGlkYXRpb25PcGVyYXRpb24uaXNWYWxpZCgpKXtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHR0ZXN0Q2FzZUNvbW1hbmQuYWRkT3BlcmF0aW9uQ29tbWFuZChvcGVyYXRpb25Db21tYW5kKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0fVxyXG5cdFx0ICAgIFx0XHRcdFx0XHRlbHNle1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25PcGVyYXRpb24sY3VyTGluZU51bWJlcik7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0YnJlYWsgY3JlYXRpb25UZXN0Q2FzZXM7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0XHJcblx0XHQgICAgXHRcdFx0XHRcdH1cclxuXHRcdCAgICBcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICBcdFx0XHRcdH1cclxuXHQgICAgXHRcdFx0fVxyXG5cdCAgICBcdFx0XHRlbHNle1xyXG5cdCAgICBcdFx0XHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25UZXN0Q2FzZSxjdXJMaW5lTnVtYmVyKTtcclxuXHQgICAgXHRcdFx0XHRicmVhayBjcmVhdGlvblRlc3RDYXNlcztcclxuXHQgICAgXHRcdFx0fVxyXG5cdCAgICBcdFx0fVxyXG4gICAgXHRcdH1cclxuICAgICAgICAgICAgXHJcbiAgICBcdH1cclxuICAgIFx0ZWxzZXtcclxuICAgIFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uVGVzdFBsYW4sY3VyTGluZU51bWJlcik7XHJcbiAgICBcdH1cclxuXHJcbiAgICAgICAgaWYoIWV4ZWN1dGlvbkVycm9yRGlzcGF0aGVkKVxyXG4gICAgICAgICAgICBleGVjdXRlQ29tbWFuZHModGVzdFBsYW5Db21tYW5kKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGV4ZWN1dGVDb21tYW5kcyh0ZXN0UGxhbkNvbW1hbmQpe1xyXG4gICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIHZhciB0aW1lU3RhcnQ9bmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdGVzdFBsYW5Db21tYW5kLmV4ZWN1dGUoKS5nZXRQcm9taXNlKCkuZG9uZShmdW5jdGlvbihyZXN1bHRTdHJpbmcpe1xyXG4gICAgICAgICAgICB2YXIgdGltZUVuZD1uZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgdmFyIHRpbWVFbGFwc2VkPXRpbWVFbmQtdGltZVN0YXJ0O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVqZWN1Y2lvbiBjb21wbGV0YWRhXCIsIHRpbWVFbGFwc2VkKTtcclxuICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgIGRpc3BhdGNoU3VjY2VzcyhyZXN1bHRTdHJpbmcsIHRpbWVFbGFwc2VkKTtcclxuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGRpc3BhdGNoRXJyb3IoJycsIEVycm9yTWVzc2FnZS5FWEVDVVRJT05fRVJST1IsMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbiwgbGluZSApe1xyXG4gICAgICAgIGV4ZWN1dGlvbkVycm9yRGlzcGF0aGVkPXRydWU7XHJcbiAgICBcdGRpc3BhdGNoRXJyb3IoXHJcbiAgICBcdFx0dmFsaWRhdGlvbi5nZXRDb21tYW5kU3RyaW5nKCksIFxyXG4gICAgXHRcdHZhbGlkYXRpb24uZ2V0RXJyb3JNZXNzYWdlKCksIFxyXG4gICAgXHRcdGxpbmUgXHJcbiAgICBcdCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaEVycm9yKGNvbW1hbmRTdHIsIGVycm9yTXNnLCBsaW5lICl7XHJcbiAgICBcdHZhciBlcnJvcj1uZXcgRXhlY3V0aW9uLkVycm9yKFxyXG4gICAgXHRcdGNvbW1hbmRTdHIsIFxyXG4gICAgXHRcdGVycm9yTXNnLCBcclxuICAgIFx0XHRsaW5lIFxyXG4gICAgXHQpO1xyXG4gICAgXHRleGVjRGVmZXJyZWQucmVqZWN0KGVycm9yKTtcdFxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoU3VjY2VzcyhyZXN1bHRTdHJpbmcsIHRpbWVFbGFwc2VkICl7XHJcbiAgICAgICAgdmFyIHJlc3VsdD1uZXcgRXhlY3V0aW9uLlJlc3VsdChcclxuICAgICAgICAgICAgcmVzdWx0U3RyaW5nLCBcclxuICAgICAgICAgICAgdGltZUVsYXBzZWRcclxuICAgICAgICApO1xyXG4gICAgICAgIGV4ZWNEZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7IFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2V0UHJvbWlzZT1mdW5jdGlvbigpe1xyXG4gICAgXHRyZXR1cm4gZXhlY0RlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH07XHJcbiAgICBcclxufTtcclxuRXhlY3V0aW9uLlJlc3VsdCA9IGZ1bmN0aW9uKHZhbHVlLCB0aW1lRWxhcHNlZCkge1xyXG4gICAgdmFyIG1WYWx1ZSA9IHZhbHVlO1xyXG4gICAgdmFyIG1UaW1lRWxhcHNlZCA9IHRpbWVFbGFwc2VkO1xyXG4gICAgdGhpcy5nZXRWYWx1ZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtVmFsdWU7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nZXRUaW1lRWxhcHNlZD0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtVGltZUVsYXBzZWQ7XHJcbiAgICB9O1xyXG59O1xyXG5FeGVjdXRpb24uRXJyb3IgPSBmdW5jdGlvbihjb21tYW5kU3RyaW5nLCBlcnJvck1lc3NhZ2UsIGNvbW1hbmRMaW5lKSB7XHJcblx0dmFyIG1Db21tYW5kU3RyaW5nID0gY29tbWFuZFN0cmluZztcclxuICAgIHZhciBtRXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xyXG4gICAgdmFyIG1Db21tYW5kTGluZSA9IGNvbW1hbmRMaW5lO1xyXG4gICAgdGhpcy5nZXRDb21tYW5kU3RyaW5nPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1Db21tYW5kU3RyaW5nO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2V0RXJyb3JNZXNzYWdlPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1FcnJvck1lc3NhZ2U7XHJcbiAgICB9O1x0XHJcbiAgICB0aGlzLmdldENvbW1hbmRMaW5lPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1Db21tYW5kTGluZTtcclxuICAgIH07XHRcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBFeGVjdXRpb247XHJcbiIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBRdWVyeUNvbW1hbmQ9cmVxdWlyZShcIi4vUXVlcnlDb21tYW5kXCIpO1xyXG52YXIgVXBkYXRlQ29tbWFuZD1yZXF1aXJlKFwiLi9VcGRhdGVDb21tYW5kXCIpO1xyXG5cclxudmFyIE9wZXJhdGlvbkNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgY3ViZVNpemUpe1xyXG5cdGlmKC9eUVVFUlkvLnRlc3QoY29tbWFuZFN0cmluZykpe1xyXG5cdFx0cmV0dXJuIG5ldyBRdWVyeUNvbW1hbmQoY29tbWFuZFN0cmluZyxjdWJlU2l6ZSk7XHJcblx0fVxyXG5cdGVsc2UgaWYoL15VUERBVEUvLnRlc3QoY29tbWFuZFN0cmluZykpe1xyXG5cdFx0cmV0dXJuIG5ldyBVcGRhdGVDb21tYW5kKGNvbW1hbmRTdHJpbmcsY3ViZVNpemUpO1xyXG5cdH1cclxuXHRcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuT1BFUkFUSU9OX1VOS05PV04pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdFx0XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHR9O1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHM9T3BlcmF0aW9uQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFF1ZXJ5Q29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBfY3ViZVNpemUpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT1fY3ViZVNpemU7XHJcblx0dmFyIGNlbGxYMT0wLGNlbGxYMj0wLGNlbGxZMT0wLGNlbGxZMj0wLGNlbGxaMT0wLGNlbGxaMj0wO1xyXG5cdHZhciBzZXRDdWJlQ2VsbHM9ZnVuY3Rpb24oWDEsWDIsWTEsWTIsWjEsWjIpe1xyXG5cdFx0Y2VsbFgxPVgxO1xyXG5cdFx0Y2VsbFgyPVgyO1xyXG5cdFx0Y2VsbFkxPVkxO1xyXG5cdFx0Y2VsbFkyPVkyO1xyXG5cdFx0Y2VsbFoxPVoxO1xyXG5cdFx0Y2VsbFoyPVoyO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgdmFsaWRhdGVDZWxsPWZ1bmN0aW9uKGNlbGxDb29yZCl7XHJcblx0XHRyZXR1cm4gY2VsbENvb3JkPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjZWxsQ29vcmQ8PXRoYXQuZ2V0Q3ViZVNpemUoKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15RVUVSWVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYMT1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWTE9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoxPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxYMj1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdHZhciBjZWxsWTI9cGFyc2VJbnQodmFsdWVzWzRdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoyPXBhcnNlSW50KHZhbHVlc1s1XSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFoxKSAmJlxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxZMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxaMikgJiZcclxuXHRcdFx0XHRcdGNlbGxYMTw9Y2VsbFgyICYmIGNlbGxZMTw9Y2VsbFkyICYmIGNlbGxaMTw9Y2VsbFoyXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWDEsY2VsbFgyLGNlbGxZMSxjZWxsWTIsY2VsbFoxLGNlbGxaMik7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuUVVFUllfV1JPTkdfQ1VCRV9DRUxMUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlFVRVJZX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oY3ViZSl7XHJcblx0XHRjdWJlLnN1bW1hdGVDZWxscyhjZWxsWDEsY2VsbFkxLGNlbGxaMSwgY2VsbFgyLCBjZWxsWTIsIGNlbGxaMilcclxuXHRcdC50aGVuKHRoYXQuZGlzcGF0Y2hTdWNjZXNzLHRoYXQuZGlzcGF0Y2hFcnJvcik7XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5RdWVyeUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFF1ZXJ5Q29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9UXVlcnlDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBDdWJlPXJlcXVpcmUoXCIuLy4uL2N1YmUvQ3ViZVwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9MDtcclxuXHR2YXIgbnVtT3BlcmF0aW9ucz0wO1xyXG5cdHZhciBvcGVyYXRpb25zPVtdO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIGN1YmU9bnVsbDtcclxuXHR2YXIgc2V0Q3ViZVNpemU9ZnVuY3Rpb24obnVtKXtcclxuXHRcdGN1YmVTaXplPW51bTtcclxuXHR9O1xyXG5cdHZhciBzZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRudW1PcGVyYXRpb25zPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtT3BlcmF0aW9ucz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bU9wZXJhdGlvbnM7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBjcmVhdGVDdWJlKCl7XHJcblx0XHRjdWJlPW5ldyBDdWJlKHRoYXQuZ2V0Q3ViZVNpemUoKSk7XHJcblx0XHRyZXR1cm4gY3ViZTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZ2V0Q3ViZSgpe1xyXG5cdFx0cmV0dXJuIGN1YmU7XHJcblx0fVxyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goL1xcZCsvZyk7XHJcblx0XHRcdFx0dmFyIGN1YmVTaXplPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIG51bU9wZXJhdGlvbnM9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihjdWJlU2l6ZT49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY3ViZVNpemU8PUNvbmZpZy5NQVhfQ1VCRV9TSVpFKXtcclxuXHRcdFx0XHRcdGlmKG51bU9wZXJhdGlvbnM+PUNvbmZpZy5NSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TICYmIG51bU9wZXJhdGlvbnM8PUNvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TKXtcclxuXHRcdFx0XHRcdFx0c2V0Q3ViZVNpemUoY3ViZVNpemUpO1xyXG5cdFx0XHRcdFx0XHRzZXROdW1PcGVyYXRpb25zKG51bU9wZXJhdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TKTtcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cdH07XHJcblx0dGhpcy5hZGRPcGVyYXRpb25Db21tYW5kPWZ1bmN0aW9uKG9wZXJhdGlvbkNvbW1hbmQpe1xyXG5cdFx0b3BlcmF0aW9ucy5wdXNoKG9wZXJhdGlvbkNvbW1hbmQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cdFx0Y3JlYXRlQ3ViZSgpO1xyXG5cdFx0XHJcblx0XHR2YXIgY291bnRPcGVyYXRpb25zRXhlY3V0ZWQ9MDtcclxuXHRcdHZhciByZXN1bHRzU3RyaW5nPVwiXCI7XHJcblx0XHR2YXIgcmVzdWx0cz1bXTtcclxuXHRcdFxyXG5cdFx0dmFyIHN1Y2Nlc3NDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRyZXN1bHRzU3RyaW5nPXJlc3VsdHMuam9pbignXFxuJyk7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJUZXN0IENhc2UgZXhlY3V0ZWRcXG5cXG5cIityZXN1bHRzU3RyaW5nKTtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaFN1Y2Nlc3MocmVzdWx0c1N0cmluZyk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGVycm9yQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaEVycm9yKGFyZ3VtZW50cyk7XHJcblx0XHRcdC8vY29uc29sZS53YXJuKFwiRXJyb3IgZW4gbGEgZWplY3VjacOzbiBkZWwgdGVzdCBjYXNlXCIpO1xyXG5cdFx0fTtcclxuXHRcdGZ1bmN0aW9uIG9wZXJhdGlvbkV4ZWN1dGVkKHJlc3VsdCl7XHJcblx0XHRcdGlmKHJlc3VsdCE9PW51bGwgJiYgXy5pc051bWJlcihyZXN1bHQpKXtcclxuXHRcdFx0XHRyZXN1bHRzLnB1c2gocmVzdWx0KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRleGVjdXRlTmV4dE9wZXJhdGlvbigpO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gZXhlY3V0ZU5leHRPcGVyYXRpb24oKXtcclxuXHRcdFx0aWYoY291bnRPcGVyYXRpb25zRXhlY3V0ZWQ8dGhhdC5nZXROdW1PcGVyYXRpb25zKCkpe1xyXG5cdFx0XHRcdHZhciBuZXh0T3BlcmF0aW9uPW9wZXJhdGlvbnNbY291bnRPcGVyYXRpb25zRXhlY3V0ZWQrK107XHJcblx0XHRcdFx0bmV4dE9wZXJhdGlvbi5nZXRQcm9taXNlKCkudGhlbihvcGVyYXRpb25FeGVjdXRlZCwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcdFx0bmV4dE9wZXJhdGlvbi5leGVjdXRlKGdldEN1YmUoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Z2V0Q3ViZSgpLmxvYWQoKS50aGVuKGV4ZWN1dGVOZXh0T3BlcmF0aW9uLCBlcnJvckNhbGxiYWNrKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxuXHJcbn07XHJcblxyXG5UZXN0Q2FzZUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFRlc3RDYXNlQ29tbWFuZCk7XHJcbm1vZHVsZS5leHBvcnRzPVRlc3RDYXNlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgbnVtVGVzdENhc2VzPTA7XHJcblx0dmFyIHRlc3RDYXNlcz1bXTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciBzZXROdW1UZXN0Q2FzZXM9ZnVuY3Rpb24obnVtKXtcclxuXHRcdG51bVRlc3RDYXNlcz1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldE51bVRlc3RDYXNlcz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bVRlc3RDYXNlcztcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgbnVtPXBhcnNlSW50KGNtZCk7XHJcblx0XHRcdFx0aWYobnVtPj1Db25maWcuTUlOX1RFU1RTX0NBU0VTICYmIG51bTw9Q29uZmlnLk1BWF9URVNUU19DQVNFUyl7XHJcblx0XHRcdFx0XHRzZXROdW1UZXN0Q2FzZXMobnVtKTtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX1BMQU5fQ09NTUFORF9XUk9OR19WQUxVRVMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX1BMQU5fQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblx0dGhpcy5hZGRUZXN0Q2FzZUNvbW1hbmQ9ZnVuY3Rpb24odGVzdENhc2VDb21tYW5kKXtcclxuXHRcdHRlc3RDYXNlcy5wdXNoKHRlc3RDYXNlQ29tbWFuZCk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY291bnRUZXN0Q2FzZXNFeGVjdXRlZD0wO1xyXG5cdFx0dmFyIHJlc3VsdHNTdHJpbmc9XCJcIjtcclxuXHRcdHZhciByZXN1bHRzPVtdO1xyXG5cdFx0dmFyIHN1Y2Nlc3NDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRyZXN1bHRzU3RyaW5nPXJlc3VsdHMuam9pbignXFxuJyk7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJUZXN0IFBsYW4gZXhlY3V0ZWRcXG5cXG5cIityZXN1bHRzU3RyaW5nKTtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaFN1Y2Nlc3MocmVzdWx0c1N0cmluZyk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGVycm9yQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaEVycm9yKGFyZ3VtZW50cyk7XHJcblx0XHRcdC8vY29uc29sZS53YXJuKFwiRXJyb3IgZW4gbGEgZWplY3VjacOzbiBkZWwgdGVzdCBwbGFuXCIpO1xyXG5cdFx0fTtcclxuXHRcdGZ1bmN0aW9uIHRlc3RDYXNlRXhlY3V0ZWQocmVzdWx0KXtcclxuXHRcdFx0cmVzdWx0cy5wdXNoKHJlc3VsdCk7XHJcblx0XHRcdGV4ZWN1dGVOZXh0VGVzdENhc2UoKTtcclxuXHRcdH1cclxuXHRcdGZ1bmN0aW9uIGV4ZWN1dGVOZXh0VGVzdENhc2UoKXtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGNvdW50VGVzdENhc2VzRXhlY3V0ZWQ8dGhhdC5nZXROdW1UZXN0Q2FzZXMoKSl7XHJcblx0XHRcdFx0dmFyIG5leHRUZXN0Q2FzZT10ZXN0Q2FzZXNbY291bnRUZXN0Q2FzZXNFeGVjdXRlZCsrXTtcclxuXHRcdFx0XHRuZXh0VGVzdENhc2UuZXhlY3V0ZSgpLmdldFByb21pc2UoKS50aGVuKHRlc3RDYXNlRXhlY3V0ZWQsIGVycm9yQ2FsbGJhY2spO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0c3VjY2Vzc0NhbGxiYWNrKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGV4ZWN1dGVOZXh0VGVzdENhc2UoKTtcclxuXHJcblx0XHRcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblRlc3RQbGFuQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVGVzdFBsYW5Db21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1UZXN0UGxhbkNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBVcGRhdGVDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIF9jdWJlU2l6ZSl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIGN1YmVTaXplPV9jdWJlU2l6ZTtcclxuXHR2YXIgY2VsbFg9MDtcclxuXHR2YXIgY2VsbFk9MDtcclxuXHR2YXIgY2VsbFo9MDtcclxuXHR2YXIgdmFsdWVUb1VwZGF0ZT0wO1xyXG5cdHZhciBzZXRDdWJlQ2VsbHM9ZnVuY3Rpb24oWCxZLFope1xyXG5cdFx0Y2VsbFg9WDtcclxuXHRcdGNlbGxZPVk7XHJcblx0XHRjZWxsWj1aO1xyXG5cdH07XHJcblx0ZnVuY3Rpb24gZ2V0Q2VsbFgoKXtcclxuXHRcdHJldHVybiBjZWxsWDtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZ2V0Q2VsbFkoKXtcclxuXHRcdHJldHVybiBjZWxsWTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZ2V0Q2VsbFooKXtcclxuXHRcdHJldHVybiBjZWxsWjtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZ2V0VmFsdWVUb1R1cGRhdGUoKXtcclxuXHRcdHJldHVybiB2YWx1ZVRvVXBkYXRlO1xyXG5cdH1cclxuXHR2YXIgc2V0VmFsdWVUb1R1cGRhdGU9ZnVuY3Rpb24obnVtKXtcclxuXHRcdHZhbHVlVG9VcGRhdGU9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgdmFsaWRhdGVDZWxsPWZ1bmN0aW9uKGNlbGxDb29yZCl7XHJcblx0XHRyZXR1cm4gY2VsbENvb3JkPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjZWxsQ29vcmQ8PXRoYXQuZ2V0Q3ViZVNpemUoKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15VUERBVEVcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX0tP1xcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZXM9Y21kLm1hdGNoKC8tP1xcZCsvZyk7XHJcblxyXG5cdFx0XHRcdHZhciBjZWxsWD1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWT1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWj1wYXJzZUludCh2YWx1ZXNbMl0pO1xyXG5cdFx0XHRcdHZhciB2YWx1ZVRvVXBkYXRlPXBhcnNlSW50KHZhbHVlc1szXSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgpICYmIHZhbGlkYXRlQ2VsbChjZWxsWSkgJiYgdmFsaWRhdGVDZWxsKGNlbGxaKVxyXG5cclxuXHRcdFx0XHRcdCl7XHJcblxyXG5cdFx0XHRcdFx0c2V0Q3ViZUNlbGxzKGNlbGxYLGNlbGxZLGNlbGxaKTtcclxuXHJcblx0XHRcdFx0XHRpZih2YWx1ZVRvVXBkYXRlPj1Db25maWcuTUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUgJiYgdmFsdWVUb1VwZGF0ZTw9Q29uZmlnLk1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFKXtcclxuXHRcdFx0XHRcdFx0c2V0VmFsdWVUb1R1cGRhdGUodmFsdWVUb1VwZGF0ZSk7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfV1JPTkdfVkFMVUVfVE9fVVBEQVRFKTtcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfV1JPTkdfQ1VCRV9DRUxMUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKGN1YmUpe1xyXG5cdFx0Y3ViZS51cGRhdGVDZWxsKGdldENlbGxYKCksIGdldENlbGxZKCksIGdldENlbGxaKCksIGdldFZhbHVlVG9UdXBkYXRlKCkpXHJcblx0XHQudGhlbih0aGF0LmRpc3BhdGNoU3VjY2Vzcyx0aGF0LmRpc3BhdGNoRXJyb3IpO1xyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuVXBkYXRlQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVXBkYXRlQ29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9VXBkYXRlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBkZWZlcnJlZD1qUXVlcnkuRGVmZXJyZWQoKTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmcudHJpbSgpO1xyXG5cdH07XHJcblx0dGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG5cdH07XHJcblx0dGhpcy5kaXNwYXRjaFN1Y2Nlc3M9ZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hFcnJvcj1mdW5jdGlvbihlcnJvcil7XHJcblx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbihjb21tYW5kKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH07XHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblxyXG5cdH07XHJcblxyXG59O1xyXG5Db21tYW5kLmV4dGVuZHM9ZnVuY3Rpb24oQ2hpbGQpe1xyXG5cdC8vaHR0cDovL2p1bGllbi5yaWNoYXJkLWZveS5mci9ibG9nLzIwMTEvMTAvMzAvZnVuY3Rpb25hbC1pbmhlcml0YW5jZS12cy1wcm90b3R5cGFsLWluaGVyaXRhbmNlL1xyXG5cdGZ1bmN0aW9uIEYoKSB7fVxyXG5cdEYucHJvdG90eXBlID0gQ29tbWFuZC5wcm90b3R5cGU7XHJcblx0Q2hpbGQucHJvdG90eXBlPW5ldyBGKCk7XHJcblx0Xy5leHRlbmQoQ2hpbGQucHJvdG90eXBlLENvbW1hbmQucHJvdG90eXBlKTtcclxuXHRyZXR1cm4gQ2hpbGQ7XHJcbn07XHJcbkNvbW1hbmQuVmFsaWRhdGlvbj1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBlcnJvck1zZz1cIlwiO1xyXG5cdHZhciBpc1ZhbGlkPWZhbHNlO1xyXG5cdHRoaXMuZmFpbD1mdW5jdGlvbihlcnJvck1lc3NhZ2Upe1xyXG5cdFx0ZXJyb3JNc2c9ZXJyb3JNZXNzYWdlO1xyXG5cdFx0aXNWYWxpZD1mYWxzZTtcclxuXHR9O1xyXG5cdHRoaXMuc3VjY2Vzcz1mdW5jdGlvbigpe1xyXG5cdFx0ZXJyb3JNc2c9XCJcIjtcclxuXHRcdGlzVmFsaWQ9dHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmc7XHJcblx0fTtcclxuXHR0aGlzLmdldEVycm9yTWVzc2FnZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGVycm9yTXNnO1xyXG5cdH07XHJcblx0dGhpcy5pc1ZhbGlkPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gaXNWYWxpZDtcclxuXHR9O1xyXG59O1xyXG4vKkNvbW1hbmQuVHlwZT17XHJcblx0VEVTVF9QTEFOOidURVNUX1BMQU4nLFxyXG5cdFRFU1RfQ0FTRTonVEVTVF9DQVNFJyxcclxuXHRRVUVSWTonUVVFUlknLFxyXG5cdFVQREFURTonVVBEQVRFJyxcclxufTsqL1xyXG5tb2R1bGUuZXhwb3J0cz1Db21tYW5kOyIsInZhciBDdWJlU3RvcmFnZSA9IHJlcXVpcmUoJy4uLy4uL3N0b3JhZ2UvQ3ViZVN0b3JhZ2UnKTtcclxudmFyIEN1YmU9ZnVuY3Rpb24oc2l6ZSl7XHJcblx0dmFyIGN1YmVTaXplPXNpemU7XHJcblx0dGhpcy5sb2FkPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gQ3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUoKVxyXG5cdFx0XHQudGhlbihDdWJlU3RvcmFnZS5yZXNldEN1YmUpXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkgeyBDdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUoY3ViZVNpemUpO30pO1xyXG5cdH07XHJcblx0dGhpcy51cGRhdGVDZWxsPWZ1bmN0aW9uKHgseSx6LHZhbHVlKXtcclxuXHRcdHJldHVybiBDdWJlU3RvcmFnZS51cGRhdGVDZWxsKHgseSx6LHZhbHVlKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHR0aGlzLnN1bW1hdGVDZWxscz1mdW5jdGlvbih4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKXtcclxuXHRcdHJldHVybiBDdWJlU3RvcmFnZS5zdW1tYXRlQ2VsbHMoeDEsIHkxLCB6MSwgeDIsIHkyLCB6MikudGhlbihmdW5jdGlvbihyZXN1bHRTZXQpe1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0U2V0LnJvd3NbMF0uc3VtO1xyXG5cdFx0fSk7XHJcblx0fTtcclxufTtcclxubW9kdWxlLmV4cG9ydHM9Q3ViZTsiLCJ2YXIgQXBwbGljYXRpb249cmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdHZhciBhcHA9bmV3IEFwcGxpY2F0aW9uKCk7XHJcblx0YXBwLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgQ3ViZVN0b3JhZ2UgPSB7fTtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9EQiA9IFwiY3ViZV9kYlwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgPSBcImN1YmVfY2VsbFwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWCA9IFwieFwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWSA9IFwieVwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWiA9IFwielwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgPSBcImNlbGxfdmFsdWVcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1NVTSA9IFwic3VtXCI7XHJcblxyXG52YXIgREI7XHJcbnRyeSB7XHJcbiAgICBEQiA9IG9wZW5EYXRhYmFzZShDdWJlU3RvcmFnZS5DVUJFX0RCLCAnMS4wJywgJ0N1YmUgREInLCA1ICogMTAyNCAqIDEwMjQpO1xyXG59IGNhdGNoIChlKSB7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBleGVjUXVlcnkocXVlcnksIHBhcmFtcykge1xyXG4gICAgdmFyIGRlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICBpZiAoREIgIT09IG51bGwpIHtcclxuICAgICAgICBEQi50cmFuc2FjdGlvbihmdW5jdGlvbih0eCkge1xyXG4gICAgICAgICAgICB0eC5leGVjdXRlU3FsKHF1ZXJ5LCBwYXJhbXMsIGZ1bmN0aW9uKHR4LCByZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbih0eCwgZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRlZmVycmVkLnJlamVjdChhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxufVxyXG5cclxuXHJcbkN1YmVTdG9yYWdlLmNyZWF0ZVRhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc3FsID0gJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgc3FsICs9ICcoJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyBOVU1FUklDLCAnO1xyXG4gICAgc3FsICs9IEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyBOVU1FUklDLCAnO1xyXG4gICAgc3FsICs9IEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyBOVU1FUklDLCAnO1xyXG4gICAgc3FsICs9IEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9WQUxVRSArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBcIlBSSU1BUlkgS0VZIChcIiArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJywnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnLCcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcpICk7JztcclxuICAgIC8vY29uc29sZS5sb2coc3FsKTtcclxuXHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxuQ3ViZVN0b3JhZ2UucmVzZXRDdWJlID0gZnVuY3Rpb24oc2l6ZSkge1xyXG5cdHZhciBzcWwgPSAnREVMRVRFIEZST00gJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIC8vY29uc29sZS5sb2coc3FsKTtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5cclxuQ3ViZVN0b3JhZ2UucG9wdWxhdGVDdWJlID0gZnVuY3Rpb24oc2l6ZSkge1xyXG5cdHZhciBzcWwgPSAnSU5TRVJUIElOVE8gJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgVkFMVUVTICc7XHJcbiAgICB2YXIgY2VsbHMgPSBbXTtcclxuICAgIGZvciAoeCA9IDE7IHggPD0gc2l6ZTsgeCsrKSB7XHJcbiAgICAgICAgZm9yICh5ID0gMTsgeSA8PSBzaXplOyB5KyspIHtcclxuICAgICAgICAgICAgZm9yICh6ID0gMTsgeiA8PSBzaXplOyB6KyspIHtcclxuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goJygnK1t4LHkseiwwXS5qb2luKCcsJykrJyknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzcWwrPWNlbGxzLmpvaW4oJywgJyk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHNxbCk7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxuXHJcbkN1YmVTdG9yYWdlLnVwZGF0ZUNlbGwgPSBmdW5jdGlvbih4LCB5LCB6LCB2YWx1ZSkge1xyXG4gICAgXHJcbiAgICB2YXIgc3FsID0gJ1VQREFURSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgc3FsICs9ICdTRVQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9WQUxVRSArICc9JyArIHZhbHVlICsgJyAnO1xyXG4gICAgc3FsICs9ICdXSEVSRSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnID0gJyArIHggKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnID0gJyArIHkgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnID0gJyArIHogKyAnICc7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxuICAgIFxyXG59O1xyXG5cclxuQ3ViZVN0b3JhZ2UuZ2V0Q2VsbCA9IGZ1bmN0aW9uKHgsIHksIHopIHtcclxuICAgIHZhciBzcWwgPSAnU0VMRUNUICogRlJPTSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgc3FsICs9ICdXSEVSRSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnID0gJyArIHggKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnID0gJyArIHkgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnID0gJyArIHogKyAnICc7XHJcbiAgICAvL2NvbnNvbGUubG9nKHNxbCk7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxuQ3ViZVN0b3JhZ2Uuc3VtbWF0ZUNlbGxzID0gZnVuY3Rpb24oeDEsIHkxLCB6MSwgeDIsIHkyLCB6Mikge1xyXG4gICAgdmFyIHNxbCA9ICdTRUxFQ1QgU1VNKCcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFKycpIEFTICcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1NVTSsnIEZST00gJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnV0hFUkUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA+PSAnICsgeDEgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnIDw9ICcgKyB4MiArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPj0gJyArIHkxICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA8PSAnICsgeTIgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnID49ICcgKyB6MSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPD0gJyArIHoyICsgJyAnO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3ViZVN0b3JhZ2U7XHJcbiIsInZhciBDb21tYW5kc1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgZWw6ICcjbWFpbi12aWV3JyxcclxuICBjb21tYW5kc0lucHV0Om51bGwsXHJcbiAgZXhlY3V0aW9uQnV0dG9uOm51bGwsXHJcbiAgZXhlY3V0aW9uT3V0cHV0Om51bGwsXHJcbiAgZXJyb3JNZXNzYWdlOm51bGwsXHJcbiAgZXZlbnRzOntcclxuICBcdCdjbGljayAjZXhlY3V0ZS1idXR0b24nOidfb25FeGVjdXRlQnRuQ2xpY2snXHJcbiAgfSxcclxuICBpbml0aWFsaXplOmZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQ9dGhpcy4kKCcjY29tbWFuZHMtdGV4dCcpO1xyXG4gIFx0XHJcbiAgICBcclxuXHJcbiAgICB2YXIgZHVtbXlDb21tYW5kcz0gIFwiMlwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcbjQgNVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAyIDIgMiA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMSAxIDEgMjNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiA0IDQgNFwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDMgMyAzXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuMiA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDFcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAxIDEgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDIgMiAyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMiAyIDIgMiAyIDJcIjtcclxuXHJcblxyXG4gICAgdGhpcy5jb21tYW5kc0lucHV0LnZhbChkdW1teUNvbW1hbmRzKTtcclxuICAgIHRoaXMuZXhlY3V0aW9uQnV0dG9uPXRoaXMuJCgnI2V4ZWN1dGUtYnV0dG9uJyk7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dD10aGlzLiQoJyNleGVjdXRpb24tcmVzdWx0LXRleHQnKTtcclxuICAgIHRoaXMuZXJyb3JNZXNzYWdlPXRoaXMuJCgnI2V4ZWN1dGlvbi1lcnJvci1tZXNzYWdlJyk7XHJcbiAgICB0aGlzLmVycm9yTWVzc2FnZS5oaWRlKCk7XHJcbiAgfSxcclxuICBfb25FeGVjdXRlQnRuQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgXHR0aGlzLl9kaXNwYXRjaEV4ZWN1dGUoKTtcclxuXHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gICAgdGhpcy5leGVjdXRpb25CdXR0b24uYWRkQ2xhc3MoJ2Rpc2FibGVkJykuYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICB9LFxyXG4gIGRpc3BsYXlSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQpe1xyXG4gICAgdGhpcy5lcnJvck1lc3NhZ2UuaGlkZSgpO1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQudmFsKFwiVGllbXBvIGVqZWN1Y2nDs246IFwiK3RpbWVFbGFwc2VkK1wiIG1zXFxuXCIrcmVzdWx0U3RyaW5nKTtcclxuICAgIHRoaXMuZXhlY3V0aW9uQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgfSxcclxuICBkaXNwbGF5RXJyb3I6ZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3Ipe1xyXG4gICAgdGhpcy5lcnJvck1lc3NhZ2Uuc2hvdygpO1xyXG4gICAgdmFyIGVycm9yVGl0bGU9XCJFcnJvclwiO1xyXG4gICAgaWYoZXhlY3V0aW9uRXJyb3IuZ2V0Q29tbWFuZExpbmUoKSAmJiBleGVjdXRpb25FcnJvci5nZXRDb21tYW5kU3RyaW5nKCkpXHJcbiAgICAgIGVycm9yVGl0bGU9XCJFcnJvciBlbiBsYSBsw61uZWEgXCIrZXhlY3V0aW9uRXJyb3IuZ2V0Q29tbWFuZExpbmUoKSsnIDxici8+IFtcIicrZXhlY3V0aW9uRXJyb3IuZ2V0Q29tbWFuZFN0cmluZygpKyAnXCJdJztcclxuICAgIHRoaXMuZXJyb3JNZXNzYWdlLmZpbmQoJ2NvZGUnKS5odG1sKGVycm9yVGl0bGUpO1xyXG4gICAgdGhpcy5lcnJvck1lc3NhZ2UuZmluZCgncCcpLnRleHQoZXhlY3V0aW9uRXJyb3IuZ2V0RXJyb3JNZXNzYWdlKCkpO1xyXG4gICAgdGhpcy5leGVjdXRpb25PdXRwdXQudmFsKFwiXCIpO1xyXG4gIH1cclxufSx7XHJcblx0RVhFQ1VUSU9OX1NUQVJURUQ6J2V4ZWN1dGlvbi1zdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
