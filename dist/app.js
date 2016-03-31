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


    		for(var i=1;i<=numTestCases;i++){
    			debugger;
    			var testCaseCommand=new TestCaseCommand(getNextLine());
    			var validationTestCase=testCaseCommand.validate();
    			debugger;
    			if(validationTestCase.isValid()){
    				
    				testPlanCommand.addTestCaseCommand(testCaseCommand);
    				var numOperations=testCaseCommand.getNumOperations();
    				var cubeSize=testCaseCommand.getCubeSize();
    				for(var j=1;j<=numOperations;j++){
    					var operationCommand=new OperationCommand(getNextLine(), cubeSize);	
    					var validationOperation=operationCommand.validate();
    					if(validationOperation.isValid()){
    						testCaseCommand.addOperationCommand(testCaseCommand);
    					}
    					else{
    						dispatchValidationError(validationOperation,curLineNumber);
    						break;
    					}
    				}
    			}
    			else{
    				dispatchValidationError(validationTestCase,curLineNumber);
    				break;
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
var OperationCommand=function(){

};
module.exports=OperationCommand;
},{}],6:[function(require,module,exports){
var QueryCommand=function(){

};
module.exports=QueryCommand;
},{}],7:[function(require,module,exports){
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
	this.addOperationCommand=function(testCaseCommand){

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
var UpdateCommand=function(){

};
module.exports=UpdateCommand;
},{}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb25maWcvRXJyb3JNZXNzYWdlLmpzIiwiYXBwL2NvcmUvRXhlY3V0aW9uLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9PcGVyYXRpb25Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9RdWVyeUNvbW1hbmQuanMiLCJhcHAvY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZC5qcyIsImFwcC9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9VcGRhdGVDb21tYW5kLmpzIiwiYXBwL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQuanMiLCJhcHAvbWFpbi5qcyIsImFwcC92aWV3cy9Db21tYW5kc1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENvbW1hbmRzVmlldz1yZXF1aXJlKCcuL3ZpZXdzL0NvbW1hbmRzVmlldycpO1xyXG52YXIgRXhlY3V0aW9uPXJlcXVpcmUoJy4vY29yZS9FeGVjdXRpb24nKTtcclxudmFyIEFwcGxpY2F0aW9uPWZ1bmN0aW9uKCl7XHJcblx0dmFyIG1haW5WaWV3PW51bGw7XHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHR0aGlzLnN0YXJ0PWZ1bmN0aW9uKCl7XHJcblx0XHRtYWluVmlldz1uZXcgQ29tbWFuZHNWaWV3KCk7XHJcblx0XHRtYWluVmlldy5vbihDb21tYW5kc1ZpZXcuRVhFQ1VUSU9OX1NUQVJURUQsIF9vbkV4ZWN0aW9uU3RhcnRlZCk7XHJcblx0fTtcclxuXHJcblx0dmFyIF9vbkV4ZWN0aW9uU3RhcnRlZD1mdW5jdGlvbihjb21tYW5kc1N0cmluZyl7XHJcblx0XHRleGVjdXRlKGNvbW1hbmRzU3RyaW5nKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgZXhlY3V0ZT1mdW5jdGlvbihjb21tYW5kc1N0cmluZyl7XHJcblx0XHR2YXIgZXhlY3V0aW9uPW5ldyBFeGVjdXRpb24oY29tbWFuZHNTdHJpbmcpO1xyXG5cdFx0ZXhlY3V0aW9uLmdldFByb21pc2UoKS50aGVuKF9vbkV4ZWN1dGlvblN1Y2Nlc3MsX29uRXhlY3V0aW9uRXJyb3IpO1xyXG5cdH07XHJcblxyXG5cdHZhciBfb25FeGVjdXRpb25TdWNjZXNzPWZ1bmN0aW9uKGV4ZWN1dGlvblJlc3VsdCl7XHJcblx0XHRjb25zb2xlLmxvZyhcInJlc3VsdGFkbyBmdWVcIiwgZXhlY3V0aW9uUmVzdWx0KTtcclxuXHRcdHNob3dSZXN1bHRzKGV4ZWN1dGlvblJlc3VsdCk7XHJcblx0fTtcclxuXHJcblx0dmFyIF9vbkV4ZWN1dGlvbkVycm9yPWZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuXHRcdGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGNvbiBlcnJvciBmdWVcIiwgZXhlY3V0aW9uRXJyb3IpO1xyXG5cdFx0c2hvd0Vycm9yKGV4ZWN1dGlvbkVycm9yKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc2hvd1Jlc3VsdHM9ZnVuY3Rpb24oZXhlY3V0aW9uUmVzdWx0KXtcclxuXHRcdHZhciByZXN1bHRTdHJpbmc9ZXhlY3V0aW9uUmVzdWx0LmdldFZhbHVlKCk7XHJcblx0XHR2YXIgdGltZUVsYXBzZWQ9ZXhlY3V0aW9uUmVzdWx0LmdldFRpbWVFbGFwc2VkKCk7XHJcblx0XHRtYWluVmlldy5kaXNwbGF5UmVzdWx0cyhyZXN1bHRTdHJpbmcsIHRpbWVFbGFwc2VkKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc2hvd0Vycm9yPWZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuXHRcdG1haW5WaWV3LmRpc3BsYXlFcnJvcihleGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPUFwcGxpY2F0aW9uOyIsInZhciBDb25maWc9e1xyXG5cdE1JTl9URVNUU19DQVNFUzoxLFxyXG5cdE1BWF9URVNUU19DQVNFUzo1MCxcclxuXHRNSU5fQ1VCRV9TSVpFOjEsXHJcblx0TUFYX0NVQkVfU0laRToxMDAsXHJcblx0TUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxLFxyXG5cdE1BWF9URVNUX0NBU0VTX09QRVJBVElPTlM6MTAwMCxcclxuXHRNSU5fQ1VCRV9DRUxMX1VQREFURV9WQUxVRTotTWF0aC5wb3coMTAsOSksXHJcblx0TUFYX0NVQkVfQ0VMTF9VUERBVEVfVkFMVUU6TWF0aC5wb3coMTAsOSksXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cz1Db25maWc7IiwidmFyIENvbmZpZz1yZXF1aXJlKCcuL0NvbmZpZycpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXtcclxuXHROT19DT01NQU5EU1x0XHRcdFx0XHRcdDpcIk5vIGhheSBjb21hbmRvcyBwYXJhIGVqZWN1dGFyXCIsXHJcblx0RU1QVFlfQ09NTUFORFx0XHRcdFx0XHQ6XCJDb21hbmRvIGVzdGEgdmFjaW9cIixcclxuXHRURVNUX1BMQU5fQ09NTUFORF9TSU5UQVhcdFx0OlwiRXJyb3IgZGUgU2ludGF4aXMsIGVsIGNvbWFuZG8gZGViZSBjb250ZW5lciB1biBuw7ptZXJvXCIsXHJcblx0VEVTVF9QTEFOX0NPTU1BTkRfV1JPTkdfVkFMVUVTXHQ6XCJFcnJvciBkZSBWYWxvcmVzLCBlbCBjb21hbmRvIGRlYmUgY29udGVuZXIgdW4gbsO6bWVybyAodGVzdCBjYXNlcykgZW50cmUgXCIrQ29uZmlnLk1JTl9URVNUU19DQVNFUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVFNfQ0FTRVMsXHJcblx0VEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYXHRcdDpcIkVycm9yIGRlIFNpbnRheGlzLCBlbCBjb21hbmRvICBkZWJlIGNvbnRlbmVyIGRvcyBuw7ptZXJvcyBzZXBhcmFkb3MgcG9yIHVuIGVzcGFjaW9cIixcclxuXHRURVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFXHRcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgcHJpbWVyIG51bWVybyAodGFtYcOxbyBkZWwgY3VibykgZW50cmUgXCIrQ29uZmlnLk1JTl9DVUJFX1NJWkUrXCIgeSBcIitDb25maWcuTUFYX0NVQkVfU0laRSxcclxuXHRURVNUX0NBU0VfV1JPTkdfTlVNX09QRVJBVElPTlNcdDpcIkVycm9yIGRlIFZhbG9yZXMsIGVsIGNvbWFuZG8gIGRlYmUgY29udGVuZXIgZWwgc2VndW5kbyBudW1lcm8gKG9wZXJhY2lvbmVzKSBlbnRyZSBcIitDb25maWcuTUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUytcIiB5IFwiK0NvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TLFxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1FcnJvck1lc3NhZ2U7IiwidmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKCcuLi9jb25maWcvRXJyb3JNZXNzYWdlJyk7XHJcbnZhciBDb21tYW5kPXJlcXVpcmUoJy4uL2NvcmUvY29tbWFuZC9iYXNlL0NvbW1hbmQnKTtcclxudmFyIFRlc3RQbGFuQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvVGVzdFBsYW5Db21tYW5kJyk7XHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9cmVxdWlyZSgnLi4vY29yZS9jb21tYW5kL1Rlc3RDYXNlQ29tbWFuZCcpO1xyXG52YXIgT3BlcmF0aW9uQ29tbWFuZD1yZXF1aXJlKCcuLi9jb3JlL2NvbW1hbmQvT3BlcmF0aW9uQ29tbWFuZCcpO1xyXG52YXIgRXhlY3V0aW9uID0gZnVuY3Rpb24oY29tbWFuZHNTdHJpbmcpIHtcclxuICAgIHZhciBleGVjRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgIGNyZWF0ZUNvbW1hbmRzKGNvbW1hbmRzU3RyaW5nKTtcclxuICAgIGZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyl7XHJcbiAgICBcdGlmKCFjb21tYW5kc1N0cmluZyB8fCBjb21tYW5kc1N0cmluZz09PScnKXtcclxuICAgIFx0XHRkaXNwYXRjaEVycm9yKCcnLCBFcnJvck1lc3NhZ2UuTk9fQ09NTUFORFMsMCk7XHJcbiAgICBcdFx0cmV0dXJuO1xyXG4gICAgXHR9XHJcbiAgICBcdHJldHVybiBjb21tYW5kc1N0cmluZy5zcGxpdCgnXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZHMoY29tbWFuZHNTdHJpbmcpe1xyXG4gICAgXHRcclxuICAgIFx0dmFyIGxpbmVzPWV4dHJhY3RMaW5lcyhjb21tYW5kc1N0cmluZyk7XHJcbiAgICBcdHZhciBudW1MaW5lcz1saW5lcyAmJiBsaW5lcy5sZW5ndGg7XHJcbiAgICBcdGlmKCFsaW5lcyB8fCFudW1MaW5lcylcclxuICAgIFx0XHRyZXR1cm47XHJcbiAgICBcdFxyXG4gICAgXHQvL3ZhciBjb21tYW5kcz1bXTtcclxuICAgIFx0XHJcblxyXG4gICAgXHR2YXIgY3VyTGluZU51bWJlcj0wO1xyXG4gICAgXHRcclxuICAgIFx0ZnVuY3Rpb24gZ2V0TmV4dExpbmUoKXtcclxuICAgIFx0XHRpZihjdXJMaW5lTnVtYmVyKzE8PW51bUxpbmVzKVxyXG4gICAgXHRcdFx0Y3VyTGluZU51bWJlcisrO1xyXG4gICAgXHRcdHJldHVybiBsaW5lc1tjdXJMaW5lTnVtYmVyLTFdO1xyXG4gICAgXHR9XHJcblxyXG5cclxuICAgIFx0Ly9tYWtlIFRlc3RQbGFuIGNvbW1hbmRcclxuICAgIFx0dmFyIHRlc3RQbGFuQ29tbWFuZD1uZXcgVGVzdFBsYW5Db21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG4gICAgXHR2YXIgdmFsaWRhdGlvblRlc3RQbGFuPXRlc3RQbGFuQ29tbWFuZC52YWxpZGF0ZSgpO1xyXG4gICAgXHRpZih2YWxpZGF0aW9uVGVzdFBsYW4uaXNWYWxpZCgpKXtcclxuXHJcbiAgICBcdFx0Ly9jb21tYW5kcy5wdXNoKHRlc3RQbGFuQ29tbWFuZCk7XHJcbiAgICBcdFx0dmFyIG51bVRlc3RDYXNlcz10ZXN0UGxhbkNvbW1hbmQuZ2V0TnVtVGVzdENhc2VzKCk7XHJcblxyXG5cclxuICAgIFx0XHRmb3IodmFyIGk9MTtpPD1udW1UZXN0Q2FzZXM7aSsrKXtcclxuICAgIFx0XHRcdGRlYnVnZ2VyO1xyXG4gICAgXHRcdFx0dmFyIHRlc3RDYXNlQ29tbWFuZD1uZXcgVGVzdENhc2VDb21tYW5kKGdldE5leHRMaW5lKCkpO1xyXG4gICAgXHRcdFx0dmFyIHZhbGlkYXRpb25UZXN0Q2FzZT10ZXN0Q2FzZUNvbW1hbmQudmFsaWRhdGUoKTtcclxuICAgIFx0XHRcdGRlYnVnZ2VyO1xyXG4gICAgXHRcdFx0aWYodmFsaWRhdGlvblRlc3RDYXNlLmlzVmFsaWQoKSl7XHJcbiAgICBcdFx0XHRcdFxyXG4gICAgXHRcdFx0XHR0ZXN0UGxhbkNvbW1hbmQuYWRkVGVzdENhc2VDb21tYW5kKHRlc3RDYXNlQ29tbWFuZCk7XHJcbiAgICBcdFx0XHRcdHZhciBudW1PcGVyYXRpb25zPXRlc3RDYXNlQ29tbWFuZC5nZXROdW1PcGVyYXRpb25zKCk7XHJcbiAgICBcdFx0XHRcdHZhciBjdWJlU2l6ZT10ZXN0Q2FzZUNvbW1hbmQuZ2V0Q3ViZVNpemUoKTtcclxuICAgIFx0XHRcdFx0Zm9yKHZhciBqPTE7ajw9bnVtT3BlcmF0aW9ucztqKyspe1xyXG4gICAgXHRcdFx0XHRcdHZhciBvcGVyYXRpb25Db21tYW5kPW5ldyBPcGVyYXRpb25Db21tYW5kKGdldE5leHRMaW5lKCksIGN1YmVTaXplKTtcdFxyXG4gICAgXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uT3BlcmF0aW9uPW9wZXJhdGlvbkNvbW1hbmQudmFsaWRhdGUoKTtcclxuICAgIFx0XHRcdFx0XHRpZih2YWxpZGF0aW9uT3BlcmF0aW9uLmlzVmFsaWQoKSl7XHJcbiAgICBcdFx0XHRcdFx0XHR0ZXN0Q2FzZUNvbW1hbmQuYWRkT3BlcmF0aW9uQ29tbWFuZCh0ZXN0Q2FzZUNvbW1hbmQpO1xyXG4gICAgXHRcdFx0XHRcdH1cclxuICAgIFx0XHRcdFx0XHRlbHNle1xyXG4gICAgXHRcdFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbk9wZXJhdGlvbixjdXJMaW5lTnVtYmVyKTtcclxuICAgIFx0XHRcdFx0XHRcdGJyZWFrO1xyXG4gICAgXHRcdFx0XHRcdH1cclxuICAgIFx0XHRcdFx0fVxyXG4gICAgXHRcdFx0fVxyXG4gICAgXHRcdFx0ZWxzZXtcclxuICAgIFx0XHRcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RDYXNlLGN1ckxpbmVOdW1iZXIpO1xyXG4gICAgXHRcdFx0XHRicmVhaztcclxuICAgIFx0XHRcdH1cclxuICAgIFx0XHR9XHJcblxyXG4gICAgXHR9XHJcbiAgICBcdGVsc2V7XHJcbiAgICBcdFx0ZGlzcGF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvblRlc3RQbGFuLGN1ckxpbmVOdW1iZXIpO1xyXG4gICAgXHR9XHJcbiAgICBcdGNvbnNvbGUubG9nKHRlc3RQbGFuQ29tbWFuZCk7XHJcblxyXG5cclxuXHJcblx0ICAgIC8qXy5lYWNoKGxpbmVzLCBmdW5jdGlvbihsaW5lLCBpbmRleCl7XHJcblx0ICAgIFx0Y29uc29sZS5sb2coaW5kZXgsIGxpbmUpO1xyXG5cdCAgICB9KTsqL1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoVmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb24sIGxpbmUgKXtcclxuICAgIFx0ZGlzcGF0Y2hFcnJvcihcclxuICAgIFx0XHR2YWxpZGF0aW9uLmdldENvbW1hbmRTdHJpbmcoKSwgXHJcbiAgICBcdFx0dmFsaWRhdGlvbi5nZXRFcnJvck1lc3NhZ2UoKSwgXHJcbiAgICBcdFx0bGluZSBcclxuICAgIFx0KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoRXJyb3IoY29tbWFuZFN0ciwgZXJyb3JNc2csIGxpbmUgKXtcclxuICAgIFx0dmFyIGVycm9yPW5ldyBFeGVjdXRpb24uRXJyb3IoXHJcbiAgICBcdFx0Y29tbWFuZFN0ciwgXHJcbiAgICBcdFx0ZXJyb3JNc2csIFxyXG4gICAgXHRcdGxpbmUgXHJcbiAgICBcdCk7XHJcbiAgICBcdGV4ZWNEZWZlcnJlZC5yZWplY3QoZXJyb3IpO1x0XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcbiAgICBcdHJldHVybiBleGVjRGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfTtcclxuICAgIFxyXG59O1xyXG5FeGVjdXRpb24uUmVzdWx0ID0gZnVuY3Rpb24odmFsdWUsIHRpbWVFbGFwc2VkLCBleGVjdXRpb24pIHtcclxuICAgIHZhciBtVmFsdWUgPSB2YWx1ZTtcclxuICAgIHZhciBtVGltZUVsYXBzZWQgPSB0aW1lRWxhcHNlZDtcclxuICAgIHRoaXMuZ2V0VmFsdWU9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbVZhbHVlO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2V0VGltZUVsYXBzZWQ9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbVRpbWVFbGFwc2VkO1xyXG4gICAgfTtcclxufTtcclxuRXhlY3V0aW9uLkVycm9yID0gZnVuY3Rpb24oY29tbWFuZFN0cmluZywgZXJyb3JNZXNzYWdlLCBjb21tYW5kTGluZSkge1xyXG5cdHZhciBtQ29tbWFuZFN0cmluZyA9IGNvbW1hbmRTdHJpbmc7XHJcbiAgICB2YXIgbUVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcclxuICAgIHZhciBtQ29tbWFuZExpbmUgPSBjb21tYW5kTGluZTtcclxuICAgIHRoaXMuZ2V0Q29tbWFuZFN0cmluZz0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtQ29tbWFuZFN0cmluZztcclxuICAgIH07XHJcbiAgICB0aGlzLmdldEVycm9yTWVzc2FnZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtRXJyb3JNZXNzYWdlO1xyXG4gICAgfTtcdFxyXG4gICAgdGhpcy5nZXRDb21tYW5kTGluZT0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtQ29tbWFuZExpbmU7XHJcbiAgICB9O1x0XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gRXhlY3V0aW9uO1xyXG4iLCJ2YXIgT3BlcmF0aW9uQ29tbWFuZD1mdW5jdGlvbigpe1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHM9T3BlcmF0aW9uQ29tbWFuZDsiLCJ2YXIgUXVlcnlDb21tYW5kPWZ1bmN0aW9uKCl7XHJcblxyXG59O1xyXG5tb2R1bGUuZXhwb3J0cz1RdWVyeUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgRXJyb3JNZXNzYWdlPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9FcnJvck1lc3NhZ2VcIik7XHJcbnZhciBDb25maWc9cmVxdWlyZShcIi4vLi4vLi4vY29uZmlnL0NvbmZpZ1wiKTtcclxuXHJcbnZhciBUZXN0Q2FzZUNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZyl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIGN1YmVTaXplPTA7XHJcblx0dmFyIG51bU9wZXJhdGlvbnM9MDtcclxuXHR2YXIgc2V0Q3ViZVNpemU9ZnVuY3Rpb24obnVtKXtcclxuXHRcdGN1YmVTaXplPW51bTtcclxuXHR9O1xyXG5cdHZhciBzZXROdW1PcGVyYXRpb25zPWZ1bmN0aW9uKG51bSl7XHJcblx0XHRudW1PcGVyYXRpb25zPW51bTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q3ViZVNpemU9ZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBjdWJlU2l6ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0TnVtT3BlcmF0aW9ucz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bU9wZXJhdGlvbnM7XHJcblx0fTtcclxuXHR0aGlzLnZhbGlkYXRlPWZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY21kPXRoaXMuZ2V0Q29tbWFuZFN0cmluZygpO1xyXG5cdFx0dmFyIHZhbGlkYXRpb249bmV3IENvbW1hbmQuVmFsaWRhdGlvbihjbWQpO1xyXG5cdFx0dmFyIHJlZ2V4PS9eXFxkK1xcc3sxfVxcZCskLztcclxuXHRcdGRlYnVnZ2VyO1xyXG5cdFx0aWYoY21kIT09XCJcIil7XHJcblx0XHRcdGlmKHJlZ2V4LnRlc3QoY21kKSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlcz1jbWQubWF0Y2goL1xcZCsvZyk7XHJcblx0XHRcdFx0dmFyIGN1YmVTaXplPXBhcnNlSW50KHZhbHVlc1swXSk7XHJcblx0XHRcdFx0dmFyIG51bU9wZXJhdGlvbnM9cGFyc2VJbnQodmFsdWVzWzFdKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihjdWJlU2l6ZT49Q29uZmlnLk1JTl9DVUJFX1NJWkUgJiYgY3ViZVNpemU8PUNvbmZpZy5NQVhfQ1VCRV9TSVpFKXtcclxuXHRcdFx0XHRcdGlmKG51bU9wZXJhdGlvbnM+PUNvbmZpZy5NSU5fVEVTVF9DQVNFU19PUEVSQVRJT05TICYmIG51bU9wZXJhdGlvbnM8PUNvbmZpZy5NQVhfVEVTVF9DQVNFU19PUEVSQVRJT05TKXtcclxuXHRcdFx0XHRcdFx0c2V0Q3ViZVNpemUoY3ViZVNpemUpO1xyXG5cdFx0XHRcdFx0XHRzZXROdW1PcGVyYXRpb25zKG51bU9wZXJhdGlvbnMpO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0aW9uLnN1Y2Nlc3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX1dST05HX05VTV9PUEVSQVRJT05TKTtcdFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX0NBU0VfV1JPTkdfQ1VCRV9TSVpFKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHZhbGlkYXRpb24uZmFpbChFcnJvck1lc3NhZ2UuVEVTVF9DQVNFX0NPTU1BTkRfU0lOVEFYKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5FTVBUWV9DT01NQU5EKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZGF0aW9uO1xyXG5cdH07XHJcblx0dGhpcy5hZGRPcGVyYXRpb25Db21tYW5kPWZ1bmN0aW9uKHRlc3RDYXNlQ29tbWFuZCl7XHJcblxyXG5cdH07XHJcblxyXG59O1xyXG5cclxuVGVzdENhc2VDb21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0Q2FzZUNvbW1hbmQpO1xyXG5tb2R1bGUuZXhwb3J0cz1UZXN0Q2FzZUNvbW1hbmQ7IiwidmFyIENvbW1hbmQ9cmVxdWlyZShcIi4vYmFzZS9Db21tYW5kXCIpO1xyXG52YXIgVGVzdENhc2VDb21tYW5kPXJlcXVpcmUoXCIuL1Rlc3RDYXNlQ29tbWFuZFwiKTtcclxudmFyIEVycm9yTWVzc2FnZT1yZXF1aXJlKFwiLi8uLi8uLi9jb25maWcvRXJyb3JNZXNzYWdlXCIpO1xyXG52YXIgQ29uZmlnPXJlcXVpcmUoXCIuLy4uLy4uL2NvbmZpZy9Db25maWdcIik7XHJcbnZhciBUZXN0UGxhbkNvbW1hbmQ9ZnVuY3Rpb24oY29tbWFuZFN0cmluZyl7XHJcblx0Q29tbWFuZC5jYWxsKHRoaXMsY29tbWFuZFN0cmluZyk7XHJcblx0dmFyIG51bVRlc3RDYXNlcz0wO1xyXG5cdHZhciBzZXROdW1UZXN0Q2FzZXM9ZnVuY3Rpb24obnVtKXtcclxuXHRcdG51bVRlc3RDYXNlcz1udW07XHJcblx0fTtcclxuXHR0aGlzLmdldE51bVRlc3RDYXNlcz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIG51bVRlc3RDYXNlcztcclxuXHR9O1xyXG5cdHRoaXMudmFsaWRhdGU9ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjbWQ9dGhpcy5nZXRDb21tYW5kU3RyaW5nKCk7XHJcblx0XHR2YXIgdmFsaWRhdGlvbj1uZXcgQ29tbWFuZC5WYWxpZGF0aW9uKGNtZCk7XHJcblx0XHR2YXIgcmVnZXg9L15cXGQrJC87XHJcblx0XHRpZihjbWQhPT1cIlwiKXtcclxuXHRcdFx0aWYocmVnZXgudGVzdChjbWQpKXtcclxuXHRcdFx0XHR2YXIgbnVtPXBhcnNlSW50KGNtZCk7XHJcblx0XHRcdFx0aWYobnVtPj1Db25maWcuTUlOX1RFU1RTX0NBU0VTICYmIG51bTw9Q29uZmlnLk1BWF9URVNUU19DQVNFUyl7XHJcblx0XHRcdFx0XHRzZXROdW1UZXN0Q2FzZXMobnVtKTtcclxuXHRcdFx0XHRcdHZhbGlkYXRpb24uc3VjY2VzcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX1BMQU5fQ09NTUFORF9XUk9OR19WQUxVRVMpO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFsaWRhdGlvbi5mYWlsKEVycm9yTWVzc2FnZS5URVNUX1BMQU5fQ09NTUFORF9TSU5UQVgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR2YWxpZGF0aW9uLmZhaWwoRXJyb3JNZXNzYWdlLkVNUFRZX0NPTU1BTkQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHZhbGlkYXRpb247XHJcblxyXG5cdH07XHJcblx0dGhpcy5hZGRUZXN0Q2FzZUNvbW1hbmQ9ZnVuY3Rpb24odGVzdENhc2VDb21tYW5kKXtcclxuXHJcblx0fTtcclxufTtcclxuVGVzdFBsYW5Db21tYW5kPUNvbW1hbmQuZXh0ZW5kcyhUZXN0UGxhbkNvbW1hbmQpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVRlc3RQbGFuQ29tbWFuZDsiLCJ2YXIgVXBkYXRlQ29tbWFuZD1mdW5jdGlvbigpe1xyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHM9VXBkYXRlQ29tbWFuZDsiLCJ2YXIgQ29tbWFuZD1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBkZWZlcnJlZD1qUXVlcnkuRGVmZXJyZWQoKTtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmcudHJpbSgpO1xyXG5cdH07XHJcblx0dGhpcy5nZXRQcm9taXNlPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hTdWNlc3M9ZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdHRoaXMuZ2V0UHJvbWlzZSgpLnN1Y2Nlc3MocmVzdWx0KTtcclxuXHR9O1xyXG5cdHRoaXMuZGlzcGF0Y2hFcnJvcj1mdW5jdGlvbihlcnJvcil7XHJcblx0XHR0aGlzLmdldFByb21pc2UoKS5yZWplY3QoZXJyb3IpO1xyXG5cdH07XHJcblx0dGhpcy52YWxpZGF0ZT1mdW5jdGlvbihjb21tYW5kKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH07XHJcblx0dGhpcy5leGVjdXRlPWZ1bmN0aW9uKCl7XHJcblxyXG5cdH07XHJcblxyXG59O1xyXG5Db21tYW5kLmV4dGVuZHM9ZnVuY3Rpb24oQ2hpbGQpe1xyXG5cdGZ1bmN0aW9uIEYoKSB7fVxyXG5cdEYucHJvdG90eXBlID0gQ29tbWFuZC5wcm90b3R5cGU7XHJcblx0Q2hpbGQucHJvdG90eXBlPW5ldyBGKCk7XHJcblx0Xy5leHRlbmQoQ2hpbGQucHJvdG90eXBlLENvbW1hbmQucHJvdG90eXBlKTtcclxuXHRyZXR1cm4gQ2hpbGQ7XHJcbn07XHJcbkNvbW1hbmQuVmFsaWRhdGlvbj1mdW5jdGlvbihjb21tYW5kKXtcclxuXHR2YXIgY29tbWFuZFN0cmluZz1jb21tYW5kO1xyXG5cdHZhciBlcnJvck1zZz1cIlwiO1xyXG5cdHZhciBpc1ZhbGlkPWZhbHNlO1xyXG5cdHRoaXMuZmFpbD1mdW5jdGlvbihlcnJvck1lc3NhZ2Upe1xyXG5cdFx0ZXJyb3JNc2c9ZXJyb3JNZXNzYWdlO1xyXG5cdFx0aXNWYWxpZD1mYWxzZTtcclxuXHR9O1xyXG5cdHRoaXMuc3VjY2Vzcz1mdW5jdGlvbigpe1xyXG5cdFx0ZXJyb3JNc2c9XCJcIjtcclxuXHRcdGlzVmFsaWQ9dHJ1ZTtcclxuXHR9O1xyXG5cdHRoaXMuZ2V0Q29tbWFuZFN0cmluZz1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGNvbW1hbmRTdHJpbmc7XHJcblx0fTtcclxuXHR0aGlzLmdldEVycm9yTWVzc2FnZT1mdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGVycm9yTXNnO1xyXG5cdH07XHJcblx0dGhpcy5pc1ZhbGlkPWZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gaXNWYWxpZDtcclxuXHR9O1xyXG59O1xyXG4vKkNvbW1hbmQuVHlwZT17XHJcblx0VEVTVF9QTEFOOidURVNUX1BMQU4nLFxyXG5cdFRFU1RfQ0FTRTonVEVTVF9DQVNFJyxcclxuXHRRVUVSWTonUVVFUlknLFxyXG5cdFVQREFURTonVVBEQVRFJyxcclxufTsqL1xyXG5tb2R1bGUuZXhwb3J0cz1Db21tYW5kOyIsInZhciBBcHBsaWNhdGlvbj1yZXF1aXJlKCcuL0FwcGxpY2F0aW9uJyk7XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFwcD1uZXcgQXBwbGljYXRpb24oKTtcclxuXHRhcHAuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBDb21tYW5kc1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgZWw6ICcjbWFpbi12aWV3JyxcclxuICBjb21tYW5kc0lucHV0Om51bGwsXHJcbiAgZXhlY3V0aW9uT3V0cHV0Om51bGwsXHJcbiAgZXZlbnRzOntcclxuICBcdCdjbGljayAjZXhlY3V0ZS1idXR0b24nOidfb25FeGVjdXRlQnRuQ2xpY2snXHJcbiAgfSxcclxuICBpbml0aWFsaXplOmZ1bmN0aW9uKCl7XHJcbiAgXHR0aGlzLmNvbW1hbmRzSW5wdXQ9dGhpcy4kKCcjY29tbWFuZHMtdGV4dCcpO1xyXG4gICAgXHJcblxyXG4gICAgdmFyIGR1bW15Q29tbWFuZHM9ICBcIjJcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG40IDVcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5VUERBVEUgMiAyIDIgNFwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDEgMSAxIDMgMyAzXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuVVBEQVRFIDEgMSAxIDIzXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMiAyIDIgNCA0IDRcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAzIDMgM1wiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcbjIgNFwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblVQREFURSAyIDIgMiAxXCI7XHJcbiAgICBkdW1teUNvbW1hbmRzICs9ICAgIFwiXFxuUVVFUlkgMSAxIDEgMSAxIDFcIjtcclxuICAgIGR1bW15Q29tbWFuZHMgKz0gICAgXCJcXG5RVUVSWSAxIDEgMSAyIDIgMlwiO1xyXG4gICAgZHVtbXlDb21tYW5kcyArPSAgICBcIlxcblFVRVJZIDIgMiAyIDIgMiAyXCI7XHJcblxyXG5cclxuICAgIHRoaXMuY29tbWFuZHNJbnB1dC52YWwoZHVtbXlDb21tYW5kcyk7XHJcbiAgXHR0aGlzLmV4ZWN1dGlvbk91dHB1dD10aGlzLiQoJyNleGVjdXRpb24tcmVzdWx0LXRleHQnKTtcclxuICB9LFxyXG4gIF9vbkV4ZWN1dGVCdG5DbGljazpmdW5jdGlvbihlKXtcclxuICBcdHRoaXMuX2Rpc3BhdGNoRXhlY3V0ZSgpO1xyXG5cclxuICB9LFxyXG4gIF9kaXNwYXRjaEV4ZWN1dGU6ZnVuY3Rpb24oKXtcclxuICBcdHZhciBjb21tYW5kcz10aGlzLmNvbW1hbmRzSW5wdXQudmFsKCk7XHJcbiAgXHR0aGlzLnRyaWdnZXIoQ29tbWFuZHNWaWV3LkVYRUNVVElPTl9TVEFSVEVELCBjb21tYW5kcyk7XHJcbiAgfSxcclxuICBkaXNwbGF5UmVzdWx0czpmdW5jdGlvbihyZXN1bHRTdHJpbmcsIHRpbWVFbGFwc2VkKXtcclxuICBcdHRoaXMuX3Nob3dSZXN1bHRzKHJlc3VsdFN0cmluZyk7XHJcbiAgfSxcclxuICBfc2hvd1Jlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nKXtcclxuICBcdHRoaXMuZXhlY3V0aW9uT3V0cHV0LnZhbChyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgZGlzcGxheUVycm9yOmZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuICAgIHRoaXMuZXhlY3V0aW9uT3V0cHV0LnZhbChleGVjdXRpb25FcnJvci5nZXRFcnJvck1lc3NhZ2UoKSk7XHJcbiAgfVxyXG59LHtcclxuXHRFWEVDVVRJT05fU1RBUlRFRDonZXhlY3V0aW9uLXN0YXJ0ZWQnXHJcblxyXG59KTtcclxubW9kdWxlLmV4cG9ydHM9Q29tbWFuZHNWaWV3OyJdfQ==
