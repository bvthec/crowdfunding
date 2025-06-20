'use strict';
import express from 'express';

import controllers from '../controllers/client.mjs';
import cardRouter from './card.mjs';
import bankRouter from './bank.mjs';
import { requireSessionMiddleware } from '../lib/session.mjs';

const router = express.Router();

// card management
router.use('/card', requireSessionMiddleware('client'), cardRouter);
router.use('/bank', requireSessionMiddleware('client'), bankRouter);

router.get('/', controllers.mainMenu);
router.get('/projects', controllers.projectListPage);
router.get('/details/:projectId', controllers.projectDetails);

router.get('/fund-project/:projectId',
    requireSessionMiddleware('client'),
    controllers.fundProjectForm);

router.post('/fund-project', 
    requireSessionMiddleware('client'),
    controllers.fundProject);

export default router;