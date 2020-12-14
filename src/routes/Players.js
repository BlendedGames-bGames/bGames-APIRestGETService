const express = require('express');
const router = express.Router();

const mysqlConnection = require('../database');

/*
Input: Id of a player (range 0 to positive int)
Output: Resume of attributes of that player
Description: Simple MYSQL query
*/
router.get('/attributes/resume/:id',(req,res)=>{
    const{id}= req.params;
    mysqlConnection.query('SELECT*FROM attributes WHERE players_id_players = ?',[id],(err,rows,fields)=>{
        if(!err){
            res.json(rows);
        } else {
            console.log(err);
        }
    })
    console.log(id);
})

/*
Input: 
"id_subattributes": Ej [5,2,1],   

Output: Resume of attributes of that player
Description: Simple MYSQL query
*/
router.get('/attributes_by_subattributes',(req,res)=>{
    let id_subattributes = req.body.id_subattributes;
    console.log('id_subattributes')
    console.log(id_subattributes)

    let select = 'SELECT`attributes`.`id_attributes`'
    let from = 'FROM `attributes`'
    let join = 'JOIN `subattributes` ON `attributes`.`id_attributes` = `subattributes`.`attributes_id_attributes`'

    var thisaux = "";
    for (let index = 0; index < id_subattributes.length-1; index++) {
        thisaux += id_subattributes[index]+",";
    }
    thisaux += id_subattributes[id_subattributes.length-1]

    let where = 'WHERE `subattributes`.`id_subattributes` IN ('+thisaux+')'
    let orderBy = 'ORDER BY `attributes`.`id_attributes`  ASC'

    let query = select+from+join+where+orderBy
    mysqlConnection.query(query,(err,rows,fields)=>{
        if(!err){
            
            var id_attributes = []
            rows.forEach(result => {
                id_attributes.push(result.id_attributes)
            });

            res.json({"id_attributes":id_attributes});
        } else {
            console.log(err);
        }
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
router.get('/player_attributes',(req,res)=>{
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
    mysqlConnection.query(query,[id_player],(err,rows,fields)=>{
        if(!err){
            var attributes = []
            rows.forEach(result => {
                attributes.push(result.data)
            });

            res.json({"attributes":attributes});
        } else {
            console.log(err);
        }
    })
})




/*
Input: Id of a player (range 0 to positive int)
Output: Specific resume of a single attribute of that player
Description: Simple MYSQL query
*/
router.get('/attributes/resume/:id/:type',(req,res)=>{
    const{id,type}= req.params;
    console.log("Tipo ?"+type);
    mysqlConnection.query('SELECT*FROM attributes WHERE players_id_players = ? AND name = ?',[id,type],(err,rows,fields)=>{
        if(!err){
            res.json(rows);
        } else {
            console.log(err);
        }
    })
    console.log(id);
})

/*
Input: Id of a player (range 0 to positive int)
Output: Subattributes of that player
Description: Doble MYSQL query
*/
router.get('/attributes/:id',(req,res)=>{
    const{id}= req.params;
    
    console.log('casienelquery');
    try {mysqlConnection.query('SELECT*FROM `attributes` where players_id_players = ?',[id], function(err,rows,fields){
        console.log('CASI EN EL IF del Get attributes',!err);
        if(!err){
            var thisaux = "";
            for (let index = 0; index < rows.length-1; index++) {
                thisaux += rows[index].id_attributes+",";
            }
            thisaux += rows[rows.length-1].id_attributes;
            thisaux = 'SELECT*FROM `subattributes` where attributes_id_attributes IN ('+thisaux+')'
            console.log("Esta Cosa tiene: "+ thisaux);
            mysqlConnection.query(thisaux,[], function(err2,rows2,fields2){
                if (!err2){
                    console.log('Antes del succes'+ rows2.length);
                    res.json(rows2);
                } else {
                    console.log(err);
                    res.json('Error en subatributos')
                }
            });
        } else {
            console.log(err);
            res.json('No existe jugador');
        }
        
    });
    } catch(ex) {
        callback(new Error('something bad happened'));
    }
})

/*
Input: Id of a player (range 0 to positive int)
Output: Subattributes of that player in a specific attribute using its category name as identifier
Description: Doble MYSQL query
*/
router.get('/attributes/bycategory/:id/:typecat',(req,res)=>{
    const{id,typecat}= req.params;
    
    console.log('casienelquery');
    try {mysqlConnection.query('SELECT*FROM `attributes` where players_id_players = ?',[id], function(err,rows,fields){
        console.log('CASI EN EL IF',!err);
        if(!err){
            var thisaux = "";
            for (let index = 0; index < rows.length-1; index++) {
                thisaux += rows[index].id_attributes+",";
            }
            thisaux += rows[rows.length-1].id_attributes;
            thisaux = 'SELECT*FROM `subattributes` where namecategory = ? AND attributes_id_attributes IN('+thisaux+')'
            console.log("Esta Cosa tiene: "+ thisaux);
            mysqlConnection.query(thisaux,[typecat], function(err2,rows2,fields2){
                if (!err2){
                    console.log('Antes del succes'+ rows2.length);
                    res.json(rows2);
                } else {
                    console.log(err);
                    res.json('Error en subatributos')
                }
            });
        } else {
            console.log(err);
            res.json('No existe jugador');
        }
        
    });
    } catch(ex) {
        callback(new Error('something bad happened'));
    }
})

/*
Input: Id of a player (range 0 to positive int)
Output: Subattributes of that player in a specific attribute using its name (subattribute) as identifier
Description: Doble MYSQL query
*/
router.get('/attributes/byname/:id/:typeAtt',(req,res)=>{
    const{id,typeAtt}= req.params;
    
    console.log('casienelquery');
    try {mysqlConnection.query('SELECT*FROM `attributes` where players_id_players = ?',[id], function(err,rows,fields){
        console.log('CASI EN EL IF',!err);
        if(!err){
            var thisaux = "";
            for (let index = 0; index < rows.length-1; index++) {
                thisaux += rows[index].id_attributes+",";
            }
            thisaux += rows[rows.length-1].id_attributes;
            thisaux = 'SELECT*FROM `subattributes` where nameat = ? AND attributes_id_attributes IN('+thisaux+')'
            console.log("Esta Cosa tiene: "+ thisaux);
            mysqlConnection.query(thisaux,[typeAtt], function(err2,rows2,fields2){
                if (!err2){
                    console.log('Antes del succes'+ rows2.length);
                    res.json(rows2);
                } else {
                    console.log(err);
                    res.json('Error en subatributos')
                }
            });
        } else {
            console.log(err);
            res.json('No existe jugador');
        }
        
    });
    } catch(ex) {
        callback(new Error('something bad happened'));
    }
})

module.exports = router;