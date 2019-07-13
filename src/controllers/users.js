/* eslint-disable consistent-return */
/* eslint-disable no-console */
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Validate from '../helpers/Validate';

import db from '../models/db';

dotenv.config();

class User {
  /* signup */
  static async signup(req, res) {
    // Validate inputs
    const checkInputs = [];
    checkInputs.push(Validate.name(req.body.firstName, true));
    checkInputs.push(Validate.name(req.body.lastName, true));
    checkInputs.push(Validate.name(req.body.otherName, false));
    checkInputs.push(Validate.email(req.body.email, true));
    checkInputs.push(Validate.phone(req.body.phone, true));
    checkInputs.push(Validate.name(req.body.username, true));

    for (let i = 0; i < checkInputs.length; i += 1) {
      if (checkInputs[i].isValid === false) {
        return res.status(400).json({
          status: 400,
          error: checkInputs[i].error,
        });
      }
    }

    const text = `INSERT INTO
            users("firstName", "lastName", "otherName", email, phone, username, password, "isAdmin")
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            returning id, "firstName", "lastName", "otherName", email, phone, username, registered, "isAdmin"`;


    const values = [
      req.body.firstName,
      req.body.lastName,
      req.body.otherName,
      req.body.email,
      req.body.phone,
      req.body.username,
      bcrypt.hashSync(req.body.password, 8),
      req.body.isAdmin,
    ];

    try {
      let checkUser = '';

      if (req.body.email) {
        checkUser = await db.query('SELECT * FROM users WHERE username=$1 OR email=$2 AND password=$3', [req.body.username, req.body.email, req.body.password]);
      } else {
        checkUser = await db.query('SELECT * FROM users WHERE username=$1 AND password=$2', [req.body.username, req.body.password]);
      }

      if (checkUser.rows.length > 0) {
        return res.status(200).json({
          status: 200,
          error: 'Sorry, this account already exists',
        });
      }

      const {
        rows,
      } = await db.query(text, values);
      if (rows.length > 0) {
        rows[0].registered = new Date(rows[0].registered).toDateString();
        return res.status(201).json({
          status: 201,
          data: rows[0],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /* login */
  static async login(req, res) {
    // Validate inputs
    let checkInput = false;
    checkInput = Validate.email(req.body.email, true);

    if (checkInput.isValid === false) {
      return res.status(400).json({
        status: 400,
        error: checkInput.error,
      });
    }

    try {
      const {
        rows,
      } = await db.query('SELECT * FROM users WHERE email=$1', [req.body.email]);

      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += 1) {
          if (bcrypt.compareSync(req.body.password, rows[i].password)) {
            const userType = rows[i].isAdmin ? 'admin' : 'normal';
            const token = jwt.sign({
              userId: rows[i].id,
              userType,
            }, process.env.SECRET_KEY, {
              expiresIn: 86400, // expires in 24 hours
            });
            return res.status(200).json({
              status: 200,
              data: {
                id: rows[i].id,
                firstName: rows[i].firstName,
                lastName: rows[i].lastName,
                otherName: rows[i].otherName,
                email: rows[i].email,
                phone: rows[i].phone,
                username: rows[i].username,
                registered: new Date(rows[i].registered).toDateString(),
                isAdmin: rows[i].isAdmin,
              },
              token,
            });
          }
        }
      }

      return res.status(400).json({
        status: 400,
        error: 'Sorry, your username or password is incorrect',
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default User;
