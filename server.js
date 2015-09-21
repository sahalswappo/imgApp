var express = require('express');
var app = express();
var multer = require('multer');
var path = require('path');
var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'db/imagedb.db',
        autoload: true
    });
var itemPerPage = 2;

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

app.get('/gallery', function(req, res) {
    var skip = 0;
    if (req.query.page) {
        skip = req.query.page * itemPerPage;
    }
    db.find({}).skip(skip).limit(itemPerPage).exec(function(err, docs) {
        res.send(docs)
        res.end();
    });
});

app.get('/totalpage', function(req, res) {
    db.count({}, function(err, count) {
        res.send(count.toString())
    });
})

var gm = require('gm').subClass({
    imageMagick: true
});
var is = require('image-size-big-max-buffer');

app.post('/api/upload', upload, function(req, res, next) {
    if (req.files) {
        var imageUploaded = req.files.image.path;
        var imageName = req.files.image.name;
        //get image size
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
            var newSize = Math.pow(2, (i + 4));
            var thumbnailpath = 'app/upload/thumb' + newSize + "/" + imageName;
            gm(imageUploaded)
                .resize(newSize, newSize, '^')
                .write(thumbnailpath, function(err) {
                    if (err) console.log(err)
                });
        };
        //save upload image inside db
        var saveImage = {
            image: imageName,
            uploadDate: new Date()
        };
        InserData(saveImage);
        res.send(req.files);
        res.end();
    }
});

//Insert data into database
function InserData(data) {
    db.insert(data, function(err, newDoc) {});
}

app.listen(3000);