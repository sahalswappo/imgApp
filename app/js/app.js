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
                    if (data.image) {
                        $scope.success = true;
                        $scope.files = null;
                        $scope.imgUrl = data.image;
                        $timeout(function() {
                            $scope.thumbnail = new Array(data.thumbnail);
                        },200);
                    } else {
                        $scope.success = false;
                        $scope.failedUpload = true;
                        $timeout(function() {
                            $scope.failedUpload = false;
                        }, 3000);
                    }
                });
            }
        }
    };
})

.controller('GalleryCtrl', function($scope, $http, Database) {
    $scope.currentPage = 0;
    $scope.page = function(page) {
        Database.GetFunction('/gallery?page=' + page).then(function(data) {
            $scope.galleries = data;
        })
        $scope.currentPage = page;
    }
    $scope.page();
    Database.GetFunction('/totalpage').then(function(data) {
        var pagecount = 0;
        if (data > 2) {
            $scope.nextButton = true;
            if ((data / 2) % 1 == 0)
                pagecount = (data / 2) - 1;
            else
                pagecount = Math.floor(data / 2)
        }
        $scope.totalPage = pagecount;
    });
})

.service('Database', ['$http', '$q',
    function($http, $q) {
        this.GetFunction = function(url) {
            var defer = $q.defer();
            $http.get(url)
                .success(function(data) {
                    defer.resolve(data);
                });
            return defer.promise;
        }
    }
])

.filter('mathPow', function() {
    return function(exponent) {
        return Math.pow(2, exponent);
    }
});
