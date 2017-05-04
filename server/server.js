console.log('Loading Server');

// HTTP STUFF
const WEB = __dirname.replace('server','web');

// Main requires
var express = require('express');

// load express middleware modules
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var rest = require('./assignmentsRest');   // Rest api is here


// Makes an express app
var app = express();

// Insert middleware
app.use(logger('dev'));
app.use(compression());
app.use('/api/v1', rest);    // Rest api is here

app.use(favicon(WEB + '/img/favicon.ico'));

// Traditional webserver stuff for serving static files
app.use(express.static(WEB));

// 404 statements must go last
app.get('*', function(req, res) {
    res.status(404).sendFile(WEB + '/404.html');
});

// Debug Info
console.log('Server Loaded');
console.log(WEB);

// Start listening
var server = app.listen(3000);


// ---------------------------- Shutdown Functions Used -----------------------------------

function gracefullShutdown() {
    console.log('\nStarting Shutdown');
    server.close(function() {
        console.log('\nShutdown Complete');
    });
}

process.on('SIGTERM', function() { // Terminate
    gracefullShutdown();
});

process.on('SIGINT', function() { // Ctrl+C (interrupt)
    gracefullShutdown();
});
