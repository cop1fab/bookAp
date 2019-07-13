import express from 'express';
import usersRouter from './routes/users/auth';
import db from './models/db';

const app = express();

db.connect();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);

app.use('/auth', usersRouter);

export default app;
