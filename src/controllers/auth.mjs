'use strict';
import { Op } from 'sequelize';

import models from '../models.mjs';
import session from '../lib/session.mjs';
import { hash, compareHash } from '../lib/security.mjs';
import { SESSION_DURATION } from '../lib/settings.mjs';
import { setMessage } from '../lib/utils.mjs';

function loginForm(req, res) {
    const message = req.cookies.message;
    const goto    = req.cookies.goto;
    res.clearCookie('message');
    res.clearCookie('goto');

    const context = {
        message: message,
        goto: goto,
    }

    res.render('auth/login', context);
}

async function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await models.User.findOne({
        where: {email: email},
        include: models.UserType,
    });

    if (!user) {
        setMessage(res, 'Email ou palavra-passe está incorrecto');
        res.redirect(303, req.baseUrl);
        return;
    }
    
    if (!(await compareHash(password, user.password))) {
        setMessage(res, 'Email ou palavra-passe invalida!');
        res.redirect(303, req.baseUrl);
        return;
    }

    const userInfo = {
        id: user.id,
        typeId: user.userType.id,
        exp: Math.floor((Date.now() + SESSION_DURATION) / 1000),
    }
    
    const token = session.makeToken(userInfo);
    session.saveSessionToken(res, token);

    if (req.body.goto) {
        res.redirect(303, req.body.goto);
        return;
    }

    res.redirect(303, '/');
}

async function sessionStatus(req, res) {
    if (!req.session) {
        setMessage(res, 'Precisa de estar autenticado para continuar.');
        res.render('/auth');
        return;
    }

    const user = await models.User.findOne({
        where: {
            id: req.session.user.id,
        },
        include: models.UserType,
    });

    res.render('auth/status', {message: 'User Info', user: user});
}

function addUserPage(req, res) {
    res.render('auth/user-form');
}

async function addUser(req, res) {
    let result = await models.User.findAll({
        where: {
            [Op.or]: [
                {bi: req.body.bi},
                {email: req.body.email},
            ]
        }
    });

    if (result.length > 0) {
        setMessage(res, 'Já existe um usuário com BI ou Email semelhante.');
        res.redirect(303, req.baseUrl + '/create');
        return;
    }
    
    if (req.body['password'] != req.body['password2']) {
        setMessage(res, 'As palavras-passe não combinam');
        res.redirect(303, req.baseUrl + '/create');
        return;
    }

    const userType = await models.UserType.findOne({
        where: {name: 'client'},
    });

    const newUser = models.User.build();
    newUser.userTypeId = userType.id;
    newUser.name = req.body.name;
    newUser.bi = req.body.bi;
    newUser.email = req.body.email;
    newUser.birthDate = req.body.birth;
    newUser.address = req.body.address;
    newUser.password = await hash(req.body['password']);
    await newUser.save();

    res.redirect(303, '/auth');
}

async function editUserInfoPage(req, res) {
    const user = await models.User.findOne({
        where: {id: req.session.user.id},
    });

    const context = {user: user.dataValues};
    if (req.query.goto)
        context.goto = req.query.goto;

    res.render('auth/edit', context);
}

async function editUserInfo(req, res) {
    const user = await models.User.findOne({
        where: {id: req.session.user.id},
    });

    if (req.body.name)
        user.name = req.body.name;
    if (req.body.bi)
        user.bi = req.body.bi;
    if (req.body.email)
        user.email = req.body.email;
    if (req.body.birth)
        user.birthDate = req.body.birth;
    if (req.body.address)
        user.address = req.body.address;

    if (req.body['password'] && req.body['password2']) {
        let passwordMatch = await compareHash(req.body['password'], user.password);
        if (!passwordMatch) {
            setMessage(res, 'Palavra-passe actual está incorreta.');
            res.redirect(303, req.originalUrl);
            return;
        }

        user.password = await hash(req.body['password2']);
        console.log('EDIT: Palavra-passe actualizada');
    }

    await user.save();

    if (req.body.goto) {
        res.redirect(303, req.body.goto);
        return;
    }
    
    res.redirect(303, '/');
}

async function logout(req, res) {
    session.clearSessionToken(res);
    res.redirect('/auth');
}

export default {
    loginForm,
    login,
    logout,
    sessionStatus,
    addUserPage,
    addUser,
    editUserInfoPage,
    editUserInfo,
}