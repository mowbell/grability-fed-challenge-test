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
	    			debugger;
	    			var testCaseCommand=new TestCaseCommand(getNextLine());
	    			var validationTestCase=testCaseCommand.validate();
	    			debugger;
	    			if(validationTestCase.isValid()){
	    				
	    				testPlanCommand.addTestCaseCommand(testCaseCommand);
	    				var numOperations=testCaseCommand.getNumOperations();
	    				var cubeSize=testCaseCommand.getCubeSize();
	    				debugger;
	    				creationOperations:{
		    				for(var j=1;j<=numOperations;j++){
		    					debugger;
		    					var operationCommand=new OperationCommand(getNextLine(), cubeSize);	
		    					var validationOperation=operationCommand.validate();
		    					if(validationOperation.isValid()){
		    						testCaseCommand.addOperationCommand(testCaseCommand);
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
    	console.log(testPlanCommand);



	    /*_.each(lines, function(line, index){
	    	console.log(index, line);
	    });*/
    }

    function dispatchValidationError(validation, line ){
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
	debugger;
	if(/^QUERY/.test(commandString)){
		return new QueryCommand(commandString,cubeSize);
	}
	else if(/^UPDATE/.test(commandString)){
		return new UpdateCommand(commandString,cubeSize);
	}
	
	Command.call(this,commandString);
	this.validate=function(){
		debugger;
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
	debugger;
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
		debugger;
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
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		var regex=/^\d+\s{1}\d+$/;
		debugger;
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
	debugger;
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
		debugger;
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
		return deferred.promise;
	};
	this.dispatchSucess=function(result){
		this.getPromise().success(result);
	};
	this.dispatchError=function(error){
		this.getPromise().reject(error);
	};
	this.validate=function(command){
		return true;
	};
	this.execute=function(){

	};

};
Command.extends=function(Child){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvbWFpbi5qcyIsImFwcC92aWV3cy9Db21tYW5kc1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb21tYW5kc1ZpZXc9cmVxdWlyZSgnLi92aWV3cy9Db21tYW5kc1ZpZXcnKTtcclxudmFyIEV4ZWN1dGlvbj1yZXF1aXJlKCcuL2NvcmUvRXhlY3V0aW9uJyk7XHJcbnZhciBBcHBsaWNhdGlvbj1mdW5jdGlvbigpe1xyXG5cdHZhciBtYWluVmlldz1udWxsO1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dGhpcy5zdGFydD1mdW5jdGlvbigpe1xyXG5cdFx0bWFpblZpZXc9bmV3IENvbW1hbmRzVmlldygpO1xyXG5cdFx0bWFpblZpZXcub24oQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBfb25FeGVjdGlvblN0YXJ0ZWQpO1xyXG5cdH07XHJcblxyXG5cdHZhciBfb25FeGVjdGlvblN0YXJ0ZWQ9ZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpe1xyXG5cdFx0ZXhlY3V0ZShjb21tYW5kc1N0cmluZyk7XHJcblx0fTtcclxuXHJcblx0dmFyIGV4ZWN1dGU9ZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpe1xyXG5cdFx0dmFyIGV4ZWN1dGlvbj1uZXcgRXhlY3V0aW9uKGNvbW1hbmRzU3RyaW5nKTtcclxuXHRcdGV4ZWN1dGlvbi5nZXRQcm9taXNlKCkudGhlbihfb25FeGVjdXRpb25TdWNjZXNzLF9vbkV4ZWN1dGlvbkVycm9yKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgX29uRXhlY3V0aW9uU3VjY2Vzcz1mdW5jdGlvbihleGVjdXRpb25SZXN1bHQpe1xyXG5cdFx0Y29uc29sZS5sb2coXCJyZXN1bHRhZG8gZnVlXCIsIGV4ZWN1dGlvblJlc3VsdCk7XHJcblx0XHRzaG93UmVzdWx0cyhleGVjdXRpb25SZXN1bHQpO1xyXG5cdH07XHJcblxyXG5cdHZhciBfb25FeGVjdXRpb25FcnJvcj1mdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcblx0XHRjb25zb2xlLmxvZyhcInJlc3VsdGFkbyBjb24gZXJyb3IgZnVlXCIsIGV4ZWN1dGlvbkVycm9yKTtcclxuXHRcdHNob3dFcnJvcihleGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcblx0dmFyIHNob3dSZXN1bHRzPWZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCl7XHJcblx0XHR2YXIgcmVzdWx0U3RyaW5nPWV4ZWN1dGlvblJlc3VsdC5nZXRWYWx1ZSgpO1xyXG5cdFx0dmFyIHRpbWVFbGFwc2VkPWV4ZWN1dGlvblJlc3VsdC5nZXRUaW1lRWxhcHNlZCgpO1xyXG5cdFx0bWFpblZpZXcuZGlzcGxheVJlc3VsdHMocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCk7XHJcblx0fTtcclxuXHJcblx0dmFyIHNob3dFcnJvcj1mdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcblx0XHRtYWluVmlldy5kaXNwbGF5RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG5cdH07XHJcblxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1BcHBsaWNhdGlvbjsiLCJ2YXIgQ29uZmlnPXtcclxuXHRNSU5fVEVTVFNfQ0FTRVM6MSxcclxuXHRNQVhfVEVTVFNfQ0FTRVM6NTAsXHJcblx0TUlOX0NVQkVfU0laRToxLFxyXG5cdE1BWF9DVUJFX1NJWkU6MTAwLFxyXG5cdE1JTl9URVNUX0NBU0VTX09QRVJBVElPTlM6MSxcclxuXHRNQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TOjEwMDAsXHJcblx0TUlOX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6LU1hdGgucG93KDEwLDkpLFxyXG5cdE1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFOk1hdGgucG93KDEwLDkpLFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHM9Q29uZmlnOyIsInZhciBDb25maWc9cmVxdWlyZSgnLi9Db25maWcnKTtcclxudmFyIEVycm9yTWVzc2FnZT17XHJcblx0Tk9fQ09NTUFORFNcdFx0XHRcdFx0XHQ6XCJObyBoYXkgY29tYW5kb3MgcGFyYSBlamVjdXRhclwiLFxyXG5cdEVNUFRZX0NPTU1BTkRcdFx0XHRcdFx0OlwiQ29tYW5kbyBlc3RhIHZhY2lvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVyb1wiLFxyXG5cdFRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFU1x0OlwiRXJyb3IgZGUgVmFsb3JlcywgZWwgY29tYW5kbyBkZWJlIGNvbnRlbmVyIHVuIG7Dum1lcm8gKHRlc3QgY2FzZXMpIGVudHJlIFwiK0NvbmZpZy5NSU5fVEVTVFNfQ0FTRVMrXCIgeSBcIitDb25maWcuTUFYX1RFU1RTX0NBU0VTLFxyXG5cdFRFU1RfQ0FTRV9DT01NQU5EX1NJTlRBWFx0XHQ6XCJFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBjb250ZW5lciBkb3MgbsO6bWVyb3Mgc2VwYXJhZG9zIHBvciB1biBlc3BhY2lvXCIsXHJcblx0VEVTVF9DQVNFX1dST05HX0NVQkVfU0laRVx0XHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGVsIHByaW1lciBudW1lcm8gKHRhbWHDsW8gZGVsIGN1Ym8pIGVudHJlIFwiK0NvbmZpZy5NSU5fQ1VCRV9TSVpFK1wiIHkgXCIrQ29uZmlnLk1BWF9DVUJFX1NJWkUsXHJcblx0VEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGVsIHNlZ3VuZG8gbnVtZXJvIChvcGVyYWNpb25lcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUX0NBU0VTX09QRVJBVElPTlMrXCIgeSBcIitDb25maWcuTUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyxcclxuXHRPUEVSQVRJT05fVU5LTk9XTlx0XHRcdFx0OlwiT3BlcmFjacOzbiBkZXNjb25vY2lkYVwiLFxyXG5cdFVQREFURV9DT01NQU5EX1NJTlRBWFx0XHRcdDonRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gIGRlYmUgc2VyIHNpbWlsYXIgYSBcIlVQREFURSAyIDIgMiA0XCIgKFJldmlzYXIgZXNwYWNpb3MpJyxcclxuXHRVUERBVEVfV1JPTkdfQ1VCRV9DRUxMU1x0XHQgICAgOidFcnJvciBkZSBWYWxvcmVzLCBsYXMgY29yZGVuYWRhcyBkZSBsYSBjZWxkYSBkZWwgY3VibyBzb24gaW52YWxpZGFzJyxcclxuXHRVUERBVEVfV1JPTkdfVkFMVUVfVE9fVVBEQVRFXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCB2YWxvciBhIGFjdHVhbGl6YXIgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFK1wiIHkgXCIrQ29uZmlnLk1BWF9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFLFxyXG5cdFFVRVJZX0NPTU1BTkRfU0lOVEFYXHRcdFx0OidFcnJvciBkZSBTaW50YXhpcywgZWwgY29tYW5kbyAgZGViZSBzZXIgc2ltaWxhciBhIFwiUVVFUlkgMSAxIDEgMyAzIDNcIiAoUmV2aXNhciBlc3BhY2lvcyknLFxyXG5cdFFVRVJZX1dST05HX0NVQkVfQ0VMTFNcdFx0ICAgIDonRXJyb3IgZGUgVmFsb3JlcywgbGFzIGNvcmRlbmFkYXMgZGUgbGFzIGNlbGRhcyBkZWwgY3VibyBzb24gaW52YWxpZGFzJyxcclxufTtcclxubW9kdWxlLmV4cG9ydHM9RXJyb3JNZXNzYWdlOyIsInZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZSgnLi4vY29uZmlnL0Vycm9yTWVzc2FnZScpO1xyXG52YXIgQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvYmFzZS9Db21tYW5kJyk7XHJcbnZhciBUZXN0UGxhbkNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RQbGFuQ29tbWFuZCcpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9UZXN0Q2FzZUNvbW1hbmQnKTtcclxudmFyIE9wZXJhdGlvbkNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL09wZXJhdGlvbkNvbW1hbmQnKTtcclxudmFyIEV4ZWN1dGlvbiA9IGZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKSB7XHJcbiAgICB2YXIgZXhlY0RlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICBjcmVhdGVDb21tYW5kcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBmdW5jdGlvbiBleHRyYWN0TGluZXMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRpZighY29tbWFuZHNTdHJpbmcgfHwgY29tbWFuZHNTdHJpbmc9PT0nJyl7XHJcbiAgICBcdFx0ZGlzcGF0Y2hFcnJvcignJywgRXJyb3JNZXNzYWdlLk5PX0NPTU1BTkRTLDApO1xyXG4gICAgXHRcdHJldHVybjtcclxuICAgIFx0fVxyXG4gICAgXHRyZXR1cm4gY29tbWFuZHNTdHJpbmcuc3BsaXQoJ1xcbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKXtcclxuICAgIFx0XHJcbiAgICBcdHZhciBsaW5lcz1leHRyYWN0TGluZXMoY29tbWFuZHNTdHJpbmcpO1xyXG4gICAgXHR2YXIgbnVtTGluZXM9bGluZXMgJiYgbGluZXMubGVuZ3RoO1xyXG4gICAgXHRpZighbGluZXMgfHwhbnVtTGluZXMpXHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHRcclxuICAgIFx0Ly92YXIgY29tbWFuZHM9W107XHJcbiAgICBcdFxyXG5cclxuICAgIFx0dmFyIGN1ckxpbmVOdW1iZXI9MDtcclxuICAgIFx0XHJcbiAgICBcdGZ1bmN0aW9uIGdldE5leHRMaW5lKCl7XHJcbiAgICBcdFx0aWYoY3VyTGluZU51bWJlcisxPD1udW1MaW5lcylcclxuICAgIFx0XHRcdGN1ckxpbmVOdW1iZXIrKztcclxuICAgIFx0XHRyZXR1cm4gbGluZXNbY3VyTGluZU51bWJlci0xXTtcclxuICAgIFx0fVxyXG5cclxuXHJcbiAgICBcdC8vbWFrZSBUZXN0UGxhbiBjb21tYW5kXHJcbiAgICBcdHZhciB0ZXN0UGxhbkNvbW1hbmQ9bmV3IFRlc3RQbGFuQ29tbWFuZChnZXROZXh0TGluZSgpKTtcclxuICAgIFx0dmFyIHZhbGlkYXRpb25UZXN0UGxhbj10ZXN0UGxhbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuICAgIFx0aWYodmFsaWRhdGlvblRlc3RQbGFuLmlzVmFsaWQoKSl7XHJcblxyXG4gICAgXHRcdC8vY29tbWFuZHMucHVzaCh0ZXN0UGxhbkNvbW1hbmQpO1xyXG4gICAgXHRcdHZhciBudW1UZXN0Q2FzZXM9dGVzdFBsYW5Db21tYW5kLmdldE51bVRlc3RDYXNlcygpO1xyXG5cclxuICAgIFx0XHRjcmVhdGlvblRlc3RDYXNlczp7XHJcblx0ICAgIFx0XHRmb3IodmFyIGk9MTtpPD1udW1UZXN0Q2FzZXM7aSsrKXtcclxuXHQgICAgXHRcdFx0ZGVidWdnZXI7XHJcblx0ICAgIFx0XHRcdHZhciB0ZXN0Q2FzZUNvbW1hbmQ9bmV3IFRlc3RDYXNlQ29tbWFuZChnZXROZXh0TGluZSgpKTtcclxuXHQgICAgXHRcdFx0dmFyIHZhbGlkYXRpb25UZXN0Q2FzZT10ZXN0Q2FzZUNvbW1hbmQudmFsaWRhdGUoKTtcclxuXHQgICAgXHRcdFx0ZGVidWdnZXI7XHJcblx0ICAgIFx0XHRcdGlmKHZhbGlkYXRpb25UZXN0Q2FzZS5pc1ZhbGlkKCkpe1xyXG5cdCAgICBcdFx0XHRcdFxyXG5cdCAgICBcdFx0XHRcdHRlc3RQbGFuQ29tbWFuZC5hZGRUZXN0Q2FzZUNvbW1hbmQodGVzdENhc2VDb21tYW5kKTtcclxuXHQgICAgXHRcdFx0XHR2YXIgbnVtT3BlcmF0aW9ucz10ZXN0Q2FzZUNvbW1hbmQuZ2V0TnVtT3BlcmF0aW9ucygpO1xyXG5cdCAgICBcdFx0XHRcdHZhciBjdWJlU2l6ZT10ZXN0Q2FzZUNvbW1hbmQuZ2V0Q3ViZVNpemUoKTtcclxuXHQgICAgXHRcdFx0XHRkZWJ1Z2dlcjtcclxuXHQgICAgXHRcdFx0XHRjcmVhdGlvbk9wZXJhdGlvbnM6e1xyXG5cdFx0ICAgIFx0XHRcdFx0Zm9yKHZhciBqPTE7ajw9bnVtT3BlcmF0aW9ucztqKyspe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRkZWJ1Z2dlcjtcclxuXHRcdCAgICBcdFx0XHRcdFx0dmFyIG9wZXJhdGlvbkNvbW1hbmQ9bmV3IE9wZXJhdGlvbkNvbW1hbmQoZ2V0TmV4dExpbmUoKSwgY3ViZVNpemUpO1x0XHJcblx0XHQgICAgXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uT3BlcmF0aW9uPW9wZXJhdGlvbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuXHRcdCAgICBcdFx0XHRcdFx0aWYodmFsaWRhdGlvbk9wZXJhdGlvbi5pc1ZhbGlkKCkpe1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdHRlc3RDYXNlQ29tbWFuZC5hZGRPcGVyYXRpb25Db21tYW5kKHRlc3RDYXNlQ29tbWFuZCk7XHJcblx0XHQgICAgXHRcdFx0XHRcdH1cclxuXHRcdCAgICBcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdCAgICBcdFx0XHRcdFx0XHRkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uT3BlcmF0aW9uLGN1ckxpbmVOdW1iZXIpO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdFx0ICAgIFx0XHRcdFx0XHRcdFxyXG5cdFx0ICAgIFx0XHRcdFx0XHR9XHJcblx0XHQgICAgXHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdFx0fVxyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHRcdGVsc2V7XHJcblx0ICAgIFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RDYXNlLGN1ckxpbmVOdW1iZXIpO1xyXG5cdCAgICBcdFx0XHRcdGJyZWFrIGNyZWF0aW9uVGVzdENhc2VzO1xyXG5cdCAgICBcdFx0XHR9XHJcblx0ICAgIFx0XHR9XHJcbiAgICBcdFx0fVxyXG5cclxuICAgIFx0fVxyXG4gICAgXHRlbHNle1xyXG4gICAgXHRcdGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb25UZXN0UGxhbixjdXJMaW5lTnVtYmVyKTtcclxuICAgIFx0fVxyXG4gICAgXHRjb25zb2xlLmxvZyh0ZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuXHJcblxyXG5cdCAgICAvKl8uZWFjaChsaW5lcywgZnVuY3Rpb24obGluZSwgaW5kZXgpe1xyXG5cdCAgICBcdGNvbnNvbGUubG9nKGluZGV4LCBsaW5lKTtcclxuXHQgICAgfSk7Ki9cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCBsaW5lICl7XHJcbiAgICBcdGRpc3BhdGNoRXJyb3IoXHJcbiAgICBcdFx0dmFsaWRhdGlvbi5nZXRDb21tYW5kU3RyaW5nKCksIFxyXG4gICAgXHRcdHZhbGlkYXRpb24uZ2V0RXJyb3JNZXNzYWdlKCksIFxyXG4gICAgXHRcdGxpbmUgXHJcbiAgICBcdCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBkaXNwYXRjaEVycm9yKGNvbW1hbmRTdHIsIGVycm9yTXNnLCBsaW5lICl7XHJcbiAgICBcdHZhciBlcnJvcj1uZXcgRXhlY3V0aW9uLkVycm9yKFxyXG4gICAgXHRcdGNvbW1hbmRTdHIsIFxyXG4gICAgXHRcdGVycm9yTXNnLCBcclxuICAgIFx0XHRsaW5lIFxyXG4gICAgXHQpO1xyXG4gICAgXHRleGVjRGVmZXJyZWQucmVqZWN0KGVycm9yKTtcdFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2V0UHJvbWlzZT1mdW5jdGlvbigpe1xyXG4gICAgXHRyZXR1cm4gZXhlY0RlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH07XHJcbiAgICBcclxufTtcclxuRXhlY3V0aW9uLlJlc3VsdCA9IGZ1bmN0aW9uKHZhbHVlLCB0aW1lRWxhcHNlZCwgZXhlY3V0aW9uKSB7XHJcbiAgICB2YXIgbVZhbHVlID0gdmFsdWU7XHJcbiAgICB2YXIgbVRpbWVFbGFwc2VkID0gdGltZUVsYXBzZWQ7XHJcbiAgICB0aGlzLmdldFZhbHVlPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1WYWx1ZTtcclxuICAgIH07XHJcbiAgICB0aGlzLmdldFRpbWVFbGFwc2VkPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1UaW1lRWxhcHNlZDtcclxuICAgIH07XHJcbn07XHJcbkV4ZWN1dGlvbi5FcnJvciA9IGZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcsIGVycm9yTWVzc2FnZSwgY29tbWFuZExpbmUpIHtcclxuXHR2YXIgbUNvbW1hbmRTdHJpbmcgPSBjb21tYW5kU3RyaW5nO1xyXG4gICAgdmFyIG1FcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XHJcbiAgICB2YXIgbUNvbW1hbmRMaW5lID0gY29tbWFuZExpbmU7XHJcbiAgICB0aGlzLmdldENvbW1hbmRTdHJpbmc9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUNvbW1hbmRTdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nZXRFcnJvck1lc3NhZ2U9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUVycm9yTWVzc2FnZTtcclxuICAgIH07XHRcclxuICAgIHRoaXMuZ2V0Q29tbWFuZExpbmU9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbUNvbW1hbmRMaW5lO1xyXG4gICAgfTtcdFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IEV4ZWN1dGlvbjtcclxuIiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFF1ZXJ5Q29tbWFuZD1yZXF1aXJlKFwiLi9RdWVyeUNvbW1hbmRcIik7XHJcbnZhciBVcGRhdGVDb21tYW5kPXJlcXVpcmUoXCIuL1VwZGF0ZUNvbW1hbmRcIik7XHJcblxyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBjdWJlU2l6ZSl7XHJcblx0ZGVidWdnZXI7XHJcblx0aWYoL15RVUVSWS8udGVzdChjb21tYW5kU3RyaW5nKSl7XHJcblx0XHRyZXR1cm4gbmV3IFF1ZXJ5Q29tbWFuZChjb21tYW5kU3RyaW5nLGN1YmVTaXplKTtcclxuXHR9XHJcblx0ZWxzZSBpZigvXlVQREFURS8udGVzdChjb21tYW5kU3RyaW5nKSl7XHJcblx0XHRyZXR1cm4gbmV3IFVwZGF0ZUNvbW1hbmQoY29tbWFuZFN0cmluZyxjdWJlU2l6ZSk7XHJcblx0fVxyXG5cdFxyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLk9QRVJBVElPTl9VTktOT1dOKTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRcdFxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblx0fTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPU9wZXJhdGlvbkNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBRdWVyeUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZywgX2N1YmVTaXplKXtcclxuXHRkZWJ1Z2dlcjtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgY3ViZVNpemU9X2N1YmVTaXplO1xyXG5cdHZhciBjZWxsWDE9MCxjZWxsWDI9MCxjZWxsWTE9MCxjZWxsWTI9MCxjZWxsWjE9MCxjZWxsWjI9MDtcclxuXHR2YXIgc2V0Q3ViZUNlbGxzPWZ1bmN0aW9uKFgxLFgyLFkxLFkyLFoxLFoyKXtcclxuXHRcdGNlbGxYMT1YMTtcclxuXHRcdGNlbGxYMj1YMjtcclxuXHRcdGNlbGxZMT1ZMTtcclxuXHRcdGNlbGxZMj1ZMjtcclxuXHRcdGNlbGxaMT1aMTtcclxuXHRcdGNlbGxaMj1aMjtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIHZhbGlkYXRlQ2VsbD1mdW5jdGlvbihjZWxsQ29vcmQpe1xyXG5cdFx0cmV0dXJuIGNlbGxDb29yZD49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY2VsbENvb3JkPD10aGF0LmdldEN1YmVTaXplKCk7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15RVUVSWVxcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9XFxkKyQvO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goLy0/XFxkKy9nKTtcclxuXHJcblx0XHRcdFx0dmFyIGNlbGxYMT1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBjZWxsWDI9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFkxPXBhcnNlSW50KHZhbHVlc1syXSk7XHJcblx0XHRcdFx0dmFyIGNlbGxZMj1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdHZhciBjZWxsWjE9cGFyc2VJbnQodmFsdWVzWzRdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFoyPXBhcnNlSW50KHZhbHVlc1s1XSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoXHJcblx0XHRcdFx0XHR2YWxpZGF0ZUNlbGwoY2VsbFgxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkxKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFoxKSAmJlxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxZMikgJiYgdmFsaWRhdGVDZWxsKGNlbGxaMilcclxuXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWDEsY2VsbFgyLGNlbGxZMSxjZWxsWTIsY2VsbFoxLGNlbGxaMik7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuUVVFUllfV1JPTkdfQ1VCRV9DRUxMUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlFVRVJZX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cclxuXHR9O1xyXG59O1xyXG5RdWVyeUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFF1ZXJ5Q29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9UXVlcnlDb21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcblxyXG52YXIgVGVzdENhc2VDb21tYW5kPWZ1bmN0aW9uKGNvbW1hbmRTdHJpbmcpe1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT0wO1xyXG5cdHZhciBudW1PcGVyYXRpb25zPTA7XHJcblx0dmFyIHNldEN1YmVTaXplPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRjdWJlU2l6ZT1udW07XHJcblx0fTtcclxuXHR2YXIgc2V0TnVtT3BlcmF0aW9ucz1mdW5jdGlvbihudW0pe1xyXG5cdFx0bnVtT3BlcmF0aW9ucz1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHR0aGlzLmdldE51bU9wZXJhdGlvbnM9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBudW1PcGVyYXRpb25zO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCtcXHN7MX1cXGQrJC87XHJcblx0XHRkZWJ1Z2dlcjtcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZXM9Y21kLm1hdGNoKC9cXGQrL2cpO1xyXG5cdFx0XHRcdHZhciBjdWJlU2l6ZT1wYXJzZUludCh2YWx1ZXNbMF0pO1xyXG5cdFx0XHRcdHZhciBudW1PcGVyYXRpb25zPXBhcnNlSW50KHZhbHVlc1sxXSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoY3ViZVNpemU+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGN1YmVTaXplPD1Db25maWcuTUFYX0NVQkVfU0laRSl7XHJcblx0XHRcdFx0XHRpZihudW1PcGVyYXRpb25zPj1Db25maWcuTUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyAmJiBudW1PcGVyYXRpb25zPD1Db25maWcuTUFYX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUyl7XHJcblx0XHRcdFx0XHRcdHNldEN1YmVTaXplKGN1YmVTaXplKTtcclxuXHRcdFx0XHRcdFx0c2V0TnVtT3BlcmF0aW9ucyhudW1PcGVyYXRpb25zKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9XUk9OR19OVU1fT1BFUkFUSU9OUyk7XHRcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX1dST05HX0NVQkVfU0laRSk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfQ0FTRV9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHR9O1xyXG5cdHRoaXMuYWRkT3BlcmF0aW9uQ29tbWFuZD1mdW5jdGlvbihvcGVyYXRpb25Db21tYW5kKXtcclxuXHJcblx0fTtcclxuXHJcbn07XHJcblxyXG5UZXN0Q2FzZUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFRlc3RDYXNlQ29tbWFuZCk7XHJcbm1vZHVsZS5leHBvcnRzPVRlc3RDYXNlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1yZXF1aXJlKFwiLi9iYXNlL0NvbW1hbmRcIik7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZShcIi4vVGVzdENhc2VDb21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nKXtcclxuXHRDb21tYW5kLmNhbGwodGhpcyxjb21tYW5kU3RyaW5nKTtcclxuXHR2YXIgbnVtVGVzdENhc2VzPTA7XHJcblx0dmFyIHNldE51bVRlc3RDYXNlcz1mdW5jdGlvbihudW0pe1xyXG5cdFx0bnVtVGVzdENhc2VzPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtVGVzdENhc2VzPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbnVtVGVzdENhc2VzO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0dmFyIGNtZD10aGlzLmdldENvbW1hbmRTdHJpbmcoKTtcclxuXHRcdHZhciB2YWxpZGF0aW9uPW5ldyBDb21tYW5kLlZhbGlkYXRpb24oY21kKTtcclxuXHRcdHZhciByZWdleD0vXlxcZCskLztcclxuXHRcdGlmKGNtZCE9PVwiXCIpe1xyXG5cdFx0XHRpZihyZWdleC50ZXN0KGNtZCkpe1xyXG5cdFx0XHRcdHZhciBudW09cGFyc2VJbnQoY21kKTtcclxuXHRcdFx0XHRpZihudW0+PUNvbmZpZy5NSU5fVEVTVFNfQ0FTRVMgJiYgbnVtPD1Db25maWcuTUFYX1RFU1RTX0NBU0VTKXtcclxuXHRcdFx0XHRcdHNldE51bVRlc3RDYXNlcyhudW0pO1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5zdWNjZXNzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1dST05HX1ZBTFVFUyk7XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLlRFU1RfUExBTl9DT01NQU5EX1NJTlRBWCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuRU1QVFlfQ09NTUFORCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdmFsaWRhdGlvbjtcclxuXHJcblx0fTtcclxuXHR0aGlzLmFkZFRlc3RDYXNlQ29tbWFuZD1mdW5jdGlvbih0ZXN0Q2FzZUNvbW1hbmQpe1xyXG5cclxuXHR9O1xyXG59O1xyXG5UZXN0UGxhbkNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9VGVzdFBsYW5Db21tYW5kOyIsInZhciBDb21tYW5kPXJlcXVpcmUoXCIuL2Jhc2UvQ29tbWFuZFwiKTtcclxudmFyIFRlc3RDYXNlQ29tbWFuZD1yZXF1aXJlKFwiLi9UZXN0Q2FzZUNvbW1hbmRcIik7XHJcbnZhciBFcnJvck1lc3NhZ2U9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0Vycm9yTWVzc2FnZVwiKTtcclxudmFyIENvbmZpZz1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvQ29uZmlnXCIpO1xyXG52YXIgVXBkYXRlQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kU3RyaW5nLCBfY3ViZVNpemUpe1xyXG5cdGRlYnVnZ2VyO1xyXG5cdENvbW1hbmQuY2FsbCh0aGlzLGNvbW1hbmRTdHJpbmcpO1xyXG5cdHZhciBjdWJlU2l6ZT1fY3ViZVNpemU7XHJcblx0dmFyIGNlbGxYPTA7XHJcblx0dmFyIGNlbGxZPTA7XHJcblx0dmFyIGNlbGxaPTA7XHJcblx0dmFyIHZhbHVlVG9VcGRhdGU9MDtcclxuXHR2YXIgc2V0Q3ViZUNlbGxzPWZ1bmN0aW9uKFgsWSxaKXtcclxuXHRcdGNlbGxYPVg7XHJcblx0XHRjZWxsWT1ZO1xyXG5cdFx0Y2VsbFo9WjtcclxuXHR9O1xyXG5cdHZhciBzZXRWYWx1ZVRvVHVwZGF0ZT1mdW5jdGlvbihudW0pe1xyXG5cdFx0dmFsdWVUb1VwZGF0ZT1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldEN1YmVTaXplPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY3ViZVNpemU7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHZhciB2YWxpZGF0ZUNlbGw9ZnVuY3Rpb24oY2VsbENvb3JkKXtcclxuXHRcdHJldHVybiBjZWxsQ29vcmQ+PUNvbmZpZy5NSU5fQ1VCRV9TSVpFICYmIGNlbGxDb29yZDw9dGhhdC5nZXRDdWJlU2l6ZSgpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbigpe1xyXG5cdFx0ZGVidWdnZXI7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eVVBEQVRFXFxzezF9XFxkK1xcc3sxfVxcZCtcXHN7MX1cXGQrXFxzezF9LT9cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgdmFsdWVzPWNtZC5tYXRjaCgvLT9cXGQrL2cpO1xyXG5cclxuXHRcdFx0XHR2YXIgY2VsbFg9cGFyc2VJbnQodmFsdWVzWzBdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFk9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHR2YXIgY2VsbFo9cGFyc2VJbnQodmFsdWVzWzJdKTtcclxuXHRcdFx0XHR2YXIgdmFsdWVUb1VwZGF0ZT1wYXJzZUludCh2YWx1ZXNbM10pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0dmFsaWRhdGVDZWxsKGNlbGxYKSAmJiB2YWxpZGF0ZUNlbGwoY2VsbFkpICYmIHZhbGlkYXRlQ2VsbChjZWxsWilcclxuXHJcblx0XHRcdFx0XHQpe1xyXG5cclxuXHRcdFx0XHRcdHNldEN1YmVDZWxscyhjZWxsWCxjZWxsWSxjZWxsWik7XHJcblxyXG5cdFx0XHRcdFx0aWYodmFsdWVUb1VwZGF0ZT49Q29uZmlnLk1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFICYmIHZhbHVlVG9VcGRhdGU8PUNvbmZpZy5NQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRSl7XHJcblx0XHRcdFx0XHRcdHNldFZhbHVlVG9UdXBkYXRlKHZhbHVlVG9VcGRhdGUpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX1dST05HX1ZBTFVFX1RPX1VQREFURSk7XHRcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVVBEQVRFX1dST05HX0NVQkVfQ0VMTFMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5VUERBVEVfQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcbn07XHJcblVwZGF0ZUNvbW1hbmQ9Q29tbWFuZC5leHRlbmRzKFVwZGF0ZUNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVVwZGF0ZUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0dmFyIGNvbW1hbmRTdHJpbmc9Y29tbWFuZDtcclxuXHR2YXIgZGVmZXJyZWQ9alF1ZXJ5LkRlZmVycmVkKCk7XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR0aGlzLmdldENvbW1hbmRTdHJpbmc9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjb21tYW5kU3RyaW5nLnRyaW0oKTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0UHJvbWlzZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0fTtcclxuXHR0aGlzLmRpc3BhdGNoU3VjZXNzPWZ1bmN0aW9uKHJlc3VsdCl7XHJcblx0XHR0aGlzLmdldFByb21pc2UoKS5zdWNjZXNzKHJlc3VsdCk7XHJcblx0fTtcclxuXHR0aGlzLmRpc3BhdGNoRXJyb3I9ZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dGhpcy5nZXRQcm9taXNlKCkucmVqZWN0KGVycm9yKTtcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZXhlY3V0ZT1mdW5jdGlvbigpe1xyXG5cclxuXHR9O1xyXG5cclxufTtcclxuQ29tbWFuZC5leHRlbmRzPWZ1bmN0aW9uKENoaWxkKXtcclxuXHRmdW5jdGlvbiBGKCkge31cclxuXHRGLnByb3RvdHlwZSA9IENvbW1hbmQucHJvdG90eXBlO1xyXG5cdENoaWxkLnByb3RvdHlwZT1uZXcgRigpO1xyXG5cdF8uZXh0ZW5kKENoaWxkLnByb3RvdHlwZSxDb21tYW5kLnByb3RvdHlwZSk7XHJcblx0cmV0dXJuIENoaWxkO1xyXG59O1xyXG5Db21tYW5kLlZhbGlkYXRpb249ZnVuY3Rpb24oY29tbWFuZCl7XHJcblx0dmFyIGNvbW1hbmRTdHJpbmc9Y29tbWFuZDtcclxuXHR2YXIgZXJyb3JNc2c9XCJcIjtcclxuXHR2YXIgaXNWYWxpZD1mYWxzZTtcclxuXHR0aGlzLmZhaWw9ZnVuY3Rpb24oZXJyb3JNZXNzYWdlKXtcclxuXHRcdGVycm9yTXNnPWVycm9yTWVzc2FnZTtcclxuXHRcdGlzVmFsaWQ9ZmFsc2U7XHJcblx0fTtcclxuXHR0aGlzLnN1Y2Nlc3M9ZnVuY3Rpb24oKXtcclxuXHRcdGVycm9yTXNnPVwiXCI7XHJcblx0XHRpc1ZhbGlkPXRydWU7XHJcblx0fTtcclxuXHR0aGlzLmdldENvbW1hbmRTdHJpbmc9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjb21tYW5kU3RyaW5nO1xyXG5cdH07XHJcblx0dGhpcy5nZXRFcnJvck1lc3NhZ2U9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBlcnJvck1zZztcclxuXHR9O1xyXG5cdHRoaXMuaXNWYWxpZD1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblx0fTtcclxufTtcclxuLypDb21tYW5kLlR5cGU9e1xyXG5cdFRFU1RfUExBTjonVEVTVF9QTEFOJyxcclxuXHRURVNUX0NBU0U6J1RFU1RfQ0FTRScsXHJcblx0UVVFUlk6J1FVRVJZJyxcclxuXHRVUERBVEU6J1VQREFURScsXHJcbn07Ki9cclxubW9kdWxlLmV4cG9ydHM9Q29tbWFuZDsiLCJ2YXIgQXBwbGljYXRpb249cmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdHZhciBhcHA9bmV3IEFwcGxpY2F0aW9uKCk7XHJcblx0YXBwLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgQ29tbWFuZHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gIGVsOiAnI21haW4tdmlldycsXHJcbiAgY29tbWFuZHNJbnB1dDpudWxsLFxyXG4gIGV4ZWN1dGlvbk91dHB1dDpudWxsLFxyXG4gIGV2ZW50czp7XHJcbiAgXHQnY2xpY2sgI2V4ZWN1dGUtYnV0dG9uJzonX29uRXhlY3V0ZUJ0bkNsaWNrJ1xyXG4gIH0sXHJcbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xyXG4gIFx0dGhpcy5jb21tYW5kc0lucHV0PXRoaXMuJCgnI2NvbW1hbmRzLXRleHQnKTtcclxuICAgIFxyXG5cclxuICAgIHZhciBkdW1teUNvbW1hbmRzPSAgXCIyXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuNCA1XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDIgMiAyIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAxIDEgMSAyM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDQgNCA0XCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMyAzIDNcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG4yIDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgMVwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDEgMSAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMiAyIDJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAyIDIgMiAyIDIgMlwiO1xyXG5cclxuXHJcbiAgICB0aGlzLmNvbW1hbmRzSW5wdXQudmFsKGR1bW15Q29tbWFuZHMpO1xyXG4gIFx0dGhpcy5leGVjdXRpb25PdXRwdXQ9dGhpcy4kKCcjZXhlY3V0aW9uLXJlc3VsdC10ZXh0Jyk7XHJcbiAgfSxcclxuICBfb25FeGVjdXRlQnRuQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgXHR0aGlzLl9kaXNwYXRjaEV4ZWN1dGUoKTtcclxuXHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nLCB0aW1lRWxhcHNlZCl7XHJcbiAgXHR0aGlzLl9zaG93UmVzdWx0cyhyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgX3Nob3dSZXN1bHRzOmZ1bmN0aW9uKHJlc3VsdFN0cmluZyl7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwocmVzdWx0U3RyaW5nKTtcclxuICB9LFxyXG4gIGRpc3BsYXlFcnJvcjpmdW5jdGlvbihleGVjdXRpb25FcnJvcil7XHJcbiAgICB0aGlzLmV4ZWN1dGlvbk91dHB1dC52YWwoZXhlY3V0aW9uRXJyb3IuZ2V0RXJyb3JNZXNzYWdlKCkpO1xyXG4gIH1cclxufSx7XHJcblx0RVhFQ1VUSU9OX1NUQVJURUQ6J2V4ZWN1dGlvbi1zdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
