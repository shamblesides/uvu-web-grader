const pythonShell = require('python-shell');
const LintStream = require('jslint').LintStream;

const CPP_LINT_PATH = __dirname.replace('server', 'vendor') + '/cpplint.py';

let linters = {};
['js','css'].forEach(ext=>linters[ext]=jsCheck);
['cc','cpp','cu','cuh','h'].forEach(ext=>linters[ext]=cppCheck);

function filetype(filename) {
    return filename.split('.').pop();
}

module.exports = checkFileForErrors;
function checkFileForErrors(file, cb) {
    let ext = filetype(file.name);
    let linter = linters[ext];
    if (!linter) return cb('Cannot lint type: ' + ext);
    linter(file, cb);
}

function jsCheck(file, cb) {
    let jsLint = new LintStream({"edition":"latest", "length":100});

    jsLint.write({file: file.name, body: file.body});
    jsLint.on('data', function (chunk, encoding) {
        cb(null, chunk.linted.errors);
    });
}

//.cc, .cpp, .cu, .cuh and .h
function cppCheck(id, filename) {
    let pyOptions = { args: ['--verbose=2', `uploads/${id}/${filename}`] };
    pythonShell.run(CPP_LINT_PATH, pyOptions, (err, results) => {
        // Not sure why this script keep erroring out but
        // what we need is stored in the err param
        var fileWrn = cpplistParse(err.stack.split('\n'));

        storeErrorFile(id, filename, fileExt, fileWrn);
    });
}
