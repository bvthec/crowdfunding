'use strict';
import models from '../models.mjs';

async function index(req, res) {
    const banks = await models.BankAccount.findAll({
        where: {userId: req.session.user.id},
    });

    res.render('client/bank', {banks: banks});
}

function addPage(req, res) {
    res.render('client/bank/add');
}

async function add(req, res) {
    const user = await models.User.findOne({where: {id: req.session.user.id}});
    const iban = req.body.iban.replaceAll('.', '').replaceAll(' ', '');
    
    try {
        await models.BankAccount.create({
            bankName: req.body.bankName,
            iban: iban,
            userId: user.id,
        });
    } catch (error) {
        console.log('Could not create the bank account');
    }

    res.redirect(303, req.baseUrl);
}

async function editPage(req, res) {
    const bankId = Number.parseInt(req.params.bankId);

    if (bankId == NaN) {
        console.log('Invalid card ID.');
        res.redirect(303, req.baseUrl);
        return;
    }

    const bank = await models.BankAccount.findOne({
        where:{ id: bankId },
        include: {
            model: models.User,
            where: {id: req.session.user.id},
        }
    });
    
    if (!bank) {
        console.log('Bank account not found: ' + bankId);
        res.redirect(303, req.baseUrl);
        return;
    }

    res.render('client/bank/edit', {bank: bank.dataValues});
}

async function edit(req, res) {
    const bank = await models.BankAccount.findOne({
        where: { id: req.body.bankId},
        include: {
            model: models.User,
            where: {id: req.session.user.id},
        }
    });

    if (!bank) {
        console.log('POST: no bank account found.');
        res.redirect(303, req.baseUrl);
        return;
    }

    if (req.body.iban) {
        bank.iban = req.body.iban.replaceAll('.', '').replaceAll(' ', '');
    }

    if (req.body.bankName)
        bank.bankName = req.body.bankName;

    await bank.save();// update the values
    res.redirect(303, req.baseUrl);
}

async function deleteBank(req, res) {
    const bankId = Number.parseInt(req.params.bankAccountId);

    if (bankId == NaN) {
        console.log('DELETE: invalid card id');
        res.redirect(303, req.baseUrl);
        return;
    }

    const bank = await models.BankAccount.findOne({
        where: {
            id: bankId,
            userId: req.session.user.id,
        }
    });

    if (!bank) {
        console.log('DELETE: could find a card with ID: ' + bankId);
        res.redirect(303, req.baseUrl);
        return;
    }

    try {
        await bank.destroy();
    } catch (error) {
        console.log('Could not delete the account, because is in use (probably)');
    }
    
    res.redirect(303, req.baseUrl);
}

export default {
    index,
    addPage,
    add,
    editPage,
    edit,
    deleteBank,
}