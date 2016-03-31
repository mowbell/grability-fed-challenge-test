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
