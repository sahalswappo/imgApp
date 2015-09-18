var express = require('express');
var app = express();
var multer = require('multer');
var path = require('path');


var upload = multer({
    dest: 'app/upload/',
    onFileUploadStart: function(file, req, res) {
        return ((/(gif|jpg|jpeg|tiff|png)$/i).test(file.extension.toLowerCase()))
    }
});

app.use(express.static(__dirname + '/app'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));

});

var gm = require('gm').subClass({
    imageMagick: true
});

app.post('/api/upload', upload, function(req, res, next) {
    if (req.files) {
        var imageUploaded = req.files.image.path;
        //get image size
        var is = require('image-size');
        var size = is(imageUploaded);
        var needResize = 0;
        //get how many thumbnail needed
        if (size.height > 128 && size.width > 128)
            needResize = 3;
        else if (size.height > 64 && size.width > 64)
            needResize = 2;
        else if (size.height > 32 && size.width > 32)
            needResize = 1;
        //create the thumbnail
        for (var i = 1; i <= needResize; i++) {
            var newSize = Math.pow(2, (i+4));
            var thumbnailpath = 'app/upload/thumb' + newSize + "/" + req.files.image.name;
            gm(imageUploaded)
                .resize(newSize, newSize, '^')
                .write(thumbnailpath, function(err) {
                    if (!err) {
                        console.log(' hooray! ');
                    } 
                });
        };
        res.send(req.files);
    }
});


app.listen(3000);