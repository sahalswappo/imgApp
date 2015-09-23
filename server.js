var express = require('express');
var app = express();
var multer = require('multer');
var path = require('path');

var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'db/imagedb.db',
        autoload: true
    });
//item per page    
var itemPerPage = 2;

var upload = multer({
    dest: 'app/upload/',
    onFileUploadStart: function(file, req, res) {
        return ((/(gif|jpg|jpeg|tiff|png|svg)/i).test(file.extension.toLowerCase())) // check extension
    }
});

app.use(express.static(__dirname + '/app'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/gallery', function(req, res) {
    var skip = 0;
    if (req.query.page) {
        skip = req.query.page * itemPerPage;
    }
    //pagination retrive image sort by upload date desc to get latest
    db.find({}).sort({
        uploadDate: -1
    }).skip(skip).limit(itemPerPage).exec(function(err, docs) {
        res.send(docs)
        res.end();
    });
});

app.get('/totalpage', function(req, res) { //get total page
    db.count({}, function(err, count) {
        res.send(count.toString())
    });
})

var gm = require('gm').subClass({
    imageMagick: true
});

app.post('/api/upload', upload, function(req, res, next) { //handle upload
    if (req.files.file) {
        var imageUploaded = req.files.file.path;
        var imageName = req.files.file.name;
        processImage(imageUploaded, imageName, function(err, resize) {
            //save image
            var saveImage = {
                image: imageName,
                thumbnail: resize,
                uploadDate: new Date()
            };
            InserData(saveImage);
            res.send(saveImage);
            res.end();
        });
    } else {
        res.end('failed');
    }
});

//Insert data into database
function InserData(data) {
    db.insert(data, function(err, newDoc) {});
}

//process image
function processImage(path, name, callback) {
    var img = gm(path);
    var resize = 0;
    img.size(function(err, val) {
        //get how many thumbnail needed
        if (val.height > 128 && val.width > 128)
            resize = 3;
        else if (val.height > 64 && val.width > 64)
            resize = 2;
        else if (val.height > 32 && val.width > 32)
            resize = 1;
        //create the thumbnail
        for (var i = 1; i <= resize; i++) {
            var newSize = Math.pow(2, (i + 4));
            var thumbnailpath = 'app/upload/thumb' + newSize + "/" + name;
            gm(path)
                .resize(newSize, newSize, '^')
                .write(thumbnailpath, function(err) {
                    if (err) console.log(err)
                });
        };
        callback(err, resize);
    });
};

app.listen(3000);
