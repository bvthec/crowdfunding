'use strict';
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: process.env.DATABASE_ENGINE,
        logging: false,
    }
);

export async function init() {
    console.log('Connecting and syncing with the database...');
    await sequelize.authenticate();
    await sequelize.sync({alter: true});
    console.log('Connected and synced.');
}

export default {
    init,
    sequelize,
}