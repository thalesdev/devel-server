import express from 'express';
import 'reflect-metadata';
import './database';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users.routes'
import companiesRouter from './routes/companies.routes'
import employeesRouter from './routes/employees.routes'
import sessionsRouter from './routes/sessions.routes'
import filesRouter from './routes/files.routes'


dotenv.config();
const app = express();
const port = process.env.PORT || 3333;


app.use(cors());
app.use(express.json());


app.listen(port, () => {
  console.log(`✅ Devel-server is running on port ${port} `);
});


app.get('/', (req, res) => {

  res
    .status(200)
    .json({ message: 'Welcome to devel api, check the documentation.' });
});



app.use('/users', usersRouter);
app.use('/companies', companiesRouter);
app.use('/employees', employeesRouter);
app.use('/sessions', sessionsRouter);
app.use('/files', filesRouter);


export default app;
