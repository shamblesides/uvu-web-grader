
console.log('Loading Server');

const WEB = __dirname;
const FILE_NAME = 'students/students.json';

//load main modules
var express = require('express');
var logger = require('morgan');
var compression = require('compression');
var app = express();
var fs = require('fs');
var students = JSON.parse(fs.readFileSync(FILE_NAME, 'utf8'));

//insert middleware
app.use(logger('dev'));
app.use(compression());
app.use(express.static(WEB));


students.forEach(function(student, i) {
    student.id = ('0000' + (i + 1)).slice(-4);
});

//console.log(students);

fs.writeFileSync(FILE_NAME, JSON.stringify(students, null, 4), 'utf8');
