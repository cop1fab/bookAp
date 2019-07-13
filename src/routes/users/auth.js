import express from 'express';
import User from '../../controllers/users';

const router = express.Router();

router.post('/register', User.signup);
router.post('/login', User.login);

export default router;
