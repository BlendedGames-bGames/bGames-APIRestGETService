const express = require('express');
const attributes = express.Router();
import { testEnvironmentVariable } from '../settings';

const mysqlConnection = require('../database');


attributes.get("/", (req,res) =>{
    res.status(200).json({ message: testEnvironmentVariable, secondMessage: 'Confirmado'})


});
/* 
Atributos capturados desde sensores y endpoints
*/

/*
RETRIEVE SUMA DE SUBATRIBUTOS ADQUIRIDOS:

1) Contribucion de los endpoints de un sensor en especifico a cada una de las dimensiones (tambien da la dimension a la que esta asociado)
Grafico: Circle Package (circulo mayor tiene el nombre del sensor y los circulos de adentro son de diferentes colores correspondientes a cada uno de las dimensiones)

2) Contribucion de un endpoint en especifico de un sensor en especifico a cada uno de los subattributos (tambien da la dimension a la que esta asociado)
Grafico: Circle Package (los circulos de adentro tienen los nombres de los subatributos y son de diferentes colores correspondientes a cada uno de las dimensiones asociadas a los subatributos)

3) Dado una dimension en especifico, ver cual es el sensor el cual me esta dando mas de ese atributo   
Grafico: TreeMap (Cada rectangulo es un sensor y da la proporcion de su contribucion dado el tamaño del rectangulo)

4) Dado una dimension en especifico, ver cual es el sensor endpoint el cual me esta dando mas de ese atributo (da tambien a que sensor esta asociado)
Grafico: TreeMap (Cada rectangulo es un endpoint y da la proporcion de su contribucion dado el tamaño del rectangulo)

5) Dado un subatributo en especifico relacionado a una dimension en especifico, ver cual es el sensor el cual me esta dando mas de ese subatributo   
Grafico: TreeMap (Cada rectangulo es un sensor y da la proporcion de su contribucion dado el tamaño del rectangulo)

6) Dado un subatributo en especifico relacionado a una dimension en especifico, ver cual es el endpoint  el cual me esta dando mas de ese subatributo (da tambien a que sensor esta asociado)  
Grafico: TreeMap (Cada rectangulo es un endpoint y da la proporcion de su contribucion dado el tamaño del rectangulo)

*/


/* 1) Contribucion de los endpoints de un sensor en especifico a cada una de las dimensiones (tambien da la dimension a la que esta asociado) */

attributes.get('/attributes/:id_player/online_sensor/:id_online_sensor',(req,res,next) => {

    var id_player = req.params.id_player
    var id_online_sensor = req.params.id_online_sensor

    var select = 'SELECT  `attributes`.`id_attributes`, `attributes`.`name`,  `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint`, `sensor_endpoint`.`name`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor`  JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `online_sensor`.`id_online_sensor` = ? AND `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint`, `attributes`.`id_attributes` ' 
    var orderby = 'ORDER BY `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` ASC '

    var query = select+from+join+join2+join3+where+group+orderby
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_online_sensor,id_online_sensor,id_player,id_player], function(err,rows,fields){
            if (!err){
                let result = rows[0]
                console.log(rows);
                res.status(200).json(result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})

/* 2) Contribucion de un endpoint en especifico de un sensor en especifico a cada uno de los subattributos (tambien da la dimension a la que esta asociado) */


attributes.get('/subattributes/:id_player/online_sensor/:id_online_sensor/sensor_endpoint/:id_sensor_endpoint',(req,res,next) => {

    var id_player = req.params.id_player
    var id_online_sensor = req.params.id_online_sensor
    var id_sensor_endpoint = req.params.id_sensor_endpoint

    var select = 'SELECT `attributes`.`id_attributes`, `attributes`.`name`, `subattributes`.`id_subattributes`, `subattributes`.`name`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor` JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `online_sensor`.`id_online_sensor` = ? AND `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = ? AND `sensor_endpoint`.`id_sensor_endpoint` = ? AND `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `subattributes_conversion_sensor_endpoint`.`id_subattributes`' 

    var query = select+from+join+join2+join3+where+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        mysqlConnection.query(query,[id_online_sensor,id_online_sensor,id_sensor_endpoint,id_sensor_endpoint,id_player,id_player], function(err,rows,fields){
            if (!err){
                let result = rows[0]
                console.log(rows);
                res.status(200).json(result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })

})

/*3) Dado una dimension en especifico, ver cual es el sensor el cual me esta dando mas de ese atributo 
WORKS
*/
attributes.get('/player/:id_player/attributes/:id_attributes/sensor_contribution',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes

    var select = 'SELECT `online_sensor`.`id_online_sensor`, `online_sensor`.`name` AS `name_online_sensor`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor`  JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND  `subattributes`.`attributes_id_attributes` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `online_sensor`.`id_online_sensor` ' 

    var query = select+from+join+join2+join3+where+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player,id_player], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(rows)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})

/*4) Dado una dimension en especifico, ver cual es el sensor endpoint el cual me esta dando mas de ese atributo (da tambien a que sensor esta asociado) */
attributes.get('/player/:id_player/attributes/:id_attributes/sensor_endpoint_contribution',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes

    var select = 'SELECT `online_sensor`.`id_online_sensor`, `online_sensor`.`name`  AS `name_online_sensor` ,`sensor_endpoint`.`id_sensor_endpoint`, `sensor_endpoint`.`name` AS `name_sensor_endpoint`, `sensor_endpoint`.`description` AS `description_sensor_endpoint`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor`  JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND  `subattributes`.`attributes_id_attributes` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `sensor_endpoint`.`id_sensor_endpoint` ' 

    var query = select+from+join+join2+join3+where+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player,id_player], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(rows)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})
/*5) Dado un subatributo en especifico relacionado a una dimension en especifico, ver cual es el sensor el cual me esta dando mas de ese subatributo  */
attributes.get('/player/:id_player/attributes/:id_attributes/subattributes/:id_subattributes/sensor_contribution',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes
    var id_subattributes = req.params.id_subattributes

    var select = 'SELECT `online_sensor`.`id_online_sensor`, `online_sensor`.`name` AS `name_online_sensor`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor`  JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND  `subattributes`.`attributes_id_attributes` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var and = 'AND `subattributes`.`id_subattributes` = ? AND  `subattributes_conversion_sensor_endpoint`.`id_subattributes` = ?  '
    var group = 'GROUP BY `online_sensor`.`id_online_sensor` ' 

    var query = select+from+join+join2+join3+where+and+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player,id_player,id_subattributes,id_subattributes], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})
/*6) Dado un subatributo en especifico relacionado a una dimension en especifico, ver cual es el endpoint  el cual me esta dando mas de ese subatributo (da tambien a que sensor esta asociado)*/
attributes.get('/player/:id_player/attributes/:id_attributes/subattributes/:id_subattributes/sensor_endpoint_contribution',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes
    var id_subattributes = req.params.id_subattributes

    var select = 'SELECT `online_sensor`.`id_online_sensor`, `online_sensor`.`name` AS `name_online_sensor`, `sensor_endpoint`.`id_sensor_endpoint`, `sensor_endpoint`.`name` AS `name_sensor_endpoint`,  `sensor_endpoint`.`description` AS `description_sensor_endpoint`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor`  JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND  `subattributes`.`attributes_id_attributes` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var and = 'AND `subattributes`.`id_subattributes` = ? AND  `subattributes_conversion_sensor_endpoint`.`id_subattributes` = ?  '
    var group = 'GROUP BY `sensor_endpoint`.`id_sensor_endpoint` ' 

    var query = select+from+join+join2+join3+where+and+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player,id_player,id_subattributes,id_subattributes], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})

/*
RETRIEVE SUMA DE SUBATRIBUTOS ADQUIRIDOS:

1) Suma de subatributos adquiridos asociados a una dimension y dado un jugador (sin importar su procedencia)

*/ 
attributes.get('/id_player/:id_player/attributes/:id_attributes/data_contribution',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes

    var select = 'SELECT  `subattributes`.`id_subattributes`,  `subattributes`.`name`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `adquired_subattribute` '
    var join = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` = `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` '
    var join2 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND `subattributes`.`attributes_id_attributes` = ?  '
    var and = ' AND `adquired_subattribute`.`id_players` = ? ' 
    var group = 'GROUP BY `subattributes`.`id_subattributes` ' 

    var query = select+from+join+join2+where+and+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player], function(err,rows,fields){
            if (!err){
                let result = rows[0]
                console.log(rows);
                res.status(200).json(result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})


/*
RETRIEVE SUMA DE DIMENSIONES Y SUBATRIBUTOS ADQUIRIDOS EN EL TIEMPO (EVOLUCION):
Grafico: Linea, eje X es tiempo y eje Y es lo adquirido

1) Suma de subatributos adquiridos (dando como resultado la evolucion de la dimension en el tiempo) dado un jugador sin importar su procedencia en un rango de tiempo

2) Subatributos adquiridos (evolucion de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia en un rango de tiempo

*/ 

/*1) Suma de subatributos adquiridos (dando como resultado la evolucion de la dimension en el tiempo) dado un jugador sin importar su procedencia en un rango de tiempo */
attributes.get('/id_player/:id_player/attributes_time_evolution',(req,res,next) => {

    var id_player = req.params.id_player
    var from_time = req.body.from_time
    var to_time = req.body.to_time

    var select = ' SELECT `attributes`.`id_attributes`, `attributes`.`name`, SUM(`adquired_subattribute`.`data`) AS `total`, `adquired_subattribute`.`created_time` '
    
    var from = 'FROM `adquired_subattribute` '
    var join = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` = `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` '
    var join2 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `adquired_subattribute`.`id_players` = ? '
    var time = ' AND `adquired_subattribute`.`created_time` BETWEEN ? AND ? ' 
    var group = 'GROUP BY `adquired_subattribute`.`created_time`,  `subattributes_conversion_sensor_endpoint`.`id_subattributes` ' 
    var order = 'ORDER BY `adquired_subattribute`.`created_time` ASC'
    var query = select+from+join+join2+where+time+group+order
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player, from_time, to_time], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(rows)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})


/*2) Subatributos adquiridos (evolucion de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia en un rango de tiempo */
attributes.get('/id_player/:id_player/attributes/:id_attributes/subattributes_time_evolution',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes
    var from_time = req.body.from_time
    var to_time = req.body.to_time

    var select = 'SELECT `subattributes_conversion_sensor_endpoint`.`id_subattributes`, `subattributes`.`name`, SUM(`adquired_subattribute`.`data`) AS `total`,  `adquired_subattribute`.`created_time` '
    
    var from = 'FROM `adquired_subattribute` '
    var join = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` = `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` '
    var join2 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND `subattributes`.`attributes_id_attributes` = ? AND `adquired_subattribute`.`id_players` = ? '
    var time = ' AND `adquired_subattribute`.`created_time` BETWEEN ? AND ? ' 
    var group = 'GROUP BY `adquired_subattribute`.`created_time`,  `subattributes_conversion_sensor_endpoint`.`id_subattributes` ' 
    var order = 'ORDER BY `adquired_subattribute`.`created_time` ASC'
    var query = select+from+join+join2+where+time+group+order
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player, from_time, to_time], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(rows)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})

/* SELECT `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint`
FROM `subattributes_conversion_sensor_endpoint`
WHERE `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = 1 AND `subattributes_conversion_sensor_endpoint`.`id_conversion` IN ('7','4') AND `subattributes_conversion_sensor_endpoint`.`id_subattributes` IN ('4','64')
*/

attributes.get('/subattribute_conversion_sensor_endpoint/:id_sensor_endpoint',(req,res,next) => {

    var id_conversions = req.body.id_conversions
    var id_subattributes = req.body.id_subattributes
    var id_sensor_endpoint = req.params.id_sensor_endpoint

    var union = '\n UNION \n '

    var select = 'SELECT `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '    
    var from = 'FROM `subattributes_conversion_sensor_endpoint` '
    
    var where = 'WHERE `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = '+id_sensor_endpoint.toString()
    var where2;
    var query = select+from+where
    var finalQuery = ''
    console.log('este es la longitud del conversions')
    console.log(id_conversions.length)
    console.log(union)


    for (let i = 0; i < id_conversions.length-1; i++) {
        where2 = ' AND `subattributes_conversion_sensor_endpoint`.`id_conversion` = '+id_conversions[i].toString()+' AND `subattributes_conversion_sensor_endpoint`.`id_subattributes` = '+id_subattributes[i].toString()
        finalQuery = finalQuery + query + where2 + union        
        console.log('entre')
        console.log(finalQuery)
    }
    finalQuery = finalQuery + query + ' AND `subattributes_conversion_sensor_endpoint`.`id_conversion` = '+id_conversions[id_conversions.length-1].toString()+' AND `subattributes_conversion_sensor_endpoint`.`id_subattributes` = '+id_subattributes[id_conversions.length-1].toString()
    console.log('este es el ultimate query')
    console.log(finalQuery)
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(finalQuery,[], function(err,rows,fields){
            if (!err){
                var id_subattributes_conversion_sensor_endpoint = []
                rows.forEach(result => {
                    id_subattributes_conversion_sensor_endpoint.push(result.id_subattributes_conversion_sensor_endpoint)
                });

                res.status(200).json({"id_subattributes_conversion_sensor_endpoint":id_subattributes_conversion_sensor_endpoint});
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})




/* Input":
var modifiedAdquired = {
    "id_videogame": id_videogame,  
    "id_modifiable_mechanic":spend_attributes.id_modifiable_mechanic,
    "id_conversion":spend_attributes.id_conversion,
    "id_attributes":spend_attributes.id_attributes
}

*/
attributes.get('/modifiable_conversion_attribute',(req,res,next)=>{
    console.log(req)
    console.log(req.body.id_videogame)
    console.log(req.body.id_modifiable_mechanic)
    console.log(req.body.id_conversion)
    console.log(req.body.id_attributes)
    var id_videogame = req.body.id_videogame;
    var id_modifiable_mechanic = req.body.id_modifiable_mechanic;
    var id_conversion = req.body.id_conversion;
    var id_attributes = req.body.id_attributes;
    if(id_videogame === undefined || id_modifiable_mechanic === undefined || id_conversion === undefined || id_attributes === undefined){
        res.status(400).json({"message": "Body lacks information"} )
    }
    var union = '\n UNION \n '

    var select = 'SELECT `modifiable_conversion_attribute`.`id_modifiable_conversion_attribute` '
    var from = 'FROM `videogame` '
    var join = 'JOIN `modifiable_mechanic_videogame` ON `videogame`.`id_videogame` = `modifiable_mechanic_videogame`.`id_videogame`  JOIN `modifiable_mechanic` ON `modifiable_mechanic`.`id_modifiable_mechanic` = `modifiable_mechanic_videogame`.`id_modifiable_mechanic` '
    var join2 = 'JOIN `modifiable_conversion_attribute` ON `modifiable_conversion_attribute`.`id_modifiable_mechanic` = `modifiable_mechanic`.`id_modifiable_mechanic` JOIN `attributes` ON `attributes`.`id_attributes` = `modifiable_conversion_attribute`.`id_attributes` '
    
    var where = 'WHERE `videogame`.`id_videogame` = '+id_videogame.toString()+ ' AND `modifiable_mechanic_videogame`.`id_videogame` = '+id_videogame.toString()
    var and = ' AND `modifiable_mechanic`.`id_modifiable_mechanic` = '+id_modifiable_mechanic.toString()+' AND `modifiable_conversion_attribute`.`id_modifiable_mechanic` = '+id_modifiable_mechanic.toString()+' '

    var where2;
    var query = select+from+join+join2+where+and
    var finalQuery = ''
    console.log('este es la longitud del conversions')
    console.log(id_conversion.length)
    console.log(union)


    for (let i = 0; i < id_conversion.length-1; i++) {
        where2 = ' AND `modifiable_conversion_attribute`.`id_conversion` = '+id_conversion[i].toString()+' AND `modifiable_conversion_attribute`.`id_attributes` = '+id_attributes[i].toString()
        finalQuery = finalQuery + query + where2 + union        
        console.log('entre')
        console.log(finalQuery)
    }
    finalQuery = finalQuery + query + ' AND `modifiable_conversion_attribute`.`id_conversion` = '+id_conversion[id_conversion.length-1].toString()+' AND `modifiable_conversion_attribute`.`id_attributes` = '+id_attributes[id_conversion.length-1].toString()
    console.log('este es el ultimate query')
    console.log(finalQuery)
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(finalQuery,[], function(err,rows,fields){
            if (!err){
                var id_modifiable_conversion_attribute = []
                rows.forEach(result => {
                    id_modifiable_conversion_attribute.push(result.id_modifiable_conversion_attribute)
                });
    
                res.status(200).json({"id_modifiable_conversion_attribute":id_modifiable_conversion_attribute});
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })

})





export default attributes;