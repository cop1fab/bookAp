import express from 'express';
import user from './users/auth';

const app = express();
app.use('/auth', user);

export default app;
