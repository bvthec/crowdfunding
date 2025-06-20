'use strict';
import express from 'express';
import controllers from '../controllers/bank.mjs';

const router = express.Router();

router.get('/', controllers.index);
router.get('/add', controllers.addPage);
router.post('/add', controllers.add);
router.get('/edit/:bankId', controllers.editPage);
router.post('/edit', controllers.edit);
router.get('/delete/:bankAccountId', controllers.deleteBank);

export default router;