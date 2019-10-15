/* eslint-disable global-require */
/* eslint-disable no-undef */
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const routes = require('../routes/index');
module.exports = app => {
    //settings
    app.set('port', process.env.PORT || 4000);
    app.set('views', path.join(__dirname, 'views'));
    app.engine('.hbs', exphbs({
        defaultLayout: 'main',
        partialsDir: path.join(app.get('views'), 'partials'),
        layoutsDir: path.join(app.get('views'), 'layouts'),
        extname: '.hbs',
        helpers: require('./helpers')
    }));
    app.set('view engine', '.hbs');

    //middelwares
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));
    // routes
    routes(app);
    //static files
    app.use(express.static('/public', path.join(__dirname, '../public')));
    //errorhandlers

    return app;
};