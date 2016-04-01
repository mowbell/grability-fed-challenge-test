var Command=require("./base/Command");
var TestCaseCommand=require("./TestCaseCommand");
var ErrorMessage=require("./../../config/ErrorMessage");
var Config=require("./../../config/Config");
var UpdateCommand=function(commandString, _cubeSize){
	Command.call(this,commandString);
	var cubeSize=_cubeSize;
	var cellX=0;
	var cellY=0;
	var cellZ=0;
	var valueToUpdate=0;
	var setCubeCells=function(X,Y,Z){
		cellX=X;
		cellY=Y;
		cellZ=Z;
	};
	function getCellX(){
		return cellX;
	}
	function getCellY(){
		return cellY;
	}
	function getCellZ(){
		return cellZ;
	}
	function getValueToTupdate(){
		return valueToUpdate;
	}
	var setValueToTupdate=function(num){
		valueToUpdate=num;
	};
	this.getCubeSize=function(){
		return cubeSize;
	};
	
	var that=this;
	var validateCell=function(cellCoord){
		return cellCoord>=Config.MIN_CUBE_SIZE && cellCoord<=that.getCubeSize();
	};
	this.validate=function(){
		var cmd=this.getCommandString();
		var validation=new Command.Validation(cmd);
		var regex=/^UPDATE\s{1}\d+\s{1}\d+\s{1}\d+\s{1}-?\d+$/;
		if(cmd!==""){
			if(regex.test(cmd)){
				var values=cmd.match(/-?\d+/g);

				var cellX=parseInt(values[0]);
				var cellY=parseInt(values[1]);
				var cellZ=parseInt(values[2]);
				var valueToUpdate=parseInt(values[3]);
				
				if(
					validateCell(cellX) && validateCell(cellY) && validateCell(cellZ)

					){

					setCubeCells(cellX,cellY,cellZ);

					if(valueToUpdate>=Config.MIN_CUBE_CELL_UPDATE_VALUE && valueToUpdate<=Config.MAX_CUBE_CELL_UPDATE_VALUE){
						setValueToTupdate(valueToUpdate);
						validation.success();
					}
					else{
						validation.fail(ErrorMessage.UPDATE_WRONG_VALUE_TO_UPDATE);	
					}
				}
				else{
					validation.fail(ErrorMessage.UPDATE_WRONG_CUBE_CELLS);	
				}
			}
			else{
				validation.fail(ErrorMessage.UPDATE_COMMAND_SINTAX);
			}
		}
		else{
			validation.fail(ErrorMessage.EMPTY_COMMAND);
		}
		return validation;

	};

	this.execute=function(cube){
		debugger;
		cube.updateCell(getCellX(), getCellY(), getCellZ(), getValueToTupdate())
		.then(that.dispatchSuccess,that.dispatchError);
		return that;
	};
};
UpdateCommand=Command.extends(UpdateCommand);


module.exports=UpdateCommand;