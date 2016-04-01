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