(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommandsView=require('./views/CommandsView');
var Execution=require('./core/Execution');
var CubeStorage=require('./storage/CubeStorage');
var Application=function(){
	var mainView=null;
	var that=this;
	this.start=function(){
		mainView=new CommandsView();
		mainView.on(CommandsView.EXECUTION_STARTED, _onExectionStarted);
	};

	var _onExectionStarted=function(commandsString){
		execute(commandsString);
	};

	var execute=function(commandsString){
		CubeStorage.createTable().then(function(){
			debugger;
			console.log(arguments);
			CubeStorage.resetCube().then(function(){
				debugger;
				console.log(arguments);
				CubeStorage.populateCube(4).then(function(){
					debugger;
					console.log(arguments);
					CubeStorage.updateCell(1,1,1,2).then(function(){
						debugger;
						console.log(arguments);

						CubeStorage.updateCell(1,2,1,2).then(function(){
							debugger;
							console.log(arguments);

							CubeStorage.getCell(1,1,1).then(function(){
								debugger;
								AAA=arguments;
								CubeStorage.summateCells(1,1,1,4,4,4).then(function(){
									debugger;
									BBB=arguments;
									console.log(arguments);
								},function(){
									console.warn(arguments);
								});
								console.log(arguments);
							},function(){
								console.warn(arguments);
							});
						},function(){
							console.warn(arguments);
						});
					},function(){
						console.warn(arguments);
					});
				},function(){
					console.warn(arguments);
				});
			},function(){
				console.warn(arguments);
			});
		},function(){
			console.warn(arguments);
		});
		//var execution=new Execution(commandsString);
		//execution.getPromise().then(_onExecutionSuccess,_onExecutionError);
	};

	var _onExecutionSuccess=function(executionResult){
		console.log("resultado fue", executionResult);
		showResults(executionResult);
	};

	var _onExecutionError=function(executionError){
		console.log("resultado con error fue", executionError);
		showError(executionError);
	};

	var showResults=function(executionResult){
		var resultString=executionResult.getValue();
		var timeElapsed=executionResult.getTimeElapsed();
		mainView.displayResults(resultString, timeElapsed);
	};

	var showError=function(executionError){
		mainView.displayError(executionError);
	};

};
module.exports=Application;
},{"./core/Execution":4,"./storage/CubeStorage":12,"./views/CommandsView":13}],2:[function(require,module,exports){
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
        testPlanCommand.execute().getPromise().done(function(){
            console.log("Ejecucion completada");
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
		console.log('Query Executed '+that.getCommandString());
		that.dispatchSuccess('Query OK '+that.getCommandString());
		return that;
	};
};
QueryCommand=Command.extends(QueryCommand);


module.exports=QueryCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./TestCaseCommand":7,"./base/Command":10}],7:[function(require,module,exports){
var Command=require("./base/Command");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");

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
		executeNextOperation();

		
		return that;
	};

};

TestCaseCommand=Command.extends(TestCaseCommand);
module.exports=TestCaseCommand;
},{"./../../config/Config":2,"./../../config/ErrorMessage":3,"./base/Command":10}],8:[function(require,module,exports){
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

	this.execute=function(){
		debugger;
		console.log('Update Executed '+that.getCommandString());
		that.dispatchSuccess('Update OK '+that.getCommandString());
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
var Application=require('./Application');

$(function(){
	var app=new Application();
	app.start();
});

},{"./Application":1}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zdG9yYWdlL0N1YmVTdG9yYWdlLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29tbWFuZHNWaWV3PXJlcXVpcmUoJy4vdmlld3MvQ29tbWFuZHNWaWV3Jyk7XHJcbnZhciBFeGVjdXRpb249cmVxdWlyZSgnLi9jb3JlL0V4ZWN1dGlvbicpO1xyXG52YXIgQ3ViZVN0b3JhZ2U9cmVxdWlyZSgnLi9zdG9yYWdlL0N1YmVTdG9yYWdlJyk7XHJcbnZhciBBcHBsaWNhdGlvbj1mdW5jdGlvbigpe1xyXG5cdHZhciBtYWluVmlldz1udWxsO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dGhpcy5zdGFydD1mdW5jdGlvbigpe1xyXG5cdFx0bWFpblZpZXc9bmV3IENvbW1hbmRzVmlldygpO1xyXG5cdFx0bWFpblZpZXcub24oQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBfb25FeGVjdGlvblN0YXJ0ZWQpO1xyXG5cdH07XHJcblxyXG5cdHZhciBfb25FeGVjdGlvblN0YXJ0ZWQ9ZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpe1xyXG5cdFx0ZXhlY3V0ZShjb21tYW5kc1N0cmluZyk7XHJcblx0fTtcclxuXHJcblx0dmFyIGV4ZWN1dGU9ZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpe1xyXG5cdFx0Q3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG5cdFx0XHRDdWJlU3RvcmFnZS5yZXNldEN1YmUoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coYXJndW1lbnRzKTtcclxuXHRcdFx0XHRDdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUoNCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG5cdFx0XHRcdFx0Q3ViZVN0b3JhZ2UudXBkYXRlQ2VsbCgxLDEsMSwyKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG5cclxuXHRcdFx0XHRcdFx0Q3ViZVN0b3JhZ2UudXBkYXRlQ2VsbCgxLDIsMSwyKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYXJndW1lbnRzKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Q3ViZVN0b3JhZ2UuZ2V0Q2VsbCgxLDEsMSkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdFx0XHRcdFx0XHRBQUE9YXJndW1lbnRzO1xyXG5cdFx0XHRcdFx0XHRcdFx0Q3ViZVN0b3JhZ2Uuc3VtbWF0ZUNlbGxzKDEsMSwxLDQsNCw0KS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRCQkI9YXJndW1lbnRzO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYXJndW1lbnRzKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYXJndW1lbnRzKTtcclxuXHRcdFx0XHRcdFx0XHR9LGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYXJndW1lbnRzKTtcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2Fybihhcmd1bWVudHMpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0sZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGFyZ3VtZW50cyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9LGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYXJndW1lbnRzKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGNvbnNvbGUud2Fybihhcmd1bWVudHMpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sZnVuY3Rpb24oKXtcclxuXHRcdFx0Y29uc29sZS53YXJuKGFyZ3VtZW50cyk7XHJcblx0XHR9KTtcclxuXHRcdC8vdmFyIGV4ZWN1dGlvbj1uZXcgRXhlY3V0aW9uKGNvbW1hbmRzU3RyaW5nKTtcclxuXHRcdC8vZXhlY3V0aW9uLmdldFByb21pc2UoKS50aGVuKF9vbkV4ZWN1dGlvblN1Y2Nlc3MsX29uRXhlY3V0aW9uRXJyb3IpO1xyXG5cdH07XHJcblxyXG5cdHZhciBfb25FeGVjdXRpb25TdWNjZXNzPWZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCl7XHJcblx0XHRjb25zb2xlLmxvZyhcInJlc3VsdGFkbyBmdWVcIiwgZXhlY3V0aW9uUmVzdWx0KTtcclxuXHRcdHNob3dSZXN1bHRzKGV4ZWN1dGlvblJlc3VsdCk7XHJcblx0fTtcclxuXHJcblx0dmFyIF9vbkV4ZWN1dGlvbkVycm9yPWZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuXHRcdGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGNvbiBlcnJvciBmdWVcIiwgZXhlY3V0aW9uRXJyb3IpO1xyXG5cdFx0c2hvd0Vycm9yKGV4ZWN1dGlvbkVycm9yKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc2hvd1Jlc3VsdHM9ZnVuY3Rpb24oZXhlY3V0aW9uUmVzdWx0KXtcclxuXHRcdHZhciByZXN1bHRTdHJpbmc9ZXhlY3V0aW9uUmVzdWx0LmdldFZhbHVlKCk7XHJcblx0XHR2YXIgdGltZUVsYXBzZWQ9ZXhlY3V0aW9uUmVzdWx0LmdldFRpbWVFbGFwc2VkKCk7XHJcblx0XHRtYWluVmlldy5kaXNwbGF5UmVzdWx0cyhyZXN1bHRTdHJpbmcsIHRpbWVFbGFwc2VkKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc2hvd0Vycm9yPWZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuXHRcdG1haW5WaWV3LmRpc3BsYXlFcnJvcihleGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPUFwcGxpY2F0aW9uOyIsInZhciBDb25maWc9e1xyXG5cdE1JTl9URVNUU19DQVNFUzoxLFxyXG5cdE1BWF9URVNUU19DQVNFUzo1MCxcclxuXHRNSU5fQ1VCRV9TSVpFOjEsXHJcblx0TUFYX0NVQkVfU0laRToxMDAsXHJcblx0TUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxLFxyXG5cdE1BWF9URVNUX0NBU0VTX09QRVJBVElPTlM6MTAwMCxcclxuXHRNSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRTotTWF0aC5wb3coMTAsOSksXHJcblx0TUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6TWF0aC5wb3coMTAsOSksXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cz1Db25maWc7IiwidmFyIENvbmZpZz1yZXF1aXJlKCcuL0NvbmZpZycpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXtcclxuXHROT19DT01NQU5EU1x0XHRcdFx0XHRcdDpcIk5vIGhheSBjb21hbmRvcyBwYXJhIGVqZWN1dGFyXCIsXHJcblx0RU1QVFlfQ09NTUFORFx0XHRcdFx0XHQ6XCJDb21hbmRvIGVzdGEgdmFjaW9cIixcclxuXHRURVNUX1BMQU5fQ09NTUFORF9TSU5UQVhcdFx0OlwiRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gZGViZSBjb250ZW5lciB1biBuw7ptZXJvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfV1JPTkdfVkFMVUVTXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVybyAodGVzdCBjYXNlcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUU19DQVNFUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVFNfQ0FTRVMsXHJcblx0VEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGRvcyBuw7ptZXJvcyBzZXBhcmFkb3MgcG9yIHVuIGVzcGFjaW9cIixcclxuXHRURVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFXHRcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgcHJpbWVyIG51bWVybyAodGFtYcOxbyBkZWwgY3VibykgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX1NJWkUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfU0laRSxcclxuXHRURVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlNcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgc2VndW5kbyBudW1lcm8gKG9wZXJhY2lvbmVzKSBlbnRyZSBcIitDb25maWcuTUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TLFxyXG5cdE9QRVJBVElPTl9VTktOT1dOXHRcdFx0XHQ6XCJPcGVyYWNpw7NuIGRlc2Nvbm9jaWRhXCIsXHJcblx0VVBEQVRFX0NPTU1BTkRfU0lOVEFYXHRcdFx0OidFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBzZXIgc2ltaWxhciBhIFwiVVBEQVRFIDIgMiAyIDRcIiAoUmV2aXNhciBlc3BhY2lvcyknLFxyXG5cdFVQREFURV9XUk9OR19DVUJFX0NFTExTXHRcdCAgICA6J0Vycm9yIGRlIFZhbG9yZXMsIGxhcyBjb3JkZW5hZGFzIGRlIGxhIGNlbGRhIGRlbCBjdWJvIHNvbiBpbnZhbGlkYXMnLFxyXG5cdFVQREFURV9XUk9OR19WQUxVRV9UT19VUERBVEVcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIHZhbG9yIGEgYWN0dWFsaXphciBlbnRyZSBcIitDb25maWcuTUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUsXHJcblx0UVVFUllfQ09NTUFORF9TSU5UQVhcdFx0XHQ6J0Vycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIHNlciBzaW1pbGFyIGEgXCJRVUVSWSAxIDEgMSAzIDMgM1wiIChSZXZpc2FyIGVzcGFjaW9zKScsXHJcblx0UVVFUllfV1JPTkdfQ1VCRV9DRUxMU1x0XHQgICAgOidFcnJvciBkZSBWYWxvcmVzLCBsYXMgY29yZGVuYWRhcyBkZSBsYXMgY2VsZGFzIGRlbCBjdWJvIHNvbiBpbnZhbGlkYXMnLFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1FcnJvck1lc3NhZ2U7IiwidmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKCcuLi9jb25maWcvRXJyb3JNZXNzYWdlJyk7XHJcbnZhciBDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQnKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kJyk7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZCcpO1xyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvT3BlcmF0aW9uQ29tbWFuZCcpO1xyXG52YXIgRXhlY3V0aW9uID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgIHZhciBleGVjRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgIHZhciBleGVjdXRpb25FcnJvckRpc3BhdGhlZD1mYWxzZTtcclxuICAgIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIGZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyl7XHJcbiAgICBcdGlmKCFjb21tYW5kc1N0cmluZyB8fCBjb21tYW5kc1N0cmluZz09PScnKXtcclxuICAgIFx0XHRkaXNwYXRjaEVycm9yKCcnLCBFcnJvck1lc3NhZ2UuTk9fQ09NTUFORFMsMCk7XHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHR9XHJcbiAgICBcdHJldHVybiBjb21tYW5kc1N0cmluZy5zcGxpdCgnXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZHMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRcclxuICAgIFx0dmFyIGxpbmVzPWV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBcdHZhciBudW1MaW5lcz1saW5lcyAmJiBsaW5lcy5sZW5ndGg7XHJcbiAgICBcdGlmKCFsaW5lcyB8fCFudW1MaW5lcylcclxuICAgIFx0XHRyZXR1cm47XHJcbiAgICBcdFxyXG4gICAgXHQvL3ZhciBjb21tYW5kcz1bXTtcclxuICAgIFx0XHJcblxyXG4gICAgXHR2YXIgY3VyTGluZU51bWJlcj0wO1xyXG4gICAgXHRcclxuICAgIFx0ZnVuY3Rpb24gZ2V0TmV4dExpbmUoKXtcclxuICAgIFx0XHRpZihjdXJMaW5lTnVtYmVyKzE8PW51bUxpbmVzKVxyXG4gICAgXHRcdFx0Y3VyTGluZU51bWJlcisrO1xyXG4gICAgXHRcdHJldHVybiBsaW5lc1tjdXJMaW5lTnVtYmVyLTFdO1xyXG4gICAgXHR9XHJcblxyXG5cclxuICAgIFx0Ly9tYWtlIFRlc3RQbGFuIGNvbW1hbmRcclxuICAgIFx0dmFyIHRlc3RQbGFuQ29tbWFuZD1uZXcgVGVzdFBsYW5Db21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG4gICAgXHR2YXIgdmFsaWRhdGlvblRlc3RQbGFuPXRlc3RQbGFuQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG4gICAgXHRpZih2YWxpZGF0aW9uVGVzdFBsYW4uaXNWYWxpZCgpKXtcclxuXHJcbiAgICBcdFx0Ly9jb21tYW5kcy5wdXNoKHRlc3RQbGFuQ29tbWFuZCk7XHJcbiAgICBcdFx0dmFyIG51bVRlc3RDYXNlcz10ZXN0UGxhbkNvbW1hbmQuZ2V0TnVtVGVzdENhc2VzKCk7XHJcblxyXG4gICAgXHRcdGNyZWF0aW9uVGVzdENhc2VzOntcclxuXHQgICAgXHRcdGZvcih2YXIgaT0xO2k8PW51bVRlc3RDYXNlcztpKyspe1xyXG5cdCAgICBcdFx0XHR2YXIgdGVzdENhc2VDb21tYW5kPW5ldyBUZXN0Q2FzZUNvbW1hbmQoZ2V0TmV4dExpbmUoKSk7XHJcblx0ICAgIFx0XHRcdHZhciB2YWxpZGF0aW9uVGVzdENhc2U9dGVzdENhc2VDb21tYW5kLnZhbGlkYXRlKCk7XHJcblx0ICAgIFx0XHRcdGlmKHZhbGlkYXRpb25UZXN0Q2FzZS5pc1ZhbGlkKCkpe1xyXG5cdCAgICBcdFx0XHRcdFxyXG5cdCAgICBcdFx0XHRcdHRlc3RQbGFuQ29tbWFuZC5hZGRUZXN0Q2FzZUNvbW1hbmQodGVzdENhc2VDb21tYW5kKTtcclxuXHQgICAgXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz10ZXN0Q2FzZUNvbW1hbmQuZ2V0TnVtT3BlcmF0aW9ucygpO1xyXG5cdCAgICBcdFx0XHRcdHZhciBjdWJlU2l6ZT10ZXN0Q2FzZUNvbW1hbmQuZ2V0Q3ViZVNpemUoKTtcclxuXHQgICAgXHRcdFx0XHRjcmVhdGlvbk9wZXJhdGlvbnM6e1xyXG5cdFx0ICAgIFx0XHRcdFx0Zm9yKHZhciBqPTE7ajw9bnVtT3BlcmF0aW9ucztqKyspe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHR2YXIgb3BlcmF0aW9uQ29tbWFuZD1uZXcgT3BlcmF0aW9uQ29tbWFuZChnZXROZXh0TGluZSgpLCBjdWJlU2l6ZSk7XHRcclxuXHRcdCAgICBcdFx0XHRcdFx0dmFyIHZhbGlkYXRpb25PcGVyYXRpb249b3BlcmF0aW9uQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRpZih2YWxpZGF0aW9uT3BlcmF0aW9uLmlzVmFsaWQoKSl7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0dGVzdENhc2VDb21tYW5kLmFkZE9wZXJhdGlvbkNvbW1hbmQob3BlcmF0aW9uQ29tbWFuZCk7XHJcblx0XHQgICAgXHRcdFx0XHRcdH1cclxuXHRcdCAgICBcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uT3BlcmF0aW9uLGN1ckxpbmVOdW1iZXIpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdFxyXG5cdFx0ICAgIFx0XHRcdFx0XHR9XHJcblx0XHQgICAgXHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgXHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdFx0ZWxzZXtcclxuXHQgICAgXHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uVGVzdENhc2UsY3VyTGluZU51bWJlcik7XHJcblx0ICAgIFx0XHRcdFx0YnJlYWsgY3JlYXRpb25UZXN0Q2FzZXM7XHJcblx0ICAgIFx0XHRcdH1cclxuXHQgICAgXHRcdH1cclxuICAgIFx0XHR9XHJcbiAgICAgICAgICAgIFxyXG4gICAgXHR9XHJcbiAgICBcdGVsc2V7XHJcbiAgICBcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RQbGFuLGN1ckxpbmVOdW1iZXIpO1xyXG4gICAgXHR9XHJcblxyXG4gICAgICAgIGlmKCFleGVjdXRpb25FcnJvckRpc3BhdGhlZClcclxuICAgICAgICAgICAgZXhlY3V0ZUNvbW1hbmRzKHRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxuXHJcblx0ICAgIC8qXy5lYWNoKGxpbmVzLCBmdW5jdGlvbihsaW5lLCBpbmRleCl7XHJcblx0ICAgIFx0Y29uc29sZS5sb2coaW5kZXgsIGxpbmUpO1xyXG5cdCAgICB9KTsqL1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBleGVjdXRlQ29tbWFuZHModGVzdFBsYW5Db21tYW5kKXtcclxuICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB0ZXN0UGxhbkNvbW1hbmQuZXhlY3V0ZSgpLmdldFByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRWplY3VjaW9uIGNvbXBsZXRhZGFcIik7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbiwgbGluZSApe1xyXG4gICAgICAgIGV4ZWN1dGlvbkVycm9yRGlzcGF0aGVkPXRydWU7XHJcbiAgICBcdGRpc3BhdGNoRXJyb3IoXHJcbiAgICBcdFx0dmFsaWRhdGlvbi5nZXRDb21tYW5kU3RyaW5nKCksIFxyXG4gICAgXHRcdHZhbGlkYXRpb24uZ2V0RXJyb3JNZXNzYWdlKCksIFxyXG4gICAgXHRcdGxpbmUgXHJcbiAgICBcdCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaEVycm9yKGNvbW1hbmRTdHIsIGVycm9yTXNnLCBsaW5lICl7XHJcbiAgICBcdHZhciBlcnJvcj1uZXcgRXhlY3V0aW9uLkVycm9yKFxyXG4gICAgXHRcdGNvbW1hbmRTdHIsIFxyXG4gICAgXHRcdGVycm9yTXNnLCBcclxuICAgIFx0XHRsaW5lIFxyXG4gICAgXHQpO1xyXG4gICAgXHRleGVjRGVmZXJyZWQucmVqZWN0KGVycm9yKTtcdFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2V0UHJvbWlzZT1mdW5jdGlvbigpe1xyXG4gICAgXHRyZXR1cm4gZXhlY0RlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH07XHJcbiAgICBcclxufTtcclxuRXhlY3V0aW9uLlJlc3VsdCA9IGZ1bmN0aW9uKHZhbHVlLCB0aW1lRWxhcHNlZCwgZXhlY3V0aW9uKSB7XHJcbiAgICB2YXIgbVZhbHVlID0gdmFsdWU7XHJcbiAgICB2YXIgbVRpbWVFbGFwc2VkID0gdGltZUVsYXBzZWQ7XHJcbiAgICB0aGlzLmdldFZhbHVlPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1WYWx1ZTtcclxuICAgIH07XHJcbiAgICB0aGlzLmdldFRpbWVFbGFwc2VkPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1UaW1lRWxhcHNlZDtcclxuICAgIH07XHJcbn07XHJcbkV4ZWN1dGlvbi5FcnJvciA9IGZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIGVycm9yTWVzc2FnZSwgY29tbWFuZExpbmUpIHtcclxuXHR2YXIgbUNvbW1hbmRTdHJpbmcgPSBjb21tYW5kU3RyaW5nO1xyXG4gICAgdmFyIG1FcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XHJcbiAgICB2YXIgbUNvbW1hbmRMaW5lID0gY29tbWFuZExpbmU7XHJcbiAgICB0aGlzLmdldENvbW1hbmRTdHJpbmc9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUNvbW1hbmRTdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nZXRFcnJvck1lc3NhZ2U9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUVycm9yTWVzc2FnZTtcclxuICAgIH07XHRcclxuICAgIHRoaXMuZ2V0Q29tbWFuZExpbmU9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUNvbW1hbmRMaW5lO1xyXG4gICAgfTtcdFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IEV4ZWN1dGlvbjtcclxuIiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFF1ZXJ5Q29tbWFuZD1yZXF1aXJlKFwiLi9RdWVyeUNvbW1hbmRcIik7XHJcbnZhciBVcGRhdGVDb21tYW5kPXJlcXVpcmUoXCIuL1VwZGF0ZUNvbW1hbmRcIik7XHJcblxyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBjdWJlU2l6ZSl7XHJcblx0aWYoL15RVUVSWS8udGVzdChjb21tYW5kU3RyaW5nKSl7XHJcblx0XHRyZXR1cm4gbmV3IFF1ZXJ5Q29tbWFuZChjb21tYW5kU3RyaW5nLGN1YmVTaXplKTtcclxuXHR9XHJcblx0ZWxzZSBpZigvXlVQREFURS8udGVzdChjb21tYW5kU3RyaW5nKSl7XHJcblx0XHRyZXR1cm4gbmV3IFVwZGF0ZUNvbW1hbmQoY29tbWFuZFN0cmluZyxjdWJlU2l6ZSk7XHJcblx0fVxyXG5cdFxyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5PUEVSQVRJT05fVU5LTk9XTik7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0XHRcclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cdH07XHJcblxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1PcGVyYXRpb25Db21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgUXVlcnlDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIF9jdWJlU2l6ZSl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIGN1YmVTaXplPV9jdWJlU2l6ZTtcclxuXHR2YXIgY2VsbFgxPTAsY2VsbFgyPTAsY2VsbFkxPTAsY2VsbFkyPTAsY2VsbFoxPTAsY2VsbFoyPTA7XHJcblx0dmFyIHNldEN1YmVDZWxscz1mdW5jdGlvbihYMSxYMixZMSxZMixaMSxaMil7XHJcblx0XHRjZWxsWDE9WDE7XHJcblx0XHRjZWxsWDI9WDI7XHJcblx0XHRjZWxsWTE9WTE7XHJcblx0XHRjZWxsWTI9WTI7XHJcblx0XHRjZWxsWjE9WjE7XHJcblx0XHRjZWxsWjI9WjI7XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciB2YWxpZGF0ZUNlbGw9ZnVuY3Rpb24oY2VsbENvb3JkKXtcclxuXHRcdHJldHVybiBjZWxsQ29vcmQ+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGNlbGxDb29yZDw9dGhhdC5nZXRDdWJlU2l6ZSgpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlFVRVJZXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvLT9cXGQrL2cpO1xyXG5cclxuXHRcdFx0XHR2YXIgY2VsbFgxPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMT1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWjE9cGFyc2VJbnQodmFsdWVzWzJdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFgyPXBhcnNlSW50KHZhbHVlc1szXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMj1wYXJzZUludCh2YWx1ZXNbNF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWjI9cGFyc2VJbnQodmFsdWVzWzVdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWDEpICYmIHZhbGlkYXRlQ2VsbChjZWxsWTEpICYmIHZhbGlkYXRlQ2VsbChjZWxsWjEpICYmXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgyKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkyKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFoyKSAmJlxyXG5cdFx0XHRcdFx0Y2VsbFgxPD1jZWxsWDIgJiYgY2VsbFkxPD1jZWxsWTIgJiYgY2VsbFoxPD1jZWxsWjJcclxuXHRcdFx0XHRcdCl7XHJcblxyXG5cdFx0XHRcdFx0c2V0Q3ViZUNlbGxzKGNlbGxYMSxjZWxsWDIsY2VsbFkxLGNlbGxZMixjZWxsWjEsY2VsbFoyKTtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5RVUVSWV9XUk9OR19DVUJFX0NFTExTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuUVVFUllfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbihjdWJlKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0Y29uc29sZS5sb2coJ1F1ZXJ5IEV4ZWN1dGVkICcrdGhhdC5nZXRDb21tYW5kU3RyaW5nKCkpO1xyXG5cdFx0dGhhdC5kaXNwYXRjaFN1Y2Nlc3MoJ1F1ZXJ5IE9LICcrdGhhdC5nZXRDb21tYW5kU3RyaW5nKCkpO1xyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuUXVlcnlDb21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhRdWVyeUNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVF1ZXJ5Q29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG5cclxudmFyIFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9MDtcclxuXHR2YXIgbnVtT3BlcmF0aW9ucz0wO1xyXG5cdHZhciBvcGVyYXRpb25zPVtdO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIGN1YmU9bnVsbDtcclxuXHR2YXIgc2V0Q3ViZVNpemU9ZnVuY3Rpb24obnVtKXtcclxuXHRcdGN1YmVTaXplPW51bTtcclxuXHR9O1xyXG5cdHZhciBzZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRudW1PcGVyYXRpb25zPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtT3BlcmF0aW9ucz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bU9wZXJhdGlvbnM7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBnZXRDdWJlKCl7XHJcblx0XHRyZXR1cm4gY3ViZTtcclxuXHR9XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCtcXHN7MX1cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvXFxkKy9nKTtcclxuXHRcdFx0XHR2YXIgY3ViZVNpemU9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGN1YmVTaXplPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjdWJlU2l6ZTw9Q29uZmlnLk1BWF9DVUJFX1NJWkUpe1xyXG5cdFx0XHRcdFx0aWYobnVtT3BlcmF0aW9ucz49Q29uZmlnLk1JTl9URVNUX0NBU0VTX09QRVJBVElPTlMgJiYgbnVtT3BlcmF0aW9uczw9Q29uZmlnLk1BWF9URVNUX0NBU0VTX09QRVJBVElPTlMpe1xyXG5cdFx0XHRcdFx0XHRzZXRDdWJlU2l6ZShjdWJlU2l6ZSk7XHJcblx0XHRcdFx0XHRcdHNldE51bU9wZXJhdGlvbnMobnVtT3BlcmF0aW9ucyk7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlMpO1x0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9XUk9OR19DVUJFX1NJWkUpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblx0fTtcclxuXHR0aGlzLmFkZE9wZXJhdGlvbkNvbW1hbmQ9ZnVuY3Rpb24ob3BlcmF0aW9uQ29tbWFuZCl7XHJcblx0XHRvcGVyYXRpb25zLnB1c2gob3BlcmF0aW9uQ29tbWFuZCk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdHZhciBjb3VudE9wZXJhdGlvbnNFeGVjdXRlZD0wO1xyXG5cdFx0dmFyIHJlc3VsdHNTdHJpbmc9XCJcIjtcclxuXHRcdFxyXG5cdFx0dmFyIHN1Y2Nlc3NDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJUZXN0IENhc2UgZXhlY3V0ZWRcXG5cXG5cIityZXN1bHRzU3RyaW5nKTtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaFN1Y2Nlc3MocmVzdWx0c1N0cmluZyk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGVycm9yQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFcnJvcihhcmd1bWVudHMpO1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJFcnJvciBlbiBsYSBlamVjdWNpw7NuIGRlbCB0ZXN0IGNhc2VcIik7XHJcblx0XHR9O1xyXG5cdFx0ZnVuY3Rpb24gb3BlcmF0aW9uRXhlY3V0ZWQocmVzdWx0KXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHJlc3VsdHNTdHJpbmcrPXJlc3VsdCtcIlxcblwiO1xyXG5cdFx0XHRleGVjdXRlTmV4dE9wZXJhdGlvbigpO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gZXhlY3V0ZU5leHRPcGVyYXRpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdGlmKGNvdW50T3BlcmF0aW9uc0V4ZWN1dGVkPHRoYXQuZ2V0TnVtT3BlcmF0aW9ucygpKXtcclxuXHRcdFx0XHR2YXIgbmV4dE9wZXJhdGlvbj1vcGVyYXRpb25zW2NvdW50T3BlcmF0aW9uc0V4ZWN1dGVkKytdO1xyXG5cdFx0XHRcdG5leHRPcGVyYXRpb24uZ2V0UHJvbWlzZSgpLnRoZW4ob3BlcmF0aW9uRXhlY3V0ZWQsIGVycm9yQ2FsbGJhY2spO1xyXG5cdFx0XHRcdG5leHRPcGVyYXRpb24uZXhlY3V0ZShnZXRDdWJlKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0c3VjY2Vzc0NhbGxiYWNrKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGV4ZWN1dGVOZXh0T3BlcmF0aW9uKCk7XHJcblxyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG5cclxufTtcclxuXHJcblRlc3RDYXNlQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVGVzdENhc2VDb21tYW5kKTtcclxubW9kdWxlLmV4cG9ydHM9VGVzdENhc2VDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgVGVzdFBsYW5Db21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBudW1UZXN0Q2FzZXM9MDtcclxuXHR2YXIgdGVzdENhc2VzPVtdO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHNldE51bVRlc3RDYXNlcz1mdW5jdGlvbihudW0pe1xyXG5cdFx0bnVtVGVzdENhc2VzPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtVGVzdENhc2VzPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtVGVzdENhc2VzO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciBudW09cGFyc2VJbnQoY21kKTtcclxuXHRcdFx0XHRpZihudW0+PUNvbmZpZy5NSU5fVEVTVFNfQ0FTRVMgJiYgbnVtPD1Db25maWcuTUFYX1RFU1RTX0NBU0VTKXtcclxuXHRcdFx0XHRcdHNldE51bVRlc3RDYXNlcyhudW0pO1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHR0aGlzLmFkZFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbih0ZXN0Q2FzZUNvbW1hbmQpe1xyXG5cdFx0dGVzdENhc2VzLnB1c2godGVzdENhc2VDb21tYW5kKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0dmFyIGNvdW50VGVzdENhc2VzRXhlY3V0ZWQ9MDtcclxuXHRcdHZhciByZXN1bHRzU3RyaW5nPVwiXCI7XHJcblx0XHRcclxuXHRcdHZhciBzdWNjZXNzQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiVGVzdCBQbGFuIGV4ZWN1dGVkXFxuXFxuXCIrcmVzdWx0c1N0cmluZyk7XHJcblx0XHRcdHRoYXQuZGlzcGF0Y2hTdWNjZXNzKHJlc3VsdHNTdHJpbmcpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBlcnJvckNhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXJyb3IoYXJndW1lbnRzKTtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiRXJyb3IgZW4gbGEgZWplY3VjacOzbiBkZWwgdGVzdCBwbGFuXCIpO1xyXG5cdFx0fTtcclxuXHRcdGZ1bmN0aW9uIHRlc3RDYXNlRXhlY3V0ZWQocmVzdWx0KXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHJlc3VsdHNTdHJpbmcrPXJlc3VsdCtcIlxcblwiO1xyXG5cdFx0XHRleGVjdXRlTmV4dFRlc3RDYXNlKCk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBleGVjdXRlTmV4dFRlc3RDYXNlKCl7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjb3VudFRlc3RDYXNlc0V4ZWN1dGVkPHRoYXQuZ2V0TnVtVGVzdENhc2VzKCkpe1xyXG5cdFx0XHRcdHZhciBuZXh0VGVzdENhc2U9dGVzdENhc2VzW2NvdW50VGVzdENhc2VzRXhlY3V0ZWQrK107XHJcblx0XHRcdFx0bmV4dFRlc3RDYXNlLmV4ZWN1dGUoKS5nZXRQcm9taXNlKCkudGhlbih0ZXN0Q2FzZUV4ZWN1dGVkLCBlcnJvckNhbGxiYWNrKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRleGVjdXRlTmV4dFRlc3RDYXNlKCk7XHJcblxyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5UZXN0UGxhbkNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9VGVzdFBsYW5Db21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgVXBkYXRlQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBfY3ViZVNpemUpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT1fY3ViZVNpemU7XHJcblx0dmFyIGNlbGxYPTA7XHJcblx0dmFyIGNlbGxZPTA7XHJcblx0dmFyIGNlbGxaPTA7XHJcblx0dmFyIHZhbHVlVG9VcGRhdGU9MDtcclxuXHR2YXIgc2V0Q3ViZUNlbGxzPWZ1bmN0aW9uKFgsWSxaKXtcclxuXHRcdGNlbGxYPVg7XHJcblx0XHRjZWxsWT1ZO1xyXG5cdFx0Y2VsbFo9WjtcclxuXHR9O1xyXG5cdHZhciBzZXRWYWx1ZVRvVHVwZGF0ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0dmFsdWVUb1VwZGF0ZT1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciB2YWxpZGF0ZUNlbGw9ZnVuY3Rpb24oY2VsbENvb3JkKXtcclxuXHRcdHJldHVybiBjZWxsQ29vcmQ+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGNlbGxDb29yZDw9dGhhdC5nZXRDdWJlU2l6ZSgpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlVQREFURVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfS0/XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxaPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIHZhbHVlVG9VcGRhdGU9cGFyc2VJbnQodmFsdWVzWzNdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWCkgJiYgdmFsaWRhdGVDZWxsKGNlbGxZKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFopXHJcblxyXG5cdFx0XHRcdFx0KXtcclxuXHJcblx0XHRcdFx0XHRzZXRDdWJlQ2VsbHMoY2VsbFgsY2VsbFksY2VsbFopO1xyXG5cclxuXHRcdFx0XHRcdGlmKHZhbHVlVG9VcGRhdGU+PUNvbmZpZy5NSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRSAmJiB2YWx1ZVRvVXBkYXRlPD1Db25maWcuTUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUpe1xyXG5cdFx0XHRcdFx0XHRzZXRWYWx1ZVRvVHVwZGF0ZSh2YWx1ZVRvVXBkYXRlKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9XUk9OR19WQUxVRV9UT19VUERBVEUpO1x0XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9XUk9OR19DVUJFX0NFTExTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0Y29uc29sZS5sb2coJ1VwZGF0ZSBFeGVjdXRlZCAnK3RoYXQuZ2V0Q29tbWFuZFN0cmluZygpKTtcclxuXHRcdHRoYXQuZGlzcGF0Y2hTdWNjZXNzKCdVcGRhdGUgT0sgJyt0aGF0LmdldENvbW1hbmRTdHJpbmcoKSk7XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5VcGRhdGVDb21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhVcGRhdGVDb21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1VcGRhdGVDb21tYW5kOyIsInZhciBDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmQpe1xyXG5cdHZhciBjb21tYW5kU3RyaW5nPWNvbW1hbmQ7XHJcblx0dmFyIGRlZmVycmVkPWpRdWVyeS5EZWZlcnJlZCgpO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dGhpcy5nZXRDb21tYW5kU3RyaW5nPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY29tbWFuZFN0cmluZy50cmltKCk7XHJcblx0fTtcclxuXHR0aGlzLmdldFByb21pc2U9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcblx0fTtcclxuXHR0aGlzLmRpc3BhdGNoU3VjY2Vzcz1mdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cdH07XHJcblx0dGhpcy5kaXNwYXRjaEVycm9yPWZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKGNvbW1hbmQpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fTtcclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHJcblx0fTtcclxuXHJcbn07XHJcbkNvbW1hbmQuZXh0ZW5kcz1mdW5jdGlvbihDaGlsZCl7XHJcblx0Ly9odHRwOi8vanVsaWVuLnJpY2hhcmQtZm95LmZyL2Jsb2cvMjAxMS8xMC8zMC9mdW5jdGlvbmFsLWluaGVyaXRhbmNlLXZzLXByb3RvdHlwYWwtaW5oZXJpdGFuY2UvXHJcblx0ZnVuY3Rpb24gRigpIHt9XHJcblx0Ri5wcm90b3R5cGUgPSBDb21tYW5kLnByb3RvdHlwZTtcclxuXHRDaGlsZC5wcm90b3R5cGU9bmV3IEYoKTtcclxuXHRfLmV4dGVuZChDaGlsZC5wcm90b3R5cGUsQ29tbWFuZC5wcm90b3R5cGUpO1xyXG5cdHJldHVybiBDaGlsZDtcclxufTtcclxuQ29tbWFuZC5WYWxpZGF0aW9uPWZ1bmN0aW9uKGNvbW1hbmQpe1xyXG5cdHZhciBjb21tYW5kU3RyaW5nPWNvbW1hbmQ7XHJcblx0dmFyIGVycm9yTXNnPVwiXCI7XHJcblx0dmFyIGlzVmFsaWQ9ZmFsc2U7XHJcblx0dGhpcy5mYWlsPWZ1bmN0aW9uKGVycm9yTWVzc2FnZSl7XHJcblx0XHRlcnJvck1zZz1lcnJvck1lc3NhZ2U7XHJcblx0XHRpc1ZhbGlkPWZhbHNlO1xyXG5cdH07XHJcblx0dGhpcy5zdWNjZXNzPWZ1bmN0aW9uKCl7XHJcblx0XHRlcnJvck1zZz1cIlwiO1xyXG5cdFx0aXNWYWxpZD10cnVlO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDb21tYW5kU3RyaW5nPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY29tbWFuZFN0cmluZztcclxuXHR9O1xyXG5cdHRoaXMuZ2V0RXJyb3JNZXNzYWdlPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZXJyb3JNc2c7XHJcblx0fTtcclxuXHR0aGlzLmlzVmFsaWQ9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBpc1ZhbGlkO1xyXG5cdH07XHJcbn07XHJcbi8qQ29tbWFuZC5UeXBlPXtcclxuXHRURVNUX1BMQU46J1RFU1RfUExBTicsXHJcblx0VEVTVF9DQVNFOidURVNUX0NBU0UnLFxyXG5cdFFVRVJZOidRVUVSWScsXHJcblx0VVBEQVRFOidVUERBVEUnLFxyXG59OyovXHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmQ7IiwidmFyIEFwcGxpY2F0aW9uPXJlcXVpcmUoJy4vQXBwbGljYXRpb24nKTtcclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHR2YXIgYXBwPW5ldyBBcHBsaWNhdGlvbigpO1xyXG5cdGFwcC5zdGFydCgpO1xyXG59KTtcclxuIiwidmFyIEN1YmVTdG9yYWdlID0ge307XHJcbkN1YmVTdG9yYWdlLkNVQkVfREIgPSBcImN1YmVfZGJcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFID0gXCJjdWJlX2NlbGxcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggPSBcInhcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgPSBcInlcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogPSBcInpcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFID0gXCJjZWxsX3ZhbHVlXCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9TVU0gPSBcInN1bVwiO1xyXG5cclxudmFyIERCO1xyXG50cnkge1xyXG4gICAgREIgPSBvcGVuRGF0YWJhc2UoQ3ViZVN0b3JhZ2UuQ1VCRV9EQiwgJzEuMCcsICdDdWJlIERCJywgNSAqIDEwMjQgKiAxMDI0KTtcclxufSBjYXRjaCAoZSkge1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gZXhlY1F1ZXJ5KHF1ZXJ5LCBwYXJhbXMpIHtcclxuXHRkZWJ1Z2dlcjtcclxuICAgIHZhciBkZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xyXG4gICAgaWYgKERCICE9PSBudWxsKSB7XHJcbiAgICAgICAgREIudHJhbnNhY3Rpb24oZnVuY3Rpb24odHgpIHtcclxuICAgICAgICAgICAgdHguZXhlY3V0ZVNxbChxdWVyeSwgcGFyYW1zLCBmdW5jdGlvbih0eCwgcmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24odHgsIGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG59XHJcblxyXG5cclxuQ3ViZVN0b3JhZ2UuY3JlYXRlVGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzcWwgPSAnQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJygnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ogKyAnIE5VTUVSSUMsICc7XHJcbiAgICBzcWwgKz0gQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFICsgJyBOVU1FUklDLCAnO1xyXG4gICAgc3FsICs9IFwiUFJJTUFSWSBLRVkgKFwiICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnLCcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcsJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJykgKTsnO1xyXG4gICAgY29uc29sZS5sb2coc3FsKTtcclxuICAgIGRlYnVnZ2VyO1xyXG5cclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5yZXNldEN1YmUgPSBmdW5jdGlvbihzaXplKSB7XHJcblx0dmFyIHNxbCA9ICdERUxFVEUgRlJPTSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgY29uc29sZS5sb2coc3FsKTtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgcmV0dXJuIGV4ZWNRdWVyeShzcWwsIFtdKTtcclxufTtcclxuXHJcblxyXG5DdWJlU3RvcmFnZS5wb3B1bGF0ZUN1YmUgPSBmdW5jdGlvbihzaXplKSB7XHJcblx0dmFyIHNxbCA9ICdJTlNFUlQgSU5UTyAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyBWQUxVRVMgJztcclxuICAgIHZhciBjZWxscyA9IFtdO1xyXG4gICAgZm9yICh4ID0gMTsgeCA8PSBzaXplOyB4KyspIHtcclxuICAgICAgICBmb3IgKHkgPSAxOyB5IDw9IHNpemU7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHogPSAxOyB6IDw9IHNpemU7IHorKykge1xyXG4gICAgICAgICAgICAgICAgY2VsbHMucHVzaCgnKCcrW3gseSx6LDBdLmpvaW4oJywnKSsnKScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNxbCs9Y2VsbHMuam9pbignLCAnKTtcclxuICAgIGNvbnNvbGUubG9nKHNxbCk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5cclxuQ3ViZVN0b3JhZ2UudXBkYXRlQ2VsbCA9IGZ1bmN0aW9uKHgsIHksIHosIHZhbHVlKSB7XHJcbiAgICBcclxuICAgIHZhciBzcWwgPSAnVVBEQVRFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1NFVCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFICsgJz0nICsgdmFsdWUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1dIRVJFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPSAnICsgeCArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPSAnICsgeSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPSAnICsgeiArICcgJztcclxuXHJcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgZGVidWdnZXI7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG4gICAgXHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5nZXRDZWxsID0gZnVuY3Rpb24oeCwgeSwgeikge1xyXG4gICAgdmFyIHNxbCA9ICdTRUxFQ1QgKiBGUk9NICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUgKyAnICc7XHJcbiAgICBzcWwgKz0gJ1dIRVJFICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPSAnICsgeCArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSArICcgPSAnICsgeSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPSAnICsgeiArICcgJztcclxuICAgIGNvbnNvbGUubG9nKHNxbCk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHJldHVybiBleGVjUXVlcnkoc3FsLCBbXSk7XHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5zdW1tYXRlQ2VsbHMgPSBmdW5jdGlvbih4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKSB7XHJcbiAgICB2YXIgc3FsID0gJ1NFTEVDVCBTVU0oJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUrJykgQVMgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfU1VNKycgRlJPTSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFICsgJyAnO1xyXG4gICAgc3FsICs9ICdXSEVSRSAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ggKyAnID49ICcgKyB4MSArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCArICcgPD0gJyArIHgyICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZICsgJyA+PSAnICsgeTEgKyAnICc7XHJcbiAgICBzcWwgKz0gJ0FORCAnICsgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1kgKyAnIDw9ICcgKyB5MiArICcgJztcclxuICAgIHNxbCArPSAnQU5EICcgKyBDdWJlU3RvcmFnZS5DVUJFX0NFTExfWiArICcgPj0gJyArIHoxICsgJyAnO1xyXG4gICAgc3FsICs9ICdBTkQgJyArIEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aICsgJyA8PSAnICsgejIgKyAnICc7XHJcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xyXG4gICAgZGVidWdnZXI7XHJcbiAgICByZXR1cm4gZXhlY1F1ZXJ5KHNxbCwgW10pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDdWJlU3RvcmFnZTtcclxuIiwidmFyIENvbW1hbmRzVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICBlbDogJyNtYWluLXZpZXcnLFxyXG4gIGNvbW1hbmRzSW5wdXQ6bnVsbCxcclxuICBleGVjdXRpb25PdXRwdXQ6bnVsbCxcclxuICBldmVudHM6e1xyXG4gIFx0J2NsaWNrICNleGVjdXRlLWJ1dHRvbic6J19vbkV4ZWN1dGVCdG5DbGljaydcclxuICB9LFxyXG4gIGluaXRpYWxpemU6ZnVuY3Rpb24oKXtcclxuICBcdHRoaXMuY29tbWFuZHNJbnB1dD10aGlzLiQoJyNjb21tYW5kcy10ZXh0Jyk7XHJcbiAgICBcclxuXHJcbiAgICB2YXIgZHVtbXlDb21tYW5kcz0gIFwiMlwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcbjQgNVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAyIDIgMiA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMSAxIDEgMjNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiA0IDQgNFwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDMgMyAzXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuMiA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDFcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAxIDEgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDIgMiAyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMiAyIDIgMiAyIDJcIjtcclxuXHJcblxyXG4gICAgdGhpcy5jb21tYW5kc0lucHV0LnZhbChkdW1teUNvbW1hbmRzKTtcclxuICBcdHRoaXMuZXhlY3V0aW9uT3V0cHV0PXRoaXMuJCgnI2V4ZWN1dGlvbi1yZXN1bHQtdGV4dCcpO1xyXG4gIH0sXHJcbiAgX29uRXhlY3V0ZUJ0bkNsaWNrOmZ1bmN0aW9uKGUpe1xyXG4gIFx0dGhpcy5fZGlzcGF0Y2hFeGVjdXRlKCk7XHJcblxyXG4gIH0sXHJcbiAgX2Rpc3BhdGNoRXhlY3V0ZTpmdW5jdGlvbigpe1xyXG4gIFx0dmFyIGNvbW1hbmRzPXRoaXMuY29tbWFuZHNJbnB1dC52YWwoKTtcclxuICBcdHRoaXMudHJpZ2dlcihDb21tYW5kc1ZpZXcuRVhFQ1VUSU9OX1NUQVJURUQsIGNvbW1hbmRzKTtcclxuICB9LFxyXG4gIGRpc3BsYXlSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQpe1xyXG4gIFx0dGhpcy5fc2hvd1Jlc3VsdHMocmVzdWx0U3RyaW5nKTtcclxuICB9LFxyXG4gIF9zaG93UmVzdWx0czpmdW5jdGlvbihyZXN1bHRTdHJpbmcpe1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQudmFsKHJlc3VsdFN0cmluZyk7XHJcbiAgfSxcclxuICBkaXNwbGF5RXJyb3I6ZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3Ipe1xyXG4gICAgdGhpcy5leGVjdXRpb25PdXRwdXQudmFsKGV4ZWN1dGlvbkVycm9yLmdldEVycm9yTWVzc2FnZSgpKTtcclxuICB9XHJcbn0se1xyXG5cdEVYRUNVVElPTl9TVEFSVEVEOidleGVjdXRpb24tc3RhcnRlZCdcclxuXHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cz1Db21tYW5kc1ZpZXc7Il19
