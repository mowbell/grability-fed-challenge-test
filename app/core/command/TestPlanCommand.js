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