/* eslint-disable global-require */
/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const exphbs = require('express-handlebars');
const path = require('path');
const PORT = process.env.PORT || 4000;

const app = express();

// settings
app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    partialsDir: path.join(app.get('views'), 'partials'),
    layoutsDir: path.join(app.get('views'), 'layouts'),
    extname: '.hbs',
    helpers: require('./server/helpers')
}));
app.set('view engine', '.hbs');

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))

//routes
app.use(require('./routes'))

//errorhandlers
if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler({ log: errorNotification }))
}

//listenig server
app.listen(app.get('port'), () => {
    console.log('server init', app.get('port'))
});
