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
			CubeStorage.populateCube(4).then(function(){
				debugger;
				console.log(arguments);
				CubeStorage.updateCell(1,1,1,2).then(function(){
					debugger;
					console.log(arguments);

					CubeStorage.getCell(1,1,1).then(function(){
						debugger;
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
				var cellX2=parseInt(values[1]);
				var cellY1=parseInt(values[2]);
				var cellY2=parseInt(values[3]);
				var cellZ1=parseInt(values[4]);
				var cellZ2=parseInt(values[5]);
				
				
				if(
					validateCell(cellX1) && validateCell(cellY1) && validateCell(cellZ1) &&
					validateCell(cellX2) && validateCell(cellY2) && validateCell(cellZ2)

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
var cubeTableCreated=false;

var CubeStorage={

};

CubeStorage.createTable=function(){
	var sql=	'CREATE INDEXEDDB DATABASE IF NOT EXISTS '+CubeStorage.CUBE_DB+'; ';
	sql+=		'ATTACH INDEXEDDB DATABASE '+CubeStorage.CUBE_DB+'; ';
	sql+=		'USE '+CubeStorage.CUBE_DB+'; ';
	sql+=		'DROP TABLE IF EXISTS '+CubeStorage.CUBE_CELL_TABLE+'; ';
	sql+=		'CREATE TABLE  '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'('+CubeStorage.CUBE_CELL_X+' NUMERIC, ';
	sql+=		CubeStorage.CUBE_CELL_Y+' NUMERIC, ';
	sql+=		CubeStorage.CUBE_CELL_Z+' NUMERIC, ';
	sql+=		CubeStorage.CUBE_CELL_VALUE+' NUMERIC, ';
	sql+=		"PRIMARY KEY ("+CubeStorage.CUBE_CELL_X+','+CubeStorage.CUBE_CELL_Y+','+CubeStorage.CUBE_CELL_Z+') );';



	console.log(sql);	
	return alasql.promise(sql);
      /*.then(function(res){
      	debugger;
           console.log(res); // output depends on mydata.xls
      }).catch(function(err){
      	debugger;
           console.log('Does the file exists? there was an error:', err);
      });*/
};

CubeStorage.populateCube=function(size){
	var cells=[];
	for(x=1;x<=size;x++){
		for(y=1;y<=size;y++){
			for(z=1;z<=size;z++){
				cells.push({x:x,y:y,z:z,cell_value:0});
			}		
		}	
	}
	console.table(cells);

	var sql=	'SELECT INTO '+CubeStorage.CUBE_CELL_TABLE+' FROM ?';
	return alasql.promise(sql,[cells]);
};


CubeStorage.updateCell=function(x,y,z, value){
	/*var sql=	'REPLACE INTO '+CubeStorage.CUBE_CELL_TABLE+' ( ';
	sql+=		 CubeStorage.CUBE_CELL_X+', ';
	sql+=		 CubeStorage.CUBE_CELL_Y+', ';
	sql+=		 CubeStorage.CUBE_CELL_Z+', ';
	sql+=		 CubeStorage.CUBE_CELL_VALUE+' ) ';
	sql+=		'VALUES ('+x+','+y+','+z+','+value+') ';*/

	/*var sql=	'REPLACE INTO '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'VALUES ('+x+','+y+','+z+','+value+') ';*/

	var sql=	'UPDATE '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'SET '+CubeStorage.CUBE_CELL_VALUE+'='+value+' ';
	sql+=		'WHERE '+CubeStorage.CUBE_CELL_X+' = '+x+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Y+' = '+y+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Z+' = '+z+' ';


	/*sql+=		'WHERE '+CubeStorage.CUBE_CELL_X+' = '+x+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Y+' = '+y+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Z+' = '+z+' ';*/
	//return sql;
	console.log(sql);
	return alasql.promise(sql);
	/*alasql.promise(sql)
      .then(function(res){
           console.log(res); // output depends on mydata.xls
      }).catch(function(err){
           console.log('Does the file exists? there was an error:', err);
      });*/
};

CubeStorage.getCell=function(x,y,z){
	var sql=	'SELECT * FROM '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'WHERE '+CubeStorage.CUBE_CELL_X+' = '+x+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Y+' = '+y+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Z+' = '+z+' ';
	console.log(sql);
	return alasql.promise(sql);
	/*alasql.promise(sql)
      .then(function(res){
           console.log(res); // output depends on mydata.xls
      }).catch(function(err){
           console.log('Does the file exists? there was an error:', err);
      });*/
};
CubeStorage.CUBE_DB="cube_db2";
CubeStorage.CUBE_CELL_TABLE="cube_cell2";
CubeStorage.CUBE_CELL_X="x";
CubeStorage.CUBE_CELL_Y="y";
CubeStorage.CUBE_CELL_Z="z";
CubeStorage.CUBE_CELL_VALUE="cell_value";
module.exports=CubeStorage;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvbWFpbi5qcyIsImFwcC9zdG9yYWdlL0N1YmVTdG9yYWdlLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENvbW1hbmRzVmlldz1yZXF1aXJlKCcuL3ZpZXdzL0NvbW1hbmRzVmlldycpO1xyXG52YXIgRXhlY3V0aW9uPXJlcXVpcmUoJy4vY29yZS9FeGVjdXRpb24nKTtcclxudmFyIEN1YmVTdG9yYWdlPXJlcXVpcmUoJy4vc3RvcmFnZS9DdWJlU3RvcmFnZScpO1xyXG52YXIgQXBwbGljYXRpb249ZnVuY3Rpb24oKXtcclxuXHR2YXIgbWFpblZpZXc9bnVsbDtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuc3RhcnQ9ZnVuY3Rpb24oKXtcclxuXHRcdG1haW5WaWV3PW5ldyBDb21tYW5kc1ZpZXcoKTtcclxuXHRcdG1haW5WaWV3Lm9uKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgX29uRXhlY3Rpb25TdGFydGVkKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgX29uRXhlY3Rpb25TdGFydGVkPWZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKXtcclxuXHRcdGV4ZWN1dGUoY29tbWFuZHNTdHJpbmcpO1xyXG5cdH07XHJcblxyXG5cdHZhciBleGVjdXRlPWZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKXtcclxuXHRcdEN1YmVTdG9yYWdlLmNyZWF0ZVRhYmxlKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0Y29uc29sZS5sb2coYXJndW1lbnRzKTtcclxuXHRcdFx0Q3ViZVN0b3JhZ2UucG9wdWxhdGVDdWJlKDQpLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG5cdFx0XHRcdEN1YmVTdG9yYWdlLnVwZGF0ZUNlbGwoMSwxLDEsMikudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG5cclxuXHRcdFx0XHRcdEN1YmVTdG9yYWdlLmdldENlbGwoMSwxLDEpLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGFyZ3VtZW50cyk7XHJcblx0XHRcdFx0XHR9LGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUud2Fybihhcmd1bWVudHMpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGFyZ3VtZW50cyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjb25zb2xlLndhcm4oYXJndW1lbnRzKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LGZ1bmN0aW9uKCl7XHJcblx0XHRcdGNvbnNvbGUud2Fybihhcmd1bWVudHMpO1xyXG5cdFx0fSk7XHJcblx0XHQvL3ZhciBleGVjdXRpb249bmV3IEV4ZWN1dGlvbihjb21tYW5kc1N0cmluZyk7XHJcblx0XHQvL2V4ZWN1dGlvbi5nZXRQcm9taXNlKCkudGhlbihfb25FeGVjdXRpb25TdWNjZXNzLF9vbkV4ZWN1dGlvbkVycm9yKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgX29uRXhlY3V0aW9uU3VjY2Vzcz1mdW5jdGlvbihleGVjdXRpb25SZXN1bHQpe1xyXG5cdFx0Y29uc29sZS5sb2coXCJyZXN1bHRhZG8gZnVlXCIsIGV4ZWN1dGlvblJlc3VsdCk7XHJcblx0XHRzaG93UmVzdWx0cyhleGVjdXRpb25SZXN1bHQpO1xyXG5cdH07XHJcblxyXG5cdHZhciBfb25FeGVjdXRpb25FcnJvcj1mdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcblx0XHRjb25zb2xlLmxvZyhcInJlc3VsdGFkbyBjb24gZXJyb3IgZnVlXCIsIGV4ZWN1dGlvbkVycm9yKTtcclxuXHRcdHNob3dFcnJvcihleGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcblx0dmFyIHNob3dSZXN1bHRzPWZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCl7XHJcblx0XHR2YXIgcmVzdWx0U3RyaW5nPWV4ZWN1dGlvblJlc3VsdC5nZXRWYWx1ZSgpO1xyXG5cdFx0dmFyIHRpbWVFbGFwc2VkPWV4ZWN1dGlvblJlc3VsdC5nZXRUaW1lRWxhcHNlZCgpO1xyXG5cdFx0bWFpblZpZXcuZGlzcGxheVJlc3VsdHMocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCk7XHJcblx0fTtcclxuXHJcblx0dmFyIHNob3dFcnJvcj1mdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcblx0XHRtYWluVmlldy5kaXNwbGF5RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG5cdH07XHJcblxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1BcHBsaWNhdGlvbjsiLCJ2YXIgQ29uZmlnPXtcclxuXHRNSU5fVEVTVFNfQ0FTRVM6MSxcclxuXHRNQVhfVEVTVFNfQ0FTRVM6NTAsXHJcblx0TUlOX0NVQkVfU0laRToxLFxyXG5cdE1BWF9DVUJFX1NJWkU6MTAwLFxyXG5cdE1JTl9URVNUX0NBU0VTX09QRVJBVElPTlM6MSxcclxuXHRNQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TOjEwMDAsXHJcblx0TUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6LU1hdGgucG93KDEwLDkpLFxyXG5cdE1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFOk1hdGgucG93KDEwLDkpLFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHM9Q29uZmlnOyIsInZhciBDb25maWc9cmVxdWlyZSgnLi9Db25maWcnKTtcclxudmFyIEVycm9yTWVzc2FnZT17XHJcblx0Tk9fQ09NTUFORFNcdFx0XHRcdFx0XHQ6XCJObyBoYXkgY29tYW5kb3MgcGFyYSBlamVjdXRhclwiLFxyXG5cdEVNUFRZX0NPTU1BTkRcdFx0XHRcdFx0OlwiQ29tYW5kbyBlc3RhIHZhY2lvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVyb1wiLFxyXG5cdFRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFU1x0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyBkZWJlIGNvbnRlbmVyIHVuIG7Dum1lcm8gKHRlc3QgY2FzZXMpIGVudHJlIFwiK0NvbmZpZy5NSU5fVEVTVFNfQ0FTRVMrXCIgeSBcIitDb25maWcuTUFYX1RFU1RTX0NBU0VTLFxyXG5cdFRFU1RfQ0FTRV9DT01NQU5EX1NJTlRBWFx0XHQ6XCJFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBkb3MgbsO6bWVyb3Mgc2VwYXJhZG9zIHBvciB1biBlc3BhY2lvXCIsXHJcblx0VEVTVF9DQVNFX1dST05HX0NVQkVfU0laRVx0XHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGVsIHByaW1lciBudW1lcm8gKHRhbWHDsW8gZGVsIGN1Ym8pIGVudHJlIFwiK0NvbmZpZy5NSU5fQ1VCRV9TSVpFK1wiIHkgXCIrQ29uZmlnLk1BWF9DVUJFX1NJWkUsXHJcblx0VEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGVsIHNlZ3VuZG8gbnVtZXJvIChvcGVyYWNpb25lcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUX0NBU0VTX09QRVJBVElPTlMrXCIgeSBcIitDb25maWcuTUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyxcclxuXHRPUEVSQVRJT05fVU5LTk9XTlx0XHRcdFx0OlwiT3BlcmFjacOzbiBkZXNjb25vY2lkYVwiLFxyXG5cdFVQREFURV9DT01NQU5EX1NJTlRBWFx0XHRcdDonRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgc2VyIHNpbWlsYXIgYSBcIlVQREFURSAyIDIgMiA0XCIgKFJldmlzYXIgZXNwYWNpb3MpJyxcclxuXHRVUERBVEVfV1JPTkdfQ1VCRV9DRUxMU1x0XHQgICAgOidFcnJvciBkZSBWYWxvcmVzLCBsYXMgY29yZGVuYWRhcyBkZSBsYSBjZWxkYSBkZWwgY3VibyBzb24gaW52YWxpZGFzJyxcclxuXHRVUERBVEVfV1JPTkdfVkFMVUVfVE9fVVBEQVRFXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCB2YWxvciBhIGFjdHVhbGl6YXIgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFK1wiIHkgXCIrQ29uZmlnLk1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFLFxyXG5cdFFVRVJZX0NPTU1BTkRfU0lOVEFYXHRcdFx0OidFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBzZXIgc2ltaWxhciBhIFwiUVVFUlkgMSAxIDEgMyAzIDNcIiAoUmV2aXNhciBlc3BhY2lvcyknLFxyXG5cdFFVRVJZX1dST05HX0NVQkVfQ0VMTFNcdFx0ICAgIDonRXJyb3IgZGUgVmFsb3JlcywgbGFzIGNvcmRlbmFkYXMgZGUgbGFzIGNlbGRhcyBkZWwgY3VibyBzb24gaW52YWxpZGFzJyxcclxufTtcclxubW9kdWxlLmV4cG9ydHM9RXJyb3JNZXNzYWdlOyIsInZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZSgnLi4vY29uZmlnL0Vycm9yTWVzc2FnZScpO1xyXG52YXIgQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvYmFzZS9Db21tYW5kJyk7XHJcbnZhciBUZXN0UGxhbkNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RQbGFuQ29tbWFuZCcpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9UZXN0Q2FzZUNvbW1hbmQnKTtcclxudmFyIE9wZXJhdGlvbkNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL09wZXJhdGlvbkNvbW1hbmQnKTtcclxudmFyIEV4ZWN1dGlvbiA9IGZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKSB7XHJcbiAgICB2YXIgZXhlY0RlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICB2YXIgZXhlY3V0aW9uRXJyb3JEaXNwYXRoZWQ9ZmFsc2U7XHJcbiAgICBjcmVhdGVDb21tYW5kcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBmdW5jdGlvbiBleHRyYWN0TGluZXMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRpZighY29tbWFuZHNTdHJpbmcgfHwgY29tbWFuZHNTdHJpbmc9PT0nJyl7XHJcbiAgICBcdFx0ZGlzcGF0Y2hFcnJvcignJywgRXJyb3JNZXNzYWdlLk5PX0NPTU1BTkRTLDApO1xyXG4gICAgXHRcdHJldHVybjtcclxuICAgIFx0fVxyXG4gICAgXHRyZXR1cm4gY29tbWFuZHNTdHJpbmcuc3BsaXQoJ1xcbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKXtcclxuICAgIFx0XHJcbiAgICBcdHZhciBsaW5lcz1leHRyYWN0TGluZXMoY29tbWFuZHNTdHJpbmcpO1xyXG4gICAgXHR2YXIgbnVtTGluZXM9bGluZXMgJiYgbGluZXMubGVuZ3RoO1xyXG4gICAgXHRpZighbGluZXMgfHwhbnVtTGluZXMpXHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHRcclxuICAgIFx0Ly92YXIgY29tbWFuZHM9W107XHJcbiAgICBcdFxyXG5cclxuICAgIFx0dmFyIGN1ckxpbmVOdW1iZXI9MDtcclxuICAgIFx0XHJcbiAgICBcdGZ1bmN0aW9uIGdldE5leHRMaW5lKCl7XHJcbiAgICBcdFx0aWYoY3VyTGluZU51bWJlcisxPD1udW1MaW5lcylcclxuICAgIFx0XHRcdGN1ckxpbmVOdW1iZXIrKztcclxuICAgIFx0XHRyZXR1cm4gbGluZXNbY3VyTGluZU51bWJlci0xXTtcclxuICAgIFx0fVxyXG5cclxuXHJcbiAgICBcdC8vbWFrZSBUZXN0UGxhbiBjb21tYW5kXHJcbiAgICBcdHZhciB0ZXN0UGxhbkNvbW1hbmQ9bmV3IFRlc3RQbGFuQ29tbWFuZChnZXROZXh0TGluZSgpKTtcclxuICAgIFx0dmFyIHZhbGlkYXRpb25UZXN0UGxhbj10ZXN0UGxhbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuICAgIFx0aWYodmFsaWRhdGlvblRlc3RQbGFuLmlzVmFsaWQoKSl7XHJcblxyXG4gICAgXHRcdC8vY29tbWFuZHMucHVzaCh0ZXN0UGxhbkNvbW1hbmQpO1xyXG4gICAgXHRcdHZhciBudW1UZXN0Q2FzZXM9dGVzdFBsYW5Db21tYW5kLmdldE51bVRlc3RDYXNlcygpO1xyXG5cclxuICAgIFx0XHRjcmVhdGlvblRlc3RDYXNlczp7XHJcblx0ICAgIFx0XHRmb3IodmFyIGk9MTtpPD1udW1UZXN0Q2FzZXM7aSsrKXtcclxuXHQgICAgXHRcdFx0dmFyIHRlc3RDYXNlQ29tbWFuZD1uZXcgVGVzdENhc2VDb21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG5cdCAgICBcdFx0XHR2YXIgdmFsaWRhdGlvblRlc3RDYXNlPXRlc3RDYXNlQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG5cdCAgICBcdFx0XHRpZih2YWxpZGF0aW9uVGVzdENhc2UuaXNWYWxpZCgpKXtcclxuXHQgICAgXHRcdFx0XHRcclxuXHQgICAgXHRcdFx0XHR0ZXN0UGxhbkNvbW1hbmQuYWRkVGVzdENhc2VDb21tYW5kKHRlc3RDYXNlQ29tbWFuZCk7XHJcblx0ICAgIFx0XHRcdFx0dmFyIG51bU9wZXJhdGlvbnM9dGVzdENhc2VDb21tYW5kLmdldE51bU9wZXJhdGlvbnMoKTtcclxuXHQgICAgXHRcdFx0XHR2YXIgY3ViZVNpemU9dGVzdENhc2VDb21tYW5kLmdldEN1YmVTaXplKCk7XHJcblx0ICAgIFx0XHRcdFx0Y3JlYXRpb25PcGVyYXRpb25zOntcclxuXHRcdCAgICBcdFx0XHRcdGZvcih2YXIgaj0xO2o8PW51bU9wZXJhdGlvbnM7aisrKXtcclxuXHRcdCAgICBcdFx0XHRcdFx0dmFyIG9wZXJhdGlvbkNvbW1hbmQ9bmV3IE9wZXJhdGlvbkNvbW1hbmQoZ2V0TmV4dExpbmUoKSwgY3ViZVNpemUpO1x0XHJcblx0XHQgICAgXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uT3BlcmF0aW9uPW9wZXJhdGlvbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0aWYodmFsaWRhdGlvbk9wZXJhdGlvbi5pc1ZhbGlkKCkpe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdHRlc3RDYXNlQ29tbWFuZC5hZGRPcGVyYXRpb25Db21tYW5kKG9wZXJhdGlvbkNvbW1hbmQpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHR9XHJcblx0XHQgICAgXHRcdFx0XHRcdGVsc2V7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbk9wZXJhdGlvbixjdXJMaW5lTnVtYmVyKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRicmVhayBjcmVhdGlvblRlc3RDYXNlcztcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRcclxuXHRcdCAgICBcdFx0XHRcdFx0fVxyXG5cdFx0ICAgIFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgIFx0XHRcdFx0fVxyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHRcdGVsc2V7XHJcblx0ICAgIFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RDYXNlLGN1ckxpbmVOdW1iZXIpO1xyXG5cdCAgICBcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHR9XHJcbiAgICBcdFx0fVxyXG4gICAgICAgICAgICBcclxuICAgIFx0fVxyXG4gICAgXHRlbHNle1xyXG4gICAgXHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25UZXN0UGxhbixjdXJMaW5lTnVtYmVyKTtcclxuICAgIFx0fVxyXG5cclxuICAgICAgICBpZighZXhlY3V0aW9uRXJyb3JEaXNwYXRoZWQpXHJcbiAgICAgICAgICAgIGV4ZWN1dGVDb21tYW5kcyh0ZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuXHJcblxyXG5cdCAgICAvKl8uZWFjaChsaW5lcywgZnVuY3Rpb24obGluZSwgaW5kZXgpe1xyXG5cdCAgICBcdGNvbnNvbGUubG9nKGluZGV4LCBsaW5lKTtcclxuXHQgICAgfSk7Ki9cclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gZXhlY3V0ZUNvbW1hbmRzKHRlc3RQbGFuQ29tbWFuZCl7XHJcbiAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgdGVzdFBsYW5Db21tYW5kLmV4ZWN1dGUoKS5nZXRQcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVqZWN1Y2lvbiBjb21wbGV0YWRhXCIpO1xyXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb24sIGxpbmUgKXtcclxuICAgICAgICBleGVjdXRpb25FcnJvckRpc3BhdGhlZD10cnVlO1xyXG4gICAgXHRkaXNwYXRjaEVycm9yKFxyXG4gICAgXHRcdHZhbGlkYXRpb24uZ2V0Q29tbWFuZFN0cmluZygpLCBcclxuICAgIFx0XHR2YWxpZGF0aW9uLmdldEVycm9yTWVzc2FnZSgpLCBcclxuICAgIFx0XHRsaW5lIFxyXG4gICAgXHQpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hFcnJvcihjb21tYW5kU3RyLCBlcnJvck1zZywgbGluZSApe1xyXG4gICAgXHR2YXIgZXJyb3I9bmV3IEV4ZWN1dGlvbi5FcnJvcihcclxuICAgIFx0XHRjb21tYW5kU3RyLCBcclxuICAgIFx0XHRlcnJvck1zZywgXHJcbiAgICBcdFx0bGluZSBcclxuICAgIFx0KTtcclxuICAgIFx0ZXhlY0RlZmVycmVkLnJlamVjdChlcnJvcik7XHRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdldFByb21pc2U9ZnVuY3Rpb24oKXtcclxuICAgIFx0cmV0dXJuIGV4ZWNEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9O1xyXG4gICAgXHJcbn07XHJcbkV4ZWN1dGlvbi5SZXN1bHQgPSBmdW5jdGlvbih2YWx1ZSwgdGltZUVsYXBzZWQsIGV4ZWN1dGlvbikge1xyXG4gICAgdmFyIG1WYWx1ZSA9IHZhbHVlO1xyXG4gICAgdmFyIG1UaW1lRWxhcHNlZCA9IHRpbWVFbGFwc2VkO1xyXG4gICAgdGhpcy5nZXRWYWx1ZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtVmFsdWU7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nZXRUaW1lRWxhcHNlZD0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtVGltZUVsYXBzZWQ7XHJcbiAgICB9O1xyXG59O1xyXG5FeGVjdXRpb24uRXJyb3IgPSBmdW5jdGlvbihjb21tYW5kU3RyaW5nLCBlcnJvck1lc3NhZ2UsIGNvbW1hbmRMaW5lKSB7XHJcblx0dmFyIG1Db21tYW5kU3RyaW5nID0gY29tbWFuZFN0cmluZztcclxuICAgIHZhciBtRXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xyXG4gICAgdmFyIG1Db21tYW5kTGluZSA9IGNvbW1hbmRMaW5lO1xyXG4gICAgdGhpcy5nZXRDb21tYW5kU3RyaW5nPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1Db21tYW5kU3RyaW5nO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2V0RXJyb3JNZXNzYWdlPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1FcnJvck1lc3NhZ2U7XHJcbiAgICB9O1x0XHJcbiAgICB0aGlzLmdldENvbW1hbmRMaW5lPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1Db21tYW5kTGluZTtcclxuICAgIH07XHRcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBFeGVjdXRpb247XHJcbiIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBRdWVyeUNvbW1hbmQ9cmVxdWlyZShcIi4vUXVlcnlDb21tYW5kXCIpO1xyXG52YXIgVXBkYXRlQ29tbWFuZD1yZXF1aXJlKFwiLi9VcGRhdGVDb21tYW5kXCIpO1xyXG5cclxudmFyIE9wZXJhdGlvbkNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgY3ViZVNpemUpe1xyXG5cdGlmKC9eUVVFUlkvLnRlc3QoY29tbWFuZFN0cmluZykpe1xyXG5cdFx0cmV0dXJuIG5ldyBRdWVyeUNvbW1hbmQoY29tbWFuZFN0cmluZyxjdWJlU2l6ZSk7XHJcblx0fVxyXG5cdGVsc2UgaWYoL15VUERBVEUvLnRlc3QoY29tbWFuZFN0cmluZykpe1xyXG5cdFx0cmV0dXJuIG5ldyBVcGRhdGVDb21tYW5kKGNvbW1hbmRTdHJpbmcsY3ViZVNpemUpO1xyXG5cdH1cclxuXHRcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuT1BFUkFUSU9OX1VOS05PV04pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdFx0XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHR9O1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHM9T3BlcmF0aW9uQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFF1ZXJ5Q29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBfY3ViZVNpemUpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT1fY3ViZVNpemU7XHJcblx0dmFyIGNlbGxYMT0wLGNlbGxYMj0wLGNlbGxZMT0wLGNlbGxZMj0wLGNlbGxaMT0wLGNlbGxaMj0wO1xyXG5cdHZhciBzZXRDdWJlQ2VsbHM9ZnVuY3Rpb24oWDEsWDIsWTEsWTIsWjEsWjIpe1xyXG5cdFx0Y2VsbFgxPVgxO1xyXG5cdFx0Y2VsbFgyPVgyO1xyXG5cdFx0Y2VsbFkxPVkxO1xyXG5cdFx0Y2VsbFkyPVkyO1xyXG5cdFx0Y2VsbFoxPVoxO1xyXG5cdFx0Y2VsbFoyPVoyO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgdmFsaWRhdGVDZWxsPWZ1bmN0aW9uKGNlbGxDb29yZCl7XHJcblx0XHRyZXR1cm4gY2VsbENvb3JkPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjZWxsQ29vcmQ8PXRoYXQuZ2V0Q3ViZVNpemUoKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15RVUVSWVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYMT1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWDI9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFkxPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMj1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdHZhciBjZWxsWjE9cGFyc2VJbnQodmFsdWVzWzRdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoyPXBhcnNlSW50KHZhbHVlc1s1XSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFoxKSAmJlxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxZMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxaMilcclxuXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWDEsY2VsbFgyLGNlbGxZMSxjZWxsWTIsY2VsbFoxLGNlbGxaMik7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuUVVFUllfV1JPTkdfQ1VCRV9DRUxMUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlFVRVJZX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oY3ViZSl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGNvbnNvbGUubG9nKCdRdWVyeSBFeGVjdXRlZCAnK3RoYXQuZ2V0Q29tbWFuZFN0cmluZygpKTtcclxuXHRcdHRoYXQuZGlzcGF0Y2hTdWNjZXNzKCdRdWVyeSBPSyAnK3RoYXQuZ2V0Q29tbWFuZFN0cmluZygpKTtcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblF1ZXJ5Q29tbWFuZD1Db21tYW5kLmV4dGVuZHMoUXVlcnlDb21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1RdWVyeUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxuXHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZyl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIGN1YmVTaXplPTA7XHJcblx0dmFyIG51bU9wZXJhdGlvbnM9MDtcclxuXHR2YXIgb3BlcmF0aW9ucz1bXTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciBjdWJlPW51bGw7XHJcblx0dmFyIHNldEN1YmVTaXplPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRjdWJlU2l6ZT1udW07XHJcblx0fTtcclxuXHR2YXIgc2V0TnVtT3BlcmF0aW9ucz1mdW5jdGlvbihudW0pe1xyXG5cdFx0bnVtT3BlcmF0aW9ucz1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHR0aGlzLmdldE51bU9wZXJhdGlvbnM9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBudW1PcGVyYXRpb25zO1xyXG5cdH07XHJcblx0ZnVuY3Rpb24gZ2V0Q3ViZSgpe1xyXG5cdFx0cmV0dXJuIGN1YmU7XHJcblx0fVxyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goL1xcZCsvZyk7XHJcblx0XHRcdFx0dmFyIGN1YmVTaXplPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIG51bU9wZXJhdGlvbnM9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihjdWJlU2l6ZT49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY3ViZVNpemU8PUNvbmZpZy5NQVhfQ1VCRV9TSVpFKXtcclxuXHRcdFx0XHRcdGlmKG51bU9wZXJhdGlvbnM+PUNvbmZpZy5NSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TICYmIG51bU9wZXJhdGlvbnM8PUNvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TKXtcclxuXHRcdFx0XHRcdFx0c2V0Q3ViZVNpemUoY3ViZVNpemUpO1xyXG5cdFx0XHRcdFx0XHRzZXROdW1PcGVyYXRpb25zKG51bU9wZXJhdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TKTtcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cdH07XHJcblx0dGhpcy5hZGRPcGVyYXRpb25Db21tYW5kPWZ1bmN0aW9uKG9wZXJhdGlvbkNvbW1hbmQpe1xyXG5cdFx0b3BlcmF0aW9ucy5wdXNoKG9wZXJhdGlvbkNvbW1hbmQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHR2YXIgY291bnRPcGVyYXRpb25zRXhlY3V0ZWQ9MDtcclxuXHRcdHZhciByZXN1bHRzU3RyaW5nPVwiXCI7XHJcblx0XHRcclxuXHRcdHZhciBzdWNjZXNzQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiVGVzdCBDYXNlIGV4ZWN1dGVkXFxuXFxuXCIrcmVzdWx0c1N0cmluZyk7XHJcblx0XHRcdHRoYXQuZGlzcGF0Y2hTdWNjZXNzKHJlc3VsdHNTdHJpbmcpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBlcnJvckNhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXJyb3IoYXJndW1lbnRzKTtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiRXJyb3IgZW4gbGEgZWplY3VjacOzbiBkZWwgdGVzdCBjYXNlXCIpO1xyXG5cdFx0fTtcclxuXHRcdGZ1bmN0aW9uIG9wZXJhdGlvbkV4ZWN1dGVkKHJlc3VsdCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRyZXN1bHRzU3RyaW5nKz1yZXN1bHQrXCJcXG5cIjtcclxuXHRcdFx0ZXhlY3V0ZU5leHRPcGVyYXRpb24oKTtcclxuXHRcdH1cclxuXHRcdGZ1bmN0aW9uIGV4ZWN1dGVOZXh0T3BlcmF0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRpZihjb3VudE9wZXJhdGlvbnNFeGVjdXRlZDx0aGF0LmdldE51bU9wZXJhdGlvbnMoKSl7XHJcblx0XHRcdFx0dmFyIG5leHRPcGVyYXRpb249b3BlcmF0aW9uc1tjb3VudE9wZXJhdGlvbnNFeGVjdXRlZCsrXTtcclxuXHRcdFx0XHRuZXh0T3BlcmF0aW9uLmdldFByb21pc2UoKS50aGVuKG9wZXJhdGlvbkV4ZWN1dGVkLCBlcnJvckNhbGxiYWNrKTtcclxuXHRcdFx0XHRuZXh0T3BlcmF0aW9uLmV4ZWN1dGUoZ2V0Q3ViZSgpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRleGVjdXRlTmV4dE9wZXJhdGlvbigpO1xyXG5cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxuXHJcbn07XHJcblxyXG5UZXN0Q2FzZUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFRlc3RDYXNlQ29tbWFuZCk7XHJcbm1vZHVsZS5leHBvcnRzPVRlc3RDYXNlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgbnVtVGVzdENhc2VzPTA7XHJcblx0dmFyIHRlc3RDYXNlcz1bXTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciBzZXROdW1UZXN0Q2FzZXM9ZnVuY3Rpb24obnVtKXtcclxuXHRcdG51bVRlc3RDYXNlcz1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldE51bVRlc3RDYXNlcz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bVRlc3RDYXNlcztcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgbnVtPXBhcnNlSW50KGNtZCk7XHJcblx0XHRcdFx0aWYobnVtPj1Db25maWcuTUlOX1RFU1RTX0NBU0VTICYmIG51bTw9Q29uZmlnLk1BWF9URVNUU19DQVNFUyl7XHJcblx0XHRcdFx0XHRzZXROdW1UZXN0Q2FzZXMobnVtKTtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX1BMQU5fQ09NTUFORF9XUk9OR19WQUxVRVMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX1BMQU5fQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblx0dGhpcy5hZGRUZXN0Q2FzZUNvbW1hbmQ9ZnVuY3Rpb24odGVzdENhc2VDb21tYW5kKXtcclxuXHRcdHRlc3RDYXNlcy5wdXNoKHRlc3RDYXNlQ29tbWFuZCk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdHZhciBjb3VudFRlc3RDYXNlc0V4ZWN1dGVkPTA7XHJcblx0XHR2YXIgcmVzdWx0c1N0cmluZz1cIlwiO1xyXG5cdFx0XHJcblx0XHR2YXIgc3VjY2Vzc0NhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIlRlc3QgUGxhbiBleGVjdXRlZFxcblxcblwiK3Jlc3VsdHNTdHJpbmcpO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcyhyZXN1bHRzU3RyaW5nKTtcclxuXHRcdH07XHJcblx0XHR2YXIgZXJyb3JDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEVycm9yKGFyZ3VtZW50cyk7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIkVycm9yIGVuIGxhIGVqZWN1Y2nDs24gZGVsIHRlc3QgcGxhblwiKTtcclxuXHRcdH07XHJcblx0XHRmdW5jdGlvbiB0ZXN0Q2FzZUV4ZWN1dGVkKHJlc3VsdCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRyZXN1bHRzU3RyaW5nKz1yZXN1bHQrXCJcXG5cIjtcclxuXHRcdFx0ZXhlY3V0ZU5leHRUZXN0Q2FzZSgpO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gZXhlY3V0ZU5leHRUZXN0Q2FzZSgpe1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoY291bnRUZXN0Q2FzZXNFeGVjdXRlZDx0aGF0LmdldE51bVRlc3RDYXNlcygpKXtcclxuXHRcdFx0XHR2YXIgbmV4dFRlc3RDYXNlPXRlc3RDYXNlc1tjb3VudFRlc3RDYXNlc0V4ZWN1dGVkKytdO1xyXG5cdFx0XHRcdG5leHRUZXN0Q2FzZS5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLnRoZW4odGVzdENhc2VFeGVjdXRlZCwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZXhlY3V0ZU5leHRUZXN0Q2FzZSgpO1xyXG5cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuVGVzdFBsYW5Db21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVRlc3RQbGFuQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFVwZGF0ZUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgX2N1YmVTaXplKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9X2N1YmVTaXplO1xyXG5cdHZhciBjZWxsWD0wO1xyXG5cdHZhciBjZWxsWT0wO1xyXG5cdHZhciBjZWxsWj0wO1xyXG5cdHZhciB2YWx1ZVRvVXBkYXRlPTA7XHJcblx0dmFyIHNldEN1YmVDZWxscz1mdW5jdGlvbihYLFksWil7XHJcblx0XHRjZWxsWD1YO1xyXG5cdFx0Y2VsbFk9WTtcclxuXHRcdGNlbGxaPVo7XHJcblx0fTtcclxuXHR2YXIgc2V0VmFsdWVUb1R1cGRhdGU9ZnVuY3Rpb24obnVtKXtcclxuXHRcdHZhbHVlVG9VcGRhdGU9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgdmFsaWRhdGVDZWxsPWZ1bmN0aW9uKGNlbGxDb29yZCl7XHJcblx0XHRyZXR1cm4gY2VsbENvb3JkPj1Db25maWcuTUlOX0NVQkVfU0laRSAmJiBjZWxsQ29vcmQ8PXRoYXQuZ2V0Q3ViZVNpemUoKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15VUERBVEVcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX0tP1xcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZXM9Y21kLm1hdGNoKC8tP1xcZCsvZyk7XHJcblxyXG5cdFx0XHRcdHZhciBjZWxsWD1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWT1wYXJzZUludCh2YWx1ZXNbMV0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWj1wYXJzZUludCh2YWx1ZXNbMl0pO1xyXG5cdFx0XHRcdHZhciB2YWx1ZVRvVXBkYXRlPXBhcnNlSW50KHZhbHVlc1szXSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgpICYmIHZhbGlkYXRlQ2VsbChjZWxsWSkgJiYgdmFsaWRhdGVDZWxsKGNlbGxaKVxyXG5cclxuXHRcdFx0XHRcdCl7XHJcblxyXG5cdFx0XHRcdFx0c2V0Q3ViZUNlbGxzKGNlbGxYLGNlbGxZLGNlbGxaKTtcclxuXHJcblx0XHRcdFx0XHRpZih2YWx1ZVRvVXBkYXRlPj1Db25maWcuTUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUUgJiYgdmFsdWVUb1VwZGF0ZTw9Q29uZmlnLk1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFKXtcclxuXHRcdFx0XHRcdFx0c2V0VmFsdWVUb1R1cGRhdGUodmFsdWVUb1VwZGF0ZSk7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfV1JPTkdfVkFMVUVfVE9fVVBEQVRFKTtcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfV1JPTkdfQ1VCRV9DRUxMUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlVQREFURV9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGNvbnNvbGUubG9nKCdVcGRhdGUgRXhlY3V0ZWQgJyt0aGF0LmdldENvbW1hbmRTdHJpbmcoKSk7XHJcblx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcygnVXBkYXRlIE9LICcrdGhhdC5nZXRDb21tYW5kU3RyaW5nKCkpO1xyXG5cdFx0cmV0dXJuIHRoYXQ7XHJcblx0fTtcclxufTtcclxuVXBkYXRlQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVXBkYXRlQ29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9VXBkYXRlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBkZWZlcnJlZD1qUXVlcnkuRGVmZXJyZWQoKTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmcudHJpbSgpO1xyXG5cdH07XHJcblx0dGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG5cdH07XHJcblx0dGhpcy5kaXNwYXRjaFN1Y2Nlc3M9ZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hFcnJvcj1mdW5jdGlvbihlcnJvcil7XHJcblx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbihjb21tYW5kKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH07XHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblxyXG5cdH07XHJcblxyXG59O1xyXG5Db21tYW5kLmV4dGVuZHM9ZnVuY3Rpb24oQ2hpbGQpe1xyXG5cdC8vaHR0cDovL2p1bGllbi5yaWNoYXJkLWZveS5mci9ibG9nLzIwMTEvMTAvMzAvZnVuY3Rpb25hbC1pbmhlcml0YW5jZS12cy1wcm90b3R5cGFsLWluaGVyaXRhbmNlL1xyXG5cdGZ1bmN0aW9uIEYoKSB7fVxyXG5cdEYucHJvdG90eXBlID0gQ29tbWFuZC5wcm90b3R5cGU7XHJcblx0Q2hpbGQucHJvdG90eXBlPW5ldyBGKCk7XHJcblx0Xy5leHRlbmQoQ2hpbGQucHJvdG90eXBlLENvbW1hbmQucHJvdG90eXBlKTtcclxuXHRyZXR1cm4gQ2hpbGQ7XHJcbn07XHJcbkNvbW1hbmQuVmFsaWRhdGlvbj1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBlcnJvck1zZz1cIlwiO1xyXG5cdHZhciBpc1ZhbGlkPWZhbHNlO1xyXG5cdHRoaXMuZmFpbD1mdW5jdGlvbihlcnJvck1lc3NhZ2Upe1xyXG5cdFx0ZXJyb3JNc2c9ZXJyb3JNZXNzYWdlO1xyXG5cdFx0aXNWYWxpZD1mYWxzZTtcclxuXHR9O1xyXG5cdHRoaXMuc3VjY2Vzcz1mdW5jdGlvbigpe1xyXG5cdFx0ZXJyb3JNc2c9XCJcIjtcclxuXHRcdGlzVmFsaWQ9dHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmc7XHJcblx0fTtcclxuXHR0aGlzLmdldEVycm9yTWVzc2FnZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGVycm9yTXNnO1xyXG5cdH07XHJcblx0dGhpcy5pc1ZhbGlkPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gaXNWYWxpZDtcclxuXHR9O1xyXG59O1xyXG4vKkNvbW1hbmQuVHlwZT17XHJcblx0VEVTVF9QTEFOOidURVNUX1BMQU4nLFxyXG5cdFRFU1RfQ0FTRTonVEVTVF9DQVNFJyxcclxuXHRRVUVSWTonUVVFUlknLFxyXG5cdFVQREFURTonVVBEQVRFJyxcclxufTsqL1xyXG5tb2R1bGUuZXhwb3J0cz1Db21tYW5kOyIsInZhciBBcHBsaWNhdGlvbj1yZXF1aXJlKCcuL0FwcGxpY2F0aW9uJyk7XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFwcD1uZXcgQXBwbGljYXRpb24oKTtcclxuXHRhcHAuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBjdWJlVGFibGVDcmVhdGVkPWZhbHNlO1xyXG5cclxudmFyIEN1YmVTdG9yYWdlPXtcclxuXHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5jcmVhdGVUYWJsZT1mdW5jdGlvbigpe1xyXG5cdHZhciBzcWw9XHQnQ1JFQVRFIElOREVYRUREQiBEQVRBQkFTRSBJRiBOT1QgRVhJU1RTICcrQ3ViZVN0b3JhZ2UuQ1VCRV9EQisnOyAnO1xyXG5cdHNxbCs9XHRcdCdBVFRBQ0ggSU5ERVhFRERCIERBVEFCQVNFICcrQ3ViZVN0b3JhZ2UuQ1VCRV9EQisnOyAnO1xyXG5cdHNxbCs9XHRcdCdVU0UgJytDdWJlU3RvcmFnZS5DVUJFX0RCKyc7ICc7XHJcblx0c3FsKz1cdFx0J0RST1AgVEFCTEUgSUYgRVhJU1RTICcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFKyc7ICc7XHJcblx0c3FsKz1cdFx0J0NSRUFURSBUQUJMRSAgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUrJyAnO1xyXG5cdHNxbCs9XHRcdCcoJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCsnIE5VTUVSSUMsICc7XHJcblx0c3FsKz1cdFx0Q3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1krJyBOVU1FUklDLCAnO1xyXG5cdHNxbCs9XHRcdEN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aKycgTlVNRVJJQywgJztcclxuXHRzcWwrPVx0XHRDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUrJyBOVU1FUklDLCAnO1xyXG5cdHNxbCs9XHRcdFwiUFJJTUFSWSBLRVkgKFwiK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YKycsJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSsnLCcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1orJykgKTsnO1xyXG5cclxuXHJcblxyXG5cdGNvbnNvbGUubG9nKHNxbCk7XHRcclxuXHRyZXR1cm4gYWxhc3FsLnByb21pc2Uoc3FsKTtcclxuICAgICAgLyoudGhlbihmdW5jdGlvbihyZXMpe1xyXG4gICAgICBcdGRlYnVnZ2VyO1xyXG4gICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7IC8vIG91dHB1dCBkZXBlbmRzIG9uIG15ZGF0YS54bHNcclxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcclxuICAgICAgXHRkZWJ1Z2dlcjtcclxuICAgICAgICAgICBjb25zb2xlLmxvZygnRG9lcyB0aGUgZmlsZSBleGlzdHM/IHRoZXJlIHdhcyBhbiBlcnJvcjonLCBlcnIpO1xyXG4gICAgICB9KTsqL1xyXG59O1xyXG5cclxuQ3ViZVN0b3JhZ2UucG9wdWxhdGVDdWJlPWZ1bmN0aW9uKHNpemUpe1xyXG5cdHZhciBjZWxscz1bXTtcclxuXHRmb3IoeD0xO3g8PXNpemU7eCsrKXtcclxuXHRcdGZvcih5PTE7eTw9c2l6ZTt5Kyspe1xyXG5cdFx0XHRmb3Ioej0xO3o8PXNpemU7eisrKXtcclxuXHRcdFx0XHRjZWxscy5wdXNoKHt4OngseTp5LHo6eixjZWxsX3ZhbHVlOjB9KTtcclxuXHRcdFx0fVx0XHRcclxuXHRcdH1cdFxyXG5cdH1cclxuXHRjb25zb2xlLnRhYmxlKGNlbGxzKTtcclxuXHJcblx0dmFyIHNxbD1cdCdTRUxFQ1QgSU5UTyAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSsnIEZST00gPyc7XHJcblx0cmV0dXJuIGFsYXNxbC5wcm9taXNlKHNxbCxbY2VsbHNdKTtcclxufTtcclxuXHJcblxyXG5DdWJlU3RvcmFnZS51cGRhdGVDZWxsPWZ1bmN0aW9uKHgseSx6LCB2YWx1ZSl7XHJcblx0Lyp2YXIgc3FsPVx0J1JFUExBQ0UgSU5UTyAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRSsnICggJztcclxuXHRzcWwrPVx0XHQgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1grJywgJztcclxuXHRzcWwrPVx0XHQgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1krJywgJztcclxuXHRzcWwrPVx0XHQgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1orJywgJztcclxuXHRzcWwrPVx0XHQgQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFKycgKSAnO1xyXG5cdHNxbCs9XHRcdCdWQUxVRVMgKCcreCsnLCcreSsnLCcreisnLCcrdmFsdWUrJykgJzsqL1xyXG5cclxuXHQvKnZhciBzcWw9XHQnUkVQTEFDRSBJTlRPICcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1RBQkxFKycgJztcclxuXHRzcWwrPVx0XHQnVkFMVUVTICgnK3grJywnK3krJywnK3orJywnK3ZhbHVlKycpICc7Ki9cclxuXHJcblx0dmFyIHNxbD1cdCdVUERBVEUgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUrJyAnO1xyXG5cdHNxbCs9XHRcdCdTRVQgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfVkFMVUUrJz0nK3ZhbHVlKycgJztcclxuXHRzcWwrPVx0XHQnV0hFUkUgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCsnID0gJyt4KycgJztcclxuXHRzcWwrPVx0XHQnQU5EICcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1krJyA9ICcreSsnICc7XHJcblx0c3FsKz1cdFx0J0FORCAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aKycgPSAnK3orJyAnO1xyXG5cclxuXHJcblx0LypzcWwrPVx0XHQnV0hFUkUgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfWCsnID0gJyt4KycgJztcclxuXHRzcWwrPVx0XHQnQU5EICcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1krJyA9ICcreSsnICc7XHJcblx0c3FsKz1cdFx0J0FORCAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9aKycgPSAnK3orJyAnOyovXHJcblx0Ly9yZXR1cm4gc3FsO1xyXG5cdGNvbnNvbGUubG9nKHNxbCk7XHJcblx0cmV0dXJuIGFsYXNxbC5wcm9taXNlKHNxbCk7XHJcblx0LyphbGFzcWwucHJvbWlzZShzcWwpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcyl7XHJcbiAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTsgLy8gb3V0cHV0IGRlcGVuZHMgb24gbXlkYXRhLnhsc1xyXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xyXG4gICAgICAgICAgIGNvbnNvbGUubG9nKCdEb2VzIHRoZSBmaWxlIGV4aXN0cz8gdGhlcmUgd2FzIGFuIGVycm9yOicsIGVycik7XHJcbiAgICAgIH0pOyovXHJcbn07XHJcblxyXG5DdWJlU3RvcmFnZS5nZXRDZWxsPWZ1bmN0aW9uKHgseSx6KXtcclxuXHR2YXIgc3FsPVx0J1NFTEVDVCAqIEZST00gJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfVEFCTEUrJyAnO1xyXG5cdHNxbCs9XHRcdCdXSEVSRSAnK0N1YmVTdG9yYWdlLkNVQkVfQ0VMTF9YKycgPSAnK3grJyAnO1xyXG5cdHNxbCs9XHRcdCdBTkQgJytDdWJlU3RvcmFnZS5DVUJFX0NFTExfWSsnID0gJyt5KycgJztcclxuXHRzcWwrPVx0XHQnQU5EICcrQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1orJyA9ICcreisnICc7XHJcblx0Y29uc29sZS5sb2coc3FsKTtcclxuXHRyZXR1cm4gYWxhc3FsLnByb21pc2Uoc3FsKTtcclxuXHQvKmFsYXNxbC5wcm9taXNlKHNxbClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpOyAvLyBvdXRwdXQgZGVwZW5kcyBvbiBteWRhdGEueGxzXHJcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XHJcbiAgICAgICAgICAgY29uc29sZS5sb2coJ0RvZXMgdGhlIGZpbGUgZXhpc3RzPyB0aGVyZSB3YXMgYW4gZXJyb3I6JywgZXJyKTtcclxuICAgICAgfSk7Ki9cclxufTtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9EQj1cImN1YmVfZGIyXCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9UQUJMRT1cImN1YmVfY2VsbDJcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1g9XCJ4XCI7XHJcbkN1YmVTdG9yYWdlLkNVQkVfQ0VMTF9ZPVwieVwiO1xyXG5DdWJlU3RvcmFnZS5DVUJFX0NFTExfWj1cInpcIjtcclxuQ3ViZVN0b3JhZ2UuQ1VCRV9DRUxMX1ZBTFVFPVwiY2VsbF92YWx1ZVwiO1xyXG5tb2R1bGUuZXhwb3J0cz1DdWJlU3RvcmFnZTsiLCJ2YXIgQ29tbWFuZHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gIGVsOiAnI21haW4tdmlldycsXHJcbiAgY29tbWFuZHNJbnB1dDpudWxsLFxyXG4gIGV4ZWN1dGlvbk91dHB1dDpudWxsLFxyXG4gIGV2ZW50czp7XHJcbiAgXHQnY2xpY2sgI2V4ZWN1dGUtYnV0dG9uJzonX29uRXhlY3V0ZUJ0bkNsaWNrJ1xyXG4gIH0sXHJcbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xyXG4gIFx0dGhpcy5jb21tYW5kc0lucHV0PXRoaXMuJCgnI2NvbW1hbmRzLXRleHQnKTtcclxuICAgIFxyXG5cclxuICAgIHZhciBkdW1teUNvbW1hbmRzPSAgXCIyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuNCA1XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAxIDEgMSAyM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDQgNCA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG4yIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDEgMSAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMiAyIDJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiAyIDIgMlwiO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQudmFsKGR1bW15Q29tbWFuZHMpO1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQ9dGhpcy4kKCcjZXhlY3V0aW9uLXJlc3VsdC10ZXh0Jyk7XHJcbiAgfSxcclxuICBfb25FeGVjdXRlQnRuQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgXHR0aGlzLl9kaXNwYXRjaEV4ZWN1dGUoKTtcclxuXHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCl7XHJcbiAgXHR0aGlzLl9zaG93UmVzdWx0cyhyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgX3Nob3dSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZyl7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwocmVzdWx0U3RyaW5nKTtcclxuICB9LFxyXG4gIGRpc3BsYXlFcnJvcjpmdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoZXhlY3V0aW9uRXJyb3IuZ2V0RXJyb3JNZXNzYWdlKCkpO1xyXG4gIH1cclxufSx7XHJcblx0RVhFQ1VUSU9OX1NUQVJURUQ6J2V4ZWN1dGlvbi1zdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
