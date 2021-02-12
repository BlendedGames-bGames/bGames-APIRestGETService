const express = require('express');
const tables = express.Router();

const mysqlConnection = require('../database');


tables.get('/attributes_all',(req,res,next) => {
    var select = 'SELECT * '
    var from = 'FROM `attributes` '
    var query = select+from
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query, function(err,rows,fields){
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
tables.get('/subattributes_all',(req,res,next) => {
    var select = 'SELECT * '
    var from = 'FROM `subattributes` '
    var query = select+from
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query, function(err,rows,fields){
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
tables.get('/attributes/:id_attributes',(req,res,next) => {
    var id_attribute = req.params.id_attribute
    var select = 'SELECT * '
    var from = 'FROM `attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ?'
    var query = select+from
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attribute] ,function(err,rows,fields){
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

tables.get('/subattributes/:id_subattributes',(req,res,next) => {
    var id_subattribute = req.params.id_subattribute
    var select = 'SELECT * ' 
    var from = 'FROM `subattributes` '
    var where = 'WHERE `subattributes`.`id_subattributes` = ?'
    var query = select+from+where
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_subattribute] ,function(err,rows,fields){
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
/*
Input: 
"id_subattributes": Ej [5,2,1],   

Output: Resume of attributes of that player
Description: Simple MYSQL query
*/
tables.get('/subattributes_of_attribute/:id_attribute',(req,res)=>{
    let id_attribute = req.params.id_attribute;
   
    let select = 'SELECT `subattributes`.`id_subattributes`, `subattributes`.`name`, `subattributes`.`description`  '
    let from = 'FROM `subattributes` '
    let join = 'JOIN `attributes` ON `attributes`.`id_attributes` = `subattributes`.`attributes_id_attributes` '

    let where = 'WHERE `attributes`.`id_attributes` = ? AND `subattributes`.`attributes_id_attributes` = ? '
    let orderBy = 'ORDER BY `subattributes`.`id_subattributes`  ASC'

    let query = select+from+join+where+orderBy
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attribute,id_attribute], function(err,rows,fields){
            if (!err){
              
                res.status(200).json(rows);
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})
/*
Input: 
"id_subattributes": Ej [5,2,1],   

Output: Resume of attributes of that player
Description: Simple MYSQL query
*/
tables.post('/attributes_by_subattributes',(req,res)=>{
    let id_subattributes = req.body.id_subattributes;
    console.log(req.body)
    console.log('id_subattributes')
    console.log(id_subattributes)

    let select = 'SELECT`attributes`.`id_attributes` '
    let from = 'FROM `attributes` '
    let join = 'JOIN `subattributes` ON `attributes`.`id_attributes` = `subattributes`.`attributes_id_attributes` '

    var thisaux = "";
    for (let index = 0; index < id_subattributes.length-1; index++) {
        thisaux += id_subattributes[index]+",";
    }
    thisaux += id_subattributes[id_subattributes.length-1]

    let where = 'WHERE `subattributes`.`id_subattributes` IN ('+thisaux+')'
    let orderBy = 'ORDER BY `attributes`.`id_attributes`  ASC'

    let query = select+from+join+where+orderBy
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query, function(err,rows,fields){
            if (!err){
                var id_attributes = []
                rows.forEach(result => {
                    id_attributes.push(result.id_attributes)
                });
        
                res.status(200).json({"id_attributes":id_attributes});
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})


tables.get('/player_all_attributes/:id_player',(req,res)=>{
    let id_player = req.params.id_player;

    let select = 'SELECT `attributes`.`id_attributes`,`attributes`.`name`, `playerss_attributes`.`data` '
    let from = 'FROM `playerss_attributes` '
    let join = 'JOIN `attributes` ON `attributes`.`id_attributes` =  `playerss_attributes`.`id_attributes` '
    let where = 'WHERE `playerss_attributes`.`id_playerss` = ? '

    let query = select+from+join+where
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player], function(err,rows,fields){
            if (!err){           
                console.log(rows)           
                res.status(200).json(rows);
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})

/*
Input: 
let player_attributes = {
        "id_player":new_attribute_experience.id_player, //EJ: 1
        "id_attributes":new_attribute_experience.id_attributes// Ej: [1,2]
    }

Output:

data = [20,10]
Description: Simple MYSQL query
*/
tables.post('/player_attributes',(req,res)=>{
    let id_player = req.body.id_player;
    let id_attributes = req.body.id_attributes;

    let select = 'SELECT `playerss_attributes`.`data` '
    let from = 'FROM `playerss_attributes` '

    var thisaux = "";
    for (let index = 0; index < id_attributes.length-1; index++) {
        thisaux += id_attributes[index]+",";
    }
    thisaux += id_attributes[id_attributes.length-1]

    let where = 'WHERE `playerss_attributes`.`id_playerss` = ?  '
    let and = 'AND `playerss_attributes`.`id_attributes` IN ('+thisaux+')'

    let query = select+from+where+and
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player], function(err,rows,fields){
            if (!err){
                var attributes = []
                rows.forEach(result => {
                    attributes.push(result.data)
                });
        
                res.status(200).json({"attributes":attributes});
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })

})
/*
Input: 
let player_attributes = {
        "id_player":new_attribute_experience.id_player, //EJ: 1
        "id_attributes":new_attribute_experience.id_attributes// Ej: 3
    }

Output:

data = [20,10]
Description: Simple MYSQL query
*/
tables.get('/player_attributes_single',(req,res)=>{
    let id_player = req.body.id_player;
    let id_attributes = req.body.id_attributes;

    let select = 'SELECT `playerss_attributes`.`data` '
    let from = 'FROM `playerss_attributes` '
    let where = 'WHERE `playerss_attributes`.`id_playerss` = ?  '
    let and = 'AND `playerss_attributes`.`id_attributes` = ?'

    let query = select+from+where+and
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player,id_attributes], function(err,rows,fields){
            if (!err){
                console.log(rows.data)
                console.log(rows[0].data)
                res.status(200).json({"data":rows[0].data});
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})


export default tables;