'use strict';
import express from 'express';
import handlebars from 'express-handlebars';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

// routers
import adminRouter from './routes/admin.mjs';
import clientRouter from './routes/client.mjs';
import projectRouter from './routes/projects.mjs';
import authRouter from './routes/auth.mjs';

import { helpers } from './lib/hbs-utils.mjs';
import { PUBLIC_PATH } from './lib/settings.mjs';
import { requireSessionMiddleware, sessionMiddleware } from './lib/session.mjs';
import { getMessage } from './lib/utils.mjs';

// page configurations
const app = express();

// view engine configs
app.engine('.hbs', handlebars.engine(
    {
        defaultLayout: 'main',
        extname: '.hbs',
        // partialsDir: './views/partials/',
        helpers: helpers
    }
));

app.set('view engine', '.hbs');
app.set('views', './views');

// external middleware configurations
app.use(express.static(PUBLIC_PATH));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(sessionMiddleware);

// global message system
app.use((req, res, next) => {
    res.locals.alertMessage = getMessage(req, res);
    next();
})

// routers
app.use('/auth', authRouter);
app.use('/admin',
    requireSessionMiddleware('admin'),
    adminRouter,
);

app.use('/myprojects',
    requireSessionMiddleware('client'),
    projectRouter,
);

app.use('', clientRouter);

app.use((req, res) => {
    console.log('Recurso não encontrado: ' + req.url);
    res.status(404);
    res.render('error/404', {url: req.url});
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500);
    res.render('error/500');
});

export default app;