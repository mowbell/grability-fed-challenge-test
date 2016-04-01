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
        testPlanCommand.execute().getPromise().done(function(){
            var timeEnd=new Date().getTime();
            console.log("Ejecucion completada", timeEnd-timeStart);
            debugger;
        }).fail(function(){
            debugger;
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

    this.getPromise=function(){
    	return execDeferred.promise();
    };
    
};
Execution.Result = function(value, timeElapsed, execution) {
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
		
		var successCallback=function(){
			debugger;
			console.log("Test Case executed\n\n"+resultsString);
			that.dispatchSuccess(resultsString);
		};
		var errorCallback=function(){
			debugger;
			this.dispatchError(arguments);
			console.warn("Error en la ejecución del test case");
		};
		function operationExecuted(result){
			debugger;
			resultsString+=result+"\n";
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
		
		var successCallback=function(){
			debugger;
			console.log("Test Plan executed\n\n"+resultsString);
			that.dispatchSuccess(resultsString);
		};
		var errorCallback=function(){
			debugger;
			this.dispatchError(arguments);
			console.warn("Error en la ejecución del test plan");
		};
		function testCaseExecuted(result){
			debugger;
			resultsString+=result+"\n";
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
		return CubeStorage.updateCell(x,y,z,value).then(function(){
			debugger;
			return 6666;
		});
	};
	this.summateCells=function(x1, y1, z1, x2, y2, z2){
		debugger;
		return CubeStorage.summateCells(x1, y1, z1, x2, y2, z2).then(function(){
			debugger;
			return 3333;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvY29yZS9jdWJlL0N1YmUuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zdG9yYWdlL0N1YmVTdG9yYWdlLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb21tYW5kc1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0NvbW1hbmRzVmlldycpO1xyXG52YXIgRXhlY3V0aW9uID0gcmVxdWlyZSgnLi9jb3JlL0V4ZWN1dGlvbicpO1xyXG4vL3ZhciBDdWJlU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS9DdWJlU3RvcmFnZScpO1xyXG52YXIgQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWluVmlldyA9IG51bGw7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbWFpblZpZXcgPSBuZXcgQ29tbWFuZHNWaWV3KCk7XHJcbiAgICAgICAgbWFpblZpZXcub24oQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBfb25FeGVjdGlvblN0YXJ0ZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3Rpb25TdGFydGVkID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgICAgICBleGVjdXRlKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGV4ZWN1dGUgPSBmdW5jdGlvbihjb21tYW5kc1N0cmluZykge1xyXG4gICAgICAgIC8qdmFyIHBvcHVsYXRlQ3ViZT1mdW5jdGlvbigpe0N1YmVTdG9yYWdlLnBvcHVsYXRlQ3ViZSg0KTt9O1xyXG4gICAgICAgIHZhciByZXNldEN1YmU9ZnVuY3Rpb24oKXtDdWJlU3RvcmFnZS5yZXNldEN1YmUoKS50aGVuKHBvcHVsYXRlQ3ViZSk7fTtcclxuICAgICAgICB2YXIgY3JlYXRlVGFibGU9ZnVuY3Rpb24oKXtDdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSgpLnRoZW4ocmVzZXRDdWJlKTt9O1xyXG4gICAgICAgIGNyZWF0ZVRhYmxlKCk7Ki9cclxuICAgICAgICAvKkN1YmVTdG9yYWdlLmNyZWF0ZVRhYmxlKClcclxuICAgICAgICAudGhlbihDdWJlU3RvcmFnZS5yZXNldEN1YmUpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKXtyZXR1cm4gQ3ViZVN0b3JhZ2UucG9wdWxhdGVDdWJlKDQpfSk7Ki9cclxuICAgICAgICB2YXIgZXhlY3V0aW9uPW5ldyBFeGVjdXRpb24oY29tbWFuZHNTdHJpbmcpO1xyXG4gICAgICAgIGV4ZWN1dGlvbi5nZXRQcm9taXNlKCkudGhlbihfb25FeGVjdXRpb25TdWNjZXNzLF9vbkV4ZWN1dGlvbkVycm9yKTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhDdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSgpLnRoZW4oQ3ViZVN0b3JhZ2UucmVzZXRDdWJlKS50aGVuKGZ1bmN0aW9uKCkgeyBDdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUoNCk7fSkpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX29uRXhlY3V0aW9uU3VjY2VzcyA9IGZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGZ1ZVwiLCBleGVjdXRpb25SZXN1bHQpO1xyXG4gICAgICAgIHNob3dSZXN1bHRzKGV4ZWN1dGlvblJlc3VsdCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBfb25FeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN1bHRhZG8gY29uIGVycm9yIGZ1ZVwiLCBleGVjdXRpb25FcnJvcik7XHJcbiAgICAgICAgc2hvd0Vycm9yKGV4ZWN1dGlvbkVycm9yKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHNob3dSZXN1bHRzID0gZnVuY3Rpb24oZXhlY3V0aW9uUmVzdWx0KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdFN0cmluZyA9IGV4ZWN1dGlvblJlc3VsdC5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIHZhciB0aW1lRWxhcHNlZCA9IGV4ZWN1dGlvblJlc3VsdC5nZXRUaW1lRWxhcHNlZCgpO1xyXG4gICAgICAgIG1haW5WaWV3LmRpc3BsYXlSZXN1bHRzKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgc2hvd0Vycm9yID0gZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3IpIHtcclxuICAgICAgICBtYWluVmlldy5kaXNwbGF5RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb247XHJcbiIsInZhciBDb25maWc9e1xyXG5cdE1JTl9URVNUU19DQVNFUzoxLFxyXG5cdE1BWF9URVNUU19DQVNFUzo1MCxcclxuXHRNSU5fQ1VCRV9TSVpFOjEsXHJcblx0TUFYX0NVQkVfU0laRToxMDAsXHJcblx0TUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxLFxyXG5cdE1BWF9URVNUX0NBU0VTX09QRVJBVElPTlM6MTAwMCxcclxuXHRNSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRTotTWF0aC5wb3coMTAsOSksXHJcblx0TUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6TWF0aC5wb3coMTAsOSksXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cz1Db25maWc7IiwidmFyIENvbmZpZz1yZXF1aXJlKCcuL0NvbmZpZycpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXtcclxuXHROT19DT01NQU5EU1x0XHRcdFx0XHRcdDpcIk5vIGhheSBjb21hbmRvcyBwYXJhIGVqZWN1dGFyXCIsXHJcblx0RU1QVFlfQ09NTUFORFx0XHRcdFx0XHQ6XCJDb21hbmRvIGVzdGEgdmFjaW9cIixcclxuXHRURVNUX1BMQU5fQ09NTUFORF9TSU5UQVhcdFx0OlwiRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gZGViZSBjb250ZW5lciB1biBuw7ptZXJvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfV1JPTkdfVkFMVUVTXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVybyAodGVzdCBjYXNlcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUU19DQVNFUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVFNfQ0FTRVMsXHJcblx0VEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGRvcyBuw7ptZXJvcyBzZXBhcmFkb3MgcG9yIHVuIGVzcGFjaW9cIixcclxuXHRURVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFXHRcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgcHJpbWVyIG51bWVybyAodGFtYcOxbyBkZWwgY3VibykgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX1NJWkUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfU0laRSxcclxuXHRURVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlNcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgc2VndW5kbyBudW1lcm8gKG9wZXJhY2lvbmVzKSBlbnRyZSBcIitDb25maWcuTUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TLFxyXG5cdE9QRVJBVElPTl9VTktOT1dOXHRcdFx0XHQ6XCJPcGVyYWNpw7NuIGRlc2Nvbm9jaWRhXCIsXHJcblx0VVBEQVRFX0NPTU1BTkRfU0lOVEFYXHRcdFx0OidFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBzZXIgc2ltaWxhciBhIFwiVVBEQVRFIDIgMiAyIDRcIiAoUmV2aXNhciBlc3BhY2lvcyknLFxyXG5cdFVQREFURV9XUk9OR19DVUJFX0NFTExTXHRcdCAgICA6J0Vycm9yIGRlIFZhbG9yZXMsIGxhcyBjb3JkZW5hZGFzIGRlIGxhIGNlbGRhIGRlbCBjdWJvIHNvbiBpbnZhbGlkYXMnLFxyXG5cdFVQREFURV9XUk9OR19WQUxVRV9UT19VUERBVEVcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIHZhbG9yIGEgYWN0dWFsaXphciBlbnRyZSBcIitDb25maWcuTUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUsXHJcblx0UVVFUllfQ09NTUFORF9TSU5UQVhcdFx0XHQ6J0Vycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIHNlciBzaW1pbGFyIGEgXCJRVUVSWSAxIDEgMSAzIDMgM1wiIChSZXZpc2FyIGVzcGFjaW9zKScsXHJcblx0UVVFUllfV1JPTkdfQ1VCRV9DRUxMU1x0XHQgICAgOidFcnJvciBkZSBWYWxvcmVzLCBsYXMgY29yZGVuYWRhcyBkZSBsYXMgY2VsZGFzIGRlbCBjdWJvIHNvbiBpbnZhbGlkYXMnLFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1FcnJvck1lc3NhZ2U7IiwidmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKCcuLi9jb25maWcvRXJyb3JNZXNzYWdlJyk7XHJcbnZhciBDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQnKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kJyk7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZCcpO1xyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvT3BlcmF0aW9uQ29tbWFuZCcpO1xyXG52YXIgRXhlY3V0aW9uID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgIHZhciBleGVjRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgIHZhciBleGVjdXRpb25FcnJvckRpc3BhdGhlZD1mYWxzZTtcclxuICAgIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIGZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyl7XHJcbiAgICBcdGlmKCFjb21tYW5kc1N0cmluZyB8fCBjb21tYW5kc1N0cmluZz09PScnKXtcclxuICAgIFx0XHRkaXNwYXRjaEVycm9yKCcnLCBFcnJvck1lc3NhZ2UuTk9fQ09NTUFORFMsMCk7XHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHR9XHJcbiAgICBcdHJldHVybiBjb21tYW5kc1N0cmluZy5zcGxpdCgnXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZHMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRcclxuICAgIFx0dmFyIGxpbmVzPWV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBcdHZhciBudW1MaW5lcz1saW5lcyAmJiBsaW5lcy5sZW5ndGg7XHJcbiAgICBcdGlmKCFsaW5lcyB8fCFudW1MaW5lcylcclxuICAgIFx0XHRyZXR1cm47XHJcbiAgICBcdFxyXG4gICAgXHQvL3ZhciBjb21tYW5kcz1bXTtcclxuICAgIFx0XHJcblxyXG4gICAgXHR2YXIgY3VyTGluZU51bWJlcj0wO1xyXG4gICAgXHRcclxuICAgIFx0ZnVuY3Rpb24gZ2V0TmV4dExpbmUoKXtcclxuICAgIFx0XHRpZihjdXJMaW5lTnVtYmVyKzE8PW51bUxpbmVzKVxyXG4gICAgXHRcdFx0Y3VyTGluZU51bWJlcisrO1xyXG4gICAgXHRcdHJldHVybiBsaW5lc1tjdXJMaW5lTnVtYmVyLTFdO1xyXG4gICAgXHR9XHJcblxyXG5cclxuICAgIFx0Ly9tYWtlIFRlc3RQbGFuIGNvbW1hbmRcclxuICAgIFx0dmFyIHRlc3RQbGFuQ29tbWFuZD1uZXcgVGVzdFBsYW5Db21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG4gICAgXHR2YXIgdmFsaWRhdGlvblRlc3RQbGFuPXRlc3RQbGFuQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG4gICAgXHRpZih2YWxpZGF0aW9uVGVzdFBsYW4uaXNWYWxpZCgpKXtcclxuXHJcbiAgICBcdFx0Ly9jb21tYW5kcy5wdXNoKHRlc3RQbGFuQ29tbWFuZCk7XHJcbiAgICBcdFx0dmFyIG51bVRlc3RDYXNlcz10ZXN0UGxhbkNvbW1hbmQuZ2V0TnVtVGVzdENhc2VzKCk7XHJcblxyXG4gICAgXHRcdGNyZWF0aW9uVGVzdENhc2VzOntcclxuXHQgICAgXHRcdGZvcih2YXIgaT0xO2k8PW51bVRlc3RDYXNlcztpKyspe1xyXG5cdCAgICBcdFx0XHR2YXIgdGVzdENhc2VDb21tYW5kPW5ldyBUZXN0Q2FzZUNvbW1hbmQoZ2V0TmV4dExpbmUoKSk7XHJcblx0ICAgIFx0XHRcdHZhciB2YWxpZGF0aW9uVGVzdENhc2U9dGVzdENhc2VDb21tYW5kLnZhbGlkYXRlKCk7XHJcblx0ICAgIFx0XHRcdGlmKHZhbGlkYXRpb25UZXN0Q2FzZS5pc1ZhbGlkKCkpe1xyXG5cdCAgICBcdFx0XHRcdFxyXG5cdCAgICBcdFx0XHRcdHRlc3RQbGFuQ29tbWFuZC5hZGRUZXN0Q2FzZUNvbW1hbmQodGVzdENhc2VDb21tYW5kKTtcclxuXHQgICAgXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz10ZXN0Q2FzZUNvbW1hbmQuZ2V0TnVtT3BlcmF0aW9ucygpO1xyXG5cdCAgICBcdFx0XHRcdHZhciBjdWJlU2l6ZT10ZXN0Q2FzZUNvbW1hbmQuZ2V0Q3ViZVNpemUoKTtcclxuXHQgICAgXHRcdFx0XHRjcmVhdGlvbk9wZXJhdGlvbnM6e1xyXG5cdFx0ICAgIFx0XHRcdFx0Zm9yKHZhciBqPTE7ajw9bnVtT3BlcmF0aW9ucztqKyspe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHR2YXIgb3BlcmF0aW9uQ29tbWFuZD1uZXcgT3BlcmF0aW9uQ29tbWFuZChnZXROZXh0TGluZSgpLCBjdWJlU2l6ZSk7XHRcclxuXHRcdCAgICBcdFx0XHRcdFx0dmFyIHZhbGlkYXRpb25PcGVyYXRpb249b3BlcmF0aW9uQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRpZih2YWxpZGF0aW9uT3BlcmF0aW9uLmlzVmFsaWQoKSl7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0dGVzdENhc2VDb21tYW5kLmFkZE9wZXJhdGlvbkNvbW1hbmQob3BlcmF0aW9uQ29tbWFuZCk7XHJcblx0XHQgICAgXHRcdFx0XHRcdH1cclxuXHRcdCAgICBcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uT3BlcmF0aW9uLGN1ckxpbmVOdW1iZXIpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdFxyXG5cdFx0ICAgIFx0XHRcdFx0XHR9XHJcblx0XHQgICAgXHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgXHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdFx0ZWxzZXtcclxuXHQgICAgXHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uVGVzdENhc2UsY3VyTGluZU51bWJlcik7XHJcblx0ICAgIFx0XHRcdFx0YnJlYWsgY3JlYXRpb25UZXN0Q2FzZXM7XHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdH1cclxuICAgIFx0XHR9XHJcbiAgICAgICAgICAgIFxyXG4gICAgXHR9XHJcbiAgICBcdGVsc2V7XHJcbiAgICBcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RQbGFuLGN1ckxpbmVOdW1iZXIpO1xyXG4gICAgXHR9XHJcblxyXG4gICAgICAgIGlmKCFleGVjdXRpb25FcnJvckRpc3BhdGhlZClcclxuICAgICAgICAgICAgZXhlY3V0ZUNvbW1hbmRzKHRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxuXHJcblx0ICAgIC8qXy5lYWNoKGxpbmVzLCBmdW5jdGlvbihsaW5lLCBpbmRleCl7XHJcblx0ICAgIFx0Y29uc29sZS5sb2coaW5kZXgsIGxpbmUpO1xyXG5cdCAgICB9KTsqL1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBleGVjdXRlQ29tbWFuZHModGVzdFBsYW5Db21tYW5kKXtcclxuICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB2YXIgdGltZVN0YXJ0PW5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHRlc3RQbGFuQ29tbWFuZC5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRpbWVFbmQ9bmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRWplY3VjaW9uIGNvbXBsZXRhZGFcIiwgdGltZUVuZC10aW1lU3RhcnQpO1xyXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb24sIGxpbmUgKXtcclxuICAgICAgICBleGVjdXRpb25FcnJvckRpc3BhdGhlZD10cnVlO1xyXG4gICAgXHRkaXNwYXRjaEVycm9yKFxyXG4gICAgXHRcdHZhbGlkYXRpb24uZ2V0Q29tbWFuZFN0cmluZygpLCBcclxuICAgIFx0XHR2YWxpZGF0aW9uLmdldEVycm9yTWVzc2FnZSgpLCBcclxuICAgIFx0XHRsaW5lIFxyXG4gICAgXHQpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hFcnJvcihjb21tYW5kU3RyLCBlcnJvck1zZywgbGluZSApe1xyXG4gICAgXHR2YXIgZXJyb3I9bmV3IEV4ZWN1dGlvbi5FcnJvcihcclxuICAgIFx0XHRjb21tYW5kU3RyLCBcclxuICAgIFx0XHRlcnJvck1zZywgXHJcbiAgICBcdFx0bGluZSBcclxuICAgIFx0KTtcclxuICAgIFx0ZXhlY0RlZmVycmVkLnJlamVjdChlcnJvcik7XHRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdldFByb21pc2U9ZnVuY3Rpb24oKXtcclxuICAgIFx0cmV0dXJuIGV4ZWNEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9O1xyXG4gICAgXHJcbn07XHJcbkV4ZWN1dGlvbi5SZXN1bHQgPSBmdW5jdGlvbih2YWx1ZSwgdGltZUVsYXBzZWQsIGV4ZWN1dGlvbikge1xyXG4gICAgdmFyIG1WYWx1ZSA9IHZhbHVlO1xyXG4gICAgdmFyIG1UaW1lRWxhcHNlZCA9IHRpbWVFbGFwc2VkO1xyXG4gICAgdGhpcy5nZXRWYWx1ZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtVmFsdWU7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nZXRUaW1lRWxhcHNlZD0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtVGltZUVsYXBzZWQ7XHJcbiAgICB9O1xyXG59O1xyXG5FeGVjdXRpb24uRXJyb3IgPSBmdW5jdGlvbihjb21tYW5kU3RyaW5nLCBlcnJvck1lc3NhZ2UsIGNvbW1hbmRMaW5lKSB7XHJcblx0dmFyIG1Db21tYW5kU3RyaW5nID0gY29tbWFuZFN0cmluZztcclxuICAgIHZhciBtRXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xyXG4gICAgdmFyIG1Db21tYW5kTGluZSA9IGNvbW1hbmRMaW5lO1xyXG4gICAgdGhpcy5nZXRDb21tYW5kU3RyaW5nPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1Db21tYW5kU3RyaW5nO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2V0RXJyb3JNZXNzYWdlPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1FcnJvck1lc3NhZ2U7XHJcbiAgICB9O1x0XHJcbiAgICB0aGlzLmdldENvbW1hbmRMaW5lPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1Db21tYW5kTGluZTtcclxuICAgIH07XHRcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBFeGVjdXRpb247XHJcbiIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBRdWVyeUNvbW1hbmQ9cmVxdWlyZShcIi4vUXVlcnlDb21tYW5kXCIpO1xyXG52YXIgVXBkYXRlQ29tbWFuZD1yZXF1aXJlKFwiLi9VcGRhdGVDb21tYW5kXCIpO1xyXG5cclxudmFyIE9wZXJhdGlvbkNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgY3ViZVNpemUpe1xyXG5cdGlmKC9eUVVFUlkvLnRlc3QoY29tbWFuZFN0cmluZykpe1xyXG5cdFx0cmV0dXJuIG5ldyBRdWVyeUNvbW1hbmQoY29tbWFuZFN0cmluZyxjdWJlU2l6ZSk7XHJcblx0fVxyXG5cdGVsc2UgaWYoL15VUERBVEUvLnRlc3QoY29tbWFuZFN0cmluZykpe1xyXG5cdFx0cmV0dXJuIG5ldyBVcGRhdGVDb21tYW5kKGNvbW1hbmRTdHJpbmcsY3ViZVNpemUpO1xyXG5cdH1cclxuXHRcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuT1BFUkFUSU9OX1VOS05PV04pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdFx0XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHR9O1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHM9T3BlcmF0aW9uQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFF1ZXJ5Q29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBfY3ViZVNpemUpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT1fY3ViZVNpemU7XHJcblx0dmFyIGNlbGxYMT0wLGNlbGxYMj0wLGNlbGxZMT0wLGNlbGxZMj0wLGNlbGxaMT0wLGNlbGxaMj0wO1xyXG5cdHZhciBzZXRDdWJlQ2VsbHM9ZnVuY3Rpb24oWDEsWDIsWTEsWTIsWjEsWjIpe1xyXG5cdFx0Y2VsbFgxPVgxO1xyXG5cdFx0Y2VsbFgyPVgyO1xyXG5cdFx0Y2VsbFkxPVkxO1xyXG5cdFx0Y2VsbFkyPVkyO1xyXG5cdFx0Y2VsbFoxPVoxO1xyXG5cdFx0Y2VsbFoyPVoyO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgdmFsaWRhdGVDZWxsPWZ1bmN0aW9uKGNlbGxDb29yZCl7XHJcblx0XHRyZXR1cm4gY2VsbENvb3JkPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjZWxsQ29vcmQ8PXRoYXQuZ2V0Q3ViZVNpemUoKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15RVUVSWVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYMT1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWTE9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoxPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxYMj1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdHZhciBjZWxsWTI9cGFyc2VJbnQodmFsdWVzWzRdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoyPXBhcnNlSW50KHZhbHVlc1s1XSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFoxKSAmJlxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxZMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxaMikgJiZcclxuXHRcdFx0XHRcdGNlbGxYMTw9Y2VsbFgyICYmIGNlbGxZMTw9Y2VsbFkyICYmIGNlbGxaMTw9Y2VsbFoyXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWDEsY2VsbFgyLGNlbGxZMSxjZWxsWTIsY2VsbFoxLGNlbGxaMik7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuUVVFUllfV1JPTkdfQ1VCRV9DRUxMUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlFVRVJZX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oY3ViZSl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGN1YmUuc3VtbWF0ZUNlbGxzKGNlbGxYMSxjZWxsWTEsY2VsbFoxLCBjZWxsWDIsIGNlbGxZMiwgY2VsbFoyKVxyXG5cdFx0LnRoZW4odGhhdC5kaXNwYXRjaFN1Y2Nlc3MsdGhhdC5kaXNwYXRjaEVycm9yKTtcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblF1ZXJ5Q29tbWFuZD1Db21tYW5kLmV4dGVuZHMoUXVlcnlDb21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1RdWVyeUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIEN1YmU9cmVxdWlyZShcIi4vLi4vY3ViZS9DdWJlXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT0wO1xyXG5cdHZhciBudW1PcGVyYXRpb25zPTA7XHJcblx0dmFyIG9wZXJhdGlvbnM9W107XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgY3ViZT1udWxsO1xyXG5cdHZhciBzZXRDdWJlU2l6ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0Y3ViZVNpemU9bnVtO1xyXG5cdH07XHJcblx0dmFyIHNldE51bU9wZXJhdGlvbnM9ZnVuY3Rpb24obnVtKXtcclxuXHRcdG51bU9wZXJhdGlvbnM9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0dGhpcy5nZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtT3BlcmF0aW9ucztcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGNyZWF0ZUN1YmUoKXtcclxuXHRcdGN1YmU9bmV3IEN1YmUodGhhdC5nZXRDdWJlU2l6ZSgpKTtcclxuXHRcdHJldHVybiBjdWJlO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDdWJlKCl7XHJcblx0XHRyZXR1cm4gY3ViZTtcclxuXHR9XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCtcXHN7MX1cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvXFxkKy9nKTtcclxuXHRcdFx0XHR2YXIgY3ViZVNpemU9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGN1YmVTaXplPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjdWJlU2l6ZTw9Q29uZmlnLk1BWF9DVUJFX1NJWkUpe1xyXG5cdFx0XHRcdFx0aWYobnVtT3BlcmF0aW9ucz49Q29uZmlnLk1JTl9URVNUX0NBU0VTX09QRVJBVElPTlMgJiYgbnVtT3BlcmF0aW9uczw9Q29uZmlnLk1BWF9URVNUX0NBU0VTX09QRVJBVElPTlMpe1xyXG5cdFx0XHRcdFx0XHRzZXRDdWJlU2l6ZShjdWJlU2l6ZSk7XHJcblx0XHRcdFx0XHRcdHNldE51bU9wZXJhdGlvbnMobnVtT3BlcmF0aW9ucyk7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlMpO1x0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9XUk9OR19DVUJFX1NJWkUpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblx0fTtcclxuXHR0aGlzLmFkZE9wZXJhdGlvbkNvbW1hbmQ9ZnVuY3Rpb24ob3BlcmF0aW9uQ29tbWFuZCl7XHJcblx0XHRvcGVyYXRpb25zLnB1c2gob3BlcmF0aW9uQ29tbWFuZCk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGNyZWF0ZUN1YmUoKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNvdW50T3BlcmF0aW9uc0V4ZWN1dGVkPTA7XHJcblx0XHR2YXIgcmVzdWx0c1N0cmluZz1cIlwiO1xyXG5cdFx0XHJcblx0XHR2YXIgc3VjY2Vzc0NhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIlRlc3QgQ2FzZSBleGVjdXRlZFxcblxcblwiK3Jlc3VsdHNTdHJpbmcpO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcyhyZXN1bHRzU3RyaW5nKTtcclxuXHRcdH07XHJcblx0XHR2YXIgZXJyb3JDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEVycm9yKGFyZ3VtZW50cyk7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIkVycm9yIGVuIGxhIGVqZWN1Y2nDs24gZGVsIHRlc3QgY2FzZVwiKTtcclxuXHRcdH07XHJcblx0XHRmdW5jdGlvbiBvcGVyYXRpb25FeGVjdXRlZChyZXN1bHQpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0cmVzdWx0c1N0cmluZys9cmVzdWx0K1wiXFxuXCI7XHJcblx0XHRcdGV4ZWN1dGVOZXh0T3BlcmF0aW9uKCk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBleGVjdXRlTmV4dE9wZXJhdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0aWYoY291bnRPcGVyYXRpb25zRXhlY3V0ZWQ8dGhhdC5nZXROdW1PcGVyYXRpb25zKCkpe1xyXG5cdFx0XHRcdHZhciBuZXh0T3BlcmF0aW9uPW9wZXJhdGlvbnNbY291bnRPcGVyYXRpb25zRXhlY3V0ZWQrK107XHJcblx0XHRcdFx0bmV4dE9wZXJhdGlvbi5nZXRQcm9taXNlKCkudGhlbihvcGVyYXRpb25FeGVjdXRlZCwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcdFx0bmV4dE9wZXJhdGlvbi5leGVjdXRlKGdldEN1YmUoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRnZXRDdWJlKCkubG9hZCgpLnRoZW4oZXhlY3V0ZU5leHRPcGVyYXRpb24sIGVycm9yQ2FsbGJhY2spO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG5cclxufTtcclxuXHJcblRlc3RDYXNlQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVGVzdENhc2VDb21tYW5kKTtcclxubW9kdWxlLmV4cG9ydHM9VGVzdENhc2VDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgVGVzdFBsYW5Db21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBudW1UZXN0Q2FzZXM9MDtcclxuXHR2YXIgdGVzdENhc2VzPVtdO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHNldE51bVRlc3RDYXNlcz1mdW5jdGlvbihudW0pe1xyXG5cdFx0bnVtVGVzdENhc2VzPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtVGVzdENhc2VzPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtVGVzdENhc2VzO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciBudW09cGFyc2VJbnQoY21kKTtcclxuXHRcdFx0XHRpZihudW0+PUNvbmZpZy5NSU5fVEVTVFNfQ0FTRVMgJiYgbnVtPD1Db25maWcuTUFYX1RFU1RTX0NBU0VTKXtcclxuXHRcdFx0XHRcdHNldE51bVRlc3RDYXNlcyhudW0pO1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHR0aGlzLmFkZFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbih0ZXN0Q2FzZUNvbW1hbmQpe1xyXG5cdFx0dGVzdENhc2VzLnB1c2godGVzdENhc2VDb21tYW5kKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0dmFyIGNvdW50VGVzdENhc2VzRXhlY3V0ZWQ9MDtcclxuXHRcdHZhciByZXN1bHRzU3RyaW5nPVwiXCI7XHJcblx0XHRcclxuXHRcdHZhciBzdWNjZXNzQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiVGVzdCBQbGFuIGV4ZWN1dGVkXFxuXFxuXCIrcmVzdWx0c1N0cmluZyk7XHJcblx0XHRcdHRoYXQuZGlzcGF0Y2hTdWNjZXNzKHJlc3VsdHNTdHJpbmcpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBlcnJvckNhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXJyb3IoYXJndW1lbnRzKTtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiRXJyb3IgZW4gbGEgZWplY3VjacOzbiBkZWwgdGVzdCBwbGFuXCIpO1xyXG5cdFx0fTtcclxuXHRcdGZ1bmN0aW9uIHRlc3RDYXNlRXhlY3V0ZWQocmVzdWx0KXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHJlc3VsdHNTdHJpbmcrPXJlc3VsdCtcIlxcblwiO1xyXG5cdFx0XHRleGVjdXRlTmV4dFRlc3RDYXNlKCk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBleGVjdXRlTmV4dFRlc3RDYXNlKCl7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjb3VudFRlc3RDYXNlc0V4ZWN1dGVkPHRoYXQuZ2V0TnVtVGVzdENhc2VzKCkpe1xyXG5cdFx0XHRcdHZhciBuZXh0VGVzdENhc2U9dGVzdENhc2VzW2NvdW50VGVzdENhc2VzRXhlY3V0ZWQrK107XHJcblx0XHRcdFx0bmV4dFRlc3RDYXNlLmV4ZWN1dGUoKS5nZXRQcm9taXNlKCkudGhlbih0ZXN0Q2FzZUV4ZWN1dGVkLCBlcnJvckNhbGxiYWNrKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRleGVjdXRlTmV4dFRlc3RDYXNlKCk7XHJcblxyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5UZXN0UGxhbkNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9VGVzdFBsYW5Db21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgVXBkYXRlQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBfY3ViZVNpemUpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT1fY3ViZVNpemU7XHJcblx0dmFyIGNlbGxYPTA7XHJcblx0dmFyIGNlbGxZPTA7XHJcblx0dmFyIGNlbGxaPTA7XHJcblx0dmFyIHZhbHVlVG9VcGRhdGU9MDtcclxuXHR2YXIgc2V0Q3ViZUNlbGxzPWZ1bmN0aW9uKFgsWSxaKXtcclxuXHRcdGNlbGxYPVg7XHJcblx0XHRjZWxsWT1ZO1xyXG5cdFx0Y2VsbFo9WjtcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGdldENlbGxYKCl7XHJcblx0XHRyZXR1cm4gY2VsbFg7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGdldENlbGxZKCl7XHJcblx0XHRyZXR1cm4gY2VsbFk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGdldENlbGxaKCl7XHJcblx0XHRyZXR1cm4gY2VsbFo7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGdldFZhbHVlVG9UdXBkYXRlKCl7XHJcblx0XHRyZXR1cm4gdmFsdWVUb1VwZGF0ZTtcclxuXHR9XHJcblx0dmFyIHNldFZhbHVlVG9UdXBkYXRlPWZ1bmN0aW9uKG51bSl7XHJcblx0XHR2YWx1ZVRvVXBkYXRlPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHZhbGlkYXRlQ2VsbD1mdW5jdGlvbihjZWxsQ29vcmQpe1xyXG5cdFx0cmV0dXJuIGNlbGxDb29yZD49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY2VsbENvb3JkPD10aGF0LmdldEN1YmVTaXplKCk7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eVVBEQVRFXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9LT9cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvLT9cXGQrL2cpO1xyXG5cclxuXHRcdFx0XHR2YXIgY2VsbFg9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFk9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFo9cGFyc2VJbnQodmFsdWVzWzJdKTtcclxuXHRcdFx0XHR2YXIgdmFsdWVUb1VwZGF0ZT1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkpICYmIHZhbGlkYXRlQ2VsbChjZWxsWilcclxuXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWCxjZWxsWSxjZWxsWik7XHJcblxyXG5cdFx0XHRcdFx0aWYodmFsdWVUb1VwZGF0ZT49Q29uZmlnLk1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFICYmIHZhbHVlVG9VcGRhdGU8PUNvbmZpZy5NQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRSl7XHJcblx0XHRcdFx0XHRcdHNldFZhbHVlVG9UdXBkYXRlKHZhbHVlVG9VcGRhdGUpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX1dST05HX1ZBTFVFX1RPX1VQREFURSk7XHRcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX1dST05HX0NVQkVfQ0VMTFMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbihjdWJlKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0Y3ViZS51cGRhdGVDZWxsKGdldENlbGxYKCksIGdldENlbGxZKCksIGdldENlbGxaKCksIGdldFZhbHVlVG9UdXBkYXRlKCkpXHJcblx0XHQudGhlbih0aGF0LmRpc3BhdGNoU3VjY2Vzcyx0aGF0LmRpc3BhdGNoRXJyb3IpO1xyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuVXBkYXRlQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVXBkYXRlQ29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9VXBkYXRlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBkZWZlcnJlZD1qUXVlcnkuRGVmZXJyZWQoKTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmcudHJpbSgpO1xyXG5cdH07XHJcblx0dGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG5cdH07XHJcblx0dGhpcy5kaXNwYXRjaFN1Y2Nlc3M9ZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hFcnJvcj1mdW5jdGlvbihlcnJvcil7XHJcblx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbihjb21tYW5kKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH07XHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblxyXG5cdH07XHJcblxyXG59O1xyXG5Db21tYW5kLmV4dGVuZHM9ZnVuY3Rpb24oQ2hpbGQpe1xyXG5cdC8vaHR0cDovL2p1bGllbi5yaWNoYXJkLWZveS5mci9ibG9nLzIwMTEvMTAvMzAvZnVuY3Rpb25hbC1pbmhlcml0YW5jZS12cy1wcm90b3R5cGFsLWluaGVyaXRhbmNlL1xyXG5cdGZ1bmN0aW9uIEYoKSB7fVxyXG5cdEYucHJvdG90eXBlID0gQ29tbWFuZC5wcm90b3R5cGU7XHJcblx0Q2hpbGQucHJvdG90eXBlPW5ldyBGKCk7XHJcblx0Xy5leHRlbmQoQ2hpbGQucHJvdG90eXBlLENvbW1hbmQucHJvdG90eXBlKTtcclxuXHRyZXR1cm4gQ2hpbGQ7XHJcbn07XHJcbkNvbW1hbmQuVmFsaWRhdGlvbj1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBlcnJvck1zZz1cIlwiO1xyXG5cdHZhciBpc1ZhbGlkPWZhbHNlO1xyXG5cdHRoaXMuZmFpbD1mdW5jdGlvbihlcnJvck1lc3NhZ2Upe1xyXG5cdFx0ZXJyb3JNc2c9ZXJyb3JNZXNzYWdlO1xyXG5cdFx0aXNWYWxpZD1mYWxzZTtcclxuXHR9O1xyXG5cdHRoaXMuc3VjY2Vzcz1mdW5jdGlvbigpe1xyXG5cdFx0ZXJyb3JNc2c9XCJcIjtcclxuXHRcdGlzVmFsaWQ9dHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmc7XHJcblx0fTtcclxuXHR0aGlzLmdldEVycm9yTWVzc2FnZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGVycm9yTXNnO1xyXG5cdH07XHJcblx0dGhpcy5pc1ZhbGlkPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gaXNWYWxpZDtcclxuXHR9O1xyXG59O1xyXG4vKkNvbW1hbmQuVHlwZT17XHJcblx0VEVTVF9QTEFOOidURVNUX1BMQU4nLFxyXG5cdFRFU1RfQ0FTRTonVEVTVF9DQVNFJyxcclxuXHRRVUVSWTonUVVFUlknLFxyXG5cdFVQREFURTonVVBEQVRFJyxcclxufTsqL1xyXG5tb2R1bGUuZXhwb3J0cz1Db21tYW5kOyIsInZhciBDdWJlU3RvcmFnZSA9IHJlcXVpcmUoJy4uLy4uL3N0b3JhZ2UvQ3ViZVN0b3JhZ2UnKTtcclxudmFyIEN1YmU9ZnVuY3Rpb24oc2l6ZSl7XHJcblx0dmFyIGN1YmVTaXplPXNpemU7XHJcblx0dGhpcy5sb2FkPWZ1bmN0aW9uKCl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdHJldHVybiBDdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSgpXHJcblx0XHRcdC50aGVuKEN1YmVTdG9yYWdlLnJlc2V0Q3ViZSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7IEN1YmVTdG9yYWdlLnBvcHVsYXRlQ3ViZShjdWJlU2l6ZSk7fSk7XHJcblx0fTtcclxuXHR0aGlzLnVwZGF0ZUNlbGw9ZnVuY3Rpb24oeCx5LHosdmFsdWUpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRyZXR1cm4gQ3ViZVN0b3JhZ2UudXBkYXRlQ2VsbCh4LHkseix2YWx1ZSkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0cmV0dXJuIDY2NjY7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdHRoaXMuc3VtbWF0ZUNlbGxzPWZ1bmN0aW9uKHgxLCB5MSwgejEsIHgyLCB5MiwgejIpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRyZXR1cm4gQ3ViZVN0b3JhZ2Uuc3VtbWF0ZUNlbGxzKHgxLCB5MSwgejEsIHgyLCB5MiwgejIpLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHJldHVybiAzMzMzO1xyXG5cdFx0fSk7XHJcblx0fTtcclxufTtcclxubW9kdWxlLmV4cG9ydHM9Q3ViZTsiLCJ2YXIgQXBwbGljYXRpb249cmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdHZhciBhcHA9bmV3IEFwcGxpY2F0aW9uKCk7XHJcblx0YXBwLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgQ3ViZVN0b3JhZ2UgPSB7fTtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9EQiA9IFwiY3ViZV9kYlwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgPSBcImN1YmVfY2VsbFwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWCA9IFwieFwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWSA9IFwieVwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWiA9IFwielwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgPSBcImNlbGxfdmFsdWVcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1NVTSA9IFwic3VtXCI7XHJcblxyXG52YXIgREI7XHJcbnRyeSB7XHJcbiAgICBEQiA9IG9wZW5EYXRhYmFzZShDdWJlU3RvcmFnZS5DVUJFX0RCLCAnMS4wJywgJ0N1YmUgREInLCA1ICogMTAyNCAqIDEwMjQpO1xyXG59IGNhdGNoIChlKSB7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBleGVjUXVlcnkocXVlcnksIHBhcmFtcykge1xyXG5cdGRlYnVnZ2VyO1xyXG4gICAgdmFyIGRlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICBpZiAoREIgIT09IG51bGwpIHtcclxuICAgICAgICBEQi50cmFuc2FjdGlvbihmdW5jdGlvbih0eCkge1xyXG4gICAgICAgICAgICB0eC5leGVjdXRlU3FsKHF1ZXJ5LCBwYXJhbXMsIGZ1bmN0aW9uKHR4LCByZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbih0eCwgZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbn1cclxuXHJcblxyXG5DdWJlU3RvcmFnZS5jcmVhdGVUYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNxbCA9ICdDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnKCcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgTlVNRVJJQywgJztcclxuICAgIHNxbCArPSBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gXCJQUklNQVJZIEtFWSAoXCIgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcsJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJywnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnKSApOyc7XHJcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgZGVidWdnZXI7XHJcblxyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcbkN1YmVTdG9yYWdlLnJlc2V0Q3ViZSA9IGZ1bmN0aW9uKHNpemUpIHtcclxuXHR2YXIgc3FsID0gJ0RFTEVURSBGUk9NICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgZGVidWdnZXI7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxuXHJcbkN1YmVTdG9yYWdlLnBvcHVsYXRlQ3ViZSA9IGZ1bmN0aW9uKHNpemUpIHtcclxuXHR2YXIgc3FsID0gJ0lOU0VSVCBJTlRPICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnIFZBTFVFUyAnO1xyXG4gICAgdmFyIGNlbGxzID0gW107XHJcbiAgICBmb3IgKHggPSAxOyB4IDw9IHNpemU7IHgrKykge1xyXG4gICAgICAgIGZvciAoeSA9IDE7IHkgPD0gc2l6ZTsgeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAoeiA9IDE7IHogPD0gc2l6ZTsgeisrKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKCcoJytbeCx5LHosMF0uam9pbignLCcpKycpJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3FsKz1jZWxscy5qb2luKCcsICcpO1xyXG4gICAgY29uc29sZS5sb2coc3FsKTtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcblxyXG5DdWJlU3RvcmFnZS51cGRhdGVDZWxsID0gZnVuY3Rpb24oeCwgeSwgeiwgdmFsdWUpIHtcclxuICAgIFxyXG4gICAgdmFyIHNxbCA9ICdVUERBVEUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnU0VUICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUgKyAnPScgKyB2YWx1ZSArICcgJztcclxuICAgIHNxbCArPSAnV0hFUkUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA9ICcgKyB4ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA9ICcgKyB5ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA9ICcgKyB6ICsgJyAnO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHNxbCk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbiAgICBcclxufTtcclxuXHJcbkN1YmVTdG9yYWdlLmdldENlbGwgPSBmdW5jdGlvbih4LCB5LCB6KSB7XHJcbiAgICB2YXIgc3FsID0gJ1NFTEVDVCAqIEZST00gJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSArICcgJztcclxuICAgIHNxbCArPSAnV0hFUkUgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA9ICcgKyB4ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA9ICcgKyB5ICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA9ICcgKyB6ICsgJyAnO1xyXG4gICAgY29uc29sZS5sb2coc3FsKTtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcbkN1YmVTdG9yYWdlLnN1bW1hdGVDZWxscyA9IGZ1bmN0aW9uKHgxLCB5MSwgejEsIHgyLCB5MiwgejIpIHtcclxuICAgIHZhciBzcWwgPSAnU0VMRUNUIFNVTSgnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9WQUxVRSsnKSBBUyAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9TVU0rJyBGUk9NICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1dIRVJFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPj0gJyArIHgxICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YICsgJyA8PSAnICsgeDIgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnID49ICcgKyB5MSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPD0gJyArIHkyICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA+PSAnICsgejEgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnIDw9ICcgKyB6MiArICcgJztcclxuICAgIGNvbnNvbGUubG9nKHNxbCk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEN1YmVTdG9yYWdlO1xyXG4iLCJ2YXIgQ29tbWFuZHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gIGVsOiAnI21haW4tdmlldycsXHJcbiAgY29tbWFuZHNJbnB1dDpudWxsLFxyXG4gIGV4ZWN1dGlvbk91dHB1dDpudWxsLFxyXG4gIGV2ZW50czp7XHJcbiAgXHQnY2xpY2sgI2V4ZWN1dGUtYnV0dG9uJzonX29uRXhlY3V0ZUJ0bkNsaWNrJ1xyXG4gIH0sXHJcbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xyXG4gIFx0dGhpcy5jb21tYW5kc0lucHV0PXRoaXMuJCgnI2NvbW1hbmRzLXRleHQnKTtcclxuICAgIFxyXG5cclxuICAgIHZhciBkdW1teUNvbW1hbmRzPSAgXCIyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuNCA1XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAxIDEgMSAyM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDQgNCA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG4yIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDEgMSAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMiAyIDJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiAyIDIgMlwiO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQudmFsKGR1bW15Q29tbWFuZHMpO1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQ9dGhpcy4kKCcjZXhlY3V0aW9uLXJlc3VsdC10ZXh0Jyk7XHJcbiAgfSxcclxuICBfb25FeGVjdXRlQnRuQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgXHR0aGlzLl9kaXNwYXRjaEV4ZWN1dGUoKTtcclxuXHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCl7XHJcbiAgXHR0aGlzLl9zaG93UmVzdWx0cyhyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgX3Nob3dSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZyl7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwocmVzdWx0U3RyaW5nKTtcclxuICB9LFxyXG4gIGRpc3BsYXlFcnJvcjpmdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoZXhlY3V0aW9uRXJyb3IuZ2V0RXJyb3JNZXNzYWdlKCkpO1xyXG4gIH1cclxufSx7XHJcblx0RVhFQ1VUSU9OX1NUQVJURUQ6J2V4ZWN1dGlvbi1zdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
