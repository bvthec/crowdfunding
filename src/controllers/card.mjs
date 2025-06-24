'use strict';
import models from '../models.mjs';
import { hash, compareHash } from '../lib/security.mjs';

async function index(req, res) {
    const cards = await models.UserCard.findAll({
        where: {userId: req.session.user.id},
    });

    res.render('client/card/index', {cards: cards});
}

function addPage(req, res) {
        res.render('client/card/add');
}

async function add(req, res) {
    const user = await models.User.findOne({where: {id: req.session.user.id}});
    // may throw an error, check later
    // validate the input

    let [month, year] = req.body.exp.split('/');

    try {
        await models.UserCard.create({
            number: req.body.cardNumber,
            cvc: req.body.cvc,
            expires: `${year}-${month}-1`,
            password: await hash(req.body.password),
            userId: user.id,
        });
    } catch (error) {
        console.log('Could not create the card');
    }

    res.redirect(303, req.baseUrl);
}

async function editPage(req, res) {
    const cardId = Number.parseInt(req.params.cardId);
    if (cardId == NaN) {
        console.log('Invalid card ID.');
        res.redirect(303, '/card/edit/');
        return;
    }

    const card = await models.UserCard.findOne({where:{id: cardId}});
    if (!card) {
        console.log('Card ID not found: ' + cardId);
        res.redirect(303, '/card/edit/');
        return;
    }

    // change the expire date format
    let [year, month, day] = card.expires.split('-');
    const expires = `${month}/${year}`;

    res.render('client/card/edit', {card: card, expires: expires});
}

async function edit(req, res) {
    const card = await models.UserCard.findOne({
        where: {
            id: req.body.cardId,
            userId: req.session.user.id,
        }
    });

    if (!card) {
        console.log('POST: no card found.');
        res.redirect(303, '/card/edit/');
        return;
    }

    card.number = req.body.cardNumber || card.number;
    card.cvc    = req.body.cvc || card.cvc;

    if (req.body.expires) {
        let [month, year] = req.body.expires.split('/');
        card.expires = `${year}-${month}-1`;
    }  

    const currentPassword = req.body.currentPassword;
    const newPassword     = req.body.newPassword;

    if (currentPassword && newPassword) {
        let r = await compareHash(currentPassword, card.password);
        if (!r) {
            res.cookie('__alert', 'As palavras-passe não combinam.');
            res.redirect(303, req.originalUrl);
            return;
        } else {
            card.password = await hash(newPassword);
            console.log('password modified!');
        }
    }

    await card.save();// update the values
    res.redirect(303, req.baseUrl);
}

async function deleteCard(req, res) {
    const cardId = Number.parseInt(req.params.cardId);
    if (cardId == NaN) {
        console.log('DELETE: invalid card id');
        res.redirect(303, '/card/delete/');
        return;
    }

    const card = await models.UserCard.findOne({
        where: {
            id: cardId,
            userId: req.session.user.id,
        }
    });

    if (!card) {
        console.log('DELETE: could find a card with ID: ' + cardId);
        res.redirect(303, '/card/delete/');
        return;
    }

    card.destroy();
    res.redirect(303, req.baseUrl);
}

export default {
    index, 
    addPage,
    add,
    editPage,
    edit,
    deleteCard,
}