
const students = require('./Data/students.json');
let mongo = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

const URL = `mongodb://localhost:27017/students`;

mongo.connect(URL, function(err, db) {

    if (err) console.log(err);

    console.log("Connected to the MongoDB server");

    if (db.collection('students').drop()) { console.log("Successfully dropped the collection"); }
    else { console.log("Unable to drop the collection"); }

    db.collection('students').insertMany(students, function(err, result) {

        if (err) throw err;

        console.log(result);
        db.close();
    });

    // db.collection('students').findOne({ _id: new ObjectID('58f841672bcd1711247c502a')}, {}, function(err, result) {
    //
    //     if (err) throw err;
    //
    //     console.log('in read()')
    //     console.log(result);
    //     db.close();
    // });
});