"use strict";
import fs from 'fs/promises';
import path from 'path';
import { Op } from 'sequelize';

import models from '../models.mjs';
import { MEDIA_PATH } from './settings.mjs';

export async function attachFiles(project) {
    // add an object with the media path to
    // the sequelize Project objects
    if (!project) return null;
    
    if (Array.isArray(project)) {
        const results = [];
        for (let p of project)
            results.push(await attachFiles(p));

        return results;
    }
    
    if (!(project instanceof models.Project))
        throw new Error('Invalalid value, expects models.Project object');

    const mediaFiles = {cover: null, pics: []};
    const mediaFolderName = path.basename(MEDIA_PATH);
    const files = await fs.readdir(path.join(MEDIA_PATH, project.mediaFolder));

    for (let file of files) {
        let PUBLIC_PATH = `/${mediaFolderName}/${project.mediaFolder}/${file}`;
        if (file.startsWith('pic0'))
            mediaFiles.cover = PUBLIC_PATH;
        else
            mediaFiles.pics.push(PUBLIC_PATH);
    }

    project.mediaFiles = mediaFiles;
    return mediaFiles;
}

export function formatCurrency(value) {
    return Intl.NumberFormat('ao', {style: 'currency', currency: 'AOA'})
               .format(value);
}

export async function searchFormHandler(req, sessionInfo=null, isClient=false) {
    if (!req)
        throw Error(`invalid value in 'req' variable: '${req}'`);

    if (!sessionInfo)
        throw Error('searchFormHandler require session to be set!');

    const adminType = await models.UserType.findOne({where: {name: 'admin'}});

    
    let stateId = req.query.stateId || '';
    let projectName = req.query.projectName || '';
    
    stateId = stateId.trim();
    projectName = projectName.trim();
    
    const where = {};
    if (stateId && projectName) {
        where.name = {[Op.like]: `%${projectName}%`};
        where.projectStateId = stateId;
    } else if (projectName) {
        where.name = {[Op.like]: `%${projectName}%`};
    } else if (stateId) {
        where.projectStateId = stateId;
    }

    let result = null;
    if (sessionInfo.user.type == adminType.id) {
        result = await models.Project.findAll({where: where});
    } else {
        result = await models.Project.findAll({
            where: where,
            include: {
                model: models.User,
                where: {id: sessionInfo.user.id},
            }
        });
    }

    await attachFiles(result);
    return {
        searchForm: {
            states: await models.ProjectState.findAll(),
            selectedStateId: stateId,
            projectName: projectName,
            goto: req.originalUrl,
        },
        
        result: result,
    }
}

export async function searchFormHandler2(req, ofUser=false) {
    // Nao seja preguiçoso, junta com searchFormHandler
    if (!req)
        throw Error(`invalid value in 'req' variable: '${req}'`);

    let projectName = req.query.projectName || '';
    projectName = projectName.trim();
    
    let result = null;
    if (projectName) {
        result = await models.Project.findAll({
            where: {
                name: {[Op.like]: `%${projectName}%`},
            },
            include: {
                model: models.ProjectState,
                where: {[Op.or]: [{name: 'funded'}, {name: 'approved'}]}
            }
        }); 
    } else {
        result = await models.Project.findAll({
            include: {
                model: models.ProjectState,
                where: {[Op.or]: [{name: 'funded'}, {name: 'approved'}]}
            }
        });
    }

    await attachFiles(result);
    return {
        searchForm: {
            projectName: projectName,
            goto: req.originalUrl,
        },
        
        result: result,
    }
}

export function setMessage(res, message) {
    res.cookie('message', message);
}

export function getMessage(req, res) {
    const message = req.cookies.message || null;
    if (message) res.clearCookie('message');
    return message;
} 