var CommandsView = Backbone.View.extend({
  el: '#main-view',
  commandsInput:null,
  executionButton:null,
  executionOutput:null,
  errorMessage:null,
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
    this.executionButton=this.$('#execute-button');
  	this.executionOutput=this.$('#execution-result-text');
    this.errorMessage=this.$('#execution-error-message');
    this.errorMessage.hide();
  },
  _onExecuteBtnClick:function(e){
  	this._dispatchExecute();

  },
  _dispatchExecute:function(){
  	var commands=this.commandsInput.val();
  	this.trigger(CommandsView.EXECUTION_STARTED, commands);
    this.executionButton.addClass('disabled').addClass('loading');
  },
  displayResults:function(resultString, timeElapsed){
    this.errorMessage.hide();
  	this.executionOutput.val("Tiempo ejecución: "+timeElapsed+" ms\n"+resultString);
    this.executionButton.removeClass('disabled').removeClass('loading');
  },
  displayError:function(executionError){
    this.errorMessage.show();
    var errorTitle="Error";
    if(executionError.getCommandLine() && executionError.getCommandString())
      errorTitle="Error en la línea "+executionError.getCommandLine()+' <br/> ["'+executionError.getCommandString()+ '"]';
    this.errorMessage.find('code').html(errorTitle);
    this.errorMessage.find('p').text(executionError.getErrorMessage());
    this.executionOutput.val("");
  }
},{
	EXECUTION_STARTED:'execution-started'

});
module.exports=CommandsView;