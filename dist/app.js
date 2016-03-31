(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommandsView=require('./views/CommandsView');
var Execution=require('./core/Execution');
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
		var execution=new Execution(commandsString);
		execution.getPromise().then(_onExecutionSuccess,_onExecutionError);
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
},{"./core/Execution":4,"./views/CommandsView":12}],2:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvbWFpbi5qcyIsImFwcC92aWV3cy9Db21tYW5kc1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29tbWFuZHNWaWV3PXJlcXVpcmUoJy4vdmlld3MvQ29tbWFuZHNWaWV3Jyk7XHJcbnZhciBFeGVjdXRpb249cmVxdWlyZSgnLi9jb3JlL0V4ZWN1dGlvbicpO1xyXG52YXIgQXBwbGljYXRpb249ZnVuY3Rpb24oKXtcclxuXHR2YXIgbWFpblZpZXc9bnVsbDtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuc3RhcnQ9ZnVuY3Rpb24oKXtcclxuXHRcdG1haW5WaWV3PW5ldyBDb21tYW5kc1ZpZXcoKTtcclxuXHRcdG1haW5WaWV3Lm9uKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgX29uRXhlY3Rpb25TdGFydGVkKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgX29uRXhlY3Rpb25TdGFydGVkPWZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKXtcclxuXHRcdGV4ZWN1dGUoY29tbWFuZHNTdHJpbmcpO1xyXG5cdH07XHJcblxyXG5cdHZhciBleGVjdXRlPWZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKXtcclxuXHRcdHZhciBleGVjdXRpb249bmV3IEV4ZWN1dGlvbihjb21tYW5kc1N0cmluZyk7XHJcblx0XHRleGVjdXRpb24uZ2V0UHJvbWlzZSgpLnRoZW4oX29uRXhlY3V0aW9uU3VjY2Vzcyxfb25FeGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcblx0dmFyIF9vbkV4ZWN1dGlvblN1Y2Nlc3M9ZnVuY3Rpb24oZXhlY3V0aW9uUmVzdWx0KXtcclxuXHRcdGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGZ1ZVwiLCBleGVjdXRpb25SZXN1bHQpO1xyXG5cdFx0c2hvd1Jlc3VsdHMoZXhlY3V0aW9uUmVzdWx0KTtcclxuXHR9O1xyXG5cclxuXHR2YXIgX29uRXhlY3V0aW9uRXJyb3I9ZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3Ipe1xyXG5cdFx0Y29uc29sZS5sb2coXCJyZXN1bHRhZG8gY29uIGVycm9yIGZ1ZVwiLCBleGVjdXRpb25FcnJvcik7XHJcblx0XHRzaG93RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG5cdH07XHJcblxyXG5cdHZhciBzaG93UmVzdWx0cz1mdW5jdGlvbihleGVjdXRpb25SZXN1bHQpe1xyXG5cdFx0dmFyIHJlc3VsdFN0cmluZz1leGVjdXRpb25SZXN1bHQuZ2V0VmFsdWUoKTtcclxuXHRcdHZhciB0aW1lRWxhcHNlZD1leGVjdXRpb25SZXN1bHQuZ2V0VGltZUVsYXBzZWQoKTtcclxuXHRcdG1haW5WaWV3LmRpc3BsYXlSZXN1bHRzKHJlc3VsdFN0cmluZywgdGltZUVsYXBzZWQpO1xyXG5cdH07XHJcblxyXG5cdHZhciBzaG93RXJyb3I9ZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3Ipe1xyXG5cdFx0bWFpblZpZXcuZGlzcGxheUVycm9yKGV4ZWN1dGlvbkVycm9yKTtcclxuXHR9O1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHM9QXBwbGljYXRpb247IiwidmFyIENvbmZpZz17XHJcblx0TUlOX1RFU1RTX0NBU0VTOjEsXHJcblx0TUFYX1RFU1RTX0NBU0VTOjUwLFxyXG5cdE1JTl9DVUJFX1NJWkU6MSxcclxuXHRNQVhfQ1VCRV9TSVpFOjEwMCxcclxuXHRNSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TOjEsXHJcblx0TUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxMDAwLFxyXG5cdE1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFOi1NYXRoLnBvdygxMCw5KSxcclxuXHRNQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRTpNYXRoLnBvdygxMCw5KSxcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzPUNvbmZpZzsiLCJ2YXIgQ29uZmlnPXJlcXVpcmUoJy4vQ29uZmlnJyk7XHJcbnZhciBFcnJvck1lc3NhZ2U9e1xyXG5cdE5PX0NPTU1BTkRTXHRcdFx0XHRcdFx0OlwiTm8gaGF5IGNvbWFuZG9zIHBhcmEgZWplY3V0YXJcIixcclxuXHRFTVBUWV9DT01NQU5EXHRcdFx0XHRcdDpcIkNvbWFuZG8gZXN0YSB2YWNpb1wiLFxyXG5cdFRFU1RfUExBTl9DT01NQU5EX1NJTlRBWFx0XHQ6XCJFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyBkZWJlIGNvbnRlbmVyIHVuIG7Dum1lcm9cIixcclxuXHRURVNUX1BMQU5fQ09NTUFORF9XUk9OR19WQUxVRVNcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gZGViZSBjb250ZW5lciB1biBuw7ptZXJvICh0ZXN0IGNhc2VzKSBlbnRyZSBcIitDb25maWcuTUlOX1RFU1RTX0NBU0VTK1wiIHkgXCIrQ29uZmlnLk1BWF9URVNUU19DQVNFUyxcclxuXHRURVNUX0NBU0VfQ09NTUFORF9TSU5UQVhcdFx0OlwiRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZG9zIG7Dum1lcm9zIHNlcGFyYWRvcyBwb3IgdW4gZXNwYWNpb1wiLFxyXG5cdFRFU1RfQ0FTRV9XUk9OR19DVUJFX1NJWkVcdFx0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBlbCBwcmltZXIgbnVtZXJvICh0YW1hw7FvIGRlbCBjdWJvKSBlbnRyZSBcIitDb25maWcuTUlOX0NVQkVfU0laRStcIiB5IFwiK0NvbmZpZy5NQVhfQ1VCRV9TSVpFLFxyXG5cdFRFU1RfQ0FTRV9XUk9OR19OVU1fT1BFUkFUSU9OU1x0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBlbCBzZWd1bmRvIG51bWVybyAob3BlcmFjaW9uZXMpIGVudHJlIFwiK0NvbmZpZy5NSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TK1wiIHkgXCIrQ29uZmlnLk1BWF9URVNUX0NBU0VTX09QRVJBVElPTlMsXHJcblx0T1BFUkFUSU9OX1VOS05PV05cdFx0XHRcdDpcIk9wZXJhY2nDs24gZGVzY29ub2NpZGFcIixcclxuXHRVUERBVEVfQ09NTUFORF9TSU5UQVhcdFx0XHQ6J0Vycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIHNlciBzaW1pbGFyIGEgXCJVUERBVEUgMiAyIDIgNFwiIChSZXZpc2FyIGVzcGFjaW9zKScsXHJcblx0VVBEQVRFX1dST05HX0NVQkVfQ0VMTFNcdFx0ICAgIDonRXJyb3IgZGUgVmFsb3JlcywgbGFzIGNvcmRlbmFkYXMgZGUgbGEgY2VsZGEgZGVsIGN1Ym8gc29uIGludmFsaWRhcycsXHJcblx0VVBEQVRFX1dST05HX1ZBTFVFX1RPX1VQREFURVx0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgdmFsb3IgYSBhY3R1YWxpemFyIGVudHJlIFwiK0NvbmZpZy5NSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRStcIiB5IFwiK0NvbmZpZy5NQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRSxcclxuXHRRVUVSWV9DT01NQU5EX1NJTlRBWFx0XHRcdDonRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgc2VyIHNpbWlsYXIgYSBcIlFVRVJZIDEgMSAxIDMgMyAzXCIgKFJldmlzYXIgZXNwYWNpb3MpJyxcclxuXHRRVUVSWV9XUk9OR19DVUJFX0NFTExTXHRcdCAgICA6J0Vycm9yIGRlIFZhbG9yZXMsIGxhcyBjb3JkZW5hZGFzIGRlIGxhcyBjZWxkYXMgZGVsIGN1Ym8gc29uIGludmFsaWRhcycsXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPUVycm9yTWVzc2FnZTsiLCJ2YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoJy4uL2NvbmZpZy9FcnJvck1lc3NhZ2UnKTtcclxudmFyIENvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL2Jhc2UvQ29tbWFuZCcpO1xyXG52YXIgVGVzdFBsYW5Db21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9UZXN0UGxhbkNvbW1hbmQnKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvVGVzdENhc2VDb21tYW5kJyk7XHJcbnZhciBPcGVyYXRpb25Db21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kJyk7XHJcbnZhciBFeGVjdXRpb24gPSBmdW5jdGlvbihjb21tYW5kc1N0cmluZykge1xyXG4gICAgdmFyIGV4ZWNEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xyXG4gICAgdmFyIGV4ZWN1dGlvbkVycm9yRGlzcGF0aGVkPWZhbHNlO1xyXG4gICAgY3JlYXRlQ29tbWFuZHMoY29tbWFuZHNTdHJpbmcpO1xyXG4gICAgZnVuY3Rpb24gZXh0cmFjdExpbmVzKGNvbW1hbmRzU3RyaW5nKXtcclxuICAgIFx0aWYoIWNvbW1hbmRzU3RyaW5nIHx8IGNvbW1hbmRzU3RyaW5nPT09Jycpe1xyXG4gICAgXHRcdGRpc3BhdGNoRXJyb3IoJycsIEVycm9yTWVzc2FnZS5OT19DT01NQU5EUywwKTtcclxuICAgIFx0XHRyZXR1cm47XHJcbiAgICBcdH1cclxuICAgIFx0cmV0dXJuIGNvbW1hbmRzU3RyaW5nLnNwbGl0KCdcXG4nKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVDb21tYW5kcyhjb21tYW5kc1N0cmluZyl7XHJcbiAgICBcdFxyXG4gICAgXHR2YXIgbGluZXM9ZXh0cmFjdExpbmVzKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIFx0dmFyIG51bUxpbmVzPWxpbmVzICYmIGxpbmVzLmxlbmd0aDtcclxuICAgIFx0aWYoIWxpbmVzIHx8IW51bUxpbmVzKVxyXG4gICAgXHRcdHJldHVybjtcclxuICAgIFx0XHJcbiAgICBcdC8vdmFyIGNvbW1hbmRzPVtdO1xyXG4gICAgXHRcclxuXHJcbiAgICBcdHZhciBjdXJMaW5lTnVtYmVyPTA7XHJcbiAgICBcdFxyXG4gICAgXHRmdW5jdGlvbiBnZXROZXh0TGluZSgpe1xyXG4gICAgXHRcdGlmKGN1ckxpbmVOdW1iZXIrMTw9bnVtTGluZXMpXHJcbiAgICBcdFx0XHRjdXJMaW5lTnVtYmVyKys7XHJcbiAgICBcdFx0cmV0dXJuIGxpbmVzW2N1ckxpbmVOdW1iZXItMV07XHJcbiAgICBcdH1cclxuXHJcblxyXG4gICAgXHQvL21ha2UgVGVzdFBsYW4gY29tbWFuZFxyXG4gICAgXHR2YXIgdGVzdFBsYW5Db21tYW5kPW5ldyBUZXN0UGxhbkNvbW1hbmQoZ2V0TmV4dExpbmUoKSk7XHJcbiAgICBcdHZhciB2YWxpZGF0aW9uVGVzdFBsYW49dGVzdFBsYW5Db21tYW5kLnZhbGlkYXRlKCk7XHJcbiAgICBcdGlmKHZhbGlkYXRpb25UZXN0UGxhbi5pc1ZhbGlkKCkpe1xyXG5cclxuICAgIFx0XHQvL2NvbW1hbmRzLnB1c2godGVzdFBsYW5Db21tYW5kKTtcclxuICAgIFx0XHR2YXIgbnVtVGVzdENhc2VzPXRlc3RQbGFuQ29tbWFuZC5nZXROdW1UZXN0Q2FzZXMoKTtcclxuXHJcbiAgICBcdFx0Y3JlYXRpb25UZXN0Q2FzZXM6e1xyXG5cdCAgICBcdFx0Zm9yKHZhciBpPTE7aTw9bnVtVGVzdENhc2VzO2krKyl7XHJcblx0ICAgIFx0XHRcdHZhciB0ZXN0Q2FzZUNvbW1hbmQ9bmV3IFRlc3RDYXNlQ29tbWFuZChnZXROZXh0TGluZSgpKTtcclxuXHQgICAgXHRcdFx0dmFyIHZhbGlkYXRpb25UZXN0Q2FzZT10ZXN0Q2FzZUNvbW1hbmQudmFsaWRhdGUoKTtcclxuXHQgICAgXHRcdFx0aWYodmFsaWRhdGlvblRlc3RDYXNlLmlzVmFsaWQoKSl7XHJcblx0ICAgIFx0XHRcdFx0XHJcblx0ICAgIFx0XHRcdFx0dGVzdFBsYW5Db21tYW5kLmFkZFRlc3RDYXNlQ29tbWFuZCh0ZXN0Q2FzZUNvbW1hbmQpO1xyXG5cdCAgICBcdFx0XHRcdHZhciBudW1PcGVyYXRpb25zPXRlc3RDYXNlQ29tbWFuZC5nZXROdW1PcGVyYXRpb25zKCk7XHJcblx0ICAgIFx0XHRcdFx0dmFyIGN1YmVTaXplPXRlc3RDYXNlQ29tbWFuZC5nZXRDdWJlU2l6ZSgpO1xyXG5cdCAgICBcdFx0XHRcdGNyZWF0aW9uT3BlcmF0aW9uczp7XHJcblx0XHQgICAgXHRcdFx0XHRmb3IodmFyIGo9MTtqPD1udW1PcGVyYXRpb25zO2orKyl7XHJcblx0XHQgICAgXHRcdFx0XHRcdHZhciBvcGVyYXRpb25Db21tYW5kPW5ldyBPcGVyYXRpb25Db21tYW5kKGdldE5leHRMaW5lKCksIGN1YmVTaXplKTtcdFxyXG5cdFx0ICAgIFx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbk9wZXJhdGlvbj1vcGVyYXRpb25Db21tYW5kLnZhbGlkYXRlKCk7XHJcblx0XHQgICAgXHRcdFx0XHRcdGlmKHZhbGlkYXRpb25PcGVyYXRpb24uaXNWYWxpZCgpKXtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHR0ZXN0Q2FzZUNvbW1hbmQuYWRkT3BlcmF0aW9uQ29tbWFuZChvcGVyYXRpb25Db21tYW5kKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0fVxyXG5cdFx0ICAgIFx0XHRcdFx0XHRlbHNle1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25PcGVyYXRpb24sY3VyTGluZU51bWJlcik7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0YnJlYWsgY3JlYXRpb25UZXN0Q2FzZXM7XHJcblx0XHQgICAgXHRcdFx0XHRcdFx0XHJcblx0XHQgICAgXHRcdFx0XHRcdH1cclxuXHRcdCAgICBcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICBcdFx0XHRcdH1cclxuXHQgICAgXHRcdFx0fVxyXG5cdCAgICBcdFx0XHRlbHNle1xyXG5cdCAgICBcdFx0XHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25UZXN0Q2FzZSxjdXJMaW5lTnVtYmVyKTtcclxuXHQgICAgXHRcdFx0XHRicmVhayBjcmVhdGlvblRlc3RDYXNlcztcclxuXHQgICAgXHRcdFx0fVxyXG5cdCAgICBcdFx0fVxyXG4gICAgXHRcdH1cclxuICAgICAgICAgICAgXHJcbiAgICBcdH1cclxuICAgIFx0ZWxzZXtcclxuICAgIFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uVGVzdFBsYW4sY3VyTGluZU51bWJlcik7XHJcbiAgICBcdH1cclxuXHJcbiAgICAgICAgaWYoIWV4ZWN1dGlvbkVycm9yRGlzcGF0aGVkKVxyXG4gICAgICAgICAgICBleGVjdXRlQ29tbWFuZHModGVzdFBsYW5Db21tYW5kKTtcclxuXHJcblxyXG5cclxuXHQgICAgLypfLmVhY2gobGluZXMsIGZ1bmN0aW9uKGxpbmUsIGluZGV4KXtcclxuXHQgICAgXHRjb25zb2xlLmxvZyhpbmRleCwgbGluZSk7XHJcblx0ICAgIH0pOyovXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGV4ZWN1dGVDb21tYW5kcyh0ZXN0UGxhbkNvbW1hbmQpe1xyXG4gICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIHRlc3RQbGFuQ29tbWFuZC5leGVjdXRlKCkuZ2V0UHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFamVjdWNpb24gY29tcGxldGFkYVwiKTtcclxuICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCBsaW5lICl7XHJcbiAgICAgICAgZXhlY3V0aW9uRXJyb3JEaXNwYXRoZWQ9dHJ1ZTtcclxuICAgIFx0ZGlzcGF0Y2hFcnJvcihcclxuICAgIFx0XHR2YWxpZGF0aW9uLmdldENvbW1hbmRTdHJpbmcoKSwgXHJcbiAgICBcdFx0dmFsaWRhdGlvbi5nZXRFcnJvck1lc3NhZ2UoKSwgXHJcbiAgICBcdFx0bGluZSBcclxuICAgIFx0KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoRXJyb3IoY29tbWFuZFN0ciwgZXJyb3JNc2csIGxpbmUgKXtcclxuICAgIFx0dmFyIGVycm9yPW5ldyBFeGVjdXRpb24uRXJyb3IoXHJcbiAgICBcdFx0Y29tbWFuZFN0ciwgXHJcbiAgICBcdFx0ZXJyb3JNc2csIFxyXG4gICAgXHRcdGxpbmUgXHJcbiAgICBcdCk7XHJcbiAgICBcdGV4ZWNEZWZlcnJlZC5yZWplY3QoZXJyb3IpO1x0XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcbiAgICBcdHJldHVybiBleGVjRGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfTtcclxuICAgIFxyXG59O1xyXG5FeGVjdXRpb24uUmVzdWx0ID0gZnVuY3Rpb24odmFsdWUsIHRpbWVFbGFwc2VkLCBleGVjdXRpb24pIHtcclxuICAgIHZhciBtVmFsdWUgPSB2YWx1ZTtcclxuICAgIHZhciBtVGltZUVsYXBzZWQgPSB0aW1lRWxhcHNlZDtcclxuICAgIHRoaXMuZ2V0VmFsdWU9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbVZhbHVlO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2V0VGltZUVsYXBzZWQ9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbVRpbWVFbGFwc2VkO1xyXG4gICAgfTtcclxufTtcclxuRXhlY3V0aW9uLkVycm9yID0gZnVuY3Rpb24oY29tbWFuZFN0cmluZywgZXJyb3JNZXNzYWdlLCBjb21tYW5kTGluZSkge1xyXG5cdHZhciBtQ29tbWFuZFN0cmluZyA9IGNvbW1hbmRTdHJpbmc7XHJcbiAgICB2YXIgbUVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcclxuICAgIHZhciBtQ29tbWFuZExpbmUgPSBjb21tYW5kTGluZTtcclxuICAgIHRoaXMuZ2V0Q29tbWFuZFN0cmluZz0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtQ29tbWFuZFN0cmluZztcclxuICAgIH07XHJcbiAgICB0aGlzLmdldEVycm9yTWVzc2FnZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtRXJyb3JNZXNzYWdlO1xyXG4gICAgfTtcdFxyXG4gICAgdGhpcy5nZXRDb21tYW5kTGluZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtQ29tbWFuZExpbmU7XHJcbiAgICB9O1x0XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gRXhlY3V0aW9uO1xyXG4iLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgUXVlcnlDb21tYW5kPXJlcXVpcmUoXCIuL1F1ZXJ5Q29tbWFuZFwiKTtcclxudmFyIFVwZGF0ZUNvbW1hbmQ9cmVxdWlyZShcIi4vVXBkYXRlQ29tbWFuZFwiKTtcclxuXHJcbnZhciBPcGVyYXRpb25Db21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIGN1YmVTaXplKXtcclxuXHRpZigvXlFVRVJZLy50ZXN0KGNvbW1hbmRTdHJpbmcpKXtcclxuXHRcdHJldHVybiBuZXcgUXVlcnlDb21tYW5kKGNvbW1hbmRTdHJpbmcsY3ViZVNpemUpO1xyXG5cdH1cclxuXHRlbHNlIGlmKC9eVVBEQVRFLy50ZXN0KGNvbW1hbmRTdHJpbmcpKXtcclxuXHRcdHJldHVybiBuZXcgVXBkYXRlQ29tbWFuZChjb21tYW5kU3RyaW5nLGN1YmVTaXplKTtcclxuXHR9XHJcblx0XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLk9QRVJBVElPTl9VTktOT1dOKTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRcdFxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblx0fTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPU9wZXJhdGlvbkNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBRdWVyeUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgX2N1YmVTaXplKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9X2N1YmVTaXplO1xyXG5cdHZhciBjZWxsWDE9MCxjZWxsWDI9MCxjZWxsWTE9MCxjZWxsWTI9MCxjZWxsWjE9MCxjZWxsWjI9MDtcclxuXHR2YXIgc2V0Q3ViZUNlbGxzPWZ1bmN0aW9uKFgxLFgyLFkxLFkyLFoxLFoyKXtcclxuXHRcdGNlbGxYMT1YMTtcclxuXHRcdGNlbGxYMj1YMjtcclxuXHRcdGNlbGxZMT1ZMTtcclxuXHRcdGNlbGxZMj1ZMjtcclxuXHRcdGNlbGxaMT1aMTtcclxuXHRcdGNlbGxaMj1aMjtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHZhbGlkYXRlQ2VsbD1mdW5jdGlvbihjZWxsQ29vcmQpe1xyXG5cdFx0cmV0dXJuIGNlbGxDb29yZD49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY2VsbENvb3JkPD10aGF0LmdldEN1YmVTaXplKCk7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eUVVFUllcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZXM9Y21kLm1hdGNoKC8tP1xcZCsvZyk7XHJcblxyXG5cdFx0XHRcdHZhciBjZWxsWDE9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFgyPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMT1wYXJzZUludCh2YWx1ZXNbMl0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWTI9cGFyc2VJbnQodmFsdWVzWzNdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoxPXBhcnNlSW50KHZhbHVlc1s0XSk7XHJcblx0XHRcdFx0dmFyIGNlbGxaMj1wYXJzZUludCh2YWx1ZXNbNV0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYMSkgJiYgdmFsaWRhdGVDZWxsKGNlbGxZMSkgJiYgdmFsaWRhdGVDZWxsKGNlbGxaMSkgJiZcclxuXHRcdFx0XHRcdHZhbGlkYXRlQ2VsbChjZWxsWDIpICYmIHZhbGlkYXRlQ2VsbChjZWxsWTIpICYmIHZhbGlkYXRlQ2VsbChjZWxsWjIpXHJcblxyXG5cdFx0XHRcdFx0KXtcclxuXHJcblx0XHRcdFx0XHRzZXRDdWJlQ2VsbHMoY2VsbFgxLGNlbGxYMixjZWxsWTEsY2VsbFkyLGNlbGxaMSxjZWxsWjIpO1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlFVRVJZX1dST05HX0NVQkVfQ0VMTFMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5RVUVSWV9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKGN1YmUpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRjb25zb2xlLmxvZygnUXVlcnkgRXhlY3V0ZWQgJyt0aGF0LmdldENvbW1hbmRTdHJpbmcoKSk7XHJcblx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcygnUXVlcnkgT0sgJyt0aGF0LmdldENvbW1hbmRTdHJpbmcoKSk7XHJcblx0XHRyZXR1cm4gdGhhdDtcclxuXHR9O1xyXG59O1xyXG5RdWVyeUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFF1ZXJ5Q29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9UXVlcnlDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcblxyXG52YXIgVGVzdENhc2VDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT0wO1xyXG5cdHZhciBudW1PcGVyYXRpb25zPTA7XHJcblx0dmFyIG9wZXJhdGlvbnM9W107XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgY3ViZT1udWxsO1xyXG5cdHZhciBzZXRDdWJlU2l6ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0Y3ViZVNpemU9bnVtO1xyXG5cdH07XHJcblx0dmFyIHNldE51bU9wZXJhdGlvbnM9ZnVuY3Rpb24obnVtKXtcclxuXHRcdG51bU9wZXJhdGlvbnM9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXRDdWJlU2l6ZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGN1YmVTaXplO1xyXG5cdH07XHJcblx0dGhpcy5nZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtT3BlcmF0aW9ucztcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGdldEN1YmUoKXtcclxuXHRcdHJldHVybiBjdWJlO1xyXG5cdH1cclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eXFxkK1xcc3sxfVxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZXM9Y21kLm1hdGNoKC9cXGQrL2cpO1xyXG5cdFx0XHRcdHZhciBjdWJlU2l6ZT1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBudW1PcGVyYXRpb25zPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoY3ViZVNpemU+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGN1YmVTaXplPD1Db25maWcuTUFYX0NVQkVfU0laRSl7XHJcblx0XHRcdFx0XHRpZihudW1PcGVyYXRpb25zPj1Db25maWcuTUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyAmJiBudW1PcGVyYXRpb25zPD1Db25maWcuTUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyl7XHJcblx0XHRcdFx0XHRcdHNldEN1YmVTaXplKGN1YmVTaXplKTtcclxuXHRcdFx0XHRcdFx0c2V0TnVtT3BlcmF0aW9ucyhudW1PcGVyYXRpb25zKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9XUk9OR19OVU1fT1BFUkFUSU9OUyk7XHRcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX1dST05HX0NVQkVfU0laRSk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHR9O1xyXG5cdHRoaXMuYWRkT3BlcmF0aW9uQ29tbWFuZD1mdW5jdGlvbihvcGVyYXRpb25Db21tYW5kKXtcclxuXHRcdG9wZXJhdGlvbnMucHVzaChvcGVyYXRpb25Db21tYW5kKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmV4ZWN1dGU9ZnVuY3Rpb24oKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0dmFyIGNvdW50T3BlcmF0aW9uc0V4ZWN1dGVkPTA7XHJcblx0XHR2YXIgcmVzdWx0c1N0cmluZz1cIlwiO1xyXG5cdFx0XHJcblx0XHR2YXIgc3VjY2Vzc0NhbGxiYWNrPWZ1bmN0aW9uKCl7XHJcblx0XHRcdGRlYnVnZ2VyO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIlRlc3QgQ2FzZSBleGVjdXRlZFxcblxcblwiK3Jlc3VsdHNTdHJpbmcpO1xyXG5cdFx0XHR0aGF0LmRpc3BhdGNoU3VjY2VzcyhyZXN1bHRzU3RyaW5nKTtcclxuXHRcdH07XHJcblx0XHR2YXIgZXJyb3JDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEVycm9yKGFyZ3VtZW50cyk7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIkVycm9yIGVuIGxhIGVqZWN1Y2nDs24gZGVsIHRlc3QgY2FzZVwiKTtcclxuXHRcdH07XHJcblx0XHRmdW5jdGlvbiBvcGVyYXRpb25FeGVjdXRlZChyZXN1bHQpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0cmVzdWx0c1N0cmluZys9cmVzdWx0K1wiXFxuXCI7XHJcblx0XHRcdGV4ZWN1dGVOZXh0T3BlcmF0aW9uKCk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBleGVjdXRlTmV4dE9wZXJhdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0aWYoY291bnRPcGVyYXRpb25zRXhlY3V0ZWQ8dGhhdC5nZXROdW1PcGVyYXRpb25zKCkpe1xyXG5cdFx0XHRcdHZhciBuZXh0T3BlcmF0aW9uPW9wZXJhdGlvbnNbY291bnRPcGVyYXRpb25zRXhlY3V0ZWQrK107XHJcblx0XHRcdFx0bmV4dE9wZXJhdGlvbi5nZXRQcm9taXNlKCkudGhlbihvcGVyYXRpb25FeGVjdXRlZCwgZXJyb3JDYWxsYmFjayk7XHJcblx0XHRcdFx0bmV4dE9wZXJhdGlvbi5leGVjdXRlKGdldEN1YmUoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZXhlY3V0ZU5leHRPcGVyYXRpb24oKTtcclxuXHJcblx0XHRcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcblxyXG59O1xyXG5cclxuVGVzdENhc2VDb21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0Q2FzZUNvbW1hbmQpO1xyXG5tb2R1bGUuZXhwb3J0cz1UZXN0Q2FzZUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBUZXN0UGxhbkNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZyl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIG51bVRlc3RDYXNlcz0wO1xyXG5cdHZhciB0ZXN0Q2FzZXM9W107XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR2YXIgc2V0TnVtVGVzdENhc2VzPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRudW1UZXN0Q2FzZXM9bnVtO1xyXG5cdH07XHJcblx0dGhpcy5nZXROdW1UZXN0Q2FzZXM9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBudW1UZXN0Q2FzZXM7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eXFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIG51bT1wYXJzZUludChjbWQpO1xyXG5cdFx0XHRcdGlmKG51bT49Q29uZmlnLk1JTl9URVNUU19DQVNFUyAmJiBudW08PUNvbmZpZy5NQVhfVEVTVFNfQ0FTRVMpe1xyXG5cdFx0XHRcdFx0c2V0TnVtVGVzdENhc2VzKG51bSk7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9QTEFOX0NPTU1BTkRfV1JPTkdfVkFMVUVTKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9QTEFOX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG5cdHRoaXMuYWRkVGVzdENhc2VDb21tYW5kPWZ1bmN0aW9uKHRlc3RDYXNlQ29tbWFuZCl7XHJcblx0XHR0ZXN0Q2FzZXMucHVzaCh0ZXN0Q2FzZUNvbW1hbmQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHR2YXIgY291bnRUZXN0Q2FzZXNFeGVjdXRlZD0wO1xyXG5cdFx0dmFyIHJlc3VsdHNTdHJpbmc9XCJcIjtcclxuXHRcdFxyXG5cdFx0dmFyIHN1Y2Nlc3NDYWxsYmFjaz1mdW5jdGlvbigpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJUZXN0IFBsYW4gZXhlY3V0ZWRcXG5cXG5cIityZXN1bHRzU3RyaW5nKTtcclxuXHRcdFx0dGhhdC5kaXNwYXRjaFN1Y2Nlc3MocmVzdWx0c1N0cmluZyk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGVycm9yQ2FsbGJhY2s9ZnVuY3Rpb24oKXtcclxuXHRcdFx0ZGVidWdnZXI7XHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFcnJvcihhcmd1bWVudHMpO1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJFcnJvciBlbiBsYSBlamVjdWNpw7NuIGRlbCB0ZXN0IHBsYW5cIik7XHJcblx0XHR9O1xyXG5cdFx0ZnVuY3Rpb24gdGVzdENhc2VFeGVjdXRlZChyZXN1bHQpe1xyXG5cdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdFx0cmVzdWx0c1N0cmluZys9cmVzdWx0K1wiXFxuXCI7XHJcblx0XHRcdGV4ZWN1dGVOZXh0VGVzdENhc2UoKTtcclxuXHRcdH1cclxuXHRcdGZ1bmN0aW9uIGV4ZWN1dGVOZXh0VGVzdENhc2UoKXtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGNvdW50VGVzdENhc2VzRXhlY3V0ZWQ8dGhhdC5nZXROdW1UZXN0Q2FzZXMoKSl7XHJcblx0XHRcdFx0dmFyIG5leHRUZXN0Q2FzZT10ZXN0Q2FzZXNbY291bnRUZXN0Q2FzZXNFeGVjdXRlZCsrXTtcclxuXHRcdFx0XHRuZXh0VGVzdENhc2UuZXhlY3V0ZSgpLmdldFByb21pc2UoKS50aGVuKHRlc3RDYXNlRXhlY3V0ZWQsIGVycm9yQ2FsbGJhY2spO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0c3VjY2Vzc0NhbGxiYWNrKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGV4ZWN1dGVOZXh0VGVzdENhc2UoKTtcclxuXHJcblx0XHRcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblRlc3RQbGFuQ29tbWFuZD1Db21tYW5kLmV4dGVuZHMoVGVzdFBsYW5Db21tYW5kKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1UZXN0UGxhbkNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBVcGRhdGVDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIF9jdWJlU2l6ZSl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIGN1YmVTaXplPV9jdWJlU2l6ZTtcclxuXHR2YXIgY2VsbFg9MDtcclxuXHR2YXIgY2VsbFk9MDtcclxuXHR2YXIgY2VsbFo9MDtcclxuXHR2YXIgdmFsdWVUb1VwZGF0ZT0wO1xyXG5cdHZhciBzZXRDdWJlQ2VsbHM9ZnVuY3Rpb24oWCxZLFope1xyXG5cdFx0Y2VsbFg9WDtcclxuXHRcdGNlbGxZPVk7XHJcblx0XHRjZWxsWj1aO1xyXG5cdH07XHJcblx0dmFyIHNldFZhbHVlVG9UdXBkYXRlPWZ1bmN0aW9uKG51bSl7XHJcblx0XHR2YWx1ZVRvVXBkYXRlPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHZhbGlkYXRlQ2VsbD1mdW5jdGlvbihjZWxsQ29vcmQpe1xyXG5cdFx0cmV0dXJuIGNlbGxDb29yZD49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY2VsbENvb3JkPD10aGF0LmdldEN1YmVTaXplKCk7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eVVBEQVRFXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9LT9cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvLT9cXGQrL2cpO1xyXG5cclxuXHRcdFx0XHR2YXIgY2VsbFg9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFk9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFo9cGFyc2VJbnQodmFsdWVzWzJdKTtcclxuXHRcdFx0XHR2YXIgdmFsdWVUb1VwZGF0ZT1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkpICYmIHZhbGlkYXRlQ2VsbChjZWxsWilcclxuXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWCxjZWxsWSxjZWxsWik7XHJcblxyXG5cdFx0XHRcdFx0aWYodmFsdWVUb1VwZGF0ZT49Q29uZmlnLk1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFICYmIHZhbHVlVG9VcGRhdGU8PUNvbmZpZy5NQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRSl7XHJcblx0XHRcdFx0XHRcdHNldFZhbHVlVG9UdXBkYXRlKHZhbHVlVG9VcGRhdGUpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX1dST05HX1ZBTFVFX1RPX1VQREFURSk7XHRcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX1dST05HX0NVQkVfQ0VMTFMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHRjb25zb2xlLmxvZygnVXBkYXRlIEV4ZWN1dGVkICcrdGhhdC5nZXRDb21tYW5kU3RyaW5nKCkpO1xyXG5cdFx0dGhhdC5kaXNwYXRjaFN1Y2Nlc3MoJ1VwZGF0ZSBPSyAnK3RoYXQuZ2V0Q29tbWFuZFN0cmluZygpKTtcclxuXHRcdHJldHVybiB0aGF0O1xyXG5cdH07XHJcbn07XHJcblVwZGF0ZUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFVwZGF0ZUNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVVwZGF0ZUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0dmFyIGNvbW1hbmRTdHJpbmc9Y29tbWFuZDtcclxuXHR2YXIgZGVmZXJyZWQ9alF1ZXJ5LkRlZmVycmVkKCk7XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR0aGlzLmdldENvbW1hbmRTdHJpbmc9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjb21tYW5kU3RyaW5nLnRyaW0oKTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0UHJvbWlzZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hTdWNjZXNzPWZ1bmN0aW9uKHJlc3VsdCl7XHJcblx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0fTtcclxuXHR0aGlzLmRpc3BhdGNoRXJyb3I9ZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cclxuXHR9O1xyXG5cclxufTtcclxuQ29tbWFuZC5leHRlbmRzPWZ1bmN0aW9uKENoaWxkKXtcclxuXHQvL2h0dHA6Ly9qdWxpZW4ucmljaGFyZC1mb3kuZnIvYmxvZy8yMDExLzEwLzMwL2Z1bmN0aW9uYWwtaW5oZXJpdGFuY2UtdnMtcHJvdG90eXBhbC1pbmhlcml0YW5jZS9cclxuXHRmdW5jdGlvbiBGKCkge31cclxuXHRGLnByb3RvdHlwZSA9IENvbW1hbmQucHJvdG90eXBlO1xyXG5cdENoaWxkLnByb3RvdHlwZT1uZXcgRigpO1xyXG5cdF8uZXh0ZW5kKENoaWxkLnByb3RvdHlwZSxDb21tYW5kLnByb3RvdHlwZSk7XHJcblx0cmV0dXJuIENoaWxkO1xyXG59O1xyXG5Db21tYW5kLlZhbGlkYXRpb249ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0dmFyIGNvbW1hbmRTdHJpbmc9Y29tbWFuZDtcclxuXHR2YXIgZXJyb3JNc2c9XCJcIjtcclxuXHR2YXIgaXNWYWxpZD1mYWxzZTtcclxuXHR0aGlzLmZhaWw9ZnVuY3Rpb24oZXJyb3JNZXNzYWdlKXtcclxuXHRcdGVycm9yTXNnPWVycm9yTWVzc2FnZTtcclxuXHRcdGlzVmFsaWQ9ZmFsc2U7XHJcblx0fTtcclxuXHR0aGlzLnN1Y2Nlc3M9ZnVuY3Rpb24oKXtcclxuXHRcdGVycm9yTXNnPVwiXCI7XHJcblx0XHRpc1ZhbGlkPXRydWU7XHJcblx0fTtcclxuXHR0aGlzLmdldENvbW1hbmRTdHJpbmc9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjb21tYW5kU3RyaW5nO1xyXG5cdH07XHJcblx0dGhpcy5nZXRFcnJvck1lc3NhZ2U9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBlcnJvck1zZztcclxuXHR9O1xyXG5cdHRoaXMuaXNWYWxpZD1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblx0fTtcclxufTtcclxuLypDb21tYW5kLlR5cGU9e1xyXG5cdFRFU1RfUExBTjonVEVTVF9QTEFOJyxcclxuXHRURVNUX0NBU0U6J1RFU1RfQ0FTRScsXHJcblx0UVVFUlk6J1FVRVJZJyxcclxuXHRVUERBVEU6J1VQREFURScsXHJcbn07Ki9cclxubW9kdWxlLmV4cG9ydHM9Q29tbWFuZDsiLCJ2YXIgQXBwbGljYXRpb249cmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdHZhciBhcHA9bmV3IEFwcGxpY2F0aW9uKCk7XHJcblx0YXBwLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgQ29tbWFuZHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gIGVsOiAnI21haW4tdmlldycsXHJcbiAgY29tbWFuZHNJbnB1dDpudWxsLFxyXG4gIGV4ZWN1dGlvbk91dHB1dDpudWxsLFxyXG4gIGV2ZW50czp7XHJcbiAgXHQnY2xpY2sgI2V4ZWN1dGUtYnV0dG9uJzonX29uRXhlY3V0ZUJ0bkNsaWNrJ1xyXG4gIH0sXHJcbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xyXG4gIFx0dGhpcy5jb21tYW5kc0lucHV0PXRoaXMuJCgnI2NvbW1hbmRzLXRleHQnKTtcclxuICAgIFxyXG5cclxuICAgIHZhciBkdW1teUNvbW1hbmRzPSAgXCIyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuNCA1XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAxIDEgMSAyM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDQgNCA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG4yIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDEgMSAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMiAyIDJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiAyIDIgMlwiO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQudmFsKGR1bW15Q29tbWFuZHMpO1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQ9dGhpcy4kKCcjZXhlY3V0aW9uLXJlc3VsdC10ZXh0Jyk7XHJcbiAgfSxcclxuICBfb25FeGVjdXRlQnRuQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgXHR0aGlzLl9kaXNwYXRjaEV4ZWN1dGUoKTtcclxuXHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCl7XHJcbiAgXHR0aGlzLl9zaG93UmVzdWx0cyhyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgX3Nob3dSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZyl7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwocmVzdWx0U3RyaW5nKTtcclxuICB9LFxyXG4gIGRpc3BsYXlFcnJvcjpmdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoZXhlY3V0aW9uRXJyb3IuZ2V0RXJyb3JNZXNzYWdlKCkpO1xyXG4gIH1cclxufSx7XHJcblx0RVhFQ1VUSU9OX1NUQVJURUQ6J2V4ZWN1dGlvbi1zdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
