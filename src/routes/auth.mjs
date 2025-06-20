'use strict';
import express from 'express';
import controllers from '../controllers/auth.mjs';
import { requireSessionMiddleware } from '../lib/session.mjs';

const router = express.Router();

router.use((req, res, next) => {
    res.locals.layout = 'auth';
    next();
});

router.get('/', controllers.loginForm);
router.post('/', controllers.login);
router.get('/logout', controllers.logout);
router.get('/status', controllers.sessionStatus);
router.get('/create', controllers.addUserPage);
router.post('/create', controllers.addUser);
router.get('/edit',
    requireSessionMiddleware('client'),
    controllers.editUserInfoPage);
router.post('/edit',
    requireSessionMiddleware('client'),
    controllers.editUserInfo);

export default router;