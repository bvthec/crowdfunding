'use strict';
import express from 'express';
import controllers from '../controllers/card.mjs';

const router = express.Router();

router.get('/', controllers.index);
router.get('/add', controllers.addPage);
router.post('/add', controllers.add);
router.get('/edit/:cardId', controllers.editPage);
router.post('/edit', controllers.edit);
router.get('/delete/:cardId', controllers.deleteCard);

export default router;