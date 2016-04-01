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