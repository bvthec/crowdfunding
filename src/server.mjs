'use strict';
import 'dotenv/config';
import { initDatabase } from './models.mjs';
import app from './app.mjs';

initApp();
async function initApp() {
    // in production (if you reach that stage)
    // maybe you should let the database init first so the you start the
    // server ('await initDatabase()') 
    await initDatabase();

    const HOST = process.env.SERVER_HOST;
    const PORT = process.env.SERVER_PORT;

    app.listen(PORT, HOST, () => {
        console.log(`Running server at http://${HOST}:${PORT}/`);
    });
}