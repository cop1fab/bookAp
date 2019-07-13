/* eslint-disable no-console */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const env = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev') ? `_${process.env.NODE_ENV}` : '';

const pool = new pg.Pool({
  connectionString: process.env[`DATABASE_URL${env}`],
});

pool.on('connect', (res) => {
  console.log(res);
  console.log('connected to the Database');
});

const drop = () => {
  const usersTable = 'DROP TABLE IF EXISTS users CASCADE';
  const bookTable = 'DROP TABLE IF EXISTS books CASCADE';


  const dropQueries = `${usersTable}; ${bookTable};`;

  pool.query(dropQueries)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
  pool.on('remove', () => {
    console.log('client removed');
    process.exit(0);
  });
};

const create = () => {
  const usersTable = `CREATE TABLE IF NOT EXISTS
      users(
        id SERIAL PRIMARY KEY,
        "firstName" VARCHAR(50) NOT NULL,
        "lastName" VARCHAR(50) NOT NULL,
        "otherName" VARCHAR(50) NOT NULL,
        email VARCHAR(100) NULL,
        phone VARCHAR(15) NOT NULL,
        username VARCHAR(50) NOT NULL,
        password TEXT NOT NULL,
        registered TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isAdmin" BOOLEAN NOT NULL DEFAULT false
      )`;

  const bookTable = `CREATE TABLE IF NOT EXISTS
      books(
        id SERIAL PRIMARY KEY,
        "createdOn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "serialNumber" VARCHAR(100) NOT NULL,
        title VARCHAR(50) NOT NULL,
        price VARCHAR(50) NOT NULL
      )`;

  const createQueries = `${usersTable}; ${bookTable}`;

  pool.query(createQueries)
    .then((res) => {
      console.log(res);
      pool.on('remove', () => {
        console.log('client removed');
        process.exit(0);
      });
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.on('remove', () => {
        console.log('client removed');
        process.exit(0);
      });
      pool.end();
    });
};

export {
  drop,
  create,
  pool,
};

require('make-runnable');
