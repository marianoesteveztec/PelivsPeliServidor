var con = require('./conexionbd.js');


function buscarCompetencias(req, res) {

      var sql = "select * from competencia";

    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(resultado));
    });
};

function buscarPeliculas(req, res) {

      var sql = "select count(id) as cantidad from competencia WHERE id = " + req.params.id;

      con.query(sql, function(error, resultado, fields) {

        if(resultado[0].cantidad == 0 ){
          console.log("Hubo un error en la consulta: ", "ID de competencia inexistente");
          return res.status(404).send("Hubo un error en la consulta");
        } else {

          var sql;
          con.query("select * from competencia where id = ?",
          [req.params.id], function(error, resultado, fields) {
            if (error ) {
                 console.log("Hubo un error en la consulta", error.message);
                 return res.status(404).send("Hubo un error en la consulta");
                //si tiene director, genero y actor
              }else if(resultado[0].id_director != 0 && resultado[0].id_genero != 0 && resultado[0].id_actor != 0){
                sql = "select p.id,p.poster,p.titulo from pelicula p inner join director d on p.director = d.nombre inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id WHERE d.id = " + resultado[0].id_director + " and a.id= " + resultado[0].id_actor +  " and p.genero_id = " + resultado[0].id_genero + " ORDER BY RAND()";
                //si tiene genero y actor
              }else if(resultado[0].id_genero != 0 && resultado[0].id_actor != 0){
                sql=  "select p.id,p.poster,p.titulo from pelicula p inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id WHERE p.genero_id = " + resultado[0].id_genero + " and a.id= " + resultado[0].id_actor + " ORDER BY RAND()";
                //si tiene director y actor
                }else if (resultado[0].id_director != 0 && resultado[0].id_actor != 0){
                  sql=  "select p.id,p.poster,p.titulo from pelicula p inner join director d on p.director = d.nombre inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id WHERE d.id = " + resultado[0].id_director + " and a.id= " + resultado[0].id_actor + " ORDER BY RAND()";
                      //si tiene director y genero
                   }else if(resultado[0].id_director != 0 && resultado[0].id_genero != 0){
                     sql = "select p.id,p.poster,p.titulo from pelicula p inner join director d on p.director = d.nombre WHERE d.id = " + resultado[0].id_director + " and p.genero_id = " + resultado[0].id_genero  + " ORDER BY RAND()";
                     //si tiene genero
                     } else if(resultado[0].id_genero != 0){
                       sql = "select p.id,p.poster,p.titulo from pelicula p WHERE genero_id = " + resultado[0].id_genero + " ORDER BY RAND()";
                       //si tiene director
                       }else if(resultado[0].id_director  != 0){
                         sql = "select p.id,p.poster,p.titulo from pelicula p inner join director d on p.director = d.nombre WHERE d.id= " + resultado[0].id_director + " ORDER BY RAND()";
                         //si tiene actor
                        }else if(resultado[0].id_actor  != 0){
                           sql = "select p.id,p.poster,p.titulo from pelicula p inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id WHERE a.id= " + resultado[0].id_actor + " ORDER BY RAND()";
                          //si no tiene filtros
                           } else {
                            sql = "select id,poster,titulo from pelicula ORDER BY RAND()";
                          };

            con.query(sql, function(error, resultado, fields) {
              if (error ) {
                   console.log("Hubo un error en la consulta", error.message);
                   return res.status(404).send("Hubo un error en la consulta");
               }

               var respuesta = {
                     'peliculas': resultado
               };

               res.send(JSON.stringify(respuesta));
           });


         });
        }
      });

};

function votarPelicula(req, res) {

    //IMPORTANTE
    //AL CREAR LA TABLA "VOTO" INGRESO CLAVES FORANEAS A LA COMPETENCIA Y LA PELICULA,
    //POR LO QUE NO SE PUEDE INGRESAR NINGUNA DE LAS NOMBRADAS QUE NO EXISTA
    //REALIZO UNA VALIDACION EN LA BASE DE DATOS

    con.query("INSERT INTO voto (id_competencia, id_pelicula) values (?,?)",
              [req.params.idCompetencia, req.body.idPelicula],
              function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.json(resultado);
    });
};

function buscarResultados(req, res) {

  var sql = "select count(id) as cantidad from competencia WHERE id = " + req.params.id;
  var nombre_competencia;
  con.query(sql, function(error, resultado, fields) {

    //Valido que exista el id de la competencia ingresada
    if(resultado[0].cantidad == 0 ){
      console.log("Hubo un error en la consulta: ", "ID de competencia inexistente");
      return res.status(404).send("Hubo un error en la consulta");
    } else {

      //Si existe la competencia cargo el nombre de la misma y luego las peliculas mas votadas
      con.query("SELECT nombre FROM competencia WHERE id = ?",
      [req.params.id],
                function(error, resultado, fields) {
          if (error) {
              console.log("Hubo un error en la consulta", error.message);
              return res.status(404).send("Hubo un error en la consulta");
          }

          nombre_competencia = resultado[0].nombre;
      });

        con.query("SELECT p.id as pelicula_id, p.poster, p.titulo, COUNT(*) as votos FROM pelicula p INNER JOIN voto v on p.id = v.id_pelicula WHERE v.id_competencia = ? GROUP BY p.id ORDER BY COUNT(*) desc limit 3",
        [req.params.id],
                  function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }


            var data = {
              'competencia' : nombre_competencia,
              'resultados' : resultado
            }
            res.send(JSON.stringify(data));
        });
      };
    });
};

function crearCompetencia(req, res) {

    var sql = "select count(id) as cantidad from competencia WHERE nombre LIKE '" + req.body.nombre + "'";
    con.query(sql, function(error, resultado, fields) {

      //Valido que exista el id de la competencia ingresada
      if(resultado[0].cantidad > 0 ){
        console.log("Hubo un error en la consulta: ", "competencia ya existe");
        return res.status(422).send("Hubo un error en la validación");
      } else {

        //Nueva competencia
        var nueva_competencia = req.body
        console.log(nueva_competencia)
        var genero = (nueva_competencia.genero) ? nueva_competencia.genero : undefined
        var director = (nueva_competencia.director) ? nueva_competencia.director : undefined
        var actor = (nueva_competencia.actor) ? nueva_competencia.actor : undefined

        var sql
        //valido que existan almenos dos peliculas antes de crear la competencia

        //valido que hayan almenos dos peliculas con mismos actores y directores y mismo genero
        if(actor != 0 && director != 0 && genero != 0){
          sql = "select count(*) as cantidad from pelicula p inner join director d on p.director = d.nombre inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id WHERE d.id = " + director + " and a.id = " + actor + " and p.genero_id = " + genero;
        //valido que hayan dospeliculas con mismos actores y directores
        } else if(director != 0 && actor != 0){
          sql = "select count(*) as cantidad from pelicula p inner join director d on p.director = d.nombre inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id WHERE d.id = " + director + " and a.id = " + actor ;
          } else if(genero != 0 && actor != 0){
            sql = "select count(*) as cantidad from pelicula p inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id  WHERE a.id = " + actor + " and p.genero_id = " + genero ;
            //valido que haya dos peliculas del mismo director y genero
            } else if (genero != 0 && director != 0){
              sql = "select count(*) as cantidad from pelicula p inner join director d on p.director = d.nombre WHERE d.id = " + director + " and p.genero_id = " + genero ;
            //valido que haya dos peliculas del mismo director
              } else if (director != 0 ){
                sql = "select count(*) as cantidad from pelicula p inner join director d on p.director = d.nombre WHERE d.id = " + director  ;
              //valido que haya dos peliculas del mismo genero
               } else if (genero != 0){
                  sql = "select count(*) as cantidad from pelicula p  WHERE p.genero_id = " + genero;
                  } else if (actor!=0){
                    //valido que haya dos peliculas del mismo actor
                    sql = "select count(*) from pelicula p inner join actor_pelicula ap on p.id = ap.pelicula_id inner join actor a on ap.actor_id = a.id  WHERE a.id = " + actor ;
                    //Todos los resultados
                     } else {
                       sql = "select count(*) as cantidad from pelicula p ";
                     };

        con.query(sql,
                  [req.body.nombre, genero, director],
                  function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
              } else if (resultado[0].cantidad < 2 ){
                console.log("Hubo un error en la consulta", "No existen dos peliculas para esta competencia");
                return res.status(404).send("No existen dos peliculas para esta competencia");
                }else {
                  console.log(resultado[0].cantidad);
                  con.query("INSERT INTO competencia (nombre, id_genero, id_director, id_actor) values (?,?,?,?)",
                            [req.body.nombre, genero, director, actor],
                            function(error, resultado, fields) {
                      if (error) {
                          console.log("Hubo un error en la consulta", error.message);
                          return res.status(404).send("Hubo un error en la consulta");
                      }

                  res.json(resultado);
              });
            };
        });
      }
    });
};

function buscarGeneros(req, res) {

      var sql = "select * from genero";

    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(resultado));
    });
};

function buscarDirectores(req, res) {

      var sql = "select * from director";

    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(resultado));
    });
};

function buscarActores(req, res) {

      var sql = "select * from actor";

    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(resultado));
    });
};

function reiniciarVotos(req, res) {

      var sql = "select count(id) as cantidad from competencia WHERE id = " + req.params.idCompetencia;

      con.query(sql, function(error, resultado, fields) {

        if(resultado[0].cantidad == 0 ){
          console.log("Hubo un error en la consulta: ", "ID de competencia inexistente");
          return res.status(404).send("Hubo un error en la consulta");

        } else {

            con.query("DELETE FROM voto WHERE id_competencia = ?",
            [req.params.idCompetencia],
            function(error, resultado, fields) {
              if (error ) {
                   console.log("Hubo un error en la consulta", error.message);
                   return res.status(404).send("Hubo un error en la consulta");
               }

           });
        res.send(JSON.stringify(resultado));
        }
      });

};

function eliminarCompetencia(req, res) {

  var sql = "select count(id) as cantidad from competencia WHERE id = " + req.params.idCompetencia;
  var competencia;

  con.query(sql, function(error, resultado, fields) {
    //Valido que exista el id de la competencia ingresada
    if(resultado[0].cantidad == 0 ){
      console.log("Hubo un error en la consulta: ", "ID de competencia inexistente");
      return res.status(404).send("Hubo un error en la consulta");
    } else {
      //Guardo los datos de la competencia
      con.query("SELECT * FROM competencia WHERE id = ?",
      [req.params.idCompetencia],
                function(error, resultado, fields) {
          if (error) {
              console.log("Hubo un error en la consulta", error.message);
              return res.status(404).send("Hubo un error en la consulta");
          }
          else{
            competencia = resultado[0];
          }
      })
      //elimino los votos
      con.query("DELETE FROM voto WHERE id_competencia = ?",
      [req.params.idCompetencia],
                function(error, resultado, fields) {
          if (error) {
              console.log("Hubo un error en la consulta", error.message);
              return res.status(404).send("Hubo un error en la consulta");
          }
      });
      //elimino la competencia
      con.query("DELETE FROM competencia WHERE id = ?",
      [req.params.idCompetencia],
                function(error, resultado, fields) {
          if (error) {
              console.log("Hubo un error en la consulta", error.message);
              return res.status(404).send("Hubo un error en la consulta");
          }
      });
      res.send(JSON.stringify(competencia));
    }
  });
};

function cargarCompetencia(req, res) {

  var sql = "select count(id) as cantidad from competencia WHERE id = " + req.params.id;

  con.query(sql, function(error, resultado, fields) {

    if(resultado[0].cantidad == 0 ){
      console.log("Hubo un error en la consulta: ", "ID de competencia inexistente");
      return res.status(404).send("Hubo un error en la consulta");

    } else {

        con.query("select c.nombre as nombre, g.nombre as genero_nombre, d.nombre as director_nombre ,a.nombre as actor_nombre from competencia c LEFT JOIN genero g on c.id_genero = g.id LEFT JOIN director d on c.id_director = d.id LEFT JOIN actor a on c.id_actor = a.id where c.id = ?",
        [req.params.id],
        function(error, resultado, fields) {
          if (error ) {
               console.log("Hubo un error en la consulta", error.message);
               return res.status(404).send("Hubo un error en la consulta");
           }else{
             var data = {
               'nombre' : resultado[0].nombre,
               'genero_nombre' : resultado[0].genero_nombre,
               'director_nombre' : resultado[0].director_nombre,
               'actor_nombre' : resultado[0].actor_nombre
             }

                res.send(JSON.stringify(data));
           }

       });
    }
  });



};

function modificarCompetencia(req, res) {
  var sql = "select count(id) as cantidad from competencia WHERE id = " + req.params.idCompetencia;

  con.query(sql, function(error, resultado, fields) {

    if(resultado[0].cantidad == 0 ){
      console.log("Hubo un error en la consulta: ", "ID de competencia inexistente");
      return res.status(404).send("Hubo un error en la consulta");

    } else {

        con.query("UPDATE competencia SET nombre = ? WHERE id = ?",
        [req.body.nombre,req.params.idCompetencia],
        function(error, resultado, fields) {
          if (error ) {
               console.log("Hubo un error en la consulta", error.message);
               return res.status(404).send("Hubo un error en la consulta");
           } else{
             res.json(resultado);
           }

       });
    }
  });
};

module.exports = {
    buscarCompetencias: buscarCompetencias,
    buscarPeliculas: buscarPeliculas,
    votarPelicula: votarPelicula,
    buscarResultados:buscarResultados,
    crearCompetencia: crearCompetencia,
    reiniciarVotos: reiniciarVotos,
    buscarGeneros: buscarGeneros,
    buscarDirectores:buscarDirectores,
    buscarActores: buscarActores,
    eliminarCompetencia: eliminarCompetencia,
    cargarCompetencia: cargarCompetencia,
    modificarCompetencia:modificarCompetencia
};
