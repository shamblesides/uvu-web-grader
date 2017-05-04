//CRUDL for tasks stored on MongoDB

var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const URL = `mongodb://localhost:27017/master`;


// Create Method
// Parameters: 
// -collec: string name of collection to be inserted into
// -data: json object to be placed in database
// -callbackFunc: function to handle the success/failure of this
// Returns: callback function with error and result json object 
exports.create = function(collec, data, callbackFunc) {
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err, null);
        
        var col = db.collection(collec);
        col.insertOne(data, function(err, result) {
            if (err) return callbackFunc(err, result);
            
            db.close();
            return callbackFunc(err, result.ops[0]);
        });
    });
};

// Read Method
// Parameters:
// -id: id of the document to be retrived
// -collec: string name of the collection to be searched
// -callbackFunc: function to handle the success/failure of this
// Returns: callback function with error and result json object
exports.read = function(id, collec, callbackFunc) {
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err, null);
        
        db.collection(collec).findOne({"id": id}, function(err, result) {
            if (err) return callbackFunc(err, null);                           
            
            db.close();
            return callbackFunc(err, result);
        });
    });      
};

// Update Method
// Parameters:
// -collec: string name of collection to be inserted into
// -data: json object to be placed in database
// -callbackFunc: function to handle the success/failure of this
// Returns: callback function with error and result json object
exports.update = function(collec, data, callbackFunc) {
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err);
        var id = data.id;
        
        db.collection(collec).updateOne({"id": id}, data, function(err, result) {
            if (err) return callbackFunc(err, null);
            
            db.close();
            return callbackFunc(err, result.result);
        });
    });
};


// Delete Method
// Parameters:
// -id: id of the document to be retrieved
// -collec: string name of the collection to be deleted from
// -callbackFunc: function to handle the success/failure of this
// Returns: callback function with error and result json object
exports.delete = function(id, collec, callbackFunc) {
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err);
    
        db.collection(collec).remove({"id": id}, function(err, result) {
            if (err) return callbackFunc(err, null);
            db.close();
            return callbackFunc(err, result.result);
        });
    }); 
};


// List Method
// Parameters:
// -collec: string name of the collection to be deleted from
// -callbackFunc: function to handle the success/failure of this
// Returns: callback function with error and result json object
exports.list = function(collec, callbackFunc) {
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err, null);
        
        db.collection(collec).find().toArray().then(function(data) {
            db.close();
            data = data.map((assignment) => assignment = assignment.id);
            return callbackFunc(err, data);
        });
    });
};
