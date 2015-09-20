//chirpApp.js
var app = angular.module('imgApp', ['ngRoute']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'view/home.html',
            controller: 'UploadCtrl'
        }).
        when('/gallery', {
            templateUrl: 'view/gallery.html',
            controller: 'GalleryCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
])

.controller('UploadCtrl', function($scope, $http, Database) {
    $scope.submit = function() {
        var image = $scope.imgFile;
        var uploadUrl = '/api/upload';
        Database.uploadFileToUrl(image, uploadUrl).then(function(data) {
            if (data.data.image) {
                $scope.imgUrl = 'upload/' + data.data.image.name;
            }
        });
    }
})

.controller('GalleryCtrl', function($scope, $http, Database) {
    $scope.currentPage = 0;    
    $scope.page = function(page) {
        Database.getImageInfo(page).then(function(data) {
            $scope.galleries = data.data;
        })
        $scope.currentPage = page;
    }

    $scope.page();
    Database.TotalPage().then(function(data) {
        $scope.totalPage = Math.floor(data.data / 2);
    });
    
})

.directive("imgUp", [

    function() {
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
    }
])

.service('Database', ['$http',
    function($http) {
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
        this.getImageInfo = function(page) {
            var promise = $http.get('/gallery?page=' + page)
                .success(function(data) {});
            return promise;
        }
        this.TotalPage = function(page) {
            var promise = $http.get('/totalpage')
                .success(function(data) {});
            return promise;
        }
    }
])