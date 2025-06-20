'use strict';
import models from '../models/models.mjs';
import { searchFormHandler2, attachFiles } from '../lib/utils.mjs';

// projects visualizations & Funding
async function mainMenu(req, res) {
    const approvedProjects = await models.Project.findAll({
        include: {
            model: models.ProjectState,
            where: {name: 'approved'},
        },
        order: [
                ['created', 'DESC'],
        ],

        limit: 3,
    });

    const fundedProjects = await models.Project.findAll({
        include: {
            model: models.ProjectState,
            where: { name: 'funded'},
            order: [
                ['created', 'DESC'],
            ]
        },

        limit: 3,
    });

    await attachFiles(approvedProjects);
    await attachFiles(fundedProjects);
    
    res.render('client/index', {
        approvedProjects: approvedProjects,
        fundedProjects: fundedProjects,
    });
}

async function projectListPage(req, res) {
    const search = await searchFormHandler2(req);

    res.render('client/projects', {
        searchForm: search.searchForm,
        projects: search.result,
    });
}

async function projectDetails(req, res, next) {
    const projectId = Number.parseInt(req.params.projectId);
    
    if (projectId === NaN) {
        console.log(`Invalid project id ${projectId}. Redirecting to '/'`);
        res.redirect(303, '/');
        return;
    }


    const project = await models.Project.findOne({
        where: {id: projectId},
        include: [
            {
                model: models.User
            },
            {
                model: models.ProjectState,
            }
        ],
    });

    if (!project) {
        console.log(`Project with id ${projectId} not found.`);
        res.status(404);
        res.render('error/404');
        return;
    }

    const belongsToUser = (!req.session) ? false : project.user.id == req.session.user.id;

    if (project.projectState.name != 'approved' && project.projectState.name != 'funded' &&
        !belongsToUser)
    {
        console.log('User can not access the project!');
        res.status(404);
        res.render('error/404');
        return;
    }

    const context = {
        project: project.dataValues,
        mediaFiles: await attachFiles(project),
        percentage: (project.currentFund / project.requiredFund * 100).toFixed(1),
        belongsToUser: belongsToUser,
    }

    res.render('client/details', context);
}

async function fundProjectForm(req, res) {
    const projectId = Number.parseInt(req.params.projectId);
    if (projectId === NaN) {
        console.log(`Invalid project id ${projectId}. Redirecting to '/'`);
        res.redirect(303, '/');
        return;
    }

    const user = await models.User.findOne({
        where: {id: req.session.user.id},
        include: models.UserCard,
    });

    if (user.userCards.length == 0) {
        res.cookie('__alert', 'É necessário ter cartão de crédito para continuar.');
        res.redirect(req.baseUrl + '/details/' + projectId);
        return;
    }

    const project = await models.Project.findOne({
        where: {id: projectId},
        include: models.User,
    });

    
    if (!project) {
        console.log(`project with id ${projectId} not found`);
        res.status(404);
        res.render('error/404');
        return;
    }
    
    // if (!user) {
    //     // invalid user session (weird!!!!!!!)
    //     res.clearCookie('session');
    //     res.redirect(303, '/fund-project/' + projectId);
    //     return;
    // }
    
    res.render('client/fundForm', {project: project, user: user});
}

async function fundProject(req, res) {
    const projectId = Number.parseInt(req.body.projectId);

    if (projectId == NaN) {
        console.log('FUND: Invalid project id: ' + req.body.projectId);
        res.redirect(303, '/');
        return;
    }
    const user = await models.User.findOne({
        where: {id: req.session.user.id},
    });

    const project = await models.Project.findOne({
        where: {id: projectId},
    });

    if (!project) {
        console.log('FUND: could not find project with id ' + projectId);
        res.redirect(303, '/');
        return;
    }

    // Maybe you should use credit card password)
    const amount = Number.parseFloat(req.body.fund) || 0.0
    project.currentFund += amount;

    if (project.currentFund >= project.requiredFund) {
        const fundedState = await models.ProjectState.findOne({where: {name: 'funded'}});
        project.projectStateId = fundedState.id;
    }

    await project.save();

    // add to the history
    models.History.create({
        fundAmount: amount,
        userId: user.id,
        projectId: project.id,
        userCardId: req.body.cardId,
    });
    
    res.redirect(303, '/details/' + project.id);
}

export default {
    mainMenu,
    projectListPage,
    projectDetails,
    fundProjectForm,
    fundProject,
}