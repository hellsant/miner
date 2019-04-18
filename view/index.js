/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

// settings
app.set('port', 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
//middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))
//routes

app.use(require('./routers'))

//listenig server
app.listen(app.get('port'), () => {
    console.log('server init', app.get('port'))
});
