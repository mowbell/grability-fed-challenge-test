describe('Execution class especificaciones', function() {
	it('Debe tener un constructor (String comandos) y devuelve un promise');
    it('El promise es el resultado de la inicializacion validacion del TestPlan y luego su ejecucion interna');
    it('La inicializacion o validacion de los comandos devuelve un promise');
    it('Si la inicializacion es exitosa llama a ejecutar los comandos execute() interna');
    it('La ejecución interna de los comandos devuelve un promise que es el resultado total de la ejecucion');
    it('La inicializacion es exitosa si se crean y son validos todos los comandos igual al num de lineas de la cadena de comandos');
    it('La inicializacion es erronea si no son valido algun TestPlan TestCase Query o Update y devuelve un {message}');
    it('Si la ejecucion interna es exitosa devuelve un promise con un Array de los resultados de las operaciones');
    it('Si la ejecucion es erronea devuelve un promise fail');
});
