'use strict';
import express from 'express';
import controllers from '../controllers/admin.mjs';

const router = express.Router();

// change handlebars main layout
router.use((req, res, next) => {
    res.locals.layout = 'admin'; // admin main template
    next();
});

router.get('', controllers.mainPanel);
router.get('/projects/approve-menu', controllers.approvePage);
router.get('/project', controllers.projectListPage);
router.get('/project/details/:projectId', controllers.project);
router.post('/project/state', controllers.changeProjectState);

export default router;