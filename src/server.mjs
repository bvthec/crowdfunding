'use strict';
import 'dotenv/config';
import db from './db.mjs';
import app from './app.mjs';

(async function() {
    /*await*/ db.init();

    const HOST = process.env.HOST;
    const PORT = process.env.PORT;
    
    app.listen(PORT, HOST, () => {
        console.log(`Running server at http://${HOST}:${PORT}/`);
    });
})();