/* eslint-disable no-console */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line no-unused-vars
const env = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev'
  ? `_${process.env.NODE_ENV}`
  : '';

const DATABASE_URL = process.env.env === 'test' ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

export default {
  connect() {
    return pool.connect()
      .then(() => console.log('Postgres connected'))
      .catch(err => console.log('failed', err));
  },
  query(text, params) {
    return new Promise((resolve, reject) => {
      pool
        .query(text, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
