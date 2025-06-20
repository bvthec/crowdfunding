'use strict';
import express from 'express';
import controllers from '../controllers/projects.mjs';

const router = express.Router();

router.get('/', controllers.index);
router.get('/list', controllers.listProjects);
router.get('/add', controllers.addPage);
router.post('/add', controllers.add);
router.get('/edit', controllers.editListPage);
router.get('/edit/:projectId', controllers.editPage);
router.post('/edit', controllers.edit);
router.get('/delete', controllers.deletePage);
router.get('/delete/:projectId', controllers.deleteProject);
// TODO: consider moving this view to another place
router.get('/history', controllers.history);

export default router;