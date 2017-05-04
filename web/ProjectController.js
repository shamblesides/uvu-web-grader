

let app = angular.module('app', ['angularFileUpload','ui.date']);


app.controller('ctrl', function($scope, $http, FileUploader) {
    
    const API_URL = '/api/v1';
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
    $scope.fileFailedUploadMsgs = [];
    $scope.showAddModal = false;
    $scope.currentTable = 1;
    $scope.uploadHeader = "";
    $scope.idPrjUploadingFor = "";
    $scope.showTiles = true;
    $scope.projects = [];
    
    
    var uploader = $scope.uploader = new FileUploader({
        
        url: `${API_URL}/upload/0001`
        //removeAfterUpload: true
    });

    uploader.onAfterAddingFile = function(fileItem) {

        let fileArr = fileItem.file.name.split('.');
        let fileExt = fileArr[fileArr.length-1];
        let project = $scope.projects.find((prj) => prj.id == $scope.idPrjUploadingFor)

        if(!project) return;
        
        // If no file types are provided then allow all file types
        if(!project.fileTypes.length) return;
        
        if(project.fileTypes.indexOf(fileExt) == -1) {

            $scope.fileFailedUploadMsgs.push(`Cannot add ${fileItem.file.name} to the upload queue, wrong file type.`);
            fileItem.remove();
        }
    };
    
    uploader.onErrorItem = function(fileItem, response, status, headers) {

        // console.info('onErrorItem', fileItem, response, status, headers);
        // console.info(fileItem.isError);
    };
    
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        
        fileItem.remove();
    };
    
    uploader.onCompleteAll = function() {
        
        $scope.fileFailedUploadMsgs = [];
        $scope.loadTable();
    };
    
    
    $scope.uploadFiles = function(id) {
        
        let project = $scope.projects.find((prj) => prj.id == id)
        
        $scope.fileFailedUploadMsgs = [];
        
        if(!project) return;

        $scope.uploadHeader = project.name;
        $scope.idPrjUploadingFor = project.id;
        uploader.url = `${API_URL}/upload/${id}`;
    };


    $scope.updateCurrentTable = function(id) {
        
        if($scope.currentTable == id) { 

            $scope.currentTable = 0; 
            return;
        };
        
        $scope.currentTable = id;
    };
    
    
    $scope.loadPage = function(page) {
        //https://cs4690-final-project-tysonwhite.c9users.io

        $scope.projects = [];

        $http({
            method: "GET",
            url: `${API_URL}/assignments.json`
        }).then(function(res) {

            res.data.forEach(function(assnID) {

                $http({
                    method: "GET",
                    url: `${API_URL}/assignment/${assnID}.json`
                }).then(function(result) {

                    $scope.projects.push(JSON.parse(result.data));
                    
                    // Sort the list of projects by project name
                    $scope.projects.sort((a,b) => {

                        if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                        if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                        return 0;
                    });
                }, function() {

                    console.log(`Failed to get the assignment with ID: ${assnID}`);
                });
            });
            
        }, function errFunc() {

            console.log('Failed to get list of assignments from the server');
        });
    };
    
    
    $scope.tableOnClickHandler = function() {
        
        $scope.loadTable();
        $scope.showTiles = false;
    };
    
    
    $scope.loadTable = function() {

        $scope.projects.forEach(function(assn) {

            $http({
                method: "GET",
                url: `${API_URL}/files/${assn.id}`
            }).then(function(result) {

                assn.files = result.data;
            }, function() {

                console.log(`Failed to get the list of files for the assignment with ID: ${assn.id}`);
            });
        });
    };
    
    $scope.formateDate = function(date) {
        
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
        $scope.addProjectForm.fileTypes = $scope.addProjectForm.fileTypes.map((str) => str.replace(/\s+/g, ''));
        if($scope.addProjectForm.fileTypes[0] == "") $scope.addProjectForm.fileTypes = [];
        
        $http({
            method: "POST",
            url: `${API_URL}/assignment`,
            data: JSON.stringify($scope.addProjectForm),
            contentType: 'application/json'
        }).then(function(res) {
    
            $scope.loadPage();
        }, function errFunc() {

            console.log('Failed to create a new assignment');
        });

        $scope.showAddModal = false;  
    };
    
    $scope.loadPage();
});

