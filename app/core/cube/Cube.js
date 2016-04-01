var CubeStorage = require('../../storage/CubeStorage');
var Cube=function(size){
	var cubeSize=size;
	this.load=function(){
		debugger;
		return CubeStorage.createTable()
			.then(CubeStorage.resetCube)
			.then(function() { CubeStorage.populateCube(cubeSize);});
	};
	this.updateCell=function(x,y,z,value){
		debugger;
		return CubeStorage.updateCell(x,y,z,value).then(function(result){
			debugger;
			return null;
		});
	};
	this.summateCells=function(x1, y1, z1, x2, y2, z2){
		debugger;
		return CubeStorage.summateCells(x1, y1, z1, x2, y2, z2).then(function(resultSet){
			debugger;
			return resultSet.rows[0].sum;
		});
	};
};
module.exports=Cube;