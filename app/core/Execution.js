var Execution=function(commandsString){
	var execDeferred = jQuery.Deferred();
	_.delay(function(){
		execDeferred.resolve('OK');
	});
	return execDeferred.promise();
};
module.exports=Execution;