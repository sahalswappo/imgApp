//chirpApp.js
var app = angular.module('imgApp', ['ngRoute', 'ngFileUpload']);

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

.controller('UploadCtrl', function($scope, $http, Database, Upload, $timeout) {
    $scope.submit = function() {
        $scope.upload($scope.files);
    }

    $scope.upload = function(files) {
        if (files) {
            var file = files;
            if (!file.$error) {
                Upload.upload({
                    url: '/api/upload',
                    file: file
                }).success(function(data, status, headers, config) {
                    $timeout(function() {
                        $scope.imgUrl = 'upload/' + data.file.name;
                    });
                });
            }
        }
    };
})

.controller('GalleryCtrl', function($scope, $http, Database) {
    $scope.currentPage = 0;
    $scope.page = function(page) {
        Database.GetFunction('/gallery?page=' + page).then(function(data) {
            $scope.galleries = data.data;
        })
        $scope.currentPage = page;
    }
    $scope.page();
    Database.GetFunction('/totalpage').then(function(data) {
        $scope.totalPage = Math.floor(data.data / 2);
    });
})

.service('Database', ['$http',
    function($http) {
        this.GetFunction = function(url) {
            var promise = $http.get(url)
                .success(function(data) {});
            return promise;
        }
    }
])
