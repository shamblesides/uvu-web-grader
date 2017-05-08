const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const favicon = require('serve-favicon');

const WEB = __dirname.replace('server','web');

let app = express();

// Insert middleware
app.use(logger('dev'));
app.use(compression());
app.use(favicon(WEB + '/img/favicon.ico'));

app.use('/api/v2', require('./api.v2'));
app.use(express.static(WEB));
app.get('*', (req, res) => res.status(404).sendFile(WEB + '/404.html'));

// Start listening
var server = app.listen(3000, () => console.log('Ready.'));
