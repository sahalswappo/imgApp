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
var im = require('imagemagick');
app.post('/api/upload', upload, function(req, res, next) {
    if (req.files) {
        //get image size
        im.identify(req.files.image.path, function(err, size) {
            if (err) throw err;
            console.log(size.height);
        });
        // console.log(imgSize)
        res.send(req.files);
    }
});


app.listen(3000);