

let app = angular.module('app', ['angularFileUpload','ui.date']);


app.controller('ctrl', function($scope, $http, FileUploader) {
    
    const API_URL = '/api/v2';
    const PRJ_TEMPLATE = { 
        "id": "",
        "name": "",
        "description": "",
        "dueDate": "",
        "fileTypes": []
    };
    const PRJ_ERR_TEMPLATE = {
        "id": false,
        "name": false,
        "description": false,
        "dueDate": false,
        "fileTypes": false
    };

    $scope.showAddModal = false;
    $scope.currentTable = 1;
    $scope.uploadHeader = "";
    $scope.idPrjUploadingFor = "";
    $scope.showTiles = true;
    $scope.projects = [];
    
    var uploader = $scope.uploader = new FileUploader();

    // uploader.onAfterAddingFile = function(fileItem) {
    //     let fileArr = fileItem.file.name.split('.');
    //     let fileExt = fileArr[fileArr.length-1];
    //     let project = $scope.projects.find(function(prj) { return prj.id == $scope.idPrjUploadingFor })

    //     if(!project) return;
        
    //     // If no file types are provided then allow all file types
    //     if(!project.fileTypes.length) return;
        
    //     if(project.fileTypes.indexOf(fileExt) == -1) {
    //         $scope.fileFailedUploadMsgs.push(`Cannot add ${fileItem.file.name} to the upload queue, wrong file type.`);
    //         fileItem.remove();
    //     }
    // };
    
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        // console.info('onErrorItem', fileItem, response, status, headers);
        // console.info(fileItem.isError);
    };
    
    uploader.onSuccessItem = function(fileItem, res, status, headers) {
        fileItem.remove();
        console.log(res);
    };
    
    uploader.onCompleteAll = function() {
        $scope.loadTable();
    }
    
    $scope.uploadFiles = function(id) {
        let project = $scope.projects.find(function(prj) { return prj.id == id })
        if(!project) return;

        $scope.uploadHeader = project.name;
        $scope.idPrjUploadingFor = project.id;
        let user = 'Nigel';
        uploader.url = `${API_URL}/submissions/${id}/${user}`;
    };

    $scope.updateCurrentTable = function(id) {
        if ($scope.currentTable === id) $scope.currentTable = 0;
        else $scope.currentTable = id;
    };
    
    $scope.loadPage = function(page) {
        $scope.projects = [];
        $http.get(`${API_URL}/assignments.json`).then(function(res) {
            $scope.projects = res.data;
        }, function() {
            alert('Failed to get list of assignments from the server');
        });
    };
    
    
    $scope.tableOnClickHandler = function() {
        $scope.loadTable();
        $scope.showTiles = false;
    };
    
    
    $scope.loadTable = function() {
        $scope.projects.forEach(function(assn) {
            $http.get(`${API_URL}/files/${assn.id}`).then(function(result) {
                assn.files = result.data;
            }, function() {
                console.log(`Failed to get the list of files for the assignment with ID: ${assn.id}`);
            });
        });
    };
    
    $scope.formatDate = function(date) {
        date = new Date(date);
        let monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        
        let day = date.getDate();
        let monthIndex = date.getMonth();
        let hours = date.getHours();
        let min = date.getMinutes();
        
        return monthNames[monthIndex] + ' ' 
        + day + ' at ' 
        + ((hours > 12) ? hours - 12 : hours) + ':' 
        + min
        + ((hours > 12) ? 'pm' : 'am');
    }
    
    $scope.addProject = function() {
        $scope.addProjectForm = JSON.parse(JSON.stringify(PRJ_TEMPLATE));
        $scope.addProjectErrs = JSON.parse(JSON.stringify(PRJ_ERR_TEMPLATE));
        $scope.fileTypesAsString = "";
        $scope.date = new Date();
        $scope.date.setHours(23);
        $scope.date.setMinutes(59);
    
        $scope.showAddModal = true;
    }
    
    $scope.confirmProject = function() {
        $scope.addProjectErrs = JSON.parse(JSON.stringify(PRJ_ERR_TEMPLATE));
        
        if($scope.addProjectForm.name == "") {
            $scope.addProjectErrs.name = true;
            return;
        }
        else if($scope.addProjectForm.description == "") {
            $scope.addProjectErrs.description = true;
            return;
        }
        
        $scope.addProjectForm.id = $scope.addProjectForm.name;
        $scope.addProjectForm.dueDate = $scope.date.toISOString();
        $scope.addProjectForm.fileTypes = $scope.fileTypesAsString.split(',');
        
        // Remove spaces from file types
        $scope.addProjectForm.fileTypes = $scope.addProjectForm.fileTypes.map(function(str) { return str.replace(/\s+/g, '') });
        if($scope.addProjectForm.fileTypes[0] == "") $scope.addProjectForm.fileTypes = [];
        
        $http.post(`${API_URL}/assignments.json`, $scope.addProjectForm).then(function(res) {
            $scope.loadPage();
        }, function errFunc() {
            alert('Failed to create a new assignment');
        });

        $scope.showAddModal = false;  
    };
    
    $scope.loadPage();
});

