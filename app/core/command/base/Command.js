var Command=function(command){
	var commandString=command;
	var deferred=jQuery.Deferred();
	var that=this;
	this.getCommandString=function(){
		return commandString.trim();
	};
	this.getPromise=function(){
		return deferred.promise();
	};
	this.dispatchSuccess=function(result){
		deferred.resolve(result);
	};
	this.dispatchError=function(error){
		deferred.reject(error);
	};
	this.validate=function(command){
		return true;
	};
	this.execute=function(){

	};

};
Command.extends=function(Child){
	//http://julien.richard-foy.fr/blog/2011/10/30/functional-inheritance-vs-prototypal-inheritance/
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