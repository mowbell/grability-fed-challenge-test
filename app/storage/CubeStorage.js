var cubeTableCreated=false;

var CubeStorage={

};

CubeStorage.createTable=function(){
	var sql=	'CREATE INDEXEDDB DATABASE IF NOT EXISTS '+CubeStorage.CUBE_DB+'; ';
	sql+=		'ATTACH INDEXEDDB DATABASE '+CubeStorage.CUBE_DB+'; ';
	sql+=		'USE '+CubeStorage.CUBE_DB+'; ';
	sql+=		'DROP TABLE IF EXISTS '+CubeStorage.CUBE_CELL_TABLE+'; ';
	sql+=		'CREATE TABLE  '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'('+CubeStorage.CUBE_CELL_X+' NUMERIC, ';
	sql+=		CubeStorage.CUBE_CELL_Y+' NUMERIC, ';
	sql+=		CubeStorage.CUBE_CELL_Z+' NUMERIC, ';
	sql+=		CubeStorage.CUBE_CELL_VALUE+' NUMERIC, ';
	sql+=		"PRIMARY KEY ("+CubeStorage.CUBE_CELL_X+','+CubeStorage.CUBE_CELL_Y+','+CubeStorage.CUBE_CELL_Z+') );';



	console.log(sql);	
	return alasql.promise(sql);
      /*.then(function(res){
      	debugger;
           console.log(res); // output depends on mydata.xls
      }).catch(function(err){
      	debugger;
           console.log('Does the file exists? there was an error:', err);
      });*/
};

CubeStorage.populateCube=function(size){
	var cells=[];
	for(x=1;x<=size;x++){
		for(y=1;y<=size;y++){
			for(z=1;z<=size;z++){
				cells.push({x:x,y:y,z:z,cell_value:0});
			}		
		}	
	}
	console.table(cells);

	var sql=	'SELECT INTO '+CubeStorage.CUBE_CELL_TABLE+' FROM ?';
	return alasql.promise(sql,[cells]);
};


CubeStorage.updateCell=function(x,y,z, value){
	/*var sql=	'REPLACE INTO '+CubeStorage.CUBE_CELL_TABLE+' ( ';
	sql+=		 CubeStorage.CUBE_CELL_X+', ';
	sql+=		 CubeStorage.CUBE_CELL_Y+', ';
	sql+=		 CubeStorage.CUBE_CELL_Z+', ';
	sql+=		 CubeStorage.CUBE_CELL_VALUE+' ) ';
	sql+=		'VALUES ('+x+','+y+','+z+','+value+') ';*/

	/*var sql=	'REPLACE INTO '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'VALUES ('+x+','+y+','+z+','+value+') ';*/

	var sql=	'UPDATE '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'SET '+CubeStorage.CUBE_CELL_VALUE+'='+value+' ';
	sql+=		'WHERE '+CubeStorage.CUBE_CELL_X+' = '+x+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Y+' = '+y+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Z+' = '+z+' ';


	/*sql+=		'WHERE '+CubeStorage.CUBE_CELL_X+' = '+x+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Y+' = '+y+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Z+' = '+z+' ';*/
	//return sql;
	console.log(sql);
	return alasql.promise(sql);
	/*alasql.promise(sql)
      .then(function(res){
           console.log(res); // output depends on mydata.xls
      }).catch(function(err){
           console.log('Does the file exists? there was an error:', err);
      });*/
};

CubeStorage.getCell=function(x,y,z){
	var sql=	'SELECT * FROM '+CubeStorage.CUBE_CELL_TABLE+' ';
	sql+=		'WHERE '+CubeStorage.CUBE_CELL_X+' = '+x+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Y+' = '+y+' ';
	sql+=		'AND '+CubeStorage.CUBE_CELL_Z+' = '+z+' ';
	console.log(sql);
	return alasql.promise(sql);
	/*alasql.promise(sql)
      .then(function(res){
           console.log(res); // output depends on mydata.xls
      }).catch(function(err){
           console.log('Does the file exists? there was an error:', err);
      });*/
};
CubeStorage.CUBE_DB="cube_db2";
CubeStorage.CUBE_CELL_TABLE="cube_cell2";
CubeStorage.CUBE_CELL_X="x";
CubeStorage.CUBE_CELL_Y="y";
CubeStorage.CUBE_CELL_Z="z";
CubeStorage.CUBE_CELL_VALUE="cell_value";
module.exports=CubeStorage;