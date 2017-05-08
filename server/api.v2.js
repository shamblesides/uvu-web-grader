const express = require('express');
const fs = require('fs');
const matcher = require('matcher');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const linter = require('./linter');

const DATA_DIR = __dirname.replace('server', 'data');
const UPLOAD_DIR = DATA_DIR + '/submissions';
const ASSIGNMENTS_DOC_PATH = DATA_DIR + '/assignments.json';
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(ASSIGNMENTS_DOC_PATH)) fs.writeFileSync(ASSIGNMENTS_DOC_PATH, '[]');

let router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
module.exports = router;

// GET "/api/v2/assignments.json"
//     - Return all assignments
router.get('/assignments.json', (req, res, next) => {
    fs.readFile(ASSIGNMENTS_DOC_PATH, (err, data) => {
        if (err) return next(err);
        res.status(200).send(data);
    });
});
    
// POST "/api/v2/assignments.json"
//     - Input body: assignment JSON
//     - Returns 201 (Created) or 204 (No content)
router.post('/assignments.json', (req, res, next) => {
    let assignment = req.body;
    fs.readFile(ASSIGNMENTS_DOC_PATH, (err, data) => {
        if (err) return next(err);

        let assignments = JSON.parse(data);
        assignments.push(assignment);
        fs.mkdir(UPLOAD_DIR+'/'+assignment.id, (err) => {
            if (err) return next(err);
            fs.writeFile(ASSIGNMENTS_DOC_PATH, JSON.stringify(assignments,null,2), (err)=> {
                if (err) return next(err);
                res.sendStatus(201);
            });
        });
    });
});

// Helper function to get JSON details on an assignment
function getAssignment(name, cb) {
    fs.readFile(ASSIGNMENTS_DOC_PATH, (err, data) => {
        if (err) return cb(err);

        let assignment = JSON.parse(data).find(a=>a.name === name);
        if (!assignment) return cb('No assignment found with that name.');
        cb(null, assignment)
    });
}

// POST "/api/v2/submissions/<assignment-name>/<uvid>"
//     - Input body: some files
//     - Success: returns success HTTP code
//     - Failure: linter issues
router.post('/submissions/:asmtname/:uvid', upload.any(), (req, res, next) => {
    let assignmentName = req.params.asmtname;
    let uvid = req.params.uvid;
    getAssignment(assignmentName, (err, assignment) => {
        if (err) return next(err);

        fs.mkdir(`${UPLOAD_DIR}/${assignmentName}/${uvid}/`, err=>{});

        let files = req.files.map(data=>({name:data.originalname,body:data.buffer.toString()}));

        // first check if all filenames are correct
        if (!files.every(file=>
            assignment.fileTypes.some(glob=>
                matcher.isMatch(file.name, glob)
            )
        )) {
            return next({
                uploaded: false,
                id: file.name,
                msg: "Incorrect File Type"
            });
        }
        
        // then lint all files
        let advisory = [];
        let filesLeft = files.length;

        for (let file of files) {
            linter(file, (err, feedback) => {
                if (err) return next(err);

                advisory.push({
                    name: file.name,
                    content: feedback,
                    hasIssues: feedback.length > 0
                })

                --filesLeft;
                if (filesLeft === 0) res.status(200).json(advisory);
            });
        }
    })
});
