import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
//Routes
import attributes from './routes/attributes';
import tables from './routes/tables';

const app = express();

//Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors())

//Routes
app.use(attributes);
app.use(tables);

export default app;