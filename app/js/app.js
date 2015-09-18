//chirpApp.js
var app = angular.module('imgApp', []);

app.controller('mainController', function($scope, $http, fileUpload) {
    // alert('work');
    $scope.submit = function() {
        var image = $scope.imgFile;
        var uploadUrl = '/api/upload';
        fileUpload.uploadFileToUrl(image, uploadUrl).then(function(data) {
            console.log(data.data);
            if(data.data.image) {                
               $scope.imgUrl = 'upload/' + data.data.image.name;
            }
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
    this.uploadFileToUrl = function(image, uploadUrl) {
        var fd = new FormData();
        fd.append('image', image);
        var promise = $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .success(function(data) {});
        return promise;
    }
}]);
