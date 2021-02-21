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

function formatForCirclePackageChart(rows,single_name,chosen_name){
    var series = {"name":"variants","children":[]}
    let names = []
    rows.forEach(row => {
        names.push(row[single_name])
    });
  
    var unique_names_array = unique_names(names)
    for (const name of unique_names_array) {
        series.children.push({name:name, children:[]})
    }

    for (const contribution of rows) {
        series.children.forEach(node => {
            if(contribution[single_name] === node.name){
                node.children.push({name:contribution[chosen_name], size:contribution.total})
            }
        });        
    }
    console.log(series)
    return series

}

/* 1) Contribucion de los endpoints de un sensor en especifico a cada una de las dimensiones (tambien da la dimension a la que esta asociado) */

attributes.get('/attributes/:id_player/online_sensor/:id_online_sensor',(req,res,next) => {

    var id_player = req.params.id_player
    var id_online_sensor = req.params.id_online_sensor

    var select = 'SELECT  `attributes`.`id_attributes`, `attributes`.`name` AS `name_attributes`,  `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint`, `sensor_endpoint`.`name` AS `name_sensor_endpoint`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
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
                console.log(rows);
                var result = formatForCirclePackageChart(rows,'name_sensor_endpoint','name_attributes')
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

    var select = 'SELECT `attributes`.`id_attributes`, `attributes`.`name` AS `name_attributes`, `subattributes`.`id_subattributes`, `subattributes`.`name` AS `name_subattributes`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
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
                console.log(rows);
                var result = formatForCirclePackageChart(rows,'name_attributes','name_subattributes')
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
function formatForTreeMap(rows){
    let name_online_sensor = []
    rows.forEach(row => {
        name_online_sensor.push(row.name_online_sensor)
    });
  
    var unique_online_sensor_names = unique_names(name_online_sensor)
    var series = []
    for (const online_sensor of unique_online_sensor_names) {
        series.push({name:online_sensor, data:[]})
    }

    for (const contribution of rows) {
        series.forEach(sensor => {
            if(contribution.name_online_sensor === sensor.name){
                sensor.data.push({x:contribution.name_sensor_endpoint, y:contribution.total})
            }
        });        
    }
    console.log(series)
    return series

}
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
                var series = formatForTreeMap(rows)
                res.status(200).json(series)
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
                res.status(200).json(rows)
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
                var series = formatForTreeMap(rows)
                res.status(200).json(series)
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

3) Subatributos adquiridos (nivel de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia ATEMPORALMENTE 

Tabla: Fila es el detalle del dato adquirido

4) Subatributos adquiridos (nivel de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia ATEMPORALMENTE 
     LISTA DE SUBATTRIBUTOS

*/ 
function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}
function sumArrays(arr1, arr2){
    var result = []
    for (let index = 0; index < arr1.length; index++) {
        result.push(arr1[index]+arr2[index]);
        
    }
    return result
}
function unique_names(names){
    var unique_names_array = names.reduce(function(a,b){
        if (a.indexOf(b) < 0 ) a.push(b);
        return a;
    },[]);
    return unique_names_array
}
function formatForLinePlot(rows){
    console.log('Se realizo correctamente la query y se tuvo el siguiente resultado:')
    console.log(rows)
    var created_times = []
    var dimension_names = []

    rows.forEach(row => {
        created_times.push(row.created_time.toString())
        dimension_names.push(row.name.toString())
    });
  
    var unique_dimension_names = unique_names(dimension_names)

    var length = created_times.length
    var dimensions = {}
    for (const name of unique_dimension_names) {
        dimensions[name] = Array(length).fill(0)                    
    }
    rows.forEach((row_data,index) => {
        dimensions[row_data.name][index] = row_data.total
    });
    var data_matrix = []
    for (const dimension in dimensions) {
        data_matrix.push(dimensions[dimension])
    }
    var transposed_matrix = transpose(data_matrix)
    console.log('Original data matrix')
    console.log(data_matrix)
    console.log('Transpose data matrix')
    console.log(transposed_matrix)

    var count = [1]
    var index_count = 0
    for (let index = 0; index < created_times.length; index++) {
        if(index+1 == created_times.length){
            break;
        }
        else{
            let time = created_times[index];
            let next_time = created_times[index+1];

            if(time === next_time ){
                count[index_count]++
            }
            else{
                count.push(1)
                index_count++
            }
        }
        
    }
    var unique_created_times = unique_names(created_times)
    console.log('created_times original')
    console.log(created_times)
    console.log(typeof(created_times[0]))

    console.log('created_times unique')
    console.log(unique_created_times)

    var matrix_transpose_result = []

    var matrix_index_aux = 0
    count.forEach((counter) => {
        let aux_counter = counter
        let aux_index = counter
        if(aux_counter !== 1){
            let second_aux = 0
            while(aux_counter !== 1){
                transposed_matrix[matrix_index_aux] = sumArrays(transposed_matrix[matrix_index_aux], transposed_matrix[second_aux+1])
                aux_counter--
                second_aux++
            }
            matrix_transpose_result.push(transposed_matrix[matrix_index_aux])
            matrix_index_aux+= aux_index
        }
        else{
            matrix_transpose_result.push(transposed_matrix[matrix_index_aux])
            matrix_index_aux++
        }

    });
    if(unique_created_times.length !== matrix_transpose_result.length){
        console.log('Hubo un error en el algoritmo')
    }
    var real_result = transpose(matrix_transpose_result)
    
    var result_series = []
    var index_aux_final = 0
    for (const series in dimensions) {
        result_series.push({name: series, data:real_result[index_aux_final] })
        index_aux_final++
    }

    var final_result = {
        "series": result_series,
        "categories": unique_created_times

    }
    return final_result
}
/*1) Suma de subatributos adquiridos (dando como resultado la evolucion de la dimension en el tiempo) dado un jugador sin importar su procedencia en un rango de tiempo */
attributes.post('/id_player/:id_player/attributes_time_evolution',(req,res,next) => {

    var id_player = req.params.id_player
    var from_time = req.body.from_time
    var to_time = req.body.to_time
    console.log(req.body)
    console.log(from_time)
    console.log(to_time)
    console.log(typeof(from_time))
    console.log(typeof(to_time))
    var select = ' SELECT `subattributes`.`attributes_id_attributes`, `attributes`.`name`, SUM(`adquired_subattribute`.`data`) AS `total`, `adquired_subattribute`.`created_time` '
    
    var from = 'FROM `adquired_subattribute` '
    var join = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` = `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` '
    var join2 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `adquired_subattribute`.`id_players` = ? '
    var time = ' AND `adquired_subattribute`.`created_time` BETWEEN ? AND ? ' 
    var group = 'GROUP BY `adquired_subattribute`.`created_time`,  `subattributes`.`attributes_id_attributes` ' 
    var order = 'ORDER BY `adquired_subattribute`.`created_time` ASC'
    var query = select+from+join+join2+where+time+group+order
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player, from_time, to_time], function(err,rows,fields){
            if (!err){
                var final_result = formatForLinePlot(rows)
                res.status(200).json(final_result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})


/*2) Subatributos adquiridos (evolucion de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia en un rango de tiempo */
attributes.post('/id_player/:id_player/attributes/:id_attributes/subattributes_time_evolution',(req,res,next) => {

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
                var final_result = formatForLinePlot(rows)
                res.status(200).json(final_result)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})

/*3) Subatributos adquiridos (nivel de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia ATEMPORALMENTE */
attributes.get('/id_player/:id_player/attributes/:id_attributes/subattributes_levels',(req,res,next) => {

    var id_player = req.params.id_player
    var id_attributes = req.params.id_attributes

    var select = 'SELECT `attributes`.`id_attributes`, `attributes`.`name` AS `name_dimension`,`subattributes_conversion_sensor_endpoint`.`id_subattributes`, `subattributes`.`name` AS `name_subattributes`, SUM(`adquired_subattribute`.`data`) AS `total` '
    
    var from = 'FROM `adquired_subattribute` '
    var join = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` = `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` '
    var join2 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var where = 'WHERE `attributes`.`id_attributes` = ? AND `subattributes`.`attributes_id_attributes` = ? AND `adquired_subattribute`.`id_players` = ? '
    var group = 'GROUP BY `subattributes_conversion_sensor_endpoint`.`id_subattributes` ' 
    var query = select+from+join+join2+where+group
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_attributes,id_attributes,id_player], function(err,rows,fields){
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

/*4) Subatributos adquiridos (nivel de subatributos individual) asociados a una dimension y dado un jugador sin importar su procedencia ATEMPORALMENTE 
     LISTA DE SUBATTRIBUTOS
*/
attributes.get('/id_player/:id_player/adquired_subattributes_list',(req,res,next) => {

    var id_player = req.params.id_player

    var select = 'SELECT `attributes`.`id_attributes`, `attributes`.`name` AS `name_dimension`,`subattributes_conversion_sensor_endpoint`.`id_subattributes`, `subattributes`.`name` AS `name_subattributes`,`online_sensor`.`id_online_sensor`, `online_sensor`.`name` AS `name_online_sensor`, `sensor_endpoint`.`id_sensor_endpoint`,`sensor_endpoint`.`name` AS `name_sensor_endpoint`,`sensor_endpoint`.`description`, `adquired_subattribute`.`data`, `adquired_subattribute`.`created_time` '
    
    var from = 'FROM `adquired_subattribute` '
    var join = 'JOIN `subattributes_conversion_sensor_endpoint` ON `subattributes_conversion_sensor_endpoint`.`id_subattributes_conversion_sensor_endpoint` = `adquired_subattribute`.`id_subattributes_conversion_sensor_endpoint` '
    var join2 = 'JOIN `subattributes` ON `subattributes`.`id_subattributes` = `subattributes_conversion_sensor_endpoint`.`id_subattributes` JOIN `attributes` ON `subattributes`.`attributes_id_attributes` = `attributes`.`id_attributes` '
    var join3 = 'JOIN `sensor_endpoint` ON `sensor_endpoint`.`id_sensor_endpoint` = `subattributes_conversion_sensor_endpoint`.`id_sensor_endpoint` '
    var join4 = 'JOIN `online_sensor` ON `sensor_endpoint`.`sensor_endpoint_id_online_sensor` = `online_sensor`.`id_online_sensor` '
    var where = 'WHERE `adquired_subattribute`.`id_players` = ? '
    var order = 'ORDER BY `adquired_subattribute`.`created_time` DESC '
    var limit = 'LIMIT 200'
    var query = select+from+join+join2+join3+join4+where+order+limit
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player], function(err,rows,fields){
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
/*4) Atributos gastados (nivel de subatributos individual) asociados a un videojuego y dado un jugador sin importar su procedencia ATEMPORALMENTE 
     LISTA DE ATRIBUTOS (ATRIBUTOS = DIMENSIONES)
*/
attributes.get('/id_player/:id_player/expended_attributes_list',(req,res,next) => {

    var id_player = req.params.id_player

    var select = 'SELECT DISTINCT `attributes`.`id_attributes`, `attributes`.`name` AS `name_dimension`,`videogame`.`id_videogame`, `videogame`.`name` AS `name_videogame`, `modifiable_mechanic`.`id_modifiable_mechanic`,`modifiable_mechanic`.`name` AS `name_modifiable_mechanic`, `modifiable_mechanic`.`description`, `expended_attribute`.`data`, `expended_attribute`.`created_time` '
    var from = 'FROM `expended_attribute` '
    var join = 'JOIN `modifiable_conversion_attribute` ON `modifiable_conversion_attribute`.`id_modifiable_conversion_attribute` = `expended_attribute`.`id_modifiable_conversion_attribute` '
    var join2 = 'JOIN `videogame` ON `videogame`.`id_videogame` = `expended_attribute`.`id_videogame` '
    var join3 = 'JOIN `attributes` ON `attributes`.`id_attributes` = `modifiable_conversion_attribute`.`id_attributes` '
    var join4 = 'JOIN `modifiable_mechanic` ON `modifiable_mechanic`.`id_modifiable_mechanic` = `modifiable_conversion_attribute`.`id_modifiable_mechanic` '
    var join5 = 'JOIN `modifiable_mechanic_videogame` ON `modifiable_mechanic_videogame`.`id_modifiable_mechanic` = `modifiable_mechanic`.`id_modifiable_mechanic` AND `modifiable_mechanic_videogame`.`id_videogame` = `videogame`.`id_videogame` '
    var where = 'WHERE `expended_attribute`.`id_players` = ? '
    var order = 'ORDER BY `expended_attribute`.`created_time` DESC '
    var limit = ' LIMIT 200'

    var query = select+from+join+join2+join3+join4+join5+where+order+limit
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[id_player], function(err,rows,fields){
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

attributes.post('/subattribute_conversion_sensor_endpoint/:id_sensor_endpoint',(req,res,next) => {

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
var modifiableAdquired = {
    "id_videogame": id_videogame,  
    "id_modifiable_mechanic":spend_attributes.id_modifiable_mechanic,
    "id_conversion":spend_attributes.id_conversion,
    "id_attributes":spend_attributes.id_attributes
}

*/
attributes.post('/modifiable_conversion_attribute',(req,res,next)=>{
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