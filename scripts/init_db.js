'use strict';
import models from '../src/models/models.mjs';
import { hash }  from '../src/lib/security';

const userTypes = ['admin', 'client'];
const projectStates = ['pending', 'approved', 'rejected', 'funded'];

const adminInfo = {
    bi: '123456789BA091',
    name: 'Administrador',
    address: 'Huambo',
    birthDate: '2000-01-30',
    email: 'admin@admin.com',
    password: '1234',
};

const USERLIST = [
    {
        bi: '123456789BA046',
        name: 'Yuri Cordeiro',
        address: 'Huambo',
        birthDate: '2000-01-30',
        email: 'yc@gmail.com',
        password: '1234',
    },
    {
        bi: '987654321BA042',
        name: 'Kakashi Hatake',
        address: 'Konoha',
        birthDate: '2000-01-30',
        email: 'kakashi@gmail.com',
        password: '1234',
    },
    {
        bi: '121313463BA046',
        name: 'Itachi Uchiha',
        address: 'Konoha',
        birthDate: '1999-01-30',
        email: 'itachi@gmail.com',
        password: '1234',
    },
];

async function addUserType() {
    console.log('adding user types...');
    let result = await models.UserType.findAll();
        
    if (result.length != 0) {
        console.log('there is already user types');
        return;
    }

    for (let type of userTypes)
        await models.UserType.create({ name: type });
}

async function addAdmin() {
    console.log('Adding admin...');
    const adminType = await models.UserType.findOne({
        where: {name: 'admin'}
    });
    
    let result = await models.User.findOne({
        where: {userTypeId: adminType.id}
    });
    
    if (result) {
        log('there is already an admin...');
        return;
    }
    
    console.log('creating an admin...');
    const user = models.User.build();
    user.bi   = adminInfo.bi;
    user.name = adminInfo.name;
    user.address = adminInfo.address;
    user.birthDate = adminInfo.birthDate;
    user.email = adminInfo.email;
    user.password = await hash(adminInfo.password);
    user.userTypeId = adminType.id;
    user.save();
}

function addProjectStates() {
    console.log('Adding project states...');

    models.ProjectState.findAll().then(
        (result) => {
            if (result.length != 0) {
                console.log('There is already defined states...');
                return;
            }

            for (let state of projectStates)
                models.ProjectState.create({name: state});
        }
    )
}

function genIBAN() {
    return Date.now() * 2;
}

async function addUsers() {
    // create the user types
    const clientType = await models.UserType.findOne({
        where: {name: 'client'}
    });
    
    if (!clientType) {
        console.log('No client type found');
        process.exit(1);
    }

    const users = await models.User.findAll({where: {userTypeId: clientType.id}});
    if (users.length != 0) {
        console.log('There is already user inserted');
        return;
    } 

    for (let data of USERLIST) {
        const user = models.User.build(data);
        user.userTypeId = clientType.id;
        user.password   = await hash(user.password);
        user.save().then(
            (user) => {
                models.BankAccount.create({
                    bankName: 'Banco de Konoha',
                    iban: genIBAN(),
                    userId: user.id
                });
            }
        );
    }
}

async function main() {
    await models.initDatabase();
    
    addProjectStates();
    addUserType().then((r) => {
        addAdmin();
        // addUsers();
    });
}

main();