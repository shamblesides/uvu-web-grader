//Rest Module 
//is called by http requests
//converts req info to be used by dao crud
//converts dao output into res info 

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var path = require('path');
var pythonShell = require('python-shell');
var LintStream = require('jslint').LintStream;

var database = require('./mongoDao');        // Mongo api is here
var router = express.Router();


// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));


// REST endpoints
// Create - File Upload
router.post('/upload/:id', function(req, res, next) {
    
    var form = new formidable.IncomingForm();
    var id = req.params.id;
    var filename = '';
    var fileExt = '';
    
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = `${__dirname}/uploads/`;
    
    
    form.parse(req, (err, fields, files) => {
        
        if (err) return res.status(500).json({ error: err });
    
        fs.readFile(`${__dirname}/assignments/${id}.json`, 'utf8', function(err, data) {
        
            if(err) {
                
                res.status(500).json({ error: err });
                return;
            }
            
            var fileArr = files.file.name.split('.');
            var ext = fileArr[fileArr.length-1];

            if(JSON.parse(data).fileTypes.indexOf(ext) == -1) {
                
                res.status(406).json({ 
                    uploaded: false,
                    id: id,
                    msg: "Incorrect File Type"
                });
                return;
            }
            
            res.status(202).json({ 
                uploaded: true,
                id: id
            });
        });
    });


    form.on('fileBegin', function (name, file) {

        var newDir = `${form.uploadDir}${id}/`;
        var fileArr = file.name.split('.');
        filename = fileArr[0];
        fileExt = fileArr[1];

        fs.mkdir(newDir, function (err) {
            
            if (err) { console.log(`failed to create directory: ${newDir}`); } 
        });
        
        file.path = path.join(newDir, file.name);
    });
    
    
    form.on('end', function() {

        checkFileForErrors(id, filename, fileExt);
    });
});


// Read - Get a list of files for a given project
router.get('/files/:id', function(req, res, next) {
    
    var id = req.params.id;
    var dir = `${__dirname}/uploads/${id}`;
    var filePackage = [];
    
    fs.readdir(dir, function(err, files) {
        
        if(err) {
        
            // check to see if the directory exists
            if (err.code === 'ENOENT') {
                
                res.status(200).json([]);
                return;
            }

            res.status(500);
            console.log(`Failed to send the list of files for the project with id(${id})`);
            return;
        }
        
        files.forEach(function(file) {
            
            var content = "";
            var hasIssues = false;
            var fileArr = file.split('.');
            var filename = fileArr[0];
            var fileExt = fileArr[fileArr.length-1];
            var fileData = {};
            
            try {
                fileData = JSON.parse(fs.readFileSync(`${__dirname}/content/${id}/${filename}_${fileExt}.json`, 'utf8'));
    
                if(fileData.issues.length > 0) {

                    hasIssues = true;
                    content = fileData;
                }
            }
            catch(err) {}
            
            filePackage.push({
                name: file,
                hasIssues: hasIssues,
                content: content
            });
        });

        res.status(200).json(filePackage);
    });
});


// Create
router.post('/assignment', function(req, res) {
    var assignment = req.body;
    var id = assignment.id;
    // var fpath = `${__dirname}/assignments/${id}.json`;
    // assignment = JSON.stringify(assignment, null, 3);
        
    // fs.exists(fpath, function(exists) {
    //     if (exists) {
    //         res.send("File already exists");
    //         console.log(`${fpath} already exists.`);
    //     }
    //     else {
    //         fs.writeFile(`${__dirname}/assignments/${id}.json`, assignment, 'utf8', function(err) {
    //           if (err) res.status(500);
              
    //           res.send("Success");
    //           console.log("Writing assignment");
    //         });
    //     }
    // });
    
    
    database.read(id, "assignments", function(err, result) {
        if (err) res.status(500);
        
        if (result == null) {
            database.create("assignments", assignment, function(err, result) {
                if (err) res.status(500);
                console.log("Assignment written to database.");
                res.send("Success");
            });
        }
        else {
            console.log("File already exists. id:", id);
            res.send("File already exists.");
        }
    });
    
});


// Read
router.get('/assignment/:id.json', function(req, res) {
    var id = req.params.id;
    // fs.readFile(`${__dirname}/assignments/${id}.json`, 'utf8', function(err, data) {
    //     if (err) res.status(500);
        
    //     var assignment = JSON.parse(data);
    //     assignment = JSON.stringify(assignment, null, 3);
    //     res.json(assignment);
    // });
    
    database.read(id, "assignments", function(err, result) {
        if (err) res.status(500);
        
        if (result == null) {
            res.status(500);
            console.log("Assignment not found in database. id:", id);
            res.json(result);
        }
        else {
            var assignment = result;
            delete assignment._id;
            assignment = JSON.stringify(assignment, null, 3);
            res.json(assignment);
        }
    });
    
});


// Update
router.put('/assignment/:id.json', function(req, res) {
    var id = req.params.id;
    var assignment = req.body;
    
    console.log(`Writing assignment with id: ${id}`);
    
    // fs.writeFile(`${__dirname}/assignments/${id}.json`, assignment, 'utf8', function(err) {
    //     if (err) throw err;
        
    //     res.json(assignment);
    //     console.log("Success");
    // });
    
    
    database.update("assignments", assignment , function(err, result) {
        if (err) res.status(500);
        
        res.json(result);
    });
    
});


// Delete
router.delete('/assignment/:id.json', function(req, res) {
    var id = req.params.id;
    // var fpath = `${__dirname}/assignments/${id}.json`;
    
    // fs.exists(fpath, function(exists) {
    //     if(exists) {
    //         fs.unlink(fpath);
    //         console.log(`${fpath} deleted`);
    //         res.send("Deleted");
    //     }
    //     else {
    //         console.log(`Couldn't find file: ${fpath}`);
    //         res.send("Error");
    //     }
    // });
    
    database.delete(id, "assignments", function(err, result) {
        if (err) res.status(500);
        
        res.send("Deleted");
    });
    
});


// List
router.get('/assignments.json', function(req, res) {
    // fs.readdir(__dirname + '/assignments', function(err, files) {
    //     if (err) res.status(500);
        
    //     var fileList = files.map(fileName => fileName.replace('.json', ''));
    //     console.log(fileList);
    //     res.json(fileList);
    // });
    
    database.list("assignments", function(err, result) {
        if (err) res.status(500);
        
        if (result == null) {
            res.status(500);
            res.json(result);
        }
        else {
            var assignment = result;
            res.json(assignment);
        }
    });
    
    
    
});



module.exports = router;


//---------------------------- File Checking Functions -----------------------------------
function cpplistParse(data) {
    
    var regexErrParsing = /(?:(?!\s).)*:([0-9]+):\s+(.*)/;
    var regexRemoveFromIssues = /\[build\/header_guard\]/;
    var issueArr = [];
    var index = 0;
    var line = '';
    
    while(data[index] != '' && index < data.length) {
        
        // Remove any 'Error:' or directory strings from the messages
        line = data[index].replace(/^Error: /, '');
        line = line.replace(/\/home\/ubuntu\/workspace\/server\/uploads\//g, '');
        
        // Remove the header_guard errors from the list of issues
        if(regexRemoveFromIssues.test(line)) line = '';
        
        var match = regexErrParsing.exec(line);
        
        if(match) {
            
            issueArr.push({
                "line": match[1],
                "msg": match[2]
            });
        }

        ++index;
    }

    return {"issues":issueArr};
}

function jslistParse(data) {
    
    var regexRemoveRequire = /Undeclared 'require'/;
    var regexRemoveES6 = /Unexpected ES6 feature/;
    var issueArr = [];

    data.forEach(function(elem) {

        var msg = elem.message;

        if(regexRemoveRequire.test(msg)) msg = '';
        if(regexRemoveES6.test(msg)) msg = '';
        
        if(msg != '') {
            
            issueArr.push({
                "line": elem.line,
                "msg": elem.message
            });
        }
    });
    
    return {"issues":issueArr};
}

function checkFileForErrors(id, filename, fileExt) {
    
    var cppTypes = ['cc', 'cpp', 'cu', 'cuh', 'h'];
    var jsTypes = ['js', 'css'];
    
    if(cppTypes.indexOf(fileExt) != -1) { cppCheck(id, filename, fileExt); }
    if(jsTypes.indexOf(fileExt) != -1) { jsCheck(id, filename, fileExt); }
    else { console.log(`Cannot do error checking for files of type ${fileExt}`); }
}

function jsCheck(id, filename, fileExt) {

    fs.readFile(`${__dirname}/uploads/${id}/${filename}.${fileExt}`, 'utf8', function(err, data) {
        
        if (err) throw err;

        var options = {
            "edition": "latest",
            "length": 100
        };
        var jsLint = new LintStream(options);

        jsLint.write({file: filename, body: data});
        
        jsLint.on('data', function (chunk, encoding) {
    
            var fileWrn = jslistParse(chunk.linted.errors);
            
            storeErrorFile(id, filename, fileExt, fileWrn);
        });
    });
}

function cppCheck(id, filename, fileExt) {
    //.cc, .cpp, .cu, .cuh and .h
    
    var pyOptions = { args: ['--verbose=2', `uploads/${id}/${filename}.${fileExt}`] };

    pythonShell.run('scripts/cpplint.py', pyOptions, function (err, results) {
        
        // Not sure why this script keep erroring out but
        // what we need is stored in the err param
        var fileWrn = cpplistParse(err.stack.split('\n'));

        storeErrorFile(id, filename, fileExt, fileWrn);
    });
}

function storeErrorFile(id, filename, fileExt, data) {
    
    fs.mkdir(`${__dirname}/content/${id}/`, function () {});
    fs.writeFile(`${__dirname}/content/${id}/${filename}_${fileExt}.json`, JSON.stringify(data), 'utf8', function(err) {
        
        if (err) console.log(`Error saving the reported issues with file ${filename}`);
    });
}