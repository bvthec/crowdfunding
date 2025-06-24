'use strict';
import jwt from 'jsonwebtoken';
import { UserType } from '../models.mjs';
import { setMessage } from './utils.mjs';

const jwtOptions = {
    algorithm: process.env.JWT_OPTION_ALG,
};

const SESSION_KEYWORD = 'session';
const SECRET_KEY = process.env.SECRET_KEY;


export function makeToken(object) {
    let token = jwt.sign(object, SECRET_KEY, jwtOptions);
    return token;
}

export function decodeToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY, jwtOptions);
    } catch (err) {
        // token is probably expired
        console.log(err);
        return null;
    }
}

export function saveSessionToken(res, token) {
    res.cookie(SESSION_KEYWORD, token);
}

export function clearSessionToken(res) {
    res.clearCookie(SESSION_KEYWORD);
}

// Middlewares
export function sessionMiddleware(req, res, next) {
    req.session = null; 
    if (req.cookies.session) {
        const session = {
            token: req.cookies.session,
            // TODO: change the way user info is passed
            user: decodeToken(req.cookies.session),
        }

        req.session = session;
        res.locals.session = session; // make the session information avaible in views
        delete req.cookies.session;
    }

    next();
}

export function requireSessionMiddleware(type) {
    switch (type) {
        case 'client':
            return requireSession;
        case 'admin':
            return requireAdminSession;
        default:
            throw Error('Invalid session middleware type: ' + type);
    }
}

function requireSession(req, res, next=null) {   
    if (!req.session) {
        setMessage(res, 'Para continuar é necessário ter a sessão iniciada.');
        res.cookie('goto', req.originalUrl);
        res.redirect('/auth');
        return false;
    }

    if (next) next();
    return true;
}

async function requireAdminSession(req, res, next) {
    if (!requireSession(req, res))
        return;

    const adminType = await UserType.findOne({where: { name: 'admin' }});

    if (req.session.user.typeId != adminType.id) {
        setMessage(res, 'É necessário estar logado como administrador para continuar.')
        res.cookie('goto', req.originalUrl);
        res.redirect(303, '/auth');
        return;
    }

    next();
}

export default {
    makeToken,
    decodeToken,
    saveSessionToken,
    clearSessionToken,
    sessionMiddleware,
    requireSessionMiddleware,
}