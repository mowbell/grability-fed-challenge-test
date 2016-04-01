var CubeStorage = {};
CubeStorage.CUBE_DB = "cube_db";
CubeStorage.CUBE_CELL_TABLE = "cube_cell";
CubeStorage.CUBE_CELL_X = "x";
CubeStorage.CUBE_CELL_Y = "y";
CubeStorage.CUBE_CELL_Z = "z";
CubeStorage.CUBE_CELL_VALUE = "cell_value";
CubeStorage.CUBE_CELL_SUM = "sum";

var DB;
try {
    DB = openDatabase(CubeStorage.CUBE_DB, '1.0', 'Cube DB', 5 * 1024 * 1024);
} catch (e) {

}

function execQuery(query, params) {
    var deferred = jQuery.Deferred();
    if (DB !== null) {
        DB.transaction(function(tx) {
            tx.executeSql(query, params, function(tx, results) {
                deferred.resolve(results);
            }, function(tx, error) {
                //console.log('error', error);
                deferred.reject(error);
            });
        });
    } else {
        deferred.reject(arguments);
    }
    return deferred.promise();
}


CubeStorage.createTable = function() {
    var sql = 'CREATE TABLE IF NOT EXISTS  ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += '(' + CubeStorage.CUBE_CELL_X + ' NUMERIC, ';
    sql += CubeStorage.CUBE_CELL_Y + ' NUMERIC, ';
    sql += CubeStorage.CUBE_CELL_Z + ' NUMERIC, ';
    sql += CubeStorage.CUBE_CELL_VALUE + ' NUMERIC, ';
    sql += "PRIMARY KEY (" + CubeStorage.CUBE_CELL_X + ',' + CubeStorage.CUBE_CELL_Y + ',' + CubeStorage.CUBE_CELL_Z + ') );';
    //console.log(sql);

    return execQuery(sql, []);
};

CubeStorage.resetCube = function(size) {
	var sql = 'DELETE FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    //console.log(sql);
    return execQuery(sql, []);
};


CubeStorage.populateCube = function(size) {
	var sql = 'INSERT INTO ' + CubeStorage.CUBE_CELL_TABLE + ' VALUES ';
    var cells = [];
    for (x = 1; x <= size; x++) {
        for (y = 1; y <= size; y++) {
            for (z = 1; z <= size; z++) {
                cells.push('('+[x,y,z,0].join(',')+')');
            }
        }
    }

    sql+=cells.join(', ');
    //console.log(sql);
    return execQuery(sql, []);
};


CubeStorage.updateCell = function(x, y, z, value) {
    
    var sql = 'UPDATE ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'SET ' + CubeStorage.CUBE_CELL_VALUE + '=' + value + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' = ' + x + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' = ' + y + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' = ' + z + ' ';

    //console.log(sql);
    return execQuery(sql, []);
    
};

CubeStorage.getCell = function(x, y, z) {
    var sql = 'SELECT * FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' = ' + x + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' = ' + y + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' = ' + z + ' ';
    //console.log(sql);
    return execQuery(sql, []);
};

CubeStorage.summateCells = function(x1, y1, z1, x2, y2, z2) {
    var sql = 'SELECT SUM('+CubeStorage.CUBE_CELL_VALUE+') AS '+CubeStorage.CUBE_CELL_SUM+' FROM ' + CubeStorage.CUBE_CELL_TABLE + ' ';
    sql += 'WHERE ' + CubeStorage.CUBE_CELL_X + ' >= ' + x1 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_X + ' <= ' + x2 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' >= ' + y1 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Y + ' <= ' + y2 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' >= ' + z1 + ' ';
    sql += 'AND ' + CubeStorage.CUBE_CELL_Z + ' <= ' + z2 + ' ';
    //console.log(sql);
    return execQuery(sql, []);
};

module.exports = CubeStorage;
