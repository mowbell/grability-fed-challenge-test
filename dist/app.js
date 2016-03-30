(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./core/Execution":3,"./views/CommandsView":5}],2:[function(require,module,exports){
var Config={
	MIN_TESTS_CASES:1,
	MAX_TESTS_CASES:50,
	MIN_CUBE_SIZE:1,
	MAX_CUBE_SIZE:100,
	MIN_TEST_CASES_OPERATIONS:1,
	MAX_TEST_CASES_OPERATIONS:100,
	MIN_CUBE_CELL_UPDATE_VALUE:-Math.pow(10,9),
	MAX_CUBE_CELL_UPDATE_VALUE:Math.pow(10,9),
};

module.exports=Config;
},{}],3:[function(require,module,exports){
var Execution=function(commandsString){
	var execDeferred = jQuery.Deferred();
	_.delay(function(){
		execDeferred.resolve('OK');
	});
	return execDeferred.promise();
};
module.exports=Execution;
},{}],4:[function(require,module,exports){
var Application=require('./Application');

$(function(){
	var app=new Application();
	app.start();
});

},{"./Application":1}],5:[function(require,module,exports){
var CommandsView = Backbone.View.extend({
  el: '#main-view',
  commandsInput:null,
  executionOutput:null,
  events:{
  	'click #execute-button':'_onExecuteBtnClick'
  },
  initialize:function(){
  	this.commandsInput=this.$('#commands-text');
  	this.executionOutput=this.$('#execution-result-text');
  },
  _onExecuteBtnClick:function(e){
  	this._dispatchExecute();
  },
  _dispatchExecute:function(){
  	var commands=this.commandsInput.val();
  	this.trigger(CommandsView.EXECUTION_STARTED, commands);
  },
  displayResults:function(resultString){
  	console.log("CommandsView.displayResults param",resultString);
  	this._showResults(resultString);
  },
  _showResults:function(resultString){
  	this.executionOutput.val(resultString);
  },
  displayError:function(executionError){
  	console.log("CommandsView.displayError param",executionError);
  }
},{
	EXECUTION_STARTED:'Commands Exection Started'

});
module.exports=CommandsView;
},{}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvQXBwbGljYXRpb24uanMiLCJhcHAvY29uZmlnL0NvbmZpZy5qcyIsImFwcC9jb3JlL0V4ZWN1dGlvbi5qcyIsImFwcC9tYWluLmpzIiwiYXBwL3ZpZXdzL0NvbW1hbmRzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29tbWFuZHNWaWV3PXJlcXVpcmUoJy4vdmlld3MvQ29tbWFuZHNWaWV3Jyk7XHJcbnZhciBFeGVjdXRpb249cmVxdWlyZSgnLi9jb3JlL0V4ZWN1dGlvbicpO1xyXG52YXIgQXBwbGljYXRpb249ZnVuY3Rpb24oKXtcclxuXHR2YXIgbWFpblZpZXc9bnVsbDtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdHRoaXMuc3RhcnQ9ZnVuY3Rpb24oKXtcclxuXHRcdG1haW5WaWV3PW5ldyBDb21tYW5kc1ZpZXcoKTtcclxuXHRcdG1haW5WaWV3Lm9uKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgX29uRXhlY3Rpb25TdGFydGVkKTtcclxuXHRcdGNvbnNvbGUubG9nKCdBcHBsaWNhdGlvbiBTdGFydGVkJyk7XHJcblx0fTtcclxuXHJcblx0dmFyIF9vbkV4ZWN0aW9uU3RhcnRlZD1mdW5jdGlvbihjb21tYW5kc1N0cmluZyl7XHJcblx0XHRjb25zb2xlLmxvZyhcImNvbWFuZG9zIGZ1ZXJvblwiLCBjb21tYW5kc1N0cmluZyk7XHJcblx0XHRleGVjdXRlKGNvbW1hbmRzU3RyaW5nKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgZXhlY3V0ZT1mdW5jdGlvbihjb21tYW5kc1N0cmluZyl7XHJcblx0XHR2YXIgZXhlY3V0aW9uPW5ldyBFeGVjdXRpb24oY29tbWFuZHNTdHJpbmcpO1xyXG5cdFx0ZXhlY3V0aW9uLnRoZW4oX29uRXhlY3V0aW9uU3VjY2Vzcyxfb25FeGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcblx0dmFyIF9vbkV4ZWN1dGlvblN1Y2Nlc3M9ZnVuY3Rpb24ocmVzdWx0U3RyaW5nKXtcclxuXHRcdGNvbnNvbGUubG9nKFwicmVzdWx0YWRvIGZ1ZVwiLCByZXN1bHRTdHJpbmcpO1xyXG5cdFx0c2hvd1Jlc3VsdHMocmVzdWx0U3RyaW5nKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgX29uRXhlY3V0aW9uRXJyb3I9ZnVuY3Rpb24oZXhlY3V0aW9uRXJyb3Ipe1xyXG5cdFx0Y29uc29sZS5sb2coXCJyZXN1bHRhZG8gY29uIGVycm9yIGZ1ZVwiLCBleGVjdXRpb25FcnJvcik7XHJcblx0XHRzaG93RXJyb3IoZXhlY3V0aW9uRXJyb3IpO1xyXG5cdH07XHJcblxyXG5cdHZhciBzaG93UmVzdWx0cz1mdW5jdGlvbihyZXN1bHRTdHJpbmcpe1xyXG5cdFx0bWFpblZpZXcuZGlzcGxheVJlc3VsdHMocmVzdWx0U3RyaW5nKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc2hvd0Vycm9yPWZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuXHRcdG1haW5WaWV3LmRpc3BsYXllcnJvcihleGVjdXRpb25FcnJvcik7XHJcblx0fTtcclxuXHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPUFwcGxpY2F0aW9uOyIsInZhciBDb25maWc9e1xyXG5cdE1JTl9URVNUU19DQVNFUzoxLFxyXG5cdE1BWF9URVNUU19DQVNFUzo1MCxcclxuXHRNSU5fQ1VCRV9TSVpFOjEsXHJcblx0TUFYX0NVQkVfU0laRToxMDAsXHJcblx0TUlOX1RFU1RfQ0FTRVNfT1BFUkFUSU9OUzoxLFxyXG5cdE1BWF9URVNUX0NBU0VTX09QRVJBVElPTlM6MTAwLFxyXG5cdE1JTl9DVUJFX0NFTExfVVBEQVRFX1ZBTFVFOi1NYXRoLnBvdygxMCw5KSxcclxuXHRNQVhfQ1VCRV9DRUxMX1VQREFURV9WQUxVRTpNYXRoLnBvdygxMCw5KSxcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzPUNvbmZpZzsiLCJ2YXIgRXhlY3V0aW9uPWZ1bmN0aW9uKGNvbW1hbmRzU3RyaW5nKXtcclxuXHR2YXIgZXhlY0RlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcblx0Xy5kZWxheShmdW5jdGlvbigpe1xyXG5cdFx0ZXhlY0RlZmVycmVkLnJlc29sdmUoJ09LJyk7XHJcblx0fSk7XHJcblx0cmV0dXJuIGV4ZWNEZWZlcnJlZC5wcm9taXNlKCk7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzPUV4ZWN1dGlvbjsiLCJ2YXIgQXBwbGljYXRpb249cmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdHZhciBhcHA9bmV3IEFwcGxpY2F0aW9uKCk7XHJcblx0YXBwLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgQ29tbWFuZHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gIGVsOiAnI21haW4tdmlldycsXHJcbiAgY29tbWFuZHNJbnB1dDpudWxsLFxyXG4gIGV4ZWN1dGlvbk91dHB1dDpudWxsLFxyXG4gIGV2ZW50czp7XHJcbiAgXHQnY2xpY2sgI2V4ZWN1dGUtYnV0dG9uJzonX29uRXhlY3V0ZUJ0bkNsaWNrJ1xyXG4gIH0sXHJcbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xyXG4gIFx0dGhpcy5jb21tYW5kc0lucHV0PXRoaXMuJCgnI2NvbW1hbmRzLXRleHQnKTtcclxuICBcdHRoaXMuZXhlY3V0aW9uT3V0cHV0PXRoaXMuJCgnI2V4ZWN1dGlvbi1yZXN1bHQtdGV4dCcpO1xyXG4gIH0sXHJcbiAgX29uRXhlY3V0ZUJ0bkNsaWNrOmZ1bmN0aW9uKGUpe1xyXG4gIFx0dGhpcy5fZGlzcGF0Y2hFeGVjdXRlKCk7XHJcbiAgfSxcclxuICBfZGlzcGF0Y2hFeGVjdXRlOmZ1bmN0aW9uKCl7XHJcbiAgXHR2YXIgY29tbWFuZHM9dGhpcy5jb21tYW5kc0lucHV0LnZhbCgpO1xyXG4gIFx0dGhpcy50cmlnZ2VyKENvbW1hbmRzVmlldy5FWEVDVVRJT05fU1RBUlRFRCwgY29tbWFuZHMpO1xyXG4gIH0sXHJcbiAgZGlzcGxheVJlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nKXtcclxuICBcdGNvbnNvbGUubG9nKFwiQ29tbWFuZHNWaWV3LmRpc3BsYXlSZXN1bHRzIHBhcmFtXCIscmVzdWx0U3RyaW5nKTtcclxuICBcdHRoaXMuX3Nob3dSZXN1bHRzKHJlc3VsdFN0cmluZyk7XHJcbiAgfSxcclxuICBfc2hvd1Jlc3VsdHM6ZnVuY3Rpb24ocmVzdWx0U3RyaW5nKXtcclxuICBcdHRoaXMuZXhlY3V0aW9uT3V0cHV0LnZhbChyZXN1bHRTdHJpbmcpO1xyXG4gIH0sXHJcbiAgZGlzcGxheUVycm9yOmZ1bmN0aW9uKGV4ZWN1dGlvbkVycm9yKXtcclxuICBcdGNvbnNvbGUubG9nKFwiQ29tbWFuZHNWaWV3LmRpc3BsYXlFcnJvciBwYXJhbVwiLGV4ZWN1dGlvbkVycm9yKTtcclxuICB9XHJcbn0se1xyXG5cdEVYRUNVVElPTl9TVEFSVEVEOidDb21tYW5kcyBFeGVjdGlvbiBTdGFydGVkJ1xyXG5cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzPUNvbW1hbmRzVmlldzsiXX0=
