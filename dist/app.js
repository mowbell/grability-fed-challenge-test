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
        //debugger;
        //console.log("resultado fue", executionResult);
        showResults(executionResult);
    };

    var _onExecutionError = function(executionError) {
        //debugger;
        //console.log("resultado con error fue", executionError);
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
        //debugger;
        var timeStart=new Date().getTime();
        testPlanCommand.execute().getPromise().done(function(resultString){
            var timeEnd=new Date().getTime();
            var timeElapsed=timeEnd-timeStart;
            //console.log("Ejecucion completada", timeElapsed);
            //debugger;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvY29yZS9jdWJlL0N1YmUuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zdG9yYWdlL0N1YmVTdG9yYWdlLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb21tYW5kc1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0NvbW1hbmRzVmlldycpO1xyXG52YXIgRXhlY3V0aW9uID0gcmVxdWlyZSgnLi9jb3JlL0V4ZWN1dGlvbicpO1xyXG52YXIgQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWluVmlldyA9IG51bGw7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbWFpblZpZXcgPSBuZXcgQ29tbWFuZHNWaWV3KCk7XHJcbiAgICAgICAgbWFpblZpZXcub24oQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBfb25FeGVjdGlvblN0YXJ0ZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3Rpb25TdGFydGVkID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgICAgICBleGVjdXRlKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGV4ZWN1dGUgPSBmdW5jdGlvbihjb21tYW5kc1N0cmluZykge1xyXG4gICAgICAgIHZhciBleGVjdXRpb24gPSBuZXcgRXhlY3V0aW9uKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgICAgICBleGVjdXRpb24uZ2V0UHJvbWlzZSgpLnRoZW4oX29uRXhlY3V0aW9uU3VjY2VzcywgX29uRXhlY3V0aW9uRXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3V0aW9uU3VjY2VzcyA9IGZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCkge1xyXG4gICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInJlc3VsdGFkbyBmdWVcIiwgZXhlY3V0aW9uUmVzdWx0KTtcclxuICAgICAgICBzaG93UmVzdWx0cyhleGVjdXRpb25SZXN1bHQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3V0aW9uRXJyb3IgPSBmdW5jdGlvbihleGVjdXRpb25FcnJvcikge1xyXG4gICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInJlc3VsdGFkbyBjb24gZXJyb3IgZnVlXCIsIGV4ZWN1dGlvbkVycm9yKTtcclxuICAgICAgICBzaG93RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgc2hvd1Jlc3VsdHMgPSBmdW5jdGlvbihleGVjdXRpb25SZXN1bHQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0U3RyaW5nID0gZXhlY3V0aW9uUmVzdWx0LmdldFZhbHVlKCk7XHJcbiAgICAgICAgdmFyIHRpbWVFbGFwc2VkID0gZXhlY3V0aW9uUmVzdWx0LmdldFRpbWVFbGFwc2VkKCk7XHJcbiAgICAgICAgbWFpblZpZXcuZGlzcGxheVJlc3VsdHMocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBzaG93RXJyb3IgPSBmdW5jdGlvbihleGVjdXRpb25FcnJvcikge1xyXG4gICAgICAgIG1haW5WaWV3LmRpc3BsYXlFcnJvcihleGVjdXRpb25FcnJvcik7XHJcbiAgICB9O1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcclxuIiwidmFyIENvbmZpZz17XHJcblx0TUlOX1RFU1RTX0NBU0VTOjEsXHJcblx0TUFYX1RFU1RTX0NBU0VTOjUwLFxyXG5cdE1JTl9DVUJFX1NJWkU6MSxcclxuXHRNQVhfQ1VCRV9TSVpFOjEwMCxcclxuXHRNSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TOjEsXHJcblx0TUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxMDAwLFxyXG5cdE1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFOi1NYXRoLnBvdygxMCw5KSxcclxuXHRNQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRTpNYXRoLnBvdygxMCw5KSxcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzPUNvbmZpZzsiLCJ2YXIgQ29uZmlnPXJlcXVpcmUoJy4vQ29uZmlnJyk7XHJcbnZhciBFcnJvck1lc3NhZ2U9e1xyXG5cdE5PX0NPTU1BTkRTXHRcdFx0XHRcdFx0OlwiTm8gaGF5IGNvbWFuZG9zIHBhcmEgZWplY3V0YXJcIixcclxuXHRFTVBUWV9DT01NQU5EXHRcdFx0XHRcdDpcIkNvbWFuZG8gZXN0YSB2YWNpb1wiLFxyXG5cdFRFU1RfUExBTl9DT01NQU5EX1NJTlRBWFx0XHQ6XCJFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyBkZWJlIGNvbnRlbmVyIHVuIG7Dum1lcm9cIixcclxuXHRURVNUX1BMQU5fQ09NTUFORF9XUk9OR19WQUxVRVNcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gZGViZSBjb250ZW5lciB1biBuw7ptZXJvICh0ZXN0IGNhc2VzKSBlbnRyZSBcIitDb25maWcuTUlOX1RFU1RTX0NBU0VTK1wiIHkgXCIrQ29uZmlnLk1BWF9URVNUU19DQVNFUyxcclxuXHRURVNUX0NBU0VfQ09NTUFORF9TSU5UQVhcdFx0OlwiRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZG9zIG7Dum1lcm9zIHNlcGFyYWRvcyBwb3IgdW4gZXNwYWNpb1wiLFxyXG5cdFRFU1RfQ0FTRV9XUk9OR19DVUJFX1NJWkVcdFx0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBlbCBwcmltZXIgbnVtZXJvICh0YW1hw7FvIGRlbCBjdWJvKSBlbnRyZSBcIitDb25maWcuTUlOX0NVQkVfU0laRStcIiB5IFwiK0NvbmZpZy5NQVhfQ1VCRV9TSVpFLFxyXG5cdFRFU1RfQ0FTRV9XUk9OR19OVU1fT1BFUkFUSU9OU1x0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBlbCBzZWd1bmRvIG51bWVybyAob3BlcmFjaW9uZXMpIGVudHJlIFwiK0NvbmZpZy5NSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TK1wiIHkgXCIrQ29uZmlnLk1BWF9URVNUX0NBU0VTX09QRVJBVElPTlMsXHJcblx0T1BFUkFUSU9OX1VOS05PV05cdFx0XHRcdDpcIk9wZXJhY2nDs24gZGVzY29ub2NpZGFcIixcclxuXHRVUERBVEVfQ09NTUFORF9TSU5UQVhcdFx0XHQ6J0Vycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIHNlciBzaW1pbGFyIGEgXCJVUERBVEUgMiAyIDIgNFwiIChSZXZpc2FyIGVzcGFjaW9zKScsXHJcblx0VVBEQVRFX1dST05HX0NVQkVfQ0VMTFNcdFx0ICAgIDonRXJyb3IgZGUgVmFsb3JlcywgbGFzIGNvcmRlbmFkYXMgZGUgbGEgY2VsZGEgZGVsIGN1Ym8gc29uIGludmFsaWRhcycsXHJcblx0VVBEQVRFX1dST05HX1ZBTFVFX1RPX1VQREFURVx0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgdmFsb3IgYSBhY3R1YWxpemFyIGVudHJlIFwiK0NvbmZpZy5NSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRStcIiB5IFwiK0NvbmZpZy5NQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRSxcclxuXHRRVUVSWV9DT01NQU5EX1NJTlRBWFx0XHRcdDonRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgc2VyIHNpbWlsYXIgYSBcIlFVRVJZIDEgMSAxIDMgMyAzXCIgKFJldmlzYXIgZXNwYWNpb3MpJyxcclxuXHRRVUVSWV9XUk9OR19DVUJFX0NFTExTXHRcdCAgICA6J0Vycm9yIGRlIFZhbG9yZXMsIGxhcyBjb3JkZW5hZGFzIGRlIGxhcyBjZWxkYXMgZGVsIGN1Ym8gc29uIGludmFsaWRhcycsXHJcblx0RVhFQ1VUSU9OX0VSUk9SXHRcdCAgICBcdFx0OidFcnJvciBlbiBsYSBlamVjdWNpw7NuJyxcclxufTtcclxubW9kdWxlLmV4cG9ydHM9RXJyb3JNZXNzYWdlOyIsInZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZSgnLi4vY29uZmlnL0Vycm9yTWVzc2FnZScpO1xyXG52YXIgQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvYmFzZS9Db21tYW5kJyk7XHJcbnZhciBUZXN0UGxhbkNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RQbGFuQ29tbWFuZCcpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9UZXN0Q2FzZUNvbW1hbmQnKTtcclxudmFyIE9wZXJhdGlvbkNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL09wZXJhdGlvbkNvbW1hbmQnKTtcclxudmFyIEV4ZWN1dGlvbiA9IGZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKSB7XHJcbiAgICB2YXIgZXhlY0RlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICB2YXIgZXhlY3V0aW9uRXJyb3JEaXNwYXRoZWQ9ZmFsc2U7XHJcbiAgICBjcmVhdGVDb21tYW5kcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBmdW5jdGlvbiBleHRyYWN0TGluZXMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRpZighY29tbWFuZHNTdHJpbmcgfHwgY29tbWFuZHNTdHJpbmc9PT0nJyl7XHJcbiAgICBcdFx0ZGlzcGF0Y2hFcnJvcignJywgRXJyb3JNZXNzYWdlLk5PX0NPTU1BTkRTLDApO1xyXG4gICAgXHRcdHJldHVybjtcclxuICAgIFx0fVxyXG4gICAgXHRyZXR1cm4gY29tbWFuZHNTdHJpbmcuc3BsaXQoJ1xcbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKXtcclxuICAgIFx0XHJcbiAgICBcdHZhciBsaW5lcz1leHRyYWN0TGluZXMoY29tbWFuZHNTdHJpbmcpO1xyXG4gICAgXHR2YXIgbnVtTGluZXM9bGluZXMgJiYgbGluZXMubGVuZ3RoO1xyXG4gICAgXHRpZighbGluZXMgfHwhbnVtTGluZXMpXHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHRcclxuICAgIFx0Ly92YXIgY29tbWFuZHM9W107XHJcbiAgICBcdFxyXG5cclxuICAgIFx0dmFyIGN1ckxpbmVOdW1iZXI9MDtcclxuICAgIFx0XHJcbiAgICBcdGZ1bmN0aW9uIGdldE5leHRMaW5lKCl7XHJcbiAgICBcdFx0aWYoY3VyTGluZU51bWJlcisxPD1udW1MaW5lcylcclxuICAgIFx0XHRcdGN1ckxpbmVOdW1iZXIrKztcclxuICAgIFx0XHRyZXR1cm4gbGluZXNbY3VyTGluZU51bWJlci0xXTtcclxuICAgIFx0fVxyXG5cclxuXHJcbiAgICBcdC8vbWFrZSBUZXN0UGxhbiBjb21tYW5kXHJcbiAgICBcdHZhciB0ZXN0UGxhbkNvbW1hbmQ9bmV3IFRlc3RQbGFuQ29tbWFuZChnZXROZXh0TGluZSgpKTtcclxuICAgIFx0dmFyIHZhbGlkYXRpb25UZXN0UGxhbj10ZXN0UGxhbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuICAgIFx0aWYodmFsaWRhdGlvblRlc3RQbGFuLmlzVmFsaWQoKSl7XHJcblxyXG4gICAgXHRcdC8vY29tbWFuZHMucHVzaCh0ZXN0UGxhbkNvbW1hbmQpO1xyXG4gICAgXHRcdHZhciBudW1UZXN0Q2FzZXM9dGVzdFBsYW5Db21tYW5kLmdldE51bVRlc3RDYXNlcygpO1xyXG5cclxuICAgIFx0XHRjcmVhdGlvblRlc3RDYXNlczp7XHJcblx0ICAgIFx0XHRmb3IodmFyIGk9MTtpPD1udW1UZXN0Q2FzZXM7aSsrKXtcclxuXHQgICAgXHRcdFx0dmFyIHRlc3RDYXNlQ29tbWFuZD1uZXcgVGVzdENhc2VDb21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG5cdCAgICBcdFx0XHR2YXIgdmFsaWRhdGlvblRlc3RDYXNlPXRlc3RDYXNlQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG5cdCAgICBcdFx0XHRpZih2YWxpZGF0aW9uVGVzdENhc2UuaXNWYWxpZCgpKXtcclxuXHQgICAgXHRcdFx0XHRcclxuXHQgICAgXHRcdFx0XHR0ZXN0UGxhbkNvbW1hbmQuYWRkVGVzdENhc2VDb21tYW5kKHRlc3RDYXNlQ29tbWFuZCk7XHJcblx0ICAgIFx0XHRcdFx0dmFyIG51bU9wZXJhdGlvbnM9dGVzdENhc2VDb21tYW5kLmdldE51bU9wZXJhdGlvbnMoKTtcclxuXHQgICAgXHRcdFx0XHR2YXIgY3ViZVNpemU9dGVzdENhc2VDb21tYW5kLmdldEN1YmVTaXplKCk7XHJcblx0ICAgIFx0XHRcdFx0Y3JlYXRpb25PcGVyYXRpb25zOntcclxuXHRcdCAgICBcdFx0XHRcdGZvcih2YXIgaj0xO2o8PW51bU9wZXJhdGlvbnM7aisrKXtcclxuXHRcdCAgICBcdFx0XHRcdFx0dmFyIG9wZXJhdGlvbkNvbW1hbmQ9bmV3IE9wZXJhdGlvbkNvbW1hbmQoZ2V0TmV4dExpbmUoKSwgY3ViZVNpemUpO1x0XHJcblx0XHQgICAgXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uT3BlcmF0aW9uPW9wZXJhdGlvbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0aWYodmFsaWRhdGlvbk9wZXJhdGlvbi5pc1ZhbGlkKCkpe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdHRlc3RDYXNlQ29tbWFuZC5hZGRPcGVyYXRpb25Db21tYW5kKG9wZXJhdGlvbkNvbW1hbmQpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHR9XHJcblx0XHQgICAgXHRcdFx0XHRcdGVsc2V7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbk9wZXJhdGlvbixjdXJMaW5lTnVtYmVyKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRicmVhayBjcmVhdGlvblRlc3RDYXNlcztcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRcclxuXHRcdCAgICBcdFx0XHRcdFx0fVxyXG5cdFx0ICAgIFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgIFx0XHRcdFx0fVxyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHRcdGVsc2V7XHJcblx0ICAgIFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RDYXNlLGN1ckxpbmVOdW1iZXIpO1xyXG5cdCAgICBcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHR9XHJcbiAgICBcdFx0fVxyXG4gICAgICAgICAgICBcclxuICAgIFx0fVxyXG4gICAgXHRlbHNle1xyXG4gICAgXHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25UZXN0UGxhbixjdXJMaW5lTnVtYmVyKTtcclxuICAgIFx0fVxyXG5cclxuICAgICAgICBpZighZXhlY3V0aW9uRXJyb3JEaXNwYXRoZWQpXHJcbiAgICAgICAgICAgIGV4ZWN1dGVDb21tYW5kcyh0ZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gZXhlY3V0ZUNvbW1hbmRzKHRlc3RQbGFuQ29tbWFuZCl7XHJcbiAgICAgICAgLy9kZWJ1Z2dlcjtcclxuICAgICAgICB2YXIgdGltZVN0YXJ0PW5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHRlc3RQbGFuQ29tbWFuZC5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24ocmVzdWx0U3RyaW5nKXtcclxuICAgICAgICAgICAgdmFyIHRpbWVFbmQ9bmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHZhciB0aW1lRWxhcHNlZD10aW1lRW5kLXRpbWVTdGFydDtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkVqZWN1Y2lvbiBjb21wbGV0YWRhXCIsIHRpbWVFbGFwc2VkKTtcclxuICAgICAgICAgICAgLy9kZWJ1Z2dlcjtcclxuICAgICAgICAgICAgZGlzcGF0Y2hTdWNjZXNzKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQpO1xyXG4gICAgICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgZGlzcGF0Y2hFcnJvcignJywgRXJyb3JNZXNzYWdlLkVYRUNVVElPTl9FUlJPUiwwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCBsaW5lICl7XHJcbiAgICAgICAgZXhlY3V0aW9uRXJyb3JEaXNwYXRoZWQ9dHJ1ZTtcclxuICAgIFx0ZGlzcGF0Y2hFcnJvcihcclxuICAgIFx0XHR2YWxpZGF0aW9uLmdldENvbW1hbmRTdHJpbmcoKSwgXHJcbiAgICBcdFx0dmFsaWRhdGlvbi5nZXRFcnJvck1lc3NhZ2UoKSwgXHJcbiAgICBcdFx0bGluZSBcclxuICAgIFx0KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoRXJyb3IoY29tbWFuZFN0ciwgZXJyb3JNc2csIGxpbmUgKXtcclxuICAgIFx0dmFyIGVycm9yPW5ldyBFeGVjdXRpb24uRXJyb3IoXHJcbiAgICBcdFx0Y29tbWFuZFN0ciwgXHJcbiAgICBcdFx0ZXJyb3JNc2csIFxyXG4gICAgXHRcdGxpbmUgXHJcbiAgICBcdCk7XHJcbiAgICBcdGV4ZWNEZWZlcnJlZC5yZWplY3QoZXJyb3IpO1x0XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hTdWNjZXNzKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQgKXtcclxuICAgICAgICB2YXIgcmVzdWx0PW5ldyBFeGVjdXRpb24uUmVzdWx0KFxyXG4gICAgICAgICAgICByZXN1bHRTdHJpbmcsIFxyXG4gICAgICAgICAgICB0aW1lRWxhcHNlZFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgZXhlY0RlZmVycmVkLnJlc29sdmUocmVzdWx0KTsgXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcbiAgICBcdHJldHVybiBleGVjRGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfTtcclxuICAgIFxyXG59O1xyXG5FeGVjdXRpb24uUmVzdWx0ID0gZnVuY3Rpb24odmFsdWUsIHRpbWVFbGFwc2VkKSB7XHJcbiAgICB2YXIgbVZhbHVlID0gdmFsdWU7XHJcbiAgICB2YXIgbVRpbWVFbGFwc2VkID0gdGltZUVsYXBzZWQ7XHJcbiAgICB0aGlzLmdldFZhbHVlPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1WYWx1ZTtcclxuICAgIH07XHJcbiAgICB0aGlzLmdldFRpbWVFbGFwc2VkPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1UaW1lRWxhcHNlZDtcclxuICAgIH07XHJcbn07XHJcbkV4ZWN1dGlvbi5FcnJvciA9IGZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIGVycm9yTWVzc2FnZSwgY29tbWFuZExpbmUpIHtcclxuXHR2YXIgbUNvbW1hbmRTdHJpbmcgPSBjb21tYW5kU3RyaW5nO1xyXG4gICAgdmFyIG1FcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XHJcbiAgICB2YXIgbUNvbW1hbmRMaW5lID0gY29tbWFuZExpbmU7XHJcbiAgICB0aGlzLmdldENvbW1hbmRTdHJpbmc9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUNvbW1hbmRTdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nZXRFcnJvck1lc3NhZ2U9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUVycm9yTWVzc2FnZTtcclxuICAgIH07XHRcclxuICAgIHRoaXMuZ2V0Q29tbWFuZExpbmU9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUNvbW1hbmRMaW5lO1xyXG4gICAgfTtcdFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IEV4ZWN1dGlvbjtcclxuIiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFF1ZXJ5Q29tbWFuZD1yZXF1aXJlKFwiLi9RdWVyeUNvbW1hbmRcIik7XHJcbnZhciBVcGRhdGVDb21tYW5kPXJlcXVpcmUoXCIuL1VwZGF0ZUNvbW1hbmRcIik7XHJcblxyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBjdWJlU2l6ZSl7XHJcblx0aWYoL15RVUVSWS8udGVzdChjb21tYW5kU3RyaW5nKSl7XHJcblx0XHRyZXR1cm4gbmV3IFF1ZXJ5Q29tbWFuZChjb21tYW5kU3RyaW5nLGN1YmVTaXplKTtcclxuXHR9XHJcblx0ZWxzZSBpZigvXlVQREFURS8udGVzdChjb21tYW5kU3RyaW5nKSl7XHJcblx0XHRyZXR1cm4gbmV3IFVwZGF0ZUNvbW1hbmQoY29tbWFuZFN0cmluZyxjdWJlU2l6ZSk7XHJcblx0fVxyXG5cdFxyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5PUEVSQVRJT05fVU5LTk9XTik7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0XHRcclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cdH07XHJcblxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1PcGVyYXRpb25Db21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgUXVlcnlDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIF9jdWJlU2l6ZSl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIGN1YmVTaXplPV9jdWJlU2l6ZTtcclxuXHR2YXIgY2VsbFgxPTAsY2VsbFgyPTAsY2VsbFkxPTAsY2VsbFkyPTAsY2VsbFoxPTAsY2VsbFoyPTA7XHJcblx0dmFyIHNldEN1YmVDZWxscz1mdW5jdGlvbihYMSxYMixZMSxZMixaMSxaMil7XHJcblx0XHRjZWxsWDE9WDE7XHJcblx0XHRjZWxsWDI9WDI7XHJcblx0XHRjZWxsWTE9WTE7XHJcblx0XHRjZWxsWTI9WTI7XHJcblx0XHRjZWxsWjE9WjE7XHJcblx0XHRjZWxsWjI9WjI7XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciB2YWxpZGF0ZUNlbGw9ZnVuY3Rpb24oY2VsbENvb3JkKXtcclxuXHRcdHJldHVybiBjZWxsQ29vcmQ+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGNlbGxDb29yZDw9dGhhdC5nZXRDdWJlU2l6ZSgpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlFVRVJZXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvLT9cXGQrL2cpO1xyXG5cclxuXHRcdFx0XHR2YXIgY2VsbFgxPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMT1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWjE9cGFyc2VJbnQodmFsdWVzWzJdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFgyPXBhcnNlSW50KHZhbHVlc1szXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMj1wYXJzZUludCh2YWx1ZXNbNF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWjI9cGFyc2VJbnQodmFsdWVzWzVdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWDEpICYmIHZhbGlkYXRlQ2VsbChjZWxsWTEpICYmIHZhbGlkYXRlQ2VsbChjZWxsWjEpICYmXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgyKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkyKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFoyKSAmJlxyXG5cdFx0XHRcdFx0Y2VsbFgxPD1jZWxsWDIgJiYgY2VsbFkxPD1jZWxsWTIgJiYgY2VsbFoxPD1jZWxsWjJcclxuXHRcdFx0XHRcdCl7XHJcblxyXG5cdFx0XHRcdFx0c2V0Q3ViZUNlbGxzKGNlbGxYMSxjZWxsWDIsY2VsbFkxLGNlbGxZMixjZWxsWjEsY2VsbFoyKTtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5RVUVSWV9XUk9OR19DVUJFX0NFTExTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuUVVFUllfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbihjdWJlKXtcclxuXHRcdGN1YmUuc3VtbWF0ZUNlbGxzKGNlbGxYMSxjZWxsWTEsY2VsbFoxLCBjZWxsWDIsIGNlbGxZMiwgY2VsbFoyKVxyXG5cdFx0LnRoZW4odGhhdC5kaXNwYXRjaFN1Y2Nlc3MsdGhhdC5kaXNwYXRjaEVycm9yKTtcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblF1ZXJ5Q29tbWFuZD1Db21tYW5kLmV4dGVuZHMoUXVlcnlDb21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1RdWVyeUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIEN1YmU9cmVxdWlyZShcIi4vLi4vY3ViZS9DdWJlXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT0wO1xyXG5cdHZhciBudW1PcGVyYXRpb25zPTA7XHJcblx0dmFyIG9wZXJhdGlvbnM9W107XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgY3ViZT1udWxsO1xyXG5cdHZhciBzZXRDdWJlU2l6ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0Y3ViZVNpemU9bnVtO1xyXG5cdH07XHJcblx0dmFyIHNldE51bU9wZXJhdGlvbnM9ZnVuY3Rpb24obnVtKXtcclxuXHRcdG51bU9wZXJhdGlvbnM9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0dGhpcy5nZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtT3BlcmF0aW9ucztcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGNyZWF0ZUN1YmUoKXtcclxuXHRcdGN1YmU9bmV3IEN1YmUodGhhdC5nZXRDdWJlU2l6ZSgpKTtcclxuXHRcdHJldHVybiBjdWJlO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDdWJlKCl7XHJcblx0XHRyZXR1cm4gY3ViZTtcclxuXHR9XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCtcXHN7MX1cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvXFxkKy9nKTtcclxuXHRcdFx0XHR2YXIgY3ViZVNpemU9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGN1YmVTaXplPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjdWJlU2l6ZTw9Q29uZmlnLk1BWF9DVUJFX1NJWkUpe1xyXG5cdFx0XHRcdFx0aWYobnVtT3BlcmF0aW9ucz49Q29uZmlnLk1JTl9URVNUX0NBU0VTX09QRVJBVElPTlMgJiYgbnVtT3BlcmF0aW9uczw9Q29uZmlnLk1BWF9URVNUX0NBU0VTX09QRVJBVElPTlMpe1xyXG5cdFx0XHRcdFx0XHRzZXRDdWJlU2l6ZShjdWJlU2l6ZSk7XHJcblx0XHRcdFx0XHRcdHNldE51bU9wZXJhdGlvbnMobnVtT3BlcmF0aW9ucyk7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlMpO1x0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9XUk9OR19DVUJFX1NJWkUpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblx0fTtcclxuXHR0aGlzLmFkZE9wZXJhdGlvbkNvbW1hbmQ9ZnVuY3Rpb24ob3BlcmF0aW9uQ29tbWFuZCl7XHJcblx0XHRvcGVyYXRpb25zLnB1c2gob3BlcmF0aW9uQ29tbWFuZCk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblx0XHRjcmVhdGVDdWJlKCk7XHJcblx0XHRcclxuXHRcdHZhciBjb3VudE9wZXJhdGlvbnNFeGVjdXRlZD0wO1xyXG5cdFx0dmFyIHJlc3VsdHNTdHJpbmc9XCJcIjtcclxuXHRcdHZhciByZXN1bHRzPVtdO1xyXG5cdFx0XHJcblx0XHR2YXIgc3VjY2Vzc0NhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdHJlc3VsdHNTdHJpbmc9cmVzdWx0cy5qb2luKCdcXG4nKTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIlRlc3QgQ2FzZSBleGVjdXRlZFxcblxcblwiK3Jlc3VsdHNTdHJpbmcpO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcyhyZXN1bHRzU3RyaW5nKTtcclxuXHRcdH07XHJcblx0XHR2YXIgZXJyb3JDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoRXJyb3IoYXJndW1lbnRzKTtcclxuXHRcdFx0Ly9jb25zb2xlLndhcm4oXCJFcnJvciBlbiBsYSBlamVjdWNpw7NuIGRlbCB0ZXN0IGNhc2VcIik7XHJcblx0XHR9O1xyXG5cdFx0ZnVuY3Rpb24gb3BlcmF0aW9uRXhlY3V0ZWQocmVzdWx0KXtcclxuXHRcdFx0aWYocmVzdWx0IT09bnVsbCAmJiBfLmlzTnVtYmVyKHJlc3VsdCkpe1xyXG5cdFx0XHRcdHJlc3VsdHMucHVzaChyZXN1bHQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGV4ZWN1dGVOZXh0T3BlcmF0aW9uKCk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBleGVjdXRlTmV4dE9wZXJhdGlvbigpe1xyXG5cdFx0XHRpZihjb3VudE9wZXJhdGlvbnNFeGVjdXRlZDx0aGF0LmdldE51bU9wZXJhdGlvbnMoKSl7XHJcblx0XHRcdFx0dmFyIG5leHRPcGVyYXRpb249b3BlcmF0aW9uc1tjb3VudE9wZXJhdGlvbnNFeGVjdXRlZCsrXTtcclxuXHRcdFx0XHRuZXh0T3BlcmF0aW9uLmdldFByb21pc2UoKS50aGVuKG9wZXJhdGlvbkV4ZWN1dGVkLCBlcnJvckNhbGxiYWNrKTtcclxuXHRcdFx0XHRuZXh0T3BlcmF0aW9uLmV4ZWN1dGUoZ2V0Q3ViZSgpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRnZXRDdWJlKCkubG9hZCgpLnRoZW4oZXhlY3V0ZU5leHRPcGVyYXRpb24sIGVycm9yQ2FsbGJhY2spO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG5cclxufTtcclxuXHJcblRlc3RDYXNlQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVGVzdENhc2VDb21tYW5kKTtcclxubW9kdWxlLmV4cG9ydHM9VGVzdENhc2VDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgVGVzdFBsYW5Db21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBudW1UZXN0Q2FzZXM9MDtcclxuXHR2YXIgdGVzdENhc2VzPVtdO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHNldE51bVRlc3RDYXNlcz1mdW5jdGlvbihudW0pe1xyXG5cdFx0bnVtVGVzdENhc2VzPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtVGVzdENhc2VzPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtVGVzdENhc2VzO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciBudW09cGFyc2VJbnQoY21kKTtcclxuXHRcdFx0XHRpZihudW0+PUNvbmZpZy5NSU5fVEVTVFNfQ0FTRVMgJiYgbnVtPD1Db25maWcuTUFYX1RFU1RTX0NBU0VTKXtcclxuXHRcdFx0XHRcdHNldE51bVRlc3RDYXNlcyhudW0pO1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHR0aGlzLmFkZFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbih0ZXN0Q2FzZUNvbW1hbmQpe1xyXG5cdFx0dGVzdENhc2VzLnB1c2godGVzdENhc2VDb21tYW5kKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjb3VudFRlc3RDYXNlc0V4ZWN1dGVkPTA7XHJcblx0XHR2YXIgcmVzdWx0c1N0cmluZz1cIlwiO1xyXG5cdFx0dmFyIHJlc3VsdHM9W107XHJcblx0XHR2YXIgc3VjY2Vzc0NhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdHJlc3VsdHNTdHJpbmc9cmVzdWx0cy5qb2luKCdcXG4nKTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIlRlc3QgUGxhbiBleGVjdXRlZFxcblxcblwiK3Jlc3VsdHNTdHJpbmcpO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcyhyZXN1bHRzU3RyaW5nKTtcclxuXHRcdH07XHJcblx0XHR2YXIgZXJyb3JDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoRXJyb3IoYXJndW1lbnRzKTtcclxuXHRcdFx0Ly9jb25zb2xlLndhcm4oXCJFcnJvciBlbiBsYSBlamVjdWNpw7NuIGRlbCB0ZXN0IHBsYW5cIik7XHJcblx0XHR9O1xyXG5cdFx0ZnVuY3Rpb24gdGVzdENhc2VFeGVjdXRlZChyZXN1bHQpe1xyXG5cdFx0XHRyZXN1bHRzLnB1c2gocmVzdWx0KTtcclxuXHRcdFx0ZXhlY3V0ZU5leHRUZXN0Q2FzZSgpO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gZXhlY3V0ZU5leHRUZXN0Q2FzZSgpe1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoY291bnRUZXN0Q2FzZXNFeGVjdXRlZDx0aGF0LmdldE51bVRlc3RDYXNlcygpKXtcclxuXHRcdFx0XHR2YXIgbmV4dFRlc3RDYXNlPXRlc3RDYXNlc1tjb3VudFRlc3RDYXNlc0V4ZWN1dGVkKytdO1xyXG5cdFx0XHRcdG5leHRUZXN0Q2FzZS5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLnRoZW4odGVzdENhc2VFeGVjdXRlZCwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZXhlY3V0ZU5leHRUZXN0Q2FzZSgpO1xyXG5cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuVGVzdFBsYW5Db21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVRlc3RQbGFuQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFVwZGF0ZUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgX2N1YmVTaXplKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9X2N1YmVTaXplO1xyXG5cdHZhciBjZWxsWD0wO1xyXG5cdHZhciBjZWxsWT0wO1xyXG5cdHZhciBjZWxsWj0wO1xyXG5cdHZhciB2YWx1ZVRvVXBkYXRlPTA7XHJcblx0dmFyIHNldEN1YmVDZWxscz1mdW5jdGlvbihYLFksWil7XHJcblx0XHRjZWxsWD1YO1xyXG5cdFx0Y2VsbFk9WTtcclxuXHRcdGNlbGxaPVo7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBnZXRDZWxsWCgpe1xyXG5cdFx0cmV0dXJuIGNlbGxYO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDZWxsWSgpe1xyXG5cdFx0cmV0dXJuIGNlbGxZO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDZWxsWigpe1xyXG5cdFx0cmV0dXJuIGNlbGxaO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRWYWx1ZVRvVHVwZGF0ZSgpe1xyXG5cdFx0cmV0dXJuIHZhbHVlVG9VcGRhdGU7XHJcblx0fVxyXG5cdHZhciBzZXRWYWx1ZVRvVHVwZGF0ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0dmFsdWVUb1VwZGF0ZT1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciB2YWxpZGF0ZUNlbGw9ZnVuY3Rpb24oY2VsbENvb3JkKXtcclxuXHRcdHJldHVybiBjZWxsQ29vcmQ+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGNlbGxDb29yZDw9dGhhdC5nZXRDdWJlU2l6ZSgpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlVQREFURVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfS0/XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxaPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIHZhbHVlVG9VcGRhdGU9cGFyc2VJbnQodmFsdWVzWzNdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWCkgJiYgdmFsaWRhdGVDZWxsKGNlbGxZKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFopXHJcblxyXG5cdFx0XHRcdFx0KXtcclxuXHJcblx0XHRcdFx0XHRzZXRDdWJlQ2VsbHMoY2VsbFgsY2VsbFksY2VsbFopO1xyXG5cclxuXHRcdFx0XHRcdGlmKHZhbHVlVG9VcGRhdGU+PUNvbmZpZy5NSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRSAmJiB2YWx1ZVRvVXBkYXRlPD1Db25maWcuTUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUpe1xyXG5cdFx0XHRcdFx0XHRzZXRWYWx1ZVRvVHVwZGF0ZSh2YWx1ZVRvVXBkYXRlKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9XUk9OR19WQUxVRV9UT19VUERBVEUpO1x0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9XUk9OR19DVUJFX0NFTExTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oY3ViZSl7XHJcblx0XHRjdWJlLnVwZGF0ZUNlbGwoZ2V0Q2VsbFgoKSwgZ2V0Q2VsbFkoKSwgZ2V0Q2VsbFooKSwgZ2V0VmFsdWVUb1R1cGRhdGUoKSlcclxuXHRcdC50aGVuKHRoYXQuZGlzcGF0Y2hTdWNjZXNzLHRoYXQuZGlzcGF0Y2hFcnJvcik7XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5VcGRhdGVDb21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhVcGRhdGVDb21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1VcGRhdGVDb21tYW5kOyIsInZhciBDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmQpe1xyXG5cdHZhciBjb21tYW5kU3RyaW5nPWNvbW1hbmQ7XHJcblx0dmFyIGRlZmVycmVkPWpRdWVyeS5EZWZlcnJlZCgpO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dGhpcy5nZXRDb21tYW5kU3RyaW5nPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY29tbWFuZFN0cmluZy50cmltKCk7XHJcblx0fTtcclxuXHR0aGlzLmdldFByb21pc2U9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcblx0fTtcclxuXHR0aGlzLmRpc3BhdGNoU3VjY2Vzcz1mdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cdH07XHJcblx0dGhpcy5kaXNwYXRjaEVycm9yPWZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKGNvbW1hbmQpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fTtcclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHJcblx0fTtcclxuXHJcbn07XHJcbkNvbW1hbmQuZXh0ZW5kcz1mdW5jdGlvbihDaGlsZCl7XHJcblx0Ly9odHRwOi8vanVsaWVuLnJpY2hhcmQtZm95LmZyL2Jsb2cvMjAxMS8xMC8zMC9mdW5jdGlvbmFsLWluaGVyaXRhbmNlLXZzLXByb3RvdHlwYWwtaW5oZXJpdGFuY2UvXHJcblx0ZnVuY3Rpb24gRigpIHt9XHJcblx0Ri5wcm90b3R5cGUgPSBDb21tYW5kLnByb3RvdHlwZTtcclxuXHRDaGlsZC5wcm90b3R5cGU9bmV3IEYoKTtcclxuXHRfLmV4dGVuZChDaGlsZC5wcm90b3R5cGUsQ29tbWFuZC5wcm90b3R5cGUpO1xyXG5cdHJldHVybiBDaGlsZDtcclxufTtcclxuQ29tbWFuZC5WYWxpZGF0aW9uPWZ1bmN0aW9uKGNvbW1hbmQpe1xyXG5cdHZhciBjb21tYW5kU3RyaW5nPWNvbW1hbmQ7XHJcblx0dmFyIGVycm9yTXNnPVwiXCI7XHJcblx0dmFyIGlzVmFsaWQ9ZmFsc2U7XHJcblx0dGhpcy5mYWlsPWZ1bmN0aW9uKGVycm9yTWVzc2FnZSl7XHJcblx0XHRlcnJvck1zZz1lcnJvck1lc3NhZ2U7XHJcblx0XHRpc1ZhbGlkPWZhbHNlO1xyXG5cdH07XHJcblx0dGhpcy5zdWNjZXNzPWZ1bmN0aW9uKCl7XHJcblx0XHRlcnJvck1zZz1cIlwiO1xyXG5cdFx0aXNWYWxpZD10cnVlO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDb21tYW5kU3RyaW5nPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY29tbWFuZFN0cmluZztcclxuXHR9O1xyXG5cdHRoaXMuZ2V0RXJyb3JNZXNzYWdlPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZXJyb3JNc2c7XHJcblx0fTtcclxuXHR0aGlzLmlzVmFsaWQ9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBpc1ZhbGlkO1xyXG5cdH07XHJcbn07XHJcbi8qQ29tbWFuZC5UeXBlPXtcclxuXHRURVNUX1BMQU46J1RFU1RfUExBTicsXHJcblx0VEVTVF9DQVNFOidURVNUX0NBU0UnLFxyXG5cdFFVRVJZOidRVUVSWScsXHJcblx0VVBEQVRFOidVUERBVEUnLFxyXG59OyovXHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmQ7IiwidmFyIEN1YmVTdG9yYWdlID0gcmVxdWlyZSgnLi4vLi4vc3RvcmFnZS9DdWJlU3RvcmFnZScpO1xyXG52YXIgQ3ViZT1mdW5jdGlvbihzaXplKXtcclxuXHR2YXIgY3ViZVNpemU9c2l6ZTtcclxuXHR0aGlzLmxvYWQ9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBDdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSgpXHJcblx0XHRcdC50aGVuKEN1YmVTdG9yYWdlLnJlc2V0Q3ViZSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7IEN1YmVTdG9yYWdlLnBvcHVsYXRlQ3ViZShjdWJlU2l6ZSk7fSk7XHJcblx0fTtcclxuXHR0aGlzLnVwZGF0ZUNlbGw9ZnVuY3Rpb24oeCx5LHosdmFsdWUpe1xyXG5cdFx0cmV0dXJuIEN1YmVTdG9yYWdlLnVwZGF0ZUNlbGwoeCx5LHosdmFsdWUpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdHRoaXMuc3VtbWF0ZUNlbGxzPWZ1bmN0aW9uKHgxLCB5MSwgejEsIHgyLCB5MiwgejIpe1xyXG5cdFx0cmV0dXJuIEN1YmVTdG9yYWdlLnN1bW1hdGVDZWxscyh4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKS50aGVuKGZ1bmN0aW9uKHJlc3VsdFNldCl7XHJcblx0XHRcdHJldHVybiByZXN1bHRTZXQucm93c1swXS5zdW07XHJcblx0XHR9KTtcclxuXHR9O1xyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1DdWJlOyIsInZhciBBcHBsaWNhdGlvbj1yZXF1aXJlKCcuL0FwcGxpY2F0aW9uJyk7XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFwcD1uZXcgQXBwbGljYXRpb24oKTtcclxuXHRhcHAuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBDdWJlU3RvcmFnZSA9IHt9O1xyXG5DdWJlU3RvcmFnZS5DVUJFX0RCID0gXCJjdWJlX2RiXCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSA9IFwiY3ViZV9jZWxsXCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YID0gXCJ4XCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZID0gXCJ5XCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aID0gXCJ6XCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9WQUxVRSA9IFwiY2VsbF92YWx1ZVwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfU1VNID0gXCJzdW1cIjtcclxuXHJcbnZhciBEQjtcclxudHJ5IHtcclxuICAgIERCID0gb3BlbkRhdGFiYXNlKEN1YmVTdG9yYWdlLkNVQkVfREIsICcxLjAnLCAnQ3ViZSBEQicsIDUgKiAxMDI0ICogMTAyNCk7XHJcbn0gY2F0Y2ggKGUpIHtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4ZWNRdWVyeShxdWVyeSwgcGFyYW1zKSB7XHJcbiAgICB2YXIgZGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgIGlmIChEQiAhPT0gbnVsbCkge1xyXG4gICAgICAgIERCLnRyYW5zYWN0aW9uKGZ1bmN0aW9uKHR4KSB7XHJcbiAgICAgICAgICAgIHR4LmV4ZWN1dGVTcWwocXVlcnksIHBhcmFtcywgZnVuY3Rpb24odHgsIHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHR4LCBlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG59XHJcblxyXG5cclxuQ3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzcWwgPSAnQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJygnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFICsgJyBOVU1FUklDLCAnO1xyXG4gICAgc3FsICs9IFwiUFJJTUFSWSBLRVkgKFwiICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnLCcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcsJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJykgKTsnO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzcWwpO1xyXG5cclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5yZXNldEN1YmUgPSBmdW5jdGlvbihzaXplKSB7XHJcblx0dmFyIHNxbCA9ICdERUxFVEUgRlJPTSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcblxyXG5DdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUgPSBmdW5jdGlvbihzaXplKSB7XHJcblx0dmFyIHNxbCA9ICdJTlNFUlQgSU5UTyAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyBWQUxVRVMgJztcclxuICAgIHZhciBjZWxscyA9IFtdO1xyXG4gICAgZm9yICh4ID0gMTsgeCA8PSBzaXplOyB4KyspIHtcclxuICAgICAgICBmb3IgKHkgPSAxOyB5IDw9IHNpemU7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHogPSAxOyB6IDw9IHNpemU7IHorKykge1xyXG4gICAgICAgICAgICAgICAgY2VsbHMucHVzaCgnKCcrW3gseSx6LDBdLmpvaW4oJywnKSsnKScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNxbCs9Y2VsbHMuam9pbignLCAnKTtcclxuICAgIC8vY29uc29sZS5sb2coc3FsKTtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5cclxuQ3ViZVN0b3JhZ2UudXBkYXRlQ2VsbCA9IGZ1bmN0aW9uKHgsIHksIHosIHZhbHVlKSB7XHJcbiAgICBcclxuICAgIHZhciBzcWwgPSAnVVBEQVRFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1NFVCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFICsgJz0nICsgdmFsdWUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1dIRVJFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPSAnICsgeCArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPSAnICsgeSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPSAnICsgeiArICcgJztcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKHNxbCk7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG4gICAgXHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5nZXRDZWxsID0gZnVuY3Rpb24oeCwgeSwgeikge1xyXG4gICAgdmFyIHNxbCA9ICdTRUxFQ1QgKiBGUk9NICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1dIRVJFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPSAnICsgeCArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPSAnICsgeSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPSAnICsgeiArICcgJztcclxuICAgIC8vY29uc29sZS5sb2coc3FsKTtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5zdW1tYXRlQ2VsbHMgPSBmdW5jdGlvbih4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKSB7XHJcbiAgICB2YXIgc3FsID0gJ1NFTEVDVCBTVU0oJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUrJykgQVMgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfU1VNKycgRlJPTSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgc3FsICs9ICdXSEVSRSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnID49ICcgKyB4MSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPD0gJyArIHgyICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA+PSAnICsgeTEgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnIDw9ICcgKyB5MiArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPj0gJyArIHoxICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA8PSAnICsgejIgKyAnICc7XHJcbiAgICAvL2NvbnNvbGUubG9nKHNxbCk7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDdWJlU3RvcmFnZTtcclxuIiwidmFyIENvbW1hbmRzVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICBlbDogJyNtYWluLXZpZXcnLFxyXG4gIGNvbW1hbmRzSW5wdXQ6bnVsbCxcclxuICBleGVjdXRpb25CdXR0b246bnVsbCxcclxuICBleGVjdXRpb25PdXRwdXQ6bnVsbCxcclxuICBlcnJvck1lc3NhZ2U6bnVsbCxcclxuICBldmVudHM6e1xyXG4gIFx0J2NsaWNrICNleGVjdXRlLWJ1dHRvbic6J19vbkV4ZWN1dGVCdG5DbGljaydcclxuICB9LFxyXG4gIGluaXRpYWxpemU6ZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuY29tbWFuZHNJbnB1dD10aGlzLiQoJyNjb21tYW5kcy10ZXh0Jyk7XHJcbiAgXHRcclxuICAgIFxyXG5cclxuICAgIHZhciBkdW1teUNvbW1hbmRzPSAgXCIyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuNCA1XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAxIDEgMSAyM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDQgNCA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG4yIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDEgMSAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMiAyIDJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiAyIDIgMlwiO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQudmFsKGR1bW15Q29tbWFuZHMpO1xyXG4gICAgdGhpcy5leGVjdXRpb25CdXR0b249dGhpcy4kKCcjZXhlY3V0ZS1idXR0b24nKTtcclxuICBcdHRoaXMuZXhlY3V0aW9uT3V0cHV0PXRoaXMuJCgnI2V4ZWN1dGlvbi1yZXN1bHQtdGV4dCcpO1xyXG4gICAgdGhpcy5lcnJvck1lc3NhZ2U9dGhpcy4kKCcjZXhlY3V0aW9uLWVycm9yLW1lc3NhZ2UnKTtcclxuICAgIHRoaXMuZXJyb3JNZXNzYWdlLmhpZGUoKTtcclxuICB9LFxyXG4gIF9vbkV4ZWN1dGVCdG5DbGljazpmdW5jdGlvbihlKXtcclxuICBcdHRoaXMuX2Rpc3BhdGNoRXhlY3V0ZSgpO1xyXG5cclxuICB9LFxyXG4gIF9kaXNwYXRjaEV4ZWN1dGU6ZnVuY3Rpb24oKXtcclxuICBcdHZhciBjb21tYW5kcz10aGlzLmNvbW1hbmRzSW5wdXQudmFsKCk7XHJcbiAgXHR0aGlzLnRyaWdnZXIoQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBjb21tYW5kcyk7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbkJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCl7XHJcbiAgICB0aGlzLmVycm9yTWVzc2FnZS5oaWRlKCk7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoXCJUaWVtcG8gZWplY3VjacOzbjogXCIrdGltZUVsYXBzZWQrXCIgbXNcXG5cIityZXN1bHRTdHJpbmcpO1xyXG4gICAgdGhpcy5leGVjdXRpb25CdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICB9LFxyXG4gIGRpc3BsYXlFcnJvcjpmdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcbiAgICB0aGlzLmVycm9yTWVzc2FnZS5zaG93KCk7XHJcbiAgICB2YXIgZXJyb3JUaXRsZT1cIkVycm9yXCI7XHJcbiAgICBpZihleGVjdXRpb25FcnJvci5nZXRDb21tYW5kTGluZSgpICYmIGV4ZWN1dGlvbkVycm9yLmdldENvbW1hbmRTdHJpbmcoKSlcclxuICAgICAgZXJyb3JUaXRsZT1cIkVycm9yIGVuIGxhIGzDrW5lYSBcIitleGVjdXRpb25FcnJvci5nZXRDb21tYW5kTGluZSgpKycgPGJyLz4gW1wiJytleGVjdXRpb25FcnJvci5nZXRDb21tYW5kU3RyaW5nKCkrICdcIl0nO1xyXG4gICAgdGhpcy5lcnJvck1lc3NhZ2UuZmluZCgnY29kZScpLmh0bWwoZXJyb3JUaXRsZSk7XHJcbiAgICB0aGlzLmVycm9yTWVzc2FnZS5maW5kKCdwJykudGV4dChleGVjdXRpb25FcnJvci5nZXRFcnJvck1lc3NhZ2UoKSk7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoXCJcIik7XHJcbiAgfVxyXG59LHtcclxuXHRFWEVDVVRJT05fU1RBUlRFRDonZXhlY3V0aW9uLXN0YXJ0ZWQnXHJcblxyXG59KTtcclxubW9kdWxlLmV4cG9ydHM9Q29tbWFuZHNWaWV3OyJdfQ==
