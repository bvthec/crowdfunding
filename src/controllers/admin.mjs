'use strict';
import { Op } from 'sequelize';

import models from '../models.mjs';
import { attachFiles, searchFormHandler } from '../lib/utils.mjs';


function mainPanel(req, res) {
    res.render('admin/panel');
}

async function approvePage (req, res) {
    // short view to display projects that need to be approved
    const state = await models.ProjectState.findOne({
        where: {name: 'pending'}
    });

    const projects = await models.Project.findAll({
        where: {projectStateId: state.id},
    });

    await attachFiles(projects);
    res.render('admin/approve-menu', {projects: projects});
}

async function projectListPage(req, res) {
    const search = await searchFormHandler(req, req.session);

    await attachFiles(search.result);
    const context = {
        searchForm: search.searchForm,
        projects: search.result,
    }

    res.render('admin/projects-list', context);
}

async function project(req, res) {
    // this form display a page that the administrator can quickly
    // approve or reject the project
    const projectId = Number.parseInt(req.params.projectId);
    if (projectId == NaN) {
        console.log('Invalid project id: ' + req.params.projectId);
        console.log('Redirecting to /admin/')
        res.redirect(303, req.baseUrl);
        return;
    }

    const states = await models.ProjectState.findAll({
        where: {name: {[Op.ne]: 'funded'}}
    });

    const project = await models.Project.findOne({
        where: {id: projectId},
        include: models.User,
    });

    if (!project) {
        res.status(404);
        res.render('error/404');
        return;
    }

    const projectState = await project.getProjectState();

    const context = {
        project: project.dataValues,
        mediaFiles: await attachFiles(project),
        projectState: projectState.id,
        states: states,
        percentage: (project.currentFund / project.requiredFund * 100).toFixed(1),
        projectIsFunded: projectState.name == 'funded',
    }

    res.render('admin/project-details', context);
}

async function changeProjectState(req, res) {
    const projectId = Number.parseInt(req.body.projectId);
    const stateId = Number.parseInt(req.body.state);

    if (projectId == NaN || stateId == NaN) {
        console.log('Invalid project id or state id');
        res.redirect(303, req.baseUrl);
        return;
    }

    const newState = await models.ProjectState.findOne({
        where: {id: stateId}
    });

    const project = await models.Project.findOne({
        where: {id: projectId}
    });

    if (!project || !newState) {
        console.log(`Project or State object not found. Redirecting...`);
        res.redirect(303, req.baseUrl);
        return;
    }

    if (project.projectStateId != newState.id) {
        project.projectStateId = newState.id;
        await project.save();
    }

    res.redirect(303, `${req.baseUrl}/project/details/${project.id}`);
}

export default {
    mainPanel,
    approvePage,
    projectListPage,
    project,
    changeProjectState,
}