//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var buscadorControlador = require('./funcionalidades');


var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

 app.get('/competencias', buscadorControlador.buscarCompetencias);
 app.get('/competencias/:id/peliculas', buscadorControlador.buscarPeliculas);
 app.post('/competencias/:idCompetencia/voto', buscadorControlador.votarPelicula);
 app.get('/competencias/:id/resultados',buscadorControlador.buscarResultados);
 app.post('/competencias',buscadorControlador.crearCompetencia);
 app.delete('/competencias/:idCompetencia/votos',buscadorControlador.reiniciarVotos);
 app.get('/generos',buscadorControlador.buscarGeneros);
 app.get('/directores',buscadorControlador.buscarDirectores);
 app.get('/actores',buscadorControlador.buscarActores);
 app.delete('/competencias/:idCompetencia',buscadorControlador.eliminarCompetencia);
 app.put('/competencias/:idCompetencia',buscadorControlador.modificarCompetencia);
 app.get('/competencias/:id', buscadorControlador.cargarCompetencia);


//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});
