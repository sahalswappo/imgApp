//chirpApp.js
var app = angular.module('imgApp', []);

app.controller('mainController', function($scope, $http, fileUpload) {
    // alert('work');
    $scope.submit = function() {
        console.log($scope.imgFile);
        var file = $scope.imgFile;
        var uploadUrl = '/api/upload';
        fileUpload.uploadFileToUrl(file, uploadUrl).then(function(data) {
            $scope.imgUrl = 'upload/' + data.data.file.name;
        });
    }
})

.directive("imgUp", [function() {
    return {
        scope: {
            imgUp: "="
        },
        link: function(scope, element, attributes) {
            element.bind("change", function(changeEvent) {
                scope.$apply(function() {
                    scope.imgUp = changeEvent.target.files[0];
                });
            });
        }
    }
}])

.service('fileUpload', ['$http', function($http) {
    this.uploadFileToUrl = function(file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);
        var promise = $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .success(function() {});
        return promise;
    }
}]);
