const express = require("express");
const app = express();

//Settings
app.set('port',process.env.PORT || 3001);

//Middlewares
app.use(express.json());

//Routes
app.use(require('./routes/Players'))

//Starting the server
app.listen(3001, () => {
 console.log("El servidor está inicializado en el puerto 3001");
});