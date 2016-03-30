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