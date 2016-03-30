var CommandsView=require('./views/CommandsView');
var Execution=require('./core/Execution');
var Application=function(){
	var mainView=null;
	var that=this;
	this.start=function(){
		mainView=new CommandsView();
		mainView.on(CommandsView.EXECUTION_STARTED, _onExectionStarted);
		console.log('Application Started');
	};

	var _onExectionStarted=function(commandsString){
		console.log("comandos fueron", commandsString);
		execute(commandsString);
	};

	var execute=function(commandsString){
		var execution=new Execution(commandsString);
		execution.then(_onExecutionSuccess,_onExecutionError);
	};

	var _onExecutionSuccess=function(resultString){
		console.log("resultado fue", resultString);
		showResults(resultString);
	};

	var _onExecutionError=function(executionError){
		console.log("resultado con error fue", executionError);
		showError(executionError);
	};

	var showResults=function(resultString){
		mainView.displayResults(resultString);
	};

	var showError=function(executionError){
		mainView.displayerror(executionError);
	};

};
module.exports=Application;