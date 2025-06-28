'use strinct';
import fs from 'fs/promises';
import path from 'path';
import multiparty from 'multiparty';

import { MEDIA_PATH } from '../lib/settings.mjs';
import models from '../models.mjs';
import { searchFormHandler, attachFiles, setMessage } from '../lib/utils.mjs';

async function createProjectFolder() {
    // create the project folder to store
    // the public files
    const basename = 'project_';
    let counter = 0;
    while (true) {
        let foldername = basename + counter;
        let fullPath = path.join(MEDIA_PATH, foldername);

        try {
            await fs.access(fullPath, fs.constants.F_OK);
            // file exists so let create another name
            counter++;
            continue;
        } catch (err) {
            await fs.mkdir(fullPath, { recursive: true });
            return foldername;
        }
    }
}

async function deleteIfExists(filePath) {
    const folder = path.dirname(filePath);
    const filename = path.basename(filePath);

    const files = await fs.readdir(folder);
    for (let file of files) {
        if (!file.startsWith(filename))
            continue;

        const fullPath = path.join(folder, file);
        console.log('Removing: ' + fullPath);
        fs.rm(fullPath, {force: true});
        return;
    }
}

function getMinDateText() {
    // calculate the min date of dateLimit.
    // min date is 2 days.
    const twoDaysTime = 1000 * 60 * 60 * 24 * 2;
    const minLimitTime = new Date(Date.now() + twoDaysTime);

    const day = new String(minLimitTime.getDate()).padStart(2, "0");
    const month = new String(minLimitTime.getMonth() + 1).padStart(2, "0");
    const year = minLimitTime.getFullYear();
    return `${year}-${month}-${day}`;
}

function index(req, res) {
    res.render('client/project/index');
}

async function listProjects(req, res) {
    const search = await searchFormHandler(req, req.session, true);

    const context = {
        searchForm: search.searchForm,
        projects: search.result,
        goto: '/details/',
    }

    res.render('client/project/list', context);
}

async function addPage(req, res) {
    const user = await models.User.findOne({
        where: {
            id: req.session.user.id,
        },
        include: models.BankAccount,
    });

    if (user.bankAccounts.length == 0) {
        setMessage(res, 'É necessário ter uma conta bancária para continuar.');
        res.redirect(req.baseUrl);
        return;
    }

    const context = {
        banks: user.bankAccounts,
        minDate: getMinDateText(),
    }

    res.render('client/project/add', context);
}

function add(req, res) {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
        console.log('fields: ', fields);
        // console.log('files: ', files);
        const folder = await createProjectFolder();

        console.log('Saving the images...');
        console.log('project folder: ' + folder);

        let counter = -1;
        for (let key in files) {
            let file = files[key];
            counter++;

            if (file[0].size <= 0) continue;

            let extname = path.extname(file[0].originalFilename);
            let oldPath = file[0].path;
            let newPath = path.join(MEDIA_PATH, folder, 'pic' + counter + extname);

            console.log(`Moving ${oldPath} -> ${newPath}`);
            fs.rename(oldPath, newPath).then(
                undefined,
                (err) => {
                    console.log(err);
                    throw err;
                }
            );
        }

        // set the state of the project
        // change to pending later
        const state = await models.ProjectState.findOne({
            where: { name: 'pending' }
        });

        console.log(`state id: ${state.id}, state name: ${state.name}.`);

        // save the info into into the db
        const projectInfo = models.Project.build();
        projectInfo.mediaFolder = folder;
        projectInfo.userId = req.session.user.id;
        projectInfo.projectStateId = state.id;

        projectInfo.name = fields['project-name'][0];
        projectInfo.dateLimit = fields['date-limit'][0];
        projectInfo.bankAccountId = fields['account-id'][0];
        projectInfo.description = fields['description'][0];
        projectInfo.requiredFund = fields['required-fund'][0];
        projectInfo.created = new Date();

        await projectInfo.save();
        setMessage(res, 'Projecto Criado com sucesso!');

        res.redirect(303, '/myprojects/');
    });
}

async function editListPage(req, res) {
    const search = await searchFormHandler(req, req.session, true);

    const params = {
        searchForm: search.searchForm,
        projects: search.result,
        goto: '/myprojects/edit/',
    };

    res.render('client/project/list', params);
}

async function editPage(req, res) {
    const projectId = Number.parseInt(req.params.projectId);

    if (projectId === NaN) {
        console.log('Invalid project id, returning to main menu');
        res.redirect(303, '/myprojects/edit');
        return;
    }

    const project = await models.Project.findOne({
        where: {
            id: projectId,
            userId: req.session.user.id,
        },

        include: [
            {
                model: models.User,
                include: models.BankAccount,
            },
        ],
    });

    if (!project) {
        console.log(`Project ${projectId} found. Redirecting to /myprojects/edit...`);
        res.redirect(303, '/myprojects/edit');
        return;
    }

    await attachFiles(project);
    const context = {
        project: project,
        minDate: getMinDateText(),
    }

    res.render('client/project/edit', context);
}

function edit(req, res) {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
        // console.log('fields: ', fields);
        // console.log('files: ', files);
        // const folder = await createProjectFolder();

        const projectInfo = await models.Project.findOne({
            where: {
                id: fields['project-id'],
            }
        });

        // console.log('Saving the images...');
        const folder = projectInfo.mediaFolder;

        let counter = -1;
        for (let key in files) {
            let file = files[key];
            counter++;

            if (file[0].size <= 0) continue;

            let extname = path.extname(file[0].originalFilename);
            let oldPath = file[0].path;
            let newPath = path.join(MEDIA_PATH, folder, 'pic' + counter + extname);

            // replacing a pic, remove the old pic
            await deleteIfExists(path.join(MEDIA_PATH, folder, 'pic' + counter));

            console.log(`Moving ${oldPath} -> ${newPath}`);

            fs.rename(oldPath, newPath).then(
                undefined,
                (err) => {
                    console.log(err);
                    throw err;
                }
            );
        }

        // update the data
        projectInfo.name = fields['project-name'][0];
        projectInfo.dateLimit = fields['date-limit'][0];
        projectInfo.bankAccountId = fields['account-id'][0];
        projectInfo.description = fields['description'][0];
        projectInfo.requiredFund = fields['required-fund'][0];

        await projectInfo.save();
        setMessage(res, 'Alterações salvas com sucesso!');
        res.redirect(303, req.baseUrl);
    });
}

async function deletePage(req, res) {
    const search = await searchFormHandler(req, req.session, true);

    const params = {
        searchForm: search.searchForm,
        projects: search.result,
    };
    res.render('client/project/delete', params);
}

async function deleteProject(req, res) {
    const projectId = Number.parseInt(req.params.projectId);

    if (projectId == NaN) {
        console.log(`DELETE: invalid project id: ${req.params.projectId}`);
        console.log('Redirecting to /myprojects');
        res.redirect(303, '/myprojects/');
        return;
    }

    models.Project.findOne({
        where: {
            id: projectId,
            userId: req.session.user.id,
        }
    }).then(async (result) => {
        if (!result) {
            console.log(`DELETE: project with id ${projectId} and user id $${req.session.user.id} not found`);
            console.log('Redirecting to /myprojects/');
            res.redirect(303, '/myprojects/');
            return;
        }

        // first delete the media path
        fs.rm(result.MEDIA_PATH, { recursive: true, force: true }).then(
            (value) => console.log('deleted: ' + result.MEDIA_PATH)
        );

        await result.destroy();
        setMessage(res, 'O projecto foi removido!');

        res.redirect(303, req.baseUrl);
    })
}

async function history(req, res) {
    const history = await models.History.findAll({
        include: [
            { model: models.Project },
            { model: models.UserCard },
            { 
                model: models.User,
                where: { id: req.session.user.id },
            },
        ],
    });

    res.render('client/history', { history: history });
}

export default {
    index,
    listProjects,
    addPage,
    add,
    editListPage,
    editPage,
    edit,
    deletePage,
    deleteProject,
    history,
}