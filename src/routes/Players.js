const express = require('express');
const router = express.Router();

const mysqlConnection = require('../database');


router.get("/", (req,res) =>{
    var variable = req.body
    res.status(200).json("holas2")

});




router.get('/attributes/:id_player/online_sensor/:id_online_sensor',(req,res,next) => {

    var id_player = req.params.id_player
    var id_online_sensor = req.params.id_online_sensor

    var select = 'SELECT  `attributes`.`id_attributes`, `attributes`.`name`,  `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint`, `sensor_endpoint`.`name`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor`  JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `online_sensor`.`id_online_sensor` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint`, `attributes`.`id_attributes` ' 
    var orderby = 'ORDER BY `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` ASC '

    var query = select+from+join+join2+join3+where+group+orderby
    mysqlConnection.query(query,[id_online_sensor,id_player,id_player], function(err,rows,fields){
        let result = rows[0]
        if (!err){
            console.log(rows);
            res.status(200).json(result)
        } else {
            console.log(err);
        }
    });
})



router.get('/subattributes/:id_player/online_sensor/:id_online_sensor/sensor_endpoint/:id_sensor_endpoint',(req,res,next) => {

    var id_player = req.params.id_player
    var id_online_sensor = req.params.id_online_sensor
    var id_sensor_endpoint = req.params.id_sensor_endpoint

    var select = 'SELECT `attributes`.`id_attributes`, `attributes`.`name`, `subattributes`.`id_subattributes`, `subattributes`.`name`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `online_sensor` '
    var join = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor` JOIN `players_sensor_endpoint` ON `players_sensor_endpoint`.`Id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` '
    var join2 = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = `sensor_endpoint`.`id_sensor_endpoint` JOIN `adquired_subattribute` ON `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` '
    var join3 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `online_sensor`.`id_online_sensor` = ? AND `sensor_endpoint`.`id_sensor_endpoint` = ? AND `players_sensor_endpoint`.`id_players` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `subattributes_conversion_sensor_endpoint`.`id_subattributes`' 

    var query = select+from+join+join2+join3+where+group
    mysqlConnection.query(query,[id_online_sensor,id_sensor_endpoint,id_player,id_player], function(err,rows,fields){
        let result = rows[0]
        if (!err){
            console.log(rows);
            res.status(200).json(result)
        } else {
            console.log(err);
        }
    });
})






/* SELECT `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint`
FROM `subattributes_conversion_sensor_endpoint`
WHERE `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` = 1 AND `subattributes_conversion_sensor_endpoint`.`id_conversion` IN ('7','4') AND `subattributes_conversion_sensor_endpoint`.`id_subattributes` IN ('4','64')
*/

router.get('/subattribute_conversion_sensor_endpoint/:id_sensor_endpoint',(req,res,next) => {

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
    mysqlConnection.query(finalQuery,[], function(err,rows,fields){
        if (!err){
            var id_subattributes_conversion_sensor_endpoint = []
            rows.forEach(result => {
                id_subattributes_conversion_sensor_endpoint.push(result.id_subattributes_conversion_sensor_endpoint)
            });

            res.status(200).json({"id_subattributes_conversion_sensor_endpoint":id_subattributes_conversion_sensor_endpoint});
        } else {
            console.log(err);
        }
    });
})




/* Input":
var modifiedAdquired = {
    "id_videogame": id_videogame,  
    "id_modifiable_mechanic":spend_attributes.id_modifiable_mechanic,
    "id_conversion":spend_attributes.id_conversion,
    "id_attributes":spend_attributes.id_attributes
}

*/
router.get('/modifiable_conversion_attribute',(req,res,next)=>{
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
    mysqlConnection.query(finalQuery,[], function(err,rows,fields){
        if (!err){
            var id_modifiable_conversion_attribute = []
            rows.forEach(result => {
                id_modifiable_conversion_attribute.push(result.id_modifiable_conversion_attribute)
            });

            res.status(200).json({"id_modifiable_conversion_attribute":id_modifiable_conversion_attribute});

        } else {
            console.log(err);
        }
    });
})

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
    console.log(req.body)
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


router.get('/player_all_attributes/:id_player',(req,res)=>{
    let id_player = req.params.id_player;

    let select = 'SELECT `attributes`.`name`, `playerss_attributes`.`data` '
    let from = 'FROM `playerss_attributes` '
    let join = 'JOIN `attributes` ON `attributes`.`id_attributes` =  `playerss_attributes`.`id_attributes` '
    let where = 'WHERE `playerss_attributes`.`id_playerss` = ? '

    let query = select+from+join+where
    mysqlConnection.query(query,[id_player],(err,rows,fields)=>{
        if(!err){
            
            var names = []
            var data = []
            rows.forEach(result => {
                names.push(result.name)
                data.push(result.data)
            });

            res.json({"name": names,"data":data});
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

            res.status(200).json({"attributes":attributes});
        } else {
            console.log(err);
        }
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
router.get('/player_attributes_single',(req,res)=>{
    let id_player = req.body.id_player;
    let id_attributes = req.body.id_attributes;

    let select = 'SELECT `playerss_attributes`.`data` '
    let from = 'FROM `playerss_attributes` '
    let where = 'WHERE `playerss_attributes`.`id_playerss` = ?  '
    let and = 'AND `playerss_attributes`.`id_attributes` = ?'

    let query = select+from+where+and
    mysqlConnection.query(query,[id_player,id_attributes],(err,rows,fields)=>{
        if(!err){
            console.log(rows.data)
            console.log(rows[0].data)
            res.status(200).json({"data":rows[0].data});
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